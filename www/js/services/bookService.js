angular.module('athenamobile.services')

.factory('BookService', function($q, ApiService, UserService) {

	var services = {};

	var books = [];

	function buildBooks(titulo, doc_number, item_sequence, index, strdata){
		var book = {
			titulo: titulo,
			doc_number: doc_number,
			item_sequence: item_sequence,
			index: index,
			data: strdata,
		};
		return book;
	}

	var renewAllBooksParams = {
		func: "bor-renew-all",
		adm_library: "UEP50"
	};

	var renewSingleBookParams = {
		func: "BOR-LOAN-RENEW",
		doc_number: 0,
		item_sequence: 0,
		adm_library: "UEP50"
	};

	var retrieveBooksParams = {
		func: "bor-loan",
		adm_library: "UEP50"
	};

	function performBookCall() {
		var deferred = $q.defer();

		ApiService.performCall(retrieveBooksParams).then(
			function(data) {
				// verifica se tem livros alugados
				if (data.indexOf("<!-- filename: bor-loan-no-loan-->") == -1) {
					var parser = new DOMParser();

			        var doc = parser.parseFromString(data, 'text/html');
			        var tables = doc.getElementsByTagName("table");

					var lastTable = tables[tables.length - 1];

					var rows = lastTable.getElementsByTagName("tr");

					var i;

				    for(i = 1; i < rows.length; i++)
				    {
						var row = rows[i];

						var columns = row.getElementsByTagName("td");
						var titulo = columns[3].innerHTML.substr(0, columns[3].innerHTML.length - 2);

						var strdata = columns[5].innerHTML.substr(0,8);

						var column = columns[0];
						var attr = column.getElementsByTagName("a")[0].attributes["href"].value.split("&");

						var doc_number = attr[1].substr(attr[1].indexOf("=") + 1, attr[1].length);
						var item_sequence = attr[2].substr(attr[2].indexOf("=") + 1, attr[2].length);
						var index = attr[3].substr(attr[3].indexOf("=") + 1, attr[3].length);

						var atrib = false, j;
						for(j = 0; j < books.length && !atrib; j++) {
							if(books[j].doc_number == doc_number) {
								atrib = true;
								books[j].titulo = titulo;
								books[j].data = strdata;
							}
						}
						if(!atrib) {
							books.push(buildBooks(titulo, doc_number, item_sequence, index, strdata));
                        }
                    }
				}
				deferred.resolve(books);
			}, function(){
				deferred.reject("error-retrieve-all-books");
			}
		);

		return deferred.promise;
	}

	function retrieveAllBooks() {
		var deferred = $q.defer();
		if(!UserService.getLoginStatus()){
			UserService.performLogin(UserService.getUsername(), UserService.getPassword()).then(
				function(data) {
					performBookCall().then(
						function(data){
							deferred.resolve(data);
						},function(){
							deferred.reject("error-retrieve-all-books");
						}
					);
				},
				function(error){
					deferred.reject(error);
				});
		} else {
			performBookCall().then(
				function(data){
					deferred.resolve(data);
				},function(){
					deferred.reject("error-retrieve-all-books");
				}
			);
		}

	    return deferred.promise;
	}

	// TODO: retorna o que estiver em cache, e faço um callback pra atualizar do servidor
	// 			quando terminar a callback, o model dá um broadcast
	services.getBooks = function() {
		var deferred = $q.defer();

		retrieveAllBooks().then(function(data){
			deferred.resolve(data);
		},function(msg){
			deferred.reject(msg);
		});

		return deferred.promise;
	};

	services.renewAllBooks = function(){
		var deferred = $q.defer();

		ApiService.performCall(renewAllBooksParams).then(function(){
			services.getBooks().then(function(data){
				deferred.resolve(data);
			},function(msg){
				deferred.reject(msg);
			});
		},function(msg){
			deferred.reject(msg);
		});

		return deferred.promise;
	};

	services.renewSingleBook = function(book){
		var deferred = $q.defer();

		renewSingleBookParams.doc_number = book.doc_number;
		renewSingleBookParams.item_sequence = book.item_sequence;

		ApiService.performCall(renewSingleBookParams).then(function(){
			services.getBooks().then(function(data){
				deferred.resolve(data);
			},function(msg){
				deferred.reject(msg);
			});
		},function(msg){
			deferred.reject(msg);
		});

		return deferred.promise;
	};

  	return services;
});
