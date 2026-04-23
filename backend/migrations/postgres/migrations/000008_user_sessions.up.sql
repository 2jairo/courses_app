CREATE TYPE "DeviceType" AS ENUM (
	'Desktop',
	'Mobile',
	'Tablet',
	'SmartTv',
	'Other'
);

CREATE TYPE "BrowserType" AS ENUM (
    'Chrome',
    'Safari',
    'Firefox',
    'Edge',
    'InternetExplorer',
    'Opera',
    'Brave',
    'Other'
);

CREATE TYPE "OperatingSystem" AS ENUM (
    'Windows',
    'MacOS',
    'IOS',
    'Android',
    'Linux',
    'ChromeOS',
    'Other'
);

CREATE TABLE refresh_sessions (
    id BIGSERIAL PRIMARY KEY, -- FAMILY ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    family_id VARCHAR(50) NOT NULL DEFAULT '',
    device "DeviceType" NOT NULL DEFAULT 'Other',
    os "OperatingSystem" NOT NULL DEFAULT 'Other',
    browser "BrowserType" NOT NULL DEFAULT 'Other',
    token_hash VARCHAR(100) NOT NULL,
    session_version INT NOT NULL DEFAULT 0,
    revoked BOOLEAN DEFAULT FALSE,
    ip VARCHAR(15) NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50)
);

CREATE INDEX idx_refresh_sessions_user_id ON refresh_sessions(user_id);