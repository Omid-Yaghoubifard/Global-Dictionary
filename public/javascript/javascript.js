$(".fade-out-items").delay(4000).fadeOut(500);

$(".exampleRequest").on("click", function() {
    if ($("#moreExamples").html() === ""){
        let parameters = { search: $(this).val() }
        $(this).addClass("btn-primary").removeClass("btn-outline-primary");
        $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
        $("#showMore").html() === "Fewer" ? $("#showMore").html("More") : $("#showMore").html("Fewer");
        $.get( "/exampleSearching", parameters, function(data) {
            $.each(data, function () {
                let questionMark;
                if ((this.indexOf(".") === -1) && (this.indexOf("!") === -1) && (this.indexOf("?") === -1)){
                    questionMark = "?"
                }
                if (questionMark){
                    $("#moreExamples").append(`<p><strong><i class="fas fa-angle-right"></i></strong> ${this.trim()}${questionMark}</p>`);
                } else{
                    $("#moreExamples").append(`<p><strong><i class="fas fa-angle-right"></i></strong> ${this}</p>`);
                }
            });
        });
    } else{
        $(this).find("i").toggleClass("fa-minus").toggleClass("fa-plus");
        $("#showMore").html() === "Fewer" ? $("#showMore").html("More") : $("#showMore").html("Fewer");
        $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
        $(this).next("#moreExamples").slideToggle(400);
    }
});

$(".literatureRequest").on("click", function() {
    if ($("#literature").html() === ""){
        let parameters = { searchQuery: $(this).val() }
        $(this).addClass("btn-primary").removeClass("btn-outline-primary");
        $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
        $.getJSON( "/literatureSearching", parameters, function(data) {
            const filteredArr = data.reduce((acc, current) => {
                const x = acc.find(item => (item.text.slice(2,50) === current.text.slice(2,50)) || (item.text.slice(51,100) === current.text.slice(51,100)));
                if (!x) {
                return acc.concat([current]);
                } else {
                return acc;
                }
            }, []);
            filteredArr.forEach(function (sentence) {
                $("#literature").prepend("</blockquote>");
                $("#literature").prepend(`<footer class="blockquote-footer text-right mb-4">${sentence.title || ""}</footer>`);
                $("#literature").prepend(`<p class="mb-0"><strong><i class="fas fa-angle-right"></i></strong> ${sentence.text || sentence}</p>`);
                $("#literature").prepend("<blockquote class='blockquote text-right'>");
            });
            $("#literature").append(`<a href="https://www.wordnik.com/words/${parameters.searchQuery}" target="_blank"><img src="pictures/wordnik_badge.png" alt=""></a>`)
        });
    } else{
        $(this).find("i").toggleClass("fa-minus").toggleClass("fa-plus");
        $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
        $(this).next("#literature").slideToggle(900);
    }
});

$(".showDef").on("click", function() {
    $(this).toggleClass("text-primary").toggleClass("text-muted");
    $(this).find("i").toggleClass("fa-toggle-on").toggleClass("fa-toggle-off");
    $(".profile-def").each(function(){
        $(this).slideToggle(1);
    });
})

$(".historyWord").on("click", function() {
    if ($(this).children("strong").html() !== $(".historyWord").first().children("strong").html()) {
        $(".historyItem").prepend(`<p class="px-1 pt-2">${$(this).parent()[0].innerHTML}</p>`);
        $(".historyWord").first().addClass("newlyAddedWord")
    }
})

let numOfQuestions;
$(".testReq").on("click", function() {
    numOfQuestions = $(".numOfQuestions").html().slice(0,2);
    if (!numOfQuestions.includes(0)) {
        numOfQuestions = 20;
    }
    let parameters = { numOfQues: numOfQuestions };
    $.getJSON( "/test", parameters, function(data) {
        // $(".testDiv").html("");
        $(".testStart").hide();
        if (data.length < 2) {
            $(".testQuestions").append(`<p class="h6 px-2 text-primary"><i class="fas fa-angle-right"></i> ${data[0]}</p>`);
        } else{
            $(".testQuestions").append("<h6 class=' px-2 my-2 text-primary'><i class='fas fa-angle-right'></i> Select the word that most closely matches each definition and submit the test.</h6>")
            $(".testQuestions").append("<hr class='mt-5 style-one'>")
            data.forEach(function(item, i){
                $(`<div id=${i} class= "singleQ"/>`).appendTo("div.testQuestions");
                $(`#${i}`).append(`<p class="mt-4 mb-3"><strong><i class="fas rightOrWrong mr-2"></i> ${i+1}. ${item.definition}</strong></p>`);
                for (let word of item.fourChoices) {
                    if (word.length > 1) {
                        $(`#${i}`).append(`<button class= "btn btn-outline-primary ml-4 mb-4 fourChoices trueChoice"> ${word[0]} </button>`)         
                    } else{
                        $(`#${i}`).append(`<button class= "btn btn-outline-primary ml-4 mb-4 fourChoices"> ${word[0]} </button>`)         
                    }
                }
            })
            $(".testQuestions").append("<hr class='mt-4 mb-4 style-one'>")
            $(".testQuestions").append("<button class= 'btn ml-4 mb-3 btn-outline-secondary submitButton'>Submit</button>")
            $(".testQuestions").append("<button class= 'btn btn-outline-secondary ml-3 mb-3 startOver'>Start Over!</button>")
            $(".testQuestions").append("<h5 class= 'text-primary ml-4 mt-3 mb-5' id= 'mark'></h5>")
        }
    })
});

$(".toggle-btn").click(function(){
    $(this).find("i").toggleClass("fa-minus").toggleClass("fa-plus");
    $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
    $(this).next(".toToggle").slideToggle("fast");
});

$(".profileNav").click(function(){
    $(this).siblings(".profileNav").find("i").removeClass("fa-angle-double-right").addClass("fa-angle-right")
    $(this).find("i").removeClass("fa-angle-right").addClass("fa-angle-double-right");
});

$(".passwordChange").click(function(){
    $(this).hide();
    $(this).next(".toToggle").slideToggle("fast");
});

$(".cancelChange").click(function(){
    $(".form-control").val("");
    $(this).parent(".toToggle").slideToggle("fast");
    $(this).parent().siblings(".passwordChange").show()
});

$(() => {
    $(".btnLoader").click(() => {
        $("#v-pills-searched p:hidden").slice(0, 10).show();
        if ($("#v-pills-searched p").length === $("#v-pills-searched p:visible").length) {
            $("button.btnLoader").removeClass("btn-outline-primary").addClass("btn-primary").addClass("disabled");
            $("button.btnLoader").html("End of results");
        }
    });
});

let url = document.location.toString();

if (url.match("/profile#v-pills-searched")) {
    $('.myNav a[href="#' + url.split('#')[1] + '"]').tab("show");
    $("#v-pills-profile-tab").removeClass("active").find("i").removeClass("fa-angle-double-right").addClass("fa-angle-right");
    $("#v-pills-profile").removeClass("active").removeClass("show");
    $("#v-pills-searched-tab").addClass("active").find("i").removeClass("fa-angle-right").addClass("fa-angle-double-right");
    $("#v-pills-searched").addClass("show").addClass("active");
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
}

if (url.match("/profile#v-pills-test")) {
    $('.myNav a[href="#' + url.split('#')[1] + '"]').tab("show");
    $("#v-pills-profile-tab").removeClass("active").find("i").removeClass("fa-angle-double-right").addClass("fa-angle-right");
    $("#v-pills-profile").removeClass("active").removeClass("show");
    $("#v-pills-test-tab").addClass("active").find("i").removeClass("fa-angle-right").addClass("fa-angle-double-right");
    $("#v-pills-test").addClass("show").addClass("active");
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
}

if (url.match("/profile#v-pills-result")) {
    $('.myNav a[href="#' + url.split('#')[1] + '"]').tab("show");
    $("#v-pills-profile-tab").removeClass("active").find("i").removeClass("fa-angle-double-right").addClass("fa-angle-right");
    $("#v-pills-profile").removeClass("active").removeClass("show");
    $("#v-pills-result-tab").addClass("active").find("i").removeClass("fa-angle-right").addClass("fa-angle-double-right");
    $("#v-pills-result").addClass("show").addClass("active");
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
}

$(".dropdown-menu a").click(function(){
    $(this).parents(".dropdown").find(".btn").html($(this).text());
    $(this).parents(".dropdown").find(".btn").val($(this).data("value"));
});

// Bloodhound with Remote + Prefetch
let wordSuggestions = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace("word"),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: "https://api.datamuse.com/words?sp=%QUERY*",
        wildcard: "%QUERY"
    },
});
 
// init Typeahead
$(".typingahead").typeahead(
{
    minLength: 1,
    highlight: true
},
{
    name: "words",
    source: wordSuggestions,
    display: function(item) {
        return item.word;
    },
    limit: 10,
    templates: {
        suggestion: function(item) {
            return "<div class='suggestedItem'>"+ item.word +"</div>";
        }
    }
}).on("typeahead:selected", function(e){
    e.target.form.submit();
});

let alreadyExecuted = false;
let target = document.querySelector(".testDiv");
let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        $(".newlyAddedWord").click(function(){
            if ($(this).children("strong").html() !== $(".historyWord").first().children("strong").html()) {
                $(".historyItem").prepend(`<p class="px-1 pt-2">${$(this).parent()[0].innerHTML}</p>`);
            }
        });
        $(".fourChoices").click(function(){
            $(this).removeClass("btn-outline-primary").addClass("btn-primary").addClass("clientChoice");
            $(this).siblings(".fourChoices").removeClass("clientChoice").removeClass("btn-primary").addClass("btn-outline-primary");
        });
        $(".startOver").click(function(){
            $(".testStart").show();
            $(".testQuestions").html("");
            alreadyExecuted = false;
        });
        $(".submitButton").click(function(){
            $(this).addClass("disabled");
            let trueAnswers = 0;
            $(".singleQ").each(function(){
                $(this).children(".fourChoices").each(function(){
                    if($(this).hasClass("trueChoice") && $(this).hasClass("clientChoice")){
                        trueAnswers++;
                        $(this).removeClass("btn-primary").addClass("btn-success");
                        $(this).parent(".singleQ").find("i").addClass("fa-check").addClass("text-success")
                    } else{
                        if($(this).hasClass("clientChoice")){
                            $(this).removeClass("btn-primary").addClass("btn-danger");
                        }
                        if($(this).hasClass("trueChoice")){
                            $(this).removeClass("btn-outline-primary").addClass("btn-success");
                        }
                    }
                })
            })
            $(".rightOrWrong").each(function(){
                if(!$(this).hasClass("fa-check")){
                    $(this).addClass("fa-times").addClass("text-danger")
                }
            })
            if(!alreadyExecuted) {
                let percentage = (trueAnswers / numOfQuestions) * 100;
                let grade;
                let message;
                let article;
                if (percentage % 1 !== 0) {
                    percentage = percentage.toFixed(2)
                }
                if (percentage >= 90) {
                    grade = "A"
                    message = "Bravo!"
                    article = "an"
                } else if (percentage >= 80){
                    grade = "B"
                    message = "Well done!"
                    article = "a"
                } else if (percentage >= 70){
                    grade = "C"
                    message = "I'm sure you could do better."
                    article = "a"
                } else if (percentage >= 60){
                    grade = "D"
                    message = "You need to study a bit harder."
                    article = "a"
                } else {
                    grade = "F"
                    message = "Oh, no!"
                    article = "an"
                }
                let parameters = { 
                    trueAnswers,
                    numOfQuestions,
                    percentage,
                    grade
                };
                $("#mark").html(`<span class= "text-secondary">${message}</span> You answered <span class= "text-secondary">${trueAnswers}/${numOfQuestions} (${percentage}%)</span> of the questions correctly, so you receive ${article} <span class= "text-secondary">${grade}</span> grade.`);
                $.getJSON( "/testResult", parameters, function(data) {
                    $(".testResult").hide();
                    $(".resultTable").removeClass("d-none");
                    $(".tBody").prepend(`
                        <tr>
                            <th scope="row">${data.time}</th>
                            <td>${data.grade}</td>
                            <td>${data.trueAnswers}/${data.numOfQuestions}</td>
                            <td>${data.percentage}%</td>
                        </tr>
                    `)
                })
                alreadyExecuted = true;
            }
        });
    });    
});
let observerConfig = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree : true
};
observer.observe(target, observerConfig);