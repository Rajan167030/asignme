from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import os
import subprocess
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import logging

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Define a base directory for uploaded files
UPLOAD_DIR = Path(__file__).resolve().parent / 'uploaded_files'

# Ensure the directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_event():
    cmd_command = "uvicorn main:app --reload"
    result = subprocess.run(cmd_command, shell=True, capture_output=True, text=True)
    logger.info("Restarting...")
    return result

@app.post("/process-file/")
async def upload_file(file: UploadFile = File(...), subject: str = 'default'):
    try:
        logger.info(f"Received file: {file.filename} with subject: {subject}")
        file_path = UPLOAD_DIR / file.filename
        
        with open(file_path, "wb") as f:
            f.write(file.file.read())

        response = process_file(str(file_path), subject)
        logger.info(f"Response generated: {response}")
        return response
    
    except ValueError as ve:
        logger.error(f"ValueError: {ve}")
        return PlainTextResponse(str(ve), status_code=400)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return PlainTextResponse(f"An unexpected error occurred: {str(e)}", status_code=500)

def process_file(file_path, subject):
    image_files = []

    logger.info(f"Processing file: {file_path}")

    # Check if the input file is a PDF or an image
    if file_path.lower().endswith('.pdf'):
        # Open the PDF file
        pdf_document = fitz.open(file_path)
        
        # Convert each page to an image
        zoom_x = 5.0  # horizontal zoom
        zoom_y = 5.0  # vertical zoom
        matrix = fitz.Matrix(zoom_x, zoom_y)
        
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            pix = page.get_pixmap(matrix=matrix)
            image_file = f'page_{page_num + 1}.png'
            pix.save(image_file)
            image_files.append(image_file)
            logger.info(f"Saved image file: {image_file}")
    
    elif file_path.lower().endswith(('.png', '.jpg', '.jpeg','.heic')):
        image_files.append(file_path)
    
    else:
        raise ValueError("Unsupported file format. Please provide a PDF or an image file.")
    
    GOOGLE_API_KEY=os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=GOOGLE_API_KEY)

    safety_settings = {
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE
    }
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    extracted_text = ""

    # Process each image with the generative model
    for image_file in image_files:
        image = Image.open(image_file)
        result = model.generate_content([
            '''EXTRACT TEXT FROM IT,
               IF IT'S IN A TABLE EXTRACT THE TABLE,
               IF THERE IS A DIAGRAM SUMMARIZE THE DIAGRAM''',
            image
        ], safety_settings=safety_settings)
        extracted_text += result.text + "\n\n"
        logger.info(f"Extracted text from image: {image_file}")

    # Process the extracted text with the generative model    
    response = model.generate_content([
        f'''I have extracted text from a pdf, which is my {subject} assignment. Please answer these questions:{extracted_text}.
           NOTE: 1. Start every answer with Ans1-, next with Ans2- and so on.
                 2. Don't use to **bold** or *italics* or ## for headings, just normal text without any markdown.
                 3. You can use a line break for next line.
                 4. If the question says to draw a diagram don't draw it.'''
    ], safety_settings=safety_settings, generation_config=genai.types.GenerationConfig(temperature=0.2))

    return PlainTextResponse(response.text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
