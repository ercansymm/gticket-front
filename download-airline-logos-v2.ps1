# ============================================================
# GBILET - Havayolu Logolarini Toplu Indirici (v2)
# Kaynak: pics.avs.io (Aviasales CDN) - 403 vermez, yuksek kaliteli
# Kullanim: PowerShell'i gticket-front klasorunde ac,
#          sonra: .\download-airline-logos.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$ProgressPreference    = "SilentlyContinue"

# Hedef klasor (Next.js public klasoru altinda)
$targetDir = "public\airlines"

# Klasor yoksa olustur
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "[+] Klasor olusturuldu: $targetDir" -ForegroundColor Green
}

# IATA kod listesi
$codesFile = Join-Path $PSScriptRoot "airlines.txt"
if (-not (Test-Path $codesFile)) {
    Write-Host "[!] airlines.txt bulunamadi. Script ile ayni klasorde olmali." -ForegroundColor Red
    exit 1
}

$codes = Get-Content $codesFile | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim().ToUpper() }

Write-Host "`n[*] Toplam $($codes.Count) havayolu logosu indirilecek...`n" -ForegroundColor Cyan

# Tarayici gibi gorunen User-Agent (403'u onler)
$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    "Accept"     = "image/png,image/*,*/*;q=0.8"
}

$success = 0
$failed  = 0
$skipped = 0

foreach ($code in $codes) {
    $outFile = Join-Path $targetDir "$code.png"

    # Zaten varsa atla
    if (Test-Path $outFile) {
        Write-Host "  [=] $code  (zaten var)" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    # pics.avs.io - Aviasales CDN, yuksek cozunurluklu (200x200 @2x = 400x400 retina)
    $url = "https://pics.avs.io/200/200/${code}@2x.png"

    try {
        Invoke-WebRequest -Uri $url -OutFile $outFile -TimeoutSec 15 -UseBasicParsing -Headers $headers

        # Dosya boyutu cok kucukse (placeholder), sil
        $size = (Get-Item $outFile).Length
        if ($size -lt 500) {
            Remove-Item $outFile -Force
            Write-Host "  [x] $code  (logo bulunamadi, placeholder silindi)" -ForegroundColor Yellow
            $failed++
        } else {
            Write-Host "  [+] $code  ($([math]::Round($size/1KB,1)) KB)" -ForegroundColor Green
            $success++
        }
    }
    catch {
        Write-Host "  [x] $code  (indirilemedi: $($_.Exception.Message))" -ForegroundColor Yellow
        $failed++
    }

    Start-Sleep -Milliseconds 100
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TAMAMLANDI" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Basarili : $success" -ForegroundColor Green
Write-Host "  Atlanan  : $skipped" -ForegroundColor DarkGray
Write-Host "  Basarisiz: $failed"  -ForegroundColor Yellow
Write-Host "`n  Logolar: $targetDir`n" -ForegroundColor Cyan
