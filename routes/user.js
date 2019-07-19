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
  const followers = req.body.followers;
  const following = req.body.following;

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
          lastName: lastName,
          followers: followers,
          following: following
        })
          .then(userDB => {
            // console.log("Test");
            console.log(data);
            req.user = userDB;
            Folder.create({
              name: "favorites",
              is_public: true,
              owner: userDB._id
            })
              .then(() => {
                req.flash("success", "Account created, you can now login!");
                res.redirect("/");
              })
              .catch(err => {
                next(err);
              });
          })
          .catch(err => {
            console.log("Didnt work");
            next(err);
          });
      }
    })
    .catch(err => next(err));
});

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

  Bookmark.find({ owner: req.user._id })
    .then(bookmark => {
      Folder.find({ owner: req.user._id })
        .then(folders => {
          // req.theFolders = folders;

          // next();
          res.render("homepage", { bookmark, user: data, folders });
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

  const title = req.body.title;
  const userUrl = req.body.url;
  const description = req.body.description;
  let isPublic = req.body.is_public;
  const folder = req.body.folder;

  if (title === "" || userUrl === "") {
    req.flash("error", "Missing values");
    res.redirect("/user/homepage");
    return;
  }

  Bookmark.find({ url: userUrl, owner: user._id }).then(foundUrl => {
    console.log("=-==-=--found-=-==-=-=-", foundUrl);
    if (foundUrl.length == 0) {
      console.log("this is no empty");
      Bookmark.create({
        title: title,
        url: userUrl,
        description: description,
        is_public: isPublic,
        owner: user._id,
        folder: folder
      })
        .then(bookmark => {
          // console.table(bookmark);
          req.flash("success", "Bookmark added");
          res.redirect("/user/homepage");
        })
        .catch(err => {
          console.log("Didnt work");
          next(err);
        });
    } else {
      req.flash("error", "You already have this url saved");
      res.redirect("/user/homepage");
      return;
    }
  });
  //
});

router.post("/:id/delete", async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(req.params.id);
    req.flash("success", "Bookmark removed");
    res.redirect("/user/homepage");
  } catch (error) {
    next(err);
  }

  // Bookmark.findByIdAndDelete(req.params.id)
  //   .then(bookmark => {
  //     req.flash("success", "Bookmark removed");
  //     res.redirect("/user/homepage");
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

router.post("/folder/:id/delete", async (req, res, next) => {
  try {
    await Folder.findByIdAndDelete(req.params.id);
    req.flash("success", "Folder removed");
    res.redirect("/user/homepage");
  } catch (error) {
    next(err);
  }
});
router.post("/folder/:id/update", async (req, res, next) => {
  let name = req.body.name;
  let is_public = req.body.is_public;
  if (is_public == null) {
    is_public = true;
  }
  const data = {
    name: name,
    is_public: is_public
  };

  try {
    await Folder.findByIdAndUpdate(req.params.id, data);
    req.flash("success", "Folder updated");
    res.redirect(`/user/folder/${req.params.id}`);
  } catch (error) {
    next(err);
  }
});

router.post("/:id/update", (req, res, next) => {
  let title = req.body.title;
  let url = req.body.url;
  let description = req.body.description;
  let is_public = req.body.is_public;
  let folder = req.body.folder;

  if (is_public == null) {
    is_public = true;
  }

  if (folder == "") {
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
  } else {
    const data = {
      title,
      url,
      description,
      is_public,
      folder
    };
    Bookmark.findByIdAndUpdate(req.params.id, data)
      .then(() => {
        req.flash("success", "Bookmark updated");
        res.redirect("/user/homepage");
      })
      .catch(err => {
        next(err);
      });
  }
});
//my profile
router.get("/profile", async (req, res, next) => {
  let user = req.user;
  let followers = req.user.followers;
  let following = req.user.following;

  if (followers.length == undefined) {
    followers.length = 0;
  }
  if (following.length == undefined) {
    following.length = 0;
  }
  console.log("=-=--=-User-=-=--", user);
  try {
    const folders = await Folder.find({ owner: req.user._id });
    const bookmarks = await Bookmark.find({ owner: req.user._id });
    const privateBookmarks = await Bookmark.find({
      owner: req.user._id,
      is_public: false
    });
    const privateFolder = await Folder.find({
      owner: req.user._id,
      is_public: false
    });
    res.render("profile", {
      user,
      folders,
      bookmarks,
      followers,
      following,
      privateBookmarks,
      privateFolder
    });
  } catch (error) {
    next(error);
  }
});
//showing user profile
router.get("/:id", async (req, res, next) => {
  let user = req.user;

  try {
    let userInfo = await User.findById(req.params.id);
    let folders = await Folder.find({ owner: req.user._id });
    let userFolders = await Folder.find({
      is_public: true,
      owner: req.params.id
    });
    let userBookmarks = await Bookmark.find({
      is_public: true,
      owner: req.params.id
    });

    let data = {
      userInfo,
      userFolders,
      userBookmarks
    };
    console.log("=-=-=User Bookmarks-=-", userBookmarks);
    res.render("userProfile", { user, folders, data });
  } catch (err) {
    next(err);
  }
});
//making folders

router.post("/create-folder", async (req, res, next) => {
  let name = req.body.name;
  let is_public = req.body.is_public;
  let owner = req.user._id;
  // try {
  // await Folder.create({ name: name, is_public: is_public, owner: owner });
  // req.flash("success", "Group added");
  //     res.redirect("/user/homepage");
  //   })
  // } catch (error) {
  //  next(error);
  // }
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

router.get("/public-folder/:id", (req, res, next) => {
  let user = req.user;

  Bookmark.find({ folder: req.params.id })
    .then(bookmarks => {
      Folder.find({ owner: req.user._id })
        .then(folders => {
          Folder.findById({ _id: req.params.id })
            .then(folder => {
              console.log("======Found the Folder Matching the Id===", folder);
              res.render("userFolder", { user, bookmarks, folders, folder });
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

router.get("/folder/:id", async (req, res, next) => {
  let data = req.user;
  try {
    const oneFolder = await Folder.findById(req.params.id);
    const folders = await Folder.find({ owner: req.user._id });
    const bookmark = await Bookmark.find({
      owner: req.user._id,
      folder: oneFolder._id
    });
    res.render("homepage", {
      user: data,
      oneFolder: oneFolder,
      bookmark,
      folders
    });
  } catch (error) {
    next(error);
  }
});

//search

router.post("/search", async (req, res, next) => {
  let userSearch = req.body.search;
  let user = req.user;

  try {
    const folders = await Folder.find({ owner: req.user._id });
    const foundBookMarks = await Bookmark.find({
      title: userSearch,
      owner: req.user._id
    });
    const foundFolders = await Folder.find({
      name: userSearch,
      owner: req.user._id
    });
    const foundUsers = await User.find({
      $and: [{ username: userSearch }, { username: { $ne: user.username } }]
    });
    const data = {
      foundBookMarks,
      foundFolders,
      userSearch,
      foundUsers
    };
    console.log("=-=-=-=-=-=folders=-=-=-", folders);
    res.render("search", { data, user, folders });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
