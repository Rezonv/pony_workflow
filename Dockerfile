# 使用 RunPod 官方基礎映像檔
FROM runpod/worker-comfyui:5.5.0-base

# 安裝 wget 和 curl (以防萬一需要)
RUN apt-get update && apt-get install -y wget curl python3

# 複製下載腳本到容器根目錄
COPY scripts/download_models_docker.py /download_models_docker.py

# 執行 Python 腳本下載所有模型
RUN python3 /download_models_docker.py

# 啟動指令
CMD ["/start.sh"]
