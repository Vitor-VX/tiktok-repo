#!/bin/bash

# Display virtual
export DISPLAY=:99
Xvfb :99 -screen 0 1920x1080x24 &

# Window manager
fluxbox &

# VNC server
x11vnc -display :99 -forever -nopw -shared &

# noVNC (web)
websockify --web=/usr/share/novnc/ 6080 localhost:5900 &

# Playwright
node index.mjs