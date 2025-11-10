/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */const { User } = require('../models');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'supervisor', 'manager').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// In-memory store for refresh tokens (use DB in production)
let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    { expiresIn: '7d' }
  );
  refreshTokens.push(refreshToken);
  return refreshToken;
};

const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ username, email, password, role: role || 'manager' });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString()
    });
  }
};

const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ accessToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString()
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(403).json({ error: 'User not found' });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString()
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString()
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
      order: [['username', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.url}:`, error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      endpoint: `${req.method} ${req.url}`,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getUsers
};