import User from "../models/user.model.js";
import { generateVerificationCode } from "../utils/auth.js";
import Email from "../utils/email.js";
import { sendVerificationSMS } from "../utils/phone.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const SECRET_KEY = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY_GPT;
const MODEL = process.env.MODEL;
const CAPTCHA = process.env.RECAPTCHA_SECRET_KEY;

const findAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users: ", error);
        next(error);
    }
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { contact, name, password, recaptchaToken } = req.body;
        // Verify reCAPTCHA with Google
        const recaptchaSecret = CAPTCHA; // Replace with your secret key
        const url = "https://www.google.com/recaptcha/api/siteverify";
        const response = await axios.post(url, null, {
            params: {
                secret: recaptchaSecret,
                response: recaptchaToken,
            },
        });

        if (!response.data.success || response.data.score < 0.5) {
            return { success: false, message: "reCAPTCHA verification failed" };
        }

        // Check if the contact is an email or phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        const isPhone = /^\+?[1-9]\d{1,14}$/.test(contact); // Supports international phone format

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Invalid email or phone number format" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({
            $or: [{ email: contact }, { phone: contact }],
        });

        if (existingUser) {
            return res.status(400).json({ message: "This email or phone number is already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        // Create new user object
        const newUser = new User({
            email: isEmail ? contact : undefined, // Ensure email is set
            phone: isPhone ? contact : undefined, // Ensure phone is set
            fullName: name,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationCode: isEmail ? verificationCode : null,
            phoneVerificationCode: isPhone ? verificationCode : null,
        });

        // Assign email or phone field dynamically
        if (isEmail) newUser.email = contact;
        if (isPhone) newUser.phone = contact;

        // Save user
        await newUser.save();

        // Send OTP via email or SMS
        if (isEmail) {
            Email.sendVerificationEmail(contact, verificationCode)
                .then(() => console.log("Email sent successfully"))
                .catch((error) => console.error("Failed to send email:", error));
        } else if (isPhone) {
            sendVerificationSMS(contact, verificationCode) // Implement this function with an SMS service
                .then(() => console.log("SMS sent successfully"))
                .catch((error) => console.error("Failed to send SMS:", error));
        }

        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// User login
export const loginUser = async (req, res) => {
    try {
        const { contact, password } = req.body;

        // Determine if contact is an email or phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        const isPhone = /^\+?[1-9]\d{1,14}$/.test(contact);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Invalid email or phone number format" });
        }

        // Find user by email or phone
        const user = await User.findOne(isEmail ? { email: contact } : { phone: contact });

        if (!user) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        if (user.status === "Banned") {
            return res.status(400).json({
                message: "Account is Banned. Please contact customer support for more information.",
            });
        }

        // Check if the user is inactive
        if (user.status === "Inactive") {
            const verificationCode = generateVerificationCode();

            // Update user with new verification code
            if (isEmail) {
                user.emailVerificationCode = verificationCode;
            } else if (isPhone) {
                user.phoneVerificationCode = verificationCode;
            }

            await user.save(); // Save the updated user with the new verification code

            // Send verification email or SMS
            if (isEmail) {
                Email.sendVerificationEmail(contact, verificationCode)
                    .then(() => console.log("Verification email sent successfully"))
                    .catch((error) => console.error("Failed to send email:", error));
            } else if (isPhone) {
                sendVerificationSMS(contact, verificationCode)
                    .then(() => console.log("Verification SMS sent successfully"))
                    .catch((error) => console.error("Failed to send SMS:", error));
            }

            return res.json({
                message: "Account is inactive. Please verify your email or phone.",
                redirect: true,
                contact,
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "7d" });

        // Send login success response with user status
        res.json({ message: "Login successful", token, user: { ...user.toObject(), status: user.status } });
    } catch (error) {
        console.error("Error logging in: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Verify User (Persistent Login)
export const verifyOTP = async (req, res) => {
    try {
        const { contact, otp } = req.body;

        const user = await User.findOne({
            $or: [{ email: contact }, { phone: contact }],
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the OTP matches
        const isEmail = user.email === contact;
        const storedOTP = isEmail ? user.emailVerificationCode : user.phoneVerificationCode;

        if (!storedOTP || storedOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update verification status and clear OTP
        if (isEmail) {
            user.isEmailVerified = true;
            user.emailVerificationCode = null;
        } else {
            user.isPhoneVerified = true;
            user.phoneVerificationCode = null;
        }

        if (user.status !== "Active") {
            user.status = "Active";
        }

        await user.save();
        res.status(200).json({ message: "Verification successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { contact } = req.body;

        if (!contact) {
            return res.status(400).json({ message: "Email or phone number is required" });
        }

        // Kiểm tra người dùng có tồn tại không
        const user = await User.findOne({ $or: [{ email: contact }, { phone: contact }] });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a new OTP
        const newOTP = generateVerificationCode();

        // Cập nhật OTP và thời gian hết hạn
        if (user.email === contact) {
            user.emailVerificationCode = newOTP;
        } else if (user.phone === contact) {
            user.phoneVerificationCode = newOTP;
        }

        await user.save();

        // Gửi OTP qua email hoặc SMS
        if (user.email === contact) {
            await Email.sendVerificationEmail(contact, newOTP);
        } else if (user.phone === contact) {
            await sendVerificationSMS(contact, newOTP);
        }

        return res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
        console.error("Error resending OTP: ", error);
        res.status(500).json({ message: "Server error" });
    }
};

// AI Chat Function
export const chatWithAI = async (req, res) => {
    try {
        let conversationHistory = [{ role: "system", content: "You are a helpful assistant." }];
        const { userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({ message: "User message is required" });
        }

        // Add user message to history
        conversationHistory.push({ role: "user", content: userMessage });

        // Call AI API
        const response = await fetch("https://api.yescale.io/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: conversationHistory,
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        if (!response.ok) throw new Error("Error fetching response from OpenAI API");

        const data = await response.json();
        const aiMessage = data.choices[0].message.content.trim();

        // Add AI response to history
        conversationHistory.push({ role: "assistant", content: aiMessage });

        res.json({ aiMessage });
    } catch (error) {
        console.error("Chat error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendEmail = async (req, res) => {
    try {
        const { email, subject, content } = req.body;

        if (!email || !content) {
            return res.status(400).json({ message: "Email and content are required" });
        }

        // Send the email
        await Email.sendCustomEmail(email, subject, content);

        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email: ", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Quên mật khẩu (Gửi OTP để reset mật khẩu)
export const forgotPassword = async (req, res) => {
    try {
        const { contact } = req.body;

        // Kiểm tra nếu là email hay số điện thoại hợp lệ
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        const isPhone = /^\+?[1-9]\d{1,14}$/.test(contact); // Hỗ trợ định dạng quốc tế

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Invalid email or phone number format" });
        }

        // Tìm người dùng theo email hoặc số điện thoại
        const user = await User.findOne(isEmail ? { email: contact } : { phone: contact });

        if (!user) {
            return res.status(404).json({ message: "Email or phone number not registered" });
        }

        // Generate OTP
        const otp = generateVerificationCode();
        const expirationTime = new Date(Date.now() + 15 * 60 * 1000); // OTP hết hạn sau 15 phút

        // Cập nhật OTP vào người dùng
        if (isEmail) {
            user.emailVerificationCode = otp;
        } else {
            user.phoneVerificationCode = otp;
        }
        user.verificationExpires = expirationTime;

        // Lưu lại thay đổi trên cơ sở dữ liệu
        await user.save();

        // Gửi OTP qua email hoặc SMS
        if (isEmail) {
            await Email.sendVerificationEmail(contact, otp);
        } else {
            await sendVerificationSMS(contact, otp); // Sử dụng dịch vụ SMS
        }

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in forgotPassword: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { contact, newPassword } = req.body;

        // Kiểm tra thông tin đầu vào
        if (!contact || !newPassword) {
            return res.status(400).json({ message: "Contact and new password are required" });
        }

        // Kiểm tra xem contact là email hay số điện thoại hợp lệ
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
        const isPhone = /^\+?[1-9]\d{1,14}$/.test(contact);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Invalid email or phone number format" });
        }

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findOne(isEmail ? { email: contact } : { phone: contact });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra xem OTP đã được xác thực chưa
        // if (
        //   (isEmail && !user.isEmailVerified) ||
        //   (isPhone && !user.isPhoneVerified)
        // ) {
        //   return res.status(400).json({ message: "OTP verification is required before changing password" });
        // }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới và xóa OTP
        user.password = hashedPassword;
        user.emailVerificationCode = null;
        user.phoneVerificationCode = null;
        user.isEmailVerified = false; // Reset trạng thái xác minh
        user.isPhoneVerified = false;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export default {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    findAllUsers,
    chatWithAI,
    sendEmail,
    forgotPassword,
    changePassword,
};
