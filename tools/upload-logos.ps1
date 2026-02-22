$dir = "C:\Users\bill\AppData\Local\Temp\logo-optimize"
$clientId = "546c25a59c58ad7"

$files = @(
    @{name="nationwide"; file="nationwide-opt.png"},
    @{name="progressive"; file="progressive-opt.png"},
    @{name="travelers"; file="travelers-opt.png"},
    @{name="national-general"; file="national-general-opt.png"},
    @{name="alamance"; file="alamance-opt.png"},
    @{name="rosa"; file="rosa-opt.jpg"}
)

foreach ($item in $files) {
    $path = Join-Path $dir $item.file
    $size = [math]::Round((Get-Item $path).Length / 1024, 1)
    Write-Host "Uploading $($item.name) ($size KB)..." -NoNewline

    $response = Invoke-RestMethod -Uri "https://api.imgur.com/3/image" `
        -Method Post `
        -Headers @{Authorization = "Client-ID $clientId"} `
        -Form @{image = Get-Item $path}

    $link = $response.data.link
    Write-Host " -> $link"
}
