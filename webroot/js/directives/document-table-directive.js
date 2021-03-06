/**
 * This method will call special user defined functions for each event.
 * They should be named like: eventnamelowerCamelField
 * ie. clickMyField, clickName, dblclickName
 * ...and so on.
 *
 * Alternatively, if these functions are not defined, a catch all
 * function will be used if defined. This function simply needs
 * to be called: "docTableAction" and it will have the event
 * object and element passed to it. From there, you can do whatever
 * you like. Get data from the element via jQuery, Angular, whatever.
 *
 * This allows user defined functions to be set outside this file
 * on the page somewhere and exposes the document table data to
 * the page, row by row, at the same time it handles events.
 *
 * NOTE: The "init" event will return an angular element.
 *
 * @see    http://docs.angularjs.org/api/angular.element
 * @param  {object} event   The event object
 * @param  {object} element The DOM object
 * @return {function}
 */
function actionDelegate(event, element) {
	var eventType = event.type;
	var docData = {};
	var key = '';
	if(eventType != 'init') {
		var tdElem = angular.element(element);
		var trElem = angular.element(element).parent('tr');
		if(trElem.scope() !== undefined) {
			docData = trElem.scope().row;
		}
		if(tdElem.scope() !== undefined) {
			key = tdElem.scope().key;
		}
	} else {
		if(element.$parent.row !== undefined) {
			docData = element.$parent.row;
		}
		if(element.key !== undefined) {
			key = element.key;
		}
	}

	// http://kevin.vanzonneveld.net
	var ucfirst = function(str) {
		str += '';
		var f = str.charAt(0).toUpperCase();
		return f + str.substr(1);
	}

	var eventFunctionString = eventType + ucfirst(key);
	if((eval('typeof(' + eventFunctionString + ')')) == 'function') {
		return eval(eventFunctionString + '(docData, key, event, element)');
	} else if(typeof docTableAction == 'function') {
		return docTableAction(docData, key, event, element)
	} else {
		return false;
	}
}

(function () {

	var documentTableDirective = angular.module("documentTableDirective", ['documentTableFilters']);

	// DIRECTIVES
	documentTableDirective
		/**
		 * The document table takes a JSON response and populates a table listing of results.
		 * Fields represented in columns can be sorted.
		 * The rows can be limited and the entire table can be paginated.
		 *
		 * @param  object $http
		 * @param  object $log
		 * @return
		 */
		.directive("doctable", function ($http, $log) {
			return {
				restrict: "E",
				replace: true,
				transclude: true,
				controller: 'DocumentTableController',
				template: '<div>' +
							'<form class="form-search" style="{{searchStyle}}">' +
								'<input ng-model="query" type="text" class="input-{{searchSize}} search-query" placeholder="{{searchPlaceholder}}">' +
							'</form>' +
							'<table class="table {{tableClass}}">' +
								'<caption ng-bind-html-unsafe="tableCaption">{{tableCaption}}</caption>' +
								'<thead>' +
									'<tr>' +
										'<th ng-repeat="key in columnKeys" class="heading-{{key}}"><a href="#" ng-click="sortByColumn($event, key)" class="column-sort-field">{{columns[key]}}</a></th>' +
									'</tr>' +
								'</thead>' +
								'<tr ng-repeat="row in tableData" ng-init="row[\'$dataClone\'] = dataClone(row)">' +
									'<td ng-repeat="key in columnKeys" ng-bind-html-unsafe="row[key] | fieldFormat:key:row" class="col-{{key}}" ng-init="initRow(this)" onMouseOver="actionDelegate(event, this)" onMouseOut="actionDelegate(event, this)" onClick="actionDelegate(event, this)" onDblClick="actionDelegate(event, this)">{{row[key] | fieldFormat:key:row}}</td>' +
								'</tr>' +
							'</table>' +
							'<div class="{{paginationClass}}">' +
								'<ul>' +
									'<li class="{{prevActiveState}} prevPage" style="{{prevPageStyle}};"><a href="#" ng-click="changePage($event, \'prev\')">{{prevPageLabel}}</a></li>' +
									'<li ng-repeat="i in pageRange" class="{{i.activeState}}"><a href="#" ng-click="changePage($event, i.pageNumber)">{{i.pageNumber}}</a></li>' +
									'<li class="{{nextActiveState}} nextPage" style="{{nextPageStyle}}"><a href="#" ng-click="changePage($event, \'next\')">{{nextPageLabel}}</a></li>' +
								'</ul>' +
							'</div>' +
							'</div>',
				link: function ($scope, element, attrs, DocumentTableController) {

					$scope.initRow = function(elem) {
						actionDelegate(new Event('init'), elem);
					}

					var serviceFactory = (attrs.factory !== undefined && attrs.factory != null && attrs.factory != '') ? attrs.factory:'documentTableServices';
					var $injector = angular.injector([serviceFactory]);

					// First, we need to reference the service factory name.
					$scope.serviceName = attrs.service;

					// A list of all fields returned by the server (to compare fake fields against real ones)
					$scope.realFields = new Array();

					$scope.actions = new Array();
					if(attrs.actions !== undefined) {
						$scope.actions = $scope.$eval(attrs.actions);
					}

					// Keeps a copy of the original data so when altering row[key] values, the original can be referenced again for other columns if they need the same data.
					$scope.dataClone = function(data) {
						return angular.copy(data);
					}

					// The attribute "columns" will determine which columns to show.
					// It should be formmated like: {columnKey: 'Column Name'}
					// Also set the columnKeys so we can loop in the template and get the proper value per row of data.
					$scope.columnKeys = new Array();
					if(attrs.columns !== undefined) {
						$scope.columns = $scope.$eval(attrs.columns);
						for(i in $scope.columns) {
							$scope.columnKeys.push(i);
						}
					}

					// Some options...
					$scope.tableClass = attrs.tableClass;
					$scope.tableCaption = attrs.tableCaption;
					$scope.enableSorting = attrs.sorting;

					// How many letters must be entered before a search is made
					$scope.searchMin = (attrs.searchMin !== undefined) ? parseInt(attrs.searchMin):3;

					$scope.searchPlaceholder = (attrs.searchPlaceholder !== undefined && attrs.searchPlaceholder != 'false') ? attrs.searchPlaceholder:'';

					// The search box (off by default)
					$scope.searchStyle = 'display: none;';
					if(attrs.search !== undefined) {
						switch(attrs.search) {
							case 'left':
								$scope.searchStyle = 'margin-bottom: 0px;';
							break;
							case 'right':
							default:
								$scope.searchStyle = 'text-align: right; margin-bottom: 0px;';
							break;
							case 'center':
							case 'centered':
							case 'middle':
								$scope.searchStyle = 'text-align: center; margin-bottom: 0px;';
							break;
							case 'hide':
							case 'false':
							case 'off':
							case 'no':
								$scope.searchStyle = 'display: none;';
							break;
						}
					}

					// How wide the search box is
					switch(attrs.searchSize) {
						case 'small':
							$scope.searchSize = 'small';
						break;
						default:
						case 'medium':
							$scope.searchSize = 'medium';
						break;
						case 'large':
							$scope.searchSize = 'large';
						break;
						case 'xlarge':
							$scope.searchSize = 'large';
						break;
					}

					// Results per page
					$scope.limit = (attrs.resultsPerPage !== undefined) ? parseInt(attrs.resultsPerPage):$scope.limit;

					// How many pages to show as links
					$scope.paginationShowPages = 5;
					$scope.paginationShowPages = (attrs.paginationShowPages !== undefined) ? parseInt(attrs.paginationShowPages):$scope.paginationShowPages;

					// Next/Prev button labels and visibility
					$scope.prevPageLabel = (attrs.paginationPrev === undefined || attrs.paginationPrev == '') ? 'Prev':attrs.paginationPrev;
					$scope.nextPageLabel = (attrs.paginationNext === undefined || attrs.paginationNext == '') ? 'Next':attrs.paginationNext;
					$scope.prevPageStyle = 'inline';
					$scope.nextPageStyle = 'inline';
					if(attrs.paginationPrev == 'false') {
						$scope.prevPageStyle = 'display: none;';
					}
					if(attrs.paginationNext == 'false') {
						$scope.nextPageStyle = 'display: none;';
					}

					// The pagination class (changes position, style etc.)
					$scope.paginationClass = 'pagination';
					switch(attrs.pagination) {
						case 'right':
						case 'left':
						case 'centered':
							$scope.paginationClass += ' pagination-' + attrs.pagination;
						break;
						case 'center':
							$scope.paginationClass += ' pagination-centered';
						break;
						case 'pager':
							$scope.paginationClass = 'pager';
						break;
						case 'pager wide':
						case 'pager-wide':
							$scope.paginationClass = 'pager';
							$scope.prevPageStyle = 'float: left;';
							$scope.nextPageStyle = 'float: right;';
							if($scope.prevPageLabel == 'false') {
							   $scope.prevPageStyle = 'display: none;';
							}
							if($scope.nextPageLabel == 'false') {
								$scope.nextPageStyle = 'display: none;';
							}
						break;
						case 'hide':
						case 'false':
						case 'off':
						case 'no':
							$scope.paginationClass = 'hide';
						break;
					}

					// A lock on navigation that gets set while waiting for a response from the server (otherwise, it gets confusing and jumps around).
					$scope.navLock = false;

					element.bind("keydown keypress", function(event) {
				        if(event.which === 13) {
				        	if($scope.query.length >= $scope.searchMin) {
					         	$scope.makeQuery($scope.query);
				         	}
				        }
				    });

					$scope.$watch('query', function(newValue, oldValue, $scope) {
						if(newValue === undefined) {
							return;
						}
						if(newValue.length >= $scope.searchMin || newValue != '') {
							$scope.makeQuery($scope.query);
						}

					});

					// A couple of methods to manipulate the document table...
					$scope.makeQuery = function(query) {
						$scope.navLock = true;
						$injector.get($scope.serviceName).get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.query}, function(u, getResponseHeaders) {
							if(u.success == true) {
								$scope.$apply(function(){
									var fields = new Array();
									if(u.documents[0] !== undefined) {
										for(i in u.documents[0]) {
											fields.push(i);
										}
										$scope.realFields = fields;
									}
									$scope.tableData = u.documents;
									$scope.totalPages = u.totalPages;

									// Release the lock after the search completes.
									$scope.navLock = false;
								});
							}
						});
					};

					$scope.changePage = function($event, page) {
						// No need to change the page in these cases
						if(page == $scope.page || (page == 'next' && $scope.page == $scope.totalPages) | (page == 'prev' && $scope.page == 1)) {
							return;
						}

						if(!$scope.navLock) {
							$scope.navLock = true;

							if(page == 'next' && $scope.page < $scope.totalPages) {
								$scope.page++;
							}

							if(page == 'prev' && $scope.page > 1) {
								$scope.page--;
							}

							if(page != 'prev' && page != 'next') {
								$scope.page = page;
							}

							$injector.get($scope.serviceName).get({page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
								if(u.success == true) {
									var fields = new Array();
									if(u.documents[0] !== undefined) {
										for(i in u.documents[0]) {
											fields.push(i);
										}
										$scope.realFields = fields;
									}
									$scope.tableData = u.documents;
									$scope.totalPages = u.totalPages;
								}
								// Regardless if the request was successful or returned anything or not, release the nav lock.
								$scope.navLock = false;
							});
						}
					};

					// TODO: this may be able to be set as a filter...the icons at least...
					$scope.sortByColumn = function($event, key) {
						if($scope.enableSorting == 'false') {
							return;
						}

						if(!$scope.navLock) {
							$scope.navLock = true;

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
							$injector.get($scope.serviceName).get({page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
								if(u.success == true) {
									var fields = new Array();
									if(u.documents[0] !== undefined) {
										for(i in u.documents[0]) {
											fields.push(i);
										}
										$scope.realFields = fields;
									}
									$scope.tableData = u.documents;
									$scope.totalPages = u.totalPages;
								}
								// Regardless if the request was successful or returned anything or not, release the nav lock.
								$scope.navLock = false;
							});
						}
					};

					// Watch a bunch of stuff...Starting with the table data.
					$scope.$watch('tableData', function(newValue, oldValue, $scope) {
						if(newValue === undefined || newValue === oldValue) {
							return;
						}

						if($scope.tableData[0] === undefined) {
							return;
						}

						// Remove sort functionality from "fake" columns.
						for(i in $scope.columnKeys) {
							var inArray = false;
							for(j in $scope.realFields) {
								if($scope.columnKeys[i] == $scope.realFields[j]) {
									inArray = true;
								}
							}
							if(!inArray) {
								$('.heading-' + $scope.columnKeys[i]).html($scope.columns[$scope.columnKeys[i]]);
							}
						}

						// Set an array of page numbers to appear in the pagination links.
						if($scope.paginationShowPages > 0) {
							var fromIndex = ($scope.page < $scope.paginationShowPages) ? 0:$scope.page - 1;
							// Always leave a way to get back...
							if(fromIndex == ($scope.totalPages - 1)) {
								fromIndex = fromIndex - 1;
							}
							var toIndex = fromIndex + $scope.paginationShowPages;
							$scope.pageRange = [];
							for(var i = 0; i < $scope.totalPages; i++) {
								$scope.pageRange.push({pageNumber: i+1, activeState: ($scope.page == (i+1)) ? 'disabled':''});
							}
							// ...Hold on there Kemosabe, we don't want every every page to be listed.
							$scope.pageRange = $scope.pageRange.slice(fromIndex, toIndex);
						}

						$scope.prevActiveState = ($scope.page == 1) ? 'disabled':'';
						$scope.nextActiveState = ($scope.page == $scope.totalPages) ? 'disabled':'';

						// Column names if not set in attributes - note: this will not be sorted...
						// So you really should specify the columnKey : columnName mapping.
						if($scope.columns === undefined) {
							$scope.columns = {};
							for(i in $scope.tableData[0]) {
								if(i != '$$hashKey') {
									// Make camelCase title case, ie. firstName becomes First Name
									var columnName = i.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
									// Maybe a little silly, but I like it this way for "email" in particular.
									if(columnName == 'Email') {
										columnName = 'E-mail';
									}
									$scope.columns[i] = columnName;
									$scope.columnKeys.push(i);
								}
							}
						}

					});

					// Watch to see if the service changed on the fly (and this should also initially load the data).
					$scope.$watch('serviceName', function(newValue, oldValue, scope) {
						if(newValue === undefined) {
							return;
						}

						$injector.get(newValue).get({territoryUrl: $scope.territoryUrl, page: $scope.page, order: $scope.order, limit: $scope.limit, q: $scope.q}, function(u, getResponseHeaders) {
							if(u.success == true) {
								var fields = new Array();
								if(u.documents[0] !== undefined) {
									for(i in u.documents[0]) {
										fields.push(i);
									}
									$scope.realFields = fields;
								}
								$scope.tableData = u.documents;
								$scope.totalPages = u.totalPages;
								$scope.$apply('tableData');
							}
						});
					});

				} // end link
			}; // end return
		}); // end directive...could chain another .directive() here if need be.

	// FILTERS
	angular.module('documentTableFilters', [])
		.filter('fieldFormat', function ($filter) {
			/**
			 * Allows fields to be formatted in a particular ways.
			 * For example, a "date" field may be returned as a Unix timestamp
			 * that needs to be formatted...Then there may be other fields that
			 * would be better off if they were truncated.
			 *
			 * @param string text The text for the item's field
			 * @param string fieldKey The field key name for the item
			 * @return
			*/
			return function (text, fieldKey, row) {
				if(fieldKey == 'created') {
					var dateFilter = $filter('date');
					return dateFilter(text);
				}

				return text;
			}
		}); // end pageFormat filter

}());