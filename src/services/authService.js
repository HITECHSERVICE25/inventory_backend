const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger  = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { default: AppError } = require('../utils/error-handler');

class AuthService {
  async registerUser(userData) {
    try {
      logger.info('Registration attempt', {
        email: userData.email,
        role: userData.role
      });

      const user = await User.create(userData);
      
      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email
      });

      return user;
    } catch (error) {
      logger.error('Registration failed', {
        error: error.message,
        email: userData.email
      });
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      logger.info('Login attempt', { email });
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        logger.warn('Login failed - user not found', { email });
        throw new AppError('Invalid credentials', 400);
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        logger.warn('Login failed - password mismatch', { userId: user._id });
        throw new AppError("Password doesn't match!", 400);
      }

      logger.info('Login successful', { user: user });
      return user;
    } catch (error) {
      logger.error('Login process error', { error: error.message });
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      logger.info('Forgot password request', { email });
      const user = await User.findOne({ email });

      if (!user) {
        logger.warn('Forgot password - unknown email', { email });
        throw new Error('No user with that email');
      }

      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_RESET_SECRET,
        { expiresIn: '10m' }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `Password reset requested. PUT to: ${resetUrl}`;

      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      logger.info('Password reset email sent', { email });
      return true;
    } catch (error) {
      logger.error('Forgot password process failed', { error: error.message });
      throw error;
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      logger.info('Password reset attempt', { token: resetToken.slice(-10) });
      const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        logger.warn('Invalid password reset token');
        throw new Error('Invalid or expired token');
      }

      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      logger.info('Password reset successful', { userId: user._id });
      return user;
    } catch (error) {
      logger.error('Password reset failed', { error: error.message });
      throw error;
    }
  }

  generateToken(user) {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    logger.debug('JWT token generated', { userId: user._id });
    return token;
  }

  async getUsers(queryParams) {
    try {
      const { page = 1, limit = 25, ...filters } = queryParams;
      const skip = (page - 1) * limit;

      const query = User.find(filters)
        .skip(skip)
        .limit(limit)
        .sort('-createdAt')
        .select('-password');

      const [users, total] = await Promise.all([
        query.exec(),
        User.countDocuments(filters)
      ]);

      return {
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching users', { error: error.message });
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user  = await User.findById(
        userId
      );

      return user;

    } catch (error) {
      logger.error('Error fetching user', { error: error.message });
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      logger.info('User update attempt', { userId });

      // Find the user first to check existence
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User update failed - user not found', { userId });
        throw new AppError('User not found', 404);
      }

      // If password is being updated, hash it
      // if (updateData.password) {
      //   logger.debug('Password update detected', { userId });
      //   updateData.password = await bcrypt.hash(updateData.password, 12);
      // }

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { 
          new: true, 
          runValidators: true,
          context: 'query'
        }
      ).select('-password'); // Exclude password from returned data

      logger.info('User updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('User update failed', { 
        error: error.message, 
        userId 
      });
      
      // Handle duplicate key errors (like email)
      if (error.code === 11000) {
        throw new AppError('Email already exists', 400);
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        throw new AppError(`Invalid input: ${Object.values(error.errors).map(e => e.message).join(', ')}`, 400);
      }
      
      throw error;
    }
  }
}

module.exports = new AuthService();