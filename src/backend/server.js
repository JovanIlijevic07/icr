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

  if (req.query.year_min) {
    sql += ' AND age >= ?';
    params.push(req.query.year_min);
  }
  if (req.query.year_max) {
    sql += ' AND age <= ?';
    params.push(req.query.year_max);
  }

  if (req.query.size) {
    sql += ' AND size = ?';
    params.push(req.query.size);
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

// POST - kreiranje porudžbina
app.post('/api/orders', async (req, res) => {
  const { user_id, pet_ids } = req.body;

  if (!user_id || !Array.isArray(pet_ids) || pet_ids.length === 0) {
    return res.status(400).json({ error: 'user_id and pet_ids are required' });
  }

  try {
    // 1. Kreiraj novu porudžbinu
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, status) VALUES (?, ?)',
      [user_id, 'rezervisano']
    );

    const orderId = orderResult.insertId;

    // 2. Ubaci stavke u order_items
    const itemsValues = pet_ids.map(pet_id => [orderId, pet_id]);
    await pool.query(
      'INSERT INTO order_items (order_id, pet_id) VALUES ?',
      [itemsValues]
    );

    res.status(201).json({ message: 'Porudžbina uspešno kreirana', orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart/add', async (req, res) => {
  const { user_id, pet_ids } = req.body;

  if (!user_id || !Array.isArray(pet_ids) || pet_ids.length === 0) {
    return res.status(400).json({ error: 'user_id and pet_ids are required' });
  }

  try {
    // Proveri da li postoji narudžbina sa statusom "u korpi" za ovog korisnika
    const [existingOrders] = await pool.query(
      'SELECT id FROM orders WHERE user_id = ? AND status = ?',
      [user_id, 'u korpi']
    );

    let orderId;

    if (existingOrders.length > 0) {
      // Koristi postojeću narudžbinu u korpi
      orderId = existingOrders[0].id;
    } else {
      // Kreiraj novu narudžbinu sa statusom "u korpi"
      const [orderResult] = await pool.query(
        'INSERT INTO orders (user_id, status) VALUES (?, ?)',
        [user_id, 'u korpi']
      );
      orderId = orderResult.insertId;
    }

    // Dodaj sve ljubimce u order_items, ali proveri da ne dupliraš stavke
    // (opciono: možeš dodati proveru da ne ubacuje iste pet_id više puta)
    const itemsValues = pet_ids.map(pet_id => [orderId, pet_id]);

    await pool.query(
      'INSERT INTO order_items (order_id, pet_id) VALUES ?',
      [itemsValues]
    );

    res.status(201).json({ message: 'Ljubimci su dodati u korpu', orderId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:orderId/status', async (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const { status } = req.body;

  const allowedStatuses = ['u korpi', 'rezervisano', 'u toku', 'preuzeto', 'otkazano'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Nevažeći status porudžbine' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Narudžbina nije pronađena' });
    }

    res.json({ message: 'Status porudžbine ažuriran' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/orders/update-statuses', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const sql = `
    UPDATE orders
    SET status = CASE
      WHEN status = 'rezervisano' AND TIMESTAMPDIFF(DAY, created_at, NOW()) > 3 THEN 'preuzeto'
      WHEN status = 'u toku' AND TIMESTAMPDIFF(DAY, created_at, NOW()) > 3 THEN 'preuzeto'
      WHEN status = 'rezervisano' AND TIMESTAMPDIFF(DAY, created_at, NOW()) > 1 THEN 'u toku'
      ELSE status
    END
    WHERE user_id = ?;
  `;

  try {
    await pool.query(sql, [user_id]);
    res.status(200).json({ message: 'Statusi porudžbina ažurirani' });
  } catch (err) {
    console.error('Greška pri ažuriranju statusa porudžbina:', err);
    res.status(500).json({ error: 'Greška na serveru' });
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
  const { name, email, phone, password, favorite_types } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const updateUser = async (hashedPassword = null) => {
    try {
      let sql, params;

      if (hashedPassword) {
        sql = 'UPDATE users SET name = ?, email = ?, phone = ?, password = ?, favorite_types = ? WHERE id = ?';
        params = [name, email, phone, hashedPassword, favorite_types, userId];
      } else {
        sql = 'UPDATE users SET name = ?, email = ?, phone = ?, favorite_types = ? WHERE id = ?';
        params = [name, email, phone, favorite_types, userId];
      }

      await pool.query(sql, params);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  };

  if (password) {
    bcrypt.hash(password, 10)
      .then(hashedPassword => updateUser(hashedPassword))
      .catch(() => res.status(500).json({ error: 'Hashing error' }));
  } else {
    updateUser();
  }
});

// GET - porudžbine korisnika
app.get('/api/orders/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Neispravan userId" });
  }

  const sql = `
    SELECT 
      orders.id AS order_id,
      orders.status,
      orders.created_at,
      pets.id AS pet_id,
      pets.name AS pet_name,
      pets.species,
      pets.age,
      pets.size,
      pets.origin,
      pets.description,
      pets.image_url,
      pets.price
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN pets ON order_items.pet_id = pets.id
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

app.post('/api/reviews/add', (req, res) => {
  const { user_id, order_id, rating, comment } = req.body;

  // Proveri obavezne podatke
  if (!user_id || !order_id) {
    return res.status(400).json({ message: 'user_id i order_id su obavezni' });
  }

  // Provera validnosti ratinga samo ako je prosleđen (nije null ili undefined)
  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating mora biti broj između 1 i 5 ili null' });
    }
  }

  const sql = 'INSERT INTO reviews (user_id, order_id, rating, comment) VALUES (?, ?, ?, ?)';

  // Ako rating ili comment nisu poslati, stavi null u bazu
  db.query(sql, [
    user_id,
    order_id,
    rating !== undefined ? rating : null,
    comment !== undefined ? comment : null
  ], (err, result) => {
    if (err) {
      console.error('Greška pri unosu recenzije:', err);
      return res.status(500).json({ message: 'Greška na serveru' });
    }
    res.json({ message: 'Recenzija je uspešno dodata', reviewId: result.insertId });
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server je pokrenut na http://localhost:${PORT}`);
});