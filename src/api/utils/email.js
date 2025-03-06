import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const send_email = process.env.EMAIL_USER;
const password = process.env.EMAIL_PASS;
const mailTemplate = (otp) => `
<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
  <div style="margin: 50px auto; width: 70%; padding: 20px 0">
    <div style="border-bottom: 1px solid #eee">
      <a href="#" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">TrustTalk</a>
    </div>
    <p style="font-size: 1.1em">Hi,</p>
    <p>Thank you for choosing TrustTalk. Use the following OTP to complete your Sign-Up procedures. OTP is valid for 5 minutes:</p>
    <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
    <p style="font-size: 0.9em;">Regards,<br />TrustTalk</p>
    <hr style="border: none; border-top: 1px solid #eee" />
    <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
      <p>TrustTalk Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
`;

const sendVerificationEmail = async (email, verificationCode) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: send_email,
            pass: password,
        },
    });

    const mailOptions = {
        from: send_email,
        to: email,
        subject: "Verify Your Account",
        html: mailTemplate(verificationCode),
    };

    await transporter.sendMail(mailOptions);
};

const sendCustomEmail = async (email, subject, body) => {
    try {
        console.log("Sending email to:", email); // Add logging
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: send_email,
                pass: password,
            },
        });

        const mailOptions = {
            from: send_email,
            to: email,
            subject: subject,
            html: body,
        };

        console.log("Sending email with options:", mailOptions); // Add logging before sending email

        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error); // Log the error
    }
};

export default { sendVerificationEmail, sendCustomEmail };
