                               require("dotenv").config();
const express                = require("express"),
      bodyParser             = require("body-parser"),
      mongoose               = require("mongoose"),
      ejs                    = require("ejs"),
      session                = require("express-session"),
      router                 = require("./router"),
      passport               = require("passport"),
      passportLocalMongoose  = require("passport-local-mongoose"),
      methodOverride         = require("method-override"),
      flash                  = require("connect-flash"),
      cookieParser           = require("cookie-parser"),
      { errors }             = require("celebrate"),
      app                    = express();

app.set ("view engine", "ejs");
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser(process.env.COOKIEPARSER));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: "auto" }
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/GlobalDictionary", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.set("useFindAndModify", false);

app.use(router);
app.use(errors());

const User = require("./models/user");

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Server has started");
})