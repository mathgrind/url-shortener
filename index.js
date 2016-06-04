var express = require("express");
var mongo = require("mongodb").MongoClient;
var db = mongo.connect("mongodb://localhost:27017/db");
db.then(function(res) {
    db = res;
    db.collection("counter", function(err, collection) {
        if (err) throw err;
        collection.findOne({_id: "urls"}, function(err, result) {
            if (err) throw err;
            if (result===null) {
                collection.insertOne({_id: "urls", count: 0});
            }
            console.log("Database ready.");
        });
    });
});

var app = express();

app.get(/\/new\/(.*)/, function (req, res) {
    var url = req.params[0];
    var urlPattern = new RegExp(/http[s]?:\/\/.+?\..+/);
    if (urlPattern.test(url)) {
        storeUrl(url, function(err, doc) {
            if (err) console.log(err);
            res.json({original_url:url, short_url: req.protocol + "://"
                                               + req.hostname + "/" + doc._id});
            res.end();
        });
    } else {
        res.json({error: "Bad url."});
        res.end();
    }
});
app.get(/([0-9]+)/, function(req, res) {
    var id = parseInt(req.params[0]);
    db.collection("urls", function(err, collection) {
        if (err) console.log(err);
        collection.findOne({_id: id}, function(err, result) {
            if (err) console.log(err);
            if (result===null) {
                res.json({error: "This url is not in the database."});
                res.end();
            } else {
                res.redirect(302, result.url);
                res.end();
            }
        });
    });
});

//<div class="rg_meta">({.*?})<\/div>
function storeUrl(url, callback) {
    db.collection("urls", function(err, collection) {
        if (err) console.log(err);
        getNext(function(err, count) {
            if (err) console.log(err);
            var doc = {_id:count, url:url};
            console.log(doc);
            collection.insertOne(doc);
            callback(null, doc);
        });
    });
}

function getNext(callback) {
    db.collection("counter", function(err, collection) {
        if (err) console.log(err);
        collection.findOneAndUpdate({_id: "urls"}, {$inc: {count: 1}},
            function(err, result) {
                if (err) console.log(err);
                callback(null, result.value.count);
            }
        );
    });
}

app.listen(8080);