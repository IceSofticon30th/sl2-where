var Twitter = require('twitter');
var tokens = require('./tokens.json');
var qs = require('querystring');
var request = require('request');
 
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
        var res = JSON.parse(body);
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
        //until: '2015-12-27',
        count: 100,
        result_type: 'recent'
    };
    
    var count = 0;
    var max = 1;
    var _tweets = [];
    
    _fetch();
    
    function _fetch() {
        client.get('search/tweets', params, function(error, tweets, response) {
            _tweets = _tweets.concat(tweets.statuses);
            var next_results = tweets.search_metadata.next_results;
            params = qs.parse(next_results.substring(1));
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
    var texts = '';
    tweets.forEach(function (tweet, index) {
        texts += tweet.text + '\n\n';
    });
    extractPropur(texts, function (result) {
        console.log(texts);
        console.log(result.ne_list);
    });
});