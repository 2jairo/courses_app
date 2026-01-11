**Docker Setup**
- **Create env file:** Before building or running Docker, create `.env.docker` as a copy of `.env.development` (with modified values, like databases url and paths)


**GPU/CPU Toggle**
- **`USE_GPU`:** Controls whether GStreamer uses GPU or CPU-only in pipelines.
- **GPU (`USE_GPU=true`):** Enables hardware-accelerated pipelines (e.g., NVENC/NVDEC on NVIDIA). Requires a compatible GPU, drivers, and a CUDA-capable runtime/base image.
- **CPU (`USE_GPU=false`):** Uses software-only pipelines; works without GPU dependencies.

**Whisper-rs (CPU vs GPU)**
- **File:** See [Cargo.toml](Cargo.toml) for the `whisper-rs` configuration.
- **Model:** Download a model from <https://huggingface.co/ggerganov/whisper.cpp/tree/main>  (`ggml-medum.bin` or `ggml-small.bin` are good for result/time-spent)
- **CPU default:** `whisper-rs = "0.15.1"` uses the CPU implementation.
- **GPU (CUDA):** `# whisper-rs = { version = "0.15.1", features = ["cuda"] }` enables CUDA-based acceleration when uncommented. Toggle this for GPU builds (commonly enabled on release builds).
- **Note:** CUDA builds require an NVIDIA GPU, proper drivers on the host, and a CUDA-enabled base image/toolchain in Docker.

**Run with Docker**
- **Prepare env:** Ensure `.env.production` exists
- **Build:** `docker build -t c_worker .`
- **Run:** `docker run --env-file .env.production --rm c_worker`

**Tips**
- **Host requirements:** For GPU mode, verify the host has the correct drivers (e.g., NVIDIA) and that Docker is set up to pass through the GPU (e.g., `--gpus all` if supported by your Docker installation).
- **Consistency:** Align `USE_GPU` with the `whisper-rs` choice in [Cargo.toml](Cargo.toml) to avoid mixing GPU/CPU settings.
