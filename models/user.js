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
    img: { type: String },
    fav_bookmarks: { type: Schema.Types.ObjectId, ref: "BookMark" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: 0 }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: 0 }],
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
