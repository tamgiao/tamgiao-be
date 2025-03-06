import nodemailer from 'nodemailer';
import messages from '../constants/messages.constant.js'; 
import actions from '../actions/requestController.action.js';
import dotenv from 'dotenv'; 

dotenv.config(); 
export default function MailService() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Hàm gửi email
  const sendEmail = async (recipientEmail, username, authCode, action) => {
    let emailText = '';
    let emailSubject = '';

    if (action === actions.FORGET_PASSWORD) {
      emailText = messages.MESSAGE001(username, authCode);
      emailSubject = "Request to Reset Your Password by Tâm Giao WEB";
    } else if (action === actions.SUBMIT_TEST) {
      emailText = messages.MESSAGE002(username, authCode);
      emailSubject = "Nhận kết quả đánh giá tâm lý qua bài test";
    } else {
      emailText = messages.MESSAGE_ERROR;
      emailSubject = "ERROR: Unknown action code.";
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: emailSubject,
      text: emailText
    };

    return transporter.sendMail(mailOptions);
  };

  // Function to generate auth code
  const generateAuthCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '@$!%*?&';

    // Chọn ngẫu nhiên ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt
    const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
    const randomNumber = numbers.charAt(Math.floor(Math.random() * numbers.length));
    const randomSpecialChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Tạo danh sách tất cả các ký tự để chọn các ký tự ngẫu nhiên khác
    const allChars = letters + numbers + specialChars;

    // Chọn thêm 5 ký tự ngẫu nhiên từ danh sách để đạt đủ 6 ký tự
    let remainingChars = '';
    for (let i = 0; i < 5; i++) {
      remainingChars += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Kết hợp tất cả các ký tự lại với nhau
    const authCode = randomLetter + randomNumber + randomSpecialChar + remainingChars;

    // Ngẫu nhiên sắp xếp lại các ký tự để tạo ra mã xác thực hoàn chỉnh
    return authCode.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Optional reset password function if needed
  const resetPassword = async (req, res, next) => {
    try {
      // Add your reset password logic here
    } catch (error) {
      next(error);
    }
  };

  // Return functions so they can be used outside
  return {
    sendEmail,
    generateAuthCode,
    resetPassword
  };
}
