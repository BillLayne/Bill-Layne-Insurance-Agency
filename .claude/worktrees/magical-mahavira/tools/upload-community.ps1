$dir = "C:\Users\bill\Downloads\community page\surry-county\assets"
$clientId = "546c25a59c58ad7"

$files = @(
    "pilot-mountain.png",
    "yadkin-valley.png",
    "mount-airy.png",
    "elkin-reeves.png",
    "pilot-summit.png",
    "mount-airy-street.png",
    "elkin-crater-park.png",
    "shelton.png",
    "jolo.png",
    "round-peak.png",
    "bill-layne.png"
)

foreach ($file in $files) {
    $path = Join-Path $dir $file
    $size = [math]::Round((Get-Item $path).Length / 1024, 1)
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file)
    Write-Host "Uploading $name ($size KB)..." -NoNewline

    $bytes = [System.IO.File]::ReadAllBytes($path)
    $base64 = [Convert]::ToBase64String($bytes)

    $headers = @{ Authorization = "Client-ID $clientId" }
    $body = @{ image = $base64; type = "base64"; name = $name }

    try {
        $response = Invoke-RestMethod -Uri "https://api.imgur.com/3/image" -Method Post -Headers $headers -Body $body
        $link = $response.data.link
        Write-Host " -> $link"
    } catch {
        Write-Host " FAILED: $($_.Exception.Message)"
    }
}
