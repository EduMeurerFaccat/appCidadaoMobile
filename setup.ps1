function Show-Tree {
    param (
        [string]$Path = ".",
        [int]$Indent = 0
    )

    Get-ChildItem -Path $Path | Where-Object { $_.Name -ne "node_modules" } | ForEach-Object {
        Write-Host (' ' * $Indent) + "|-- " + $_.Name
        if ($_.PSIsContainer) {
            Show-Tree -Path $_.FullName -Indent ($Indent + 4)
        }
    }
}

Show-Tree
