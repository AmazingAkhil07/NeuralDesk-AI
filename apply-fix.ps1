#!/usr/bin/env pwsh
# Apply the duplicate models fix

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  NeuralDesk - Fix Duplicate Models" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "This script will help you apply the fix for duplicate model cards.`n" -ForegroundColor Yellow

Write-Host "What this fix does:" -ForegroundColor Green
Write-Host "  ✓ Removes duplicate models (keeps newest version)" -ForegroundColor White
Write-Host "  ✓ Adds database constraint to prevent future duplicates" -ForegroundColor White
Write-Host "  ✓ Updates sync logic to use upsert (insert or update)" -ForegroundColor White
Write-Host "  ✓ Orders models by latest update date`n" -ForegroundColor White

Write-Host "Choose your method:`n" -ForegroundColor Yellow

Write-Host "[1] Supabase CLI (Recommended)" -ForegroundColor Cyan
Write-Host "    - Automatically applies migration" -ForegroundColor Gray
Write-Host "    - Requires: supabase CLI installed and linked`n" -ForegroundColor Gray

Write-Host "[2] Manual SQL" -ForegroundColor Cyan
Write-Host "    - Copy/paste SQL into Supabase dashboard" -ForegroundColor Gray
Write-Host "    - No CLI needed`n" -ForegroundColor Gray

$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "`nChecking Supabase CLI..." -ForegroundColor Yellow
    
    $supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
    
    if (-not $supabaseInstalled) {
        Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
        Write-Host "`nInstall it with:" -ForegroundColor Yellow
        Write-Host "  npm install -g supabase" -ForegroundColor White
        Write-Host "  or: https://supabase.com/docs/guides/cli`n" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✓ Supabase CLI found`n" -ForegroundColor Green
    
    # Navigate to project directory
    Set-Location -Path "$PSScriptRoot\neuraldesk-app"
    
    Write-Host "Running migration..." -ForegroundColor Yellow
    Write-Host "Command: supabase db push`n" -ForegroundColor Gray
    
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Migration applied successfully!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "  1. Refresh your NeuralDesk app" -ForegroundColor White
        Write-Host "  2. Click 'Sync Latest Models' button" -ForegroundColor White
        Write-Host "  3. Verify duplicates are gone`n" -ForegroundColor White
    } else {
        Write-Host "`n❌ Migration failed!" -ForegroundColor Red
        Write-Host "Try the manual method instead (option 2)`n" -ForegroundColor Yellow
    }
    
} elseif ($choice -eq "2") {
    Write-Host "`nManual SQL Method`n" -ForegroundColor Yellow
    
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "1. Open Supabase Dashboard" -ForegroundColor White
    Write-Host "   → Your Project → SQL Editor`n" -ForegroundColor Gray
    
    Write-Host "2. Create New Query" -ForegroundColor White
    Write-Host "   → Click 'New query' button`n" -ForegroundColor Gray
    
    Write-Host "3. Copy the SQL migration" -ForegroundColor White
    Write-Host "   File: neuraldesk-app\supabase\003_fix_duplicate_models.sql`n" -ForegroundColor Gray
    
    Write-Host "4. Paste and Run" -ForegroundColor White
    Write-Host "   → Paste SQL into editor → Click 'Run'`n" -ForegroundColor Gray
    
    Write-Host "5. Verify Success" -ForegroundColor White
    Write-Host "   → Go to Table Editor → models" -ForegroundColor Gray
    Write-Host "   → Should see no more duplicates`n" -ForegroundColor Gray
    
    # Open the SQL file
    $sqlPath = "$PSScriptRoot\neuraldesk-app\supabase\003_fix_duplicate_models.sql"
    
    Write-Host "Opening SQL file..." -ForegroundColor Yellow
    Start-Process notepad $sqlPath
    
    Write-Host "`n✓ SQL file opened in Notepad" -ForegroundColor Green
    Write-Host "Copy the content and paste into Supabase SQL Editor`n" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Invalid choice. Please run again and select 1 or 2.`n" -ForegroundColor Red
    exit 1
}

Write-Host "================================================`n" -ForegroundColor Cyan
Write-Host "Need help? Check FIX_DUPLICATE_MODELS.md`n" -ForegroundColor Gray
