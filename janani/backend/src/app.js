import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pool } from './db.js';
import { adminOnly, asyncRoute, auth, page } from './middleware.js';
import { hashPassword, publicUser, signToken, verifyPassword } from './auth.js';
import { coordinates, date, email, radius, requiredText } from './validation.js';

const app = express();
const origin = process.env.CLIENT_URL || 'http://localhost:5173';
const limiter = (windowMs, max) => rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
const authLimiter = limiter(15 * 60 * 1000, 30);
const requiredConfig = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: origin.split(',').map((item) => item.trim()), credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', authLimiter);
app.use('/api/chat', limiter(60 * 1000, 20));
app.use('/api/facilities', limiter(60 * 1000, 60));

app.get('/api/health', asyncRoute(async (_req, res) => {
  const missingConfig = requiredConfig.filter((key) => {
    const value = process.env[key]?.trim();
    return !value
      || value === 'replace-with-a-long-random-secret'
      || value === 'your-mysql-password';
  });
  if (missingConfig.length > 0) {
    return res.status(503).json({ status: 'misconfigured', service: 'JANANI API', database: 'not_checked', missingConfig });
  }
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', service: 'JANANI API', database: 'connected' });
  } catch {
    return res.status(503).json({ status: 'degraded', service: 'JANANI API', database: 'unavailable' });
  }
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const { fullName, email: address, password, mobile, pregnancyStatus = 'not_pregnant' } = req.body;
  if (!requiredText(fullName, 120) || !email(address) || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Name, valid email, and a password of 8-128 characters are required' });
  }
  const hash = await hashPassword(password);
  try {
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash, mobile, pregnancy_status) VALUES (?, ?, ?, ?, ?)',
      [fullName.trim(), address.trim().toLowerCase(), hash, mobile || null, pregnancyStatus],
    );
    const user = { id: result.insertId, full_name: fullName.trim(), email: address.trim().toLowerCase(), role: 'user' };
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    return res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({ message: error.code === 'ER_DUP_ENTRY' ? 'An account already exists with that email' : 'Registration failed' });
  }
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const address = String(req.body.email || '').trim().toLowerCase();
  const [rows] = await pool.execute('SELECT id, full_name, email, mobile, password_hash, role FROM users WHERE email = ? AND is_active = 1', [address]);
  const user = rows[0];
  if (!user || !(await verifyPassword(req.body.password || '', user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
  return res.json({ token: signToken(user), user: publicUser(user) });
}));

app.get('/api/auth/me', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, full_name, email, mobile, role FROM users WHERE id = ? AND is_active = 1', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Account not found' });
  return res.json({ user: publicUser(rows[0]) });
}));

app.get('/api/users/profile', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, full_name, email, mobile, date_of_birth, pregnancy_status, emergency_contact FROM users WHERE id = ?', [req.user.id]);
  return rows[0] ? res.json(rows[0]) : res.status(404).json({ message: 'Profile not found' });
}));

app.put('/api/users/profile', auth, asyncRoute(async (req, res) => {
  const { fullName, mobile, dateOfBirth, pregnancyStatus, emergencyContact } = req.body;
  if (!requiredText(fullName, 120) || (dateOfBirth && !date(dateOfBirth)) || !['pregnant', 'postpartum', 'trying', 'not_pregnant'].includes(pregnancyStatus)) return res.status(400).json({ message: 'Invalid profile details' });
  await pool.execute('UPDATE users SET full_name=?, mobile=?, date_of_birth=?, pregnancy_status=?, emergency_contact=? WHERE id=?', [fullName.trim(), mobile || null, dateOfBirth || null, pregnancyStatus, emergencyContact || null, req.user.id]);
  return res.json({ message: 'Profile updated' });
}));

app.get('/api/pregnancy/details', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, lmp_date, due_date, doctor_name, current_information, updated_at FROM pregnancy_details WHERE user_id = ?', [req.user.id]);
  return res.json(rows[0] || null);
}));

app.put('/api/pregnancy/details', auth, asyncRoute(async (req, res) => {
  const { lmpDate, dueDate, doctorName, currentInformation } = req.body;
  if ((lmpDate && !date(lmpDate)) || (dueDate && !date(dueDate)) || (doctorName && !requiredText(doctorName, 150))) return res.status(400).json({ message: 'Invalid pregnancy details' });
  await pool.execute('INSERT INTO pregnancy_details (user_id, lmp_date, due_date, doctor_name, current_information) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE lmp_date=VALUES(lmp_date), due_date=VALUES(due_date), doctor_name=VALUES(doctor_name), current_information=VALUES(current_information)', [req.user.id, lmpDate || null, dueDate || null, doctorName || null, currentInformation || null]);
  return res.json({ message: 'Pregnancy details updated' });
}));

app.get('/api/pregnancy/weeks/:week', asyncRoute(async (req, res) => {
  const week = Number(req.params.week);
  if (!Number.isInteger(week) || week < 1 || week > 42) return res.status(400).json({ message: 'Week must be between 1 and 42' });
  const [rows] = await pool.execute('SELECT week_number, baby_development, maternal_changes, nutrition_guidance, wellness_guidance, routine_note FROM pregnancy_week_content WHERE week_number = ?', [week]);
  return res.json(rows[0] || null);
}));

app.post('/api/health-logs', auth, asyncRoute(async (req, res) => {
  const { logType, bodyChanges, allergies, notes, recordedDate } = req.body;
  if (!['body_change', 'allergy', 'general'].includes(logType) || !requiredText(notes || bodyChanges || allergies, 2000) || (recordedDate && !date(recordedDate))) return res.status(400).json({ message: 'Invalid health log' });
  const [result] = await pool.execute('INSERT INTO health_logs (user_id, log_type, body_changes, allergies, notes, recorded_date) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, logType, bodyChanges || null, allergies || null, notes || null, recordedDate || new Date().toISOString().slice(0, 10)]);
  return res.status(201).json({ id: result.insertId });
}));

app.get('/api/health-logs', auth, asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const [rows] = await pool.execute('SELECT id, log_type, body_changes, allergies, notes, recorded_date, created_at FROM health_logs WHERE user_id = ? ORDER BY recorded_date DESC, id DESC LIMIT ? OFFSET ?', [req.user.id, limit, offset]);
  return res.json(rows);
}));

app.delete('/api/health-logs/:id', auth, asyncRoute(async (req, res) => {
  await pool.execute('DELETE FROM health_logs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  return res.status(204).send();
}));

app.get('/api/appointments', auth, asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const [rows] = await pool.execute('SELECT id, provider_name, appointment_date, notes, status FROM appointments WHERE user_id = ? ORDER BY appointment_date ASC LIMIT ? OFFSET ?', [req.user.id, limit, offset]);
  return res.json(rows);
}));

app.post('/api/appointments', auth, asyncRoute(async (req, res) => {
  const { providerName, appointmentDate, notes } = req.body;
  if (!requiredText(providerName, 150) || typeof appointmentDate !== 'string' || appointmentDate.length > 32) return res.status(400).json({ message: 'Provider and appointment date are required' });
  const [result] = await pool.execute('INSERT INTO appointments (user_id, provider_name, appointment_date, notes) VALUES (?, ?, ?, ?)', [req.user.id, providerName.trim(), appointmentDate, notes || null]);
  return res.status(201).json({ id: result.insertId });
}));

app.patch('/api/appointments/:id', auth, asyncRoute(async (req, res) => {
  const { providerName, appointmentDate, notes, status } = req.body;
  if (status && !['upcoming', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid appointment status' });
  await pool.execute('UPDATE appointments SET provider_name=COALESCE(?, provider_name), appointment_date=COALESCE(?, appointment_date), notes=COALESCE(?, notes), status=COALESCE(?, status) WHERE id=? AND user_id=?', [providerName || null, appointmentDate || null, notes || null, status || null, req.params.id, req.user.id]);
  return res.json({ message: 'Appointment updated' });
}));

app.post('/api/appointments/:id/cancel', auth, asyncRoute(async (req, res) => {
  await pool.execute('UPDATE appointments SET status="cancelled" WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  return res.json({ message: 'Appointment cancelled' });
}));

app.get('/api/reminders', auth, asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const [rows] = await pool.execute('SELECT id, title, description, reminder_date, reminder_time, reminder_type, delivery_channel, delivery_status, status FROM vaccination_reminders WHERE user_id = ? ORDER BY reminder_date ASC LIMIT ? OFFSET ?', [req.user.id, limit, offset]);
  return res.json(rows);
}));

app.post('/api/reminders', auth, asyncRoute(async (req, res) => {
  const { title, description, reminderDate, reminderTime, reminderType = 'vaccination', deliveryChannel = 'in_app' } = req.body;
  if (!requiredText(title, 150) || !date(reminderDate) || !['vaccination', 'checkup', 'general'].includes(reminderType) || !['in_app', 'sms'].includes(deliveryChannel)) return res.status(400).json({ message: 'Invalid reminder details' });
  const [result] = await pool.execute('INSERT INTO vaccination_reminders (user_id, title, description, reminder_date, reminder_time, reminder_type, delivery_channel) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, title.trim(), description || null, reminderDate, reminderTime || null, reminderType, deliveryChannel]);
  return res.status(201).json({ id: result.insertId, deliveryStatus: deliveryChannel === 'sms' ? 'queued' : 'not_applicable' });
}));

app.patch('/api/reminders/:id', auth, asyncRoute(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'completed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Invalid reminder status' });
  await pool.execute('UPDATE vaccination_reminders SET status=? WHERE id=? AND user_id=?', [status, req.params.id, req.user.id]);
  return res.json({ message: 'Reminder updated' });
}));

app.get('/api/notifications', auth, asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const [rows] = await pool.execute('SELECT id, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [req.user.id, limit, offset]);
  return res.json(rows);
}));

app.put('/api/notifications/:id/read', auth, asyncRoute(async (req, res) => {
  await pool.execute('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  return res.json({ message: 'Notification marked as read' });
}));

app.get('/api/facilities/search', asyncRoute(async (req, res) => {
  const { q = '', type, lat, lng, radius: requestedRadius = 25 } = req.query;
  const hasCoordinates = lat !== undefined || lng !== undefined;
  if (q.length > 120 || hasCoordinates && !coordinates(lat, lng) || hasCoordinates && !radius(requestedRadius)) return res.status(400).json({ message: 'Invalid facility search filters' });
  const { limit, offset } = page(req.query);
  const params = [];
  const clauses = ['is_active = 1'];
  if (type) { clauses.push('facility_type = ?'); params.push(type); }
  if (q) { clauses.push('(name LIKE ? OR address LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  const distance = hasCoordinates ? '(6371 * ACOS(LEAST(1, GREATEST(-1, COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude))))))' : 'NULL';
  if (hasCoordinates) params.unshift(Number(lat), Number(lng), Number(lat));
  const [rows] = await pool.execute(`SELECT id, name, facility_type, address, phone, latitude, longitude, source_url, verification_status, is_demo, ${distance} AS distance_km FROM facilities WHERE ${clauses.join(' AND ')} ORDER BY distance_km IS NULL, distance_km, name LIMIT ? OFFSET ?`, [...params, limit, offset]);
  return res.json({ results: rows.filter((row) => !hasCoordinates || row.distance_km <= Number(requestedRadius)), provider: 'database', providerConfigured: false });
}));

app.get('/api/users/asha-contact', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT a.name, a.phone, a.verification_status FROM asha_workers a JOIN user_asha_workers ua ON ua.asha_worker_id = a.id WHERE ua.user_id = ? AND a.is_active = 1', [req.user.id]);
  return rows[0] ? res.json(rows[0]) : res.status(404).json({ message: 'No verified ASHA contact is registered for this account' });
}));

app.get('/api/emergency/access', auth, asyncRoute(async (req, res) => {
  const [users] = await pool.execute('SELECT pregnancy_status FROM users WHERE id=?', [req.user.id]);
  const [details] = await pool.execute('SELECT due_date FROM pregnancy_details WHERE user_id=?', [req.user.id]);
  const due = details[0]?.due_date ? new Date(details[0].due_date) : null;
  const monthNine = due && ((due - Date.now()) / 86400000) <= 63;
  if (users[0]?.pregnancy_status !== 'pregnant' || !monthNine) return res.status(403).json({ message: 'Emergency contact access is enabled only for an active ninth-month pregnancy workflow' });
  const [asha] = await pool.execute('SELECT a.name, a.phone, a.verification_status FROM asha_workers a JOIN user_asha_workers ua ON ua.asha_worker_id=a.id WHERE ua.user_id=? AND a.is_active=1', [req.user.id]);
  return res.json({ disclaimer: 'Call local emergency services or a qualified healthcare professional for urgent help.', ashaContact: asha[0] || null });
}));

app.get('/api/schemes', asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const search = `%${String(req.query.search || '').slice(0, 120)}%`;
  const [rows] = await pool.execute('SELECT id, scheme_name, description, eligibility, benefits, required_documents, application_info, official_url, verification_status, last_verified_at, is_demo FROM government_schemes WHERE is_published=1 AND (scheme_name LIKE ? OR description LIKE ?) ORDER BY scheme_name LIMIT ? OFFSET ?', [search, search, limit, offset]);
  return res.json(rows);
}));

app.get('/api/content', asyncRoute(async (req, res) => {
  const { limit, offset } = page(req.query);
  const search = `%${String(req.query.search || '').slice(0, 120)}%`;
  const [rows] = await pool.execute('SELECT id, title, category, summary, body, source_url, verification_status, last_verified_at FROM health_content WHERE published=1 AND (title LIKE ? OR category LIKE ? OR summary LIKE ?) ORDER BY updated_at DESC LIMIT ? OFFSET ?', [search, search, search, limit, offset]);
  return res.json(rows);
}));

app.get('/api/menstrual-cycles', auth, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, cycle_start_date, cycle_length, notes, created_at FROM menstrual_cycles WHERE user_id=? ORDER BY cycle_start_date DESC LIMIT 100', [req.user.id]);
  return res.json(rows);
}));

app.post('/api/menstrual-cycles', auth, asyncRoute(async (req, res) => {
  const { cycleStartDate, cycleLength = 28, notes } = req.body;
  if (!date(cycleStartDate) || !Number.isInteger(Number(cycleLength)) || Number(cycleLength) < 15 || Number(cycleLength) > 60) return res.status(400).json({ message: 'Invalid cycle entry' });
  const [result] = await pool.execute('INSERT INTO menstrual_cycles (user_id, cycle_start_date, cycle_length, notes) VALUES (?, ?, ?, ?)', [req.user.id, cycleStartDate, cycleLength, notes || null]);
  return res.status(201).json({ id: result.insertId });
}));

app.post('/api/chat', auth, asyncRoute(async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message || message.length > 2000) return res.status(400).json({ message: 'A message of 1-2000 characters is required' });
  const urgent = /emergency|unconscious|heavy bleeding|severe pain|cannot breathe|difficulty breathing/i.test(message);
  const facilityRequest = /hospital|clinic|anganwadi|nearby|asha/i.test(message);
  const response = urgent
    ? 'I cannot assess emergencies. Please contact local emergency services or a qualified healthcare professional immediately.'
    : facilityRequest
      ? 'I can help search the JANANI facility directory. Share a town, district, or use the facility search with explicit location permission.'
      : 'I can share general educational information about pregnancy, cycles, nutrition, postpartum care, or baby care. For personal advice, please speak with a qualified healthcare professional.';
  await pool.execute('INSERT INTO chat_messages (user_id, sender, message) VALUES (?, ?, ?), (?, ?, ?)', [req.user.id, 'user', message, req.user.id, 'assistant', response]);
  return res.json({ response, safeScope: 'education_and_facility_search' });
}));

app.get('/api/admin/users', auth, adminOnly, asyncRoute(async (_req, res) => {
  const [rows] = await pool.execute('SELECT id, full_name, email, mobile, pregnancy_status, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 100');
  return res.json(rows);
}));

app.use((error, _req, res, _next) => {
  console.error(process.env.NODE_ENV === 'production' ? 'Request failed' : error);
  return res.status(error.status || 500).json({ message: error.status ? error.message : 'Request failed' });
});

export { app };
export const createApp = () => app;
