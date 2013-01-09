Lithium Angular Goodies
=========

This library will provide a few Angular features (directives, etc.) for use with Lithium.
It will assume that you're using jQuery, Angular (of course), and it has a heavy bias toward
Twitter Bootstrap. Although, Twitter Bootstrap is not required, you'll likely want to use it.

## Document Table Directive

The document table directive is useful for index listings and pagination of documents.
Say you want to have a table that lists all the users in your application with the ability
to sort, search, and paginate. This will allow you to render the widget right on the page
with one line in your Lithium view template.

Before you can use it, you will need an action that will return a JSON response. That shouldn't be
any real challenge in Lithium, but you'll want to just quickly double check that you are returning
all of the fields that the directive is looking for. See the ```document-table-services.js``` file
for how that should be formatted. You'll need page numbers, limits, search queries, etc.

You're going to need Angular UI and you'll also want to include a few scripts from li3_angular_goodies
of course. So your view template may look like this:

```
<?=$this->html->script(array(
	'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js',
	'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular-resource.min.js',
	'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular-sanitize.min.js',
	'/li3_angular_goodies/js/services/document-table-services.js',
	'/li3_angular_goodies/js/directives/document-table-directive.js',
	'/li3_angular_goodies/js/angular-ui/build/angular-ui.min.js',
	'/li3_angular_goodies/js/controllers/document-table-controller.js',
), array('inline' => false)); ?>
<?=$this->html->style(array(
	'/li3_angular_goodies/js/angular-ui/build/angular-ui.min.css'
), array('inline' => false)); ?>

<doctable factory="documentTableServices" service="UsersIndex" results-per-page="25"></doctable>

<script type="text/javascript">
// Bootstrap Angular manually.
angular.element(document).ready(function() {
	var myApp = angular.module('myApp', ['documentTableDirective', 'ui']);

	// Bootstrap the application.
	angular.bootstrap(document, ['myApp']);
});

function docTableAction(docData, field, event, element) {
	// event.type
	// docData = element.$parent.row; <-- also available here
	// field = element.key; <-- also available here
}
</script>
```

__Attributes for doctable__

First, you're going to need to specify a service attribute. This will be
the name of a service factory in the ```documentTableServices``` module.
See document-table-services.js for more. You can extend or override this service factory.
Alternatively, you can also specify an optional ```factory``` attribute that will $inject
a different factory so you don't need to overwrite any code.

__Pagination__  
pagination='pager' : Rounded pager style buttons  
pagination='pager wide' : Rounded pager style buttons with next/prev at opposite ends left/right  
pagination='left' : Default pagination style with the pagination flush left (default style)  
pagination='center' : Same thing, centered...right is of courser flush right

pagination-prev='Go Back' : Serves as the prev button label ("Prev" by default)  
pagination-prev='false' : Hides it

pagination-show-pages='0' : Won't show the pagination number links  
pagination-show-pages='3' : Will only show three numbers to jump to specific pages  
(by default, 5 pages are shown)

__Sorting & Searching__  
sorting="true" : Allows columns to be sorted (on by deafult)  
sorting="false" : Disables column sorting  

search="true" : Any value here enables searching, the search box is in the top right by default above the form  
search="left" : Puts the search box in the left  
search="center" : Centers the search  
search="false" : Disables the search  
(by default, search is disabled)

search-size="large" : How wide the search box is, using Twitter Bootstrap style names, options are; small, medium, large, xlarge  
(by default, it is medium)

search-min="3" : How many letters must be entered before making a request to the server to search/filter
(by default, 3 letters are needed)

search-placeholder="search..." : Puts placeholder text in the search box

__Table Options__   
This directive really caters to Twitter Bootstrap's styles. So you can add any of the table classes from Twitter Bootstrap
to the table rendered from this directive. Of course, you can add any other class name(s) that you want.

table-class="table-striped" : Applies classes to the table element in addition to a "table" class which is always present

table-caption="Some text..." : Applies a table caption (can be HTML)

columns="{firstName:'First Name'}" : Allows the columns to be adjusted, which fields to show and what the label should be
(must be an object, by default all columns will be visible and their labels will be the field names, though camel case gets converted)

columns="{$actions:'Actions'"} : A special field name...This will allow a filter to change the field value to display links, etc.

__Actions__   
You'll likely want to have actions for each row of data. Be it links in a column to view, edit, or remove a document...Or actions
for specific events like clicking on a title or mouse over/out events, etc. This is taken care of autmatically and there's an event
dispatcher, of the sorts, that you can take advantage of.

By defining a ```docTableAction(docData, field, event, element)``` function on your page somewhere you can capture all events.
Note: in the case of the "init" event, this element will be one of an ```angular.element()``` and not the actual DOM element.
In all other events (normal JavaScript events applicable to a td element) the DOM element will be passed instead. Of course you can
easily convert that to an angular element if you like, by calling ```angular.element(element)```, but the idea was to leave it as flexible
as possible. Instead, you may wish to use jQuery and call ```$(element)``` instead of using Angular. Since the "init" event was not an inherit
JavaScript event it's not passing the DOM element.

The "init" event could be quite useful if you wanted to modify the contents of the table cell/row for example. All other events are useful
for mouse events on each cell. Of course the field name and document data for each row is available within the element for the "init" event.
See the example above for how to access those.

The other way to handle actions is by writing special functions on your page for specific mouse events. For example:
```
function dblclickUrl(data, field, event, element) {
	// data = The document data for the current table cell's row
	// field = The field for the current table cell
	// event = The JavaScript event object (will be a mouse event)
	// element = The table cell's DOM element
}
```

Note the name of this function. It starts with the mouse event name and then appends the camel cased field name. Instead, it could
easily have been ```function clickUrl()``` or ```function clickName()``` or whatever your field name is. This is just here for your convenience.
If you used the ```docTableAction()``` function instead, you would have to check the ```event.type``` and the ```field``` document key to see if it
was the event type and data you were after first. So writing a function like ```clickDate(data, field, event, element)``` is shorter for you.

__Fake Fields__   
You can include "fake" fields or columns in your table. When you go to define the optional "columns" attribute on the doctable, you can enter in
any arbitrary key value and label for a column. For example:
```
<doctable columns="{name: 'User Name', email: 'E-mail', actions: 'Actions'}" service="UsersIndex" results-per-page="25"></doctable>
```

Now, you'll have an empty column title "Actions" in your table. However, like every field, it responds to all of the same events. So you could
take advantage of the "init" event and add links to view, edit, delete, or whatever. Remember you have the document data for the current row
during "init" as well.

How? You aren't going to be manipulating the DOM in this case, you're going to be manipulating the angular directive data. So if you wanted to put
some text in this fake "Actions" column, you would do:
```
function initActions(data, field, event, element) {
	element.row[field] = '<a href="' + data.url + '">View</a>';
}
```

For each row you would now have a link "View" that went to whatever the URL was for the document's "url" field appear under each "Actions" column.
You can include, almost, any HTML and/or JavaScript that you like here. It will be inserted into the directive's template.

Note: There is a little gotchya here too. If you were to say, alter a certain column and then in another column go to access the original value...
Well, it would be lost and you'd only be able to access your alteration. A real world example is if you wanted to link a URL value (like the example
above) and also wanted to show that URL in another column truncated to save space. Your link out there would be the truncated URL. To remedy this,
a ```$dataClone``` has object has been created within each row that holds a copy of the original row object. So for example:
```
function initUrl(data, field, event, element) {
	element.row[field] = '<small style="word-wrap: break-word;">' + element.row['$dataClone'][field] + '</small>';
}
function initActions(data, field, event, element) {
	element.row[field] = '<a href="' + element.row['$dataClone']['url']+ '">View</a>';
}
```

If not for the $dataClone, you would have a broken URL because it would be using the altered value which is now all sorts of HTML. Even if you were
to alter the string value by using substring() or something, you would still have issues. So this way you can always get the original data.

__Complex Fields__   
The ```$dataClone``` object is also handy for complex fields that the directive won't be able to simply treat as a string or date object. For example,
let's say you have an object. The document table can't print these out, it'll just show [object Object] in the column. Note that arrays will actually
print out as a comma separated string. Anyway, objects won't, but that doesn't mean you still can't manipulate the value for the column to display
something else instead. This is very similar to the example above. You can use the ```$dataClone``` field in each row to format the data however
you need for the column.