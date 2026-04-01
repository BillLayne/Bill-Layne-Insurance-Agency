$pages = @(
    @{ url = "https://billlayneinsurance.com"; name = "Homepage" },
    @{ url = "https://billlayneinsurance.com/contact-us"; name = "Contact Us (indigo)" },
    @{ url = "https://billlayneinsurance.com/home-insurance"; name = "Home Insurance (teal)" },
    @{ url = "https://billlayneinsurance.com/blog"; name = "Blog Index" }
)

$pass = 0
$fail = 0

foreach ($page in $pages) {
    Write-Host "`n--- $($page.name) ---"
    try {
        $r = Invoke-WebRequest -Uri $page.url -UseBasicParsing -TimeoutSec 15
        $html = $r.Content

        # Check: no CDN reference
        if ($html -match "cdn\.tailwindcss\.com") {
            Write-Host "  [FAIL] Still has CDN reference!" -ForegroundColor Red
            $fail++
        } else {
            Write-Host "  [PASS] No CDN reference" -ForegroundColor Green
            $pass++
        }

        # Check: has compiled CSS link
        if ($html -match "tailwind-output\.css") {
            Write-Host "  [PASS] Has compiled CSS link" -ForegroundColor Green
            $pass++
        } else {
            Write-Host "  [FAIL] Missing compiled CSS link!" -ForegroundColor Red
            $fail++
        }

        # Check: no inline tailwind.config
        if ($html -match "tailwind\.config\s*=") {
            Write-Host "  [FAIL] Still has inline config!" -ForegroundColor Red
            $fail++
        } else {
            Write-Host "  [PASS] No inline config" -ForegroundColor Green
            $pass++
        }

        # Homepage-specific: visible H1
        if ($page.name -eq "Homepage") {
            if ($html -match "Elkin, NC Independent Insurance Agency</h1>") {
                Write-Host "  [PASS] H1 tag present" -ForegroundColor Green
                $pass++
            } else {
                Write-Host "  [FAIL] H1 tag missing!" -ForegroundColor Red
                $fail++
            }
            if ($html -match "sr-only.*Elkin, NC Independent") {
                Write-Host "  [FAIL] H1 still sr-only!" -ForegroundColor Red
                $fail++
            } else {
                Write-Host "  [PASS] H1 is visible (not sr-only)" -ForegroundColor Green
                $pass++
            }
        }

        # Indigo page check
        if ($page.name -match "indigo") {
            if ($html -match "indigo-600") {
                Write-Host "  [PASS] Has indigo-600 classes" -ForegroundColor Green
                $pass++
            } else {
                Write-Host "  [FAIL] Missing indigo classes!" -ForegroundColor Red
                $fail++
            }
        }

        # Teal page check
        if ($page.name -match "teal") {
            if ($html -match "teal-600") {
                Write-Host "  [PASS] Has teal-600 classes" -ForegroundColor Green
                $pass++
            } else {
                Write-Host "  [FAIL] Missing teal classes!" -ForegroundColor Red
                $fail++
            }
        }
    }
    catch {
        Write-Host "  [ERR] $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
}

Write-Host "`n=== Results: $pass PASS, $fail FAIL ==="
