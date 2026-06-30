import cv2
import numpy as np

# Read image
img = cv2.imread('logo_original.jpeg')
h, w, _ = img.shape
print(f"Original shape: {w}x{h}")

# The logo text "ALPHA ENERGIE" is orange/yellow. The text below is blue.
# Let's convert to HSV to isolate the blue text
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# Define range of blue/cyan color
lower_blue = np.array([80, 50, 50])
upper_blue = np.array([130, 255, 255])

mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

# Find the highest y-coordinate of any blue pixel
blue_coords = cv2.findNonZero(mask_blue)
if blue_coords is not None:
    min_y_blue = np.min(blue_coords[:, 0, 1])
    print(f"Blue text starts at y: {min_y_blue}")
    # Crop the image to above the blue text
    crop_y = min_y_blue - 10 # 10 pixels margin
    if crop_y > 0:
        img_cropped = img[0:crop_y, 0:w]
    else:
        img_cropped = img
else:
    print("No blue text found.")
    img_cropped = img

# Now let's remove the black background and make it transparent
# Black is roughly R<30, G<30, B<30
h, w, _ = img_cropped.shape
rgba = cv2.cvtColor(img_cropped, cv2.COLOR_BGR2BGRA)

# Create a mask for non-black pixels
gray = cv2.cvtColor(img_cropped, cv2.COLOR_BGR2GRAY)
_, mask = cv2.threshold(gray, 15, 255, cv2.THRESH_BINARY)

# To make the edges smooth, we can blur the mask slightly
mask_blurred = cv2.GaussianBlur(mask, (3, 3), 0)
rgba[:, :, 3] = mask_blurred

# Now let's crop to the bounding box of the remaining visible pixels
coords = cv2.findNonZero(mask)
if coords is not None:
    x, y, w_box, h_box = cv2.boundingRect(coords)
    # Add a small margin
    margin = 10
    x = max(0, x - margin)
    y = max(0, y - margin)
    w_box = min(w - x, w_box + 2*margin)
    h_box = min(h - y, h_box + 2*margin)
    
    final_logo = rgba[y:y+h_box, x:x+w_box]
else:
    final_logo = rgba

cv2.imwrite('logo.png', final_logo)
print(f"Final shape: {final_logo.shape[1]}x{final_logo.shape[0]}")
print("Saved logo.png")
