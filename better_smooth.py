import cv2
import numpy as np
import sys

def smooth_edges(input_path, output_path):
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None or img.shape[2] != 4:
        print("Image doesn't have an alpha channel or could not be loaded")
        return
    
    b, g, r, a = cv2.split(img)
    
    # Threshold alpha to get a solid mask
    _, mask = cv2.threshold(a, 127, 255, cv2.THRESH_BINARY)
    
    # Erode the mask to remove jagged border pixels (5 iterations removes 5 pixels)
    kernel = np.ones((3,3), np.uint8)
    eroded = cv2.erode(mask, kernel, iterations=6)
    
    # Blur the eroded mask to soften edges
    blurred = cv2.GaussianBlur(eroded, (21,21), 7.0)
    
    # Fade out the right edge to blend the cut-off shoulder into the background
    height, width = blurred.shape
    fade_width = int(width * 0.20) # Fade out over the last 20%
    gradient = np.linspace(1.0, 0.0, fade_width)
    gradient = np.tile(gradient, (height, 1))
    
    alpha_float = blurred.astype(float)
    alpha_float[:, width-fade_width:] *= gradient
    blurred = alpha_float.astype(np.uint8)
    
    # To avoid dark halos around the edge when blurred, we fill transparent areas in RGB with target background color
    target_bg = np.array([0, 138, 239], dtype=np.uint8) # BGR for #ef8a00 (website orange)
    
    bg_mask = cv2.bitwise_not(eroded)
    b[bg_mask == 255] = target_bg[0]
    g[bg_mask == 255] = target_bg[1]
    r[bg_mask == 255] = target_bg[2]
        
    final = cv2.merge((b, g, r, blurred))
    cv2.imwrite(output_path, final)

if __name__ == "__main__":
    smooth_edges(sys.argv[1], sys.argv[2])
