const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Google OAuth Client
const client = new OAuth2Client({
    clientId: '12344321', // Replace with your actual Google Client ID
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/sabirblog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: String,
    picture: String,
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Google OAuth Endpoint
app.post('/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: '12344321', // Replace with your actual Google Client ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, email, name, picture });
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id, email }, 'your-secret-key', { expiresIn: '1h' });

        // Set JWT in secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000, // 1 hour
        });

        res.json({ success: true, user: { email, name, picture } });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ success: false, message: 'Authentication failed' });
    }
});

// Logout Endpoint
app.post('/auth/logout', (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Logout failed' });
    }
});

// Protected Route (Get User Profile)
app.get('/api/profile', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-googleId');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));