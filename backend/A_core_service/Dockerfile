FROM golang:1.25.5-alpine AS builder

WORKDIR /app

COPY . .

# swagger
RUN go install github.com/swaggo/swag/cmd/swag@v1.16.4
RUN go generate .

# install deps
RUN go mod tidy

# Build the application
RUN go build -o app

# -------- Runtime stage --------
FROM alpine:latest

RUN apk add --no-cache bash

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/app .
COPY --from=builder /app/dockerfile-init.sh .

ENV APP_ENV=production

EXPOSE 3000

CMD ["bash", "-c", "/app/dockerfile-init.sh"]
