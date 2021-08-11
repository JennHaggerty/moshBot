const axios           = require('axios');
const bluebird 				= require('bluebird');
const { response } = require('express');
const createTransport = require('nodemailer');
const config 					= require('./config');
var boards 					= config.eventBoards;
var whiteList				= config.whiteList;

if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}
main().catch(console.error);

async function main() {
	var endpoints = makeEndpoints(boards, whiteList);
	var events = await getData(endpoints);
	return;
	cleanData(events.length); return;
	if (events.length < 1) { return; }
	var eventDetails = cleanData(events);
	var message = prepareMessage(eventDetails);
	sendEmail(message);
}
function makeEndpoints(boards, whiteList) {
	let endpoints = [];
	boards.forEach(board => {
		whiteList.forEach(keyword => {
			keyword = keyword.replace(/\s+/g, '%').toLowerCase();
			endpoints.push(board + "&keyword=" + keyword);
		});
	});
	return endpoints;
}
async function useAxios(url) {
	try {
		const {data:response} = await axios.get(url);
		console.log(response.status)
    return response
	} catch (error) {
		console.log(error.toString());
	}
}
async function getData(endpoints) {
	let data = [];
	let k = 0;
	for (i = 0; i < endpoints.length; i ++) {
		let url = endpoints[i];
		axios.get(url).then(res => {
			console.log(res.status);
		})
		.catch(err => {
			console.log(err.toString());
		})
		await sleep(1000);
	}
	/*
	for (i = 0; i < endpoints.length; i += 5) {
		let arrChunk = endpoints.slice(i, i + 5);
		for (j = 0; j < arrChunk.length; j++) {
			let url = arrChunk[j];
			axios.get(url).then(res => {
				console.log(res.status);
			})
			.catch(err => {
				console.log(err.toString());
			})
			await sleep(1000);
		}
		k++;
		console.log(i);
	}
	*/
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function cleanData(jsonArr) {
	let newJsonArr = [];
	jsonArr.forEach(json => {
		let venue 				= json._embedded.venues[0];
		let newJson 			= {};
		newJson.name			= json.name;
		newJson.location 	= venue.city['name'] + "," + venue.state["stateCode"];
		newJson.url 			= json.url;
		newJson.startTime = json.dates.start.localTime;
		newJson.startDate = json.dates.start.localDate;
		
		newJsonArr.push(newJson);
	});
	return newJsonArr;
}
function prepareMessage(events) {
	var message = '';
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
function sendEmail(textMessage){
	var transporter = createTransport({
		service: 'gmail',
		auth: {
		  user: email,
		  pass: password
		}
	  });
	  
	  var mailOptions = {
		from: "Moshbot 🤘 " + email,
		to: email,
		subject: "MoshBot found some concerts",
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


/*async function getData(endpoints) {
	let events = [];
	for (x = 0; x < endpoints.length; x++) {
		try {
			let response = await axios.get(endpoints[x], {timeout: 200});
			//console.log(response);
			if (	response.status == 200 && 
						response.data.hasOwnProperty('_embedded') && 
						response.data._embedded.hasOwnProperty('events')
					) {
				let eventsArr = response.data._embedded.events;
				eventsArr.forEach(event => {
					events.push(event)
				});
			}
		} catch (error) {
			console.log(error);
		}
	}
	console.log(events);
	return events;
}
*/