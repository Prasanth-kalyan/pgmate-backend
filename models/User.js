const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "tenant"],
      default: "tenant",
    },

    phone: {
      type: String,
    },

    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
