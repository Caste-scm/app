import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();

const { Pool } = pkg;
const app = express();
app.use(cors({ origin: true, credentials: true }));

// Se siamo in locale possiamo usare SQLite come fallback temporaneo per comodità,
// ma visto che l'utente deployerà su Vercel, Postgres è obbligatorio per prod.
// Tuttavia Vercel Postgres non è accessibile fino al deploy.
// Userò sqlite se POSTGRES_URL non esiste.
let pool;
if (process.env.POSTGRES_URL) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Inizializzazione database
async function initDb() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        amount INTEGER,
        currency VARCHAR(10),
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_intent VARCHAR(255),
        customer_email VARCHAR(255),
        shipping_name VARCHAR(255),
        shipping_address VARCHAR(255),
        shipping_city VARCHAR(100),
        shipping_postal_code VARCHAR(20),
        shipping_country VARCHAR(100),
        billing_address VARCHAR(255),
        billing_city VARCHAR(100),
        billing_postal_code VARCHAR(20),
        billing_country VARCHAR(100),
        product_variant VARCHAR(50) DEFAULT 'Standard',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS page_visits (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(255),
        is_unique BOOLEAN DEFAULT FALSE,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255)
      );
    `);
    
    // Inserisci utente admin di default se non esiste
    const res = await pool.query('SELECT * FROM admin_users WHERE email = $1', ['filippocastellan27@gmail.com']);
    if (res.rowCount === 0) {
      const hash = await bcrypt.hash('filippo*07', 10);
      await pool.query('INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)', ['filippocastellan27@gmail.com', hash]);
    }
    console.log("Database initialized");
  } catch (err) {
    console.error("DB Init Error:", err);
  }
}
initDb();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake', { apiVersion: '2023-10-16' });

app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ==========================================
// STOREFRONT ROUTES
// ==========================================

app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Ricevuta richiesta di pagamento:', req.body);
  try {
    const { email, qtyTurchese = 0, qtyRosa = 0 } = req.body;
    const totalQty = (parseInt(qtyTurchese) || 0) + (parseInt(qtyRosa) || 0);
    
    // Same discount tiers as frontend
    let discount = 0;
    if (totalQty >= 4) discount = 0.25;
    else if (totalQty === 3) discount = 0.20;
    else if (totalQty === 2) discount = 0.15;

    const basePrice = 1599; // €15.99 in cents
    const subtotal = totalQty * basePrice;
    const amount = Math.round(subtotal * (1 - discount));

    if (amount <= 0) {
      return res.status(400).json({ error: 'Quantità non valida' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });

    if (pool) {
      const orderId = `ord_${Date.now()}`;
      await pool.query(
        'INSERT INTO orders (id, amount, currency, status, stripe_payment_intent, customer_email) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, amount, 'eur', 'pending', paymentIntent.id, email || 'no-email']
      );
    }

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('ERRORE STRIPE DETTAGLIATO:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-visit', async (req, res) => {
  const { visitorId, isUnique } = req.body;
  if (pool) {
    try {
      await pool.query('INSERT INTO page_visits (visitor_id, is_unique) VALUES ($1, $2)', [visitorId, isUnique]);
    } catch(e) {}
  }
  res.send({ success: true });
});

app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const shipping = paymentIntent.shipping;
    
    const billing = paymentIntent.billing_details;
    
    if (pool) {
      console.log('Salvataggio ordine nel database per intent:', paymentIntent.id);
      await pool.query(
        'UPDATE orders SET status = $1, shipping_name = $2, shipping_address = $3, shipping_city = $4, shipping_postal_code = $5, shipping_country = $6, billing_address = $7, billing_city = $8, billing_postal_code = $9, billing_country = $10 WHERE stripe_payment_intent = $11', 
        [
          'paid', 
          shipping?.name || '', 
          shipping?.address?.line1 || '', 
          shipping?.address?.city || '', 
          shipping?.address?.postal_code || '', 
          shipping?.address?.country || '',
          billing?.address?.line1 || shipping?.address?.line1 || '',
          billing?.address?.city || shipping?.address?.city || '',
          billing?.address?.postal_code || shipping?.address?.postal_code || '',
          billing?.address?.country || shipping?.address?.country || '',
          paymentIntent.id
        ]
      );
      console.log('Ordine salvato con successo!');
    }
  }

  res.send({received: true});
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!pool) {
    // Modalità fallback se DB non connesso
    if (email === 'filippocastellan27@gmail.com' && password === 'filippo*07') {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token });
    }
    return res.status(401).json({ error: 'Credenziali non valide o DB non connesso' });
  }

  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Utente non trovato' });
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Password errata' });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware auth
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (!pool) {
      console.log('Attenzione: Accesso stats senza database attivo. Invio dati demo.');
      return res.json({ visits: 0, uniqueVisits: 0, revenue: 0, orders: [] });
    }

    const totalVisits = (await pool.query('SELECT COUNT(*) FROM page_visits')).rows[0].count;
    const uniqueVisits = (await pool.query('SELECT COUNT(*) FROM page_visits WHERE is_unique = TRUE')).rows[0].count;
    const revenueRow = (await pool.query("SELECT SUM(amount) FROM orders WHERE status = 'paid'")).rows[0].sum;
    const revenue = revenueRow ? revenueRow / 100 : 0;
    const orders = (await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50')).rows;

    console.log(`Caricamento stats riuscito. Ordini trovati: ${orders.length}`);
    res.json({
      visits: parseInt(totalVisits),
      uniqueVisits: parseInt(uniqueVisits),
      revenue,
      orders
    });
  } catch (err) {
    console.error('ERRORE CRITICO ADMIN STATS:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-order', async (req, res) => {
  const { paymentIntentId, shipping, billing, variant } = req.body;
  
  if (!pool) return res.status(500).json({ error: 'DB not connected' });

  try {
    await pool.query(
      'UPDATE orders SET status = $1, shipping_name = $2, shipping_address = $3, shipping_city = $4, shipping_postal_code = $5, shipping_country = $6, billing_address = $7, billing_city = $8, billing_postal_code = $9, billing_country = $10, product_variant = $11 WHERE stripe_payment_intent = $12', 
      [
        'paid', 
        shipping?.name || '', 
        shipping?.address?.line1 || '', 
        shipping?.address?.city || '', 
        shipping?.address?.postal_code || '', 
        shipping?.address?.country || '',
        billing?.address?.line1 || shipping?.address?.line1 || '',
        billing?.address?.city || shipping?.address?.city || '',
        billing?.address?.postal_code || shipping?.address?.postal_code || '',
        billing?.address?.country || shipping?.address?.country || '',
        variant || 'Standard',
        paymentIntentId
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Express API listening on port ${port}`);
});

export default app;
