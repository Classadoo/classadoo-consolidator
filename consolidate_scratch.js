var Firebase = require('firebase');

if (process.env.ENV == "prod") {
	console.log("prodo mode");
	var refIn =  new Firebase('https://classadoo-scratch.firebaseIO.com/students');
	var refOut =  new Firebase('https://classadoo-scratch.firebaseIO.com/snapshot');
} else {
	var refIn =  new Firebase('https://classadoo-sd.firebaseIO.com/students');
	var refOut =  new Firebase('https://classadoo-sd.firebaseIO.com/snapshot');	
}



var scratches = {};

refIn.on("child_added", function(child) {
	var initialValSeen = false
	var userKey = child.key()
	refIn.child(userKey + "/editor/code").on("value", function(snap) {		
		if (initialValSeen && !(userKey == "classadoo-instructor")) {				
			scratches[userKey] = snap.val();			
		} else {
			initialValSeen = true;
		}		
	})
})	

setInterval(updateSnapshot, 5000);

function updateSnapshot() {
	console.log("scratches", scratches)
	refOut.update(scratches);
}