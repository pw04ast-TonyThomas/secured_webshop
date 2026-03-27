# Rapport de Projet P_App_Webstore
## Liste des activités obligatoires (1 point par tâche)
1.	Implémenter une page de login en frontend
    
    Ici, à la submission du form, on prend ses données et on Fetch à l'Api avec les données.
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

2.	Implémenter une page d’inscription en frontend

3.	Remplacer les mots de passes en clair dans la base par un hash

4.	Ajouter un sel

5.	Ajouter un poivre

6.	Corriger les requêtes existantes afin de prévenir l’injection SQL

7.	Implémenter l’utilisation d’un token JWT

8.	Ajouter les rôles administrateur et utilisateur dans le JWT et protéger les routes d’administration

## Liste des activités « faciles » à choix (1 point par tâche)
9.	Mettre en place le HTTPS

10.	Mettre en place une politique de mot de passe fort (minuscules, majuscule, longueur minimale, caractères spéciaux) avec l’affichage d’un indicateur de force

11.	Limiter la durée du token JWT actuel et implémenter un refresh token pour rester connecté sur une longue période

12.	Effectuer un audit des dépendances NPM, corriger et documenter la correction

13.	Vérifier la résistance de vos hash avec l’outil John The Ripper et aux rainbow tables, via un export de la BDD

14.	Gérer les exceptions afin de ne pas retourner trop d’information en cas d’erreur

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
