require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Express framework for APIs
const bodyParser = require('body-parser'); // Middleware to parse JSON request bodies
const cors = require('cors'); // CORS middleware for handling cross-origin requests
const bcrypt = require('bcrypt'); // Password hashing library
const jwt = require('jsonwebtoken'); // JWT library for authentication
const { body, validationResult } = require('express-validator'); // Input validation library
const mysql = require('mysql2'); // MySQL library for database connections

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] })); // Allow specified origins
app.use(bodyParser.json()); // Parse JSON request bodies

            // Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:  process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectAttributes: { host: "127.0.0.1" }, // Force IPv4
});

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';


// Establish the database connection
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('MySQL connected!');
});

// A test route
app.get('/', (req, res) => {
    res.send('Hello, your server is running!');
});

            // Registration route with validation
app.post('/register', [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const { username, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                throw err;
            }

            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = results[0];
        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (err) {
            console.error('Error during password comparison:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET , (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user; // Attach user info to the request
        next();
    });
};

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});

// Profile route
app.get('/profile', authenticateToken, (req, res) => {
    const query = 'SELECT id, username, email FROM users WHERE id = ?';
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.json(results[0]);
    });
});

// Fitness data route
app.post('/fitness-data', authenticateToken, (req, res) => {
    const { date, calories, steps, workoutTime } = req.body;
    const query = 'INSERT INTO fitness_data (user_id, date, calories, steps, workout_time) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [req.user.id, date, calories, steps, workoutTime], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ message: 'Fitness data logged successfully' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


