import cv2
import numpy as np
import os

# 1. Load the image from C:\Users\Levo\.gemini\antigravity\brain\tempmediaStorage\media__1782919489706.png using cv2
input_path = r"C:\Users\Levo\.gemini\antigravity\brain\tempmediaStorage\media__1782919489706.png"
img = cv2.imread(input_path)

if img is None:
    raise FileNotFoundError(f"Could not load image from {input_path}")

# 2. Calculate the alpha channel based on the distance from pure white:
#    - Calculate difference: diff = 255.0 - img.astype(float)
#    - Take the maximum difference across B, G, R channels: max_diff = np.max(diff, axis=2)
#    - Estimate alpha: alpha = np.clip((max_diff - 10.0) / 160.0, 0.0, 1.0)
diff = 255.0 - img.astype(float)
max_diff = np.max(diff, axis=2)
alpha = np.clip((max_diff - 10.0) / 160.0, 0.0, 1.0)

# 3. Smooth the alpha channel using cv2.GaussianBlur(alpha, (3, 3), 0.5)
alpha_smoothed = cv2.GaussianBlur(alpha, (3, 3), 0.5)

# 4. Extract color-extended BGR channels via cv2.inpaint:
#    - solid_mask = (alpha >= 0.95)
#    - inpaint_mask = (~solid_mask).astype(np.uint8) * 255
#    - color_extended = cv2.inpaint(img, inpaint_mask, 5, cv2.INPAINT_TELEA)
solid_mask = (alpha >= 0.95)
inpaint_mask = (~solid_mask).astype(np.uint8) * 255
color_extended = cv2.inpaint(img, inpaint_mask, 5, cv2.INPAINT_TELEA)

# 5. Merge color_extended BGR channels with the smoothed alpha channel (scaled back to 0-255 uint8)
alpha_uint8 = np.clip(np.round(alpha_smoothed * 255.0), 0, 255).astype(np.uint8)
b, g, r = cv2.split(color_extended)
merged = cv2.merge([b, g, r, alpha_uint8])

# 6. Crop the merged image tightly to the bounding box of non-zero alpha plus a 5-pixel margin
coords = cv2.findNonZero(alpha_uint8)
if coords is not None:
    x, y, w_box, h_box = cv2.boundingRect(coords)
    margin = 5
    h, w = alpha_uint8.shape
    y1 = max(0, y - margin)
    y2 = min(h, y + h_box + margin)
    x1 = max(0, x - margin)
    x2 = min(w, x + w_box + margin)
    final_logo = merged[y1:y2, x1:x2]
else:
    final_logo = merged

# 7. Save the cropped transparent logo as logo.png in the workspace directory
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logo.png')
cv2.imwrite(output_path, final_logo)

# 8. Execute the script to make sure it runs successfully and prints the shape of the saved logo.png
print(f"Saved logo.png with shape {final_logo.shape}")
