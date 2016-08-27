var Firebase = require('firebase');
var Wilddog = require('wilddog');

if (process.env.ENV == "prod") {
	console.log("prod mode");
	var usRefIn =  new Firebase('https://classadoo-scratch.firebaseIO.com/students');
	var chinaRefIn =  new Wilddog('https://classadoo-prod.wilddogio.com/students/');
	var snapshotOut =  new Firebase('https://classadoo-scratch.firebaseIO.com/snapshot');	
} else {
	var usRefIn =  new Firebase('https://classadoo-sd.firebaseIO.com/students');
	var chinaRefIn =  new Wilddog('https://classadoo-prod.wilddogio.com/students/');
	var snapshotOut =  new Firebase('https://classadoo-sd.firebaseIO.com/snapshot');	
}

var scratches = {};
var lastActive = {};

var inRefs = [usRefIn, chinaRefIn]

inRefs.forEach(function(ref) {
	ref.on("child_added", function(child) {
		var initialCodeSeen = false
		var initialCursorSeen = false
		var userKey = child.key()
		ref.child(userKey + "/editor/code").on("value", function(snap) {		
			if (initialCodeSeen && !(userKey == "classadoo-instructor")) {							
				scratches[userKey] = snap.val();			
			} else {
				initialCodeSeen = true;
			}		
		})

		ref.child(userKey + "/editor/lastTyped").on("value", function(snap) {		
			if (initialCursorSeen && !(userKey == "classadoo-instructor")) {				
				lastActive[userKey] = Date.now();			
			} else {
				initialCursorSeen = true;
			}		
		})
	})	
})

setInterval(updateSnapshot, 5000);

function updateSnapshot() {
	console.log("scratches", scratches)

	var timeIdle = {}
	Object.keys(lastActive).forEach(function(key) {
		var timeSinceLastActive =  Date.now() - lastActive[key];		
		timeIdle[key] = timeSinceLastActive		
	})

	snapshotOut.set({code: scratches, idleTimes: timeIdle});	
}