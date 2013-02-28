module.exports=require('theory')((function(){
	window.vault = {};
	vault.name = 'vault';
	vault.author = 'Mark';
	vault.version = 1;
	vault.dep = {
		'./jquery':0
		,'./CryptoJS.js':0
		,'./util':0
		,'./storify':0
	}
	require('./font');
	vault.init = (function(a){
		require('./jquery-ext');
		console.log("Vault Initialized");
		var _ = amplify, v = (function(m){
			return v||{};
		});v();
		_.store('vault',v.store = _.store('vault')||{});
		v.cid = a.text(24).random();
		v.en = (function(m,pass){
			if(a.obj.is(m)){
				data = m.what.data;
				pass = m.what.pass;
			} else {
				data = m;
				pass = pass;
			}
			return CryptoJS.AES.encrypt(data,pass,{format:a.util}).toString();
		});
		v.de = (function(m,pass){
			return CryptoJS.AES.decrypt(m,pass,{format:a.util}).toString(CryptoJS.enc.Utf8);
		});
		v.com = (function($){
			var com = v.com;
			com.$ = $ !== undefined? $ : null; $=null;
			com.send = (function(m){
				var w = a.obj.get(m,'how.way');
				if($=a.fns.$(this)){
					w = $;
				}
				m = a.com.meta(m,w);
				m.where = m.where||{on:'vault'};
				m.who = m.who||{};
				if(v.id) m.who.id = v.id;
				m.who.from = v.cid;
				a.com(w).send(m);
				return m;
			});
			com.reply = (function(m){
				var w = a.obj.get(m,'how.way');
				if($=a.fns.$(this)){
					w = $;
				}
				m = a.com.meta(m,w);
				m.where = m.who.from;
				m.who = m.who||{};
				if(v.id) m.who.id = v.id;
				m.who.from = v.cid;
				a.com(w).send(m);
			});
			return com;
		});
		v.is = (function(m){
			if(m.what.when < v.date||0) return;
			console.log("Attempting to decrypt with private key:");
			console.log(m);
			v.date = m.what.when;
			$("#data").val(v.data_ = v.de(m.what.data,v.pass));
			v.onlive(m);
		});
		v.get = (function(m){
			if(m){
				v.onlive(m);
				var vs = _.store('vault'), d;
				if(!(m.what=vs[m.what])) return;
				console.log("Retrieving "+m.what.id+"'s data.");
				v.com('.is').reply(m);
				return;
			}
			if(!v.id || !v.pass) return;
			v.com('.get').send(v.id);
		});
		v.scan = (function(m){
			if(m){
				v.onlive(m);
				m.what = v.id||'';
				return v.com('.get').reply(m);
			}
			v.com('.scan').send('');
		});
		v.online = {};
		v.onlive = (function(m){
			if(m){
				v.online[m.who.from] = a.time.is();
				//console.log('pong');
				if(m.what === 'ping'){
					m.what = 'pong';
					v.com.reply(m);
				}
			}
			var c = 0, l; a.obj(v.online).each(function(){c++;});
			$("#online").text(c);
			if(c === 1){
				$("#onplur").text();
				$("#onverb").text('is');
				$(".pulse").animate({color:'#222','background-color':'goldenrod'});
			}else{
				$("#onplur").text('s');
				$("#onverb").text('are');
				$(".pulse").animate({color:'#DDD','background-color':'green'});
			}
			if(c === 0){
				$(".pulse").stop(true,true).animate({'background-color':'red'});
			}
		});
		v.onloop = (function(){
			var t = a.time.is();
			a.obj(v.online).each(function(c,i){
				if(8000 < t - c){
					delete v.online[i];
					v.onlive();
				} else if(4000 < t - c){
					v.com('.onlive').send({where:i,what:'ping'});
				}
			});
		});a.time.loop(v.onloop,3000);
		$("input").filter(".reg").on('focus',function(){
			$(".help").hide();
			$(".help-"+this.id).fadeIn();
		});
		$("#keys").on('submit',function(){
			v.id = $("#name").val();
			v.pass = $("#pass").val();
			$(this).slideUp();
			$("#create").slideDown();
			v.get();
			return false;
		});
		v.saved = 0;
		v.save = (function(m){
			if(m){
				if(m.what.OK){
					$("#save").html("SAVE");
					$("#oninfo").html("Your encrypted data has been replicated to "
						+ (++v.saved) +" store"+ (v.saved===1? '' : 's')
					+".");
					return;
				}
				console.log('Saving '+m.who.id+"'s data.");
				v.store = _.store('vault');
				v.store[m.who.id] = {when:m.when,data:m.what,id:m.who.id};
				_.store('vault',v.store);
				m.what = {OK:1};
				v.com.reply(m);
			}
		});
		$("#save").click(function(){
			v.saved = 0;
			$(this).html("<img src='./sync.gif'>");
			$("#oninfo").html("Your data has been successfully encrypted...");
			v.data = v.en($("#data").val(),v.pass);
			v.date = (v.com('.save').send(v.data)||{}).when;
		});
		vault.start = (function(){
			a.com.send({where:{on:v.cid}});
			v.scan();
		});vault.start();
		theory.com.close = (function(){
			a.time.wait(function(){
			console.log('reconnecting');
			theory.com.rcd.push(a.time.is());
			theory.com.page();
			},theory.com.rcd.length*
			theory.com.rcd.length*1000);
		}); theory.com.rcd = [a.time.is()];
		theory.com.open = (function(){
			vault.start();
		});
		return v;
	});
	return vault;
})());