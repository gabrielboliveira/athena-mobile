angular.module('athenamobile.services')
.factory('ApiService', function($http, $q) {

    var baseAthena = "http://www.athena.biblioteca.unesp.br/F/";

    var token = "";

    var req = {
        method: 'GET',
        url: "",
        headers: {
            'Content-Type': 'text/html'
        }
    };

    var service = {};

    function doApiCall(url, params, hasToken){
        var deferred = $q.defer();
        var i;
        console.log("hasToken: " + hasToken);

        if(hasToken) {
            getToken().then(function(data) {
                req.url = baseAthena + token;

                var keys = Object.keys(params);

                for(i = 0; i < keys.length; i++) {
                    req.url += i == 0 ? "?" : "&";
                    req.url += keys[i] + "=" + params[keys[i]];
                }

                $http(req)
                    .success(function(data){
                    deferred.resolve(data);
                    })
                    .error(function(data, status){
                    deferred.reject("error-do-api-call-" + status);
                    });
                }, function(msg) {
                    deferred.reject(msg);
                });
            }
        else {
            req.url = baseAthena;
            $http(req)
                .success(function(data){
                deferred.resolve(data);
                })
                .error(function(data, status){
                deferred.reject("error-do-api-call-" + status);
                });
        }

        return deferred.promise;
    }

    function getToken(){
        var deferred = $q.defer();

        if(token === "") {
            doApiCall(baseAthena, {}, false)
                .then(function(data) {
                    var parser = new DOMParser();

                    var doc = parser.parseFromString(data, 'text/html');
                    var form = doc.getElementsByTagName("form");
                    var url = form[0].attributes["action"].value;
                    var url2 = url.split("/");
                    token = url2[url2.length - 1];

                    deferred.resolve(token);
                }, function(msg) {
                    deferred.reject(msg);
                });
        } else {
            deferred.resolve(token);
        }
        return deferred.promise;
    }

    service.performCall = function(params) {
        var deferred = $q.defer();

        doApiCall(baseAthena, params, true)
            .then(function(data) {
                deferred.resolve(data);
            }, function(msg) {
                deferred.reject(msg);
            });

        return deferred.promise;
    };

    return service;

});
