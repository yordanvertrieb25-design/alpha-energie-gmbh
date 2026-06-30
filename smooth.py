import sys
from PIL import Image, ImageFilter
from PIL.ImageFilter import MinFilter

def feather_and_orange_bg(input_path, output_path, radius=1.0):
    img = Image.open(input_path).convert("RGBA")
    data = list(img.getdata())
    
    target_bg = (230, 92, 35)
    
    new_data = []
    for item in data:
        if item[3] == 0:
            new_data.append((target_bg[0], target_bg[1], target_bg[2], 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    r, g, b, a = img.split()
    
    # Erode the alpha channel to remove the hard jagged edge (removes 1 pixel radius)
    a_shrunk = a.filter(MinFilter(3)) 
    
    # Blur the eroded alpha channel to create a soft edge
    a_final = a_shrunk.filter(ImageFilter.GaussianBlur(radius=radius))
    
    img_final = Image.merge("RGBA", (r, g, b, a_final))
    img_final.save(output_path, "PNG")

if __name__ == "__main__":
    feather_and_orange_bg(sys.argv[1], sys.argv[2])
