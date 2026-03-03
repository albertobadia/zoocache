use crate::InvalidTag;
use crate::utils;
use pyo3::prelude::*;
use xxhash_rust::xxh3::xxh3_64;

pub(crate) fn validate_tag(tag: &str) -> PyResult<()> {
    let len = tag.len();
    if len == 0 {
        return Err(InvalidTag::new_err("Tag cannot be empty"));
    }
    if len > 256 {
        return Err(InvalidTag::new_err(format!(
            "Tag length exceeded: {}. Max allowed is 256 characters.",
            len
        )));
    }

    let bytes = tag.as_bytes();
    if bytes[0] == b':' || bytes[len - 1] == b':' || bytes[0] == b'.' || bytes[len - 1] == b'.' {
        return Err(InvalidTag::new_err(
            "Tag cannot start or end with ':' or '.'",
        ));
    }

    let mut depth = 0;
    let mut last_was_sep = false;
    for &b in bytes {
        let is_sep = b == b':' || b == b'.';
        if is_sep {
            if last_was_sep {
                return Err(InvalidTag::new_err(
                    "Tag cannot contain consecutive separators (':' or '.')",
                ));
            }
            if b == b':' {
                depth += 1;
            }
        } else if !b.is_ascii_alphanumeric() && b != b'_' {
            return Err(InvalidTag::new_err(format!(
                "Invalid character '{}' in tag '{}'. Only alphanumeric, '_', ':' and '.' are allowed.",
                b as char, tag
            )));
        }
        last_was_sep = is_sep;
    }

    if depth > 16 {
        return Err(InvalidTag::new_err(format!(
            "Tag depth exceeded: {}. Max allowed depth is 16.",
            depth
        )));
    }
    Ok(())
}

#[pyfunction]
#[pyo3(signature = (obj, prefix=None))]
pub(crate) fn hash_key(
    _py: Python<'_>,
    obj: Bound<'_, PyAny>,
    prefix: Option<&str>,
) -> PyResult<String> {
    let mut data = Vec::new();
    let mut serializer = rmp_serde::Serializer::new(&mut data);
    let mut depythonizer = pythonize::Depythonizer::from_object(&obj);

    serde_transcode::transcode(&mut depythonizer, &mut serializer).map_err(|e| {
        PyErr::new::<pyo3::exceptions::PyTypeError, _>(utils::to_runtime_err(e).to_string())
    })?;

    let hash_value = xxh3_64(&data);
    let hex = format!("{:016x}", hash_value);
    let result = match prefix {
        Some(p) => format!("{}:{}", p, hex),
        None => hex,
    };
    Ok(result)
}
