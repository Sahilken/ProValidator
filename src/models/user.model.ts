import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
    },
    encryptedPassword: {
      type: String,
    },
    passwordSalt: {
      type: String,
    },
    validationSubCategories: [
      {
        application: {
          type: String,
        },
        otpSalt: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export const UserDB = mongoose.model("user", userSchema);
