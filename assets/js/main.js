// Import facial recognition module
import { initFaceRecognition, startCamera, processVideoFrame, markAttendance, stopCamera, cleanUp } from './face-recognition.js';

// Set current date
document.addEventListener('DOMContentLoaded', function() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString(undefined, options);
    }

    // Tab switching functionality - Fixed
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
    let recognitionInterval;
    let faceRecognitionInitialized = false;

    // Initialize facial recognition system when the page loads
    try {
        if (statusText) {
            statusText.textContent = 'Initializing facial recognition system...';
            // In a real app, we would initialize face recognition here
            // For demo purposes, we'll just set it to true
            faceRecognitionInitialized = true;
            setTimeout(() => {
                statusText.textContent = 'System ready. Click "Start Camera" to begin.';
            }, 1000);
        }
    } catch (error) {
        console.error('Failed to initialize facial recognition:', error);
        if (statusText) {
            statusText.textContent = 'Error: Failed to initialize facial recognition system.';
        }
    }

    // Start camera button
    if (startCameraButton) {
        startCameraButton.addEventListener('click', async () => {
            if (!faceRecognitionInitialized) {
                statusText.textContent = 'Error: Facial recognition system not initialized.';
                return;
            }
            
            try {
                // In a real app, we would start the camera here
                // For demo purposes, we'll just update the UI
                statusText.textContent = 'Camera active - Waiting for faces';
                startCameraButton.textContent = 'Camera Active';
                startCameraButton.disabled = true;
                
                showNotification('Camera activated successfully!');
                
            } catch (error) {
                console.error('Error accessing camera:', error);
                statusText.textContent = 'Error: Cannot access camera';
            }
        });
    }

    // Manual capture attendance button
    if (captureAttendanceButton) {
        captureAttendanceButton.addEventListener('click', async () => {
            if (startCameraButton && startCameraButton.disabled !== true) {
                statusText.textContent = 'Please start the camera first';
                return;
            }
            
            statusText.textContent = 'Processing...';
            
            // Simulate student recognition
            setTimeout(() => {
                const student = {
                    id: 'S1004',
                    name: 'Sarah Wilson'
                };
                
                updateAttendanceTable(student);
                showNotification(`Student ${student.name} marked present successfully!`);
                statusText.textContent = `Student identified: ${student.name} (${student.id})`;
            }, 1500);
        });
    }

    // Update attendance table
    function updateAttendanceTable(student) {
        const tableBody = document.getElementById('attendance-list');
        if (!tableBody) return;
        
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
        const statCards = document.querySelectorAll('.stat-card p');
        if (statCards.length < 4) return;
        
        const tableBody = document.getElementById('attendance-list');
        if (!tableBody) return;
        
        const rows = tableBody.getElementsByTagName('tr');
        
        let presentCount = 0;
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            if (cells.length > 3 && cells[3].textContent === 'Present') {
                presentCount++;
            }
        }
        
        const totalStudents = 35; // This should come from your database
        const absentCount = totalStudents - presentCount;
        const attendanceRate = Math.round((presentCount / totalStudents) * 100);
        
        statCards[1].textContent = presentCount.toString();
        statCards[2].textContent = absentCount.toString();
        statCards[3].textContent = `${attendanceRate}%`;
    }

    // Notification system
    function showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
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
});

// Clean up resources when page is unloaded
window.addEventListener('beforeunload', () => {
    // In a real app, we would clean up resources here
});
