@echo off
rem Mail Gateway safety test - run before pushing changes to mail-gateway\ (or to the
rem gateway code in pdf-tools\index.html).
rem Uses the Chrome or Edge already on this PC and a local MOCK gateway: nothing is sent,
rem no draft is created and Google is never contacted.
rem   tools\test-mail-gateway.bat
rem Shares its one dependency with the PDF Studio tests (tools\pdf-studio-tests).
cd /d "%~dp0pdf-studio-tests"
if not exist node_modules (
  echo Installing test dependencies once...
  call npm install --no-audit --no-fund
)
node ..\mail-gateway-tests\smoke.js
