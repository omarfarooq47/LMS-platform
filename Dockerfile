FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl bash git && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/omarfarooq47/LMS-platform.git

WORKDIR /LMS-platform
RUN cd school-platform && npm install && npm run build 

RUN cd agent-starter-python && apt-get update && \
    apt-get install -y python3 python3-pip && pip install -r requirements.txt

RUN  npm i -g pm2

CMD ["pm2", "start", "python", "--name", "healmind-agent", "--interpreter", "none", "--", "agent-starter-python/src/agent.py", "dev",\
    "&&", "cd", "school-platform", "&&", \
    "pm2", "start", "npm", "--name", "school-platform", "--interpreter", "none", "--", "start"]
