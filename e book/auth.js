const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Simulate Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    if (email && password) {
        // Retrieve stored profile or use default
        const storedProfile = localStorage.getItem('adminProfile');
        const profile = storedProfile ? JSON.parse(storedProfile) : {
            email: 'admin@bookshelf.com',
            password: 'admin123',
            fullName: 'Admin User'
        };

        // Validate credentials
        if (email === profile.email && password === profile.password) {
            // Save session
            localStorage.setItem('currentUser', JSON.stringify({
                email: profile.email,
                name: profile.fullName
            }));

            // Redirect to main app
            alert('Login Successful! Redirecting...');
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    }
});

// Simulate Signup
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;

    if (name && email && password) {
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        // Save mock session
        localStorage.setItem('currentUser', JSON.stringify({ email: email, name: name }));

        // Create Admin Profile from Signup Data
        const newProfile = {
            username: name.toLowerCase().replace(/\s+/g, '').slice(0, 10), // Generate simple username
            fullName: name,
            email: email,
            contact: '',
            password: password, // Mock storage
            avatarId: null
        };
        localStorage.setItem('adminProfile', JSON.stringify(newProfile));

        alert('Account Created! Redirecting...');
        window.location.href = 'index.html';
    }
});
