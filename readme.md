# Scrapio - the simplest web scraper imaginable

    npm install scrapio --save

## Usage

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

## About

Scrapio is the simplest imaginable web scraper. Rather than meticilously parsing the html and traversing the DOM, for example using cheerio, define the structure you want. Scrapio works in two steps:

### Loading and running a template

    var result = scrapio.load(html).tmpl({
        foo: 'bar'
    });

The template given here is returned as is. Scrapio processes the template looking for selectors. It is there where things get interesting

### Selecting DOM nodes and returning values

Seleting is easy, much like JQuery and Cheerio:

    scrapio('td')

With such a selector, you can do three things:

- return the text from the nodes: `scrapio('td').text()`
- return some attribute: `scrapio('td').attr('colspan')`
- run another template in the context of the selection: `scrapio('td').tmpl(...)`

That last one is important. When you run a template in the context of a scrapio selector, the template gets resolved for every node in the collection. This allows you to build up any nested structure:

    var result = scrapio.load(html).tmpl({
        cells: scrapio('td').tmpl({
            text: scrapio().text()
        }),
        rows: scrapio('tr').tmpl({
            cells: scrapio('td').tmpl({
                text: scrapio().text()
            })
        })
    });

which results in:

    {
        cells: [{
            text: "..."
        }, {
            text: "..."
        }, {
            ...
        }],
        rows: [{
            cells: [{
                text: "..."
            }, {
                ...,
            }]
        }, {
            cells: [{
                text: "..."
            }, {
                ...
            }]
        }]
    }