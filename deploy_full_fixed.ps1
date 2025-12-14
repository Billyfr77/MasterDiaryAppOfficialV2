# MasterDiaryOS Full Deployment Script
# Automates Cloud SQL connection, Backend Deployment, and Frontend Build/Deploy

$ErrorActionPreference = "Stop"
$PROJECT_ID = "gen-lang-client-0889466012"
$REGION = "us-central1"
$INSTANCE_NAME = "master-diary-db"
$CONNECTION_NAME = "${PROJECT_ID}:${REGION}:${INSTANCE_NAME}"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   MasterDiaryOS - Full Cloud Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Target Project: $PROJECT_ID"
Write-Host "Cloud SQL Instance: $INSTANCE_NAME"
Write-Host ""

# 1. Credentials
$DB_PASSWORD = Read-Host "Enter the password for the 'postgres' database user"
if ([string]::IsNullOrWhiteSpace($DB_PASSWORD)) {
    Write-Error "Password cannot be empty."
    exit 1
}

# 2. Configure Project
Write-Host "Configuring gcloud project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# 3. Deploy Backend
Write-Host "------------------------------------------"
Write-Host "[1/4] Building & Deploying Backend..." -ForegroundColor Yellow
Write-Host "------------------------------------------"

# Submit Build
gcloud builds submit "backend" --tag "gcr.io/$PROJECT_ID/master-diary-backend"

# Deploy Service
# Using DB_NAME=postgres for default, or you can change to masterdiary_db if you created it.
# We set both DB_HOST and socket path to ensure connectivity.
gcloud run deploy master-diary-backend `
  --image "gcr.io/$PROJECT_ID/master-diary-backend" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --add-cloudsql-instances $CONNECTION_NAME `
  --set-env-vars "NODE_ENV=production" `
  --set-env-vars "DB_USER=postgres" `
  --set-env-vars "DB_PASSWORD=$DB_PASSWORD" `
  --set-env-vars "DB_NAME=postgres" `
  --set-env-vars "DB_SOCKET_PATH=/cloudsql/$CONNECTION_NAME" `
  --set-env-vars "DB_HOST=/cloudsql/$CONNECTION_NAME"

# Get Backend URL
$BACKEND_URL = gcloud run services describe master-diary-backend --platform managed --region $REGION --format "value(status.url)"
Write-Host "Backend is live at: $BACKEND_URL" -ForegroundColor Green

# 4. Prepare Frontend
Write-Host "------------------------------------------"
Write-Host "[2/4] Preparing Frontend Configuration..." -ForegroundColor Yellow
Write-Host "------------------------------------------"

# Create .env.production for Vite build
$EnvContent = "VITE_API_BASE_URL=$BACKEND_URL"
Set-Content -Path "frontend/.env.production" -Value $EnvContent
Write-Host "Created .env.production with VITE_API_BASE_URL=$BACKEND_URL"

# 5. Deploy Frontend
Write-Host "------------------------------------------"
Write-Host "[3/4] Building & Deploying Frontend..." -ForegroundColor Yellow
Write-Host "------------------------------------------"

gcloud builds submit "frontend" --tag "gcr.io/$PROJECT_ID/master-diary-frontend"

gcloud run deploy master-diary-frontend `
  --image "gcr.io/$PROJECT_ID/master-diary-frontend" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

# 6. Cleanup
Remove-Item "frontend/.env.production" -ErrorAction SilentlyContinue

# 7. Final Output
$FRONTEND_URL = gcloud run services describe master-diary-frontend --platform managed --region $REGION --format "value(status.url)"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "Backend URL:  $BACKEND_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login with default admin credentials if seeded, or register a new user."
Write-Host ""