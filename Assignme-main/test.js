import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

// URL of the FastAPI application on Render
const url = "https://test2-sfwm.onrender.com/process-file/";

// File to be uploaded
const filePath = path.resolve("os.pdf"); 

// Subject parameter
const subject = "operating system";

// Function to upload the file
async function uploadFile() {
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log("File not found.");
    return;
  }

  // Create FormData instance
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));
  formData.append("subject", subject);

  try {
    // Send the POST request
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    
    console.log("Response Text:", response.data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the uploadFile function
uploadFile();
