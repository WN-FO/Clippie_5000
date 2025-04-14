#!/bin/bash

# Find all route.ts files in the app/api directory
for file in $(find app/api -name "route.ts"); do
  # Check if the file already has the dynamic export
  if ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic export to $file"
    # Insert the export statement after the last import statement
    sed -i '' -e '/^import/,/^$/{/^$/i\
export const dynamic = '\''force-dynamic'\''\;
}' "$file"
  else
    echo "$file already has dynamic export"
  fi
done

echo "Done" 