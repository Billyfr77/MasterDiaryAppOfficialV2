@echo off
echo ===================================================
echo   MASTER DIARY APP - DEPLOYMENT SCRIPT
echo ===================================================
echo.

echo 1. Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo 2. Submitting to Google Cloud Build...
echo    (This allows Cloud Build to build the Docker image)
gcloud builds submit --tag gcr.io/gen-lang-client-0889466012/master-diary-app-v2 .
if %errorlevel% neq 0 (
    echo Cloud Build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo 3. Deploying to Cloud Run...
gcloud run deploy master-diary-app-v2 ^
  --image gcr.io/gen-lang-client-0889466012/master-diary-app-v2 ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars NODE_ENV=production
if %errorlevel% neq 0 (
    echo Cloud Run deploy failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ===================================================
pause
