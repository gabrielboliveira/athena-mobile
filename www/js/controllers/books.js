angular.module('athenamobile.controllers')

.controller('BooksCtrl', function($scope, $ionicLoading, $ionicListDelegate, $ionicPopup, $ionicModal, BookService, UserService, UtilService) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.showBooks = false;

    $scope.$on('finished-loading', function(event, args) {
        $scope.$broadcast('scroll.refreshComplete');
        $ionicListDelegate.closeOptionButtons();
        $ionicLoading.hide();
        $scope.$broadcast('notify-books');
    });

    $scope.$on('notify-books', function(event, args) {
        $scope.showBooks = true;
    });

    function showPopup(title, message){
        $ionicPopup.alert({
            title: title,
            template: message
        });
    }

    $scope.books = [];

    function loadBooks(update) {

        BookService.getBooks().then(function(data){
                if(!update) $scope.books = data;
            },function(msg){
                showPopup("Erro", "Ocorreu um erro ao obter a lista de livros alugados.");
            }).finally(function(){
                $scope.$broadcast('finished-loading');
        });
    }

    function ionicLoad(message){
        $ionicLoading.show({
            template: message
        });
    }

    ionicLoad("Carregando...");

    loadBooks(false);

    $scope.carregar = function() {
        $ionicListDelegate.closeOptionButtons();
        loadBooks(true);
    };

    $scope.renovarTudo = function() {
        ionicLoad("Renovando todos os livros");

        BookService.renewAllBooks().then(function(data){
                showPopup("Renovado com sucesso!", "Todos os livros foram renovados com sucesso.");
            }, function(msg){
                showPopup("Erro", "Ocorreu um erro ao renovar todos os livros.");
            }).finally(function(){
                $scope.$broadcast('finished-loading');
        });
    };

    $scope.renovar = function(book) {
        ionicLoad("Renovando livro \"" + book.titulo + "\"");
        BookService.renewSingleBook(book).then(function(data){
                showPopup("Renovado com sucesso!", "Livro \"" + book.titulo + "\" renovado com sucesso.");
            }, function(msg){
                showPopup("Erro", "Ocorreu um erro ao renovar o livro \"" + book.titulo + "\.");
            }).finally(function(){
                $scope.$broadcast('finished-loading');
        });
    };
});
