/**
 * بصير | طبقة التخزين
 * الافتراضي: قاعدة بيانات SQLite حقيقية (مدمجة في Node 22+ عبر node:sqlite)
 * بكتابة معاملاتية (Transaction) ووضع WAL — بلا أي اعتماديات خارجية.
 * البدائل عبر متغير البيئة STORAGE:
 *   STORAGE=sqlite  (الافتراضي إن توفرت)
 *   STORAGE=json    (ملف JSON — للتجربة السريعة)
 * للانتقال إلى PostgreSQL لاحقاً: نفّذ نفس الواجهة { kind, load, persist } هنا.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'bassir.db');
const JSON_FILE = path.join(DATA_DIR, 'db.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============ محرك SQLite ============
function createSqlite() {
  const { DatabaseSync } = require('node:sqlite');
  ensureDir();
  const sql = new DatabaseSync(DB_FILE);
  sql.exec('PRAGMA journal_mode = WAL;');
  sql.exec('CREATE TABLE IF NOT EXISTS collections (name TEXT PRIMARY KEY, data TEXT NOT NULL)');

  const upsert = sql.prepare('INSERT INTO collections(name, data) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET data = excluded.data');
  const selectAll = sql.prepare('SELECT name, data FROM collections');

  return {
    kind: 'sqlite',
    file: DB_FILE,

    load() {
      const rows = selectAll.all();
      if (!rows.length) return null;
      const db = {};
      rows.forEach(function (r) { db[r.name] = JSON.parse(r.data); });
      return db;
    },

    persist(db) {
      sql.exec('BEGIN');
      try {
        Object.keys(db).forEach(function (name) {
          upsert.run(name, JSON.stringify(db[name]));
        });
        sql.exec('COMMIT');
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },

    reset() {
      sql.exec('DELETE FROM collections');
    }
  };
}

// ============ محرك JSON (احتياطي) ============
function createJson() {
  return {
    kind: 'json',
    file: JSON_FILE,

    load() {
      if (!fs.existsSync(JSON_FILE)) return null;
      try { return JSON.parse(fs.readFileSync(JSON_FILE, 'utf8')); }
      catch (e) { return null; }
    },

    persist(db) {
      ensureDir();
      const tmp = JSON_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
      fs.renameSync(tmp, JSON_FILE); // كتابة ذرية
    },

    reset() {
      if (fs.existsSync(JSON_FILE)) fs.unlinkSync(JSON_FILE);
    }
  };
}

function createStorage() {
  const pref = (process.env.STORAGE || 'sqlite').toLowerCase();
  if (pref !== 'json') {
    try { return createSqlite(); }
    catch (e) {
      console.error('⚠️ SQLite غير متاحة (' + e.message + ') — سيُستخدم تخزين JSON');
    }
  }
  return createJson();
}

module.exports = { createStorage: createStorage, DATA_DIR: DATA_DIR };
