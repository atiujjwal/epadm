param(
  [Parameter(Mandatory=$true)]
  [string]$BackupPath,
  [string]$RestoreDatabase = "epadm_dr_test"
)

if (-not (Test-Path -LiteralPath $BackupPath)) {
  throw "Backup file not found: $BackupPath"
}

pg_restore --list $BackupPath | Select-Object -Last 5
Write-Host "Backup is readable. To complete verification, restore into $RestoreDatabase in a safe staging environment."
