var axios 		= require('axios');
var nodemailer	= require('nodemailer');
var config 		= require('./config');
var boards 		= config.eventBoards;
var whiteList	= config.whiteList;

if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}
main().catch(console.error);

async function main() {
	var urls = makeUrls(boards, whiteList);
	var events = await getData(urls);
	if (events.length < 1) { return; }
	var eventDetails = cleanData(events);
	var message = prepareMessage(eventDetails);
	sendEmail(message);
}

function sendEmail(textMessage){
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: config.email,
		  pass: config.password
		}
	  });
	  
	  var mailOptions = {
		from: "Moshbot 👻 " + config.email,
		to: config.email,
		subject: "MoshBot found some concerts!",
		text: textMessage
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		} else {
		  console.log('Email sent: ' + info.response);
		}
	  });
}
function prepareMessage(events) {
	var message = `Ready the battle dress: `;
	events.forEach(event => {
		var date = new Date(event.startDate);
		message =  message + "\n" +s 
			event.name + "\n" +
			date + "\n" + 
			event.location + "\n" + 
			event.url + "\n\n"
		;
	});
	return message;
}
function cleanData(jsonArr) {
	var eventDetails = [];
	jsonArr.forEach(json => {
		var venue 			= json._embedded.venues[0];
		var newJson 		= {};
		newJson.name		= json.name;
		newJson.location 	= venue.city['name'] + "," + venue.state["stateCode"];
		newJson.url 		= json.url;
		newJson.startTime 	= json.dates.start.localTime;
		newJson.startDate 	= json.dates.start.localDate;
		
		eventDetails.push(newJson);
	});
	return eventDetails;
}
async function getData(urls) {
	var events = [];
	for (x = 0; x < urls.length; x++) {
		try {
			const response = await axios.get(urls[x]);
			if (response.status == 200 &&  response.data._embedded.events != undefined) {
				var eventsArr = response.data._embedded.events;
				eventsArr.forEach(event => {
					events.push(event)
				});
			}
		} catch (error) {
			console.log(error);
		}
	}
	return events;
}
function makeUrls(boards, whiteList) {
	var urls = [];
	boards.forEach(board => {
		whiteList.forEach(name => {
			urls.push(board + "&keyword=" + name);
		});
	});
	return urls;
}