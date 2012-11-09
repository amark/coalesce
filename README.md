Coalesce
========

Fuses your code into an emergent structure.

As simple as:
```
npm install coalesce && node -e "require('coalesce')({port:7777})"
```

That is it, now you can create infinite new projects, like this one:
###hello.html###
```
<!DOCTYPE html>
<html>
	<body>
		<form name="hello">
			Hello <input name="to">!
		</form>
		<script src="/theory.js">
			require('./hello')
		</script>
	</body>
</html>
```
###hello.js###
```
module.exports = require('theory')
('hello', function(a){
	console.log("Alive on node and the page!");
});
```
Save these two files to the same directory as the install.

Now load <http://localhost:7777/hello.html> and check node's and the page's console.

The magic has only just begun, update hello.js to:
```
module.exports = require('theory')
('hello', function(a){

	a.com.send({
		what: "World"
		,where: { on: 'magic' }
	});

	return (document.hello.to.onkeyup = function(m){
		if( m.what ){
			document.hello.to.value = m.what;
		} else {
			a.com.send({
				where: 'magic'
				,what: document.hello.to.value
			});
		}
	});

});
```
And restart the server with `require('coalesce')({port:7777, sec: {relay: true} })` in the same folder and reload the page into 2 tabs. Typing in the input will synchronize across tabs automatically. Curiosity perked? Check out the two test apps in the playground by simply navigating to them in your browser.

## Real API Docs Coming Soon ##

###* okay, no really, what is going on?##
This is just tossing up a quick getting started guide, but it obviously is pretty vague. So I'll just explain as much as I can really quickly in a garbled mess. Programming is just 9 primitives - booleans, numbers, strings, texts, arrays, objects combined with loops, functions, and if statements. Given these constructs, you then have and do 3 basic things - data, manipulation, and communication. The Theory library provides a solid foundation for this, an abstraction layer for modular Javascript regardless of server, client, or IE6. Coalesce creates the communication layer between all these modules, whether server to server, client to client, or server to client and vice versa, for all protocols - TCP, HTTP, Websocket, or AJAX, all with proper dependency, routing, and event pub/sub. This means when you write beautiful modules for your app, Coalesce automatically becomes a distributed scalable system because your files are physically separated.

Sorry if this doesn't make any sense, but in future docs and talks I'll explain why this is awesome. Hint:

1. Your module is automatically available to be asynchronously required anywhere else, node or browser - allowing you to manage your dependencies in your JS and not the HTML.
2. Your modules get magically deployed and initialized when a browser requests them, kinda like PHP.
3. Your module can optionally receive the request and provide a response, even though it runs in a separate process, already distributed and in parallel. Same setup for multiple machines when connected.
4. Your module's primary communication practically runs off of function calls, even if it is across systems or multiple systems. Module to module communication is easy, loosely coupled directly to their functions.
5. Not opinionated, works whether your code only wants to be RESTful, or only a thick client with sockets, or entirely P2P* being relayed through the server.

*which, quick note: security is enabled by default, and the demos require the server to disable security, and will only work if you run Coalesce with:
```
require('coalesce')({
	port:7777
	,sec: {
		relay: true
		,incognito: true
	}
});
```