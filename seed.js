// Create the admin and a large, clearly labelled demo catalogue.
require('dotenv').config();
const m = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Book = require('./models/Book');

const categories = [
  'Computer Science', 'Information Technology', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Earth Science', 'Astronomy', 'Engineering', 'Architecture',
  'Medicine', 'Nursing', 'Psychology', 'Education', 'History',
  'Geography', 'Economics', 'Business', 'Finance', 'Accounting',
  'Law', 'Political Science', 'Sociology', 'Anthropology', 'Philosophy',
  'Literature', 'Languages', 'Poetry', 'Art', 'Music',
  'Photography', 'Film Studies', 'Design', 'Journalism', 'Environment',
  'Agriculture', 'Cooking', 'Health & Fitness', 'Travel', 'Sports'
];

const topics = [
  'Foundations', 'Essential Concepts', 'Practical Guide', 'Modern Applications',
  'Field Handbook', 'Case Studies', 'Advanced Techniques', 'Research Methods',
  'Real-World Problems', 'Visual Introduction', 'Core Principles', 'Study Companion',
  'Professional Practice', 'Quick Reference', 'Project Workbook', 'Emerging Trends',
  'Problem Solving', 'Data and Decisions', 'From Theory to Practice', 'Expert Insights',
  'Critical Thinking', 'Planning and Strategy', 'Tools and Techniques', 'Annotated Examples',
  'Complete Course', 'Exam Revision', 'Applied Learning', 'Design Principles',
  'Skills Development', 'Mastery Handbook'
];

(async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    await m.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

    if (!await User.exists({ email: ADMIN_EMAIL.toLowerCase() })) {
      await User.create({
        name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'admin'
      });
      console.log('Admin created');
    }

    const books = categories.flatMap((category, categoryIndex) => topics.map((topic, topicIndex) => {
      const number = categoryIndex * topics.length + topicIndex + 1;
      return {
        updateOne: {
          filter: { isbn: `DEMO-${String(number).padStart(4, '0')}` },
          update: { $setOnInsert: {
            title: `Sample: ${category} — ${topic}`,
            author: `Library Editorial Team ${String(categoryIndex + 1).padStart(2, '0')}`,
            isbn: `DEMO-${String(number).padStart(4, '0')}`,
            category,
            publisher: 'Library Demo Press',
            year: 1988 + (number % 38),
            totalCopies: 2 + (number % 4),
            availableCopies: 2 + (number % 4),
            description: `Illustrative ${topic.toLowerCase()} book for exploring the ${category} section of the catalogue.`
          } },
          upsert: true
        }
      };
    }));

    await Book.bulkWrite(books);
    console.log(`${categories.length} categories with ${topics.length} sample books each (${books.length} books ready)`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await m.disconnect();
  }
})();
