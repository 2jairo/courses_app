CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "VideoVisibility" as ENUM (
    'Private', 
    'Link', 
    'Public'
);

CREATE TYPE "VideoProcessingStatus" as ENUM (
    'Uploaded',       -- file exists, nothing done yet
    'Resolutions',    -- hls
    'Images',         -- thumbnails, poster
    'Text',           -- transcoding, thumbnails, etc.
    'Ready',          -- fully processed
    'Failed'          -- processing failed
);

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    name TEXT NOT NULL,
    duration FLOAT,
    visibility "VideoVisibility" NOT NULL DEFAULT 'Private',
    status "VideoProcessingStatus" NOT NULL DEFAULT 'Uploaded',
    failure_reason TEXT, -- VideoProcessingStatus == failed

    CONSTRAINT visibility_public_requires_status_ready CHECK (
        (visibility = 'Public' OR visibility = 'Link') AND status = 'Ready'
    )
);