#!/bin/bash
# CHMP005 V6-B Auto-Installer
set -e

echo "⚡ BoB: Starting V6-B Installation..."

# Install dependencies
echo "📦 Installing system dependencies..."
# Assuming Python 3.12+ and pip are already available in this environment
pip install -r requirements.txt

# Create models directory
mkdir -p models

# Setup environment
if [ ! -f .env ]; then
    echo "📄 Creating .env from .env.example..."
    cp .env.example .env
fi

echo "✅ V6-B Installation Complete!"
echo "🚀 Run 'python main.py' to start the server."
