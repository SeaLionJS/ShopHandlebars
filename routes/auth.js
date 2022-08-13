const { Router } = require("express");
const router = Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const keys = require("../keys");
const reqEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const { registerValidators } = require("../utils/validators");

//console.log(registerValidators);

const transporter = nodemailer.createTransport({
  service: "SendinBlue",
  auth: {
    user: keys.EMAIL,
    pass: keys.EMAIL_PASSWORD,
  },
});

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Authorization",
    isLogin: true,
    regerror: req.flash("regerror"),
    error: req.flash("error"),
  });
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Reset password",
  });
});

router.get("/password/:token", async (req, res) => {
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }

  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/auth/login");
    }

    res.render("auth/password", {
      title: "Repare access",
      userId: user._id.toString(),
      token: req.params.token,
      error: req.flash("error"),
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Something happened!!!");
        return res.redirect("/auth/reset");
      }

      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });
      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect("/auth/login");
      } else {
        req.flash("error", "No mail!!!");
        return res.redirect("/auth/reset");
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("error", "Timeout token error");
      return res.redirect("/auth/login");
    }
  } catch (e) {
    console.log(e);
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) throw err;

          res.redirect("/");
        });
      } else {
        req.flash("error", "wrong password!");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("error", "no user");
      res.redirect("/auth/login#login");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/register", registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("regerror", errors.array()[0].msg);
      console.log(errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/auth/login#login");
    await transporter.sendMail(reqEmail(keys.EMAIL /*email*/));
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
