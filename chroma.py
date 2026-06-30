import sys
from PIL import Image

def green_screen_key(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        # Chroma key condition: green is dominant
        if g > 100 and r < g * 0.8 and b < g * 0.8:
            new_data.append((r, g, b, 0))
        else:
            # Basic spill suppression to remove green fringes
            if g > r and g > b and r < 150 and b < 150:
                new_g = int((r + b) / 2)
                new_data.append((r, new_g, b, a))
            else:
                new_data.append(item)
                
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    green_screen_key(sys.argv[1], sys.argv[2])
