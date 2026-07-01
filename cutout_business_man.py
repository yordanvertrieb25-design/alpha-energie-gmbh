import cv2
import numpy as np
import sys

def cutout(input_path, output_path):
    img = cv2.imread(input_path)
    if img is None:
        print("Error loading image")
        sys.exit(1)
        
    h, w = img.shape[:2]
    
    # Create mask for floodfill, size must be h+2, w+2
    mask = np.zeros((h + 2, w + 2), np.uint8)
    
    # Tolerance for near-white JPEG background
    lo = (40, 40, 40)
    hi = (40, 40, 40)
    
    # Floodfill from corners with fixed range to prevent gradient leaking
    flags = 4 | cv2.FLOODFILL_FIXED_RANGE
    cv2.floodFill(img, mask, (0, 0), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (w-1, 0), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (0, h-1), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (w-1, h-1), (0, 255, 0), lo, hi, flags)
    
    # The mask contains 1 where filled. So the background is 1.
    alpha = np.zeros((h, w), np.uint8)
    alpha[mask[1:-1, 1:-1] == 0] = 255
    
    # Cleanup mask with morphology to close small holes inside the subject
    kernel = np.ones((5,5), np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=3)
    
    # Erode and smooth the alpha mask to remove jagged JPEG edges
    alpha = cv2.erode(alpha, kernel, iterations=3)
    alpha = cv2.GaussianBlur(alpha, (21,21), 0)
    
    # Reload original image to get original colors back
    orig = cv2.imread(input_path)
    b, g, r = cv2.split(orig)
    
    # Target background color to prevent halos
    target_bg = np.array([0, 138, 239], dtype=np.uint8)
    bg_mask = cv2.bitwise_not(alpha)
    
    b[bg_mask > 127] = target_bg[0]
    g[bg_mask > 127] = target_bg[1]
    r[bg_mask > 127] = target_bg[2]
    
    # Check if right edge is cut off and needs fading
    if np.any(alpha[:, -1] > 100):
        fade_width = int(w * 0.15)
        gradient = np.linspace(1.0, 0.0, fade_width)
        gradient = np.tile(gradient, (h, 1))
        alpha_float = alpha.astype(float)
        alpha_float[:, w-fade_width:] *= gradient
        alpha = alpha_float.astype(np.uint8)

    result = cv2.merge((b, g, r, alpha))
    cv2.imwrite(output_path, result)

if __name__ == "__main__":
    cutout(sys.argv[1], sys.argv[2])
