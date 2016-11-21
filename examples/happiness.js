var request = require('request');
var scrapio = require('../lib/scrapio.js');

request.get('https://en.wikipedia.org/wiki/World_Happiness_Report', function(err, response, body) {
    var res = scrapio.load(body).tmpl(
        scrapio('.wikitable tr').tmpl({
            rank: scrapio('td').eq(0).number(),
            name: scrapio('td').eq(1).text(),
            score: scrapio('td').eq(2).number(),
        })
    );
    console.log(res);
});