document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com';

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDiv.classList.add('hidden');
        messageDiv.textContent = '';
        messageDiv.className = 'message-box';

        const full_name = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao registrar.');
            }
            
            messageDiv.textContent = data.message || 'Registro enviado com sucesso!';
            messageDiv.classList.add('success');
            messageDiv.classList.remove('hidden');
            registerForm.reset();

        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.classList.add('error');
            messageDiv.classList.remove('hidden');
        }
    });
});