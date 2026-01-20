use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Default)]
pub(crate) struct TrieNode {
    version: AtomicU64,
    last_accessed: AtomicU64,
    children: DashMap<String, Arc<TrieNode>>,
}

impl TrieNode {
    fn touch(&self) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        self.last_accessed.store(now, Ordering::Relaxed);
    }
}

#[derive(Clone)]
pub(crate) struct PrefixTrie {
    root: Arc<TrieNode>,
    global_version: Arc<AtomicU64>,
}

impl PrefixTrie {
    pub fn new() -> Self {
        Self {
            root: Arc::new(TrieNode::default()),
            global_version: Arc::new(AtomicU64::new(0)),
        }
    }

    #[inline]
    pub fn invalidate(&self, tag: &str) -> u64 {
        self.global_version.fetch_add(1, Ordering::SeqCst);
        let mut current = Arc::clone(&self.root);
        current.touch();
        for part in tag.split(':') {
            let next = if let Some(n) = current.children.get(part) {
                Arc::clone(n.value())
            } else {
                let entry = current
                    .children
                    .entry(part.to_string())
                    .or_insert_with(|| Arc::new(TrieNode::default()));
                Arc::clone(entry.value())
            };
            current = next;
            current.touch();
        }
        
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos() as u64;

        let prev = current.version.fetch_update(Ordering::SeqCst, Ordering::SeqCst, |v| {
            Some(v.max(now).max(v + 1))
        }).unwrap();
        
        prev.max(now).max(prev + 1)
    }

    #[inline]
    pub fn set_min_version(&self, tag: &str, version: u64) {
        self.global_version.fetch_add(1, Ordering::SeqCst);
        let mut current = Arc::clone(&self.root);
        current.touch();
        for part in tag.split(':') {
            let next = if let Some(n) = current.children.get(part) {
                Arc::clone(n.value())
            } else {
                let entry = current
                    .children
                    .entry(part.to_string())
                    .or_insert_with(|| Arc::new(TrieNode::default()));
                Arc::clone(entry.value())
            };
            current = next;
            current.touch();
        }
        current.version.fetch_max(version, Ordering::SeqCst);
    }


    pub fn get_path_versions<S: AsRef<str>>(&self, parts: &[S]) -> Vec<u64> {
        let mut versions = Vec::with_capacity(parts.len() + 1);
        let mut current = Arc::clone(&self.root);
        current.touch();
        versions.push(current.version.load(Ordering::SeqCst));

        for part in parts {
            let next = match current.children.get(part.as_ref()) {
                Some(n) => Arc::clone(n.value()),
                None => break,
            };
            current = next;
            current.touch();
            versions.push(current.version.load(Ordering::SeqCst));
        }

        while versions.len() <= parts.len() {
            versions.push(0);
        }
        versions
    }

    #[inline]
    pub fn is_valid_path<S: AsRef<str>>(&self, parts: &[S], snapshot_versions: &[u64]) -> bool {
        let mut current = Arc::clone(&self.root);
        current.touch();

        if current.version.load(Ordering::SeqCst) > snapshot_versions[0] {
            return false;
        }

        for (i, part) in parts.iter().enumerate() {
            let next = match current.children.get(part.as_ref()) {
                Some(n) => Arc::clone(n.value()),
                None => return true,
            };
            current = next;
            current.touch();
            if current.version.load(Ordering::SeqCst) > snapshot_versions[i + 1] {
                return false;
            }
        }
        true
    }

    pub fn catch_up<S: AsRef<str>>(&self, parts: &[S], snapshot_versions: &[u64]) {
        let mut current = Arc::clone(&self.root);
        current.touch();
        
        // Root version sync
        current.version.fetch_max(snapshot_versions[0], Ordering::SeqCst);

        for (i, part) in parts.iter().enumerate() {
            let next = if let Some(n) = current.children.get(part.as_ref()) {
                Arc::clone(n.value())
            } else {
                let entry = current
                    .children
                    .entry(part.as_ref().to_string())
                    .or_insert_with(|| Arc::new(TrieNode::default()));
                Arc::clone(entry.value())
            };
            current = next;
            current.touch();
            current.version.fetch_max(snapshot_versions[i + 1], Ordering::SeqCst);
        }
    }

    pub fn get_tag_version(&self, tag: &str) -> u64 {
        let parts: Vec<&str> = tag.split(':').collect();
        let versions = self.get_path_versions(&parts);
        *versions.last().unwrap_or(&0)
    }

    #[inline]
    pub fn get_global_version(&self) -> u64 {
        self.global_version.load(Ordering::SeqCst)
    }

    pub fn clear(&self) {
        self.root.children.clear();
        self.root.version.store(0, Ordering::SeqCst);
        self.global_version.fetch_add(1, Ordering::SeqCst);
        self.root.touch();
    }

    pub fn prune(&self, max_age_secs: u64) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        
        self.root.children.retain(|_, child| {
            !Self::prune_recursive(child, now, max_age_secs)
        });
    }

    fn prune_recursive(node: &Arc<TrieNode>, now: u64, max_age_secs: u64) -> bool {
        // Prune children first
        node.children.retain(|_, child| {
            !Self::prune_recursive(child, now, max_age_secs)
        });

        // Current node is prunable if it's a leaf and it's old
        let last = node.last_accessed.load(Ordering::Relaxed);
        let age = now.saturating_sub(last);
        
        node.children.is_empty() && age > max_age_secs
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub(crate) struct DepSnapshot {
    pub parts: Vec<String>,
    pub path_versions: Vec<u64>,
}

#[inline]
pub(crate) fn validate_dependencies(trie: &PrefixTrie, deps: &HashMap<String, DepSnapshot>) -> bool {
    for snapshot in deps.values() {
        // Passive sync: if we see a newer version in the snapshot, our local trie should catch up.
        // This makes the system self-healing if a pub/sub message was lost.
        trie.catch_up(&snapshot.parts, &snapshot.path_versions);

        if !trie.is_valid_path(&snapshot.parts, &snapshot.path_versions) {
            return false;
        }
    }
    true
}

#[inline]
pub(crate) fn build_dependency_snapshots(
    trie: &PrefixTrie,
    dependencies: Vec<String>,
) -> HashMap<String, DepSnapshot> {
    let mut snapshots = HashMap::with_capacity(dependencies.len());
    for tag in dependencies {
        let parts: Vec<String> = tag.split(':').map(|s| s.to_string()).collect();
        let path_versions = trie.get_path_versions(&parts);
        snapshots.insert(tag, DepSnapshot { parts, path_versions });
    }
    snapshots
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trie_basic() {
        let trie = PrefixTrie::new();
        let parts = vec!["user".to_string(), "1".to_string()];
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 0]);

        trie.invalidate("user:1");
        let v1 = trie.get_path_versions(&parts);
        assert!(v1[2] > 0);

        trie.invalidate("user:1");
        let v2 = trie.get_path_versions(&parts);
        assert!(v2[2] > v1[2]);
    }

    #[test]
    fn test_trie_prefix_invalidation() {
        let trie = PrefixTrie::new();
        let tag_parts = vec![
            "org".to_string(),
            "1".to_string(),
            "user".to_string(),
            "1".to_string(),
        ];

        let v0 = trie.get_path_versions(&tag_parts);
        assert!(trie.is_valid_path(&tag_parts, &v0));

        trie.invalidate("org:1:user:1");
        let v1 = trie.get_path_versions(&tag_parts);
        assert!(!trie.is_valid_path(&tag_parts, &v0));
        assert!(trie.is_valid_path(&tag_parts, &v1));

        trie.invalidate("org:1");
        assert!(!trie.is_valid_path(&tag_parts, &v1));
    }

    #[test]
    fn test_trie_deep_hierarchy() {
        let trie = PrefixTrie::new();
        let deep_tag = "a:b:c:d:e:f:g:h:i:j";
        let parts: Vec<String> = deep_tag.split(':').map(|s| s.to_string()).collect();

        let path_v0 = trie.get_path_versions(&parts);
        trie.invalidate(deep_tag);
        let path_v1 = trie.get_path_versions(&parts);

        assert!(!trie.is_valid_path(&parts, &path_v0));
        assert!(trie.is_valid_path(&parts, &path_v1));

        trie.invalidate("a:b:c");
        assert!(!trie.is_valid_path(&parts, &path_v1));
    }

    #[test]
    fn test_trie_clear() {
        let trie = PrefixTrie::new();
        trie.invalidate("user:1");
        trie.invalidate("user:2");

        let parts = vec!["user".to_string(), "1".to_string()];
        let v1 = trie.get_path_versions(&parts);
        assert!(v1[2] > 0);

        trie.clear();
        let v2 = trie.get_path_versions(&parts);
        assert_eq!(v2, vec![0, 0, 0]);
    }

    #[test]
    fn test_validate_dependencies_empty() {
        let trie = PrefixTrie::new();
        let deps = HashMap::new();
        assert!(validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_valid() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["user:1".to_string()]);
        assert!(validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_invalidated() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["user:1".to_string()]);
        trie.invalidate("user:1");
        assert!(!validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_validate_dependencies_parent_invalidated() {
        let trie = PrefixTrie::new();
        let deps = build_dependency_snapshots(&trie, vec!["org:1:user:5".to_string()]);
        trie.invalidate("org:1");
        assert!(!validate_dependencies(&trie, &deps));
    }

    #[test]
    fn test_build_dependency_snapshots() {
        let trie = PrefixTrie::new();
        trie.invalidate("user:1");

        let snapshots = build_dependency_snapshots(&trie, vec!["user:1".to_string(), "user:2".to_string()]);

        assert_eq!(snapshots.len(), 2);
        assert_eq!(snapshots["user:1"].parts, vec!["user", "1"]);
        assert!(snapshots["user:1"].path_versions[2] > 0);
        assert_eq!(snapshots["user:2"].path_versions, vec![0, 0, 0]);
    }

    #[test]
    fn test_cold_start_simulation() {
        let trie_old = PrefixTrie::new();
        trie_old.invalidate("user:1");
        let v_old = trie_old.get_path_versions(&["user", "1"])[2];

        // Process restarts, new trie starts at 0 or current time
        let trie_new = PrefixTrie::new(); 
        
        // Snapshot from old process
        let snapshot_v = vec![0, 0, v_old];
        
        // In the new trie, user:1 is 0. 
        // 0 <= v_old (which is a high timestamp).
        // This means the cache entry is considered VALID even if it was from a previous process.
        // This is exactly what we wanted: persistence compatibility.
        assert!(trie_new.is_valid_path(&["user", "1"], &snapshot_v));

        // Now if we invalidate in the new process
        trie_new.invalidate("user:1");
        let v_new = trie_new.get_path_versions(&["user", "1"])[2];
        
        assert!(v_new >= v_old); // Should be same or greater depending on clock
        assert!(!trie_new.is_valid_path(&["user", "1"], &snapshot_v));
    }

    #[test]
    fn test_catch_up() {
        let trie = PrefixTrie::new();
        let parts = vec!["org", "acme", "user", "42"];
        let snapshot_versions = vec![0, 0, 100, 0, 500]; // Root=0, org=0, acme=100, user=0, 42=500

        trie.catch_up(&parts, &snapshot_versions);

        let current_versions = trie.get_path_versions(&parts);
        assert_eq!(current_versions[2], 100); // acme caught up
        assert_eq!(current_versions[4], 500); // 42 caught up
        assert_eq!(current_versions[0], 0);   // root stayed 0
    }

    #[test]
    fn test_pruning() {
        let trie = PrefixTrie::new();
        
        // Use user:1
        trie.invalidate("user:1");
        
        // Advance "time" by using a tiny max_age and sleeping or just checking age 0
        // But since we can't easily mock SystemTime in std, let's just verify structure
        assert_eq!(trie.root.children.len(), 1);

        // Prune with age 0 (should prune everything that wasn't JUST touched)
        // Wait, current node is touched in invalidate.
        // Let's use a long sleep if needed, or just verify it doesn't prune what's new
        trie.prune(100); 
        assert_eq!(trie.root.children.len(), 1);

        std::thread::sleep(std::time::Duration::from_secs(2)); // Increased from 100ms to 2s for u64 seconds resolution
        trie.prune(0);
        assert_eq!(trie.root.children.len(), 0);
    }

    #[test]
    fn test_hlc_ratchet() {
        let trie = PrefixTrie::new();
        let tag = "test:hlc";
        
        let v1 = trie.invalidate(tag);
        assert!(v1 > 0);
        
        // Force a future version artificially
        let future_ver = v1 + 1_000_000_000; // +1 second roughly in nanos
        trie.set_min_version(tag, future_ver);
        
        let current_ver = trie.get_tag_version(tag);
        assert!(current_ver >= future_ver);
        
        // Now invalidate again. It should be > future_ver + 1 (Ratchet effect)
        let v2 = trie.invalidate(tag);
        assert!(v2 > future_ver);
        
        // Even if our local wall clock is behind future_ver, v2 must be ahead.
        // (This guarantees causal consistency)
    }

    #[test]
    fn test_hlc_fast_forward() {
        let trie = PrefixTrie::new();
        let tag = "test:fast_forward";
        
        // Initial state
        let _v1 = trie.invalidate(tag);
        
        // Simulate receiving a message from a node far in the future
        let far_future = u64::MAX - 1000;
        trie.set_min_version(tag, far_future);
        
        assert_eq!(trie.get_tag_version(tag), far_future);
        
        // Invalidate locally
        let v_new = trie.invalidate(tag);
        
        // MUST increment strictly from the highest seen version
        assert!(v_new > far_future);
    }
}
