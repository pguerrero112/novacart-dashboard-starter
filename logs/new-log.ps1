# new-log.ps1
# Run this at the start of each work session to create a fresh dated log file.
# Usage: ./logs/new-log.ps1
# Usage with initial note: ./logs/new-log.ps1 -Note "Started feature X"

param(
    [string]$Note = ""
)

$date     = Get-Date -Format "yyyy-MM-dd"
$time     = Get-Date -Format "HH:mm"
$logFile  = Join-Path $PSScriptRoot "$date.md"

if (-not (Test-Path $logFile)) {
    $header = @"
# Session Log — $date

"@
    Set-Content -Path $logFile -Value $header -Encoding UTF8
    Write-Host "Created $logFile"
} else {
    Write-Host "Appending to existing $logFile"
}

if ($Note) {
    $entry = @"

## [$date $time] $Note

"@
    Add-Content -Path $logFile -Value $entry -Encoding UTF8
    Write-Host "Added note: $Note"
}

Write-Host "Log ready: $logFile"
