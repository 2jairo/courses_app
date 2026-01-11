# Use Rust official image as base
FROM rust:1.89-alpine

RUN apk add --no-cache curl build-base bash


# Install required system dependencies
# RUN apt-get update && apt-get install -y \
#     pkg-config \
#     libssl-dev \
#     postgresql-client \
#     && rm -rf /var/lib/apt/lists/*

# Install SQLx CLI for database migrations
RUN cargo install sqlx-cli --no-default-features --features postgres

# Set working directory
WORKDIR /migrations

COPY . .

CMD ["sh", "-c", "/migrations/dockerfile-init.sh"]
