#!/bin/bash
# Antigravity Monitor (Auto-Heal)

echo "Starting Antigravity Monitor..."
echo "If the server crashes, I will resurrection it."

until node server.js; do
    echo "Antigravity Server crashed with exit code $?. Respawning in 1 second..." >&2
    sleep 1
done
