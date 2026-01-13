FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Evita o prompt interativo do fuso horário (Geographic Area)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

# Instala noVNC + Xvfb + FFmpeg
# Adicionamos ffmpeg aqui para garantir que suas funções de vídeo funcionem no container
RUN apt-get update && apt-get install -y --no-install-recommends \
    novnc \
    websockify \
    x11vnc \
    xvfb \
    fluxbox \
    ffmpeg \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Garante que o script de inicialização tenha permissão de execução
RUN chmod +x start.sh

EXPOSE 6080
CMD ["bash", "start.sh"]