// Navigation commune à toutes les pages
// Pour modifier le menu, éditer uniquement ce fichier
document.addEventListener('DOMContentLoaded', async () => {
    const nav = document.getElementById('topbar');
    if (!nav) return;

    let isLoggedIn = false;

    try {
        const res = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if (res.ok) {
            isLoggedIn = true;
        }
    } catch (err) {
        isLoggedIn = false;
    }

    nav.innerHTML = `
        <header class="topbar">
            <div class="container">
                <div class="brand">Secure Shop</div>
                <nav class="menu">
                    ${isLoggedIn ? `
                        <a href="/">Accueil</a>
                        <a href="/profile">Profil</a>
                        <a href="/logout" id="logout">Déconnexion</a>
                    ` : `
                        <a href="/login">Connexion</a>
                        <a href="/register">Inscription</a>
                    `}
                </nav>
            </div>
        </header>
    `;
    
    // if logout button is clicked, call the logout route
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        });
    }
});
