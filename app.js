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
    
    request.post(api).on('response', function (res) {
        callback(res);
    });
}

function fetch(keyword, callback) {
    var params = {
        q: keyword,
        count: 100,
        result_type: 'recent'
    };
    client.get('search/tweets', params, function(error, tweets, response){
        if (typeof callback == 'function') callback(tweets);
    });
}

fetch('壊死ニキ', function (tweets) {
    tweets.statuses.forEach(function (tweet) {
        setTimeout(function () {
            //extractKeyphrase(tweet.text, extractPropur);
            extractPropur(tweet.text, console.log);
        }, 32);
    });
})