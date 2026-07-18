/** بصير | إعادة ضبط قاعدة البيانات إلى بيانات الديمو */
'use strict';
const fs = require('fs');
const path = require('path');
const seed = require('../shared/seed-data.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'db.json'), JSON.stringify(seed.buildSeed(), null, 1));
console.log('✅ أعيد ضبط قاعدة البيانات: data/db.json');
