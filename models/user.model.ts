import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
    },
    encryptedPassword: {
      type: String,
    },
    salt: {
      type: String,
    },
    validationSubCategories: [
      {
        application: {
          type: String,
        },
        salt: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export const UserDB = mongoose.model("user", userSchema);
