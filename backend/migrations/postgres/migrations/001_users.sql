CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "UserSex" as ENUM (
    'Male',
    'Female',
    'Other'
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    version UUID NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    avatar VARCHAR(50),
    banner VARCHAR(50),
    birth_date DATE NOT NULL,
    sex "UserSex" NOT NULL
);

CREATE INDEX idx_users_email_username ON users (email, username);