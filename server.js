const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Povezivanje sa MySQL bazom
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // ← ovde unesi tvoju lozinku
  database: 'petshop'   // ← ovde unesi tačan naziv tvoje baze
});

db.connect(err => {
  if (err) {
    console.error('Greška pri povezivanju sa bazom:', err);
  } else {
    console.log('Povezano sa MySQL bazom!');
  }
});

// Primer rute: svi ljubimci
app.get('/api/pets', (req, res) => {
  db.query('SELECT * FROM pets', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
