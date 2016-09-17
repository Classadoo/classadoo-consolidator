var Firebase = require('firebase');
var Wilddog = require('wilddog');

if (process.env.ENV == "prod") {
	console.log("prod mode");
	var usRefIn =  new Firebase('https://classadoo-prod.firebaseIO.com/v2/tools/textEditor/currentView/');
	var chinaRefIn =  new Wilddog('https://classadoo-prod.wilddogio.com/v2/tools/textEditor/currentView/');
	var snapshotOut =  new Firebase('https://classadoo-scratch.firebaseIO.com/snapshot');	
} else {
	var usRefIn =  new Firebase('https://classadoo-prod.firebaseIO.com/v2/tools/textEditor/currentView/');
	var chinaRefIn =  new Wilddog('https://classadoo-prod.wilddogio.com/v2/tools/textEditor/currentView/');
	var snapshotOut =  new Firebase('https://classadoo-scratch.firebaseIO.com/snapshot');	
}

var scratches = {};

var inRefs = [usRefIn, chinaRefIn]

inRefs.forEach(function(ref) {
	ref.on("child_added", function(child) {
		var initialCodeSeen = false
		var initialCursorSeen = false
		var userKey = child.key()
		ref.child(userKey).on("value", function(snap) {		
			if (initialCursorSeen && !(userKey == 575530)) {
				var data = snap.val()
				console.log("local is", data.localId);								
				scratches[userKey] = {code: data.code, name: data.name || userKey, lastActive: Date.now()};
			} else {
				initialCursorSeen = true;
			}
		})
	})	
})

setInterval(updateSnapshot, 5000);

function updateSnapshot() {
	console.log("scratches", scratches);

	var timeIdle = {};
	Object.keys(scratches).forEach(function(key) {
		var timeSinceLastActive =  Date.now() - scratches[key].lastActive;		
		scratches[key].idleTime = timeSinceLastActive;		
	})

	snapshotOut.set({data: scratches});	
}