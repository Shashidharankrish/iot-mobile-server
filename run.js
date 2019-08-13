var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://taurej:taurej786@ds147446.mlab.com:47446/iotmobileapp';

const WebSocket = require('ws');

// do not verify self-signed certificates if you are using one
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'


function test() {

	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("iotmobileapp");
	  dbo.collection("devices").find({status: "active" }).toArray(function(err, result) {
	    if (err) throw err;
	    if(result.length) {
	    	result.forEach(item => {
	    		ws(item);
	    	})
	    }

	    db.close();
	  });
	});

}

setInterval(test, 300000);


function ws(data) {
	
	const ws = new WebSocket('wss://34.73.96.242/ws/channels/'+data.mfChannelId+'/messages?
	='+data.mfKey)

	ws.on('open', () => {
	    
	  var randomNumber = () => Math.floor((Math.random()*10) + 1);
	  let temperature = randomNumber();
	  let humidity = randomNumber();
	  let co = randomNumber();
	  let co2 = randomNumber();
	  let n2 = randomNumber();
	  let suspended_particles = randomNumber();


	  var msg= '[{"bn":"","bver":150,"n":"temperature","u":"C","v":'+temperature+'},{"n":"humidity","u": "rh","v":'+humidity+'},{"n":"co","u":"ppm","v":'+co+'},{"n":"co2","u":"ppm","v":'+co2+'},{"n":"n2","u":"ppm","v":'+n2+'},{"n":"suspended_particles","u":"micrometers","v":'+suspended_particles+'}]';
	  console.log(msg)
	  ws.send(msg);
	  ws.close();  

	})

}
