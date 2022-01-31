const Mailgen = require("mailgen");

class EmailService {
  constructor(env, sender) {
    this.sender = sender;
    switch (env) {
      case "development":
        this.link = " https://ee10-185-159-163-198.ngrok.io";
        break;
      case "production":
        this.link = "link for production";
        break;
      default:
        this.link = "http://127.0.0.1:5500";
        break;
    }
  }

  createTemplateEmail(name, verifyToken) {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Wallet",
        link: this.link,
        copyright: "Copyright © 2022 Wallet. All rights reserved.",
      },
    });

    const email = {
      body: {
        name,
        intro: "Welcome to Wallet! We're very excited to have you on board.",
        signature: "Yours truly",
        action: {
          instructions: "To get started with Wallet please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your account",
            link: `${this.link}/api/users/verify/${verifyToken}`,
          },
        },
      },
    };
    return mailGenerator.generate(email);
  }

  async sendVerifyEmail(email, name, verifyToken) {
    const emailHTML = this.createTemplateEmail(name, verifyToken);
    const msg = {
      to: email,
      subject: "Verify your email",
      html: emailHTML,
    };
    try {
      const result = await this.sender.send(msg);
      console.log(result);
      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}

module.exports = EmailService;
