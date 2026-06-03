import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
} else {
  console.log('--- RUNNING WITHOUT DATABASE ---');
  console.log('Orders will not be saved. Set POSTGRES_URL to enable persistence.');
}

// ==========================================
// DATABASE LAYER (Postgres or JSON Fallback)
// ==========================================
const DB_PATH = join(__dirname, '../database.json');

const db = {
  async query(text, params = []) {
    if (pool) {
      return pool.query(text, params);
    }
    
    // JSON FALLBACK
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({ orders: [], visits: [], admin_users: [] }));
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // Simplified query handling for common operations
    if (text.includes('INSERT INTO orders')) {
      const [id, amount, currency, status, spi, email] = params;
      data.orders.push({ id, amount, currency, status, stripe_payment_intent: spi, customer_email: email, created_at: new Date().toISOString() });
    } 
    else if (text.includes('UPDATE orders SET status = $1')) {
      const isSaveOrder = text.includes('product_variant = $11');
      const spi = params[isSaveOrder ? 11 : 10];
      const order = data.orders.find(o => o.stripe_payment_intent === spi);
      if (order) {
        order.status = params[0];
        order.shipping_name = params[1];
        order.shipping_address = params[2];
        order.shipping_city = params[3];
        order.shipping_postal_code = params[4];
        order.shipping_country = params[5];
        order.billing_address = params[6];
        order.billing_city = params[7];
        order.billing_postal_code = params[8];
        order.billing_country = params[9];
        if (isSaveOrder) order.product_variant = params[10];
      }
    }
    else if (text.includes('INSERT INTO page_visits')) {
      data.visits.push({ visitor_id: params[0], is_unique: params[1], visited_at: new Date().toISOString() });
    }
    else if (text.includes('SELECT COUNT(*) FROM page_visits')) {
      const count = text.includes('is_unique = TRUE') 
        ? data.visits.filter(v => v.is_unique).length 
        : data.visits.length;
      return { rows: [{ count }] };
    }
    else if (text.includes('SELECT SUM(amount) FROM orders')) {
      const sum = data.orders.filter(o => o.status === 'paid').reduce((acc, o) => acc + o.amount, 0);
      return { rows: [{ sum }] };
    }
    else if (text.includes('SELECT * FROM orders ORDER BY created_at DESC')) {
      return { rows: [...data.orders].reverse().slice(0, 50) };
    }
    else if (text.includes('SELECT * FROM admin_users')) {
      return { rows: data.admin_users, rowCount: data.admin_users.length };
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return { rows: [], rowCount: 0 };
  }
};

// Inizializzazione database
async function initDb() {
  try {
    if (pool) {
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
      // Inserisci utente admin di default se non esiste leggendo dalle variabili d'ambiente
      const adminEmail = process.env.ADMIN_EMAIL || 'filippocastellan27@gmail.com';
      // Fallback password solo per test, su Vercel DEVE essere impostata ADMIN_PASSWORD
      const adminPassword = process.env.ADMIN_PASSWORD || 'filippo*07';
      
      const res = await pool.query('SELECT * FROM admin_users WHERE email = $1', [adminEmail]);
      if (res.rowCount === 0) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await pool.query('INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)', [adminEmail, hash]);
      }
    } else {
      // Local setup: Ensure directory exists and file is created
      if (!fs.existsSync(DB_PATH)) {
        console.log('Creating local database file at:', DB_PATH);
        const adminEmail = process.env.ADMIN_EMAIL || 'filippocastellan27@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'filippo*07';
        const hash = await bcrypt.hash(adminPassword, 10);
        const initialData = { 
          orders: [], 
          visits: [], 
          admin_users: [{ email: adminEmail, password_hash: hash }] 
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      }
    }
    console.log("Database initialized successfully");
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
  try {
    const { email, qtyTurchese = 0, qtyRosa = 0 } = req.body;
    const totalQty = (parseInt(qtyTurchese) || 0) + (parseInt(qtyRosa) || 0);
    
    let discount = 0;
    if (totalQty >= 4) discount = 0.25;
    else if (totalQty === 3) discount = 0.20;
    else if (totalQty === 2) discount = 0.15;

    const basePrice = 1599; 
    const subtotal = totalQty * basePrice;
    const amount = Math.round(subtotal * (1 - discount));

    if (amount <= 0) return res.status(400).json({ error: 'Invalid quantity' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
    });

    const orderId = `ord_${Date.now()}`;
    try {
      await db.query(
        'INSERT INTO orders (id, amount, currency, status, stripe_payment_intent, customer_email) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, amount, 'eur', 'pending', paymentIntent.id, email || 'no-email']
      );
    } catch (dbErr) {
      console.warn('Database logging failed, but proceeding with payment:', dbErr);
    }

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-visit', async (req, res) => {
  const { visitorId, isUnique } = req.body;
  try {
    await db.query('INSERT INTO page_visits (visitor_id, is_unique) VALUES ($1, $2)', [visitorId, isUnique]);
  } catch(e) {}
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
    
    await db.query(
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
  }
  res.send({received: true});
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'User not found' });
    
    const user = result.rows.find(u => u.email === email);
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const totalVisits = (await db.query('SELECT COUNT(*) FROM page_visits')).rows[0].count;
    const uniqueVisits = (await db.query('SELECT COUNT(*) FROM page_visits WHERE is_unique = TRUE')).rows[0].count;
    const revenueRow = (await db.query("SELECT SUM(amount) FROM orders WHERE status = 'paid'")).rows[0].sum;
    const revenue = revenueRow ? revenueRow / 100 : 0;
    const orders = (await db.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 50')).rows;

    res.json({
      visits: parseInt(totalVisits),
      uniqueVisits: parseInt(uniqueVisits),
      revenue,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-order', async (req, res) => {
  const { paymentIntentId, shipping, billing, variant } = req.body;
  
  try {
    await db.query(
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
