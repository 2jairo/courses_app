use serde::{Deserialize, de::DeserializeOwned};
use utoipa::ToSchema;
use validator::Validate;

#[derive(ToSchema)]
pub struct Validated<T>(pub T);

impl<'de, T> Deserialize<'de> for Validated<T>
where
    T: DeserializeOwned + Validate
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = T::deserialize(deserializer)?;
        value.validate().map_err(serde::de::Error::custom)?;
        
        Ok(Self(value))
    }
}