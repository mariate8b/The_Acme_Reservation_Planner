
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client(process.env.DATABASE_URL || "postgres://localhost/the_acme_reservation_planner");

const createTables = async () => {
  const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;
    CREATE TABLE customers(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE restaurants(
        id UUID PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE reservations(
        id UUID PRIMARY KEY,
        date DATE NOT NULL,
        party_count INT NOT NULL,
        customer_id UUID REFERENCES customers(id) NOT NULL,
        restaurant_id UUID REFERENCES restaurants(id) NOT NULL
    );
  `;

  await client.query(SQL);
};

const reservationData = async () => {
  const customers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'].map(name => ({
    id: uuidv4(),
    name
  }));

  const restaurants = ['Pizzeria', 'Steakhouse', 'Sushi Bar', 'Burger Joint', 'Café'].map(name => ({
    id: uuidv4(),
    name
  }));

  const reservations = [];
  for (let i = 0; i < 10; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    reservations.push({
      id: uuidv4(),
      date: new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0], // Random future date
      party_count: Math.floor(Math.random() * 10) + 1,
      customer_id: customer.id,
      restaurant_id: restaurant.id,
    });
  }

  for (const customer of customers) {
    await client.query('INSERT INTO customers (id, name) VALUES ($1, $2)', [customer.id, customer.name]);
  }

  for (const restaurant of restaurants) {
    await client.query('INSERT INTO restaurants (id, name) VALUES ($1, $2)', [restaurant.id, restaurant.name]);
  }

  for (const reservation of reservations) {
    await client.query('INSERT INTO reservations (id, date, party_count, customer_id, restaurant_id) VALUES ($1, $2, $3, $4, $5)', 
      [reservation.id, reservation.date, reservation.party_count, reservation.customer_id, reservation.restaurant_id]);
  }
};

module.exports = {
  client,
  createTables,
  reservationData,
};

