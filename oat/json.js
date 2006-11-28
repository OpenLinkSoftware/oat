/*
 *  $Id$
 *
 *  This file is part of the OpenLink Software Ajax Toolkit (OAT) project.
 *
 *  Copyright (C) 2006 Ondrej Zara and OpenLink Software
 *
 *  See LICENSE file for details.
 */
/*
	OAT.JSON.parse(jsonString)
	OAT.JSON.stringify(something)
*/

OAT.JSON = {
	tt:{'\b':'\\b', '\t':'\\t', '\n':'\\n',	'\f':'\\f',	
		'\r':'\\r',	'"' :'\\"',	'\\':'\\\\' },

	parse:function(jsonString) {
		return eval('('+jsonString+')');
	},
	stringify:function(something, maxDepth, cache) {
		if (typeof(maxDepth) == "undefined") {
			var maxDepth = 2;
		}
		if (maxDepth == 0) { return "[maximum depth achieved]"; }
		var result = "";
		if (!cache) { var cache = []; }
		for (var i=0;i<cache.length;i++) {
			if (cache[i] == something) { return "[recursion]"; }
		}
		if (typeof(something) == "object") { cache.push(something); }
		switch (typeof(something)) {
			case 'boolean':
				return something.toString();
			break;
			
			case 'number':
				return something.toString();
			break;
			
			case 'function':
				return something.toString();
			break;
			
			case 'string':
				var tmp = "";
				for (var i=0;i<something.length;i++) {
					var r = something.charAt(i);
					for (var p in OAT.JSON.tt) {
						if (r==p) { r = OAT.JSON.tt[p]; }
					}
					tmp += r;
				}
				return '"'+tmp+'"';
			break;
			
			case 'object':
				if (something instanceof Array) {
					var members = [];
					for (var i=0;i<something.length;i++) {
						members.push(OAT.JSON.stringify(something[i],maxDepth-1,cache));
					}
					result = "["+members.join(",\n")+"]";
					return result;
				}
				if (something instanceof Object) {
					var members = [];
					for (var p in something) {
						members.push('"'+p+'":'+OAT.JSON.stringify(something[p],maxDepth-1,cache));
					}
					result = "{"+members.join(",\n")+"}";
				}
			break;
		}
		return result;
	}
}
OAT.Loader.pendingCount--;