@echo off
rem check-nav.bat - verify every page's site menu still matches tools/nav.json.
rem Runs build-nav.py --check for every wave. Exit code 1 if anything drifted.
rem Fix drift with:  python tools\build-nav.py --wave N --apply
setlocal
cd /d "%~dp0.."
set FAIL=0
for %%W in (1 2 2b 3 4 7) do (
    python tools\build-nav.py --wave %%W --check >nul 2>&1
    if errorlevel 1 (
        echo [DRIFT] wave %%W is out of date - run: python tools\build-nav.py --wave %%W --apply
        set FAIL=1
    ) else (
        echo [ok]    wave %%W
    )
)
if "%FAIL%"=="1" (
    echo.
    echo Site menus have drifted from tools/nav.json. Fix before pushing.
    exit /b 1
)
echo All site menus match tools/nav.json.
exit /b 0
