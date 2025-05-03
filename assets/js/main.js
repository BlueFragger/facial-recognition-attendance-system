// Import facial recognition module
import { initFaceRecognition, startCamera, processVideoFrame, markAttendance, stopCamera, cleanUp } from './face-recognition.js';

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

// Camera and face recognition functionality
const startCameraButton = document.getElementById('start-camera');
const captureAttendanceButton = document.getElementById('capture-attendance');
const videoFeed = document.getElementById('video-feed');
const statusText = document.getElementById('status-text');
const faceBox = document.getElementById('face-box');
let recognitionInterval;
let faceRecognitionInitialized = false;

// Initialize facial recognition system when the page loads
window.addEventListener('load', async () => {
    try {
        statusText.textContent = 'Initializing facial recognition system...';
        faceRecognitionInitialized = await initFaceRecognition();
        statusText.textContent = 'System ready. Click "Start Camera" to begin.';
    } catch (error) {
        console.error('Failed to initialize facial recognition:', error);
        statusText.textContent = 'Error: Failed to initialize facial recognition system.';
    }
});

// Start camera button
startCameraButton.addEventListener('click', async () => {
    if (!faceRecognitionInitialized) {
        statusText.textContent = 'Error: Facial recognition system not initialized.';
        return;
    }
    
    try {
        // Start the camera
        const stream = await startCamera();
        videoFeed.srcObject = stream;
        
        // Update UI
        statusText.textContent = 'Camera active - Waiting for faces';
        startCameraButton.textContent = 'Camera Active';
        startCameraButton.disabled = true;
        
        // Start continuous face detection and recognition
        recognitionInterval = setInterval(() => {
            processVideoFrameAndUpdateUI();
        }, 100); // Process every 100ms
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        statusText.textContent = 'Error: Cannot access camera';
    }
});

// Process video frame and update UI
async function processVideoFrameAndUpdateUI() {
    if (!videoFeed.srcObject) return;
    
    const recognizedStudent = await processVideoFrame(videoFeed);
    
    if (recognizedStudent) {
        // Update status
        statusText.textContent = `Student identified: ${recognizedStudent.name} (${recognizedStudent.id})`;
        
        // Reset automatic recognition for this student to avoid duplicates
        clearInterval(recognitionInterval);
        
        // Mark attendance
        const success = await markAttendance(recognizedStudent);
        
        if (success) {
            updateAttendanceTable(recognizedStudent);
            showNotification(`Student ${recognizedStudent.name} marked present successfully!`);
        }
        
        // Restart recognition after a delay
        setTimeout(() => {
            recognitionInterval = setInterval(() => {
                processVideoFrameAndUpdateUI();
            }, 100);
        }, 3000);
    }
}

// Manual capture attendance button
captureAttendanceButton.addEventListener('click', async () => {
    if (!videoFeed.srcObject) {
        statusText.textContent = 'Please start the camera first';
        return;
    }
    
    statusText.textContent = 'Processing...';
    clearInterval(recognitionInterval);
    
    const recognizedStudent = await processVideoFrame(videoFeed);
    
    if (recognizedStudent) {
        // Mark attendance
        const success = await markAttendance(recognizedStudent);
        
        if (success) {
            updateAttendanceTable(recognizedStudent);
            showNotification(`Student ${recognizedStudent.name} marked present successfully!`);
        }
    } else {
        statusText.textContent = 'No student recognized. Please try again.';
    }
    
    // Restart recognition
    recognitionInterval = setInterval(() => {
        processVideoFrameAndUpdateUI();
    }, 100);
});

// Update attendance table
function updateAttendanceTable(student) {
    const tableBody = document.getElementById('attendance-list');
    const rows = tableBody.getElementsByTagName('tr');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if student is already in the table
    let found = false;
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells[0].textContent === student.id) {
            // Update existing row
            cells[2].textContent = currentTime;
            cells[3].textContent = 'Present';
            cells[3].className = 'status-present';
            found = true;
            break;
        }
    }
    
    // Add new row if student not found
    if (!found) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${currentTime}</td>
            <td class="status-present">Present</td>
        `;
        tableBody.appendChild(newRow);
    }
    
    // Update statistics
    updateAttendanceStatistics();
}

// Update attendance statistics
function updateAttendanceStatistics() {
    const tableBody = document.getElementById('attendance-list');
    const rows = tableBody.getElementsByTagName('tr');
    
    let presentCount = 0;
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        if (cells[3].textContent === 'Present') {
            presentCount++;
        }
    }
    
    const totalStudents = 35; // This should come from your database
    const absentCount = totalStudents - presentCount;
    const attendanceRate = Math.round((presentCount / totalStudents) * 100);
    
    document.querySelectorAll('.stat-card p')[1].textContent = presentCount.toString();
    document.querySelectorAll('.stat-card p')[2].textContent = absentCount.toString();
    document.querySelectorAll('.stat-card p')[3].textContent = `${attendanceRate}%`;
}

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
    addStudentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // In a real application, this would send data to your server and capture face images
        showNotification('Student added successfully!');
        addStudentForm.reset();
    });
}

const uploadImagesForm = document.getElementById('upload-images-form');
if (uploadImagesForm) {
    uploadImagesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // In a real application, this would upload images to your server for training
        showNotification('Images uploaded successfully!');
        uploadImagesForm.reset();
    });
}

// Clean up resources when page is unloaded
window.addEventListener('beforeunload', () => {
    if (recognitionInterval) {
        clearInterval(recognitionInterval);
    }
    cleanUp();
});
