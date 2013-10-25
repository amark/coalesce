module.exports=require('theory')((function(){
	var todo = {};
	todo.name = 'todo';
	todo.author = 'Mark';
	todo.version = 1;
	todo.dep = (root.page)?[
		'./jquery'
	]:[
		'crypto'
	];
	todo.state = {way: "server"};
	todo.init = (function(a){
		if(root.page){
			var list = $("#list"), add = $("#add"), auth = (function(b){
				$(".auth"+(b?'':'ed')).slideUp();
				$(".auth"+(b?'ed':'')).slideDown();
				if(b){
					$(".name").text(root.whoami+"'s");
					root.whoami = a.text.low(root.whoami);
				}
			}), authn = $("#auth-name"), authpw = $("#auth-pw"), authfo = $("#auth-info");
			a.com('.list').send({list:'?',tid:root.who});
			if(root.whoami){
				auth(true);
			}else{
				auth(false);
				$("#auth").fadeIn().on('submit click',function(){
					a.com('.auth').ask({name: authn.val(), pw: authpw.val(), tid:root.who},function(m){
						if(m.what.pw){
							root.whoami = m.what.name;
							auth(true);
							return;
						}else{
							authfo.css({color:'red'}).text("Wrong password!");
						}
					});
					return false;
				});
				authn.on('input keyup',function(){
					var name;
					root.whoami = a.text.low(name = $(this).val());
					$(".name").text(name+"'s");
					a.com('.auth').ask({name:name},function(m){
						$("#auth-is").text((m.what.name)?"sign in":"sign up");
					});
				});
			}
			add.on('blur',function(){
				if(!add.val()) return;
				var id = 't'+a.text.random(9);
				sync(id,{id:id,val:add.val(),done:false});
				add.val('');
			});
			$(".check").live('click',function(){
				$(this).toggleClass('todo');
				var p = $(this).parents('li');
				sync(p.attr('id')+".done",!$(this).hasClass('todo'));
			});
			$("#list input").live('input',function(){
				var p = $(this).parents('li');
				sync(p.attr('id')+".val",$(this).val());
			}).live('blur',function(){
				var p = $(this).parents('li');
				if(!$(this).val()){
					sync(p.attr('id'),null);
				}
			});
		}
		var db = {}, tryst = {}, key = a.text.random(64), sync = (function(w,v,b){
			w = (!b&&root.page)? root.whoami+'.list.'+w : w;
			var l = w.split('.');
			var t = l.pop();
			var p = a(db,l.join('.'));
			if(p == null){
				console.log("Sync Failed: Object does not exist!");
				return;
			}
			if(v === null) delete p[t];
			else p[t] = v;
			if(root.page){
				if(t=='done'){
					$("#"+a.list(l).at(-1)+" .check")[(v?'removeClass':'addClass')]('todo');
				}else
				if(t=='val'){
					$("#"+a.list(l).at(-1)+" input").val(v);
				}else{
					if(v){
						list.append("<li id='"+v.id+"'><div class='check "+(v.done?'':'todo')+"'>"+"&#x2713;</div><div><input value='"+v.val+"'></div></li>");
					}else{
						$("#"+t).remove();
					}
				}
				if(!b) a.com('.sync').send({w:w,v:v});
			}
		});
		if(root.node){
			var hash = (function(pw){
				var hash = a.crypto.createHmac('md5',key);
				hash.update(pw);
				return hash.digest('hex');
			});
		}
		todo = (function(m){
			var to = todo, name = '', data, get = (function(m){
				name = a(tryst,m.who.sid||m.what.sid||m.who.tid||m.who.to||'')||'';
				console.log("name: "+name);
				return a(db,name)||{};
			});
			to.sync = (function(m){
				console.log('sync');
				if(root.node){
					data = get(m);
					if(name !== a.list(m.what.w.split('.')).at(1)) return;
					m.where.on = name;
					a.com.send(m);
				}
				sync(m.what.w,m.what.v,true);
			});
			to.list = (function(m){
				console.log('.list:', m);
				if(!m.what.list) return;
				if(m.what.tid) to.auth(m);
				data = get(m);
				if(m.what.list == '?'){
					m.what.name = name;
					m.what.list = data.list;
					a.com.reply(m);
				}else{
					data.list = m.what.list;
					if(root.page){
						db[(root.whoami = root.whoami||m.what.name)] = {list:data.list};
						auth(true);
						a.obj(data.list).each(function(v,i){
							list.append("<li id='"+v.id+"'><div class='check "+(v.done?'':'todo')+"'>"+"&#x2713;</div><div><input value='"+v.val+"'></div></li>");
						});
					}
				}
			});
			to.auth = (function(m){
				if(!root.node) return;
				console.log('todo.auth', m);
				data = get(m);
				if(m.what.name){
					m.what.name = a.text.is(m.what.name)? 
						m.what.name : a.text.ify(m.what.name);
					name = a.text.low(m.what.name);
					if(m.what.pw){
						var data;
						if(data=a(db,name)){
							if(a(data,'soul.salt') == hash(m.what.pw)){
								tryst[m.who.sid] = tryst[m.who.tid||m.what.tid] = name;
								a.com('.list').send({list:data.list,who:m.who.tid});
								a.com.send({where:{on:name},who:m.who});
								m.what = {pw:true,name:m.what.name};
							}else{
								m.what = {pw:false};
							}
						}else{
							var salt = hash(m.what.pw);
							db[name] = { // Use a database, fool.
								soul: {
									salt: salt
									,name: m.what.name
									,born: a.time.is()
								},
								list: {"t0":{val:"Joined ToDo",done:true,id:"t0"}}
							};
							tryst[m.who.sid] = tryst[m.who.tid||m.what.tid] = name;
							a.com('.list').send({list:a(db,name+'.list'),who:m.who.tid});
							a.com.send({where:{on:name},who:m.who});
							m.what = {pw:true,name:m.what.name};
						}
						a.com.reply(m);
						return;
					}
					if(a(db,name)){
						m.what.name = true;
					}else{
						m.what.name = false;
					}
					a.com.reply(m);
					return;
				}
				if(m.what.tid && tryst[m.who.sid]){
					a.com.send({where:{on:(tryst[m.who.tid] = tryst[m.who.sid])},who:m.who});
				}
			});
			return to;
		});todo();
		todo.server = function(m){
			console.log('todo http state', m);
			a.com.reply(m);
		}
		return todo;	
	});
	return todo;
})());