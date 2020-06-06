Big.PE = Infinity
Big.DP = 0
Big.RM = 0

// From MDN somewhere
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
	};
}

// not quite base64 alphabet
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstvuwxyz0123456789-_~.:@"
var alphabetMapping = {}
for (var i = 0; i < alphabet.length; i++) { alphabetMapping[alphabet[i]] = i }
console.log("alphabet is", alphabet, "chars")
var base = Big(alphabet.length)

function encodeBignum(b) {
	var out = ""
	var curr = b
	// Pretend it's a positive int until the end
	if (b.s === -1) { curr = b.times(-1) }
	var byte = 0
	while (!curr.eq(0)) {
		var now = curr.mod(base)
		out += alphabet[+now]
		curr = curr.div(base)
	}
	var start = b.s === -1 ? "n" : "p"
	return start + out
}

function decodeBignum(str) {
	// If string is not tagged with its sign, it's just a regular number
	// backward compatibility only
	if (!str.startsWith("n") && !str.startsWith("p")) {
		return Big(str)
	}
	
	var start = str.substring(0, 1)
	
	var main = str.substring(1)
	var out = Big(0)
	var bvals = main.split("").map(function(x) { return alphabetMapping[x] })
	// Add each char's value to string, multiplied by the base to the power of its position in string
	bvals.forEach(function(val, position) {
		var thisByte = Big(val).times(base.pow(position))
		out = out.plus(thisByte)
	})
	if (start === "n") { out = out.times(-1) }
	return out
}

var page
var pageString
var prev = document.querySelector("#prev"), next = document.querySelector("#next"), count = document.querySelector("#pagecount"), main = document.querySelector("#main"), error = document.querySelector("#error")
function loadPage() {
	try {
		var afterSlash = /infiniter-pages\/([A-Za-z0-9_~.:@-]*)/.exec(window.location.pathname)[1]
		page = decodeBignum(afterSlash)
	} catch(e) {
		console.warn("Page Number Decode Failure")
		console.warn(e)
		error.innerText = "Page number invalid - " + e + ". Defaulting to 0."
		page = Big(0)
	}
	pageString = page.toString()
	console.log("Page", pageString)
	var canonical = encodeBignum(page)
	if (canonical !== afterSlash) {
		console.log(canonical, afterSlash, "Mismatch!")
		window.location.href = "./" + canonical
	}
	prev.href = "./" + encodeBignum(page.minus(1))
	next.href = "./" + encodeBignum(page.plus(1))
	pagecount.innerText = "Page " + pageString
}
loadPage()
if ("ontouchstart" in window) { main.classList.add("mobile") }
