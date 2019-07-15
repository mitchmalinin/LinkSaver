const mongoose = require("mongoose");
require("mongoose-type-email");
const Schema = mongoose.Schema;

const folderSchema = new Schema(
  {
    name: { type: String, required: true },
    is_public: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "BookMark" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true
  }
);

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
