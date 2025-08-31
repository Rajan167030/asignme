document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById('video');
    const flipButton = document.getElementById('flipButton');
    const captureButton = document.getElementById('captureButton');
    const retakeButton = document.getElementById('retakeButton');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
    const selectFileButton = document.getElementById('selectFileButton');
    let currentStream = null;
    let useFrontCamera = true;
    let images = []; // In-memory array to store captured images

    function getCameraStream() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: useFrontCamera ? 'user' : 'environment',
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                currentStream = stream;
                video.srcObject = stream;
                video.addEventListener('loadedmetadata', () => {
                    // Optionally set up canvas size based on video dimensions
                });
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Error accessing the camera.');
            });
    }

    getCameraStream();

    flipButton.addEventListener('click', () => {
        useFrontCamera = !useFrontCamera;
        getCameraStream();
    });

    captureButton.addEventListener('click', () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const scale = 7.5; // Increase the scale for a more zoomed-in capture
        const captureWidth = videoWidth / scale;
        const captureHeight = videoHeight / scale;

        // Calculate the offset to center the capture
        const xOffset = (videoWidth - captureWidth) / 2;
        const yOffset = (videoHeight - captureHeight) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = captureWidth;
        canvas.height = captureHeight;
        const context = canvas.getContext('2d');

        context.drawImage(video, xOffset, yOffset, captureWidth, captureHeight, 0, 0, canvas.width, canvas.height);

        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        preview.appendChild(img);

        images.push(canvas.toDataURL('image/png')); // Store in in-memory array
    });

    retakeButton.addEventListener('click', () => {
        if (preview.lastChild) {
            preview.removeChild(preview.lastChild);
            images.pop();
        }
    });

    // Loader and message overlay helpers
    function showLoader() {
        let loader = document.getElementById('fullscreen-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'fullscreen-loader';
            loader.innerHTML = `<div class="loader-spinner"></div><div class="loader-text">Uploading and generating font...</div>`;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    function hideLoader() {
        const loader = document.getElementById('fullscreen-loader');
        if (loader) loader.style.display = 'none';
    }
    function showMessageOverlay(message, type = 'success') {
        // Remove any existing overlay
        const old = document.getElementById('message-overlay');
        if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.id = 'message-overlay';
        overlay.className = type;
        overlay.innerHTML = `
            <div class="message-box">
                <span class="icon">${type === 'success' ? '✔️' : '❌'}</span>
                <span class="msg">${message}</span>
                <button class="close-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.close-btn').onclick = () => overlay.remove();
        if (type === 'success') setTimeout(() => overlay.remove(), 3500);
    }

    uploadButton.addEventListener('click', async () => {
        if (images.length === 0) {
            alert('Please capture some images.');
            return;
        }
        showLoader();
        const formData = new FormData();
        images.forEach((dataUrl, index) => {
            const blob = dataURItoBlob(dataUrl);
            formData.append('files', blob, `${index + 1}.png`);
        });
        formData.append('spacing', 500); // Example spacing value
        try {
            const response = await fetch('https://ff-test-cr3w.onrender.com/generate-font', {
                method: 'POST',
                body: formData
            });
            const data = await response.arrayBuffer();
            hideLoader();
            if (response.ok) {
                const blob = new Blob([data], { type: 'font/ttf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'generated_font.ttf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                showMessageOverlay('Font generation successful! The TTF file has been downloaded.', 'success');
            } else {
                const errorText = await response.text();
                showMessageOverlay('Font generation failed: ' + errorText, 'error');
            }
        } catch (error) {
            hideLoader();
            showMessageOverlay('Font generation failed: ' + error.message, 'error');
        }
        while (preview.firstChild) {
            preview.removeChild(preview.firstChild);
        }
        images = [];
    });

    // Add null checks to prevent errors if elements don't exist
    if (selectFileButton) {
        selectFileButton.addEventListener('click', () => {
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const files = fileInput.files;
            if (files.length === 0) {
                alert('Please select image files.');
                return;
            }
            // Read each file as data URL and add to preview and images array
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const dataUrl = e.target.result;
                    // Add to images array
                    images.push(dataUrl);
                    // Show in preview
                    const img = document.createElement('img');
                    img.src = dataUrl;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
            // Clear the file input so the same file(s) can be selected again if needed
            fileInput.value = '';
        });
    }

    // Display any previously captured images (if applicable)
    images.forEach(dataUrl => {
        const img = document.createElement('img');
        img.src = dataUrl;
        preview.appendChild(img);
    });

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }
});