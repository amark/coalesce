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
		var	fs = a.fs
			, path = a.path
			, URL = a.url
			, mime = require('mime')
			, ns = require('node-static')
			, formidable = require('formidable')
			, spawn = a.child_process.spawn
			, fork = a.child_process.fork;
		var	sock = require('sockjs')
			, com
			, cons = []
			, E, spread;
		E = (function(e){
			E.w = E.w||{};
			E.emit = (function(w,m){
				a.obj(E.w[w]||{}).each(function(c,i){
					if(c(m) === null){
						delete E.w[i];
					}
				});
				return;
			});
			E.on = (function(w,c){
				if(!w) return {};
				var r = a.time.now();
				(E.w[w]||(E.w[w]={}))[r] = c;
				return r;
			});
			E.off = (function(w){
				if(E.w[w]){
					delete E.w[w];
				} else {
					a.obj(E.w).each(function(v,i){
						delete v[w];
						if(a.obj.empty(v)){
							delete E.w[i];
						}
					});
				}
			});
			if(e){
				e.on = E.on;
				e.off = E.off;
				e.emit = E.emit;
				return e;
			}
			return E;
		});E();
		spread = (function(m){
			var spread = {};
			spread.on = {};
			spread.res = {};
			spread.way = {};
			spread.low = (function(way){
				var low;
				a.obj(a(spread.on,way+'.cogs')).each(function(v,i){
					low = (!v.end && v.count < (low||(low=v)).count)? v : low;
				});
				return low||{};
			});
			spread.track = (function(opt,cb){
				if(spread.tracked[opt.way||opt.file]) return;
				fs.watchFile(opt.file,function(c,o){
					opt.respawn = true;
					spread.create(opt,(function(p){
						if(!p) return;
						a.obj(a(spread.on,opt.way+'.cogs')).each(function(v,i){
							if(v.pid === p) return;
							if(v.end){
								v.com && v.com.kill && v.com.kill();
								return;
							}
							v.end = a.time.is();
						});
					}),cb);
				});
				spread.tracked[opt.way||opt.file] = true;
			});spread.tracked = {};
			spread.create = (function(opt,fn,cb){
				var way = opt.way = path.basename(opt.file,path.extname(opt.file));
				if(!(/\.js$/i).test(opt.file) || way == 'theory' || opt.file === (module.parent||{}).filename){
					return fn(false);
				}
				var ts = a.time.is();
				if(!(fs.existsSync||path.existsSync)(opt.file)){
					return fn(false);
				}
				if(!opt.respawn && spread.on[way]){
					if(a(spread.on,way+'.meta.state')) return fn(true);
					return fn(false);
				}
				var p = fork(opt.file,[],{env:process.env}), t = a.time.is(), cog,
				gear = (spread.on[way]||(spread.on[way]={meta:{},cogs:{}}));
				gear.meta.invincible = opt.invincible;
				cog = gear.cogs[p.pid] = {com:p,pid:p.pid,start:t,count:0};
				p.on('message',function(m){
					m = a.obj.ify(m);
					if(a(m,'onOpen.readyState')===1){
						a.time.stop(opt.to);
						a.obj(m.mod).each(function(v,i){
							gear.meta[i] = v;
						});
						spread.track(opt,cb);
						fn(p.pid||true);
						fn = function(){};
						return;
					}
					cb(m,way);
				});
				p.on('exit',function(d,e){
					if(cog.end){
						delete gear.cogs[p.pid];
						return;
					}
					if(gear.meta.invincible){
						console.log("respawn: "+d+" >> "+way+" survived "+
							((cog.end=a.time.is()) - cog.start)/1000+" seconds. >> respawn: "+e);
						delete gear.cogs[p.pid];
						spread.create(opt,(function(){}),cb);
						return;
					}
					a.time.stop(opt.to);
					fn(false);
					fn = function(){};
					gear.meta.fatal = true;
					cog.end = a.time.is();
					delete cog.com;
					cog.com = {send:function(){}};
					console.log("exit: "+d+" >> "+way+" survived "+(cog.end - cog.start)/1000+" seconds. >> exit: "+e);
				});
				opt.to = a.time.wait(function(){
					fn(false);
					fn = function(){};
				},web.opt.spawn_within||3*1000);
			});
			return spread;
		})();
		web = theory.web = a.web = (function(m){
			var w = web;
			w.map = (function(m){
				if(!m.map) return m.url.file;
				var r = a.list(m.map).each(function(v,i){
					if(v.match && v.match(m.url)) return v;
				})||{};
				return (0 <= r.flow && (fs.existsSync||path.existsSync)(m.url.file))?
					m.url.file : r.file || m.url.file;
			});
			w.wayify = (function(m){
				return (a.list((m||'').split('/')).at(-1)||'').replace(a.text.find.ext,'');
			});
			w.tryst = {};
			w.cookie = {
				parse: (function(m){
					var l,p,c={};
					if(a(m,'headers.cookie')){
						l = m.headers.cookie.split(/\s?;\s?/ig);
						a.list(l).each(function(v,i){
							p = v.split(/=/);
							c[p[0]] = p.slice(1).join('=');
						});
					}
					return c;
				})
				,set: (function(res,c){
					c = c || res.cookie || {};
					if(w.opt && c.sid){c.$sid = {HttpOnly:true}}
					c = a.obj(c).each(function(v,i,t){
						if(i.charAt(0) == '$' && c[(i=i.slice(1))]){
							t(i+"="+c[i]+";"+(a.list(v).ify({wedge:'='})||[]).join(';'));
							return;
						}
						t(i+'='+v);
					})||[];
					res.setHeader('Set-Cookie', c);
				})
				,tid: (function(req,m,fn){
					if(fn){ 
						if(req.sid || req.tid){
							m.who.tid = req.tid;
							m.who.sid = req.sid;
							return fn(true);
						} if(m.who.tid){
							// GETEX REDIS HERE
							
							var s, t = a.time.is();
							if(s = w.tryst[m.who.tid]){
								req.tid = m.who.tid;
								req.sid = m.who.sid = s.sid;
								fn(true);
							} else {
								if(w.opt.sec.incognito){ req.sid = req.tid = m.who.tid; fn(true) }
							} delete w.tryst[m.who.tid];
							a.obj(w.tryst).each(function(v,i){
								if(w.opt.session.wait < t - v.ts){
									delete w.tryst[i];
								}
							}); 
						}
					} if(req.url){ 
						req.cookies = req.cookies||{};
						// SETEX REDIS HERE
						
						w.tryst[req.cookies.tid = w.opt.session.tid()] 
							= {sid: req.cookies.sid, ts: a.time.is()}
						return req.cookies;
					}
				})
				,tryst: (function(req,c){
					if(w.opt.sec.incognito){
						return (!req.connection)? true : c; 
					}
					if(!req.connection){
						c.who.tid = req.tid||c.who.tid;
						if(req.IP && req.tid === c.who.tid) return true;
						var t = a.time.is();
						a.obj(w.tryst).each(function(v,i){
							if(1000 * 60 * 60 < t - v.ts){
								delete w.tryst[i];
							}
						});
						if(a(w.tryst,c.who.tid+'.val') === req.remoteAddress){
							req.tid = c.who.tid;
							req.IP = req.remoteAddress;
							/**	TODO: BUG: An entirely cache loaded app will fail to validate the socket because no REQ refreshed the tryst.
								Temporary fixes: 1) Force a non-cachable load. 2) Use incognito mode if security is not a concern. **/
							delete w.tryst[c.who.tid];
							return true;
						}
						req.close(-1,'Origin IP and Socket IP do not match, closed for security reasons.');
						return false;
					}
					if(req.url){
						w.tryst[c.tid = (c.tid||a.text(16).random())] = w.tryst[c.tid]||{val:
							(req.connection.remoteAddress||(req.connection.socket||{}).remoteAddress)
						,ts: a.time.is()};
						c.$tid = {path:'/'};
					}
					return c;
				})
			};
			w.reply = (function(m,fn){
				if(fn){
					spread.res[m.when] = fn;
					w.msg(m,m.how.way);
					return;
				}
				if(spread.res[m.when]){
					a(spread.res,m.when+'->')(m);
					delete spread.res[m.when];
					return;
				}
			});
			w.sub = (function(m,opt,con){
				if(	!a.obj.is(m) || !a.obj.is(m.where) ||
					!a(m,'who.cid') || !(con = cons[m.who.cid])) return;
				if(m.where.off){
					if(!con.where[m.where.off]) return;
					E.off(con.where[m.where.off]);
					delete con.where[m.where.off];
					return con;
				}
				if(con.where[m.where.on]) return con;
				con.where[m.where.on] = E.on(m.where.on,function(m){
					if(!con.writable || con.id == m.who.cid || !cons[con.id]) return;
					con.write(a.text.ify(m));
				});
				return con;
			});
			w.msg = (function(m,opt,con){
				if(!a.obj.is(m)) return;
				var way = a(m,'how.way')||a(m,'way')||''
					,opt = opt||{};
				way = a.list(way.split('.')).at(1);
				if(opt != way){
					if(a[way]){
						a(a(m,'how.way')+'->')(m);
						return;
					}else if(spread.on[way] && !a(spread.on,way+'.meta.fatal')){
						var low = spread.low(way);
						low.com && low.com.send && low.com.send(m);
						low.count++;
						return;
					}else{
					}
					if(!w.opt.sec.relay){
						return;
					}
				}
				if((con = w.sub(m)) && (m.where.on||m.where.off||m.where.at)){
					m.where.at = m.where.on||m.where.off||m.where.at;
					delete m.where.on;
					delete m.where.off;
					return E.emit(m.where.at,m);
				}
				if((con = cons[m.who.to||'']) && con.writable){
					return con.write(a.text(m).ify());
				}
			});
			w.serve = (function(opt,fn){
				module.reqdir = path.dirname((module.parent||{}).filename);
				if(!opt.no_global_theory_src){
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
				opt = a.obj.is(opt)? opt : {};
				opt.pre = opt.pre||(function(){});
				opt.post = opt.post||(function(){});
				opt.host = opt.host||'localhost';
				opt.port = opt.port||80;
				opt.dir = opt.dir || module.reqdir || __dirname;
				if(a.bi.is(opt.sec)){
					opt.sec = {};
				} else if(a.num.is(opt.sec)){
					opt.sec = (opt.sec === -2)? {relay: true, incognito: true} : opt.sec;
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
				opt.db = opt.db||{};
				opt.db.host = opt.db.host||'localhost';
				opt.com = opt.com||{};
				opt.com.prefix = opt.com.prefix||'/com';	
				opt.com.url = opt.com.url||"http"+((opt.sec.key&&opt.sec.cert)?'s':'')+"://"
					+opt.host+(opt.port?':'+opt.port:'')
					+(opt.com.path||"/node_modules/sockjs/sockjs-0.3.min.js");
				if(opt.map){
					opt.flow = (function(A,B){
						A = A.flow; B = B.flow;
						if (A < B){
							return -1;
						}else if (A > B){
							return  1;
						}else{
							return 0;
						}
					});
					opt.map = opt.map.sort(opt.flow);
				}
				opt.run = opt.run||[];
				w.opt = opt;
				a.list(opt.run).each(function(v,i){
					console.log(v);
					spread.create({
							file: v
							,invincible: true
						},function(v){
							console.log("? "+v);
					},w.msg);
				});
				com = sock.createServer({
					sockjs_url: opt.com.url
				});
				w.dir = new ns.Server(opt.dir);
				if(opt.sec.key && opt.sec.cert){
					w.state = a.https.createServer({key: opt.sec.key, cert: opt.sec.cert});
				} else {
					w.state = a.http.createServer();
				}
				w.state.addListener('request',function(req,res){
					a.fns.flow([function(next){
						req.url = URL.parse(req.url,true);
						req.url.ext = path.extname(req.url.pathname).replace(/^\./,'');
						req.url.file = path.normalize(path.join(opt.dir,req.url.pathname));
						req.url.type = mime.lookup(req.url.pathname);
						req.url.map = w.map({map:opt.map,url:req.url});
						req.url.way = path.basename(req.url.map,path.extname(req.url.map));
						req.cookies = w.cookie.parse(req);
						req.cookies.sid = req.cookies.sid || opt.session.sid();
						opt.pre(req,res);
						if(a.text.low(req.url.way) === 'theory'){
							req.cookies = w.cookie.tid(req);
							if(!opt.no_global_theory_src){
								w.cookie.set(res,req.cookies);
								res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
								return res.end(a.theory_js,'utf-8');
							}
						} next();
					},function(next){
						spread.create({
							file: req.url.map
							,invincible: req.url.file != req.url.map
						},function(v){
							if(v && (v=req.url.way+'.'+a(spread.on,req.url.way+'.meta.state'))){								
								if(a.text(req.method).low() == 'post'){
									var form = new formidable.IncomingForm();
									req.form = {}; req.files = {};
									form.on('field',function(k,v){
										req.form[k] = v;
									})
									form.on('file',function(k,v){
										if(!req.files[k]){ req.files[k] = [] }
										(req.files[k]||[]).push(v);
									})
									form.on('end', function(){
										next(v);
									});
									return form.parse(req);
								} return next(v);
							} next.end();
						},w.msg);
					},function(way,next){
						var m = a.com.meta({how:{way:way,web:'state'},where:{pid:0}});
						m.what.url = req.url;
						m.what.form = req.form;
						m.what.files = req.files;
						m.what.headers = req.headers;
						m.what.cookies = req.cookies;
						w.reply(m,function(m){
							if(m){
								if(a(m,'what.body')){
									if(m.what.type){
										var type = mime.lookup(m.what.type||'')
											,chs = mime.charsets.lookup(type);
										res.setHeader('Content-Type', type + (chs ? '; charset=' + chs : ''));
									} if(m.what.encoding){
										res.setHeader('Content-Encoding', m.what.encoding);
									} w.cookie.set(res,m.what.cookies||req.cookies); // on login, pragma to no-cache (?)
									res.end(m.what.body);
									opt.post(req,res);
									return;
								} req.url.pathname = m.what.pathname||a(m.what,'url.pathname')||req.url.pathname;
							} next(req,res);
						});
					}],function(){
						w.cookie.set(res,req.cookie);
						w.dir.serve(req,res);
						opt.post(req,res);
					});
				});
				w.state.addListener('upgrade',function(req,res){
					res.end();
				});
				w.state.listen(opt.port);
				com.where = {};
				com.on('connection',function(con){
					con.where = {};
					cons[con.id] = con;
					con.on('data',function(m){
						m = a.com.meta(a.obj.ify(m),con);
						w.cookie.tid(con,m,function(v){
							if(!v){ return }
							//m.who.cid = con.id||m.who.cid;
							//if(!w.cookie.tryst(con,m)) return;
							m.where.pid = (m.where.pid == process.pid)? 0 : m.where.pid;
							w.msg(m);
						});
					});
					con.on('close',function(m){
						console.log(con.id+" disconnected.");
						a.obj(con.where).each(function(v,i){
							E.off(v);
						});
						delete cons[con.id];
					});
				});
				com.installHandlers(w.state,opt.com);
				return w;
			});
			if(m){
				m.port && w.serve(m);
			}
			return w;
		});web();
		return web;
	});
	return web;
})());