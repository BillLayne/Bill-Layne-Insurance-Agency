@echo off
title Bill Layne Insurance - save the website mail key
cd /d "%TEMP%"
echo.
echo  ============================================================
echo   Save the WEBSITE mail key
echo.
echo   The After an Accident page on the website emails each
echo   report to the agency. It uses its own key, the "website
echo   key", which can only email the agency itself.
echo.
echo   This puts that key into Cloudflare and rebuilds the site.
echo   Nobody sees the key but you. Nothing is emailed.
echo  ============================================================
echo.
echo   1. On the Mail Gateway page open Settings, then
echo      "Change the keys", and click "Copy the website key".
echo   2. When the prompt below appears, RIGHT-CLICK to paste it.
echo      It stays hidden. That is normal.
echo   3. Press Enter.
echo.
call npx --yes wrangler@4 pages secret put BLI_MAIL_GATEWAY_SECRET --project-name bill-layne-insurance-agency
if errorlevel 1 goto :failed
echo.
echo   Saved. The website only picks up a new key when it is
echo   rebuilt, so a rebuild is being started now...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $r='repos/BillLayne/Bill-Layne-Insurance-Agency'; $sha=(gh api ($r+'/git/ref/heads/main') --jq .object.sha); if(-not $sha){exit 1}; $tree=(gh api ($r+'/git/commits/'+$sha) --jq .tree.sha); if(-not $tree){exit 1}; $new=(gh api ($r+'/git/commits') -f 'message=Rebuild the site so the After an Accident report picks up its new mail key' -f ('tree='+$tree) -f ('parents[]='+$sha) --jq .sha); if(-not $new){exit 1}; gh api -X PATCH ($r+'/git/refs/heads/main') -f ('sha='+$new) --silent; if($LASTEXITCODE -ne 0){exit 1}"
if errorlevel 1 goto :norebuild
echo.
echo  ============================================================
echo   Done. The website is rebuilding. It takes about 3 minutes.
echo.
echo   Then, on the Mail Gateway page, click
echo   "Check the After an Accident page".
echo   It should say: connected with the website key.
echo  ============================================================
echo.
pause
exit /b 0

:norebuild
echo.
echo  ============================================================
echo   The key was saved, but the rebuild could not be started
echo   from here. Tell Claude: "rebuild the website".
echo   Until it is rebuilt the After an Accident page keeps
echo   using its old key.
echo  ============================================================
echo.
pause
exit /b 1

:failed
echo.
echo  ============================================================
echo   The key was NOT saved. Nothing changed.
echo   If it asked you to log in, run this again afterwards.
echo   Otherwise tell Claude what the lines above say.
echo  ============================================================
echo.
pause
exit /b 1
