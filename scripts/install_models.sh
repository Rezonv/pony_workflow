#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Define User Agent to bypass Civitai blocking
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

# Create directories
mkdir -p /comfyui/models/checkpoints
mkdir -p /comfyui/models/loras

echo "Downloading Pony V6 XL..."
wget --header="User-Agent: $USER_AGENT" -O /comfyui/models/checkpoints/pony_v6_xl.safetensors "https://huggingface.co/WhiteAiZ/PonyXL/resolve/main/PonyDiffusionV6XL.safetensors"

echo "Downloading LoRAs..."

# Function to download with retry and validation
download_lora() {
    url=$1
    filename=$2
    filepath="/comfyui/models/loras/$filename"
    
    echo "Downloading $filename..."
    wget --header="User-Agent: $USER_AGENT" -O "$filepath" "$url"
    
    # Validation 1: Check file size (must be > 10KB)
    filesize=$(stat -c%s "$filepath")
    if [ "$filesize" -lt 10000 ]; then
        echo "ERROR: File $filename is too small ($filesize bytes). Likely an error page."
        cat "$filepath"
        exit 1
    fi

    # Validation 2: Check for HTML content (Civitai error pages)
    # We check the first few lines for common HTML tags
    if head -n 10 "$filepath" | grep -qEi "<!DOCTYPE|html|body|Cloudflare"; then
        echo "ERROR: File $filename appears to be an HTML page (likely 403 Forbidden)."
        echo "First 10 lines of content:"
        head -n 10 "$filepath"
        exit 1
    fi
    
    echo "Verified: $filename ($filesize bytes)"
}

download_lora "https://civitai.com/api/download/models/439481?type=Model&format=SafeTensor" "lora_439481.safetensors"
download_lora "https://civitai.com/api/download/models/439471?type=Model&format=SafeTensor" "lora_439471.safetensors"
download_lora "https://civitai.com/api/download/models/439441?type=Model&format=SafeTensor" "lora_439441.safetensors"
download_lora "https://civitai.com/api/download/models/439432?type=Model&format=SafeTensor" "lora_439432.safetensors"
download_lora "https://civitai.com/api/download/models/439429?type=Model&format=SafeTensor" "lora_439429.safetensors"
download_lora "https://civitai.com/api/download/models/439424?type=Model&format=SafeTensor" "lora_439424.safetensors"
download_lora "https://civitai.com/api/download/models/439407?type=Model&format=SafeTensor" "lora_439407.safetensors"
download_lora "https://civitai.com/api/download/models/439400?type=Model&format=SafeTensor" "lora_439400.safetensors"
download_lora "https://civitai.com/api/download/models/439394?type=Model&format=SafeTensor" "lora_439394.safetensors"
download_lora "https://civitai.com/api/download/models/439392?type=Model&format=SafeTensor" "lora_439392.safetensors"
download_lora "https://civitai.com/api/download/models/439387?type=Model&format=SafeTensor" "lora_439387.safetensors"
download_lora "https://civitai.com/api/download/models/439381?type=Model&format=SafeTensor" "lora_439381.safetensors"
download_lora "https://civitai.com/api/download/models/448787?type=Model&format=SafeTensor" "lora_448787.safetensors"
download_lora "https://civitai.com/api/download/models/491774?type=Model&format=SafeTensor" "lora_491774.safetensors"
download_lora "https://civitai.com/api/download/models/561089?type=Model&format=SafeTensor" "lora_561089.safetensors"
download_lora "https://civitai.com/api/download/models/611859?type=Model&format=SafeTensor" "lora_611859.safetensors"
download_lora "https://civitai.com/api/download/models/639103?type=Model&format=SafeTensor" "lora_639103.safetensors"
download_lora "https://civitai.com/api/download/models/680657?type=Model&format=SafeTensor" "lora_680657.safetensors"
download_lora "https://civitai.com/api/download/models/695509?type=Model&format=SafeTensor" "lora_695509.safetensors"
download_lora "https://civitai.com/api/download/models/710719?type=Model&format=SafeTensor" "lora_710719.safetensors"
download_lora "https://civitai.com/api/download/models/762356?type=Model&format=SafeTensor" "lora_762356.safetensors"
download_lora "https://civitai.com/api/download/models/794503?type=Model&format=SafeTensor" "lora_794503.safetensors"
download_lora "https://civitai.com/api/download/models/834400?type=Model&format=SafeTensor" "lora_834400.safetensors"
download_lora "https://civitai.com/api/download/models/887199?type=Model&format=SafeTensor" "lora_887199.safetensors"
download_lora "https://civitai.com/api/download/models/900829?type=Model&format=SafeTensor" "lora_900829.safetensors"
download_lora "https://civitai.com/api/download/models/905091?type=Model&format=SafeTensor" "lora_905091.safetensors"
download_lora "https://civitai.com/api/download/models/944761?type=Model&format=SafeTensor" "lora_944761.safetensors"
download_lora "https://civitai.com/api/download/models/996061?type=Model&format=SafeTensor" "lora_996061.safetensors"
download_lora "https://civitai.com/api/download/models/1003676?type=Model&format=SafeTensor" "lora_1003676.safetensors"
download_lora "https://civitai.com/api/download/models/1098402?type=Model&format=SafeTensor" "lora_1098402.safetensors"
download_lora "https://civitai.com/api/download/models/1187018?type=Model&format=SafeTensor" "lora_1187018.safetensors"
download_lora "https://civitai.com/api/download/models/1232445?type=Model&format=SafeTensor" "lora_1232445.safetensors"
download_lora "https://civitai.com/api/download/models/1284944?type=Model&format=SafeTensor" "lora_1284944.safetensors"
download_lora "https://civitai.com/api/download/models/1320254?type=Model&format=SafeTensor" "lora_1320254.safetensors"
download_lora "https://civitai.com/api/download/models/1320195?type=Model&format=SafeTensor" "lora_1320195.safetensors"
download_lora "https://civitai.com/api/download/models/1378005?type=Model&format=SafeTensor" "lora_1378005.safetensors"
download_lora "https://civitai.com/api/download/models/1401050?type=Model&format=SafeTensor" "lora_1401050.safetensors"
download_lora "https://civitai.com/api/download/models/1487371?type=Model&format=SafeTensor" "lora_1487371.safetensors"
download_lora "https://civitai.com/api/download/models/1531958?type=Model&format=SafeTensor" "lora_1531958.safetensors"

echo "All downloads complete."
