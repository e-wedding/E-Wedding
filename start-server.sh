#!/bin/bash
# Start a local web server for the Wedding E-Invite Gallery

echo "🚀 Starting Wedding E-Invite Gallery..."
echo ""
echo "📍 Opening gallery at: http://localhost:8000"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

# Open browser after a short delay
(sleep 2 && open http://localhost:8000) &

# Start Python web server
python3 -m http.server 8000
