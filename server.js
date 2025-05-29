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

app.get('/api/pets', (req, res) => {
  let sql = 'SELECT * FROM pets WHERE 1=1';
  const params = [];

  if (req.query.name) {
    sql += ' AND name LIKE ?';
    params.push(`%${req.query.name}%`);
  }
  if (req.query.species) {
    sql += ' AND species = ?';
    params.push(req.query.species);
  }
  if (req.query.origin) {
    sql += ' AND origin = ?';
    params.push(req.query.origin);
  }
  if (req.query.minPrice) {
    sql += ' AND price >= ?';
    params.push(req.query.minPrice);
  }
  if (req.query.maxPrice) {
    sql += ' AND price <= ?';
    params.push(req.query.maxPrice);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get('/api/pet-origins', (req, res) => {
  db.query('SELECT DISTINCT origin FROM pets WHERE origin IS NOT NULL', (err, results) => {
    if (err) return res.status(500).send(err);
    const origins = results.map(r => r.origin);
    res.json(origins);
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get('/api/pets/:id', (req, res) => {
  const id = parseInt(req.params.id);

  db.query('SELECT * FROM pets WHERE id = ?', [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(results[0]);
  });
});

app.post('/api/users', (req, res) => {
  const user = req.body;

  // Prvo proveravamo da li već postoji korisnik sa istim email-om ili telefonom
  const checkSql = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  db.query(checkSql, [user.email, user.phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(409).json({ message: 'Korisnik sa istim email-om ili telefonom već postoji.' });
    }

    // Ako ne postoji, ubacujemo korisnika
    const insertSql = `
      INSERT INTO users (name, email, password, phone, address, favorite_types)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      user.name,
      user.email,
      user.password,
      user.phone,
      Array.isArray(user.adress) ? user.adress.join(',') : user.adress,
      user.favourite_types
    ];

    db.query(insertSql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: 'Uspešno ste registrovani!', id: result.insertId });
    });
  });
});

// GET - Sve recenzije
app.get('/api/reviews', (req, res) => {
  db.query('SELECT * FROM reviews', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET - Recenzije za određenog ljubimca
app.get('/api/reviews/pet/:petId', (req, res) => {
  const petId = parseInt(req.params.petId);

  db.query('SELECT * FROM reviews WHERE pet_id = ?', [petId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST - Dodavanje nove recenzije
app.post('/api/reviews', (req, res) => {
  const { user_id, pet_id, comment, rating } = req.body;

  if (!user_id || !pet_id || !rating) {
    return res.status(400).json({ error: 'Required fields: user_id, pet_id, rating' });
  }

  const sql = 'INSERT INTO reviews (user_id, pet_id, comment, rating) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, pet_id, comment || null, rating], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Review added successfully', id: result.insertId });
  });
});

app.post('/api/orders', (req, res) => {
  const { user_id, pet_ids } = req.body;

  if (!user_id || !Array.isArray(pet_ids) || pet_ids.length === 0) {
    return res.status(400).json({ error: 'user_id and pet_ids are required' });
  }

  const status = 'rezervisano'; // početni status
  const now = new Date();

  const values = pet_ids.map(pet_id => [user_id, pet_id, status, null, now]);

  const sql = 'INSERT INTO orders (user_id, pet_id, status, rating, created_at) VALUES ?';

  db.query(sql, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Orders created successfully', count: result.affectedRows });
  });
});

app.post('/api/login', (req, res) => {
  const { name, password } = req.body;

  const sql = 'SELECT * FROM users WHERE name = ? AND password = ?';
  db.query(sql, [name, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json(results[0]); // vraća korisnika ako je uspešno
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});
