Lithium Angular Goodies
=========

This library will provide a few Angular features (directives, etc.) for use with Lithium.

__Document Table Directive__

The document table directive is useful for index listings and pagination of documents.
Say you want to have a table that lists all the users in your application with the ability
to sort, search, and paginate. This will allow you to render the widget right on the page
with one line in your Lithium view template.

```
<doctable service="UsersIndex" results-per-page="25"></doctable>
```

__Attributes for doctable__

First, you're going to need to specify a service attribute. This will be
the name of a service factory in the ```documentTableServices``` module.
See document-table-services.js for more.  
You should probably extend, override, or use this as a guide.

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
table-class="table-striped" : Applies classes to the table element in addition to a "table" class which is always present

table-caption="Some text..." : Applies a table caption (can be HTML)

columns="{firstName:'First Name'}" : Allows the columns to be adjusted, which fields to show and what the label should be  
(must be an object, by default all columns will be visible and their labels will be the field names, though camel case gets converted)

columns="{$actions:'Actions'"} : A special field name...This will allow a filter to change the field value to display links, etc.