angular.module('athenamobile.controllers')

.controller('LoginCtrl', function($scope, $location, $ionicPopup, $ionicLoading, UserService) {

	$scope.$on('finished-loading', function(event, args) {
		$scope.$broadcast('scroll.refreshComplete');
		$ionicLoading.hide();
	});

	function showPopup(title, message){
		$ionicPopup.alert({
			title: title,
			template: message
		});
	}

	function ionicLoad(message){
		$ionicLoading.show({
		template: message
		});
	}

	$scope.doLogin = function() {
		ionicLoad("Carregando...");

		console.log($scope.loginData);
		//console.log($scope.loginData.password);
		UserService.performLogin($scope.loginData.username, $scope.loginData.password).then(
			function(data) {
				console.log("Sucesso!");
				$location.path("/app/books");
			},
			function(error){
				console.log(error);
				showPopup("Erro", "Usuário e/ou senha incorretos!");
			}).finally(function(){
				$scope.$broadcast('finished-loading');
        });
	};
});
