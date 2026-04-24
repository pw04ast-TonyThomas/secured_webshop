const sha256 = require("js-sha256");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// returns a random string the of the length passed.
function getRandomString(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

module.exports = {
  // ----------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

    const queryString = `SELECT * FROM users WHERE email = ?`;

    let hashPassword

    try {
      db.query(queryString, [email], (err, results) => {
        if (err) {
          return res.status(500).json({ error: `Erreur Serveur` });
        } else if (results.length === 0) {
          res.status(401).json({ error: "L'utilisateur n'existe pas" });
        }

        console.log("PEPPER:", process.env.PEPPER + "   SALT:", results[0].salt);
        hashPassword = sha256(password + process.env.PEPPER + results[0].salt);

        // Checks for 1 row and that the hashed password in db is equal to the one we just hashed using user entry.
        if (results.length === 1 && hashPassword == results[0].password) {
          var token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 72 * 60, // now + 72 hours 
              name: email,
              admin: results[0].role == "admin" ? true : false 
            },
            process.env.PRIVATEKEY,
            { algorithm: "HS256" },
          );
          res.cookie("jwt", token, { httpOnly: true, secure: false });
          res.status(200).json({ message: "Authentication successful" });
        } else {
          res.status(401).json({ error: "Invalid username or password" });
        }
      })
    } catch (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // ----------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------
  register: (req, res) => {
    const {username, email, password, address} = req.body;
    if (!username || !email || !password || !address) return res.status(400).json({ error: "touts les champs doivent être remplis." });

    const emailQuery = `SELECT email FROM users WHERE email = ?;`

    db.query(emailQuery, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: `Server Error` });
      }

      if (results.length > 0) 
        return res.status(400).json({ error: `Cet Email est déja pris.`})

      const salt = getRandomString(Math.ceil(Math.random() * 100)) // returns a string between 1 to 100 in length 
      const hashPassword = sha256(password + process.env.PEPPER + salt);

      const insertQuery = `INSERT INTO users (username, email, password, address, salt) VALUES (?, ?, ?, ?, ?)`;

      db.query(insertQuery, [username, email, hashPassword, address, salt], (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Insert failed" });
        }

        return res.status(201).json({ message: "Utilisateur créé !" });
      });
    })
  },
};


