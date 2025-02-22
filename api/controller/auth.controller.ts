import User from '../models/user';
import { NextFunction, Request, Response } from 'express';
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

// Auth controller class
class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    const { username, email, password, fullname } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, fullname });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If password does not match, return 401
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If authentication is successful, generate a JWT token
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    // Return the token and user's full name in the response
    return res.status(200).json({ token, fullName: user.fullname });
  }
}

export default new AuthController();
