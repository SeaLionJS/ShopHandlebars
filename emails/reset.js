const keys = require("../keys");

module.exports = (email, token) => {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: "Reset password",
    html: `
            <h1>Forget password?</h1>
            <p>if it is true, go 
            <a href="${keys.BASE_URL}/auth/password/${token}">
            reset</a>
            </p>
            <hr />
            <a href="${keys.BASE_URL}">Go to shop</a>
        `,
  };
};
