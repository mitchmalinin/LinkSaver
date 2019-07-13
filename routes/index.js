const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const flash = require("connect-flash");
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
