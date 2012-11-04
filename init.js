process.env.totheory = __dirname+'/+/theory';
console.log(process.env.totheory);
module.exports=require(process.env.totheory)({
	name: 'init'
	,dependencies: {
		'./web': 1 // path to the web module
	}
	,init: (function(a){
		var opt = {};
		opt.port = 7777;
		opt.map = [
			{
				flow: 0
				,match:(function(url){
					console.log(url);
					if(url.pathname === '/blah'){
						return true;
					}
					return false;
				})
				,file:__dirname+'/+/create.js'
			}
		];
		a.web(opt);
		console.log("App @ "+opt.port);
	})
});