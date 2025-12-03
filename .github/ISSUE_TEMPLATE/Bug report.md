---
name: "🐞 Bug Report"
about: "Report a bug to help us improve the project"
title: "[BUG] — "
labels: bug
assignees: ""
---Write-Host "Starting safe restructure..." -ForegroundColor Cyan

function SafeMove($source, $destination) {
    if (Test-Path $source) {
        # If moving a folder, just create destination folder if missing
        if (!(Test-Path $destination)) {
            New-Item -ItemType Directory -Path $destination | Out-Null
        }
        Move-Item -Path $source -Destination $destination -Force
        Write-Host "Moved: $source -> $destination"
    } else {
        Write-Host "Skipped (not found): $source"
    }
}

# Create cleaned folders
$folders = @(
    "public",
    "public\images",
    "public\fonts",
    "public\css",
    "src",
    "src\js",
    "src\tests",
    "src\utils",
    "backend",
    "backend\fontforge",
    "capture-image"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
    }
}

# Move folders (existing ones only)
SafeMove ".\canvapage\fonts" "public\fonts"
SafeMove ".\canvapage\css" "public\css"
SafeMove ".\js" "src\js"
SafeMove ".\canvapage\js\utils" "src\utils"
SafeMove ".\canvapage\tests" "src\tests"
SafeMove ".\image" "public\images"
SafeMove ".\captureimg" "capture-image"
SafeMove ".\fontforge_backend" "backend\fontforge"

Write-Host "Restructure Complete!" -ForegroundColor Green

What you expected to happen.

## 📸 Screenshots / Videos
If applicable, add media to help explain the problem.

## 🧪 Environment
| Detail | Info |
|--------|------|
| Browser |  |
| OS |  |
| Device |  |
| Version |  |

## 💡 Additional Context
Add any other relevant context.
