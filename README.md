Coalesce
========

_Fuses your code into an emergent superstructure._

As simple as:
```
npm install coalesce && node -e "require('coalesce')({port:7777, sec: -2})"
```

That is it, now you can create infinite new projects, like this one:

**hello.html**
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
**hello.js**
```
module.exports = require('theory')
('hello', function(a){

    a.com.send({ what: "World", where: {on: 'magic'} });

    return (document.onkeyup = function(m){
	
		m.what? document.hello.to.value = m.what : a.com.send({ 
		what: 	document.hello.to.value, where: 'magic' });
		
    });

});
```
Save these two files to the same directory as the install.

Now load <http://localhost:7777/hello.html> in 2 windows, side by side, the inputs will synchronize when you type!

Curiosity perked? Check out the two test apps in the playground by simply navigating to them in your browser. Or, read on. Here are some quick hints at why it is awesome (skip this to continue to code examples).

##Summary of Thoughts##
1. Your module is automatically available to be asynchronously required anywhere else, node or browser - allowing you to manage your dependencies in your JS and not the HTML.
2. Your modules get magically deployed and initialized when a browser requests them, or if otherwise specified in a startup configuration.
3. Your module can optionally receive the request and provide a response, even though it runs in a separate process, already distributed and in parallel. Same setup for multiple machines when connected.
4. Your module's primary communication practically runs off of function calls, even if it is across systems or multiple systems. Module to module communication is easy, loosely coupled directly to their functions.
5. Not opinionated, works whether your code only wants to be RESTful, or only a thick client with sockets, or entirely P2P being relayed through the server.

###...continued code examples###
But then you are like, "yo, where is my $?" and I reply "I ain't your sugar daddy, foo'." so you then:
```
module.exports = require('theory')
('hello', function(a){
	
	// your initialization code here.
	
	return { world: $('input').val() }; // the module you export. 

},['http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js']);
```
Yupe, that is right, you can declare and manage your dependencies all within your javascript!

All you need in your HTML is one script tag that requires your app from inside, as seen above:
```
<script src="/theory.js">
	require('./hello')
</script>
```
Now once your modularized code loads, it won't execute until all of your dependencies are loaded.

This finally makes it easy to manage any type of large project.
If one of your dependencies is also a module, which has dependencies within it, everything asynchronously cascades.
The Theory library makes sure any Inception style depth level of dependencies is all stacked up properly before your code runs.

Hey, afterall, Cobb's wife Mal lives in the Unconstructed Dream Space, and she is named after me**mAl**locate, which is a nightmare for your memory.
(if you didn't laugh... ignore this ever happened)

So you are probably like, hey, that is what Theory does, but what is Coalesce? Coalesce is the web that connects all of your modules, both Node and in the browser.
But it provides more than just a seamless TCP / HTTP / AJAX / Websocket communication layer for your apps, it also automatically distributes and deploys them.

This is kind of a throwback to PHP, but don't worry, in a good way.
Restart Coalesce with `node -e "require('coalesce')({port:7777})"`, you run this once and it acts as the master web server.
You then create your app - let's overwrite hello.js, again, to this:
```
module.exports = require('theory')
('hello', function(a){
	
	console.log("Running in both Node and on the page.");

});
```
When you fire up <http://localhost:7777/hello.html> from your browser, your browser makes a request to load 'hello.js'.
Coalesce then attempts to execute 'hello.js' as a separate Node process. 
If it crashes, it assumes it is a client only script, like jQuery, and serves it as a static file and remembers to do so in future.
(Note: The assumptions and static server behaviors can be modified or overwritten, as described in the API).
However, if the code can run in Node it does, and in particular, if it is a Theory module, it automagically integrates.

Now take this example, let's overwrite hello.js again:
```
module.exports = require('theory')
('hello', function(a){
	
	console.log("Running in both Node and on the page.");
	
	if( root.page ){
		a.com.send("Hello World, from the page!");
	}
	
	return (function(m){
		
		if( root.node ){
			console.log(m.what);	
		}
		
	});

});
```
Now when you refresh <http://localhost:7777/hello.html> you should see your Node console print out the message that had been sent from the browser.
There are several things to learn from this.

###Conclusion###
1. Coalesce should have automatically roll reloaded (since hot reloading is dangerous) your server side hello.js for you without needing to restart Coalesce.
2. Your module is exported and available on both client and server via `theory.hello` namespace, which is a function that takes the parameter `m` for 'message'.
3. Your single file app should be running on both the server and the client, by using the globally available `root.node` and `root.page` we can determine the corresponding logic.
4. Your module is initialized with a copy of Theory in the parameter, called `a` which is local to your module and provides an interface to your module's dependencies.
5. It also holds the default utilities of Theory, such as the communication layer in `a.com` which is used to send a message to your server side 'hello' module.
6. The returned function exported out in (3) receives this message, and then logs it out.

Note, this is the same thing that happened earlier with the synchronizing inputs - except since that was client side only 
(the module crashed when it tried to access the `document` element, which is undefined in node) and security was disabled via `{sec: -2}`,
the message relayed through the server to all other windows where they were on 'magic' and displayed the message in the input.
(Javascript's native `keyup` listener was bound to the exported module, which was responsible for then sending the input value).

At this point, you feel like you were following along, but now everything just exploded and you are probably confused.

The reason why, is because in just 20 LOC or less, you get access to a ton of power, which is exposed to you via raw primitives.

Remember, elegant complexity is created from the emergence of simplicity. This is coalescence.

## Messages ##
Before we talk about how to intercept HTTP requests and such, you must understand how the magic behaves.
Coalesce hates opinionated frameworks, and is as unopinionated as possible. The one catch is how a message is structured.
Messages are the glue that causes all your apps to work in unison, so they are vital to the core of everything.
Pardon the cross-disciplinary worlds, but Coalesce borrows the 'W's of journalism to describe information.

** Who . What . When . Where . Why . How **

These little goodies are what produce the powerful flexibility of Coalesce, and therefore are required for the magic to happen.
If you cannot accept this one opinion, which enables you to be free from opinions everywhere else, then Coalesce is not for you.

- **Who** An expandable object containing data relating to the recipient and the sender.
	- `{who: 'Mark'}` expands into `{who: { to: 'Mark' }}` which indicates the message is to be sent to Mark.
	- In Node, `m.who.cid` is the connection ID of the websocket that sent the message.
	- In Node, `m.who.tid` is the session ID (tryst) from the original HTTP request. (Unless security is disabled)
	- Server Examples:
		- `a.com.send({ what: "This is sent back to the same tab which sent me this message.", who: m.who.cid })`
		- `a.com.send({ what: "I will be sent to every tab that is in this session.", who: m.who.tid })`
- **What** An expandable anything. This is the crux of the data you are actually sending, everything else is just metadata relating to the payload.
	- Client Examples:
		- `a.com.send("Hello world!")` expands into and is accessible via `m.what`.
		- `a.com.send({ foo: 'bar' })` the value of 'bar' is accessible via `m.what.foo`.
		- `a.com.send({ foo: 'bar', who: 'Mark' })` expands into `{ who: {to: 'Mark'}, what: {foo: 'bar'} }`.
		- `a.com.send({ what: {foo: 'bar'}, who: {to: 'Mark'} })` is already expanded.
- **When** Is a hyper precise millisecond timestamp of when the message was created.
	- It is 17 digits long, which is 4 digits longer than the normal `new Date().getTime()`.
	- It is not expandable.
- **Where** Is an expandable object pertaining to pub/sub and where the message has been processed.
	- `{where: 'magic'}` expands into `{where: {at: 'magic'}}` which broadcasts the message to subscribers of the 'magic' channel.
	- `{where: {on: magic'}}` subscribes and broadcasts to the 'magic' channel. Note: The above option does not auto-subscribe.
- **Why** Is not used, but can be optionally added if you want to provide an arbitrary comment about why the message was sent.
- **How** Mandatory Metadata Object.
	- `m.how.way` holds the magical key which routes which way the object goes, by default is the name of the module.
	- Can overwrite the 'way' property to communicate with other modules, or directly to functions of a module using the dot notation.
	- Usage of the 'way' property, for now, will be described elsewhere.
	- You can attach any critical metadata, such as version numbers, etc.

Because communication between modules is so important, the Theory library provides many helper functions.
Despite this, it is strongly recommended and encouraged you write your own helper functions ontop of the helper functions.
Not to get too meta, but the Theory library also has helper functions to assist you in writing your own helper functions.
If this is not already an emphasis enough on how important this is,
then also note that the entire security of your app is controlled by what information you allow to flow through these APIs you create.
Because Coalesce is not opinionated, you have to enforce your own validation, sanitation, and app specific authorization.

Therefore, writing your own abstraction ontop of the communication layer will substantially ease your own development and prevent vulnerabilities.

## Intercepting HTTP ##

Now we get to start to use Coalesce's API.
This means we're going to use the more robust and explicit form of declaring a module, rather than just the shorthand we have been using.
```
module.exports = require('theory')
({name: 'hello'
, author: 'Mark Nadal'
, version: 5
, dependencies: [
	'fs'
],state: 'http'
, invincible: true
, init: (function(a){
	return {
		http: (function(m){
			a.fs.writeFileSync('./lastReq.txt', "The last request was for "+m.what.url.param.name);
			console.log(m);
			m.what.body = "alert('Hello '+"+m.what.url.param.name||'World!'+")";
			a.com.reply(m);
		})
	}
}});
```
[ ... to be continued ]

## Real API Docs Coming Soon ##
...

###Random Ramblings...##
This is just tossing up a quick getting started guide, but it obviously is pretty vague.
So I'll just explain as much as I can really quickly in a garbled mess.
Programming is just 9 primitives - booleans, numbers, strings, texts, arrays, objects combined with loops, functions, and if statements.
Given these constructs, you then have and do 3 basic things - data, manipulation, and communication.
The Theory library provides a solid foundation for this, an abstraction layer for modular Javascript regardless of server, client, or IE6.
Coalesce creates the communication layer between all these modules, whether server to server, client to client, or server to client and vice versa,
for all protocols - TCP, HTTP, Websocket, or AJAX, all with proper dependency, routing, and event pub/sub.
This means when you write beautiful modules for your app, Coalesce automatically becomes a distributed scalable system because your files are physically separated.
