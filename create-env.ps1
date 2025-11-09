# PowerShell script to create .env file
# Run this script: .\create-env.ps1

$envContent = @"
# Supabase Configuration
# Get these values from your Supabase project dashboard: https://supabase.com/dashboard
# Project ID: wteaucwbkwzirhpnxqmk

VITE_SUPABASE_URL=https://wteaucwbkwzirhpnxqmk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZWF1Y3dia3d6aXJocG54cW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODUwOTgsImV4cCI6MjA3ODI2MTA5OH0.57skGDdDw7nvfF3Zoit2W8xNsCbYQHk9_-f0omEEUqE

# Optional: For book recommendations function (if using Lovable AI)
# LOVABLE_API_KEY=your-lovable-api-key-here
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host "Please edit .env and add your Supabase credentials." -ForegroundColor Yellow

