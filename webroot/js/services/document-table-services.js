/**
 * Extend this to define your own services for document tables.
 * The result from the server should be a JSON response.
 *
 * It should be formatted like so:
 * {
 *  success: true,
 * 	result: [
 *		{
 *		field: value
 *		field2: value
 *		someDateField: 1349652083
 *		},
 *		{ ... }
 *	],
 *	total: 3,
 *	page: 1,
 *	limit: 25,
 *	totalPages: 1,
 *	order: {
 *		lastName: asc
 *	}
 *	q: ''
 * }
 *
 * A "succcess" field needs to be true or false. This can be set false by the server side code
 * if there is some sort of problem that should prevent the document table from updating.
 * However, this field is optional and if not present, the controller will assume everything is ok.
 *
 * Then there needs to be a "total" for total number of results.
 * A "page" for the current page.
 * A "limit" for the results per page.
 * A "totalPages" for the total number of pages.
 * An "order" for the ordering which is just an object {field:direction} format.
 * However, the order param gets passed as: ?order=field,direction so the server side
 * code should be aware of that and format it how it needs for the database query.
 * Last, a "q" field for the search query.
 *
 * Any other fields are completely optional and should not interfere.
 */
angular.module('documentTableServices', ['ngResource']).
	factory('BlogPostIndex', ['$resource', '$http',
		function($resource, $http) {
            return $resource('/admin/plugin/li3b_blog/posts.json', {}, {
				get: {
					method: 'GET'
				}
			});
		}
    ]);
    // .factory() again....