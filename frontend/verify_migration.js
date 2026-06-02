
const calculateNextOccurrence = (currentDate, repeatType) => {
  const date = new Date(currentDate);
  if (repeatType === '10-days') date.setDate(date.getDate() + 10);
  else if (repeatType === '15-days') date.setDate(date.getDate() + 15);
  else if (repeatType === '20-days') date.setDate(date.getDate() + 20);
  else if (repeatType === 'monthly') date.setMonth(date.getMonth() + 1);
  return date.toISOString();
};

const testMigrationLogic = (seedData) => {
  const now = new Date('2025-05-10T12:00:00Z'); // Mocked "now" for testing
  console.log('Mocking "now" as:', now.toISOString());

  let importedCount = 0;
  let advancedCount = 0;

  seedData.slice(0, 5).forEach(item => {
    let dateTimeStr = item.reminder_datetime.replace(' ', 'T');
    let reminderDate = new Date(dateTimeStr);
    let originalDate = new Date(reminderDate);

    if (reminderDate < now && item.repeat_type && item.repeat_type !== 'none') {
      while (reminderDate < now) {
        const nextStr = calculateNextOccurrence(reminderDate.toISOString(), item.repeat_type);
        reminderDate = new Date(nextStr);
      }
      advancedCount++;
    }

    console.log(`\nName: ${item.name}`);
    console.log(`Original: ${originalDate.toISOString()}`);
    console.log(`Migrated: ${reminderDate.toISOString()}`);
    console.log(`Advanced: ${reminderDate > originalDate}`);
    importedCount++;
  });

  return { importedCount, advancedCount };
};

// Simple mock data based on the user's reminders.json
const mockSeed = [
  {
    "name": "Past Daily Reminder",
    "reminder_datetime": "2024-01-01 10:00:00",
    "repeat_type": "monthly"
  },
  {
    "name": "Future Reminder",
    "reminder_datetime": "2026-05-24 04:14:00",
    "repeat_type": "10-days"
  }
];

const results = testMigrationLogic(mockSeed);
console.log('\nFinal Results:', results);
