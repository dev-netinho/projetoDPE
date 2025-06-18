document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('errorMessage');

    // IMPORTANTE: Use a URL pública do seu back-end no Render.com aqui!
    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessageDiv.classList.add('hidden');

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
            
            // Se o login for bem-sucedido:
            // 1. Salva o token e os dados do usuário no localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user)); // Salva o objeto do usuário

            // 2. Redireciona para a página principal do painel
            window.location.href = 'index.html';

        } catch (error) {
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.classList.remove('hidden');
        }
    });
});