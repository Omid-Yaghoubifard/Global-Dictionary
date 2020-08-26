$("#ExampleRequest").on("click", function() {
    let parameters = { search: $(this).val() }
    $(this).hide();
    $.get( "/exampleSearching", parameters, function(data) {
        if(!data){
            $("#moreExamples").append("<p>No more examples are available.</p>");
        }
        $.each(data, function () {
            $("#moreExamples").append(`<p>${this}</p>`);
        });
    });
});