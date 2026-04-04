#!/bin/bash
set -e

pm2 start /app/agent-starter-python/src/agent.py \
    --name "agent" \
    --interpreter python3 \
    -- dev

cd /app/school-platform
pm2 start npm --name "school-platform" -- start

pm2 logs