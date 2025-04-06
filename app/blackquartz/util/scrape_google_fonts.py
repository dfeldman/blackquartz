#!/usr/bin/env python3
"""
Google Fonts Fetcher with Variable Font Support

This script fetches Google Fonts including variable font information and outputs
a JavaScript constants file with family, category, weights, and variable font data.

Usage:
    python google_fonts_fetcher_vf.py YOUR_API_KEY [output_file.js]
"""

import sys
import json
import requests

def fetch_google_fonts(api_key):
    """Fetch all fonts from the Google Fonts API with variable font information."""
    url = f"https://www.googleapis.com/webfonts/v1/webfonts?key={api_key}&capability=VF&sort=popularity"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception(f"API request failed with status {response.status_code}: {response.text}")
    
    data = response.json()
    print(f"INFO: Fetched {len(data.get('items', []))} fonts from Google Fonts API", file=sys.stderr)
    return data

def extract_weights(variants):
    """Extract available weights from variants, handling both numeric and named weights."""
    # Map named weights to their numeric values
    weight_map = {
        "thin": "100",
        "extralight": "200", 
        "extra-light": "200",
        "light": "300",
        "regular": "400",
        "normal": "400",
        "medium": "500",
        "semibold": "600", 
        "semi-bold": "600",
        "bold": "700",
        "extrabold": "800", 
        "extra-bold": "800",
        "black": "900"
    }
    
    weights = set()
    
    for variant in variants:
        # Skip italic variants
        if 'italic' in variant:
            continue
            
        # Convert named weights to numeric or keep numeric weights
        if variant.isdigit():
            weights.add(variant)
        else:
            v_clean = variant.lower().replace(' ', '')
            if v_clean in weight_map:
                weights.add(weight_map[v_clean])
    
    # If no weights were found but variants exist, default to 400 (regular)
    if not weights and variants:
        weights.add("400")
        
    # Return sorted list of weights
    return sorted(list(weights), key=int)

def process_font_data(fonts_data):
    """Process fonts data into a structured format."""
    result = {}
    
    variable_count = 0
    
    for font in fonts_data.get("items", []):
        family = font["family"]
        category = font["category"]
        weights = extract_weights(font["variants"])
        
        # Check if this is a variable font by looking for the axes field
        is_variable = "axes" in font
        axes_data = font.get("axes", [])
        
        if is_variable:
            variable_count += 1
            
            # Extract weight range from axes if available
            weight_axis = next((axis for axis in axes_data if axis["tag"] == "wght"), None)
            if weight_axis:
                # Replace static weights with continuous range for variable fonts
                min_weight = str(int(weight_axis["start"]))
                max_weight = str(int(weight_axis["end"]))
                
                # If the min or max weight isn't in our weights list, add them
                if min_weight not in weights:
                    weights.append(min_weight)
                if max_weight not in weights:
                    weights.append(max_weight)
                    
                # Sort the weights numerically
                weights = sorted(weights, key=int)
        
        result[family] = {
            "family": family,
            "category": category,
            "weights": weights,
            "isVariable": is_variable,
            "axes": axes_data if is_variable else []
        }
    
    print(f"INFO: Detected {variable_count} variable fonts", file=sys.stderr)
    return result

def generate_js_constants(processed_data):
    """Generate JavaScript constants file from processed font data."""
    # Start with the export declaration
    js_output = "export const FONTS = {\n"
    
    # Add each font entry
    for family, font_data in processed_data.items():
        # Create a safe key for the JS object
        safe_key = family.replace("'", "\\'")
        
        # Format the weights array
        weights_str = json.dumps(font_data["weights"])
        
        # Format the axes array (if any)
        axes_str = json.dumps(font_data["axes"])
        
        # Add the font entry
        js_output += f"  '{safe_key}': {{\n"
        js_output += f"    family: '{safe_key}',\n"
        js_output += f"    category: '{font_data['category']}',\n"
        js_output += f"    weights: {weights_str},\n"
        js_output += f"    isVariable: {str(font_data['isVariable']).lower()}"
        
        if font_data["isVariable"]:
            js_output += f",\n    axes: {axes_str}\n"
        else:
            js_output += "\n"
            
        js_output += "  },\n"
    
    # Close the FONTS object
    js_output += "};\n\n"
    
    # Add helpful constants for categories and variable fonts
    js_output += "// Font category collections\n"
    js_output += "export const SANS_SERIF_FONTS = Object.values(FONTS).filter(font => font.category === 'sans-serif');\n"
    js_output += "export const SERIF_FONTS = Object.values(FONTS).filter(font => font.category === 'serif');\n"
    js_output += "export const DISPLAY_FONTS = Object.values(FONTS).filter(font => font.category === 'display');\n"
    js_output += "export const HANDWRITING_FONTS = Object.values(FONTS).filter(font => font.category === 'handwriting');\n"
    js_output += "export const MONOSPACE_FONTS = Object.values(FONTS).filter(font => font.category === 'monospace');\n"
    js_output += "export const VARIABLE_FONTS = Object.values(FONTS).filter(font => font.isVariable);\n"
    
    return js_output

def main():
    """Main function."""
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} YOUR_API_KEY [output_file.js]")
        sys.exit(1)
    
    api_key = sys.argv[1]
    
    try:
        # Fetch and process the fonts
        fonts_data = fetch_google_fonts(api_key)
        processed_data = process_font_data(fonts_data)
        js_constants = generate_js_constants(processed_data)
        
        # Output the result
        if len(sys.argv) > 2:
            output_file = sys.argv[2]
            with open(output_file, 'w') as f:
                f.write(js_constants)
            print(f"Output written to {output_file}")
        else:
            print(js_constants)
            
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
    