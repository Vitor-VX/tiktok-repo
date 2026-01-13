FROM mcr.microsoft.com/playwright:v1.42.0-jammy

# Instala noVNC + Xvfb
RUN apt-get update && apt-get install -y \
    novnc \
    websockify \
    x11vnc \
    xvfb \
    fluxbox

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

EXPOSE 6080
CMD ["bash", "start.sh"]