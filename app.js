var Twitter = require('twit');
var tokens = require('./tokens.json');
var qs = require('querystring');
var request = require('request');
var async = require('async');
var bigint = require('big-integer');
var Datastore = require('nedb');

var db = new Datastore({filename: __dirname + '/tweets.db', autoload: true});
 
 // 控え
 // "appid": "0d74a7fe978e5c07661b43a0bf3f18efdcf546105fa67371822d77a08de97554",
 
 // 控え
 // "appid": "0d74a7fe978e5c07661b43a0bf3f18efdcf546105fa67371822d77a08de97554",
 
var client = new Twitter({
  consumer_key: tokens.twitter.consumer_key,
  consumer_secret: tokens.twitter.consumer_secret,
  access_token: tokens.twitter.access_token_key,
  access_token_secret: tokens.twitter.access_token_secret,
  //app_only_auth: false
});

client = new Twitter({
  consumer_key: 'MNZ0itTqHiqQVyCcOPsvmmjVP',
  consumer_secret: 'NniaoOBEmVOWt1UO1qJYRMs7Kb7oFTYgpFlASwOyeVSEvaQB8R',
  access_token: '2274093522-PGq2CjZCCEqmkBNlPJBIv4ZjTuk05lW8fb6CO6B',
  access_token_secret: '7pC0XDAEAFmmWLC0lyGl1PtPMvUk3q7r8Y7CaffXMnsZx'
  //app_only_auth: false
});

function extractKeyphrase(sentence, callback) {
    var params = {
        appid: tokens.yahoo.appid,
        output: 'json',
        sentence: sentence
    }
    // var api = 'http://jlp.yahooapis.jp/KeyphraseService/V1/extract';
    var api = 'http://jlp.yahooapis.jp/MAService/V1/parse';
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
        class_filter: 'LOC'
    }
    var api = 'https://labs.goo.ne.jp/api/entity';
    
    request.post(api, {form: params}, function (err, res, body) {
        callback(JSON.parse(body));
    });
}

function fetch(keyword, callback) {
    var params = {
        q: keyword + ' exclude:retweets',
<<<<<<< HEAD
        until: '2015-12-26',
=======
        until: '2015-12-27',
>>>>>>> esc
        count: 100,
        result_type: 'mixed'
    };
    
    var count = 0;
    var max = 100;
    var _tweets = [];
    var max_id = '';
    
    _fetch();
    
    function _fetch() {
        client.get('search/tweets', params, function(error, tweets, response) {
            max_id = (max_id == '' && tweets.statuses.length > 0) ? tweets.statuses[0].id_str : max_id;
            _tweets = _tweets.concat(tweets.statuses);
            for (var i = 0; i < tweets.statuses.length; i++) {
                var id = tweets.statuses[i].id_str;
                if (bigint(max_id).greater(id)) {
                    max_id = id;
                }
                console.log(count, max_id);
            }
            params.max_id = max_id;
            count++;
            
            if (count < max && tweets.statuses.length > 0) {
                db.insert(tweets.statuses, function (err, newDoc) {
                    _fetch();
                });
            } else {
                var _tweets_ = _tweets.concat().map(function (item) {
                    item._id = item.id_str;
                    return item;
                });
                db.insert(tweets.statuses, function (err, newDoc) {
                    if (typeof callback == 'function') callback(_tweets);
                });
            }
        });
    }
}

fetch('(壊死ニキ いた) OR (壊死ニキ 発見) OR (壊死ニキ 遭遇)', function (tweets) {
    async.forEachOfLimit(tweets, 3,
        function (tweet, index, callback) {
            /*
            extractKeyphrase(tweet.text, function (result) {
                console.log(tweet.text);
                console.log(result);
            });*/
            callback(null);
        },
        function DONE() {
            console.log('やったぜ。');
        }
    );
});