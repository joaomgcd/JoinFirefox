var WindowManagement = function(){
	var me = this;
	this.openNewTab = function(url,options, callback){
	    chrome.windows.getCurrent({ 'populate': false }, function(current) {
	        if (current) {
	        	if(!options){
	        		options = {};
	        	}
	        	options.url = url;
	            chrome.tabs.create(options,callback);
	        } else {
				var finalOptions = { 'url': url, 'type': 'normal', 'focused': true };
				if(options){
					for(var prop in options){
						finalOptions[prop] = options[prop];
					}	
				}
	            chrome.windows.create(finalOptions,callback);
	        }
	    });
	}
	this.openTab = function(url,options,callback){
		chrome.tabs.query({},function(result){
			var correctTab = result.first(function(tab){
				return tab.url == url;
			});
			if(correctTab){
				var finalOptions = {active: true};
				if(options){
					for(var prop in options){
						finalOptions[prop] = options[prop];
					}
				}
				chrome.tabs.update(correctTab.id, finalOptions,callback);
			}else{
				me.openNewTab(url,options,callback);
			}
		});
	}
}