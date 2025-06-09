function logoutHandler() {
    fetch('/api/auth/logout', {
        method: 'POST',
    })
    .then(res => {
        if (res.status === 200) {
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    })
}
window.logoutHandler = logoutHandler;