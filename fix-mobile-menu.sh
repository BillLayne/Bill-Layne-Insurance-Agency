#!/bin/bash

# Fix mobile menu JavaScript in all HTML files
for file in areas-we-serve.html auto-coverage-checkup.html blog.html contact-us.html home-insurance-evaluator.html insurance-elkin-nc.html insurance-mount-airy-nc.html insurance-quiz.html umbrella-policy-calculator.html; do
    if [ -f "$file" ]; then
        echo "Fixing mobile menu in $file..."
        
        # Fix the querySelector for nav-menu
        sed -i "s/querySelector('.navbar-menu')/querySelector('.nav-menu')/g" "$file"
        
        # Fix the event listener for nav-container
        sed -i "s/closest('.navbar-content')/closest('.nav-container')/g" "$file"
    fi
done

echo "Mobile menu fixed in all files!"