const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const signup = async (name, email, password, role, department, designation) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const finalRole = (role === 'ADMIN') ? 'ADMIN' : 'USER';

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, department, designation) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, finalRole, department || null, designation || null]
  );

  return {
    id: result.insertId,
    name,
    email,
    role: finalRole,
    department: department || null,
    designation: designation || null
  };
};

const login = async (email, password) => {
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation
  };
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

const getUserById = async (id) => {
  const [users] = await pool.query('SELECT id, name, email, role, department, designation, created_at FROM users WHERE id = ?', [id]);
  if (users.length === 0) {
    throw new Error('User not found');
  }
  return users[0];
};

module.exports = {
  signup,
  login,
  generateToken,
  getUserById
};
