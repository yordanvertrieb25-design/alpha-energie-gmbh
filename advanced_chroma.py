import cv2
import numpy as np
import sys

def advanced_chroma(input_path, output_path):
    img = cv2.imread(input_path)
    if img is None:
        print("Could not read image")
        sys.exit(1)
        
    # Convert to HSV for better color separation
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Define green screen range
    # Green in HSV is around 60 (out of 180 in OpenCV).
    # We range from 35 to 85 to catch all shades of green.
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    
    # Create hard mask
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # The mask is 255 for green background, 0 for subject.
    # We want alpha where subject is 255 and background is 0.
    alpha = cv2.bitwise_not(mask)
    
    # Clean up the mask using morphology to remove noise
    kernel = np.ones((5,5), np.uint8)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, kernel, iterations=2)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    # We deeply erode the alpha to completely eliminate any jagged/pixelated edges
    eroded_alpha = cv2.erode(alpha, kernel, iterations=4) # Removes ~8 pixels from the edge
    
    # Then we apply a strong blur to create an incredibly smooth, anti-aliased edge
    soft_alpha = cv2.GaussianBlur(eroded_alpha, (21,21), 0)
    
    # Spill suppression: remove green tint from the edges of the subject
    # Where green is greater than the average of red and blue, reduce it
    b, g, r = cv2.split(img)
    
    rb_avg = (b.astype(np.float32) + r.astype(np.float32)) / 2.0
    g_float = g.astype(np.float32)
    
    # Only suppress where it's not strictly background
    spill_mask = (g_float > rb_avg) & (soft_alpha > 0)
    g[spill_mask] = rb_avg[spill_mask]
    
    # To avoid halos when CSS drop-shadow is applied, bleed the orange background color into the transparent areas
    target_bg = np.array([0, 138, 239], dtype=np.uint8) # BGR for #ef8a00
    bg_mask = cv2.bitwise_not(eroded_alpha)
    
    b[bg_mask > 127] = target_bg[0]
    g[bg_mask > 127] = target_bg[1]
    r[bg_mask > 127] = target_bg[2]
    
    # Dynamic right-edge fade out (if the subject is cut off by the right edge of the image)
    height, width = soft_alpha.shape
    if np.any(soft_alpha[:, -1] > 100):
        fade_width = int(width * 0.20)
        gradient = np.linspace(1.0, 0.0, fade_width)
        gradient = np.tile(gradient, (height, 1))
        
        alpha_float = soft_alpha.astype(float)
        alpha_float[:, width-fade_width:] *= gradient
        soft_alpha = alpha_float.astype(np.uint8)
    
    result = cv2.merge((b, g, r, soft_alpha))
    cv2.imwrite(output_path, result)

if __name__ == "__main__":
    advanced_chroma(sys.argv[1], sys.argv[2])
