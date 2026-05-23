import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/db.js';

const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'SECRET_FLIPKART_CLONE_KEY_SUPER_SAFE';
  return jwt.sign({ id: userId }, secret, { expiresIn: JWT_EXPIRES_IN });
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      addresses: []
    });

    const token = generateToken(user._id);

    const userObj = { ...user };
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: userObj
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user._id);

    const userObj = { ...user };
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: userObj
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userObj = { ...user };
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: userObj
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user address profile or add a new address
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { fullName, phone, pincode, locality, addressLine, city, state, addressType } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set other addresses to non-default if this will be the default
    const newAddr = {
      fullName,
      phone,
      pincode,
      locality,
      addressLine,
      city,
      state,
      addressType,
      isDefault: true
    };

    user.addresses = user.addresses || [];
    user.addresses.forEach(addr => addr.isDefault = false);
    user.addresses.push(newAddr);

    await User.findByIdAndUpdate(user._id, { addresses: user.addresses });

    res.status(200).json({
      success: true,
      message: 'Delivery address added successfully.',
      data: user.addresses
    });
  } catch (err) {
    next(err);
  }
};
