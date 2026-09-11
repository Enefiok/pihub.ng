document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const certificateView = document.getElementById('certificate-view');
    const errorMessage = document.getElementById('error-message');
    const printBtn = document.getElementById('print-btn');

    // 🌟 AUTOMATIC ENVIRONMENT DETECTION 🌟
    // Checks if the site is running locally or in production
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Automatically sets the correct base URL
    const API_BASE_URL = isLocalhost 
        ? 'http://127.0.0.1:8000' 
        : 'https://pihub-backend.onrender.com';

    // 1. Extract UUID from the URL
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = window.location.href.match(uuidRegex);
    const certId = match ? match[0] : null;

    console.log("Extracted Certificate ID:", certId); // Debug log
    console.log("Using API Base URL:", API_BASE_URL); // Debug log to confirm environment

    // 2. Fetch Certificate Data
    async function fetchCertificate() {
        if (!certId) {
            showError("No certificate ID found in the URL. Please check the link.");
            return;
        }

        try {
            // Clean template literal construction for the API URL
            const apiUrl = `${API_BASE_URL}/api/certificates/verify/${certId}/`;
            
            console.log("Fetching from:", apiUrl); // Debug log
            
            const response = await fetch(apiUrl);
            
            // Check if the response is actually OK before parsing JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            console.log("API Response:", data); // Debug log

            if (data.is_valid) {
                renderCertificate(data.certificate);
            } else {
                showError(data.message || "This certificate is invalid or has been revoked.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            // Show a user-friendly error message
            showError("Failed to connect to the server. Please check your internet connection or ensure the backend server is running.");
        }
    }

    // 3. Render Data to HTML
    function renderCertificate(cert) {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = new Date(cert.issue_date).toLocaleDateString('en-US', dateOptions);

        document.getElementById('student-name').textContent = cert.student_name;
        document.getElementById('course-title').textContent = cert.course_title;
        document.getElementById('issue-date').textContent = formattedDate;
        document.getElementById('issued-by').textContent = cert.issued_by_name || 'PIHUB Admin';
        document.getElementById('cert-uuid').textContent = cert.certificate_id;

        loadingState.classList.add('hidden');
        certificateView.classList.remove('hidden');
    }

    // 4. Handle Errors
    function showError(msg) {
        loadingState.classList.add('hidden');
        errorMessage.textContent = msg;
        errorState.classList.remove('hidden');
    }

    // 5. Print Functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Initialize
    fetchCertificate();
});