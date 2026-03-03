# Deploy CareerPilot AI to Google Cloud Run
# This script handles the complete deployment process

# Refresh environment path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CareerPilot AI - Cloud Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if secrets exist
Write-Host "Checking secrets..." -ForegroundColor Yellow
$secretsExist = $true
try {
    gcloud secrets describe gemini-api-key --quiet 2>$null
    gcloud secrets describe mongodb-uri --quiet 2>$null
} catch {
    $secretsExist = $false
}

if (-not $secretsExist) {
    Write-Host "ERROR: Secrets not found!" -ForegroundColor Red
    Write-Host "Please run create-secrets.ps1 first with your Gemini API key" -ForegroundColor Red
    exit 1
}

Write-Host "Secrets found!" -ForegroundColor Green
Write-Host ""

# Submit build to Cloud Build
Write-Host "Starting Cloud Build deployment..." -ForegroundColor Yellow
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Build Docker container" -ForegroundColor White
Write-Host "  2. Push to Container Registry" -ForegroundColor White
Write-Host "  3. Deploy to Cloud Run" -ForegroundColor White
Write-Host ""
Write-Host "This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

gcloud builds submit --config cloudbuild.yaml

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Get the service URL
    Write-Host "Getting your application URL..." -ForegroundColor Yellow
    $url = gcloud run services describe careerpilot-ai --region us-central1 --format 'value(status.url)'
    
    Write-Host ""
    Write-Host "Your application is live at:" -ForegroundColor Green
    Write-Host $url -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can also view it in the Cloud Console:" -ForegroundColor White
    Write-Host "https://console.cloud.google.com/run?project=careerpilot-ai-489008" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Deployment Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "You can view detailed logs at:" -ForegroundColor White
    Write-Host "https://console.cloud.google.com/cloud-build/builds?project=careerpilot-ai-489008" -ForegroundColor Cyan
}
