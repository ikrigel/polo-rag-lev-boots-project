@echo off
setlocal enabledelayedexpansion
cd /d "c:\rag-lev-boots-project\rag-lev-boots-project-main\server"
npx --loglevel=silent tsx mcp/server.ts