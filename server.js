// express and mongoose dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

// scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes

// Scrape route - scrapes Star Tribune website for local news
app.get("/scrape", function (req, res) {
    axios.get("http://www.startribune.com/local/").then(function (response) {
        // load response into cheerio and save it to $
        var $ = cheerio.load(response.data);

        // TODO find out format of reddit html
        $(".tease").each(function (i, element) {
            var result = {};
            //TODO
            result.title = $(this)
                .find("h3")
                .text();
            result.link = $(this)
                .find("a")
                .attr("href");
            result.summary = $(this)
                .find(".tease-summary")
                .text();

            // Create new Article
            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab all documents in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them to client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for getting all saved Articles from the db
app.get("/saved", function (req, res) {
    // Grab all documents in the Articles collection
    db.Article.find({ saved: true })
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them to client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with its note
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(Err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body into it
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a note was created successfully, find the article specified by the id in req.params
            // and associate the two. {new: true} allows for overwriting old notes
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving an article
app.put("/articles/:id", function (req, res) {
    console.log(req.body);
    db.Article.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
})