@echo off
rem Mail Gateway tests - run before changing mail-gateway\, tools\mail-site\, the gateway code in
rem pdf-tools\index.html, or functions\api\accident-report.js.
rem   tools\test-mail-gateway.bat
rem Three parts, all against stand-ins: nothing is sent, no draft is created, Google is never contacted.
rem   1. Code.gs            the key rules of the Google script (full / draft-only / website key)
rem   2. accident-report    the website's After an Accident report and its health check
rem   3. the pages          Universal Sender, Mail Studio, Receipt Builder, the old-address bridge
rem Part 3 uses the Chrome or Edge already on this PC and shares its one dependency with the
rem PDF Studio tests (tools\pdf-studio-tests).
setlocal
set FAILED=0
cd /d "%~dp0pdf-studio-tests"
if not exist node_modules (
  echo Installing test dependencies once...
  call npm install --no-audit --no-fund
)
echo.
echo === 1 of 3: Code.gs ===
node ..\mail-gateway-tests\codegs.test.js
if errorlevel 1 set FAILED=1
echo.
echo === 2 of 3: After an Accident report ===
node ..\mail-gateway-tests\accident.test.mjs
if errorlevel 1 set FAILED=1
echo.
echo === 3 of 3: the pages ===
node ..\mail-gateway-tests\smoke.js
if errorlevel 1 set FAILED=1
echo.
if "%FAILED%"=="1" (
  echo SOMETHING FAILED - do not deploy.
  exit /b 1
)
echo ALL MAIL GATEWAY TESTS PASSED
exit /b 0
