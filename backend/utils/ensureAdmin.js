const bcrypt = require('bcryptjs');
const db = require('./jsonDb');

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env — skipping admin creation');
    return;
  }

  const existing = db.findOne('users', (u) => u.email === email.toLowerCase());

  if (existing) {
    if (existing.role !== 'admin') {
      db.updateById('users', existing._id, { role: 'admin' });
      console.log(`Promoted ${email} to admin`);
    } else {
      console.log(`Admin account ready: ${email}`);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  db.create('users', { email: email.toLowerCase(), password: hashed, role: 'admin' });
  console.log(`Created admin account: ${email}`);
};

module.exports = ensureAdmin;
