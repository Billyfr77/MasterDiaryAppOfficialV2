# Deploy MasterDiaryAppOfficialV2 to Cloud Run (FIXED)

$PROJECT_ID = "gen-lang-client-0889466012"
$REGION = "us-central1"
$SERVICE_NAME = "master-diary-app-v2"
$DB_INSTANCE = "gen-lang-client-0889466012:us-central1:master-diary-db"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# --- SECRETS (Use Environment Variables or Secret Manager for security) ---
$GROK_API_KEY=$env:GROK_API_KEY
$GOOGLE_MAPS_KEY=$env:GOOGLE_MAPS_KEY
$GOOGLE_ADVANCED_KEY=$env:GOOGLE_ADVANCED_KEY
$DB_PASSWORD=$env:DB_PASSWORD
$JWT_SECRET=$env:JWT_SECRET
$JWT_REFRESH_SECRET=$env:JWT_REFRESH_SECRET

Write-Host "Starting Deployment for $SERVICE_NAME..." -ForegroundColor Green

# 1. Set Project
Write-Host "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 2. Build Frontend (Commented out: Handled by Dockerfile in Cloud Build)
# Write-Host "Building Frontend..."
# cd frontend
# $env:VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY
# npm run build
# if ($LASTEXITCODE -ne 0) { Write-Host "Frontend Build Failed" -ForegroundColor Red; exit 1 }
# cd ..

# 3. Build and Push Container
Write-Host "Building container image..."
# Fix: Using cloudbuild.yaml ensures build-args are passed correctly
gcloud builds submit --config cloudbuild.yaml --substitutions="_IMAGE_NAME=$IMAGE_NAME,_VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Cloud Build failed! Exiting." -ForegroundColor Red
    exit 1
}

# 4. Deploy to Cloud Run with FULL ENV VARS
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --add-cloudsql-instances $DB_INSTANCE `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "DB_USER=postgres" `
    --set-env-vars "DB_PASSWORD=$DB_PASSWORD" `
    --set-env-vars "DB_NAME=postgres" `
    --set-env-vars "DB_SOCKET_PATH=/cloudsql/$DB_INSTANCE" `
    --set-env-vars "GROK_API_KEY=$GROK_API_KEY" `
    --set-env-vars "VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY" `
    --set-env-vars "GOOGLE_ADVANCED_API_KEY=$GOOGLE_ADVANCED_KEY" `
    --set-env-vars "JWT_SECRET=$JWT_SECRET" `
    --set-env-vars "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" `
    --memory 2048Mi `
    --cpu 2 `
    --timeout 600

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "URL: https://master-diary-app-v2-379274939684.us-central1.run.app"
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
