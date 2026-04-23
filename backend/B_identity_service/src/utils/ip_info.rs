use std::ops::{Deref, DerefMut};

use ipinfo::IpInfo;

use crate::config::CONFIG;



pub struct IpInfoWrapper {
    inner: IpInfo
}

impl IpInfoWrapper {
    pub fn new() -> IpInfoWrapper {
        let inner = IpInfo::new(ipinfo::IpInfoConfig {
            token: Some(CONFIG.ipinfoio_token.to_string()),
            cache_size: 1,
            ..Default::default()
        }).unwrap();

        Self { inner }
    }
}

impl Deref for IpInfoWrapper {
    type Target = IpInfo;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}
impl DerefMut for IpInfoWrapper {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner        
    }
}

impl Clone for IpInfoWrapper {
    fn clone(&self) -> Self {
        Self::new()
    }
}