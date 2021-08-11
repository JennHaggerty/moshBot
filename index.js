const axios = require('axios');
const nodemailer = require('nodemailer');
const config = require('./config');
const fs = require('fs');
var boards = config.eventBoards;
var whiteList = config.whiteList;
var email = config.email;
var password = config.password;

if(!config) {
  console.log("You need a config/ file!");
  process.exit(1);
}
main().catch(console.error);

async function main() {
	var endpoints = makeEndpoints(boards, whiteList);
	var data = await getData(endpoints);
	var events = cleanData(data);
	if (events.length < 1) { return; }
	var message = prepareMessage(events);
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
async function getData(endpoints) {
	let data = [];
	for (i = 0; i < endpoints.length; i ++) {
		let url = endpoints[i];
		axios.get(url).then(res => {
			if (res.status == 200 && res.data._embedded && res.data._embedded.events) {
				let json = res.data._embedded.events;
				data.push(json);
			}
		})
		.catch(err => { 
			fs.writeFile('./err_log.txt', "getData(): " + err.toString(), { flag: 'a+' });

		})
		await sleep(1000);
	}
	return data;
}
function cleanData(jsonArr) {
	let newJsonArr = [];
	jsonArr.forEach(json => {
		let venue 				= json[0]._embedded.venues[0];
		let newJson 			= {};
		newJson.name			= json[0].name;
		newJson.location 	= venue.city['name'] + "," + venue.state["stateCode"];
		newJson.url 			= json[0].url;
		newJson.startTime = json[0].dates.start.localTime;
		newJson.startDate = json[0].dates.start.localDate;
		newJsonArr.push(newJson);
	});
	return newJsonArr;
}
function prepareMessage(events) {
	var message = '';
	events.forEach(event => {
		var date = new Date(event.startDate);
		message =  message + "\n" +
			event.name + "\n" +
			date + "\n" + 
			event.location + "\n" +
			event.url + "\n\n";
	});
	return message;
}
function sendEmail(textMessage){
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: { user: email, pass: password }
	});
	var mailOptions = {
		from: "Moshbot 🤘 " + email,
		to: email,
		subject: "Ready the battle dress",
		text: textMessage
	};
	transporter.sendMail(mailOptions, function(error, info){
		if (error)
		fs.writeFile('./err_log.txt', "sendMail(): " + err.toString(), { flag: 'a+' });
	});
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}