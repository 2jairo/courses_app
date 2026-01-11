# For CUDA support
FROM nvidia/cuda:12.9.0-devel-ubuntu24.04 AS builder

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    libssl-dev \
    cmake \
    git \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

ENV PATH="/root/.cargo/bin:${PATH}"

# Enable universe repository (required for libclang-dev)
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository universe \
    && apt-get update

# Install GStreamer 1.20+ development packages
RUN apt-get update && apt-get install -y \
    libgstreamer1.0-dev \ 
    libgstreamer-plugins-base1.0-dev \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    && rm -rf /var/lib/apt/lists/*

# Install libclang and LLVM 14 for whisper-rs bindgen
RUN apt-get update && apt-get install -y \
    libclang-14-dev \
    llvm-14-dev \
    && rm -rf /var/lib/apt/lists/*

# Set LIBCLANG_PATH to help bindgen find libclang
ENV LIBCLANG_PATH=/usr/lib/llvm-14/lib

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY wait-for-it.sh .
COPY dockerfile-init.sh .

# Build with CUDA
RUN cargo build --release

# Runtime with CUDA
FROM nvidia/cuda:12.9.0-devel-ubuntu24.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libgstreamer1.0-0 \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    libssl3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/c_worker .
COPY --from=builder /app/wait-for-it.sh .
COPY --from=builder /app/dockerfile-init.sh .

ENV GST_PLUGIN_PATH=/usr/lib/x86_64-linux-gnu/gstreamer-1.0
ENV GST_PLUGIN_SYSTEM_PATH=/usr/lib/x86_64-linux-gnu/gstreamer-1.0
ENV RUST_BACKTRACE=1
# ENV GST_PLUGIN_SCANNER=/usr/libexec/gstreamer-1.0/gst-plugin-scanner
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility,video,graphics,display


ENTRYPOINT ["sh", "-c", "/app/dockerfile-init.sh"]