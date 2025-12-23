function Load-Env {
    param (
        [string]$Path = ".env"
    )

    if (-not (Test-Path $Path)) {
        Write-Warning "Cannot find $Path"
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ($line -ne "" -and -not $line.StartsWith("#")) {
            $name, $value = $line -split '=', 2

            if ($name -and $value) {
                $name = $name.Trim()
                $value = $value.Trim().Trim('"').Trim("'")

                # 환경 변수 설정
                Set-Item -Path "env:$name" -Value $value
            }
        }
    }
    Write-Host "Environment variables loaded from $Path" -ForegroundColor Green
}

Load-Env