const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const User = new mongoose.Schema({
    username: {type: String, index: true, unique:true, required: true},
    email: String,
    password: String
})

User.index({
    username: 1,
  }, {
    unique: true,
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);