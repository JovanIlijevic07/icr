const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const pool = require('./db'); // konekcija na bazu (jedinstvena)

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// TEST konekcije sa bazom
pool.query('SELECT 1')
  .then(() => console.log('✅ Uspešno povezan sa MySQL bazom'))
  .catch(err => console.error('❌ Greška pri povezivanju sa bazom:', err.message));

// GET svi ljubimci (sa filtrima)
app.get('/api/pets', async (req, res) => {
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

  try {
    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - sve origin vrednosti
app.get('/api/pet-origins', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT DISTINCT origin FROM pets WHERE origin IS NOT NULL');
    const origins = results.map(r => r.origin);
    res.json(origins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - svi korisnici
app.get('/api/users', async (req, res) => {
  const { email } = req.query;

  try {
    if (email) {
      const [results] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      return res.json(results.length > 0); // true ili false
    }

    const [results] = await pool.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET - jedan ljubimac
app.get('/api/pets/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [results] = await pool.query('SELECT * FROM pets WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - registracija korisnika
app.post('/api/users', async (req, res) => {
  const user = req.body;

  const checkSql = 'SELECT * FROM users WHERE email = ? OR phone = ?';
  const insertSql = `
    INSERT INTO users (name, email, password, phone, address, favorite_types)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [existing] = await pool.query(checkSql, [user.email, user.phone]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Korisnik sa istim email-om ili telefonom već postoji.' });
    }

    const values = [
      user.name,
      user.email,
      user.password,
      user.phone,
      Array.isArray(user.adress) ? user.adress.join(',') : user.adress,
      user.favourite_types
    ];

    const [result] = await pool.query(insertSql, values);
    res.status(201).json({ message: 'Uspešno ste registrovani!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - sve recenzije
app.get('/api/reviews', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM reviews');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - recenzije za određenog ljubimca
app.get('/api/reviews/pet/:petId', async (req, res) => {
  const petId = parseInt(req.params.petId);
  try {
    const [results] = await pool.query('SELECT * FROM reviews WHERE pet_id = ?', [petId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - dodavanje recenzije
app.post('/api/reviews', async (req, res) => {
  const { user_id, pet_id, comment, rating } = req.body;

  if (!user_id || !pet_id || !rating) {
    return res.status(400).json({ error: 'Required fields: user_id, pet_id, rating' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (user_id, pet_id, comment, rating) VALUES (?, ?, ?, ?)',
      [user_id, pet_id, comment || null, rating]
    );
    res.json({ message: 'Review added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - kreiranje porudžbina
app.post('/api/orders', async (req, res) => {
  const { user_id, pet_ids } = req.body;

  if (!user_id || !Array.isArray(pet_ids) || pet_ids.length === 0) {
    return res.status(400).json({ error: 'user_id and pet_ids are required' });
  }

  const status = 'rezervisano';
  const now = new Date();
  const values = pet_ids.map(pet_id => [user_id, pet_id, status, null, now]);

  try {
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, pet_id, status, rating, created_at) VALUES ?',
      [values]
    );
    res.json({ message: 'Orders created successfully', count: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT id, name, email, phone FROM users WHERE id = ?';

  try {
    const [results] = await pool.query(query, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('Greška prilikom dohvatanja korisnika:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, password, favourite_types } = req.body;

  // Validacija: obavezno ime i email npr.
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Za password možeš imati poseban uslov:
  // Ako password nije prazan string, menjaj ga, inače ne diraj lozinku
  // Takođe, za sigurnost: trebaš da heširaš lozinku pre ubacivanja (npr. bcrypt)

  if (password) {
    const bcrypt = require('bcrypt');
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Hashing error' });

      const sql = 'UPDATE users SET name = ?, email = ?, phone = ?, password = ?, favorite_types = ? WHERE id = ?';
      pool.query(sql, [name, email, phone, hashedPassword, favourite_types, userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'User updated successfully' });
      });
    });
  } else {
    // Ako nema passworda, ne diraj kolonu password
    const sql = 'UPDATE users SET name = ?, email = ?, phone = ?, favorite_types = ? WHERE id = ?';
    pool.query(sql, [name, email, phone, favourite_types, userId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'User updated successfully' });
    });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log('Tražim porudžbine za userId:', userId);

  const sql = `
    SELECT orders.*, pets.name AS pet_name, pets.species
    FROM orders
    JOIN pets ON orders.pet_id = pets.id
    WHERE orders.user_id = ?;
  `;

  try {
    const [results] = await pool.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Greška prilikom dohvatanja narudžbina:', err);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});