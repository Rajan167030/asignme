const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Define the URL of your FastAPI endpoint
const url = "https://ff-test-cr3w.onrender.com/generate-font";

// Path to the folder containing images
const imageFolder = path.join(__dirname, "images");

const spacing = 500;  // Define the spacing value you want to send

// Prepare the files to send
const formData = new FormData();
fs.readdirSync(imageFolder).forEach(filename => {
    if (filename.match(/\.(png|jpg|jpeg)$/i)) {
        const filePath = path.join(imageFolder, filename);
        formData.append('files', fs.createReadStream(filePath));
    }
});

// Add the spacing data
formData.append('spacing', spacing);

// Send the POST request
axios.post(url, formData, {
    headers: formData.getHeaders(),
    responseType: 'arraybuffer'  // This is the key change
})
.then(response => {
    if (response.status === 200) {
        console.log("Font generation successful!");
        // Save the received TTF file
        fs.writeFileSync("generated_font.ttf", Buffer.from(response.data));
    } else {
        console.log("Error:", response.data.toString());
    }
})
.catch(error => {
    console.error("Error:", error.response ? error.response.data.toString() : error.message);
});