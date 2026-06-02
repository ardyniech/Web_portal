#!/bin/bash
export NODE_ENV=production
node dist/server.cjs > /home/ardy/logs/web_portal.log 2>&1
