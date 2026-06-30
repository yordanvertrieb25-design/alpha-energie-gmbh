import sys
from PIL import Image

def remove_bg_floodfill(input_path, output_path, tolerance=150):
    sys.setrecursionlimit(20000)
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    data = list(img.getdata())
    
    # Simple BFS floodfill
    # We assume corners are background
    start_nodes = [(0,0), (width-1, 0), (0, height-1), (width-1, height-1), (width//2, 0)]
    visited = set()
    to_visit = start_nodes
    
    # Get reference background colors from corners
    ref_colors = [data[y*width + x] for x,y in start_nodes]
    
    def is_similar(c1, c2):
        return sum(abs(c1[i] - c2[i]) for i in range(3)) < tolerance
        
    while to_visit:
        x, y = to_visit.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        idx = y * width + x
        pixel = data[idx]
        
        # Check if pixel is similar to any corner color
        if any(is_similar(pixel, ref) for ref in ref_colors):
            data[idx] = (pixel[0], pixel[1], pixel[2], 0) # Make transparent
            
            # Add neighbors
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = x+dx, y+dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        to_visit.append((nx, ny))
                    
    img.putdata(data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_bg_floodfill(sys.argv[1], sys.argv[2])
