const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, phone, address, favorite_types } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Email je već registrovan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, phone, address, favorite_types) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address, favorite_types]
    );

    res.status(201).json({ message: 'Uspešno registrovan korisnik.' });
  } catch (err) {
    res.status(500).json({ message: 'Greška na serveru', error: err });
  }
});

const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Pogrešan email ili lozinka.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'tajni_kljuc', { expiresIn: '1h' });

    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Greška na serveru', error: err });
  }
});

module.exports = router;