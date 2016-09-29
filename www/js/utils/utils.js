angular.module('athenamobile.utils', [])

.service('UtilService', function($ionicModal, $q){

    var services = {};

    var modals = [];

    services.loadModal = function(nameOfScope, templateUrl, _scope) {
        var deferred = $q.defer();

        // Create the List products modal that we will use later
        $ionicModal.fromTemplateUrl(templateUrl, {
            animation: 'none'
        }).then(function (modal) {
            modals.push(modal);
            _scope[nameOfScope] = modal;
            deferred.resolve();
        });

        return deferred.promise;
    };

    services.hideCurrentModal = function(){
        var current = modals.pop();
        current.remove();
    };

    return services;
});
