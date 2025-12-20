CREATE TYPE video_visibility AS ENUM (
  'private',
  'link',
  'public'
);

CREATE TYPE video_processing_status AS ENUM (
  'uploaded',       -- file exists, nothing done yet
  'resolutions',    -- hls
  'images',         -- thumbnails, poster
  'text',           -- transcoding, thumbnails, etc.
  'ready',          -- fully processed
  'failed'          -- processing failed
);

CREATE TABLE videos (
    id BIGSERIAL PRIMARY KEY, 
    owner_id BIGINT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    duration FLOAT,
    visibility video_visibility NOT NULL DEFAULT 'private',
    processing_status video_processing_status NOT NULL DEFAULT 'uploaded',
    failure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT public_requires_ready CHECK (
        (visibility = 'public' OR visibility = 'link') AND processing_status = 'ready'
    )
);

CREATE TABLE video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE, --todo: uuid

  type video_asset_type NOT NULL,
  title TEXT NOT NULL,

  -- for uploaded files
  storage_key TEXT,     -- S3 / GCS path
  mime_type TEXT,
  file_size BIGINT,

  -- for external links
  url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT asset_has_location
    CHECK (
      storage_key IS NOT NULL OR url IS NOT NULL
    )
);