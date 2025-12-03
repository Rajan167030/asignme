from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
import cv2
import logging
import numpy as np
from PIL import Image
from potrace import Bitmap, POTRACE_TURNPOLICY_MINORITY
import fontforge
from typing import List
import shutil
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Set up logging
logging.basicConfig(level=logging.INFO)

def enhance_contrast_brightness_erode(image_path, output_path, kernel_size=(3, 3)):
    img = cv2.imread(image_path)
    alpha = 1.5
    beta = 10
    adjusted = np.clip(alpha * img + beta, 0, 255).astype(np.uint8)
    kernel = np.ones(kernel_size, dtype=np.uint8)
    eroded = cv2.erode(adjusted, kernel, iterations=1)
    cv2.imwrite(output_path, eroded)

def file_to_svg(input_path, output_path):
    image = Image.open(input_path)
    bm = Bitmap(image, blacklevel=0.7)
    plist = bm.trace(turdsize=2, turnpolicy=POTRACE_TURNPOLICY_MINORITY, alphamax=1, opticurve=False, opttolerance=0.2)

    with open(output_path, "w") as fp:
        fp.write(f'''<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{image.width}" height="{image.height}" viewBox="0 0 {image.width} {image.height}">''')
        parts = []
        for curve in plist:
            fs = curve.start_point
            parts.append(f"M{fs.x},{fs.y}")
            for segment in curve.segments:
                if segment.is_corner:
                    a = segment.c
                    b = segment.end_point
                    parts.append(f"L{a.x},{a.y}L{b.x},{b.y}")
                else:
                    a = segment.c1
                    b = segment.c2
                    c = segment.end_point
                    parts.append(f"C{a.x},{a.y} {b.x},{b.y} {c.x},{c.y}")
            parts.append("z")
        fp.write(f'<path stroke="none" fill="black" fill-rule="evenodd" d="{"".join(parts)}"/>')
        fp.write("</svg>")

def cleanup(directory):
    try:
        shutil.rmtree(directory)
        logging.info(f"Successfully cleaned up {directory}")
    except Exception as e:
        logging.error(f"Error cleaning up {directory}: {e}")

def generate_ttf(svg_directory, ttf_path, spacing):
    font = fontforge.font()

    # Add uppercase letters
    for i in range(26):
        char = chr(ord('A') + i)
        glyph = font.createChar(ord(char))
        svg_path = os.path.join(svg_directory, f"{i + 1}.svg")
        if not os.path.exists(svg_path):
            logging.error(f"SVG file {svg_path} does not exist.")
            continue
        glyph.importOutlines(svg_path)
        glyph.width = spacing

    # Add lowercase letters
    for i in range(26):
        char = chr(ord('a') + i)
        glyph = font.createChar(ord(char))
        svg_path = os.path.join(svg_directory, f"{i + 27}.svg")
        if not os.path.exists(svg_path):
            logging.error(f"SVG file {svg_path} does not exist.")
            continue
        glyph.importOutlines(svg_path)
        glyph.width = spacing

    # Add digits
    for i in range(10):
        char = chr(ord('0') + i)
        glyph = font.createChar(ord(char))
        svg_path = os.path.join(svg_directory, f"{i + 53}.svg")
        if not os.path.exists(svg_path):
            logging.error(f"SVG file {svg_path} does not exist.")
            continue
        glyph.importOutlines(svg_path)
        glyph.width = spacing

    font.generate(ttf_path)
    logging.info(f"Font generated at {ttf_path}")

@app.post("/generate-font")
async def upload_images(files: List[UploadFile] = File(...), spacing: int = Form(...)):
    tmpdirname = "/tmp/font_generation_debug"
    if not os.path.exists(tmpdirname):
        os.makedirs(tmpdirname)

    input_folder = os.path.join(tmpdirname, "images")
    eroded_folder = os.path.join(tmpdirname, "eroded_images")
    svg_folder = os.path.join(tmpdirname, "svg_images")
    ttf_path = os.path.join(tmpdirname, "myfont.ttf")

    os.makedirs(input_folder, exist_ok=True)
    os.makedirs(eroded_folder, exist_ok=True)
    os.makedirs(svg_folder, exist_ok=True)

    try:
        # Save uploaded images
        for file in files:
            file_path = os.path.join(input_folder, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())

        # Erode images and check results
        for filename in os.listdir(input_folder):
            if filename.endswith(('.png', '.jpg', '.jpeg')):
                input_path = os.path.join(input_folder, filename)
                output_path = os.path.join(eroded_folder, filename)
                enhance_contrast_brightness_erode(input_path, output_path)

        # Convert to SVG
        for filename in os.listdir(eroded_folder):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                input_path = os.path.join(eroded_folder, filename)
                output_path = os.path.join(svg_folder, f"{os.path.splitext(filename)[0]}.svg")
                try:
                    file_to_svg(input_path, output_path)
                except Exception as e:
                    logging.error(f"SVG generation failed for {filename}: {e}")
                    return {"detail": f"SVG generation failed for {filename}: {e}"}, 500

        # Generate TTF font
        try:
            generate_ttf(svg_folder, ttf_path, spacing)
        except Exception as e:
            logging.error(f"Font generation failed: {e}")
            return {"detail": f"Font generation failed: {e}"}, 500

        # Check if the TTF file was created
        if not os.path.exists(ttf_path):
            logging.error("Font file was not created.")
            return {"detail": "Font file was not created."}, 500

        # Create a copy of the font file before cleanup
        safe_ttf_path = os.path.join(tmpdirname, "safe_myfont.ttf")
        shutil.copy2(ttf_path, safe_ttf_path)

        return FileResponse(safe_ttf_path, media_type='font/ttf', filename='myfont.ttf')

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return {"detail": f"An unexpected error occurred: {e}"}, 500

    finally:
        # Cleanup
        cleanup(input_folder)
        cleanup(eroded_folder)
        cleanup(svg_folder)
        if os.path.exists(ttf_path):
            os.remove(ttf_path)
        logging.info("Cleanup completed")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
