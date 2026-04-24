$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot "FE"

Push-Location $frontendDir
try {
    Write-Host "Starting frontend on http://localhost:5173 ..."
    & npm.cmd run dev
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
