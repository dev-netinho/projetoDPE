document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const btnLogin = document.getElementById('btnLogin');

    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.classList.add('hidden');

        btnLogin.disabled = true;
        btnLogin.classList.add('loading');
        btnLogin.querySelector('.btn-text').textContent = '';
        btnLogin.querySelector('.btn-loader').classList.remove('hidden');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no login.');
            }
            
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            window.location.href = 'index.html';

        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('hidden');
        } finally {
            btnLogin.disabled = false;
            btnLogin.classList.remove('loading');
            btnLogin.querySelector('.btn-text').textContent = 'Entrar';
            btnLogin.querySelector('.btn-loader').classList.add('hidden');
        }
    });
});