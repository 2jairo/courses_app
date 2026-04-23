Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
	param([string]$Message)
	Write-Host "[startDev] $Message" -ForegroundColor Cyan
}

function Get-EnvValue {
	param(
		[Parameter(Mandatory = $true)][string]$FilePath,
		[Parameter(Mandatory = $true)][string]$Key
	)

	$pattern = "^$([regex]::Escape($Key))=(.*)$"
	foreach ($line in [System.IO.File]::ReadAllLines($FilePath)) {
		if ($line -match $pattern) {
			return $Matches[1].Trim()
		}
	}

	return $null
}

function Set-EnvValue {
	param(
		[Parameter(Mandatory = $true)][string]$FilePath,
		[Parameter(Mandatory = $true)][string]$Key,
		[Parameter(Mandatory = $true)][string]$Value
	)

	$lines = [System.Collections.Generic.List[string]]::new()
	$found = $false

	foreach ($line in [System.IO.File]::ReadAllLines($FilePath)) {
		if ($line -match "^$([regex]::Escape($Key))=") {
			$lines.Add("$Key=$Value")
			$found = $true
		}
		else {
			$lines.Add($line)
		}
	}

	if (-not $found) {
		$lines.Add("$Key=$Value")
	}

	[System.IO.File]::WriteAllLines($FilePath, $lines)
}

function Test-TcpPort {
	param(
		[Parameter(Mandatory = $true)][string]$TargetHost,
		[Parameter(Mandatory = $true)][int]$Port,
		[int]$TimeoutMs = 2000
	)

	$client = [System.Net.Sockets.TcpClient]::new()
	try {
		$task = $client.ConnectAsync($TargetHost, $Port)
		if (-not $task.Wait($TimeoutMs)) {
			return $false
		}

		return $client.Connected
	}
	catch {
		return $false
	}
	finally {
		$client.Dispose()
	}
}

function Wait-TcpPorts {
	param(
		[Parameter(Mandatory = $true)]$Checks,
		[int]$TimeoutSeconds = 180
	)

	$deadline = (Get-Date).AddSeconds($TimeoutSeconds)

	while ((Get-Date) -lt $deadline) {
		$allReady = $true

		foreach ($check in $Checks) {
			if (-not (Test-TcpPort -TargetHost $check.TargetHost -Port $check.Port)) {
				$allReady = $false
				break
			}
		}

		if ($allReady) {
			return
		}

		Start-Sleep -Seconds 2
	}

	$targets = $Checks | ForEach-Object { "$($_.TargetHost):$($_.Port)" }
	throw "Timeout while waiting for services: $($targets -join ', ')"
}

function Ensure-Command {
	param([Parameter(Mandatory = $true)][string]$Name)

	if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
		throw "Required command '$Name' was not found in PATH."
	}
}

function Escape-SingleQuotes {
	param([Parameter(Mandatory = $true)][string]$Value)
	return $Value.Replace("'", "''")
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerDir = Join-Path $projectRoot "docker"
$composeFile = Join-Path $dockerDir "docker-compose-databases.yaml"
$coreEnvPath = Join-Path $projectRoot "backend\A_core_service\.env.development"

$coreServiceDir = Join-Path $projectRoot "backend\A_core_service"
$identityServiceDir = Join-Path $projectRoot "backend\B_identity_service"
$mediaServiceDir = Join-Path $projectRoot "backend\C_media_service"
$frontendDir = Join-Path $projectRoot "frontend"

Ensure-Command -Name "docker"
Ensure-Command -Name "stripe"
Ensure-Command -Name "wt"

if (-not (Test-Path -LiteralPath $composeFile)) {
	throw "Compose file not found: $composeFile"
}

if (-not (Test-Path -LiteralPath $coreEnvPath)) {
	throw "Env file not found: $coreEnvPath"
}

Write-Step "Resetting database containers"
Push-Location $dockerDir
try {
	docker compose -f .\docker-compose-databases.yaml down
	docker compose -f .\docker-compose-databases.yaml up -d
}
finally {
	Pop-Location
}

Write-Step "Waiting for database ports to be ready"
Wait-TcpPorts -Checks @(
	@{ TargetHost = "localhost"; Port = 5432 },
	@{ TargetHost = "localhost"; Port = 5672 },
	@{ TargetHost = "localhost"; Port = 6379 },
	@{ TargetHost = "localhost"; Port = 8108 },
	@{ TargetHost = "localhost"; Port = 9000 }
) -TimeoutSeconds 180

Write-Step "Reading Stripe API key from A_core_service/.env.development"
$stripeApiKey = Get-EnvValue -FilePath $coreEnvPath -Key "STRIPE_API_SK"
if ([string]::IsNullOrWhiteSpace($stripeApiKey)) {
	throw "STRIPE_API_SK not found in $coreEnvPath"
}

Write-Step "Fetching webhook signing secret from Stripe CLI"
$stripeWhsec = (& stripe listen --forward-to "http://localhost:3000/webhook" --skip-verify --api-key $stripeApiKey --print-secret 2>$null | Select-Object -First 1)
if ([string]::IsNullOrWhiteSpace($stripeWhsec)) {
	throw "Unable to get webhook signing secret from Stripe CLI."
}

Set-EnvValue -FilePath $coreEnvPath -Key "STRIPE_API_WHSEC" -Value $stripeWhsec.Trim()
Write-Step "Updated STRIPE_API_WHSEC in backend/A_core_service/.env.development"

$escapedStripeApiKey = Escape-SingleQuotes -Value $stripeApiKey

$stripeCmd = "stripe listen --forward-to http://localhost:3000/webhook --skip-verify --api-key '$escapedStripeApiKey'"
$coreCmd = "air"
$identityCmd = "cargo watch -x run"
$mediaCmd = "cargo watch -x run"
$frontendCmd = "pnpm dev"

Write-Step "Opening Windows Terminal with 2 rows (3 top, 2 bottom)"
wt -w 0 new-tab -d $projectRoot pwsh -NoExit -Command $stripeCmd `
	";" split-pane -H -d $mediaServiceDir pwsh -NoExit -Command $mediaCmd `
	";" move-focus up `
	";" split-pane -V -s 0.67 -d $coreServiceDir pwsh -NoExit -Command $coreCmd `
	";" move-focus right `
	";" split-pane -V -s 0.5 -d $identityServiceDir pwsh -NoExit -Command $identityCmd `
	";" move-focus down `
	";" split-pane -V -d $frontendDir pwsh -NoExit -Command $frontendCmd

Write-Step "Dev environment started"