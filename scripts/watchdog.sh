#!/bin/bash
# CHMP005 V6-B Watchdog
API_PORT=8000
LLM_PORT=8080
CHECK_INTERVAL=30

echo "🐕 Watchdog: Monitoring CHMP005 V6-B (8GB RAM Optimization)..."

while true; do
    # 1. Monitor Local LLM Server
    if ! curl -s http://localhost:$LLM_PORT/health > /dev/null; then
        echo "🚨 Local LLM Server is DOWN! Restarting..."
        fuser -k $LLM_PORT/tcp || true
        # Source .env to get model path
        if [ -f .env ]; then
            export $(grep -v '^#' .env | xargs)
        fi

        # Start llama-server with 8GB RAM optimized parameters
        # -c 1024: small context
        # -t 4: cap threads to avoid UI starvation
        # --mlock: avoid swapping if possible (optional, might need root)
        # --no-mmap: can save RAM on some systems but usually mmap is better
        if [ -f bin/llama-server ]; then
            nohup ./bin/llama-server -m "$LOCAL_MODEL_PATH" \
                --port $LLM_PORT \
                -c 1024 \
                -t 4 \
                --alias local_model \
                > llm_server.log 2>&1 &
            echo "✅ LLM Server Restarted with optimized params."
        else
            echo "❌ bin/llama-server not found!"
        fi
    fi

    # 2. Monitor API
    if ! curl -s http://localhost:$API_PORT/health > /dev/null; then
        echo "🚨 API is DOWN! Restarting..."
        fuser -k $API_PORT/tcp || true
        nohup python main.py > api_server.log 2>&1 &
        echo "✅ API Restarted."
    fi

    sleep $CHECK_INTERVAL
done
