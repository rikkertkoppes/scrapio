var request = require('request');
var scrapio = require('../lib/scrapio.js');

request.get('https://en.wikipedia.org/wiki/World_Happiness_Report', function(err, response, body) {
    var res = scrapio.load(body).tmpl(
        scrapio('.wikitable tr').tmpl({
            rank: scrapio('td:nth-child(1)').text(),
            name: scrapio('td:nth-child(2)').text(),
            score: scrapio('td:nth-child(3)').text(),
        })
    );
    console.log(res);
});