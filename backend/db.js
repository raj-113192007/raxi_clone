const fs = require('fs');
const path = require('path');

let sqliteDb = null;
let isSqlite = false;
const jsonDbPath = path.join(__dirname, 'raxi_data.json');

// In-memory / JSON store fallback
let memoryData = {
  users: [],
  settings: {
    siteName: "RAXI.WIN",
    currency: "₹"
  }
};

if (fs.existsSync(jsonDbPath)) {
  try {
    memoryData = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
  } catch (e) {
    console.error('Error loading JSON DB:', e);
  }
}

function saveJson() {
  fs.writeFileSync(jsonDbPath, JSON.stringify(memoryData, null, 2), 'utf8');
}

try {
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(__dirname, 'raxi_local.db');
  sqliteDb = new DatabaseSync(dbPath);
  isSqlite = true;

  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE,
      email TEXT,
      password TEXT,
      invitation_code TEXT,
      token TEXT,
      refresh_token TEXT,
      balance REAL DEFAULT 5000.0,
      vip_level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Connected to local SQLite database at:', dbPath);
} catch (e) {
  console.log('Using robust JSON file database store');
}

const db = {
  findUserByPhone(phone) {
    if (isSqlite) {
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE phone = ?');
      return stmt.get(phone) || null;
    }
    return memoryData.users.find(u => u.phone === phone) || null;
  },

  findUserByToken(token) {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '');
    if (isSqlite) {
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE token = ? OR refresh_token = ?');
      return stmt.get(cleanToken, cleanToken) || null;
    }
    return memoryData.users.find(u => u.token === cleanToken || u.refresh_token === cleanToken) || null;
  },

  createUser({ phone, email, password, invitation_code, token, refresh_token }) {
    const balance = 10000.0; // Welcome balance ₹10,000 for local gaming experience!
    const vip_level = 1;

    if (isSqlite) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (phone, email, password, invitation_code, token, refresh_token, balance, vip_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(phone || '', email || '', password || '', invitation_code || '', token, refresh_token, balance, vip_level);
      return {
        id: Number(info.lastInsertRowid),
        phone,
        email,
        password,
        invitation_code,
        token,
        refresh_token,
        balance,
        vip_level
      };
    } else {
      const newUser = {
        id: memoryData.users.length + 1,
        phone,
        email,
        password,
        invitation_code,
        token,
        refresh_token,
        balance,
        vip_level,
        created_at: new Date().toISOString()
      };
      memoryData.users.push(newUser);
      saveJson();
      return newUser;
    }
  },

  updateUserToken(phone, token, refresh_token) {
    if (isSqlite) {
      const stmt = sqliteDb.prepare('UPDATE users SET token = ?, refresh_token = ? WHERE phone = ?');
      stmt.run(token, refresh_token, phone);
      return this.findUserByPhone(phone);
    } else {
      const user = memoryData.users.find(u => u.phone === phone);
      if (user) {
        user.token = token;
        user.refresh_token = refresh_token;
        saveJson();
      }
      return user;
    }
  },

  updateUserBalance(phone, amount) {
    if (isSqlite) {
      const stmt = sqliteDb.prepare('UPDATE users SET balance = balance + ? WHERE phone = ?');
      stmt.run(amount, phone);
      return this.findUserByPhone(phone);
    } else {
      const user = memoryData.users.find(u => u.phone === phone);
      if (user) {
        user.balance = (user.balance || 0) + amount;
        saveJson();
      }
      return user;
    }
  }
};

module.exports = db;
