const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid login credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid login credentials");
  }
  return user;
};


// Exclude password field when returning user object
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
  
    delete userObject.password;
  
    return userObject;
  };
  

const User = mongoose.model("User", userSchema);

module.exports = User;
