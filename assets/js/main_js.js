// Set current date
const dateElement = document.getElementById('current-date');
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = new Date().toLocaleDateString(undefined, options);

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate the clicked tab
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Camera functionality
const startCameraButton = document.getElementById('start-camera');
const videoFeed = document.getElementById('video-feed');
const statusText = document.getElementById('status-text');
const faceBox = document.getElementById('face-box');

startCameraButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoFeed.srcObject = stream;
        statusText.textContent = 'Active - Waiting for faces';
        startCameraButton.textContent = 'Camera Active';
        startCameraButton.disabled = true;
        
        // Simulate face detection (in a real app, this would use OpenCV.js and TensorFlow.js)
        setTimeout(() => {
            simulateFaceDetection();
        }, 3000);
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        statusText.textContent = 'Error: Cannot access camera';
    }
});

// Simulate face detection and recognition (this would be replaced with actual ML code)
function simulateFaceDetection() {
    statusText.textContent = 'Face detected - Analyzing...';
    
    // Simulate a detected face with a box
    faceBox.style.display = 'block';
    faceBox.style.width = '150px';
    faceBox.style.height = '200px';
    faceBox.style.top = '100px';
    faceBox.style.left = '220px';
    
    // Simulate recognition after a delay
    setTimeout(() => {
        statusText.textContent = 'Student identified: John Smith (S1001)';
        showNotification('Student John Smith marked present successfully!');
        
        // Add to attendance table
        const tableBody = document.getElementById('attendance-list');
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // For demo purposes, we'll just update the third row (Michael Brown) to present
        const rows = tableBody.getElementsByTagName('tr');
        if (rows.length >= 3) {
            const cells = rows[2].getElementsByTagName('td');
            cells[2].textContent = currentTime;
            cells[3].textContent = 'Present';
            cells[3].className = 'status-present';
        }
        
        // Update statistics
        document.querySelectorAll('.stat-card p')[1].textContent = '29';
        document.querySelectorAll('.stat-card p')[2].textContent = '6';
        document.querySelectorAll('.stat-card p')[3].textContent = '83%';
        
    }, 2000);
}

// Mark attendance button
const captureAttendanceButton = document.getElementById('capture-attendance');
captureAttendanceButton.addEventListener('click', () => {
    if (videoFeed.srcObject) {
        simulateFaceDetection();
    } else {
        statusText.textContent = 'Please start the camera first';
    }
});

// Notification system
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Form submissions
const addStudentForm = document.getElementById('add-student-form');
if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Student added successfully!');
        addStudentForm.reset();
    });
}

const uploadImagesForm = document.getElementById('upload-images-form');
if (uploadImagesForm) {
    uploadImagesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Images uploaded successfully!');
        uploadImagesForm.reset();
    });
}

// In a real implementation, we would include:
// 1. OpenCV.js for face detection
// 2. TensorFlow.js for face recognition
// 3. Backend API calls to store and retrieve attendance data
// 4. Database integration for student records
// 5. Authentication system for teachers/administrators