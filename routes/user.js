const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Bookmark = require("../models/bookmark");
const Folder = require("../models/bookmarkGroups");
const bcrypt = require("bcrypt");
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");

router.use(bodyParser());

//FIXME: Error when the email is not right
//TODO: Try to figure out how to signup and login at the same time
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
            req.flash("success", "Account created, you can now login!");
            res.redirect("/");
          })
          .catch(err => {
            console.log("Didnt work");
            next(err);
          });
      }
    })
    .catch(err => next(err));
});

//passport sign up
// For Signup
// passport.use(
//   "local-signup",
//   new LocalStrategy(
//     {
//       passReqToCallback: true
//     },
//     async function(req, username, password, done) {
//       const { firstName, lastName, email } = req.body;

//       try {
//         const userDB = await User.findOne({
//           $or: [{ email }, { username }]
//         }).exec();

//         if (userDB) {
//           if (userDB.username === username && userDB.email === email) {
//             return done(null, false, req.flash("wrongEmailAndUsername", true));
//           } else if (userDB.username === username) {
//             return done(null, false, req.flash("wrongUsername", true));
//           } else if (userDB.email === email) {
//             return done(null, false, req.flash("wrongEmail", true));
//           }
//         } else {
//           const salt = bcrypt.genSaltSync(12);
//           const hashedPassWord = bcrypt.hashSync(password, salt);
//           let newUser = new User();
//           newUser.name = name;
//           newUser.username = username;
//           newUser.email = email;
//           newUser.password = hashedPassWord;

//           await newUser.save();
//           return done(null, newUser);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     }
//   )
// );

// For Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user/homepage",
    failureRedirect: "/",
    failureFlash: true,
    passReqToCallback: true
  })
);
router.get(
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
  Bookmark.find({ owner: req.user._id })
    .then(bookmark => {
      Folder.find({ owner: req.user._id })
        .then(folder => {
          res.render("homepage", { bookmark, user: data, folder });
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });

  // res.render("homepage", { user: data });
});

//User Actions
router.post("/save-bookmark", (req, res, next) => {
  let data = req.body;
  let user = req.user;
  console.log("=-=-----=---=-=-", user);

  const title = req.body.title;
  const url = req.body.url;
  const description = req.body.description;
  let isPublic = req.body.is_public;
  const folder = req.body.folder;
  console.log("=-=-=-=-=-=-=-=-=-=-=-=-", req.body.folder);

  if (title === "" || url === "") {
    req.flash("error", "Missing values");
    res.redirect("/user/homepage");
    return;
  }

  Bookmark.find({ url: url, owner: user._id }).then(foundUrl => {
    console.log(foundUrl);
    if (foundUrl !== null && foundUrl.owner === user._id) {
      req.flash("error", "You already have this url saved");
      res.redirect("/user/homepage");
      return;
    } else {
      Bookmark.create({
        title: title,
        url: url,
        description: description,
        is_public: isPublic,
        owner: user._id,
        folder: folder
      })
        .then(bookmark => {
          console.log("Test");
          // console.table(bookmark);
          req.flash("success", "Bookmark added");
          res.redirect("/user/homepage");
        })
        .catch(err => {
          console.log("Didnt work");
          next(err);
        });
    }
  });
});

router.post("/:id/delete", (req, res, next) => {
  Bookmark.findByIdAndDelete(req.params.id)
    .then(bookmark => {
      req.flash("success", "Bookmark removed");
      res.redirect("/user/homepage");
    })
    .catch(err => {
      next(err);
    });
});

router.post("/:id/update", (req, res, next) => {
  let title = req.body.title;
  let url = req.body.url;
  let description = req.body.description;
  let is_public = req.body.is_public;

  if (is_public == null) {
    is_public = true;
  }

  const data = {
    title,
    url,
    description,
    is_public
  };
  Bookmark.findByIdAndUpdate(req.params.id, data)
    .then(() => {
      req.flash("success", "Bookmark updated");
      res.redirect("/user/homepage");
    })
    .catch(err => {
      next(err);
    });
});

//making folders

router.post("/create-folder", (req, res, next) => {
  let name = req.body.name;
  let is_public = req.body.is_public;
  let owner = req.user._id;

  Folder.create({
    name: name,
    is_public: is_public,
    owner: owner
  })
    .then(() => {
      req.flash("success", "Group added");
      res.redirect("/user/homepage");
    })
    .catch(err => {
      next(err);
    });
});

router.get("/folder/:id", (req, res, next) => {
  let data = req.user;
  Folder.findById(req.params.id)
    .then(oneFolder => {
      Bookmark.find({ owner: req.user._id, folder: oneFolder._id })
        .then(bookmark => {
          Folder.find()
            .then(folder => {
              res.render("homepage", {
                user: data,
                oneFolder: oneFolder,
                bookmark,
                folder
              });
            })
            .catch(err => {
              next(err);
            });
        })
        .catch(err => {
          next(err);
        });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
