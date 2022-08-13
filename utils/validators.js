const { body } = require("express-validator");
const User = require("../models/user");

exports.registerValidators = [
  body("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("enter correct email")
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("Email exists");
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body("password", "password must have min 4 symbols")
    .isLength({ min: 4, max: 32 })
    .isAlphanumeric()
    .trim(),
  body("confirm")
    .custom((value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Passwords must be the same");
      }
      return true;
    })
    .trim(),
  body("name").trim().isLength({ min: 3 }).withMessage("name min = 3"),
];

exports.courseValidators = [
  body("title").trim().isLength({ min: 3 }).withMessage("min title length = 3"),
  body("price").isNumeric().withMessage("Number is incorrect!"),
  body("img", "incorrect url").isURL(),
];
