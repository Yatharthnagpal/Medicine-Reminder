/**
 * Local database service using Dexie.js (IndexedDB).
 * Drop-in replacement for the remote API — same function signatures.
 */
import Dexie from 'dexie';
import seedData from '../data/seed.json';

// --------------- Database Setup ---------------

const db = new Dexie('MedicineReminderDB');

db.version(1).stores({
  reminders: '++id, name, &phone, status, reminder_datetime, repeat_type',
  meta: 'key', // stores simple key-value flags
});

// --------------- Seed on first launch ---------------

async function ensureSeeded() {
  const flag = await db.meta.get('seeded');
  if (flag) return;

  const records = seedData.map((r) => ({
    name: r.name,
    phone: r.phone,
    message: r.message,
    medicine: r.medicine || '',
    reminder_datetime: r.reminder_datetime,
    repeat_type: r.repeat_type,
    status: r.status,
    created_at: r.created_at,
    last_sent_at: r.last_sent_at || null,
  }));

  await db.reminders.bulkAdd(records);
  await db.meta.put({ key: 'seeded', value: true });
  console.log(`Seeded ${records.length} reminders into local DB`);
}

// Run seed check immediately
const seedPromise = ensureSeeded();

// --------------- API-compatible functions ---------------

export const getReminders = async () => {
  await seedPromise;
  const all = await db.reminders.toArray();
  return all;
};

export const createReminder = async (data) => {
  await seedPromise;

  // Check for duplicate phone
  const existing = await db.reminders.where('phone').equals(data.phone).first();
  if (existing) {
    const err = new Error(`A reminder with phone number ${data.phone} already exists (Name: ${existing.name})`);
    err.response = {
      status: 409,
      data: { detail: `A reminder with phone number ${data.phone} already exists (Name: ${existing.name})` },
    };
    throw err;
  }

  const now = new Date().toISOString();
  const id = await db.reminders.add({
    name: data.name,
    phone: data.phone,
    message: data.message,
    medicine: data.medicine || '',
    reminder_datetime: data.reminder_datetime,
    repeat_type: data.repeat_type,
    status: 'pending',
    created_at: now,
    last_sent_at: null,
  });

  return db.reminders.get(id);
};

export const updateReminder = async (id, data) => {
  await seedPromise;

  const reminder = await db.reminders.get(id);
  if (!reminder) {
    throw new Error(`Reminder with id ${id} not found`);
  }

  // Check for duplicate phone on update
  if (data.phone && data.phone !== reminder.phone) {
    const existing = await db.reminders.where('phone').equals(data.phone).first();
    if (existing) {
      const err = new Error(`Duplicate phone`);
      err.response = {
        status: 409,
        data: { detail: `A reminder with phone number ${data.phone} already exists (Name: ${existing.name})` },
      };
      throw err;
    }
  }

  // Handle "mark as sent" — advance date by repeat interval
  if (data.status === 'sent') {
    const rt = reminder.repeat_type || '15-days';
    const now = new Date();
    let delta;

    switch (rt) {
      case '10-days': delta = 10; break;
      case '15-days': delta = 15; break;
      case '20-days': delta = 20; break;
      case 'monthly': delta = 30; break;
      default: delta = 30;
    }

    let nextDt = new Date(reminder.reminder_datetime);
    nextDt.setDate(nextDt.getDate() + delta);
    while (nextDt <= now) {
      nextDt.setDate(nextDt.getDate() + delta);
    }

    await db.reminders.update(id, {
      reminder_datetime: nextDt.toISOString(),
      status: 'sent',
      last_sent_at: now.toISOString(),
    });
    return db.reminders.get(id);
  }

  // Normal update
  const updates = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      updates[key] = typeof value === 'object' && value.value ? value.value : value;
    }
  }

  await db.reminders.update(id, updates);
  return db.reminders.get(id);
};

export const deleteReminder = async (id) => {
  await seedPromise;
  await db.reminders.delete(id);
  return { message: 'Reminder deleted successfully', success: true };
};

export const getDashboardStats = async () => {
  await seedPromise;
  const all = await db.reminders.toArray();
  return {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    sent: all.filter((r) => r.status === 'sent').length,
    failed: all.filter((r) => r.status === 'failed').length,
  };
};

/**
 * Process due reminders: reset "sent" reminders back to "pending"
 * when their next schedule time arrives. (Replaces backend scheduler)
 */
export const processDueReminders = async () => {
  await seedPromise;
  const now = new Date();
  const sentReminders = await db.reminders.where('status').equals('sent').toArray();

  for (const rem of sentReminders) {
    const dueAt = new Date(rem.reminder_datetime);
    if (dueAt <= now) {
      await db.reminders.update(rem.id, { status: 'pending' });
    }
  }
};

export default db;
