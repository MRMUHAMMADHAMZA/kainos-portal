const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const COLLECTIONS = ['users', 'jobRoles', 'employees'];

const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const col of COLLECTIONS) {
    const fp = path.join(DATA_DIR, `${col}.json`);
    if (!fs.existsSync(fp)) fs.writeFileSync(fp, '[]', 'utf8');
  }
  console.log('JSON data store ready');
};

module.exports = initDb;
