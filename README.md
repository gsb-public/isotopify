# isotopify

## Methods

```
(function ($) {

  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {...}
  };

  Drupal.isotopify = Drupal.isotopify || {};

  Drupal.isotopify.convertDateObj = function(date) {...}

  Drupal.isotopify.addAdditionalSorts = function($select, sortID) {...}

  Drupal.isotopify.update = function(uniqueID) {...}

  Drupal.isotopify.setFilter = Drupal.isotopify.filterSet || {};

  Drupal.isotopify.setFilter.checkboxes = function(uniqueID, filterID, choices) {...}

  Drupal.isotopify.setFilter.daterange = function(uniqueID, beginDate, endDate) {...}

  Drupal.isotopify.setFilter.search = function(uniqueID, text, results) {...}

  Drupal.isotopify.pill = Drupal.isotopify.pill || {};

  Drupal.isotopify.pill.make = function(uniqueID, title, key, filterID, type) {...}

  Drupal.isotopify.pill.clearCheckbox = function() {...}

})(jQuery);
```
