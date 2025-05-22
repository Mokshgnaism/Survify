import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/user.js';
import OtpModel from '../models/otp.js';
import mongoose from 'mongoose';

dotenv.config();

const JWT_EXPIRES = '7d';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
const mail = process.env.EMAIL 
const mailPass = process.env.PASS;

async function sendEmail(to, { subject, text, html }) {
  const emailUser = 'gorantlamokshgnaism@gmail.com';
  const emailPass = 'hqte waww vwse nhbk';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Survify" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields.' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role, isVerified: false });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    return res.status(201).json({
      success: true,
      message: 'Registered successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let existingOtp = await OtpModel.findOne({ email });
    if (existingOtp) {
      await OtpModel.findByIdAndDelete(existingOtp._id);
    }

    const plain = Math.floor(100000 + Math.random() * 900000).toString();
    const hashed = await bcrypt.hash(plain, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    console.log(plain);
    await OtpModel.create({ email, codeHash: hashed, expiresAt });

    const sent = await sendEmail(email, {
      subject: 'Your verification OTP',
      text: `OTP: ${plain}`,
      html: `<h1>${plain}</h1>`,
    });

    if (!sent) {
      return res.status(500).json({ success: false, message: 'Error sending OTP.' });
    }

    return res.json({ success: true, message: 'OTP sent.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function verifyEmail(req, res) {
  try {
    console.log("initiated");
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: 'Already verified.' });
    }

    const record = await OtpModel.findOne({ email });
    if (record.attempts <= 0) {
      await OtpModel.findByIdAndDelete(record._id);
      return res.status(502).json({ message: "your attempts per this otp are over please try to resend using logging in again otp is being deleted..." });
    }
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    const match = await bcrypt.compare(otp, record.codeHash);

    if (!match) {//
      await OtpModel.findByIdAndUpdate(record._id, {
        $inc: { attempts: -1 }
      });
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    await OtpModel.findByIdAndDelete(record._id);
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Email verified.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Fill all fields.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong credentials.' });
    }
    if (user.isVerified == false) {
      const existingotp = OtpModel.findOne({ email });
      if (existingotp) {
        OtpModel.findByIdAndDelete(existingotp._id);
      }
      const plain = Math.floor(100000 + Math.random() * 900000).toString();
      const hashed = await bcrypt.hash(plain, 10);
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const newotp = OtpModel.create({
        codeHash: hashed, expiresAt, email
      })
      const sent = await sendEmail(email, {
        subject: 'Your verification OTP',
        text: `OTP: ${plain}`,
        html: `<h1>${plain}</h1>`,
      });

      if (!sent) {
        return res.status(500).json({ success: false, error: 'Error sending OTP.' });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    return res.json({
      success: true,
      message: 'Logged in.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie('jwt', COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Logged out.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const record = await OtpModel.findOne({ email });
    if (record && record.expiresAt < Date.now()) {
      await OtpModel.findByIdAndDelete(record._id);
    }
    if (record.attempts <= 0) {
      await OtpModel.findByIdAndDelete(record._id);
      return res.status(502).json({ message: "your attempts per this otp are over please try to resend using logging in again" });
      
    }
    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found.' });
    }

    const match = await bcrypt.compare(otp, record.codeHash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    await OtpModel.findByIdAndDelete(record._id);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function createBusiness(req, res) {
  try {
    const { name, email, password, role = 'manager' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields.' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role, isVerified: false });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    console.log(newUser);
    return res.status(201).json({
      success: true,
      message: 'Registered successfully. wait for admin verification',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}

export async function verifyBusiness(req, res) {
  try {
    const admin = req.user;
    if (!admin) {
      return res.status(408).json({ message: 'Admin authentication required who are you ' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    const { businessid } = req.body;
    if (!mongoose.Types.ObjectId.isValid(businessid)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const business = await User.findByIdAndUpdate(
      businessid,
      { isVerified: true },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    console.info({
      action: 'verifyBusiness',
      by: admin._id,
      business: business._id
    });

    return res.status(200).json({
      message: 'Business successfully verified',
      business
    });
  } catch (error) {
    console.error('verifyBusiness error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


export async function createAdmin(req, res) {
  try {
    const { name, email, password, role = 'admin' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields.' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role, isVerified: true });


    console.log(newUser);
    return res.status(201).json({
      success: true,
      message: 'Registered successfully. wait for admin verification',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error });
  }
}
export async function reject(req, res) {
  try {
    const Business = await User.findById(req.body.businessId); 
    if (!Business) {
      return res.status(200).json({ message: "Deleted already or didn't exist" });
    }

    const email = Business.email;
    await User.findByIdAndDelete(Business._id);

    const sent = await sendEmail(email, {
      subject: 'Regret from Survify',
      html: `<h1>Rejected for some reason. You can definitely reapply.</h1>`,
    });

    return res.status(200).json({ message: "rejected" });
  } catch (e) {
    console.error(e); 
    return res.status(500).json({ success: false, message: 'Internal server error', error: e });
  }
}
