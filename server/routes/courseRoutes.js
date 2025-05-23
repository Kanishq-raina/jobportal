// routes/courseRoutes.js
import express from 'express';
import Course from '../models/Course.js';

const router = express.Router();

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json(courses);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

export default router;
