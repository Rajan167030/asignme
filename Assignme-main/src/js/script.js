let menuBtn = document.querySelector('#menu-btn');
let navbar = document.querySelector('.header .flex .navbar');

menuBtn.onclick = () => {
    // Toggle text between "Menu" and "Close" instead of icon class
    menuBtn.textContent = menuBtn.textContent === 'Menu' ? 'Close' : 'Menu';
    navbar.classList.toggle('active');
}

//searchbox
const boxes = document.querySelectorAll(".box");
const searchInput = document.querySelector("#searchInput"); // Define searchInput

if (searchInput) { // Check if it exists before adding event listener
    searchInput.addEventListener("input", function () {
        const searchQuery = searchInput.value.toLowerCase().replace(/\s/g, '');
        
        boxes.forEach((box) => {
            const boxContent = box.textContent.toLowerCase().replace(/\s/g, '');
            const boxStyle = window.getComputedStyle(box); 

            if (boxContent.includes(searchQuery)) {
                box.style.display = "block"; // Show the box
            } else {
                box.style.display = "none"; // Hide the box
            }
        });
    });
}


