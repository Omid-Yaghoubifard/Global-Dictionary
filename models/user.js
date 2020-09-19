const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const User = new mongoose.Schema({
    username: {type: String, index: true, unique:true, required: true},
    email: String,
    password: String,
    queries: {type: Array , "default": [] }
    // queries: [{
    //   word: String,
    //   wordType: Number,
    //   date: {
    //     type: Date,
    //     default: Date.now
    //   }
    // }]
})

User.index({
    username: 1,
  }, {
    unique: true,
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);