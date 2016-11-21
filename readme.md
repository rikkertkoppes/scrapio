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

With such a selector, you can do a few things things:

- return the text from the nodes: `scrapio('td').text()`
- return a number from the nodes: `scrapio('td').number()`
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

For nested results, where the same structure is repeated withn itself, it is also possible to pass a tamplate factory function using `scrapio('td').run(...)`. This should be a function returning a factory. For example, if there are some nested comments (with replies to comments) on a page, you can create something like:

    function comment() {
        return {
            author: scrapio('.commentAuthor').text(),
            date: scrapio('.commentDate').text(),
            text: scrapio('.commentText').text(),
            childComments: scrapio('.replies').run(comment)
        };
    }

    return scrapio.load(input).tmpl(
        scrapio('.comments').run(comment)
    );

Note that in the main template, we could have used `scrapio('.comments').tmpl(comment())` as well, this is basically the same. However, if we were to do that in the `comment` function, we would blow up the stack as the function keeps calling itself.

By passing a factory, the template is lazily evaluated when we need it, which is after the selector has resolved.

### Further manipulation

A selector may return a multiple nodes. To select one or a few, we have `eq(index)` and `slice(start, end)` available as well:

    scrapio('td').eq(0).text()
    scrapio('td').slice(0,2).tmpl(...)

Also, the `map(fn)` method allows you to further process the returned value:

    scrapio('td').map((selection) => {
        //do something with the cheerion selection
    });

    scrapio('td').text().map((str) => {
        //do something with node text
    });