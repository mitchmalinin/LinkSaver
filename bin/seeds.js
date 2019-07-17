const Folder = require("../models/bookmarkGroups");
const mongoose = require("mongoose");

let folder = {
  name: "favorites",
  is_public: true
};

mongoose.connect(`mongodb://localhost/linksaver`);

Folder.create(folder)
  .then(folder => {
    console.log("The folder was created and saved", folder);
  })
  .catch(err => {
    console.log("There was an error", err);
  });
