var ChromeNotifications = function(){
	this.showNotification = function(title, message, timeout, notificationId){
		if(!timeout)timeout = 3000;
	    var options = {
	        "type":"basic",
	        "iconUrl":"icons/big.png",
	        "title": title,
	        "message": message
	    };
	    if(!notificationId){
	        notificationId = StringUtils.guid();
	    }
	    chrome.notifications.create(notificationId, options,function(){        
	        setInterval(function() {
	            chrome.notifications.clear(notificationId, function() {})
	        }, timeout);
	    });    
	}
}