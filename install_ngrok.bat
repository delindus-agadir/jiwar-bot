@echo off
setlocal

:: Define download URL for latest ngrok (Windows amd64)
set "NGROK_URL=https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip"
set "DEST_DIR=%~dp0"
set "ZIP_PATH=%DEST_DIR%ngrok.zip"

echo Downloading ngrok...
powershell -Command "Invoke-WebRequest -Uri %NGROK_URL% -OutFile %ZIP_PATH%"

if not exist "%ZIP_PATH%" (
    echo Failed to download ngrok.
    exit /b 1
)

echo Extracting ngrok...
powershell -Command "Expand-Archive -Path %ZIP_PATH% -DestinationPath %DEST_DIR% -Force"

if not exist "%DEST_DIR%ngrok.exe" (
    echo Extraction failed.
    exit /b 1
)

:: Clean up zip
del "%ZIP_PATH%"

:: Add ngrok to user PATH for this session
set "PATH=%DEST_DIR%;%PATH%"

:: Configure authtoken (already set, but ensure)
ngrok config add-authtoken 365F4q8MszNAIVSmSIUo4QCoUnh_2U84FPmvSc5JoSz8xbXji

:: Start tunnel and output URL
ngrok http 5173 --log=stdout

endlocal
