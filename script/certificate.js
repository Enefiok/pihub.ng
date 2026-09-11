document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const certificateView = document.getElementById('certificate-view');
    const errorMessage = document.getElementById('error-message');
    const printBtn = document.getElementById('print-btn');

    // 1. Extract UUID from the URL
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = window.location.href.match(uuidRegex);
    const certId = match ? match[0] : null;

    console.log("Extracted Certificate ID:", certId); // Debug log

    // 2. Fetch Certificate Data
    async function fetchCertificate() {
        if (!certId) {
            showError("No certificate ID found in the URL. Please check the link.");
            return;
        }

        try {
            // Using string concatenation instead of template literals
            const baseUrl = 'http://127.0.0.1:8000/api/certificates/verify/';
            const apiUrl = baseUrl + certId + '/';
            
            console.log("Fetching from:", apiUrl); // Debug log
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            console.log("API Response:", data); // Debug log

            if (data.is_valid) {
                renderCertificate(data.certificate);
            } else {
                showError(data.message || "This certificate is invalid or has been revoked.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showError("Failed to connect to the server. Please check your internet connection or ensure the Django server is running.");
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