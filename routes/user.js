const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const flash = require("connect-flash");

//FIXME: When the user signs up it just redirects the user to the homepage but doesnt actually sign them in
router.post("/sign-up", (req, res, next) => {
  let data = req.body;

  console.table(req.body);
  const userName = req.body.username;
  const userPassword = req.body.password;
  const email = req.body.email;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  if (
    userName === "" ||
    userPassword === "" ||
    email === " " ||
    firstName === "" ||
    lastName === ""
  ) {
    req.flash("error", "Missing values");
    res.redirect("/");
    return;
  }

  //hashing the password
  const salt = bcrypt.genSaltSync(12);
  const hashedPassWord = bcrypt.hashSync(userPassword, salt);

  User.findOne({ username: userName })
    .then(foundUsername => {
      if (foundUsername !== null) {
        req.flash("error", "User name taken");
        res.redirect("/");
        return;
      } else {
        User.create({
          username: userName,
          password: hashedPassWord,
          email: email,
          firstName: firstName,
          lastName: lastName
        })
          .then(userDB => {
            console.log("Test");
            console.log(data);
            req.user = userDB;
            res.render("homepage", { data });
          })
          .catch(err => {
            console.log("Didnt work");
            next(err);
          });
      }
    })
    .catch(err => next(err));
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user/homepage",
    failureRedirect: "/",
    failureFlash: true,
    passReqToCallback: true
  })
);

router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/homepage", ensureLogin.ensureLoggedIn("/"), (req, res, next) => {
  let data = req.user;
  console.log(data);
  res.render("homepage", { user: data });
});
module.exports = router;
