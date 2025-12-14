# Deploy MasterDiaryAppOfficialV2 to Cloud Run

$PROJECT_ID = "gen-lang-client-0889466012"
$REGION = "us-central1"
$SERVICE_NAME = "master-diary-app-v2"
$DB_INSTANCE = "gen-lang-client-0889466012:us-central1:master-diary-db"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "Starting Deployment for $SERVICE_NAME..." -ForegroundColor Green

# 1. Set Project
Write-Host "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 2. Build and Push Container
Write-Host "Building container image (this may take a few minutes)..."
# Using --timeout to prevent early timeout on large builds
# Passing the Maps API Key as a build argument for the frontend via cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml --timeout=20m "--substitutions=_IMAGE_NAME=$IMAGE_NAME,_VITE_GOOGLE_MAPS_API_KEY=AIzaSyDBIZJ9PFDn8SZL1_y3nfUFkGZyyxb5IwA" .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Exiting." -ForegroundColor Red
    exit 1
}

# 3. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
# We use DB_SOCKET_PATH for the Unix socket connection which is standard for Cloud Run -> Cloud SQL
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --add-cloudsql-instances $DB_INSTANCE `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "DB_USER=postgres" `
    --set-env-vars "DB_PASSWORD=MasterDiary2025!" `
    --set-env-vars "DB_NAME=postgres" `
    --set-env-vars "DB_SOCKET_PATH=/cloudsql/$DB_INSTANCE" `
    --set-env-vars "JWT_SECRET=masterdiary_jwt_secret_prod_9988" `
    --set-env-vars "JWT_REFRESH_SECRET=masterdiary_jwt_refresh_secret_prod_9988" `
    --memory 1024Mi `
    --cpu 1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "You should be able to access the app at the URL provided above."
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
