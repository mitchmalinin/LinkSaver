const express = require("express");
const router = express.Router();
const session = require("express-session");
const User = require("../models/user");
const Bookmark = require("../models/bookmark");
const Folder = require("../models/bookmarkGroups");
const bcrypt = require("bcrypt");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");

router.get("/all", (req, res, next) => {
  Folder.find({ owner: req.user._id })
    .then(folders => {
      // req.theFolders = folders;
      // next();

      user = req.user;
      res.render("newsfeed", { folders, user });
    })
    .catch(err => {
      next(err);
    });
  // res.render("newsfeed");
});

module.exports = router;
