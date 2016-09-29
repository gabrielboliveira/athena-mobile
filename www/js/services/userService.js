angular.module('athenamobile.services')

.factory('UserService', function($q, $localStorage, ApiService) {

	var uNameKey = "uname";
	var pWordKey = "pword";

	var services = {};

	var loggedIn = false;

	var uname = "";

	var pword = "";

	var loginUserParams = {
		ssl_flag: "Y",
		func: "login-session",
		login_source: "LOGIN-BOR",
		bor_id: "",
		bor_verification: "",
		bor_library: "UEP50"
	};

	services.getLoginStatus = function(){
		return loggedIn;
	};

	services.getUsername = function(){
		return uname;
	};

	services.setUsername = function(username){
		uname = username;
	};

	services.getPassword = function(){
		return pword;
	};

	services.setPassword = function(password){
		pword = password;
	};

	services.performLogin = function(username, password) {
		uname = username;
		pword = password;

		loginUserParams.bor_id = uname;
		loginUserParams.bor_verification = pword;

		var deferred = $q.defer();
		ApiService.performCall(loginUserParams)
		  .then(function(data) {
			if(data.indexOf("<!-- filename: bor-info-single-adm-uep50 -->") > -1)
			{
				$localStorage.set(uNameKey, uname);
				$localStorage.set(pWordKey, pword);

				loggedIn = true;

	        	deferred.resolve("success-login");
			} else {
				//senha incorreta
				deferred.reject("error-login-wrong-uname-pass");
			}
	      }, function(data) {
	        deferred.reject("error-login-perform-"+data);
	      });

		return deferred.promise;
	};

  	return services;
});
