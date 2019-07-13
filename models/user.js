const mongoose = require("mongoose");
require("mongoose-type-email");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: mongoose.SchemaTypes.Email, required: true },
    my_bookmarks: { type: Schema.Types.ObjectId, ref: "BookMark" },
    fav_bookmarks: { type: Schema.Types.ObjectId, ref: "BookMark" },
    followers: { type: Schema.Types.ObjectId, ref: "User" },
    following: { type: Schema.Types.ObjectId, ref: "User" },
    news_feed: {
      type: Schema.Types.ObjectId,
      ref: "BookMark",

      type: Schema.Types.ObjectId,
      ref: "BookMark-Groups"
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
