const db = require("../config/db");

module.exports = {
  // ----------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------
  login: (req, res) => {
    const { email, password } = req.body;

    console.log(req.body);

    console.log(email + " " + password);

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message, query: query });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ error: "Email ou mot de passe incorrect" });
      }

      res.json({ message: "Connexion réussie", user: results[0] });
    });
  },

  // ----------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------
  register: (req, res) => {
    const {username, email, password, address} = req.body;

    if (!username || !email || !password || !address) {
      return res.status(400).json({ error: "touts les champs doivent être remplis." });
    }

    const emailQuery = `SELECT email FROM users WHERE email = ?;`

    db.query(emailQuery, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: `Server Error` });
      }

      console.log(results)

      if (results.length > 0) 
        return res.status(400).json({ error: `Cet Email est déja pris.`})

      const insertQuery = `
      INSERT INTO users (username, email, password, address) VALUES (?, ?, ?, ?)`;

      db.query(insertQuery, [username, email, password, address], (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Insert failed" });
        }

        return res.status(201).json({ message: "Utilisateur créé !" });
      });
    })


    // res.status(501).json({ error: "Non implémenté — TODO exercice 7" });
  },
};
