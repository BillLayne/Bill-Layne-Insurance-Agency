#!/bin/bash

# Update header links in all HTML files
for file in areas-we-serve.html auto-coverage-checkup.html blog.html contact-us.html home-insurance-evaluator.html insurance-elkin-nc.html insurance-mount-airy-nc.html insurance-quiz.html umbrella-policy-calculator.html; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Update the logo link
        sed -i 's|<a href="index.html" class="nav-logo">|<a href="https://github.com/BillLayne/Bill-Layne-Insurance-Agency" class="nav-logo">|g' "$file"
        
        # Update Home link
        sed -i 's|<a href="index.html" class="nav-link">Home</a>|<a href="https://github.com/BillLayne/Bill-Layne-Insurance-Agency" class="nav-link">Home</a>|g' "$file"
        
        # Update Services link
        sed -i 's|<a href="#services" class="nav-link">Services</a>|<a href="https://billlayneinsurance.com/areas-we-serve.html" class="nav-link">Services</a>|g' "$file"
        
        # Update Auto link
        sed -i 's|<a href="auto-coverage-checkup.html" class="nav-link">Auto</a>|<a href="https://github.com/BillLayne/Auto-Insurance-Center" class="nav-link">Auto</a>|g' "$file"
        
        # Update Claims link
        sed -i 's|<a href="#claims" class="nav-link">Claims</a>|<a href="https://github.com/BillLayne/Auto-Insurance-Center" class="nav-link">Claims</a>|g' "$file"
    fi
done

echo "All headers updated successfully!"