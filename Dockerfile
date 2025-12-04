# 使用 RunPod 官方基礎映像檔
FROM runpod/worker-comfyui:5.5.0-base

# 1. 下載 Pony V6 XL 模型
RUN comfy model download --url https://huggingface.co/WhiteAiZ/PonyXL/resolve/main/PonyDiffusionV6XL.safetensors --relative-path models/checkpoints --filename pony_v6_xl.safetensors

# 2. 下載 LoRA (改用 comfy model download 指令，避免 wget 缺失問題)
RUN comfy model download --url "https://civitai.com/api/download/models/439481?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439481.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439471?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439471.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439441?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439441.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439432?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439432.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439429?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439429.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439424?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439424.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439407?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439407.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439400?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439400.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439394?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439394.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439392?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439392.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439387?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439387.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/439381?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_439381.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/448787?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_448787.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/491774?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_491774.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/561089?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_561089.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/611859?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_611859.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/639103?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_639103.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/680657?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_680657.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/695509?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_695509.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/710719?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_710719.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/762356?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_762356.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/794503?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_794503.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/834400?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_834400.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/887199?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_887199.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/900829?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_900829.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/905091?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_905091.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/944761?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_944761.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/996061?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_996061.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1003676?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1003676.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1098402?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1098402.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1187018?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1187018.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1232445?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1232445.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1284944?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1284944.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1320254?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1320254.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1320195?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1320195.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1378005?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1378005.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1401050?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1401050.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1487371?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1487371.safetensors
RUN comfy model download --url "https://civitai.com/api/download/models/1531958?type=Model&format=SafeTensor" --relative-path models/loras --filename lora_1531958.safetensors

# 4. 啟動指令
CMD ["/start.sh"]
