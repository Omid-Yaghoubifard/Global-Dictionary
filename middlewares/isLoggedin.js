function isLoggedIn(req, res, next){
    if (req.user){
        next();
    } else{
        req.flash("PleaseLogIn", "Please log in first.");
        res.redirect("/login");
    }
};

module.exports = isLoggedIn;