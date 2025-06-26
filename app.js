document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('d-none');
                section.classList.add('active'); // Add active class if you want to style active section
            } else {
                section.classList.add('d-none');
                section.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            if (link.dataset.section === sectionId.replace('-section', '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetSection = event.target.dataset.section + '-section';
            showSection(targetSection);
        });
    });

    // Handle "Get Started" button on home page
    const getStartedButton = document.querySelector('#home-section .btn');
    if (getStartedButton) {
        getStartedButton.addEventListener('click', () => {
            showSection('login-section');
        });
    }

    // Initialize by showing the home section
    showSection('home-section');
});
