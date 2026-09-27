import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 5000;
const pool = mysql.createPool({ host: process.env.DB_HOST, port: process.env.DB_PORT || 3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, waitForConnections: true, connectionLimit: 10 });
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const auth = async (req, res, next) => { try { const token = req.headers.authorization?.replace('Bearer ', ''); if (!token) return res.status(401).json({ message: 'Authentication required' }); req.user = jwt.verify(token, process.env.JWT_SECRET); next(); } catch { res.status(401).json({ message: 'Invalid or expired token' }); } };
const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'JANANI API' }));
app.post('/api/auth/register', async (req, res) => { try { const { fullName, email, password, mobile, pregnancyStatus } = req.body; if (!fullName || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' }); const hash = await bcrypt.hash(password, 12); const [result] = await pool.execute('INSERT INTO users (full_name, email, password_hash, mobile, pregnancy_status) VALUES (?, ?, ?, ?, ?)', [fullName, email, hash, mobile || null, pregnancyStatus || 'not_pregnant']); res.status(201).json({ token: signToken({ id: result.insertId, role: 'user' }), user: { id: result.insertId, fullName, email } }); } catch (error) { res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'An account already exists with that email' : 'Registration failed' }); } });
app.post('/api/auth/login', async (req, res) => { try { const [rows] = await pool.execute('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? AND is_active = 1', [req.body.email]); const user = rows[0]; if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' }); res.json({ token: signToken(user), user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } }); } catch { res.status(500).json({ message: 'Login failed' }); } });
app.get('/api/users/profile', auth, async (req, res) => { const [rows] = await pool.execute('SELECT id, full_name, email, mobile, date_of_birth, pregnancy_status, emergency_contact FROM users WHERE id = ?', [req.user.id]); res.json(rows[0]); });
app.put('/api/users/profile', auth, async (req, res) => { const { fullName, mobile, dateOfBirth, pregnancyStatus, emergencyContact } = req.body; await pool.execute('UPDATE users SET full_name=?, mobile=?, date_of_birth=?, pregnancy_status=?, emergency_contact=? WHERE id=?', [fullName, mobile || null, dateOfBirth || null, pregnancyStatus || 'not_pregnant', emergencyContact || null, req.user.id]); res.json({ message: 'Profile updated' }); });
app.get('/api/pregnancy/weeks/:week', async (req, res) => { const [rows] = await pool.execute('SELECT * FROM pregnancy_week_content WHERE week_number = ?', [req.params.week]); res.json(rows[0] || null); });
app.get('/api/reminders', auth, async (req, res) => { const [rows] = await pool.execute('SELECT * FROM vaccination_reminders WHERE user_id = ? ORDER BY reminder_date ASC', [req.user.id]); res.json(rows); });
app.post('/api/reminders', auth, async (req, res) => { const { title, description, reminderDate, reminderTime, reminderType } = req.body; const [result] = await pool.execute('INSERT INTO vaccination_reminders (user_id, title, description, reminder_date, reminder_time, reminder_type) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, title, description || null, reminderDate, reminderTime || null, reminderType || 'vaccination']); res.status(201).json({ id: result.insertId }); });
app.get('/api/appointments', auth, async (req, res) => { const [rows] = await pool.execute('SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date ASC', [req.user.id]); res.json(rows); });
app.post('/api/appointments', auth, async (req, res) => { const { providerName, appointmentDate, notes } = req.body; const [result] = await pool.execute('INSERT INTO appointments (user_id, provider_name, appointment_date, notes) VALUES (?, ?, ?, ?)', [req.user.id, providerName, appointmentDate, notes || null]); res.status(201).json({ id: result.insertId }); });
app.get('/api/schemes', async (req, res) => { const search = `%${req.query.search || ''}%`; const [rows] = await pool.execute('SELECT * FROM government_schemes WHERE scheme_name LIKE ? OR description LIKE ? ORDER BY scheme_name', [search, search]); res.json(rows); });
app.get('/api/notifications', auth, async (req, res) => { const [rows] = await pool.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]); res.json(rows); });
app.put('/api/notifications/:id/read', auth, async (req, res) => { await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]); res.json({ message: 'Notification marked as read' }); });
app.post('/api/chat', auth, async (req, res) => { const message = String(req.body.message || ''); const response = /emergency|bleeding|severe pain/i.test(message) ? 'I cannot assess emergencies. Please contact your local emergency service or a qualified healthcare professional now.' : 'I can share general educational information. For personal advice, please speak with a qualified healthcare professional. What would you like to explore?'; await pool.execute('INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?), (?, ?, ?)', [req.user.id, 'user', message, req.user.id, 'assistant', response]); res.json({ response }); });
app.get('/api/admin/users', auth, adminOnly, async (_req, res) => { const [rows] = await pool.execute('SELECT id, full_name, email, mobile, pregnancy_status, is_active, created_at FROM users ORDER BY created_at DESC'); res.json(rows); });
app.listen(port, () => console.log(`JANANI API listening on http://localhost:${port}`));
