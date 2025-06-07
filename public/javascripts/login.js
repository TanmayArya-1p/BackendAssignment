window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;
        let res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        });
        if (res.status === 200) {
            window.location.href = '/home';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });
});


// TODO: CREATE IMAGE UPLAOD ON CREATE ITEM AND RETURN THAT URL
// TODO: COLLECT ALL BILL DATA AND STORE IT


