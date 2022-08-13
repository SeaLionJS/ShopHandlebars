const keys = require("../keys");

module.exports = (email) => {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Account was created",
    html: `
            <h1>You are welcome</h1>
            <p>Account was successfuly created for you ${email}</p>
            <hr />
            <a href="${keys.BASE_URL}">Go to shop</a>
        `,
  };
};
