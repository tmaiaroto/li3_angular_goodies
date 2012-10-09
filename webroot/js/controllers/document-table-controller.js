/**
 * The DocumentTableController.
 *
 * @param {object} $scope
 * @param {object} Organization The Organization service gets data from JSON endpoints
 */
function DocumentTableController($scope, OrganizationMembers) {

	angular.extend($scope, {
		'totalPages': 0,
		'order': 'created,desc',
		'page': 1,
		'limit': 1,
		'q': ''
	});

	$scope.makeQuery = function(query) {
		if(query.length >= $scope.searchMin || query == '') {
			$scope.q = query;
		}
	};

	$scope.changePage = function($event, page) {
		// No need to change the page in these cases
		if(page == $scope.page || (page == 'next' && $scope.page == $scope.totalPages) | (page == 'prev' && $scope.page == 1)) {
			return;
		}

		if(page == 'next' && $scope.page < $scope.totalPages) {
			$scope.page++;
		}

		if(page == 'prev' && $scope.page > 1) {
			$scope.page--;
		}

		if(page != 'prev' && page != 'next') {
			$scope.page = page;
		}

		OrganizationMembers.get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
			var response = u.response;
			if(response.success == true) {
				$scope.tableData = response.result;
				$scope.totalPages = response.totalPages;
			}
		});
	};

	// TODO: this may be able to be set as a filter...the icons at least...
	$scope.sortByColumn = function($event, key) {
		if($scope.enableSorting == 'false') {
			return;
		}

		var direction = 'desc';

		$('.column-sort-field i').remove();
		if($($event.target).hasClass('sort-desc')) {
			$($event.target).removeClass('sort-desc');
			$($event.target).addClass('sort-asc');
			$($event.target).append(' <i class="icon-chevron-down"></i>');
			direction = 'asc';
		} else {
			$($event.target).removeClass('sort-asc');
			$($event.target).addClass('sort-desc');
			$($event.target).append(' <i class="icon-chevron-up"></i>');
			direction = 'desc';
		}

		$scope.order = key + ',' + direction;
		OrganizationMembers.get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
			var response = u.response;
			if(response.success == true) {
				$scope.tableData = response.result;
				$scope.totalPages = response.totalPages;
			}
		});
  	};

  	$scope.$watch('q', function(newValue, oldValue, scope) {
  		if(newValue === undefined) {
			return;
		}
		OrganizationMembers.get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
			var response = u.response;
		  	if(response.success == true) {
				$scope.tableData = response.result;
				$scope.totalPages = response.totalPages;
			}
	  	});
  	});

	$scope.$watch('territoryUrl', function(newValue, oldValue, scope) {
		if(newValue === undefined) {
			return;
		}
		OrganizationMembers.get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
			var response = u.response;
		  	if(response.success == true) {
				$scope.tableData = response.result;
				$scope.totalPages = response.totalPages;
			}
	  	});
  	});

}