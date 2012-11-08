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