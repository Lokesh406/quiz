document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    function showSection(sectionId) {
        // Toggle visibility of sections
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('d-none');
                section.classList.add('active');
            } else {
                section.classList.add('d-none');
                section.classList.remove('active');
            }
        });

        // Highlight the corresponding nav link
        navLinks.forEach(link => {
            if (link.dataset.section === sectionId.replace('-section', '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Navigation link click handler
    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetSectionId = link.dataset.section + '-section';
            showSection(targetSectionId);
        });
    });

    // Handle "Get Started" button (if exists)
    const getStartedButton = document.querySelector('#home-section .btn');
    if (getStartedButton) {
        getStartedButton.addEventListener('click', () => {
            showSection('login-section');
        });
    }

    // Default section to show
    showSection('home-section');
});
