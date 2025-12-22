use serde::{Deserialize, Serialize};


#[derive(Serialize, Debug)]
pub struct StringWithLimit<const SIZE: usize>(pub String);

impl<'de, const S: usize> Deserialize<'de> for StringWithLimit<S> {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: serde::Deserializer<'de> 
    {
        let s = String::deserialize(deserializer)?;
        if s.len() > S {
            return Err(serde::de::Error::custom(format!("string exceeds maximum length of {}", S)));
        }

        Ok(Self(s))
    }
}