Write-Host "Stopping any running Node.js processes..."
Get-Process | Where-Object { $_.ProcessName -eq "node" -or $_.ProcessName -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Removing node_modules and package-lock.json..."
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .vscode/.vite -ErrorAction SilentlyContinue

Write-Host "Cleaning npm cache..."
npm cache clean --force

Write-Host "Installing dependencies..."
npm install

Write-Host "Cleanup and reinstallation complete!"
