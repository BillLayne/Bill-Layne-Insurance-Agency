$headers = @{ "Cache-Control" = "no-cache"; "Pragma" = "no-cache" }
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$pages = @(
    @{ url = "https://billlayneinsurance.com/?t=$ts"; name = "Homepage" },
    @{ url = "https://billlayneinsurance.com/contact-us?t=$ts"; name = "Contact Us" },
    @{ url = "https://billlayneinsurance.com/home-insurance/?t=$ts"; name = "Home Insurance" },
    @{ url = "https://billlayneinsurance.com/blog/?t=$ts"; name = "Blog Index" }
)

foreach ($page in $pages) {
    Write-Host "`n--- $($page.name) ---"
    try {
        $r = Invoke-WebRequest -Uri $page.url -Headers $headers -UseBasicParsing -TimeoutSec 15
        $html = $r.Content

        $hasCDN = $html -match "<script[^>]*cdn\.tailwindcss\.com"
        $hasCSS = $html -match "tailwind-output\.css"
        $hasConfig = $html -match "tailwind\.config\s*="

        if (-not $hasCDN) { Write-Host "  [PASS] No CDN script" } else { Write-Host "  [FAIL] CDN script found" }
        if ($hasCSS) { Write-Host "  [PASS] Compiled CSS linked" } else { Write-Host "  [FAIL] No compiled CSS" }
        if (-not $hasConfig) { Write-Host "  [PASS] No inline config" } else { Write-Host "  [FAIL] Inline config found" }

        if ($page.name -eq "Homepage") {
            $h1Match = [regex]::Match($html, '<h1[^>]*>(.*?)</h1>', 'Singleline')
            if ($h1Match.Success) {
                $classes = [regex]::Match($h1Match.Value, 'class="([^"]*)"')
                Write-Host "  H1 text: $($h1Match.Groups[1].Value.Substring(0, [Math]::Min(60, $h1Match.Groups[1].Value.Length)))"
                if ($classes.Success) { Write-Host "  H1 classes: $($classes.Groups[1].Value)" }
            }
        }
    }
    catch {
        Write-Host "  [ERR] $($_.Exception.Message)"
    }
}
