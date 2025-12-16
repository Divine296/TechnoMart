param(
    [ValidateSet("up", "down", "stop", "logs", "migrate", "shell", "createsuperuser", "bootstrap-admin")]
    [string]$Command = "up",
    [string]$Args
)

$ErrorActionPreference = "Stop"

function Invoke-DockerCompose {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$ComposeArgs
    )

    Write-Host "[docker compose] $($ComposeArgs -join ' ')" -ForegroundColor Cyan
    & docker compose @ComposeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose command failed with exit code $LASTEXITCODE"
    }
}

switch ($Command) {
    "up" {
        Invoke-DockerCompose -ComposeArgs @("up", "--build")
    }
    "down" {
        Invoke-DockerCompose -ComposeArgs @("down", "-v")
    }
    "stop" {
        Invoke-DockerCompose -ComposeArgs @("stop")
    }
    "logs" {
        $service = if ($Args) { $Args } else { "api" }
        Invoke-DockerCompose -ComposeArgs @("logs", "-f", $service)
    }
    "migrate" {
        Invoke-DockerCompose -ComposeArgs @("exec", "api", "python", "manage.py", "migrate")
    }
    "shell" {
        Invoke-DockerCompose -ComposeArgs @("exec", "api", "python", "manage.py", "shell")
    }
    "createsuperuser" {
        Invoke-DockerCompose -ComposeArgs @("exec", "api", "python", "manage.py", "createsuperuser")
    }
    "bootstrap-admin" {
        if (-not $Args) {
            throw "Pass arguments after --Args, e.g. -Args '--email admin@example.com --password change-me'"
        }
        $commandArgs = @("exec", "api", "python", "manage.py", "bootstrap_admin") + $Args.Split(' ')
        Invoke-DockerCompose -ComposeArgs $commandArgs
    }
}
