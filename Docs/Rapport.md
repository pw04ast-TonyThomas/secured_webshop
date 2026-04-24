# Rapport de Projet P_App_Webstore
## Liste des activités obligatoires (1 point par tâche)
### 1.	Implémenter une page de login en frontend
#### **login.html**
[//]: # (Ici, à la submission du form, on prend ses données et on Fetch à l'Api avec les données.)
```js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const email = formData.get("email");
    const password = formData.get("password");

    console.log(formData);

    const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
    window.location.href = "/"; // homepage
    } else {
    alert(data.error);
    }
});
```

### 2.	Implémenter une page d’inscription en frontend
#### **register.html**
[//]: # (Ici, à la submission du form, on prend ses données et on Fetch à l'Api avec les données.)
```js
    document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const address = formData.get("address");

    console.log(formData);

    const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    body: JSON.stringify({ username ,email, password, address }),
    });

    const data = await res.json();

    if (res.ok) {
    window.location.href = "/login"; // Login
    } else {
    alert(data.error);
    }
});
```
### 3.	Remplacer les mots de passes en clair dans la base par un hash
#### **init.sql**
```sql
INSERT INTO users (username, email, password, role, address, salt) VALUES
('...', '...', 'e805855c833edab5fe94340035d64d77149ea098d536ab59c9353abcee3a34d1', '...', '...', '...'),
('...', '...', '99ba08c66e73450e25f1afd7d5d9b2e797b4995fb2a4c9facdeb300152d4abbe', '...', '...', '...');
```
#### **AuthController**
```js
hashPassword = sha256(password + process.env.PEPPER + results[0].salt);
```
### 4.	Ajouter un sel
#### **init.sql**
```sql
INSERT INTO users (username, email, password, role, address, salt) VALUES
('...', '...', '...', '...', '...', '7oSt85ZSheRVfYS9m0yNkjxAVlzCqzFFMZgqJve6GYf5AyiWfFOSdGtVr780f6YsspY93cPFnflpj'),
('...', '...', '...', '...', '...', 'hRXZEJe5nJjHeConwb8mCaDiWHNwAUfP3b4R3y7BhHi');
```

#### **AuthController — Login**
On prend le Salt depuis la db pour hash le mot de passe entré par l'utilisateur.
```js
hashPassword = sha256(password + process.env.PEPPER + results[0].salt);
```

#### **AuthController — Register**
On crée un Salt aléatoire que l'on ajoute ensuite à la création du mot de passe et à la db.

```js
const salt = getRandomString(Math.ceil(Math.random() * 100)) // returns a string between 1 to 100 in length 
const hashPassword = sha256(password + process.env.PEPPER + salt);

const insertQuery = `INSERT INTO users (username, email, password, address, salt) VALUES (?, ?, ?, ?, ?)`;
db.query(insertQuery, [username, email, hashPassword, address, salt], (err, results) => {"..."}
```

### 5.	Ajouter un poivre
#### .env
On ajoute le Pepper au .env pour qu'il ne puisse pas être accedé depuis l'exterieur.
```
PEPPER=PepePepePepe
```

#### **AuthController — Login**
On prend le Pepper depuis le .env pour hash le mot de passe entré par l'utilisateur.
```js
hashPassword = sha256(password + process.env.PEPPER + results[0].salt);
```

#### **AuthController — Register**
On prend encore une fois le Pepper depuis le .env pour hash le mot de passe entré par l'utilisateur.
```js
const hashPassword = sha256(password + process.env.PEPPER + salt);
```

### 6.	Corriger les requêtes existantes afin de prévenir l’injection SQL
#### **AuthController — Login**
On utilise une requête préparée pour prendre l'utilisateur.
```js
const queryString = `SELECT * FROM users WHERE email = ?`;
db.query(queryString, [email], (err, results) => {...}
```

#### **AuthController — Register**
On utilise une requête préparée pour vérifier que l'Email n'est pas pris et pour la création de l'utilisateur.
```js
const emailQuery = `SELECT email FROM users WHERE email = ?;`
db.query(emailQuery, [email], (err, results) => {...}

{...}

const insertQuery = `INSERT INTO users (username, email, password, address, salt) VALUES (?, ?, ?, ?, ?)`;
db.query(insertQuery, [username, email, hashPassword, address, salt], (err, results) => {...}
```

### 7.	Implémenter l’utilisation d’un token JWT
#### **AuthController — Login**
On crée le token au login.
```js
var token = jwt.sign(
    {
        exp: Math.floor(Date.now() / 1000) + 60 * 72 * 60, // now + 72 hours 
        name: email,
    },
    process.env.PRIVATEKEY,
    { algorithm: "HS256" },
);
res.cookie("jwt", token, { httpOnly: true, secure: false });
```

#### **Auth Middleware**
On utilise un middleware pour vérifier le token. Si le token n'est pas valide / non présent on peut, si c'est un appel API retourner du JSON ou si c'est une page web, rediriger au login. 
```js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const publicRoutes = ["/login", "/register"];

  // allow public pages
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const token = req.cookies?.jwt;

  // function to handle unauthenticated cases
  const handleError = (status, message) => {
    // if it's an API call, return JSON
    if (req.originalUrl.startsWith("/api")) {
      return res.status(status).json({ error: message });
    }

    // If it's a web page, redirect
    return res.redirect("/login");
  };

  if (!token) {
    return handleError(401, "Non authentifié");
  }

  try {
    const decoded = jwt.verify(token, process.env.PRIVATEKEY);
    req.user = decoded;
    next();
  } catch (err) {
    return handleError(403, "Token invalide");
  }
};
```

#### **Auth.js**
On peut manuellement mettre le middleware dans la route.
```js
// Import the Auth middleware
const auth       = require('../middleware/auth');

router.post('/login',    controller.login);
router.post('/register', controller.register);
// Check if user is logged in, uses auth middleware.
router.get("/me", auth, (req, res) => {
  res.json({
    loggedIn: true,
    user: req.user
  });
});
// Logout route.
router.post('/logout', auth, (req, res) => {
  res.clearCookie('jwt');
  res.json({ message: "Logged out" });
});
```

#### **Profile.js**
Ou on peut faire que le router l'utilise.
```js
// Import the Auth middleware
const auth = require('../middleware/auth');

// Use the middleware
router.use(auth)

{...}

router.get('/', controller.get);
router.post('/', controller.update);
router.post('/photo', upload.single('photo'), controller.uploadPhoto);
```

### 8.	Ajouter les rôles administrateur et utilisateur dans le JWT et protéger les routes d’administration

## Liste des activités « faciles » à choix (1 point par tâche)
### 9.	Mettre en place le HTTPS

### 10.	Mettre en place une politique de mot de passe fort (minuscules, majuscule, longueur minimale, caractères spéciaux) avec l’affichage d’un indicateur de force

### 11.	Limiter la durée du token JWT actuel et implémenter un refresh token pour rester connecté sur une longue période

### 12.	Effectuer un audit des dépendances NPM, corriger et documenter la correction

### 13.	Vérifier la résistance de vos hash avec l’outil John The Ripper et aux rainbow tables, via un export de la BDD

### 14.	Gérer les exceptions afin de ne pas retourner trop d’information en cas d’erreur

## Liste des activités « moyennes » à choix (2 points par tâche)

15.	Limiter le nombre de tentatives de login (exemple : 5 essais par minute par IP) pour contrer le brute-force

16.	Implémenter un verrouillage de compte après N tentative de connexion échouées, enregistrer les tentatives en BDD et prévoir un mécanisme de déblocage

17.	Réaliser un audit de sécurité de votre application, lister les failles identifiées en les classant selon le top 10 2025 OWASP

18.	Chiffrement des données sensibles (adresse, etc.) dans la base  

19.	Protection XSS : identifier une faille XSS dans l’application et faire en sorte de la corriger

20.	Mettre en place un principe de moindre privilège sur la BDD, créer un utilisateur spécifique qui sera employé par les scripts

## Liste des activités « difficiles » à choix (3 points par tâche)

1.	Implémenter une protection CSRF sur un formulaire du site

2.	Journalisation sécurisée des événements : logger les connexions, accès refusés et erreurs sans exposer de données sensibles

3.	Implémenter une authentification à double facteur

4.	Dans sa version actuelle, le web shop peut recevoir votre photo de profil mais il faut mettre en place de la sécurité pour éviter l’envoi de fichier malveillants 

5.	Scanner l’application avec OWASP ZAP, récupérer le rapport de scan et corriger au moins 3 alertes
