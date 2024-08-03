const express = require('express');
const { client, createTables, reservationData } = require('./db');

const app = express();
app.use(express.json());

app.get('/api/customers', async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/restaurants', async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM restaurants');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/reservations', async (req, res, next) => {
  try {
    const result = await client.query('SELECT * FROM reservations');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/customers/:id/reservations', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { restaurant_id, date, party_count } = req.body;

    const result = await client.query(
      'INSERT INTO reservations (date, party_count, customer_id, restaurant_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, party_count, id, restaurant_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async (req, res, next) => {
  try {
    const { customer_id, id } = req.params;

    await client.query(
      'DELETE FROM reservations WHERE id = $1 AND customer_id = $2',
      [id, customer_id]
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const init = async () => {
  try {
    await client.connect();
    await createTables();
    await reservationData();
    app.listen(3000, () => {
      console.log('Server is listening on port 3000');
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

init();

