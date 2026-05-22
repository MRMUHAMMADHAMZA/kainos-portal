const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
const file = (col) => path.join(DATA_DIR, `${col}.json`);

const readAll = (col) => {
  try { return JSON.parse(fs.readFileSync(file(col), 'utf8')); }
  catch { return []; }
};

const writeAll = (col, docs) => {
  fs.writeFileSync(file(col), JSON.stringify(docs, null, 2), 'utf8');
};

const now = () => new Date().toISOString();

module.exports = {
  findAll: (col, fn) => { const d = readAll(col); return fn ? d.filter(fn) : [...d]; },

  findById: (col, id) => readAll(col).find((d) => d._id === id) || null,

  findOne: (col, fn) => readAll(col).find(fn) || null,

  create: (col, data) => {
    const docs = readAll(col);
    const doc = { _id: crypto.randomUUID(), ...data, createdAt: now(), updatedAt: now() };
    docs.push(doc);
    writeAll(col, docs);
    return doc;
  },

  updateById: (col, id, data) => {
    const docs = readAll(col);
    const i = docs.findIndex((d) => d._id === id);
    if (i === -1) return null;
    docs[i] = { ...docs[i], ...data, updatedAt: now() };
    writeAll(col, docs);
    return docs[i];
  },

  deleteById: (col, id) => {
    const docs = readAll(col);
    const i = docs.findIndex((d) => d._id === id);
    if (i === -1) return null;
    const [deleted] = docs.splice(i, 1);
    writeAll(col, docs);
    return deleted;
  },
};
