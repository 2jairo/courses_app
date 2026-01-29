# -------- Build stage --------
FROM rust:1.89-alpine AS builder

WORKDIR /app

RUN apk add --no-cache curl build-base

COPY . .
RUN cargo build --release
RUN cargo install 

# -------- Runtime stage --------
FROM alpine:latest

RUN apk add --no-cache bash

WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /app/target/release/identity_service /app/app
COPY --from=builder /app/dockerfile-init.sh .

RUN chmod +x app

EXPOSE 3001

CMD ["bash", "-c", "/app/dockerfile-init.sh"]
