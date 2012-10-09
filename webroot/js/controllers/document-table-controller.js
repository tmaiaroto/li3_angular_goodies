/**
 * The DocumentTableController.
 *
 * This controller allows directives using it to communicate with each other.
 * There may be a separate search directive for example...But for now, search
 * is included with the document table directive.
 *
 * @param {object} $scope
 */
function DocumentTableController($scope) {

	angular.extend($scope, {
		'totalPages': 0,
		'order': 'created,desc',
		'page': 1,
		'limit': 1,
		'q': ''
	});

}