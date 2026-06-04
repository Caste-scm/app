import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pkg;
const app = express();
app.use(cors({ origin: true, credentials: true }));

// ==========================================
// RATE LIMITERS
// ==========================================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15,
  message: { error: 'Too many checkout attempts from this IP, please try again later' }
});

const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many tracking requests from this IP, please try again later' }
});

const webhookLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

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
      if (params.length >= 16) {
        // Full insert from webhook (16 params)
        data.orders.push({ id: params[0], amount: params[1], currency: params[2], status: params[3], stripe_payment_intent: params[4], customer_email: params[5], shipping_name: params[6], shipping_address: params[7], shipping_city: params[8], shipping_postal_code: params[9], shipping_country: params[10], billing_address: params[11], billing_city: params[12], billing_postal_code: params[13], billing_country: params[14], product_variant: params[15], created_at: new Date().toISOString() });
      } else {
        // Short insert from create-payment-intent (7 params)
        const [id, amount, currency, status, spi, email, variant] = params;
        data.orders.push({ id, amount, currency, status, stripe_payment_intent: spi, customer_email: email, product_variant: variant || 'Standard', created_at: new Date().toISOString() });
      }
    } 
    else if (text.includes('UPDATE orders SET status = $1')) {
      let spi;
      if (text.includes('customer_email = $12')) {
        spi = params[12];
      } else if (text.includes('product_variant = $11')) {
        spi = params[11];
      } else {
        spi = params[10];
      }
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
        
        if (text.includes('customer_email = $12')) {
           order.product_variant = params[10];
           order.customer_email = params[11];
        } else if (text.includes('product_variant = $11')) {
           order.product_variant = params[10];
        }
      }
    }
    else if (text.includes('SELECT id FROM orders WHERE stripe_payment_intent')) {
      const matched = data.orders.filter(o => o.stripe_payment_intent === params[0]);
      return { rows: matched, rowCount: matched.length };
    }
    else if (text.includes('SELECT * FROM orders WHERE stripe_payment_intent')) {
      const matched = data.orders.filter(o => o.stripe_payment_intent === params[0]);
      return { rows: matched, rowCount: matched.length };
    }
    else if (text.includes('UPDATE orders SET tracking_number = $1')) {
      const order = data.orders.find(o => o.id === params[1]);
      if (order) {
        order.tracking_number = params[0];
      }
      return { rowCount: order ? 1 : 0 };
    }
    else if (text.includes('SELECT status, tracking_number FROM orders WHERE customer_email = $1 AND id = $2')) {
      const matched = data.orders.filter(o => o.customer_email.toLowerCase() === params[0].toLowerCase() && o.id === params[1]);
      return { rows: matched, rowCount: matched.length };
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
          tracking_number VARCHAR(255),
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
      
      try {
        await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255)');
      } catch (e) {
        console.error('Column tracking_number could not be added:', e.message);
      }
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

app.post('/api/create-payment-intent', checkoutLimiter, async (req, res) => {
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

    // Build variant string for metadata
    const variantParts = [];
    if (parseInt(qtyTurchese) > 0) variantParts.push(`${qtyTurchese}x Turchese`);
    if (parseInt(qtyRosa) > 0) variantParts.push(`${qtyRosa}x Rosa Steel`);
    const variant = variantParts.join(' + ') || 'Standard';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        product_variant: variant,
        qty_turchese: String(qtyTurchese),
        qty_rosa: String(qtyRosa),
        discount_pct: String(Math.round(discount * 100))
      }
    });

    // Pre-create order as 'pending' — webhook will finalize it
    const orderId = `ord_${Date.now()}`;
    try {
      await db.query(
        'INSERT INTO orders (id, amount, currency, status, stripe_payment_intent, customer_email, product_variant) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [orderId, amount, 'eur', 'pending', paymentIntent.id, email || 'no-email', variant]
      );
    } catch (dbErr) {
      console.warn('DB pre-insert failed, webhook will handle:', dbErr);
    }

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/track-visit', globalLimiter, async (req, res) => {
  const { visitorId, isUnique } = req.body;
  try {
    await db.query('INSERT INTO page_visits (visitor_id, is_unique) VALUES ($1, $2)', [visitorId, isUnique]);
  } catch(e) {}
  res.send({ success: true });
});

app.post('/api/webhook', webhookLimiter, async (req, res) => {
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
    const variant = paymentIntent.metadata?.product_variant || 'Standard';
    
    try {
      // Check if order already exists (pre-created at checkout)
      const existing = await db.query(
        'SELECT * FROM orders WHERE stripe_payment_intent = $1',
        [paymentIntent.id]
      );

      if (existing.rows && existing.rows.length > 0) {
        // Update existing pending order to paid
        await db.query(
          'UPDATE orders SET status = $1, shipping_name = $2, shipping_address = $3, shipping_city = $4, shipping_postal_code = $5, shipping_country = $6, billing_address = $7, billing_city = $8, billing_postal_code = $9, billing_country = $10, product_variant = $11 WHERE stripe_payment_intent = $12', 
          [
            'paid', 
            shipping?.name || billing?.name || '', 
            shipping?.address?.line1 || '', 
            shipping?.address?.city || '', 
            shipping?.address?.postal_code || '', 
            shipping?.address?.country || '',
            billing?.address?.line1 || shipping?.address?.line1 || '',
            billing?.address?.city || shipping?.address?.city || '',
            billing?.address?.postal_code || shipping?.address?.postal_code || '',
            billing?.address?.country || shipping?.address?.country || '',
            variant,
            paymentIntent.id
          ]
        );
      } else {
        // Webhook arrived before pre-insert — create order directly as paid
        const orderId = `ord_${Date.now()}`;
        await db.query(
          'INSERT INTO orders (id, amount, currency, status, stripe_payment_intent, customer_email, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_country, billing_address, billing_city, billing_postal_code, billing_country, product_variant) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)',
          [
            orderId,
            paymentIntent.amount,
            paymentIntent.currency,
            'paid',
            paymentIntent.id,
            paymentIntent.receipt_email || billing?.email || '',
            shipping?.name || billing?.name || '',
            shipping?.address?.line1 || '',
            shipping?.address?.city || '',
            shipping?.address?.postal_code || '',
            shipping?.address?.country || '',
            billing?.address?.line1 || '',
            billing?.address?.city || '',
            billing?.address?.postal_code || '',
            billing?.address?.country || '',
            variant
          ]
        );
      }
    } catch (dbErr) {
      console.error('Webhook DB error:', dbErr);
    }
  }
  res.send({received: true});
});

// ==========================================
// ADMIN API ROUTES
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_12345';

app.post('/api/admin/login', loginLimiter, async (req, res) => {
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

app.get('/api/admin/stats', authenticateToken, globalLimiter, async (req, res) => {
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

app.post('/api/admin/update-tracking', authenticateToken, globalLimiter, async (req, res) => {
  const { orderId, trackingNumber } = req.body;
  try {
    await db.query('UPDATE orders SET tracking_number = $1 WHERE id = $2', [trackingNumber, orderId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save-order', globalLimiter, async (req, res) => {
  const { paymentIntentId, shipping, billing, variant, email } = req.body;
  
  try {
    await db.query(
      'UPDATE orders SET status = $1, shipping_name = $2, shipping_address = $3, shipping_city = $4, shipping_postal_code = $5, shipping_country = $6, billing_address = $7, billing_city = $8, billing_postal_code = $9, billing_country = $10, product_variant = $11, customer_email = $12 WHERE stripe_payment_intent = $13', 
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
        email || 'no-email',
        paymentIntentId
      ]
    );
    const result = await db.query('SELECT id FROM orders WHERE stripe_payment_intent = $1', [paymentIntentId]);
    const orderId = result.rows[0]?.id;
    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/track-order', trackingLimiter, async (req, res) => {
  const { email, orderId } = req.query;
  try {
    const result = await db.query('SELECT status, tracking_number FROM orders WHERE customer_email = $1 AND id = $2', [email, orderId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Express API listening on port ${port}`);
});

export default app;
