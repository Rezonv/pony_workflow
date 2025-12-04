# 使用 RunPod 官方基礎映像檔
FROM runpod/worker-comfyui:5.5.0-base

# 安裝 wget (確保有工具)
RUN apt-get update && apt-get install -y wget

# 複製下載腳本到容器根目錄
COPY scripts/install_models.sh /install_models.sh

# 給予執行權限並執行腳本
RUN chmod +x /install_models.sh && /install_models.sh

# 啟動指令
CMD ["/start.sh"]
