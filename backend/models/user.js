import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  displayName: String,
  profilePicture: String,
  phoneNumber: String,
  campus: String,
  bio: String,
  joinDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("User", userSchema);
