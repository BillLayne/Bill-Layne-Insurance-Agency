@echo off
rem Deploy the mail pages to https://mail.billlayneinsurance.com/
rem   tools\deploy-mail-site.bat
rem Pushing the website repo does NOT deploy this address. It is its own small Cloudflare
rem Worker (tools\mail-site) that serves the files in mail-gateway\ with a strict policy.
rem The tests run first; nothing is deployed if any of them fails.
setlocal
call "%~dp0test-mail-gateway.bat"
if errorlevel 1 (
  echo.
  echo Not deployed: the tests did not pass.
  exit /b 1
)
cd /d "%~dp0mail-site"
echo.
echo Deploying to mail.billlayneinsurance.com ...
call npx --yes wrangler@4 deploy
if errorlevel 1 (
  echo.
  echo The deploy did not finish. Nothing changed on the live address.
  exit /b 1
)
echo.
echo Done. Open https://mail.billlayneinsurance.com/ and check the badge says connected.
exit /b 0
