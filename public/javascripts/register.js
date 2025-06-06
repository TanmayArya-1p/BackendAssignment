        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('registerForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                let username = document.getElementById('username').value;
                let password = document.getElementById('password').value;
                let res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: username, password: password })
                });
                if (res.status === 200) {
                    alert('Registered User Successfully');
                    window.location.href = '/login';
                } else {
                    alert('Username already exists. Try another username.');
                }
            });
        });