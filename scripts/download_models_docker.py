import os
import urllib.request
import urllib.error
import time

# Define models to download
# Format: "filename": "url"
MODELS = {
    # Checkpoints
    "models/checkpoints/pony_v6_xl.safetensors": "https://huggingface.co/WhiteAiZ/PonyXL/resolve/main/PonyDiffusionV6XL.safetensors",
    
    # LoRAs
    "models/loras/lora_439481.safetensors": "https://civitai.com/api/download/models/439481?type=Model&format=SafeTensor",
    "models/loras/lora_439471.safetensors": "https://civitai.com/api/download/models/439471?type=Model&format=SafeTensor",
    "models/loras/lora_439441.safetensors": "https://civitai.com/api/download/models/439441?type=Model&format=SafeTensor",
    "models/loras/lora_439432.safetensors": "https://civitai.com/api/download/models/439432?type=Model&format=SafeTensor",
    "models/loras/lora_439429.safetensors": "https://civitai.com/api/download/models/439429?type=Model&format=SafeTensor",
    "models/loras/lora_439424.safetensors": "https://civitai.com/api/download/models/439424?type=Model&format=SafeTensor",
    "models/loras/lora_439407.safetensors": "https://civitai.com/api/download/models/439407?type=Model&format=SafeTensor",
    "models/loras/lora_439400.safetensors": "https://civitai.com/api/download/models/439400?type=Model&format=SafeTensor",
    "models/loras/lora_439394.safetensors": "https://civitai.com/api/download/models/439394?type=Model&format=SafeTensor",
    "models/loras/lora_439392.safetensors": "https://civitai.com/api/download/models/439392?type=Model&format=SafeTensor",
    "models/loras/lora_439387.safetensors": "https://civitai.com/api/download/models/439387?type=Model&format=SafeTensor",
    "models/loras/lora_439381.safetensors": "https://civitai.com/api/download/models/439381?type=Model&format=SafeTensor",
    "models/loras/lora_448787.safetensors": "https://civitai.com/api/download/models/448787?type=Model&format=SafeTensor",
    "models/loras/lora_491774.safetensors": "https://civitai.com/api/download/models/491774?type=Model&format=SafeTensor",
    "models/loras/lora_561089.safetensors": "https://civitai.com/api/download/models/561089?type=Model&format=SafeTensor",
    "models/loras/lora_611859.safetensors": "https://civitai.com/api/download/models/611859?type=Model&format=SafeTensor",
    "models/loras/lora_639103.safetensors": "https://civitai.com/api/download/models/639103?type=Model&format=SafeTensor",
    "models/loras/lora_680657.safetensors": "https://civitai.com/api/download/models/680657?type=Model&format=SafeTensor",
    "models/loras/lora_695509.safetensors": "https://civitai.com/api/download/models/695509?type=Model&format=SafeTensor",
    "models/loras/lora_710719.safetensors": "https://civitai.com/api/download/models/710719?type=Model&format=SafeTensor",
    "models/loras/lora_762356.safetensors": "https://civitai.com/api/download/models/762356?type=Model&format=SafeTensor",
    "models/loras/lora_794503.safetensors": "https://civitai.com/api/download/models/794503?type=Model&format=SafeTensor",
    "models/loras/lora_834400.safetensors": "https://civitai.com/api/download/models/834400?type=Model&format=SafeTensor",
    "models/loras/lora_887199.safetensors": "https://civitai.com/api/download/models/887199?type=Model&format=SafeTensor",
    "models/loras/lora_900829.safetensors": "https://civitai.com/api/download/models/900829?type=Model&format=SafeTensor",
    "models/loras/lora_905091.safetensors": "https://civitai.com/api/download/models/905091?type=Model&format=SafeTensor",
    "models/loras/lora_944761.safetensors": "https://civitai.com/api/download/models/944761?type=Model&format=SafeTensor",
    "models/loras/lora_996061.safetensors": "https://civitai.com/api/download/models/996061?type=Model&format=SafeTensor",
    "models/loras/lora_1003676.safetensors": "https://civitai.com/api/download/models/1003676?type=Model&format=SafeTensor",
    "models/loras/lora_1098402.safetensors": "https://civitai.com/api/download/models/1098402?type=Model&format=SafeTensor",
    "models/loras/lora_1187018.safetensors": "https://civitai.com/api/download/models/1187018?type=Model&format=SafeTensor",
    "models/loras/lora_1232445.safetensors": "https://civitai.com/api/download/models/1232445?type=Model&format=SafeTensor",
    "models/loras/lora_1284944.safetensors": "https://civitai.com/api/download/models/1284944?type=Model&format=SafeTensor",
    "models/loras/lora_1320254.safetensors": "https://civitai.com/api/download/models/1320254?type=Model&format=SafeTensor",
    "models/loras/lora_1320195.safetensors": "https://civitai.com/api/download/models/1320195?type=Model&format=SafeTensor",
    "models/loras/lora_1378005.safetensors": "https://civitai.com/api/download/models/1378005?type=Model&format=SafeTensor",
    "models/loras/lora_1401050.safetensors": "https://civitai.com/api/download/models/1401050?type=Model&format=SafeTensor",
    "models/loras/lora_1487371.safetensors": "https://civitai.com/api/download/models/1487371?type=Model&format=SafeTensor",
    "models/loras/lora_1531958.safetensors": "https://civitai.com/api/download/models/1531958?type=Model&format=SafeTensor",
}

BASE_DIR = "/comfyui"

def download_file(url, dest_path):
    print(f"Downloading {url} to {dest_path}...")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    # Headers to mimic a browser (important for Civitai)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=300) as response:
            with open(dest_path, 'wb') as out_file:
                while True:
                    chunk = response.read(8192)
                    if not chunk:
                        break
                    out_file.write(chunk)
        print(f"Success: {dest_path}")
        return True
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason} for {url}")
        return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def main():
    print("Starting model downloads...")
    success_count = 0
    fail_count = 0
    
    for rel_path, url in MODELS.items():
        dest_path = os.path.join(BASE_DIR, rel_path)
        if download_file(url, dest_path):
            success_count += 1
        else:
            fail_count += 1
            print(f"FAILED to download: {rel_path}")
            
    print(f"Download complete. Success: {success_count}, Failed: {fail_count}")
    
    if fail_count > 0:
        print("WARNING: Some downloads failed!")
        # We don't exit with error to allow the container to start even if some loras fail,
        # but you might want to exit(1) if strictness is required.
        # exit(1) 

if __name__ == "__main__":
    main()
