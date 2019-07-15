const mongoose = require("mongoose");
require("mongoose-type-email");
const Schema = mongoose.Schema;

const bookMarkSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    is_public: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    folder: { type: Schema.Types.ObjectId, ref: "BookmarkGroup" }
  },
  {
    timestamps: true
  }
);

const BookMark = mongoose.model("Bookmark", bookMarkSchema);

module.exports = BookMark;
