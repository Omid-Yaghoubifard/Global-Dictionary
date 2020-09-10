$(".exampleRequest").on("click", function() {
    if ($("#moreExamples").html() === ""){
        let parameters = { search: $(this).val() }
        $(this).addClass("btn-primary").removeClass("btn-outline-primary");
        $(this).find("i").removeClass("fa-plus").addClass("fa-minus");
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
        $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
        $(this).next("#moreExamples").slideToggle("slow");
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
        });
    } else{
        $(this).find("i").toggleClass("fa-minus").toggleClass("fa-plus");
        $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
        $(this).next("#literature").slideToggle(1200);
    }
});

$(".toggle-btn").click(function(){
    $(this).find("i").toggleClass("fa-minus").toggleClass("fa-plus");
    $(this).toggleClass("btn-primary").toggleClass("btn-outline-primary");
    $(this).next(".toToggle").slideToggle("fast");
});