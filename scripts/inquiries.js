// Operator-only: jam run --config jam.json scripts/inquiries.js
import { db } from 'jam:sqlite';
const inquiries = db.prepare('SELECT id, name, email, company, service, budget, timeline, message, created_at FROM inquiries ORDER BY created_at DESC LIMIT 100').all();
console.log(JSON.stringify(inquiries, null, 2));
