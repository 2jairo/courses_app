use std::convert::Infallible;

use agent_parser_ro::{Browser as BrwoserParser, OperatingSystem as OperatingSystemParser, DeviceType as DeviceTypeParser, UserAgentParser};
use axum::{extract::FromRequestParts, http::{header::USER_AGENT, request::Parts}};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::models::entity::refresh_session::{BrowserType, DeviceType, OperatingSystem};


#[derive(Debug, PartialEq, Clone, Copy, Serialize, Deserialize, ToSchema)]
pub struct ParsedUserAgent {
    pub os: OperatingSystem,
    pub browser: BrowserType,
    pub device: DeviceType,
}

impl From<DeviceTypeParser> for DeviceType {
    fn from(value: DeviceTypeParser) -> Self {
        match value {
            DeviceTypeParser::Desktop => Self::Desktop,
            DeviceTypeParser::Mobile => Self::Mobile,
            DeviceTypeParser::Tablet => Self::Tablet,
            DeviceTypeParser::TV | DeviceTypeParser::Game => Self::SmartTv,
            _ => Self::Other
        }
    }
}

impl From<BrwoserParser> for BrowserType {
    fn from(value: BrwoserParser) -> Self {
        match value {
            BrwoserParser::Chrome => Self::Chrome,
            BrwoserParser::Safari => Self::Safari,
            BrwoserParser::Firefox => Self::Firefox,
            BrwoserParser::Edge => Self::Edge,
            BrwoserParser::Opera => Self::Opera,
            BrwoserParser::InternetExplorer => Self::InternetExplorer,
            BrwoserParser::Brave => Self::Brave,
            _ => Self::Other
        }
    }
}

impl From<OperatingSystemParser> for OperatingSystem {
    fn from(value: OperatingSystemParser) -> Self {
        match value {
            OperatingSystemParser::Windows => Self::Windows,
            OperatingSystemParser::MacOS => Self::MacOS,
            OperatingSystemParser::IOS => Self::IOS,
            OperatingSystemParser::Android => Self::Android,
            OperatingSystemParser::Linux => Self::Linux,
            OperatingSystemParser::ChromeOS => Self::ChromeOS,
            _ => Self::Other
        }
    }
}

impl<S> FromRequestParts<S> for ParsedUserAgent
    where S: Send + Sync
{
    type Rejection = Infallible;

    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        if let Some(ua_header) = parts.headers.get(USER_AGENT) {
            if let Ok(ua_str) = ua_header.to_str() {
                let ua = UserAgentParser::parse(ua_str);
                
                return Ok(ParsedUserAgent {
                    os: OperatingSystem::from(ua.os),
                    browser: BrowserType::from(ua.browser),
                    device: DeviceType::from(ua.device_type),
                });
            }
        }
        Ok(ParsedUserAgent {
            os: OperatingSystem::Other,
            browser: BrowserType::Other,
            device: DeviceType::Other,
        })
    }
}