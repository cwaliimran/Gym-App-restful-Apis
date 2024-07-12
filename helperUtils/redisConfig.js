const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    // Check if user data is cached in Redis
    redisClient.get(token, async (err, cachedUser) => {
      if (err) throw err;

      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        req.token = token;
        req.user = parsedUser;
        console.log('User data retrieved from cache');
        return next();
      }

      // If user data is not cached, fetch from MongoDB
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id });

      if (!user) {
        throw new Error('User not found');
      }

      // Cache user data in Redis with an expiration (e.g., 1 hour)
      redisClient.setex(token, 3600, JSON.stringify(user));

      req.token = token;
      req.user = user;
      console.log('User data fetched from MongoDB and cached');
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', message: error.message });
  }
};

module.exports = auth;
