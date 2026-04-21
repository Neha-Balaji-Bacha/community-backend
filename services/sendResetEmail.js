// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendResetEmail = async (to, resetUrl) => {
//   const mailOptions = {
//     from: `"MeetNest" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "Reset Your Password",
//     html: `
//       <h2>Password Reset</h2>
//       <p>Click the button below to reset your password:</p>
//       <a href="${resetUrl}" style="padding:10px 20px;background:#10b981;color:white;text-decoration:none;border-radius:5px;">
//         Reset Password
//       </a>
//       <p>This link will expire in 10 minutes.</p>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// };