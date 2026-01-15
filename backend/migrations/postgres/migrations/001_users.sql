CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TYPE "UserSex" as ENUM (
    'Male',
    'Female',
    'Other'
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    version UUID NOT NULL DEFAULT uuid_generate_v4(),
    email CITEXT NOT NULL UNIQUE,
    username CITEXT NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    avatar VARCHAR(50),
    banner VARCHAR(50),
    birth_date DATE NOT NULL,
    sex "UserSex" NOT NULL,

    CONSTRAINT users_email_length CHECK (length(email) <= 100),
    CONSTRAINT users_username_length CHECK (length(username) <= 50)
);

CREATE INDEX idx_users_email_trgm
ON users USING gin (email gin_trgm_ops);

CREATE INDEX idx_users_username_trgm
ON users USING gin (username gin_trgm_ops);