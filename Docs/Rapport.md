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
#### **Admin Middleware**
```js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.user?.admin) {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(403).json({ error: "Admin only" });
    }

    return res.redirect("/");
  }

  next();
};
```

#### **server.js**
```js
const auth = require("./middleware/auth");
const adminOnly = require("./middleware/admin");

{...}

app.get("/admin", auth, adminOnly, (_req, res) => res.sendFile(path.join(__dirname, "views", "admin.html")));
```
## Liste des activités « faciles » à choix (1 point par tâche)
### 9.	Mettre en place le HTTPS

### 10.	Mettre en place une politique de mot de passe fort (minuscules, majuscule, longueur minimale, caractères spéciaux) avec l’affichage d’un indicateur de force

### 11.	Limiter la durée du token JWT actuel et implémenter un refresh token pour rester connecté sur une longue période

### 12.	Effectuer un audit des dépendances NPM, corriger et documenter la correction
#### bash
faire un audit fix répare automatiquement toutes les vulnérabilitées.
```c
pw04ast@INF-A13-M205 MINGW64 /c/Users/pw04ast.DGEP/Documents/secured_webshop/app (main)
$ npm audit
# npm audit report

body-parser  <=1.20.3 || 2.0.0-beta.1 - 2.0.2
Severity: high
body-parser vulnerable to denial of service when url encoding is enabled - https://github.com/advisories/GHSA-qwcr-r2fm-qrc7
Depends on vulnerable versions of qs
{...}

brace-expansion  <=1.1.12
Severity: moderate
brace-expansion Regular Expression Denial of Service vulnerability - https://github.com/advisories/GHSA-v6h2-p8h4-qcjw
brace-expansion: Zero-step sequence causes process hang and memory exhaustion - https://github.com/advisories/GHSA-f886-m6hf-6m8v
{...}

braces  <3.0.3
Severity: high
Uncontrolled resource consumption in braces - https://github.com/advisories/GHSA-grv7-fg5c-xmjg
{...}

cookie  <0.7.0
cookie accepts cookie name, path, and domain with out of bounds characters - https://github.com/advisories/GHSA-pxg6-pf52-xh8x
{...}

minimatch  <=3.1.3
Severity: high
minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern - https://github.com/advisories/GHSA-3ppc-4f35-3m26
minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments - https://github.com/advisories/GHSA-7r86-cg39-jmmj
minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions - https://github.com/advisories/GHSA-23c5-xmqv-rm74
{...}

path-to-regexp  <=0.1.12
Severity: high
path-to-regexp outputs backtracking regular expressions - https://github.com/advisories/GHSA-9wv6-86v2-598j
path-to-regexp contains a ReDoS - https://github.com/advisories/GHSA-rhx6-c78j-4q9w
path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters - https://github.com/advisories/GHSA-37ch-88jc-xwx2
{...}

picomatch  <=2.3.1
Severity: high
Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching - https://github.com/advisories/GHSA-3v7f-55p6-f55p
Picomatch has a ReDoS vulnerability via extglob quantifiers - https://github.com/advisories/GHSA-c2c7-rcm5-vvqj
{...}

qs  <=6.14.1
Severity: moderate
qs's arrayLimit bypass in comma parsing allows denial of service - https://github.com/advisories/GHSA-w7fw-mjwx-w883
qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion - https://github.com/advisories/GHSA-6rw7-vpxm-498p
{...}

send  <0.19.0
send vulnerable to template injection that can lead to XSS - https://github.com/advisories/GHSA-m6fv-jmcg-4jfg
{...}

11 vulnerabilities (3 low, 2 moderate, 6 high)
```
```c
pw04ast@INF-A13-M205 MINGW64 /c/Users/pw04ast.DGEP/Documents/secured_webshop/app (main)
$ npm audit fix

added 10 packages, removed 6 packages, changed 25 packages, and audited 149 packages in 2s

22 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 13.	Vérifier la résistance de vos hash avec l’outil John The Ripper et aux rainbow tables, via un export de la BDD

### 14.	Gérer les exceptions afin de ne pas retourner trop d’information en cas d’erreur
TODO
Toutes les erreurs sont prises en charge avec `.handleError()`, `.status()` et `.json()`

#### AuthController — Login
```js
  if (...) {
    {...}
    res.status(200).json({ message: "Authentication successful" });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
```

#### AuthController — Register
```js
  if (err) {
    return res.status(500).json({ error: "Insert failed" });
  }

  return res.status(201).json({ message: "Utilisateur créé !" });
```
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
