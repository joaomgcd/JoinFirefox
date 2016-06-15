console.log("olaa Auth!!");
var Authentication = function(){
	var AUTH_CALLBACK_URL = "https://joinjoaomgcd.appspot.com/authorize.html";

	var me = this;
	var getCliendId = function(){
		return chrome.runtime.getManifest().oauth2.client_id_web;
	}
	var removeAuthToken = function(callback){
	    delete localStorage.accessToken;
	    delete localStorage.authExpires;
	    delete localStorage.userinfo;
	}
	var isLocalAccessTokenValid = function(){
		//console.log(localStorage.accessToken + " - " + localStorage.authExpires + " - " + new Date(new Number(localStorage.authExpires)));
	    return localStorage.accessToken && localStorage.authExpires && new Date(new Number(localStorage.authExpires)) > new Date();
	}
	this.getUserInfo = function(callback,force,token){
	    if(!localStorage){
	        return;
	    }
		if(localStorage.userinfo && !force){
			callback(JSON.parse(localStorage.userinfo));
			return;
		}
		me.doGetWithAuth("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", function(result){
		  localStorage.userinfo = JSON.stringify(result);
		  callback(result);
		  console.log("Got user info");
		  console.log(result);
	    },function(error){
	        console.log("Error: " + error); 
	    },token);
	  
	}
	this.doPostWithAuth = function(url,content, callback, callbackError) {
	    doRequestWithAuth("POST",url,content,callback,callbackError);
	}
	this.doGetWithAuth = function(url, callback, callbackError,token) {
	    me.doRequestWithAuth("GET",url,null,callback,callbackError,false, token);
	}
	this.doRequestWithAuth = function(method, url,content, callback, callbackError, isRetry, token) {
	    me.getToken(function(token) {
	        if(token == null){
	            if (callbackError != null) {
	                callbackError("noauth");
	            }
	        }else{
	           
	            var contentClass = content == null ? null : content.toClass();
	            var isFileOrForm = contentClass && (contentClass == "[object File]" || contentClass == "[object FormData]");
	            var authHeader = "Bearer " + token;
	            //console.log("authHeader: " + authHeader);
	            console.log("Posting to: " + url);
	            var req = new XMLHttpRequest();
	            req.open(method, url, true);
	            req.setRequestHeader("authorization", authHeader);
	            if(content){
	                if(!isFileOrForm){
	                    req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
	                }
	            }
	            req.onload = function() {
	                console.log("POST status: " + this.status);
	                var result = {};
	                if(this.responseText){
	                    result = JSON.parse(this.responseText)
	                }
	                if(!isRetry && result.userAuthError){
	                    console.log("Retrying with new token...");
	                    removeCachedAuthToken(function(){
	                        doRequestWithAuth(method, url,content, callback, callbackError, true);
	                    })
	                }else{    
	                    if (callback != null) {                
	                        callback(result);
	                    }   
	                }
	            }
	            req.onerror = function(e) {
	                if (callbackError != null) {
	                    callbackError(e.currentTarget);
	                }
	            }
	            var contentString = null;
	            if(content){
	                if(isFileOrForm){
	                    contentString = content;
	                }else{
	                    contentString = JSON.stringify(content);
	                }
	            }
	            req.send(contentString);
	        }
	    },false,token);    
	}
	this.getAuthUrl = function(selectAccount,background){
	    var manifest = chrome.runtime.getManifest();
	    var url = "https://accounts.google.com/o/oauth2/v2/auth?response_type=token";
	    url += "&client_id=" + getCliendId();
	    if(!background){
	        url += "&redirect_uri=" + encodeURIComponent(AUTH_CALLBACK_URL);
	    }else{
	        url += "&redirect_uri=postmessage";
	        url += "&origin=" + encodeURIComponent("https://joinjoaomgcd.appspot.com");
	    }
	    url += "&scope=" + encodeURIComponent(manifest.oauth2.scopes.joinJoaomgcd(" "));
	    if(selectAccount){
	    	url += "&prompt=select_account";
	    }
	    return url;
	} 
	var getAuthTokenFromUrl =function(url){
	    if(url.indexOf("#access_token=")>0){
	        return url.substring(url.indexOf("#")+"#access_token=".length,url.indexOf("&"));
	    }
	}
	var setLocalAccessToken = function(token, expiresIn){
	    localStorage.authExpires = new Date().getTime() + ((expiresIn - 120) * 1000);
	    localStorage.accessToken = token;
		console.log("Setting local token: " + localStorage.accessToken + " - " + localStorage.authExpires);
	}
	var isDoingAuth = false;
	var waitingForAuthCallbacks = [];
	this.getToken = function(callback,selectAccount,token){
	    if(token){
	        if(callback){
	            callback(token);
	        }
	        return;
	    }
	    if(selectAccount){
	        removeAuthToken();
	    }
	    //removeAuthToken();
	    if(isLocalAccessTokenValid()){
	        if(callback){
	            callback(localStorage.accessToken);
	        }
	    }else{  

	        console.log("Access token not valid");
	        var focusOnAuthTabId = function(){
	            if(authTabId){
	                chrome.tabs.update(authTabId,{"active":true});
	                if(!localStorage.warnedLogin){
	                    localStorage.warnedLogin = true;
	                    //alert("Please login to use Join");
	                }
	            }else{
	                //alert("Something went wrong. Please reload the Join extension.");
	            }
	        }  
	        if(!isDoingAuth){
	            isDoingAuth = true;
	            var url = me.getAuthUrl(selectAccount);

	            if(localStorage.userinfo){
	                var userinfo = JSON.parse(localStorage.userinfo);
	                if(userinfo.email){
	                        url += "&login_hint="+ userinfo.email;
	                }
	            }
	            var closeListener = function(tabId,removeInfo){
	                 if(authTabId && tabId == authTabId){
	                    finisher(tabId);
	                 }
	            }
	            var authListener = function(tabId,changeInfo,tab){
	                if(tab.url && tab.url.indexOf(getCliendId())>0){
	                    authTabId = tabId;
	                    focusOnAuthTabId();
	                }
	                if(tab && tab.url && tab.url.indexOf(AUTH_CALLBACK_URL) == 0){
	                    var redirect_url = tab.url;
	                    var token = getAuthTokenFromUrl(redirect_url);
	                    finisher(tabId,token,redirect_url);
	                }
	            }
	            var finisher = function(tabId,token,redirect_url){
	                authTabId = null;
	                chrome.tabs.onUpdated.removeListener(authListener);
	                chrome.tabs.onRemoved.removeListener(closeListener);
	                //console.log("Auth token found from tab: " + token);
	                chrome.tabs.remove(tabId);
	                var finshCallback = function(token){
	                    if(callback){
	                        callback(token);
	                    }
	                    waitingForAuthCallbacks.doForAll(function(waitingCallback){
	                        waitingCallback(token)
	                    });
	                    waitingForAuthCallbacks = [];
	                    isDoingAuth = false;
	                }
	                if(token && redirect_url){
	                	//console.log("Redirect Url: " + redirect_url);
	                	var expiresParameter =  UrlUtils.getURLParameter(redirect_url,"expires_in");
	                	//console.log("Expires parameter: " + expiresParameter);
	                    var expiresIn = new Number(expiresParameter);
	                    setLocalAccessToken(token,expiresIn);
	                    //console.log("Token expires in " + expiresIn + " seconds");                    
	                    me.getUserInfo(function(userInfoFromStorage){
	                        console.log("Logged in with: " + userInfoFromStorage.email);
	                        finshCallback(token);
	                    },true,token);
	                }else{
	                   finshCallback(null);
	                }
	                
	            }
	            chrome.tabs.onUpdated.addListener(authListener);
	            chrome.tabs.onRemoved.addListener(closeListener)
	            windowManagement.openTab( url ,{active:false},function(tab){
	                console.log("Tab auth created");
	                console.log(tab);
	            });           
	        }else{
	            if(callback){
	                waitingForAuthCallbacks.push(callback); 
	                focusOnAuthTabId();
	            }
	        }
	    }
	}
}