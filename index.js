/*
var base64 		= require('base-64');
var nodemailer  = require('nodemailer');
var password 	= config.password;
password 		= base64.decode(password);
*/
var config 		= require('./config');
var boards 		= config.eventBoards;
var whiteList 	= config.whiteList;
var axios 	= require('axios');

// if PASSWORD env.var is missing, exit the program
if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}

async function main() {
	var urls = makeUrls(boards, whiteList);
    var events = await getData(urls);
	var eventDetails = cleanData(events);
	var email = prepareEmail(eventDetails);
	console.log(email);
}
main();

function prepareEmail(events) {
	var message = `
	Hey, 
	MoshBot found some concerts:
	`;
	events.forEach(event => {
		var date = new Date(event.startDate);
		message =  message + 
			event.name + " " +
			date + " " + 
			event.local + " " + 
			event.url + 
			" <a href='" + event.url + "'>Tickets</a>"
			" | ";
		;
	});
	return message;
}
function cleanData(jsonArr) {
	var eventDetails = [];
	jsonArr.forEach(json => {
		var venue = json._embedded.venues;
		var newJson = {};
		newJson.name = json.name;
		newJson.url = json.url;
		newJson.startTime = json.dates.start.localTime;
		newJson.startDate = json.dates.start.localDate;
		
		eventDetails.push(newJson);
	});
	return eventDetails;
}
async function getData(urls) {
	var events = [];
	for (x = 0; x < urls.length; x++) {
		try {
			const response = await axios.get(urls[x]);
			var eventsArr = response.data._embedded.events;
			eventsArr.forEach(event => {
				events.push(event)
			});
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