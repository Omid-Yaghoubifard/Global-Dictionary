const express            = require("express"),
      router             = express.Router(),
      passport           = require("passport"),
      User               = require("./models/user"),
      isLoggedIn         = require("./middlewares/isLoggedIn"),
      isNotLoggedIn      = require("./middlewares/isNotLoggedIn"),
      axios              = require("axios"),
      nodemailer         = require("nodemailer"),
      { celebrate, Joi } = require("celebrate");

// Homepage
router.get("/", (req,res) => {
    let path = req.route.path;
    let wordsApi = false;
    function renderHome(){
        res.render("home", {
            user: req.user,
            path,
            wordsApi,
            messages: [req.flash("userSignedUp")]
        });
    }
    axios({
        "method":"GET",
        "url": "https://wordsapiv1.p.rapidapi.com/words/?random=true&hasDetails=frequency,definitions",
        "headers":{
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPIDAPI,
            "useQueryString": true
        }
    })
    .then((response)=>{
        wordsApi = response.data;
        // console.log(response.data);
        renderHome();
    })
    .catch(err=>{
        renderHome();
    })
})

// show
router.get("/index", async (req,res) => {
    let query = "index";
    let path = req.route.path;
    let wordsApi;
    let wordPronunciation;
    let unsplash;
    let searchHistory;
    if(req.query.query){
        query = req.query.query.trim()
                               .toLowerCase()
                               .replace(/isnt/g, "isn't")
                               .replace(/wasnt/g, "wasn't")
                               .replace(/werent/g, "weren't")
                               .replace(/youre/g, "you're")
                               .replace(/theyre/g, "they're")
                               .replace(/youve/g, "you've")
                               .replace(/theyve/g, "they've")
                               .replace(/havent/g, "haven't")
                               .replace(/hasnt/g, "hasn't")
                               .replace(/hadnt/g, "hadn't")
                               .replace(/couldnt/g, "couldn't")
                               .replace(/wouldnt/g, "wouldn't")
                               .replace(/shouldnt/g, "shouldn't")
                               .replace(/mustnt/g, "mustn't")
                               .replace(/youll/g, "you'll")
                               .replace(/itll/g, "it'll")
                               .replace(/theyll/g, "they'll")
                               .replace(/doesnt/g, "doesn't")
                               .replace(/didnt/g, "didn't")
                               .replace(/dont /g, "don't ")
                               .replace(/its /g, "it's ")
                               .replace(/lets /g, "let's ")
                               .replace(/ones /g, "one's ")
                               .replace(/cant /g, "can't ");
    }
    function renderShow(){
        res.render("show",{
            path,
            wordsApi,
            wordPronunciation,
            unsplash,
            searchHistory,
            user: req.user
        })
    }
    function updateAndRender(){
        if(!wordsApi.frequency && !wordsApi.word.includes(" ") && !wordsApi.source){
            unsplash = undefined;
        }
        // console.log(unsplash);
        if (req.user && wordsApi && wordsApi.results) {
            User.findByIdAndUpdate(req.user._id, { $pull: { queries : { word : query } } }, (err, updated) =>{
                const filteredArr = wordsApi.results.reduce((acc, current) => {
                    const x = acc.find(item => (item === current.partOfSpeech));
                    if (!x) {
                        return acc.concat([current.partOfSpeech]);
                    } else {
                        return acc;
                    }
                }, []);
                const newWord = {
                    word: wordsApi.word,
                    definition: wordsApi.results[0].definition,
                    wordType: filteredArr,
                    pronunciation: wordPronunciation
                }
                if(wordsApi.results.length > 1 && wordsApi.results[0].instanceOf && wordsApi.results[1].definition){
                    newWord.definition = wordsApi.results[1].definition
                }
                User.findById(req.user._id).select({ "queries": { "$slice": -1 }}).exec((err,doc) => {
                    // console.log(doc.queries[0].word);
                    User.findByIdAndUpdate(req.user._id,
                        {$push: {queries: newWord} }, (err, success) => {
                            if (err) {
                                console.log(err);
                            } 
                        }
                    )
                })
            })
            // console.log (req.user._id);
            // CB is necessary to make $push in the following method work.
            User.findById(req.user._id).exec((err, userData) => {
                let temp = userData.queries;
                if (temp.length < 51) {
                    searchHistory = temp.reverse();
                } else{
                    searchHistory = temp.slice(temp.length - 50).reverse();
                }
                renderShow()
            });
        } else{
            renderShow()
        }
    }
    
    axios.get(
        `https://api.unsplash.com/search/photos/?page=1&per_page=1&query=${query}&client_id=${process.env.UNSPLASHACCESSKEY}`
    )
    .then((resolved)=>{
        if (resolved.data.results[0] && resolved.data.results[0].urls.small) {
            unsplash = [
                resolved.data.results[0].urls.small,
                resolved.data.results[0].user.name,
                resolved.data.results[0].user.links.html
            ];
            axios.get(
                `${resolved.data.results[0].links.download_location}/?client_id=${process.env.UNSPLASHACCESSKEY}`
            )
        }
    })
    .catch((err)=>{
        unsplash = undefined;
    })

    await axios.get(
        // `https://api.linguarobot.io/media/pronunciations/en/${query}-us.mp3`
        // `https://lex-audio.useremarkable.com/mp3/${query}_us_1.mp3`
        `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${query}--_us_1.mp3`
    )
    .then((resolved)=>{
        // wordPronunciation = `https://api.linguarobot.io/media/pronunciations/en/${query}-us.mp3`;
        // `https://lex-audio.useremarkable.com/mp3/${query}_us_1.mp3`
        wordPronunciation = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${query}--_us_1.mp3`;
    })
    .catch(async (err)=>{
        await axios({
            "method":"GET",
            "url": `https://lingua-robot.p.rapidapi.com/language/v1/entries/en/${query}`,
            "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"lingua-robot.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPIDAPI,
            "useQueryString":true
            }
        })
        .then((resolve)=>{
            if(resolve.data && resolve.data.entries && resolve.data.entries[0] && resolve.data.entries[0].pronunciations && resolve.data.entries[0].pronunciations[0] && resolve.data.entries[0].pronunciations[0].audio){
                const bestPronunciation = resolve.data.entries[0].pronunciations;
                if (bestPronunciation[bestPronunciation.length -1].audio.url) {
                    wordPronunciation = bestPronunciation[bestPronunciation.length -1].audio.url;
                } else{
                    wordPronunciation = bestPronunciation[0].audio.url;
                }
            }
        })
        .catch((err)=>{
            wordPronunciation = undefined;
        })
    })

    axios({
        "method":"GET",
        "url": `https://wordsapiv1.p.rapidapi.com/words/${query}`,
        "headers":{
        "content-type": "application/octet-stream",
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI,
        "useQueryString": true
        }
    })
    .then((response)=>{
        // console.log(wordPronunciation);
        if (response.data){
            wordsApi = response.data;
        }
        // console.log(wordsApi);
        updateAndRender();
    })
    .catch((error)=>{
        axios.get(
            `https://api.wordnik.com/v4/word.json/${query}/definitions?limit=200&includeRelated=false&sourceDictionaries=wiktionary&useCanonical=true&includeTags=false&api_key=${process.env.WORDNIK}`
        )
        .then((response)=>{
            // console.log(response.data);
            wordsApi = {
                results: [],
                word: query,
                source: "Wikitionary"
            }
            wordsApi.results = response.data.reduce((acc, current) => {
                return acc.concat({
                    partOfSpeech: current.partOfSpeech,
                    definition: current.text.replace(/<xref>/g, "").replace(/<\/xref>/g, "")   
                });
            }, []);
            // console.log(wordsApi);
            updateAndRender();
        })
        .catch((err)=>{
            req.flash("noResult", "No results found. Please check your spelling and try again.");
            // console.log(err);
            res.redirect("/noresult")
        })
    })
});

router.get("/noresult", (req,res) => {
    let path = req.route.path;
    res.render("noResult", {
        user: req.user,
        path,
        messages: [req.flash("noResult")]
    });
})

router.get("/exampleSearching", (req, res) => {
    let val = req.query.search;
    axios({
        "method":"GET",
        "url":"https://twinword-word-graph-dictionary.p.rapidapi.com/example/",
        "headers":{
            "content-type":"application/octet-stream",
            "x-rapidapi-host":"twinword-word-graph-dictionary.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPIDAPI,
            "useQueryString":true
        },
        "params":{
            "entry": val
        }
    })
    .then((response)=>{
        if (response.data && response.data.example) {
            // console.log(response.data)
            res.send(response.data.example);
        } else {
            res.send(["Sorry, no more data is available in this section."])
        }
    })
    .catch((error)=>{
        res.send(["Sorry, no more data is available in this section."])
    })
});

router.get("/literatureSearching", (req, res) => {
    let value = req.query.searchQuery;
    axios.get(
        `https://api.wordnik.com/v4/word.json/${value}/examples?includeDuplicates=false&useCanonical=false&limit=50&api_key=${process.env.WORDNIK}`
    )
    .then((response)=>{
        if (response.data && response.data.examples) {
            res.send(response.data.examples);
            // console.log(response.data.examples)
        } else {
            res.send(["Sorry, no more data is available in this section."])
        }
    })
    .catch((error)=>{
        res.send(["Sorry, no more data is available in this section."])
    })
});

// Sign up
router.get("/signup", isNotLoggedIn, (req,res) => {
    let path = req.route.path;
    res.render("signup", {
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
    req.flash("failedLogIn", "Login failed! The username and/or password is incorrect.");
    res.redirect("/login");
});

// Log out
router.get("/logout", isLoggedIn, (req, res) => {
    req.logout();
    res.redirect("/");
});

// profile
router.get("/profile", isLoggedIn, (req,res) => {
    let path = req.route.path;
    User.findById(req.user._id).exec((err, userData) => {
        let temp = userData.queries;
        let searchHistory = temp.reverse();
        let results = userData.testResults;
        let testResults = results.reverse();
        res.render("profile", {
            path,
            searchHistory,
            testResults,
            user: req.user,
            messages: [req.flash("passwordMatch"), req.flash("passwordChange"), req.flash("passwordChangeError"), req.flash("loggedInUser")]
        })
    })
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
            res.redirect("/profile");
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
                    res.redirect("/profile");
                }
                })
                .catch(err => {
                    req.flash("passwordChangeError", "There was an error. Please try again");
                    res.redirect("/profile");
                })
        }
    }
);

// delete words
router.get("/deleteWords", isLoggedIn, (req, res) =>{
    let delWord = req.query.word;
    User.findByIdAndUpdate(req.user._id, { $pull: { queries : { word : delWord } } }, (err, updated) =>{})
});

router.get("/test", isLoggedIn, (req,res) => {
    let nOfQuestions = req.query.numOfQues;
    let path = req.route.path;
    User.findById(req.user._id).exec((err, userData) => {
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        let temp = userData.queries.reverse().slice(0, 500);
        let searchHistory = temp.reduce((acc, current) => {
            const x = acc.find(item => (!current.definition || current.wordType[0] === "phrase" || item.definition === current.definition));
            if (!x) {
            return acc.concat([current]);
            } else {
            return acc;
            }
        }, []);
        if (searchHistory.length < 75) {
            res.send(["Sorry, not enough data to create a test. Please keep using the dictionary."]);
        } else{
            shuffleArray(searchHistory);
            let sentences = searchHistory.slice(0, nOfQuestions);
            let choices = searchHistory.slice(nOfQuestions);
            let fullQuestions = [];
            sentences.forEach(element => {
                let randNum = Math.floor(Math.random() * choices.length)
                randNum / choices.length < 0.5 ? randNum++ : randNum--;
                let fourChoices = [
                    [element.word, true],
                    [choices[randNum].word],
                    [choices[randNum + 1].word],
                    [choices[randNum - 1].word]
                ]
                shuffleArray(fourChoices);
                fullQuestions.push({
                    definition: element.definition,
                    fourChoices
                })
            });
            // console.log(fullQuestions);
            res.send(fullQuestions)
        }
    })
})

router.get("/testResult", isLoggedIn, (req,res) => {
    let testResult = {
        trueAnswers: req.query.trueAnswers,
        numOfQuestions: req.query.numOfQuestions,
        percentage: req.query.percentage,
        grade: req.query.grade,
        time: new Date().toDateString()
    }
    // console.log(testResult);
    User.findByIdAndUpdate(req.user._id,
        {$push: {testResults: testResult} }, (err, success) => {
            if (err) {
                console.log(err);
            } else {
                res.send(testResult);
            }
        }
    )
})

router.get("/about", (req,res) => {
    let path = req.route.path;
    res.render("about", {
        user: req.user,
        path
    });
})

router.get("/privacy", (req,res) => {
    let path = req.route.path;
    res.render("privacy", {
        user: req.user,
        path
    });
})

router.get("/terms", (req,res) => {
    let path = req.route.path;
    res.render("terms", {
        user: req.user,
        path
    });
})

router.get("/contact", (req, res) =>{
    let path = req.route.path;
    res.render("contact", {
        user: req.user,
        path
    });
})

router.post("/contact",
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().max(1024).trim().required(),
            email: Joi.string().max(256).email().lowercase().trim().required(),
            message: Joi.string().max(5096).trim().required()
        }),
    }),
    (req, res) =>{
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            },
        });
        let info = {
            from: req.body.email,
            to: process.env.EMAILTO,
            subject: `Global Dictionary Message | name: ${req.body.name} | email: ${req.body.email}`,
            text: req.body.message
        };
        transporter.sendMail(info, (err, sent)=>{})
    }
);

// 404
router.get("*", (req, res) => {
    res.render("404")
});

module.exports = router;