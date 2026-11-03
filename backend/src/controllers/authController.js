const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { validateEmail, validatePassword, validateRequired } = require('../utils/validation');

const signup = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    const missing = validateRequired([
      { name: 'name', value: name },
      { name: 'email', value: email },
      { name: 'password', value: password }
    ]);
    if (missing) return errorResponse(res, `Missing required field: ${missing}`, 400);

    if (!validateEmail(email)) return errorResponse(res, 'Invalid email format', 400);
    if (!validatePassword(password)) return errorResponse(res, 'Password must be at least 6 characters and contain 1 number', 400);

    const user = await authService.signup(name, email, password, role, department, designation);
    const token = authService.generateToken(user);

    return successResponse(res, 'User created successfully', { user, token }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = validateRequired([
      { name: 'email', value: email },
      { name: 'password', value: password }
    ]);
    if (missing) return errorResponse(res, `Missing required field: ${missing}`, 400);

    const user = await authService.login(email, password);
    const token = authService.generateToken(user);

    return successResponse(res, 'Login successful', { user, token }, 200);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    return successResponse(res, 'User profile retrieved', { user });
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

module.exports = {
  signup,
  login,
  getMe
};
