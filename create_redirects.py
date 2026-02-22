"""
Script to create HTML redirect files for 404 URLs from Google Search Console.
Bill Layne Insurance Agency - billlayneinsurance.com
"""
import os

BASE_DIR = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE"
DOMAIN = "https://www.billlayneinsurance.com"

def make_redirect(rel_path, dest_path):
    """Create a redirect HTML file at rel_path pointing to dest_path.
    Returns True if created, False if skipped (file already exists)."""
    full_path = os.path.join(BASE_DIR, rel_path.lstrip("/").replace("/", os.sep))

    # Don't overwrite existing files
    if os.path.exists(full_path):
        print(f"  SKIP (exists): {rel_path}")
        return False

    # Create parent directories
    parent = os.path.dirname(full_path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)

    canonical = DOMAIN + dest_path

    content = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url={dest_path}">
<link rel="canonical" href="{canonical}">
<title>Redirecting...</title>
</head>
<body>
<p>This page has moved. <a href="{dest_path}">Click here</a> if not redirected.</p>
</body>
</html>'''

    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  CREATED: {rel_path} -> {dest_path}")
    return True


def main():
    created = 0
    skipped = 0

    # =========================================================================
    # CATEGORY 1: Old /carriers/ URLs -> /auto-center/carriers/
    # =========================================================================
    print("\n=== CATEGORY 1: /carriers/ HTML redirects ===")

    carrier_html_redirects = [
        ("carriers/nationwide-north-carolina.html", "/auto-center/carriers/nationwide-north-carolina.html"),
        ("carriers/hagerty-north-carolina.html", "/auto-center/carriers/hagerty-north-carolina.html"),
        ("carriers/nc-grange-mutual.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
        ("carriers/travelers-north-carolina.html", "/auto-center/carriers/travelers-north-carolina.html"),
        ("carriers/progressive-north-carolina.html", "/auto-center/carriers/progressive-north-carolina.html"),
        ("carriers/foremost-north-carolina.html", "/auto-center/carriers/foremost-north-carolina.html"),
        ("carriers/national-general-north-carolina.html", "/auto-center/carriers/national-general-north-carolina.html"),
        ("carriers/nc-grange-north-carolina.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
        ("carriers/alamance-north-carolina.html", "/auto-center/carriers/alamance-north-carolina.html"),
        ("carriers/travelers-insurance.html", "/auto-center/carriers/travelers-north-carolina.html"),
        ("carriers/nc-grange-landing.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
    ]

    for src, dest in carrier_html_redirects:
        if make_redirect(src, dest):
            created += 1
        else:
            skipped += 1

    print("\n=== CATEGORY 1: /carriers/ directory redirects ===")

    carrier_dir_redirects = [
        ("carriers/nc-grange-north-carolina/index.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
        ("carriers/nationwide-north-carolina/index.html", "/auto-center/carriers/nationwide-north-carolina.html"),
        ("carriers/alamance-north-carolina/index.html", "/auto-center/carriers/alamance-north-carolina.html"),
        ("carriers/national-general-north-carolina/index.html", "/auto-center/carriers/national-general-north-carolina.html"),
        ("carriers/foremost-north-carolina/index.html", "/auto-center/carriers/foremost-north-carolina.html"),
        ("carriers/hagerty-north-carolina/index.html", "/auto-center/carriers/hagerty-north-carolina.html"),
        ("carriers/progressive-north-carolina/index.html", "/auto-center/carriers/progressive-north-carolina.html"),
        ("carriers/travelers-north-carolina/index.html", "/auto-center/carriers/travelers-north-carolina.html"),
    ]

    for src, dest in carrier_dir_redirects:
        if make_redirect(src, dest):
            created += 1
        else:
            skipped += 1

    # carriers/index.html -> /auto-center/carriers/
    print("\n=== CATEGORY 1: /carriers/index.html ===")
    if make_redirect("carriers/index.html", "/auto-center/carriers/"):
        created += 1
    else:
        skipped += 1

    # =========================================================================
    # CATEGORY 2: Old /post/ blog URLs -> /blog/blogs/ or /blog/
    # =========================================================================
    print("\n=== CATEGORY 2: /post/ blog redirects ===")

    post_redirects = [
        ("post/understanding-your-north-carolina-home-insurance-coverage-7-essential-protections-you-might-overloo/index.html", "/blog/"),
        ("post/elkin-nc-uncovered-quirky-facts-and-charming-oddities-of-a-small-town-gem/index.html", "/blog/"),
        ("post/why-your-insurance-rates-are-going-up-in-2024-what-north-carolina-residents-need-to-know/index.html", "/blog/blogs/nc-auto-insurance-increase-2025.html"),
        ("post/top-10-memorial-day-weekend-activities-in-north-carolina-your-2025-guide/index.html", "/blog/"),
        ("post/uncovering-elkin-s-famous-five-attractions-a-must-see-guide-for-visitors/index.html", "/blog/"),
        ("post/beyond-the-basics-unlocking-hidden-auto-insurance-discounts/index.html", "/blog/blogs/7-proven-ways-to-fight-rising-nc-auto-insurance-costs-a-guide-by-bill-layne-insurance.html"),
        ("post/which-2025-cars-offer-the-best-gas-mileage-check-out-the-top-5-picks/index.html", "/blog/"),
        ("post/5-genius-ways-progressive-makes-nc-drivers-save-big/index.html", "/blog/"),
        ("post/understanding-north-carolina-s-new-auto-liability-coverage-requirements-for-2025/index.html", "/blog/blogs/nc-auto-insurance-law-changes-2025-with-images.html"),
        ("post/why-did-my-insurance-rate-increase-after-filing-a-claim-in-elkin-nc/index.html", "/blog/blogs/north-carolina-drivers-why-your-auto-insurance-rates-might-go-up-after-a-comprehensive-claim-even-with-zero-points.html"),
        ("post/the-history-and-origins-of-april-fools-day-how-did-it-all-begin/index.html", "/blog/"),
        ("post/nc-liability-limits-are-jumping-to-50-100-50-here-s-what-that-means-for-your-wallet/index.html", "/blog/blogs/nc-auto-insurance-law-changes-2025-with-images.html"),
        ("post/why-shopping-local-for-insurance-matters-a-look-at-elkin-nc/index.html", "/blog/"),
        ("post/5-secrets-north-carolina-homeowners-use-to-slash-their-insurance-renewal-costs/index.html", "/blog/blogs/how-to-lower-north-carolina-homeowners-premiums-in-2026-following-the-latest-rate-hikes.html"),
        ("post/5-essential-tips-for-keeping-safe-when-you-hit-ice-while-driving/index.html", "/blog/"),
        ("post/are-you-falling-for-these-common-misconceptions-about-auto-insurance-in-elkin-nc-let-s-set-the-rec/index.html", "/blog/blogs/nc-insurance-myths-true-false-challenge.html"),
        ("post/top-10-surry-county-nc-events-you-can-t-miss-this-season/index.html", "/blog/blogs/surry-county-november-2025-events-blog.html"),
        ("post/nc-homeowners-insurance-rate-rising-5-proven-tips-to-save-money-now/index.html", "/blog/blogs/how-to-lower-north-carolina-homeowners-premiums-in-2026-following-the-latest-rate-hikes.html"),
        ("post/how-elkin-nc-drivers-are-saving-big-on-auto-insurance-this-year/index.html", "/blog/"),
        ("post/oem-glass-versus-aftermarket-glass-what-consumers-need-to-know/index.html", "/blog/blogs/toyota-does-not-make-glass-.html"),
        ("post/are-you-a-nonstandard-driver-lets-find-out/index.html", "/blog/"),
        ("post/5-reasons-to-bundle-your-auto-and-home-insurance/index.html", "/blog/"),
        ("post/does-car-insurance-cover-tire-damage/index.html", "/blog/blogs/what-is-collision-coverage-in-nc-a-north-carolina-drivers-essential-guide.html"),
        ("post/the-history-of-elkin-nc-a-journey-through-time/index.html", "/blog/"),
        ("post/do-i-need-full-coverage-auto-insurance/index.html", "/blog/blogs/what-is-collision-coverage-in-nc-a-north-carolina-drivers-essential-guide.html"),
        ("post/why-is-thanksgiving-the-perfect-time-to-review-your-auto-insurance-coverage-in-elkin-nc/index.html", "/blog/"),
        ("post/auto-insurance-discounts-in-nc-you-may-not-know-about/index.html", "/blog/blogs/7-proven-ways-to-fight-rising-nc-auto-insurance-costs-a-guide-by-bill-layne-insurance.html"),
        ("post/shopping-your-car-insurance-tips-and-tricks-for-elkin-nc-residents/index.html", "/blog/blogs/the-2026-guide-to-comparing-north-carolina-car-insurance-rates-bill-layne-insurance-standards.html"),
        ("post/understanding-your-auto-insurance-policy-what-do-all-those-terms-mean/index.html", "/blog/blogs/what-is-collision-coverage-in-nc-a-north-carolina-drivers-essential-guide.html"),
        ("post/common-misconceptions-about-auto-and-home-insurance/index.html", "/blog/blogs/nc-insurance-myths-true-false-challenge.html"),
        ("post/10-expensive-and-10-least-expensive-cars-to-insure-for-2023-which-one-is-right-for-you/index.html", "/blog/blogs/cheapest-cars-insure-nc.html"),
        ("post/20-crazy-real-life-insurance-claims/index.html", "/blog/"),
        ("post/what-happens-if-you-get-a-ticket-in-another-state/index.html", "/blog/blogs/nc-dmv-points-vs-insurance-points-2026-comparison-table.html"),
        ("post/the-ultimate-hack-for-getting-the-best-car-insurance-rates-in-nc/index.html", "/blog/blogs/the-2026-guide-to-comparing-north-carolina-car-insurance-rates-bill-layne-insurance-standards.html"),
        ("post/10-hidden-gem-festivals-in-nc-you-never-knew-you-needed/index.html", "/blog/"),
        ("post/expert-tips-for-lowering-your-auto-insurance-premiums/index.html", "/blog/blogs/7-proven-ways-to-fight-rising-nc-auto-insurance-costs-a-guide-by-bill-layne-insurance.html"),
        ("post/what-to-do-if-you-get-rejected-for-homeowners-insurance/index.html", "/blog/blogs/non-renewal-ghost.html"),
        ("post/how-to-spot-a-good-auto-and-home-insurance-company/index.html", "/blog/"),
        ("post/where-to-find-the-best-music-and-cocktails-top-5-nashville-bars/index.html", "/blog/"),
        ("post/safe-and-sound-navigating-thanksgiving-travels-with-the-right-auto-insurance-in-elkin-nc/index.html", "/blog/blogs/north-carolina-holiday-travel-your-essential-auto-insurance-guide-for-safe-winter-roads.html"),
        ("post/7-ways-to-lower-auto-insurance-premiums-north-carolina-2025/index.html", "/blog/blogs/7-proven-ways-to-fight-rising-nc-auto-insurance-costs-a-guide-by-bill-layne-insurance.html"),
        ("post/are-you-falling-for-these-top-10-auto-insurance-myths-in-2025/index.html", "/blog/blogs/nc-insurance-myths-true-false-challenge.html"),
        ("post/why-north-carolina-drivers-are-facing-higher-car-insurance-costs-in-2025-and-what-it-means-for-elkin/index.html", "/blog/blogs/why-are-north-carolina-car-insurance-rates-rising-in-2026-while-national-premiums-drop.html"),
        ("post/understanding-auto-insurance-coverage-a-guide-for-elkin-nc-drivers/index.html", "/blog/blogs/what-is-collision-coverage-in-nc-a-north-carolina-drivers-essential-guide.html"),
        ("post/out-of-wheels-when-rental-car-coverage-ends-before-your-repair/index.html", "/blog/blogs/nc-rental-coverage-30-day-limit.html"),
        ("post/10-simple-tricks-to-slash-your-home-insurance-costs-in-north-carolina/index.html", "/blog/blogs/how-to-lower-north-carolina-homeowners-premiums-in-2026-following-the-latest-rate-hikes.html"),
        ("post/explore-the-most-expensive-properties-for-sale-in-surry-county-today/index.html", "/blog/"),
        ("post/the-clock-s-ticking-your-nc-auto-insurance-july-2025-upgrade-checklist/index.html", "/blog/blogs/nc-auto-insurance-law-changes-2025-with-images.html"),
        ("post/understanding-house-insurance-in-north-carolina-a-comprehensive-guide/index.html", "/blog/blogs/north-carolina-home-insurance-shocker-explaining-rising-replacement-costs-what-nc-residents-can-do.html"),
        ("post/how-to-safely-navigate-snowy-roads-in-nc-tips-for-winter-driving-in-elkin-and-surry-county/index.html", "/blog/blogs/icy-commutes-school-delays-is-your-auto-policy-ready-for-elkins-winter-roads.html"),
        ("post/discover-the-richest-city-near-elkin-nc-check-out-forbes-top-10-wealthiest-cities/index.html", "/blog/"),
        ("post/speeding-ticket-and-auto-insurance-in-north-carolina-what-you-need-to-know/index.html", "/blog/blogs/nc-dmv-points-vs-insurance-points-2026-comparison-table.html"),
        ("post/everything-you-need-to-know-about-auto-insurance-points-in-nc/index.html", "/blog/blogs/nc-dmv-points-vs-insurance-points-2026-comparison-table.html"),
        ("post/a-tour-of-north-carolina-s-most-unusual-traffic-laws/index.html", "/blog/"),
        ("post/nc-auto-insurance-rates-2025-shield-your-wallet-from-the-coming-surge/index.html", "/blog/blogs/nc-auto-insurance-increase-2025.html"),
        ("post/from-loser-to-winner-mastering-scratch-off-lottery-tickets/index.html", "/blog/"),
        ("post/who-s-responsible-in-a-parking-lot-accident-the-truth-about-nc-insurance-claims/index.html", "/blog/blogs/nc-stoplight-crash-fault-law.html"),
    ]

    for src, dest in post_redirects:
        if make_redirect(src, dest):
            created += 1
        else:
            skipped += 1

    # =========================================================================
    # CATEGORY 3: Old location pages -> /areas-we-serve.html
    # =========================================================================
    print("\n=== CATEGORY 3: Location page redirects ===")

    location_redirects = [
        "roaring-river.html",
        "sandy-ridge.html",
        "pinnacle.html",
        "danbury.html",
        "union-grove.html",
        "millers-creek.html",
        "east-bend.html",
        "boonville.html",
        "white-plains.html",
        "germanton.html",
        "hamptonville.html",
        "walnut-cove.html",
        "pilot-mountain.html",
        "ronda.html",
        "north-wilkesboro.html",
        "toast.html",
        "traphill.html",
        "king.html",
    ]

    for loc in location_redirects:
        if make_redirect(loc, "/areas-we-serve.html"):
            created += 1
        else:
            skipped += 1

    # =========================================================================
    # CATEGORY 4: Old Wix pages
    # =========================================================================
    print("\n=== CATEGORY 4: Old Wix HTML redirects ===")

    wix_html_redirects = [
        ("nc-grange.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
        ("alamance-farmers.html", "/auto-center/carriers/alamance-north-carolina.html"),
        ("home-quote.html", "/home-quote.html"),  # will be skipped if exists
    ]

    for src, dest in wix_html_redirects:
        if make_redirect(src, dest):
            created += 1
        else:
            skipped += 1

    print("\n=== CATEGORY 4: Old Wix directory redirects ===")

    wix_dir_redirects = [
        ("general-4/index.html", "/index.html"),
        ("insurance-1/index.html", "/index.html"),
        ("quotes/index.html", "/get-quote.html"),
        ("quote/index.html", "/get-quote.html"),
        ("carter-foster/index.html", "/index.html"),
        ("nc-auto-insurance-points/index.html", "/blog/blogs/nc-dmv-points-vs-insurance-points-2026-comparison-table.html"),
        ("nc-auto-insurance-points-1/index.html", "/blog/blogs/nc-dmv-points-vs-insurance-points-2026-comparison-table.html"),
        ("file-share/index.html", "/index.html"),
        ("image-hosting/index.html", "/index.html"),
        ("services/index.html", "/index.html"),
        ("services-areas/index.html", "/areas-we-serve.html"),
        ("services-1/index.html", "/index.html"),
        ("bolt-performance/index.html", "/index.html"),
        ("important-links/index.html", "/resources/index.html"),
        ("alamance-farmers-mutual-insurance/index.html", "/auto-center/carriers/alamance-north-carolina.html"),
        ("nc-grange-mutual-insurance/index.html", "/auto-center/carriers/nc-grange-north-carolina.html"),
        ("privacy-policy/index.html", "/index.html"),
        ("members/index.html", "/index.html"),
        ("home-inspection-app/index.html", "/index.html"),
        ("home-insurance/index.html", "/home-insurance/index.html"),  # skip if exists
        ("business-insurance/index.html", "/index.html"),
        ("terms/index.html", "/index.html"),
        ("privacy/index.html", "/index.html"),
        ("blog/tag/business insurance elkin nc/index.html", "/blog/index.html"),
        ("claims/index.html", "/claims-center/index.html"),
        ("make-a-payment/index.html", "/index.html"),
        ("_frog/index.html", "/index.html"),
    ]

    for src, dest in wix_dir_redirects:
        if make_redirect(src, dest):
            created += 1
        else:
            skipped += 1

    # =========================================================================
    # SUMMARY
    # =========================================================================
    print(f"\n{'='*60}")
    print(f"SUMMARY: Created {created} redirect files, Skipped {skipped} (already existed)")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
