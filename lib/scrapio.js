var cheerio = require('cheerio');

function load(html) {
    return new Resolver(cheerio.load(html).root());
}

function Resolver($) {
    this.dom = $;
}

Resolver.prototype.run = function(templateFactory) {
    var self = this;
    return this.tmpl(templateFactory());
}

Resolver.prototype.tmpl = function(template) {
    var self = this;
    if (template instanceof Array) {
        return template.map(function(part) {
            return self.tmpl(part);
        })
    } else if (template instanceof Selector) {
        return template.resolve(this.dom);
    } else if (template instanceof Object) {
        return Object.keys(template).reduce(function(result, key) {
            result[key] = self.tmpl(template[key]);
            return result;
        }, {});
    } else {
        return template;
    }
}

function select(sel) {
    return new Selector(sel);
}

select.load = load;

function Selector(sel) {
    this.selector = sel;
    this.resolvers = [];
}

Selector.prototype.context = function($) {
    return this.selector? $.find(this.selector): $;
}

Selector.prototype.addResolver = function(fn) {
    this.resolvers.push(fn);
    return this;
}

//resolve the selector
Selector.prototype.resolve = function($) {
    var self = this;
    return this.resolvers.reduce(function(result, resolver) {
        return resolver.call(self, result);
    }, this.context($));
}

//TODO: make the cheerio method binding more generic
Selector.prototype.eq = function(index) {
    return this.addResolver(function($) {
        return $.eq(index);
    });
}

Selector.prototype.slice = function(start, end) {
    return this.addResolver(function($) {
        return $.slice(start, end);
    });
}

//resolve to text
Selector.prototype.text = function() {
    return this.addResolver(function($) {
        return $.text().trim();
    });
}

//resolve to number
Selector.prototype.number = function(name) {
    return this.addResolver(function($) {
        return parseFloat($.text().trim());
    });
}

//resolve to an attribute value
Selector.prototype.attr = function(name) {
    return this.addResolver(function($) {
        return $.attr(name);
    });
}

Selector.prototype.map = function(fn) {
    return this.addResolver(function(value) {
        return fn(value);
    });
}

Selector.prototype.debug = function(name) {
    return this.addResolver(function($) {
        console.log($);
        return $;
    })
}

//resolve to a template
Selector.prototype.tmpl = function(template) {
    return this.run(function() {
        return template;
    });
}

//to allow recursive templates, lazy evaluation to prevent infinite loops
Selector.prototype.run = function(templateFactory) {
    return this.addResolver(function($) {
        return $.get().map(function(el) {
            return new Resolver(cheerio(el)).tmpl(templateFactory());
        });
    });
}



module.exports = select;