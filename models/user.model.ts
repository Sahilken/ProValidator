import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    salt: {
      type: String,
    },
    // validationSubCategories:[
    //     {
    //         appl
    //     }
    // ]
  },
  { timestamps: true }
);

export const UserDB = mongoose.model("user", userSchema);
