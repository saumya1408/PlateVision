// Global state
let selectedFile = null;
let selectedSample = '';
let isProcessing = false;

// DOM elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadText = document.getElementById('uploadText');
const processBtn = document.getElementById('processBtn');
const processText = document.getElementById('processText');
const resultsSection = document.getElementById('resultsSection');
const processSteps = document.getElementById('processSteps');
const selectedSampleDiv = document.getElementById('selectedSample');
const selectedSampleName = document.getElementById('selectedSampleName');
const detectedText = document.getElementById('detectedText');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Processing steps data
const processingSteps = [
    { id: 'original', title: 'Original Image', description: 'Input image uploaded by user', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`, gradient: 'gradient-blue' },
    { id: 'grayscale', title: 'Grayscale Conversion', description: 'Converting to grayscale for better processing', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`, gradient: 'gradient-gray' },
    { id: 'edge', title: 'Edge Detection', description: 'Detecting edges using Canny algorithm', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>`, gradient: 'gradient-yellow' },
    { id: 'contoured', title: 'Contour Detection', description: 'Finding rectangular contours', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`, gradient: 'gradient-green' },
    { id: 'cropped', title: 'License Plate Extraction', description: 'Cropping the detected license plate', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.448 1-1V8a2 2 0 0 0-2-2h-1c0-.552-.448-1-1-1H6c-.552 0-1 .448-1 1H4a2 2 0 0 0-2 2v3c0 .552.448 1 1 1"/><path d="M21 16c.552 0 1 .448 1 1v3a2 2 0 0 1-2 2h-1c0 .552-.448 1-1 1H6c-.552 0-1-.448-1-1H4a2 2 0 0 1-2-2v-3c0-.552.448-1 1-1"/></svg>`, gradient: 'gradient-purple' },
    { id: 'annotated', title: 'Final Result', description: 'Annotated image with detected text', icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`, gradient: 'gradient-green' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateProcessButton();
});

function initializeEventListeners() {
    // File upload events
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragenter', handleDrag);
    dropZone.addEventListener('dragover', handleDrag);
    dropZone.addEventListener('dragleave', handleDrag);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // Sample image events
    const sampleItems = document.querySelectorAll('.sample-item');
    sampleItems.forEach(item => {
        item.addEventListener('click', () => handleSampleSelect(item));
    });
    
    // Process button
    processBtn.addEventListener('click', handleProcess);
    
    // Mobile menu
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
        dropZone.classList.add('drag-active');
    } else if (e.type === 'dragleave') {
        dropZone.classList.remove('drag-active');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleFileSelection(file);
        } else {
            showToast('Invalid file type', 'Please upload an image file', 'error');
        }
    }
}

function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
}

function handleFileSelection(file) {
    selectedFile = file;
    selectedSample = '';
    clearSampleSelection();
    updateUploadDisplay();
    updateProcessButton();
}

function handleSampleSelect(item) {
    const sampleName = item.dataset.sample;
    const sampleLabel = item.querySelector('.sample-overlay p').textContent;
    
    clearSampleSelection();
    clearFileSelection();
    
    selectedSample = sampleName;
    item.classList.add('selected');
    
    selectedSampleDiv.style.display = 'block';
    selectedSampleName.textContent = sampleLabel;
    updateProcessButton();
}

function clearSampleSelection() {
    document.querySelectorAll('.sample-item').forEach(item => {
        item.classList.remove('selected');
    });
    selectedSampleDiv.style.display = 'none';
}

function clearFileSelection() {
    selectedFile = null;
    fileInput.value = '';
    updateUploadDisplay();
}

function updateUploadDisplay() {
    if (selectedFile) {
        dropZone.classList.add('file-selected');
        uploadText.innerHTML = `
            <p class="file-info">${selectedFile.name}</p>
            <p class="file-size">${(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
    } else {
        dropZone.classList.remove('file-selected');
        uploadText.innerHTML = `
            <p class="upload-title">Drop your image here or click to browse</p>
            <p class="upload-subtitle">Supports JPG, PNG, GIF up to 10MB</p>
        `;
    }
}

function updateProcessButton() {
    const hasSelection = selectedFile || selectedSample;
    processBtn.disabled = !hasSelection || isProcessing;
}

async function handleProcess() {
    if (isProcessing || (!selectedFile && !selectedSample)) {
        return;
    }
    
    isProcessing = true;
    updateProcessButton();
    
    processBtn.classList.add('processing');
    processText.innerHTML = `
        <div class="spinner"></div>
        Processing Magic...
    `;
    
    try {
        const formData = new FormData();
        if (selectedFile) {
            formData.append('image', selectedFile);
        } else if (selectedSample) {
            formData.append('selected_image', selectedSample);
        }

        const response = await fetch('/process', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }

        detectedText.textContent = result.text;
        generateProcessingSteps(result.steps);
        showToast('Processing Complete!', `License plate detected: ${result.text}`, 'success');
        resultsSection.style.display = 'block';
        setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    } catch (error) {
        showToast('Processing Failed', error.message, 'error');
    } finally {
        isProcessing = false;
        processBtn.classList.remove('processing');
        processText.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                <path d="M5 3v4"/>
                <path d="M19 17v4"/>
                <path d="M3 5h4"/>
                <path d="M17 19h4"/>
            </svg>
            Analyze License Plate
        `;
        updateProcessButton();
    }
}

function generateProcessingSteps(steps) {
    processSteps.innerHTML = '';
    
    processingSteps.forEach((step, index) => {
        const stepCard = document.createElement('div');
        stepCard.className = 'step-card';
        stepCard.innerHTML = `
            <div class="step-header">
                <div class="step-title-row">
                    <div class="step-icon ${step.gradient}">
                        ${step.icon}
                    </div>
                    <h4 class="step-title">${step.title}</h4>
                    <div class="step-badge">Step ${index + 1}</div>
                </div>
                <p class="step-description">${step.description}</p>
            </div>
            <div class="step-image">
                <img src="${steps[step.id]}" alt="${step.title}" loading="lazy">
            </div>
        `;
        
        processSteps.appendChild(stepCard);
        
        setTimeout(() => {
            stepCard.classList.add('visible');
        }, index * 500);
    });
}

function showToast(title, message, type = 'success') {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const toastIcon = toast.querySelector('.toast-icon');
    if (type === 'error') {
        toastIcon.style.background = '#ef4444';
        toastIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
        toastIcon.style.background = '#10b981';
        toastIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>`;
    }
    
    toast.classList.add('show');
    setTimeout(() => hideToast(), 5000);
}

function hideToast() {
    toast.classList.remove('show');
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
}

// Add gradient for gray
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .gradient-gray {
            background: linear-gradient(135deg, #6b7280, #4b5563) !important;
        }
    `;
    document.head.appendChild(style);
});

// Intersection Observer for animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationDelay = '0ms';
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => observer.observe(card));
});