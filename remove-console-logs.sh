#!/bin/bash

# Script to remove or comment out console.log statements from production code

echo "Removing console.log statements from JavaScript files..."

# Create backup directory
mkdir -p backups

# Process JavaScript files
for file in *.js; do
    if [[ -f "$file" && ! "$file" == *.min.js && ! "$file" == remove-console-logs.sh ]]; then
        echo "Processing $file..."
        
        # Create backup
        cp "$file" "backups/$file.backup"
        
        # Remove simple console.log statements
        # This comments them out instead of removing completely for safety
        sed -i 's/console\.log(/\/\/ console.log(/g' "$file"
        sed -i 's/console\.error(/\/\/ console.error(/g' "$file"
        sed -i 's/console\.warn(/\/\/ console.warn(/g' "$file"
        sed -i 's/console\.debug(/\/\/ console.debug(/g' "$file"
        
        echo "✓ Processed $file"
    fi
done

echo ""
echo "Console statements have been commented out."
echo "Backups saved in ./backups/"
echo ""
echo "To restore original files:"
echo "  cp backups/*.backup ."
echo ""
echo "Remember to test thoroughly after these changes!"