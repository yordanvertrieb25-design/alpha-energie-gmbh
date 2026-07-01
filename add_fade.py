import cv2
import numpy as np
import sys

def add_fade(input_path, output_path):
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None or img.shape[2] != 4:
        print("Error: Image does not have an alpha channel")
        sys.exit(1)
        
    b, g, r, a = cv2.split(img)
    
    # Check if right edge is cut off
    height, width = a.shape
    if np.any(a[:, -1] > 100):
        fade_width = int(width * 0.15)
        gradient = np.linspace(1.0, 0.0, fade_width)
        gradient = np.tile(gradient, (height, 1))
        
        alpha_float = a.astype(float)
        alpha_float[:, width-fade_width:] *= gradient
        a = alpha_float.astype(np.uint8)
        
    result = cv2.merge((b, g, r, a))
    cv2.imwrite(output_path, result)

if __name__ == "__main__":
    add_fade(sys.argv[1], sys.argv[2])
