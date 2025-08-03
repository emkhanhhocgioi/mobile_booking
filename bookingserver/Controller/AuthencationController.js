const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hidrabula@gmail.com',
      pass: 'dgkg ruas hkqd nxmn' 
    }
  });

const getVerificationCode = async (req,res) =>{
    const {email,code} = req.body;
   try {
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email,
        subject: 'Verification Code',
        text: `Your verification code is: ${code}`,
      };
      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: 'Verification code sent successfully' });
   } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Failed to send verification code', details: error });
   }

}



module.exports = {getVerificationCode}