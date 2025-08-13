#!/bin/bash

# Update agency name in all HTML files
for file in *.html; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Update the header text
        sed -i 's/Bill Layne Insurance Agency/Bill Layne Insurance/g' "$file"
    fi
done

echo "All agency names updated successfully!"