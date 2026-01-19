use dashmap::DashMap;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

#[derive(Default)]
pub(crate) struct TrieNode {
    version: AtomicU64,
    children: DashMap<String, Arc<TrieNode>>,
}

pub(crate) struct PrefixTrie {
    root: Arc<TrieNode>,
}

impl PrefixTrie {
    pub fn new() -> Self {
        Self {
            root: Arc::new(TrieNode::default()),
        }
    }

    #[inline]
    pub fn invalidate(&self, tag: &str) {
        let mut current = Arc::clone(&self.root);
        for part in tag.split(':') {
            let next = {
                let entry = current
                    .children
                    .entry(part.to_string())
                    .or_insert_with(|| Arc::new(TrieNode::default()));
                Arc::clone(entry.value())
            };
            current = next;
        }
        current.version.fetch_add(1, Ordering::SeqCst);
    }

    #[inline]
    pub fn get_path_versions(&self, parts: &[String]) -> Vec<u64> {
        let mut versions = Vec::with_capacity(parts.len() + 1);
        let mut current = Arc::clone(&self.root);
        versions.push(current.version.load(Ordering::SeqCst));

        for part in parts {
            let next = match current.children.get(part) {
                Some(n) => Arc::clone(n.value()),
                None => break,
            };
            current = next;
            versions.push(current.version.load(Ordering::SeqCst));
        }

        while versions.len() <= parts.len() {
            versions.push(0);
        }
        versions
    }

    #[inline]
    pub fn is_valid_path(&self, parts: &[String], snapshot_versions: &[u64]) -> bool {
        let mut current = Arc::clone(&self.root);

        if current.version.load(Ordering::SeqCst) > snapshot_versions[0] {
            return false;
        }

        for (i, part) in parts.iter().enumerate() {
            let next = match current.children.get(part) {
                Some(n) => Arc::clone(n.value()),
                None => return true,
            };
            current = next;
            if current.version.load(Ordering::SeqCst) > snapshot_versions[i + 1] {
                return false;
            }
        }
        true
    }

    pub fn clear(&self) {
        self.root.children.clear();
        self.root.version.store(0, Ordering::SeqCst);
    }
}

pub(crate) struct DepSnapshot {
    pub parts: Vec<String>,
    pub path_versions: Vec<u64>,
}

#[inline]
pub(crate) fn validate_dependencies(trie: &PrefixTrie, deps: &HashMap<String, DepSnapshot>) -> bool {
    for snapshot in deps.values() {
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
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 1]);

        trie.invalidate("user:1");
        assert_eq!(trie.get_path_versions(&parts), vec![0, 0, 2]);
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
        assert_eq!(v1[2], 1);

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
        assert_eq!(snapshots["user:1"].path_versions, vec![0, 0, 1]);
        assert_eq!(snapshots["user:2"].path_versions, vec![0, 0, 0]);
    }
}
