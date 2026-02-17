# PowerShell script to delete all unnecessary documentation files
Write-Host "Cleaning up unnecessary files..." -ForegroundColor Yellow
Write-Host ""

$basePath = "C:\Users\vrajr\Desktop\Store_management"
$filesDeleted = 0

# Delete all emoji-prefixed troubleshooting files
$patterns = @(
    "▶️_*", "⚡_*", "✅_*", "⭐_*", "🌟_*", "🎉_*", "🎨_*", 
    "🎬_*", "🎯_*", "📊_*", "📋_*", "📌_*", "📖_*", "📱_*", 
    "🔍_*", "🔥_*", "🔧_*", "🚀_*", "🚨_*", "🆘_*"
)

foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path $basePath -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        if ($file.Name -ne "🚀_COMPLETE_SETUP_AND_START.bat") {
            Remove-Item $file.FullName -Force
            $filesDeleted++
            Write-Host "Deleted: $($file.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "✅ Cleanup complete! Deleted $filesDeleted files" -ForegroundColor Green
Write-Host ""
Write-Host "Essential files kept:" -ForegroundColor Cyan
Write-Host "  Documentation:" -ForegroundColor White
Write-Host "    • README.md"
Write-Host "    • DEPLOYMENT.md"
Write-Host "    • SETUP_GUIDE.md"
Write-Host "    • API_DOCUMENTATION.md"
Write-Host "    • DESIGN_SYSTEM.md"
Write-Host "    • DOCKER_GUIDE.md"
Write-Host "    • MARKETING_AUTOMATION.md"
Write-Host "    • MULTI_STORE_FEATURE.md"
Write-Host "    • RBAC_PERMISSIONS.md"
Write-Host "    • TROUBLESHOOTING.md"
Write-Host "    • TEST_API.md"
Write-Host ""
Write-Host "  Scripts:" -ForegroundColor White
Write-Host "    • START_BACKEND.bat"
Write-Host "    • START_FRONTEND.bat"  
Write-Host "    • START_BOTH_SERVERS.bat"
Write-Host "    • SETUP_DATABASE.bat"
Write-Host "    • 🚀_COMPLETE_SETUP_AND_START.bat"
Write-Host "    • PUSH_TO_GITHUB.bat"
Write-Host ""
