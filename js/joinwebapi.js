var JoinWebApi = function(){

	var me = this;
	var devicesJson = localStorage.devices;
	joindevices.storedDevices = null;
	if(devicesJson){
	    joindevices.storedDevices = JSON.parse(devicesJson);
	}
	var joinserverBase =  "https://joinjoaomgcd.appspot.com/";
	var joinserver =  joinserverBase + "_ah/api/";

	this.devices = function(callback){
		authentication.doGetWithAuth(joinserver + "registration/v1/listDevices/", function(result){
	      console.log(result);
	      joindevices.storedDevices = result.records;  
	      localStorage.devices = JSON.stringify(joindevices.storedDevices);
	      if(callback != null){
	        callback(result.records);
	      }
	    },function(error){
	        console.log("Error getting devices: " + error);    
	        if(callback != null){
	            callback(null);
	        }       
	    });
	}
	this.push = function(push, callback, callbackError){	
        var deviceIds = push.deviceIds;
        push.deviceId = null;
        push.deviceIds = deviceIds.join();
        var sender = new DeviceIdsAndDirectDevices(push.deviceIds,joindevices.storedDevices,chromeNotifications.showNotification);
		var gcmParams = {};
        if(push.clipboard){
            gcmParams[sender.GCM_PARAM_TIME_TO_LIVE] = 0;
        }
        var gcm = {"push":push};	
        gcm.getCommunicationType = function(){return "GCMPush"};
		sender.send(function(deviceIds,callback,callbackError){
            push.deviceId = null;
            push.deviceIds = deviceIds.join();
            doPostWithAuth(joinserver + "messaging/v1/sendPush/",push,callback,callbackError);
        },gcm,gcmParams, function(result){
              console.log("Sent push: " + JSON.stringify(result)); 
              if(callback){
                callback(result);
              }         
            },function(error){
                console.log("Error: " + error.er); 
                if(callbackError){
                    callbackError(error);
                }           
        });
	}
}