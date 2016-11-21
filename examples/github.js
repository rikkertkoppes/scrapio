var request = require('request');
var scrapio = require('../lib/scrapio.js');

request.get('https://github.com/rikkertkoppes/scrapio', function(err, response, body) {
    var res = scrapio.load(body).tmpl({
        title: scrapio('title').text(),
        files: scrapio('table.files tr').tmpl({
            name: scrapio('td').eq(1).text()
        }),
        branches: scrapio('.branch-select-menu button + .select-menu-modal-holder .select-menu-item-text').tmpl(
            scrapio().text()
        )
    });
    console.log(res);
});