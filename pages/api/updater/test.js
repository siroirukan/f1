import axios from 'axios';

const rules = require('./rules.js');

const metascraper = require('metascraper')([
	  rules()
])

export default async (req, res) => {
	
	const yearDB = await import(`../../../_db/f1/2022.json`);
	let racesDB = yearDB.races;
	
	var urls = [
		"https://www.formula1.com/en/racing/2022/Bahrain.html",
		"https://www.formula1.com/en/racing/2022/Saudi_Arabia.html",
		"https://www.formula1.com/en/racing/2022/Australia.html",
		"https://www.formula1.com/en/racing/2022/EmiliaRomagna.html",
		"https://www.formula1.com/en/racing/2022/Miami.html",
		"https://www.formula1.com/en/racing/2022/Spain.html",
		"https://www.formula1.com/en/racing/2022/Monaco.html",
		"https://www.formula1.com/en/racing/2022/Azerbaijan.html",
		"https://www.formula1.com/en/racing/2022/Canada.html",
		"https://www.formula1.com/en/racing/2022/Great_Britain.html",
		"https://www.formula1.com/en/racing/2022/Austria.html",
		"https://www.formula1.com/en/racing/2022/France.html",
		"https://www.formula1.com/en/racing/2022/Hungary.html",
		"https://www.formula1.com/en/racing/2022/Belgium.html",
		"https://www.formula1.com/en/racing/2022/Netherlands.html",
		"https://www.formula1.com/en/racing/2022/Italy.html",
		"https://www.formula1.com/en/racing/2022/Singapore.html",
		"https://www.formula1.com/en/racing/2022/Japan.html",
		"https://www.formula1.com/en/racing/2022/United_States.html",
		"https://www.formula1.com/en/racing/2022/Mexico.html",
		"https://www.formula1.com/en/racing/2022/Brazil.html",
		"https://www.formula1.com/en/racing/2022/United_Arab_Emirates.html"
	];
	
	var races = [];
	let promises = [];
	for (var i = 0; i < urls.length; i++) {
		var url = urls[i];
	  	promises.push(getHTML(url));
	}
	
	return Promise.all(promises).then(response => {
		let promises2 = [];
		for (var i = 0; i < urls.length; i++) {
			var url = urls[i];
			promises2.push(getEvents(url, response[i]));
		}
		
		return Promise.all(promises2).then(response => {
			
			var differences = [];
			
			// Now Compare Each...
			for (var i = 0; i < urls.length; i++) {
				var raceDB = racesDB[i];
				var raceResponse = response[i];
				
				console.log(raceDB);
				
				if(JSON.stringify(raceDB.sessions) != JSON.stringify(raceResponse.sessions)){
					differences.push(raceResponse);
				}
			}
			
			return res.send(JSON.stringify(differences, null, 2));
		});
	});
}

async function getHTML(url) {
   return await axios.get(url).then(response => {
	   var html = response.data;
	   
	   return html;
	});
}

async function getEvents(url, html) {
	const metadata = await metascraper({html, url, validateUrl:false})
	
	var sessions = {};
	   
	if(metadata.subevent){
		var subevents = metadata.subevent;
		subevents.forEach(function(session, index){
			let name = mappedSessionName(session.name.split(" - ")[0]);
   			sessions[name] = session.startDate;
		});
		
		var formattedResponse = {name:metadata.name, sessions:sessions};
		
 		return formattedResponse;
	}
	return {name:session.name};
}

function mappedSessionName(name) {
	if(name == "Practice 1"){
		return "fp1";
	} else if(name == "Practice 2"){
		return "fp2";
	} else if(name == "Practice 3"){
		return "fp3";
	} else if(name == "Qualifying"){
		return "qualifying";
	} else if(name == "Sprint"){
		return "sprint";
	} else if(name == "Race"){
		return "gp";
	}
}