var cheerio = require('cheerio');

function load(html) {
	return new Resolver(cheerio.load(html).root());
}

function Resolver($) {
	this.dom = $;
}

Resolver.prototype.tmpl = function(template) {
	var self = this;
	if (template instanceof Array) {
		return template.map(function(part) {
			return self.tmpl(part);
		})
	} else if (template instanceof Selector) {
		return template.resolver(this.dom);
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
}

Selector.prototype.context = function($) {
	return this.selector? $.find(this.selector): $;
}

Selector.prototype.text = function() {
	this.resolver = function($) {
		return this.context($).text().trim();
	}
	return this;
}

Selector.prototype.attr = function(name) {
	this.resolver = function($) {
		return this.context($).attr(name);
	}
	return this;
}

Selector.prototype.tmpl = function(template) {
	this.resolver = function($) {
		return $.find(this.selector).get().map(function(el) {
			return new Resolver(cheerio(el)).tmpl(template);
		});
	} 
	return this;
}

module.exports = select;