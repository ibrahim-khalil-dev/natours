const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

//new Email(user, urll).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = 'salmaiqbal7264@gmail.com';
  } 
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // Host of the email provider (Mailtrap in this case)
      port: process.env.EMAIL_PORT, // The port for SMTP, typically 2525, 465, or 587
      auth: {
        user: process.env.USER_NAME_EMAIL, // Your Mailtrap username
        pass: process.env.USER_PASSWORD, // Your Mailtrap password (App password if using Gmail)
      },
    });
  }
  async send(template, subject) {
    // 1) Render the html based on the a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname, // ✅ Correct syntax
        url: this.url, // ✅ Correct syntax
        subject, // ✅ Correct syntax
      }
    );

    // 2) Define email options
    const emailOptions = {
      from: 'salmaiqbal7264@gmail.com',
      to: this.to,
      subject: subject,
      html: html, // ✅ Ensure this is correct
      text: convert(html), // ✅ Converts HTML to plain text for fallback
    };

    // 3) Create a transport and send email

    await this.newTransport().sendMail(emailOptions);
  }
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the natours family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token here! (Valid for 10 min)'
    );
  }
};

// 1) Create a transporter: This will allow us to connect to the SMTP server using the provided credentials
// const sendMail = async (options) => {
//   // 2) Create a transporter with the provided SMTP credentials and options

//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST, // Host of the email provider (Mailtrap in this case)
//   //   port: process.env.EMAIL_PORT, // The port for SMTP, typically 2525, 465, or 587
//   //   auth: {
//   //     user: process.env.USER_NAME_EMAIL, // Your Mailtrap username
//   //     pass: process.env.USER_PASSWORD, // Your Mailtrap password (App password if using Gmail)
//   //   },
//   // });

//   // 3) Define the email options

//   // 4) Actually send the email using the transporter and email options
//   try {
//     await transporter.sendMail(emailOptions); // Sending the email
//   } catch (err) {
//     // 5) Catch any errors and log them if the email fails to send
//     console.error('Failed to send email:', err.message);
//     throw err; // Rethrow the error to be handled by the calling function
//   }
// };

// Export the sendMail function so it can be used elsewhere in the project
//module.exports = sendMail;
