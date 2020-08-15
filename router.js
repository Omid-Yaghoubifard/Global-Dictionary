const express            = require("express"),
      router             = express.Router(),
      passport           = require("passport"),
      User               = require("./models/user"),
      isLoggedIn         = require("./middlewares/isLoggedIn"),
      isNotLoggedIn      = require("./middlewares/isNotLoggedIn"),
      axios              = require("axios"),
      currentYear        = new Date().getFullYear(),
      { celebrate, Joi } = require("celebrate");

// Homepage
router.get("/", (req,res) => {
    let path = req.route.path;
    res.render("home", {
        currentYear,
        user: req.user,
        path,
        messages: [req.flash("loggedOut"), req.flash("noResult")]
    });
})

// show
router.get("/index", (req,res) => {
    let query = req.query.query;
    let path = req.route.path;
    axios.all([
        axios({
            "method":"GET",
            "url": `https://wordsapiv1.p.rapidapi.com/words/${query}`,
            "headers":{
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": process.env.WORDSAPI,
            "useQueryString": true
            }
        }),
        axios({
            "method":"GET",
            "url": `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${query}`,
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"lingua-robot.p.rapidapi.com",
            "x-rapidapi-key": process.env.linguaRobot,
            "useQueryString":true
            }
        })
    ])
    .then((responses)=>{
        let wordsApi = responses[0].data;
        // console.log(wordsApi);
        let linguaRobot;
        if(responses[1].data && responses[1].data.entries[0].pronunciations){
            linguaRobot = responses[1].data.entries[0].pronunciations[0];
        }
        // console.log(linguaRobot);
        res.render("show",{
            currentYear,
            path,
            wordsApi,
            linguaRobot,
            user: req.user
        })
    })
    .catch((error)=>{
        req.flash("noResult", "Please make sure you have typed the word correctly.");
        console.log(error);
        res.redirect("/")
    })
});

// Sign up
router.get("/signup", isNotLoggedIn, (req,res) => {
    let path = req.route.path;
    res.render("signup", {
        currentYear,
        path,
        user: req.user,
        messages: [req.flash("passwordMatch"), req.flash("signUpUserError"), req.flash("signUpEmailError")]
    });
});

router.post("/signup", isNotLoggedIn,
    celebrate({
        body: Joi.object().keys({
            username: Joi.string().min(3).max(30).trim().required(),
            email: Joi.string().email().lowercase().trim().required(),
            password: Joi.string().min(8).max(256).trim().required(),
            password2: Joi.string().min(8).max(256).trim().required(),
        }),
    }),
    (req, res) => {
        if(req.body.password !== req.body.password2) {
            req.flash("passwordMatch", "Please make sure you enter the same password twice.");
            res.redirect("/signup");
        } else {
        User.register(new User({ username : req.body.username }), req.body.password, (err, newUser) => {
            if (err) {
                req.flash("signUpUserError", "Sorry. That username already exists. Please try another username.");
                res.redirect("/signup");
            } else {
                User.findOne({ username: req.body.username }, (err, foundUser) => {
                    if (err) {
                        req.flash("signUpEmailError", "Sorry. There was an error signing you up. Please try again.");
                        res.redirect("/signup");
                    } else {
                        foundUser.email = req.body.email;
                        foundUser.save();
                    }
                })
                    passport.authenticate("local")(req, res, () => {
                        req.flash("userSignedUp", "Congratulations! Your account was created successfully.");
                        res.redirect("/");
                    })
            };
        })};
    }
);

// Log in
router.get("/login", isNotLoggedIn, (req,res) => {
    let path = req.route.path;
    res.render("login", {
        currentYear,
        path,
        user: req.user,
        messages: [req.flash("failedLogIn"), req.flash("PleaseLogIn")]
    });
});

router.post("/login", isNotLoggedIn,
    celebrate({
        body: Joi.object().keys({
            username: Joi.string().min(3).max(30).trim().required(),
            password: Joi.string().min(8).max(256).trim().required(),
        }),
    }),
    passport.authenticate("local", {failureRedirect: "/loginfailed"}),
    (req, res) => {
        res.redirect("/");
});

router.get("/loginfailed", isNotLoggedIn, (req, res) => {
    req.flash("failedLogIn", "Login failed! The username or password is incorrect.");
    res.redirect("/login");
});

// Log out
router.get("/logout", isLoggedIn, (req, res) => {
    req.logout();
    req.flash("loggedOut", "You have succesfully logged out!");
    res.redirect("/");
});


// profile
router.get("/profile", isLoggedIn, (req,res) => {
    let path = req.route.path;
    res.render("profile", {
        currentYear,
        path,
        user: req.user
    })
});

// Change password
router.get("/profile/edit", isLoggedIn, (req,res) => {
    let path = req.route.path;
    res.render("profileEdit", {
        currentYear,
        path,
        user: req.user,
        messages: [req.flash("passwordMatch"), req.flash("passwordChangeError")]
    });
});


router.post("/profile", isLoggedIn, 
    celebrate({
        body: Joi.object().keys({
            password: Joi.string().min(8).max(256).trim().required(),
            password2: Joi.string().min(8).max(256).trim().required(),
        }),
    }),
    (req, res) => {
        if(req.body.password !== req.body.password2) {
            req.flash("passwordMatch", "Please make sure you enter the same password twice.");
            res.redirect("/profile/edit");
        } else {
            User.findOne({username: req.user.username}).then(user => {
                if (user){
                    user.setPassword(req.body.password, err => {
                        user.save();
                        req.flash("passwordChange", "You have successfully changed your password.");
                        res.redirect("/profile");
                    });
                } else {
                    req.flash("passwordChangeError", "There was an error. Please try again");
                    res.redirect("/profile/edit");
                }
            })
        }
    }
);


// Test your knowledge on what you have searched for!
router.get("/test", (req,res) => {
    let path = req.route.path;
    res.render("test", {
        currentYear,
        path,
        user: req.user
    })
})

// 404
router.get("*", (req, res) => {
    res.render("404")
});

module.exports = router;