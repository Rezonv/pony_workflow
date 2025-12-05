FROM runpod/worker-comfyui:5.5.0-base

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install specific tools
RUN apt-get update && apt-get install -y wget curl

# Copy download script
COPY download_model.sh /download_model.sh

# Create directory (if not exists in base)
RUN mkdir -p /comfyui/models/checkpoints

# Run download
RUN chmod +x /download_model.sh && /download_model.sh

# Start Worker
CMD ["/start.sh"]
