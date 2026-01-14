FROM node:latest

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    chromium \
    chromium-driver \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium

WORKDIR /app

COPY entrypoint.sh /app/local/bin/
RUN chmod +x /app/local/bin/entrypoint.sh

RUN mkdir -p /app/profiles && chown -R node:node /app/profiles

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6080

ENTRYPOINT ["entrypoint.sh"]

CMD ["node", "server.js"]