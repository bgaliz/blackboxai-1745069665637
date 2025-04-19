const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByUsername, addUser } = require('./users');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Register endpoint
app.post('/api/register', (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required' });
  }
  if (findUserByUsername(username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const user = addUser(username, password, role);
  res.json({ id: user.id, username: user.username, role: user.role });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordIsValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: '1d',
  });
  res.json({ token });
});

// Import course functions
const {
  addCourse,
  getCoursesByTeacher,
  getCourseById,
  addModule,
  addVideo,
  addComment,
  addWatchTime,
} = require('./courses');

// Middleware to verify JWT token and set req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes for courses

// Create a course (teacher only)
app.post('/api/courses', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can create courses' });
  }
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  const course = addCourse(req.user.id, title, description);
  res.json(course);
});

// Get courses for logged in teacher
app.get('/api/courses', authenticateToken, (req, res) => {
  if (req.user.role === 'teacher') {
    const courses = getCoursesByTeacher(req.user.id);
    return res.json(courses);
  } else {
    // For students, return all courses (simplified)
    return res.json(courses);
  }
});

// Get course by id
app.get('/api/courses/:courseId', authenticateToken, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

// Add module to course (teacher only)
app.post('/api/courses/:courseId/modules', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can add modules' });
  }
  const courseId = parseInt(req.params.courseId);
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  const module = addModule(courseId, title);
  if (!module) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(module);
});

// Add video to module (teacher only)
app.post('/api/courses/:courseId/modules/:moduleId/videos', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Only teachers can add videos' });
  }
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const { title, videoUrl, materials } = req.body;
  if (!title || !videoUrl) {
    return res.status(400).json({ message: 'Title and videoUrl are required' });
  }
  const video = addVideo(courseId, moduleId, title, videoUrl, materials);
  if (!video) {
    return res.status(404).json({ message: 'Course or module not found' });
  }
  res.json(video);
});

// Add comment to video (student only)
app.post('/api/courses/:courseId/modules/:moduleId/videos/:videoId/comments', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can add comments' });
  }
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const videoId = parseInt(req.params.videoId);
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  const comment = addComment(courseId, moduleId, videoId, req.user.id, message);
  if (!comment) {
    return res.status(404).json({ message: 'Course, module or video not found' });
  }
  res.json(comment);
});

// Add watch time to video (student only)
app.post('/api/courses/:courseId/modules/:moduleId/videos/:videoId/watchtime', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can add watch time' });
  }
  const courseId = parseInt(req.params.courseId);
  const moduleId = parseInt(req.params.moduleId);
  const videoId = parseInt(req.params.videoId);
  const { watchTime } = req.body;
  if (typeof watchTime !== 'number' || watchTime <= 0) {
    return res.status(400).json({ message: 'Valid watchTime is required' });
  }
  const success = addWatchTime(courseId, moduleId, videoId, req.user.id, watchTime);
  if (!success) {
    return res.status(404).json({ message: 'Course, module or video not found' });
  }
  res.json({ message: 'Watch time added' });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AVA backend API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
