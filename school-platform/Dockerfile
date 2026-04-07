FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl bash git nano && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y python3 python3-pip

RUN  npm i -g pm2

COPY . app

WORKDIR app

# RUN cd agent-starter-python && pip install -r requirements.txt

RUN npm install && npm run build

EXPOSE 3000

CMD ["npm", "start"]