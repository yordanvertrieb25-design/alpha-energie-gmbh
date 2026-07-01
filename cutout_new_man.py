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
    
    # Tolerance for near-white
    lo = (20, 20, 20)
    hi = (20, 20, 20)
    
    # Floodfill from corners with fixed range to prevent gradient leaking
    flags = 4 | cv2.FLOODFILL_FIXED_RANGE
    cv2.floodFill(img, mask, (0, 0), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (w-1, 0), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (0, h-1), (0, 255, 0), lo, hi, flags)
    cv2.floodFill(img, mask, (w-1, h-1), (0, 255, 0), lo, hi, flags)
    
    # The mask contains 1 where filled. So the background is 1.
    # Subject is 0. Let's invert it: subject = 255, background = 0
    alpha = np.zeros((h, w), np.uint8)
    alpha[mask[1:-1, 1:-1] == 0] = 255
    
    # Erode and smooth the alpha mask
    kernel = np.ones((3,3), np.uint8)
    alpha = cv2.erode(alpha, kernel, iterations=2)
    alpha = cv2.GaussianBlur(alpha, (15,15), 5.0)
    
    # Reload original image to get original colors back
    orig = cv2.imread(input_path)
    b, g, r = cv2.split(orig)
    
    # To prevent white halos, bleed the target background color
    target_bg = np.array([0, 138, 239], dtype=np.uint8)
    bg_mask = cv2.bitwise_not(alpha)
    
    # Apply to pixels that are mostly background
    b[bg_mask > 127] = target_bg[0]
    g[bg_mask > 127] = target_bg[1]
    r[bg_mask > 127] = target_bg[2]
    
    result = cv2.merge((b, g, r, alpha))
    cv2.imwrite(output_path, result)

if __name__ == "__main__":
    cutout(sys.argv[1], sys.argv[2])
