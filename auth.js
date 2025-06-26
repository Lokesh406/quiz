document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm'); // For teacher/student registration

    // --- Signup Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = signupForm.signupEmail.value;
            const password = signupForm.signupPassword.value;
            const confirmPassword = signupForm.confirmPassword.value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            // Password strength validation (already in HTML pattern, but good to have JS fallback)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
                return;
            }

            // Simulate user registration
            let users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(user => user.email === email)) {
                alert('User with this email already exists!');
                return;
            }

            users.push({ email, password, role: 'student' }); // Default role for signup
            localStorage.setItem('users', JSON.stringify(users));
            alert('Signup successful! You can now log in.');
            // Optionally redirect to login page
            document.querySelector('[data-section="login"]').click(); // Simulate click on login nav link
            signupForm.reset();
        });
    }

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = loginForm.loginEmail.value;
            const password = loginForm.loginPassword.value;

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                alert('Login successful! Welcome, ' + email);
                localStorage.setItem('loggedInUser', JSON.stringify(user)); // Store logged in user
                window.location.href = 'quiz.html'; // Redirect to the quiz page
            } else {
                alert('Invalid email or password.');
            }
        });
    }


});