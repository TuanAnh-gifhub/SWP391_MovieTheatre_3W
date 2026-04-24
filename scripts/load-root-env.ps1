param(
    [string]$EnvPath = (Join-Path (Split-Path -Parent $PSScriptRoot) ".env")
)

if (-not (Test-Path $EnvPath)) {
    Write-Host "No root .env file found at $EnvPath. Continuing without loading extra environment variables."
    return
}

Get-Content $EnvPath | ForEach-Object {
    if ($_ -match '^\s*(#.*)?$') {
        return
    }

    $parts = $_ -split '=', 2
    if ($parts.Count -ne 2) {
        return
    }

    $name = $parts[0].Trim()
    $value = $parts[1]
    [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
}

Write-Host "Loaded environment variables from $EnvPath"
