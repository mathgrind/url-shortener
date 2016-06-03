var express = require("express");
var mongo = require("mongodb").MongoClient;
var db = mongo.connect("mongodb://localhost:27017/db");

var app = express();

app.get(/\/new\/(.*)/, function (req, res) {
    var url = req.params[0];
    console.log(url);
    var urlPattern = new RegExp(/http[s]?:\/\/.+?\..+/);
    if (urlPattern.test(url)) {
        var id = storeUrl(url);
        res.json({original_url:url, short_url: "/"+id});
        res.end("asd");
    } else {
        res.json({error: "Bad url."});
        res.end("sdf");
    }
});


//app.get(/(.*)/, function(req, res) {
//    var test = req.params[0];
//    console.log(test);
//    res.end("lol");
//})


//<div class="rg_meta">({.*?})<\/div>
function storeUrl(url) {
    db.collection("urls", function(err, collection) {
        if (err) console.log(err);
        var id = getNext();
        collection.insertOne({_id:id, url:url});
        return id;
    });
}

function getNext() {
    db.collection("counter", function(err, collection) {
        if (err) console.log(err);
        collection.findOneAndUpdate({_id: "urls"}, {$inc: {count: 1}},
            function(err, result) {
                if (err) console.log(err);
                if (result===null) {
                    collection.insertOne({_id:"urls", count:0});
                    return 0;
                }
                return result.count;
            }
        );
    });
}

app.listen(8080);