# Quick Redeploy Script for CareerPilot AI
# This script rebuilds and redeploys your app to Google Cloud Run

Write-Host "🚀 Starting CareerPilot AI Redeployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Build and push Docker image
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/careerpilot-ai-489008/careerpilot-ai

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy to Cloud Run
Write-Host "🌐 Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy careerpilot-ai `
    --image gcr.io/careerpilot-ai-489008/careerpilot-ai `
    --platform managed `
    --region us-central1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your app is live at: https://careerpilot-ai-895202998984.us-central1.run.app" -ForegroundColor Cyan
