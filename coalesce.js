module.exports=require('theory')((function(){
	var web = {};
	web.name = 'web';
	web.version = 1;
	web.author = 'Mark';
	web.dependencies = [
		'fs'
		,'url'
		,'path'
		,'http'
		,'https'
		,'child_process'
	];
	web.init = (function(a){
		function web(opt){
			return web.configure(opt);
		} var	fs = a.fs
		,	path = a.path
		,	URL = a.url;
		web.opt = {};
		web.configure = (function(opt){
			module.reqdir = a.path.dirname((module.parent||{}).filename);
			opt = a.obj.is(opt)? opt : {};
			opt.host = opt.host||'localhost';
			opt.port = opt.port||80;
			opt.dir = opt.dir || module.reqdir || __dirname;
			if(a.bi.is(opt.sec)){
				opt.sec = {};
			} else if(a.num.is(opt.sec)){
				opt.sec = (opt.sec === -2)? {relay: true, incognito: true} : opt.sec; // incognito, eh?
			}else if(a.obj.is(opt.sec)){
			
			} else {
				opt.sec = {};
			}
			opt.session = opt.session||{};
			opt.session.sid = opt.session.sid||(function(){ return a.text.random(16) });
			opt.session.tid = opt.session.tid||(function(){ return a.text.random(16) });
			opt.session.expire = opt.session.expire||1000*60*60*24*7*4;
			opt.session.wait = opt.session.wait||1000*60*2;
			opt.cache = opt.cache||{};
			opt.cache.age = opt.cache.age||0;
			opt.com = opt.com||{};
			opt.com.prefix = opt.com.prefix||'/com';	
			opt.com.url = opt.com.url||"http"+((opt.sec.key&&opt.sec.cert)?'s':'')+"://"
				+opt.host+(opt.port?':'+opt.port:'')
				+(opt.com.path||"/node_modules/sockjs/sockjs-0.3.min.js");
			if(a.list.is(opt.run)){
				var run = opt.run;
				opt.run = {};
				opt.run.is = run;
			} opt.run = opt.run||{};
			opt.run.impatient = opt.run.impatient||3*1000;
			opt.hook = opt.hook||{};
			opt.hook.pre = opt.hook.pre||(function(){});
			opt.hook.aft = opt.hook.aft||(function(){});
			web.opt = a.obj(opt).u(web.opt||{});
			web.theorize();
			web.run(opt.run.is);
			web.state();
			return web;
		});
		a.text.find.js = /\.js$/i;
		web.state = (function(){
			function state($){
				state.com = sock.createServer({
					sockjs_url: web.opt.com.url
				});
				state.dir = new ns.Server(web.opt.dir);
				if(web.opt.sec.key && web.opt.sec.cert){
					state.on = a.https.createServer({key: web.opt.sec.key, cert: web.opt.sec.cert});
				} else {
					state.on = a.http.createServer();
				}
				state.on.addListener('request',state.req);
				state.on.addListener('upgrade',function(req,res){
					res.end();
				});
				state.on.listen(web.opt.port);
				state.com.on('connection',state.con);
				state.com.installHandlers(state.on,web.opt.com);
				return web;
			}
			var mime = require('mime')
			, 	ns = require('node-static')
			, 	formidable = require('formidable')
			,	sock = require('sockjs');
			state.ways = [];
			state.sort = (function(A,B){
				if(!A || !B){ return 0 }
				A = A.flow; B = B.flow;
				if(A < B){ return -1 }
				else if(A > B){ return  1 }
				else { return 0 }
			});
			state.map = (function(url,map){
				map = map || state.ways;
				var r = a.list(map).each(function(v,i){
					if(!a.obj.is(v)){ return }
					v.params = v.params || [];
					if(a.text.is(v.match)){
						v.regex = state.match(v);
					} if(a.text.is(v.regex)){
						v.regex = new RegExp(v.regex,v.flags);
					} if(a.fns(v.regex).of(RegExp)){
						var r = v.regex.exec(url.pathname);
						if(r){
							url.params = state.match(v,r||[]);
							return v;
						}
					} if(a.fns.is(v.match)){
						if(v.match(url)){ return v}
					}
				})||{};
				return (0 <= r.flow && (fs.existsSync||path.existsSync)(url.file))?
					url.file : r.file || url.file;
			});
			state.match = (function(m,r){ // via expressjs
				try{
				var path = m.match, keys = m.params||[], params = {}, sensitive, strict;
				if(r){ m = r; 
					for (var i = 1, len = m.length; i < len; ++i) {
						var key = keys[i - 1];
						var val = 'string' == typeof m[i]
						  ? decodeURIComponent(m[i]) : m[i];
						if (key) {
						  params[key.name] = val;
						} else {
						  params[i] = val;
						}
					}
					return params;
				}
				if (path instanceof RegExp) return path;
				if (Array.isArray(path)) path = '(' + path.join('|') + ')';
				path = path
				.concat(strict ? '' : '/?')
				.replace(/\/\(/g, '(?:/')
				.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
				  keys.push({ name: key, optional: !! optional });
				  slash = slash || '';
				  return ''
					+ (optional ? '' : slash)
					+ '(?:'
					+ (optional ? slash : '')
					+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
					+ (optional || '')
					+ (star ? '(/*)?' : '');
				})
				.replace(/([\/.])/g, '\\$1')
				.replace(/\*/g, '(.*)');
				return new RegExp('^' + path + '$', sensitive ? '' : 'i');
				} catch(e){ console.log("something has gone expressively wrong."); }
			});
			state.way = (function(req){
				return req.url.way = path.basename(req.url.map,path.extname(req.url.map));
			});
			state.req = (function(req,res){
				a.fns.flow([function(next){
					req.url = URL.parse(req.url,true);
					req.url.ext = path.extname(req.url.pathname).replace(/^\./,'');
					req.url.file = path.normalize(path.join(web.opt.dir,req.url.pathname));
					req.url.type = mime.lookup(req.url.pathname);
					req.url.map = state.map(req.url);
					req.url.way = state.way(req);
					req.cookies = web.cookie.parse(req);
					req.cookies.sid = req.cookies.sid || web.opt.session.sid();
					web.opt.hook.pre(req,res);
					if(web.theorize(req,res)){ return }
					next();
				},function(next){
					web.run.it({
						file: req.url.map
						,invincible: req.url.file != req.url.map
						,reply: state.msg
					},function(v){
						if(v && (v=req.url.way+'.'+a(web.run.on,req.url.way+'.meta.state.way'))){
							if(a.text(req.method).low() == 'post'){
								var form = new formidable.IncomingForm();
								req.form = {}; req.files = {};
								form.on('field',function(k,v){
									req.form[k] = v;
								}).on('file',function(k,v){
									if(!req.files[k]){ req.files[k] = [] }
									(req.files[k]||[]).push(v);
								}).on('error',function(e){
									console.log("formidable error:",e);
								}).on('end', function(){
									next(v);
								});
								return form.parse(req);
							} return next(v);
						} next.end();
					});
				},function(way,next){
					var m = a.com.meta({how:{way:way,web:'state'},where:{pid:0}});
					m.what.url = req.url;
					m.what.form = req.form;
					m.what.files = req.files;
					m.what.headers = req.headers;
					m.what.cookies = req.cookies;
					web.reply(m,function(m){
						if(m){
							if(a(m,'what.body')){
								if(m.what.type){
									var type = mime.lookup(m.what.type||'')
										,chs = mime.charsets.lookup(type);
									res.setHeader('Content-Type', type + (chs ? '; charset=' + chs : ''));
								} if(m.what.encoding){
									res.setHeader('Content-Encoding', m.what.encoding);
								} web.cookie.set(res,m.what.cookies||req.cookies); // on login, pragma to no-cache (?)
								res.end(m.what.body);
								web.opt.hook.aft(req,res);
								return;
							} req.url.pathname = m.what.pathname||a(m.what,'url.pathname')||req.url.pathname;
						} next(req,res);
					});
				}],function(){
					web.cookie.set(res,req.cookie);
					state.dir.serve(req,res);
					web.opt.hook.aft(req,res);
				});
			});
			state.msg = (function(m,opt,con){
				if(!a.obj.is(m)) return;
				var way = a(m,'how.way')||a(m,'way')||''
					,opt = opt||{};
				way = a.list(way.split('.')).at(1);
				if(opt != way){
					if(a[way]){
						a(a(m,'how.way')+'->')(m);
						return;
					}else if(web.run.on[way] && !a(web.run.on,way+'.meta.fatal')){
						var to = web.run.to(way);
						to.com && to.com.send && to.com.send(m);
						to.count++;
						return;
					}else{
					}
					if(!web.opt.sec.relay){
						return;
					}
				}
				if((con = state.sub(m)) && (m.where.on||m.where.off||m.where.at)){
					m.where.at = m.where.on||m.where.off||m.where.at;
					delete m.where.on;
					delete m.where.off;
					return web.event.emit(m.where.at,m);
				}
				if((con = state.con.s[m.who.to||'']) && con.writable){
					return con.write(a.text(m).ify());
				}
			});
			state.sub = (function(m,opt,con){
				if(	!a.obj.is(m) || !a.obj.is(m.where) ||
					!a(m,'who.tid') || !(con = state.con.s[m.who.tid])) return;
				if(m.where.off){
					if(!con.where[m.where.off]) return;
					web.event.off(con.where[m.where.off]);
					delete con.where[m.where.off];
					return con;
				} if(con.where[m.where.on]) return con;
				con.where[m.where.on] = web.event.on(m.where.on,function(m){
					if(!con.writable || con.tid == m.who.tid || !state.con.s[con.id]) return;
					con.write(a.text.ify(m));
				});
				return con;
			});
			state.con = (function(con){
				con.where = {};
				state.con.s = state.con.s||{};
				state.con.s[con.id] = con;
				con.on('data',function(m){
					m = a.com.meta(a.obj.ify(m),con);
					web.cookie.tid(con,m,function(v){
						if(!v){ return }
						m.where.pid = (m.where.pid == process.pid)? 0 : m.where.pid;
						state.msg(m);
					});
				});
				con.on('close',function(m){
					console.log(con.id+" disconnected.");
					a.obj(con.where).each(function(v,i){
						web.event.off(v);
					});
					delete state.con.s[con.id];
				});
			});
			return state;
		})();		
		web.reply = (function(m,fn){
			if(fn){
				web.run.res[m.when] = fn;
				web.state.msg(m,m.how.way);
				return;
			}
			if(web.run.res[m.when]){
				a(web.run.res,m.when+'->')(m);
				delete web.run.res[m.when];
				return;
			}
		});
		web.cookie = (function(){
			function cookie($){
				return web;
			}
			cookie.tryst = {};
			cookie.parse = (function(m){
				var l,p,c={};
				if(a(m,'headers.cookie')){
					l = m.headers.cookie.split(/\s?;\s?/ig);
					a.list(l).each(function(v,i){
						p = v.split(/=/);
						c[p[0]] = p.slice(1).join('=');
					});
				}
				return c;
			});
			cookie.set = (function(res,c){
				c = c || res.cookie || {};
				if(web.opt && c.sid){c.$sid = {HttpOnly:true}}
				c = a.obj(c).each(function(v,i,t){
					if(i.charAt(0) == '$' && c[(i=i.slice(1))]){
						t(i+"="+c[i]+";"+(a.list(v).ify({wedge:'='})||[]).join(';'));
						return;
					}
					t(i+'='+v);
				})||[];
				res.setHeader('Set-Cookie', c);
			});
			cookie.tid = (function(req,m,fn){
				if(fn){
					if(req.sid || req.tid){
						m.who.tid = req.tid;
						m.who.sid = req.sid;
						return fn(true);
					} if(m.who.tid){
						// GETEX REDIS HERE
						
						var s, t = a.time.is();
						if(s = cookie.tryst[m.who.tid]){
							web.state.con.s[req.tid = m.who.tid] = req;
							req.sid = m.who.sid = s.sid;
							fn(true);
						} else {
							if(web.opt.sec.incognito){ req.sid = req.tid = m.who.tid; fn(true) }
						} delete cookie.tryst[m.who.tid];
						a.obj(cookie.tryst).each(function(v,i){
							if(web.opt.session.wait < t - v.ts){
								delete cookie.tryst[i];
							}
						}); 
					}
				} if(req.url){ 
					req.cookies = req.cookies||{};
					// SETEX REDIS HERE
					
					cookie.tryst[req.cookies.tid = web.opt.session.tid()] 
						= {sid: req.cookies.sid, ts: a.time.is()}
					return req.cookies;
				}
			});
			return cookie;
		})();
		web.run = (function(){
			function run($){
				if(!$){ return web }
				if(!a.list.is($)){
					$ = [$];
				} a.list($).each(function(v,i,t){
					var p = v; p = p.slice(0,3) == '../'? module.reqdir+'/'+p : p;
						p = p.slice(0,2) == './'? module.reqdir + p.slice(1) : p;
						p = a.text.find.js.test(p)? p : p + '.js';
					run.it({
						file:p
						,reply: web.state.msg
					},function(v){ });
				});
				return web;
			}
			var spawn = a.child_process.spawn
				, fork = a.child_process.fork;
			run.on = {};
			run.res = {};
			run.it = (function(m,fn){
				if(!m){ return }
				var opt = m.what || m
					, way = opt.way = path.basename(opt.file,path.extname(opt.file));
				if(way === 'theory'){ return fn(false) }
				if(opt.file == (module.parent||{}).filename){ return fn(false) }
				if(!a.text.find.js.test(opt.file)){ return fn(false) } // ? why again ?
				if(!(fs.existsSync||path.existsSync)(opt.file)){ return fn(false) }
				if(!opt.respawn && run.on[way]){
					if(a(run.on,way+'.meta.state')){ return fn(true) } // change API
					return fn(false);
				}
				var ts = a.time.is()
					, p = fork(opt.file,[],{env:process.env})
					, gear = run.on[way] || (run.on[way]={meta:{},cogs:{}})
					, cog = gear.cogs[p.pid] = {com:p, pid:p.pid, start:ts, count:0}
				gear.meta.invincible = opt.invincible;
				p.on('message',function(m){
					m = a.obj.ify(m);
					if(a(m,'onOpen.readyState')===1){
						a.time.stop(opt.impatient);
						if(m && m.mod && m.mod.state){ m.mod.state.file = opt.file }
						else { fn(0); fn = function(){} }
						gear.meta = a.obj(m.mod).u(gear.meta);
						web.state.ways.push(a(m,'mod.state'));
						web.state.ways.sort(web.state.sort);
						//run.track(opt,opt.reply);
						fn(p.pid||true); fn = function(){};
						return;
					} opt.reply(m,way);
				});
				p.on('exit',function(d,e){
					if(cog.end){
						delete gear.cogs[p.pid];
						return;
					} if(gear.meta.invincible){
						cog.end = a.time.is();
						console.log("coalesce.run -->"+" respawn: "+d+" >> "+way+" survived "+(cog.end - cog.start)/1000+" seconds. >> respawn: "+e);
						delete gear.cogs[p.pid];
						run.it(opt,(function(){}));
						return;
					} a.time.stop(opt.impatient);
					fn(false); fn = function(){};
					gear.meta.fatal = true;
					cog.end = a.time.is();
					delete cog.com; cog.com = {send:function(){}};
					console.log("coalesce.run -->"+" exit: "+d+" >> "+way+" survived "+(cog.end - cog.start)/1000+" seconds. >> exit: "+e);
				});
				opt.impatient = a.time.wait(function(){
					fn(false); fn = function(){};
				},web.opt.run.impatient);
			});
			run.tracked = {};
			run.track = (function(opt,cb){ // depreciate
				if(run.tracked[opt.way||opt.file]) return;
				fs.watchFile(opt.file,function(c,o){
					opt.respawn = true;
					run.it(opt,(function(p){
						if(!p) return;
						a.obj(a(run.on,opt.way+'.cogs')).each(function(v,i){
							if(v.pid === p) return;
							if(v.end){
								v.com && v.com.kill && v.com.kill();
								return;
							}
							v.end = a.time.is();
						});
					}),cb);
				});
				run.tracked[opt.way||opt.file] = true;
			});
			run.to = (function(way){ // TODO: Use different algorithm? Such as oldest-used first.
				var low;
				a.obj(a(run.on,way+'.cogs')).each(function(v,i){
					low = (!v.end && v.count < (low||(low=v)).count)? v : low;
				});
				return low||{};
			});
			return run;
		})();
		web.event = (function(){
			function event(e){
				if(e){
					e.on = event.on;
					e.off = event.off;
					e.emit = event.emit;
					return e;
				} return event;
			}
			event.w = event.w||{};
			event.emit = (function(w,m){
				a.obj(event.w[w]||{}).each(function(c,i){
					if(c(m) === null){
						delete event.w[i];
					}
				});
				return;
			});
			event.on = (function(w,c){
				if(!w) return {};
				var r = a.time.now();
				(event.w[w]||(event.w[w]={}))[r] = c;
				return r;
			});
			event.off = (function(w){
				if(event.w[w]){
					delete event.w[w];
				} else {
					a.obj(event.w).each(function(v,i){
						delete v[w];
						if(a.obj.empty(v)){
							delete event.w[i];
						}
					});
				}
			});
			return event;
		})();
		web.theorize = (function(req,res){
			if(req){
				if(a.text.low(path.basename(req.url.pathname,path.extname(req.url.pathname))) === 'theory'){
					req.cookies = web.cookie.tid(req);
					if(!web.opt.no_global_theory_src){
						web.cookie.set(res,req.cookies);
						res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
						res.end(a.theory_js,'utf-8');
						return true;
					}
				}
			} if(!web.opt.no_global_theory_src){
				a.theory_js = a.theory_js||fs.readFileSync(process.env.totheory,'utf8');
				if(	(fs.existsSync||path.existsSync)(module.reqdir+'/node_modules') && 
					(fs.existsSync||path.existsSync)(__dirname+'/node_modules/theory') &&
					!(fs.existsSync||path.existsSync)(module.reqdir+'/node_modules/theory')){
					fs.mkdirSync(module.reqdir+'/node_modules/theory')
					fs.writeFileSync(module.reqdir+'/node_modules/theory/index.js'
						,"module.exports=require('"
						+path.relative(module.reqdir+'/node_modules/theory'
						,process.env.totheory).replace(/\\/ig,'/')
					+"');");
				}
			}
		});
		return web;
	});
	return web;
})());