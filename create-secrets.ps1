# Create Secrets in Google Cloud Secret Manager
# Replace YOUR_GEMINI_API_KEY with your actual API key

$GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"  # REPLACE THIS
$MONGODB_URI = "YOUR_MONGODB_CONNECTION_STRING"  # REPLACE THIS

# Refresh environment path
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Creating Gemini API Key secret..." -ForegroundColor Green
echo $GEMINI_API_KEY | gcloud secrets create gemini-api-key --data-file=-

Write-Host "Creating MongoDB URI secret..." -ForegroundColor Green
echo $MONGODB_URI | gcloud secrets create mongodb-uri --data-file=-

Write-Host "Secrets created successfully!" -ForegroundColor Green
