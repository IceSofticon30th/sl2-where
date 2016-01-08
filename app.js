var Twitter = require('twitter');
var tokens = require('./tokens.json');
var qs = require('querystring');
var request = require('request');
var async = require('async');
var bigint = require('big-integer');
 
 // 控え
 // "appid": "0d74a7fe978e5c07661b43a0bf3f18efdcf546105fa67371822d77a08de97554",
 
var client = new Twitter({
  consumer_key: tokens.twitter.consumer_key,
  consumer_secret: tokens.twitter.consumer_secret,
  access_token_key: tokens.twitter.access_token_key,
  access_token_secret: tokens.twitter.access_token_secret
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
        until: '2015-12-26',
        count: 100,
        result_type: 'recent'
    };
    
    var count = 0;
    var max = 2;
    var _tweets = [];
    var max_id = '';
    
    _fetch();
    
    function _fetch() {
        client.get('search/tweets', params, function(error, tweets, response) {
            max_id = (max_id == '') ? tweets.statuses[0].id_str : max_id;
            _tweets = _tweets.concat(tweets.statuses);
            for (var i = 0; i < tweets.statuses.length; i++) {
                var id = tweets.statuses[i].id_str;
                if (bigint(max_id).greater(id)) {
                    max_id = id;
                }
                console.log(max_id);
            }
            params.max_id = max_id;
            count++;
            
            if (count < max) {
                _fetch();
            } else {
                if (typeof callback == 'function') callback(_tweets);
            }
        });
    }
}

fetch('(に いた) OR (で 発見) OR (で 遭遇)', function (tweets) {
    async.forEachOfLimit(tweets, 3,
        function (tweet, index, callback) {
            extractKeyphrase(tweet.text, function (result) {
                console.log(tweet.text);
                console.log(result);
                callback(null);
            });
        },
        function DONE() {
            console.log('やったぜ。');
        }
    );
});