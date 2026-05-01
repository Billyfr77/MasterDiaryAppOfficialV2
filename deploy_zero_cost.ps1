# deploy_zero_cost.ps1
# MasterDiaryApp Official - "Dark Site" Hibernation Script
# GOAL: $0.00 Daily Bleed

$PROJECT_ID = "gen-lang-client-0889466012"
$REGION = "us-central1"
$SERVICE_NAME = "master-diary-app-v2"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# --- CONFIGURATION (Minimal for Hibernation) ---
$GROK_API_KEY=$env:GROK_API_KEY
$GOOGLE_MAPS_KEY=$env:GOOGLE_MAPS_KEY
$JWT_SECRET=$env:JWT_SECRET

Write-Host "🚀 INITIATING ZERO-COST HIBERNATION..." -ForegroundColor Cyan

# 1. Build and Push (Ensuring latest code is up)
Write-Host "Building container image..."
gcloud builds submit --config cloudbuild.yaml --substitutions="_IMAGE_NAME=$IMAGE_NAME,_VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY" .

if ($LASTEXITCODE -ne 0) { exit 1 }

# 2. Deploy to Cloud Run (SWAPPING POSTGRES FOR SQLITE)
# NOTE: We REMOVED --add-cloudsql-instances
# NOTE: We REDUCED CPU and MEMORY
# NOTE: We set MIN-INSTANCES to 0
Write-Host "Deploying to Cloud Run in ZERO-COST Mode..."
gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "DB_DIALECT=sqlite" `
    --set-env-vars "DB_STORAGE=/tmp/database.sqlite" `
    --set-env-vars "GROK_API_KEY=$GROK_API_KEY" `
    --set-env-vars "VITE_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_KEY" `
    --set-env-vars "JWT_SECRET=$JWT_SECRET" `
    --set-env-vars "JWT_REFRESH_SECRET=$JWT_SECRET" `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 1 `
    --timeout 300

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ HIBERNATION ACTIVE!" -ForegroundColor Green
    Write-Host "1. Cloud Run is now set to scale to ZERO ($0 when not in use)." -ForegroundColor Yellow
    Write-Host "2. The database is now SQLite ($0 cost)." -ForegroundColor Yellow
    Write-Host "3. IMPORTANT: You can now SAFELY DELETE your Cloud SQL instance 'master-diary-db' to stop the $170/mo bleed." -ForegroundColor Red
    Write-Host "4. To go back to Postgres later, just run your original 'deploy_full_fixed.ps1'." -ForegroundColor Cyan
}
