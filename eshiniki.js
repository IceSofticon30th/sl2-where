var Datastore = require('nedb');
var tokens = require('./tokens.json');
var request = require('request');
var qs = require('querystring');
var async = require('async');

var db = new Datastore({filename: __dirname + '/eshiniki.db', autoload: true});

function extractKeyphrase(sentence, callback) {
    var params = {
        appid: tokens.yahoo.appid,
        output: 'json',
        sentence: sentence
    }
    var api = 'http://jlp.yahooapis.jp/KeyphraseService/V1/extract';
    var query = qs.stringify(params, '&', '=');
    var uri = api + '?' + query;
    
    request(uri, function (err, response, body) {
        if (err) console.error(err);
        var res;
        try {
            res = JSON.parse(body);
        } catch (e) {
            res = {};
        }
        if (typeof callback == 'function') callback(res);
    });
}

function extractPropur(phrase, callback) {
    var params = {
        app_id: tokens.goo.appid,
        sentence: phrase,
        class_filter: 'LOC|ART'
    }
    var api = 'https://labs.goo.ne.jp/api/entity';
    
    request.post(api, {form: params}, function (err, res, body) {
        callback(JSON.parse(body));
    });
}

/*
db.find({}).sort({id: 1}).exec(function (err, docs) {
    async.forEachOfLimit(docs, 1,
        function (tweet, index, callback) {
            console.log(new Date(tweet.created_at).toLocaleString(), tweet.text);
            extractKeyphrase(tweet.text, function (result) {
                console.log(result);
                db.update({id_str: tweet.id_str}, { $set: {keyphrase: result} }, {}, function (err) {
                    extractPropur(tweet.text, function (result) {
                        db.update({id_str: tweet.id_str}, { $set: {propur: result} }, {}, function (err) {
                            callback(null);
                        });
                    });
                });
            });
        },
        function DONE() {
            console.log('やったぜ。');
        }
    );
});
*/

db.find({ keyphrase: {$exists: true} }, function (err, docs) {
    docs.forEach(function (item) {
        if (item.propur.ne_list != undefined) {
            if (item.propur.ne_list.length > 0)
                console.log(new Date(item.created_at).toLocaleString() + ' ' + item.propur.ne_list);
        }
    });
})