// Grab articles in db as you load
$.getJSON("/articles", function (response) {
    fillPage(response, false);
});

// Whenever someone clicks the scrape button, trigger scrape route
$(document).on("click", "#scrape-button", function () {
    console.log("scraping");
    // make an ajax call to scrape
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).then(function (data) {
        // With scraped articles, automatically fill page
        $.ajax({
            method: "GET",
            url: "/articles"
        }).then(fillPage(data, false));
    });
});

// Save article button click will add article to saved list
$(document).on("click", ".save-article", function () {
    let id = $(this).attr("data-id");
    $.ajax({
        method: "PUT",
        url: "articles/" + id,
        data: { saved: true }
    }).then(function (data) {
        console.log(data);
    });

    let parentArticle = $(this).parents(".article");
    console.log(parentArticle);
    parentArticle.find(".save-article").remove();
    parentArticle.append("<button data-id='" + id + "' class='remove-article btn btn-danger'>Remove from Saved</button>");

});

// Remove article button click will remove article from saved list
$(document).on("click", ".remove-article", function () {
    let id = $(this).attr("data-id");
    $.ajax({
        method: "PUT",
        url: "articles/" + id,
        data: { saved: false }
    }).then(function (data) {
        console.log(data);
    });

    let parentArticle = $(this).parents(".article");
    console.log(parentArticle);
    parentArticle.find(".remove-article").remove();
    parentArticle.append("<button data-id='" + id + "' class='save-article btn btn-success'>Save Article</button>");

});

// All Articles will load only saved articles and allow you to add notes
$(document).on("click", "#all-articles", function () {
    $.ajax({
        method: "GET",
        url: "/articles",
    }).then(function (articles) {
        fillPage(articles, false);
    });
});

// Saved Articles will load only saved articles and allow you to add notes
$(document).on("click", "#saved-articles", function () {
    // Get articles that are saved
    console.log("saved articles incoming");
    $.ajax({
        method: "GET",
        url: "/saved",
    }).then(function (savedArticles) {
        fillPage(savedArticles, true);
    });
});

// View Notes
$(document).on("click", ".view-notes", function() {
    
})

// function to fill the page with json data from database
function fillPage(articles, savedOnly) {
    if (articles) {
        $("#articles").empty();
        console.log(articles);
        for (let i = 0; i < articles.length; i++) {
            let articleDiv = $("<div class='col article'>");
            articleDiv.append("<h2>" + articles[i].title + "</h2>");
            articleDiv.append("<hr>")
            if (articles[i].summary) {
                articleDiv.append("<p class='article-summary'>" + articles[i].summary + "</p>");
            } else {
                articleDiv.append("<p class='article-summary'>No Summary Available</p>");
            }

            let articleRow = $("<div class='row article-row'>");
            articleRow.append("<a class='article-link' target='_blank' href='" + articles[i].link + "'>Link to Article</a>");

            if (articles[i].saved) {
                articleRow.append("<button data-id='" + articles[i]._id + "' class='remove-article btn btn-danger'>Remove from Saved</button>");
            } else {
                articleRow.append("<button data-id='" + articles[i]._id + "' class='save-article btn btn-success'>Save Article</button>");
            }

            // if savedOnly passed in as true, add button to access Notes
            if (savedOnly) {
                articleDiv.find(".article-summary").append("<button data-id='" + articles[i]._id + "' class='view-notes btn btn-warning'>Article Notes</button>");
            }

            articleDiv.append(articleRow);
            
            $("#articles").append($("<div class='row'>").append(articleDiv));
        }
    }
}