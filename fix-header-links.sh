#!/bin/bash

# Update header links in all HTML files with correct GitHub Pages URLs
for file in index.html areas-we-serve.html auto-coverage-checkup.html blog.html contact-us.html home-insurance-evaluator.html insurance-elkin-nc.html insurance-mount-airy-nc.html insurance-quiz.html umbrella-policy-calculator.html; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Update the logo link to main insurance site
        sed -i 's|<a href="https://github.com/BillLayne/Bill-Layne-Insurance-Agency" class="nav-logo">|<a href="https://billlayneinsurance.com/" class="nav-logo">|g' "$file"
        
        # Update Home link
        sed -i 's|<a href="https://github.com/BillLayne/Bill-Layne-Insurance-Agency" class="nav-link">Home</a>|<a href="https://billlayne.github.io/NC-Home-Insurance.github.io/" class="nav-link">Home</a>|g' "$file"
        
        # Update Auto link
        sed -i 's|<a href="https://github.com/BillLayne/Auto-Insurance-Center" class="nav-link">Auto</a>|<a href="https://billlayne.github.io/Auto-Insurance-Center/" class="nav-link">Auto</a>|g' "$file"
        
        # Update Claims link
        sed -i 's|<a href="https://github.com/BillLayne/Auto-Insurance-Center" class="nav-link">Claims</a>|<a href="https://billlayne.github.io/NC-Insurance-Claims-Center.github.io/" class="nav-link">Claims</a>|g' "$file"
    fi
done

echo "All header links updated successfully!"