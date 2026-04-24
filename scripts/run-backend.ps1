$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "BE"

. (Join-Path $PSScriptRoot "load-root-env.ps1")

Push-Location $backendDir
try {
    Write-Host "Building backend jar..."
    & .\mvnw.cmd -DskipTests package
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    $jarPath = Join-Path $backendDir "target\MovieSWP-0.0.1-SNAPSHOT.jar"
    if (-not (Test-Path $jarPath)) {
        throw "Backend jar not found at $jarPath"
    }

    Write-Host "Starting backend on http://localhost:8080 ..."
    & java -jar $jarPath
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
