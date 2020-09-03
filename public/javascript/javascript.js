$("#exampleRequest").on("click", function() {
    let parameters = { search: $(this).val() }
    $(this).hide();
    $.get( "/exampleSearching", parameters, function(data) {
        $.each(data, function () {
            let questionMark;
            if ((this.indexOf(".") === -1) && (this.indexOf("!") === -1) && (this.indexOf("?") === -1)){
                questionMark = "?"
            }
            if (questionMark){
                $("#moreExamples").prepend(`<p>${this.trim()}${questionMark}</p>`);
            } else{
                $("#moreExamples").prepend(`<p>${this}</p>`);
                }
        });
    });
});

$("#literatureRequest").on("click", function() {
    let parameters = { searchQuery: $(this).val() }
    $(this).hide();
    $.getJSON( "/literatureSearching", parameters, function(data) {
        const filteredArr = data.reduce((acc, current) => {
            const x = acc.find(item => item.text.slice(1,50) === current.text.slice(1,50));
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
        }, []);
        filteredArr.forEach(function (sentence) {
            $("#moreExamples").prepend("</blockquote>");
            $("#moreExamples").prepend(`<footer class="blockquote-footer text-right mb-4">${sentence.title || ""}</footer>`);
            $("#moreExamples").prepend(`<p class="mb-0">${sentence.text || sentence}</p>`);
            $("#moreExamples").prepend("<blockquote class='blockquote text-right'>");
        });
    });
});