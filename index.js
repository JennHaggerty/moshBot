var request 		= require('request');
var base64 			= require('base-64');
var nodemailer  = require('nodemailer');

var config 			= require('./config');
var tourBoards 	= config.tourBoards;
var whiteList 	= config.whiteList;
var password 		= config.password;
password = base64.decode(password);

// if PASSWORD env.var is missing, exit the program
if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}
//getEvents();
//main().catch(console.error);
function getEvents() {
	// iterate through tourBoards
	for (i = 0; i < tourBoards.length; i++) {
		// requesting remote concert board from url (tourBoards[i])
		request(tourBoards[i], function (error, response, body) {
			//if error occurs, spits out error to log
			if(error) { console.log(error); }
			//get all events from tourBoards
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				concerts = json._embedded.events;
				//loop through all events
				for (j = 0; j < concerts.length; j++) {
					var name = concerts[j].name;
					var date = concerts[j].dates.start.localDate;
					var time = concerts[j].dates.start.localTime;
					var state = concerts[j].dates.timezone;
					var link = concerts[j].url;
					//check bandName against whiteList
					for (k = 0; k < whiteList.length; k++) {
						var whiteListItem = whiteList[k];
						//log event if bandName has whiteListItem
						if(name.indexOf(whiteListItem) > -1) {
							//reader friendly time formatting
							if(time != undefined){
								var time = time.substring(0, 5);
							}
							var message = name+" in "+state+" on "+date+" @ "+time+" hours. <a href='"+link+"'>Tickets</a>.";
							//var info = transporter.sendMail({
							//	from: '"Moshbot" <'+config.email+'>',
							//	to: config.email,
							//	subject: 'Moshbot detects a pit!',
							//	text: message
							//});
							//console.log("Message sent: %s", info.messageId);
						}
					}
				}
			}
		});
	}
}
var smtpConfig = {
	service: 'smtp.protonmail.com',
	port: 1025,
	secure: true,
	host: "127.0.0.1",
	auth: {
		user: config.email,
		pass: password
	}
};
var transporter = nodemailer.createTransport({smtpConfig});
async function main(){
	//send mail
	var message =  {
		from: "Moshbot 👻 " + config.email,
		to: config.email,
		subject: "Hello",
		text: "Hello world?",
		html: "<b>Hello world?</b>"
	};
	console.log("Sending mail");
	transporter.sendMail(message, function(err){
		if(err){console.log('Error: '+ err.message)}
		return;
	});
	console.log("Messages sent: %s", message.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
}
main().catch(console.error);