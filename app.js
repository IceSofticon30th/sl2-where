var Twitter = require('twitter');
var tokens = require('./tokens.json');
var qs = require('querystring');
var request = require('request');
var async = require('async');
var bigint = require('big-integer');
 
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

function fetch(keyword, callback) {
    var params = {
        q: keyword + ' exclude:retweets',
        // until: '2015-12-27',
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
                if (bigint(max_id).compare(id) == 1) {
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

fetch('壊死ニキ', function (tweets) {
    async.forEachOfLimit(tweets, 3,
        function (tweet, index, callback) {
            extractPropur(tweet.text, function (result) {
                console.log(result);
                callback(null);
            });
        },
        function DONE() {
            console.log('やったぜ。');
        }
    );
});