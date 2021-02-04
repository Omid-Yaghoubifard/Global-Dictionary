function isNotLoggedIn(req, res, next){
    if (!req.user){
        next();
    } else{
        req.flash("loggedInUser", "You are already logged in!");
        res.redirect("/profile");
    }
};

module.exports = isNotLoggedIn;