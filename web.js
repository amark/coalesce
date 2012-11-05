module.exports=require('theory')((function(){
	var web = {};
	web.name = 'web';
	web.version = 1;
	web.author = 'Mark';
	web.dependencies = {
		'fs': 0
		,'url': 0
		,'mime': 0
		,'path': 0
		,'http': 0
		,'https': 0
		,'node-static': 0
		,'child_process': 0
	};
	web.init = (function(a){
		var	fs = a.fs
			, path = a.path
			, URL = a.url
			, mime = a.mime
			, ns = a['node-static']
			, spread = a.spread
			, spawn = a.child_process.spawn
			, fork = a.child_process.fork;
		var	sock = require('sockjs')
			, com
			, cons = []
			, E, spread;
		spread = (function(m){
			var spread = {};
			spread.on = {};
			spread.res = {};
			spread.way = {};
			spread.create = (function(opt,fn,cb){
				var way = (a.list(opt.file.split('/')).at(-1)||'').replace(a.text.find.ext,'');
				if(!(/\.js$/i).test(opt.file) || way == 'theory' || opt.file === (module.parent||{}).filename){
					return fn(false);
				}
				var ts = a.time.is();
				if(!(path.existsSync||fs.existsSync)(opt.file)){
					return fn(false);
				}
				if(!opt.respawn && a(spread.on,way)){
					if(a(spread.on,way+'.state')) return fn(true);
					return fn(false);
				}
				var p = fork(opt.file), t = a.time.is();
				(a(spread.on,way)||(spread.on[way]={}))['p'+p.pid] = {com:p,pid:p.pid,start:t,count:0};
				p.on('message',function(m){
					m = a.obj.ify(m);
					if(a(m,'onOpen.readyState')===1){
						if(m.onOpen.state) (spread.on[way]||{}).state = m.onOpen.state;
						if(m.onOpen.invincible) (spread.on[way]||{}).invincible = true;
						return fn(true);
					}
					cb(m,way);
				});
				/* TODO: BUG: On first load, non-Theory modularized JavaScript that can run on the server won't trigger a REPLY
					Subsequent requests will work just fine. Potential fix: time.wait? */
				p.on('exit',function(d,e){
					var cog = a(spread.on,way)||{};
					if(opt.invincible){
						delete cog['p'+p.pid];
						console.log("respawn: "+d);
						console.log(way+" survived "+(cog.end - cog.start)/1000+" seconds.");
						console.log("respawn: "+e);
						spread.create(opt,(function(){}),cb);
						return;
					}
					fn(false);
					cog.fatal = true;
					cog = cog['p'+p.pid];
					if(!cog) return;
					cog.end = a.time.is();
					delete cog.com;
					cog.com = {send:function(){}};
					console.log("exit: "+d);
					console.log(way+" survived "+(cog.end - cog.start)/1000+" seconds.");
					console.log("exit: "+e);
				});
			});
			return spread;
		})();
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
		web = theory.web = a.web = (function(m){
			var w = web;
			w.map = (function(m){
				if(!m.map) return m.url.file;
				var r = a.list(m.map).each(function(v,i){
					if(v.match(m.url)) return v;
				})||{};
				return (0 <= r.flow && (path.existsSync||fs.existsSync)(m.url.file))?
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
					c = a.obj(c).each(function(v,i,t){
						if(i.charAt(0) == '$' && c[(i=i.slice(1))]){
							t(i+"="+c[i]+";"+(a.list(v).ify({wedge:'='})||[]).join(';'));
							return;
						}
						t(i+'='+v);
					});
					res.setHeader('Set-Cookie', c);
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
					spread.res['r'+m.when] = fn;
					w.msg(m,m.how.way);
					return;
				}
				if(a(spread.res,'r'+m.when)){
					a(spread.res,'r'+m.when)(m);
					delete spread.res['r'+m.when];
					return;
				}
			});
			w.sub = (function(m,opt){
				if(!a(m,'who.cid')) return;
				var con = cons[m.who.cid];
				if(!con) return;
				if(con.where[m.where.on]) return con;
				con.where[m.where.on] = E.on(m.where.on,function(m){
					if(!con.writable || con.id == m.who.cid || !cons[con.id]) return;
					//console.log(m.where.at +" for "+ con.id);
					con.write(a.text.ify(m));
				});
				return con;
			});
			w.msg = (function(m,opt){
				if(!a.obj.is(m)) return;
				var way = a(m,'how.way')||a(m,'way')||''
					,opt = opt||{};
				way = a.list(way.split('.')).at(1);
				if(opt != way){
					if(a.obj.get(a,way)){
						//console.log("<--- internal --->");
						a(a(m,'how.way')+'->')(m);
						return;
					}else if(a(spread.on,way) && !a(spread.on,way+'.fatal')){
						//console.log("<--- local --->");
						var low;
						a.obj(a(spread.on,way)).each(function(v,i){
							low = (v.count < (low||(low=v)).count)? v : low;
						});
						a(spread.on,way+'.p'+low.pid+'.com.send->')(m);
						low.count++;
						return;
					}else{
						//console.log("<--- harvest --->");
					}
					if(!w.opt.sec.relay){
						return;
					}
				}
				if(con = w.sub(m) && m.where.on||m.where.at){
					m.where.at = m.where.on||m.where.at;
					delete m.where.on;
					E.emit(m.where.at,m);
					return;
				}
				if(con = a(cons,m.who.to||'') && con.writable){
					//console.log(m);
					con.write(a.text(m).ify());
					return;
				}
			});
			w.serve = (function(opt,fn){
				opt = a.obj.is(opt)? opt : {};
				opt.pre = opt.pre||(function(){});
				opt.post = opt.fn||(function(){});
				opt.host = opt.host||'localhost';
				opt.port = opt.port||80;
				opt.dir = opt.dir ||
					((module.parent||{}).filename||'').split('/').slice(0,-1).join('/')
					|| __dirname;
				if(a.bi.is(opt.sec)){
				
				} else if(a.obj.is(opt.sec)){
				
				} else {
					opt.sec = {relay: false};
				}
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
				w.opt = opt;
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
					req.url = URL.parse(req.url,true);
					req.url.ext = path.extname(req.url.pathname).replace(/^\./,'');
					req.url.file = path.normalize(path.join(opt.dir,req.url.pathname));
					req.url.type = mime.lookup(req.url.pathname);
					req.url.map = w.map({map:opt.map,url:req.url});
					req.url.way = w.wayify(req.url.map);
					req.cookie = w.cookie.tryst(req,w.cookie.parse(req));
					opt.pre(req,res);
					//console.log(req.url);
					a.fns.flow([
					function(next){
						if(!opt.no_global_theory_src && req.url.way === 'theory'){
							return next(req,res);
						}
						spread.create({
							file: req.url.map
							,invince: req.url.file != req.url.map
						},function(v){
							if(v && a(spread.on,v=req.url.way+'.state'))
								return next(req,res,v);
							next.end(req,res);
						},w.msg);
					},function(req,res,way,next){
						var m = a.com.meta({how:{way:way,web:'state'}});
						m.what.url = req.url;
						m.what.headers = req.headers;
						m.what.cookie = req.cookie;	
						w.reply(m,function(m){
							if(m){
								if(a(m,'what.body')){
									if(m.what.type){
										var type = mime.lookup(m.what.type||'')
											,chs = mime.charsets.lookup(type);
										res.setHeader('Content-Type', type + (chs ? '; charset=' + chs : ''));
									}
									if(m.what.cookie){ // on login, pragma to no-cache
										w.cookie.set(res,m.what.cookie);
									}
									res.end(m.what.body);
									opt.post(req,res);
									return;
								}
								req.url.pathname = m.what.pathname||req.url.pathname;
							}
							next(req,res);
						});
					}],function(req,res){
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
						m.who.cid = con.id||m.who.cid;
						if(!w.cookie.tryst(con,m)) return;
						m.where.pid = (m.where.pid == process.pid)? 0 : m.where.pid;
						w.msg(m);
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