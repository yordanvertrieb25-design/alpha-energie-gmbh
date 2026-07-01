import cv2
import numpy as np

img = cv2.imread('logo_original.jpeg')
h, w, _ = img.shape

# Convert to HSV to find blue/cyan pixels
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower_blue = np.array([80, 50, 50])
upper_blue = np.array([130, 255, 255])
mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

# The lightbulb is on the left (e.g., x < 300).
# The blue text is on the right (e.g., x > 250).
# Let's erase all blue pixels that are x > 250
mask_blue[:, :250] = 0 # Ignore blue on the left

# Dilate the text mask a bit to ensure we catch the anti-aliased edges of the blue text
kernel = np.ones((5,5), np.uint8)
mask_text = cv2.dilate(mask_blue, kernel, iterations=2)

# Set the blue text pixels to black
img[mask_text > 0] = [0, 0, 0]

# Now we have the image without the blue text!
# Let's make the black background transparent
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, mask = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)

# Smooth the edges of the logo
mask_blurred = cv2.GaussianBlur(mask, (3, 3), 0)
rgba[:, :, 3] = mask_blurred

# Crop to the bounding box of the visible logo
coords = cv2.findNonZero(mask)
if coords is not None:
    x, y, w_box, h_box = cv2.boundingRect(coords)
    margin = 10
    x = max(0, x - margin)
    y = max(0, y - margin)
    w_box = min(w - x, w_box + 2*margin)
    h_box = min(h - y, h_box + 2*margin)
    final_logo = rgba[y:y+h_box, x:x+w_box]
else:
    final_logo = rgba

cv2.imwrite('logo.png', final_logo)
print(f"Saved logo.png with shape {final_logo.shape}")
