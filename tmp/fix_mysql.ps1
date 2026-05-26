$xamppPath = "C:\xampp\mysql"
$oldData = "$xamppPath\data"
$backupData = "$xamppPath\data_old"
$backupFolder = "$xamppPath\backup"

Write-Host "Stopping mysqld if running..."
Stop-Process -Name "mysqld" -ErrorAction SilentlyContinue -Force

if (Test-Path $oldData) {
    if (Test-Path $backupData) {
        Write-Host "Removing existing data_old..."
        Remove-Item -Recurse -Force $backupData
    }
    Write-Host "Renaming data to data_old..."
    Rename-Item -Path $oldData -NewName "data_old"
}

Write-Host "Copying backup to data..."
Copy-Item -Path $backupFolder -Destination $oldData -Recurse

Write-Host "Copying databases from data_old to data..."
$excludeDirs = @("mysql", "performance_schema", "phpmyadmin", "test")
$dirs = Get-ChildItem -Path $backupData -Directory
foreach ($dir in $dirs) {
    if ($excludeDirs -notcontains $dir.Name) {
        Write-Host "Copying database $($dir.Name)..."
        Copy-Item -Path $dir.FullName -Destination "$oldData\$($dir.Name)" -Recurse
    }
}

Write-Host "Copying ibdata1..."
Copy-Item -Path "$backupData\ibdata1" -Destination "$oldData\ibdata1" -Force

Write-Host "MySQL data directory fixed successfully."
