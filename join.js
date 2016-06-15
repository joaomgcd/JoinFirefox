console.log("olaa!");
joinWebApi.devices(function(devices){
	contextMenu.update(devices);
});
contextMenu.update(joindevices.storedDevices);
/*authentication.getToken(function(token){
	
},true);*/
