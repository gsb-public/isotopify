(function ($) {
  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {
      $('.isotopify').each(function(index) {
        $this = $(this);
        var uniqueID = $this.attr('id');
        var settings = Drupal.settings.isotopify[uniqueID];
        settings.filter = settings.filter || {};
        settings.filter.checkboxes = settings.filter.checkboxes || {};
        var $isotopifyFilters = $this.find('.isotopify-filters');
        var $isotopifyFilterCheckboxes = $isotopifyFilters.find('select.isotopify-filter-checkboxes');
        var $isotopifyFilterDateRange = $isotopifyFilters.find('.isotopify-filter-daterange');
        var $isotopifySort = $isotopifyFilters.find('.isotopify-filter-sort');
        var $isotopeWrapper = $this.find('.isotopify-wrapper');

        // Define default properties for isotope
        isotopeProperties = {
          itemSelector: settings.itemSelector,
          layoutMode: 'fitRows'
        }

        /**
         * Load Lazy Load if needed
         */
        if (typeof settings.lazyLoad !== 'undefined' && settings.lazyLoad) {
          var $imgs = $isotopeWrapper.find('img');

          $imgs.lazyload({
            failure_limit: Math.max($imgs.length - 1, 0)
          });
        }

        /**
         * Handle Sorting
         */
        if ($isotopifySort.length) {
          var sortData = {};
          $isotopifySort.find('option').each(function() {
            $option = $(this);
            var key = $option.val();
            sortData[key] = '[data-sort-' + key + ']';
          });

          isotopeProperties.getSortData = sortData;

          $isotopifySort.change(function() {
            $sort = $(this);
            value = $sort.val();
            Drupal.settings.isotopify[uniqueID].grid.isotope({
              sortBy: value
            })
          });
        }

        // Enable isotope
        Drupal.settings.isotopify[uniqueID].grid = $isotopeWrapper.isotope(isotopeProperties);

        /**
         * Handle scroll event for lazy load.
         */
        if (typeof settings.lazyLoad !== 'undefined' && settings.lazyLoad) {
          // Add scroll event for lazyload
          Drupal.settings.isotopify[uniqueID].grid.on('layoutComplete', function () {
            $(window).trigger("scroll");
          });
        }

        /**
         * Handle Checkboxes
         */
        if ($isotopifyFilterCheckboxes.length) {
          // Remove unused filter options. This needs to ru
          $isotopifyFilterCheckboxes.each(function() {
            var $select = $(this);
            filterID = $select.data('isotopify-id');
            $select.find('option').each(function() {
              $option = $(this);
              if (!$isotopeWrapper.find('.filter--' + filterID + '--' + $option.val()).length) {
                $option.remove();
              }
            });

            var multipleSelectOptions = {
              width: 180,
              maxHeight: 300,
              selectAll: false,
              minimumCountSelected: 0
            }

            if ($select.hasClass('isotopify-multiple')) {
              multipleSelectOptions.multiple = true;
              multipleSelectOptions.multipleWidth = 220;
            }

            // Add the multipleSelect library
            $select.multipleSelect(multipleSelectOptions);

            var $applyButton = $('<button class="checkbox-apply">Apply</button>').click(function(e) {
              e.preventDefault();
              var choices = $select.multipleSelect("getSelects");
              var isotopifyID = $select.data('isotopify-id');
              settings.filter.checkboxes[isotopifyID] = choices;

              // Hide the dropdown.
              $select.parent().find('button.ms-choice').click();

              Drupal.isotopify.update(uniqueID);
            });

            var $clearAllButton = $('<button class="checkbox-clear-all">Clear All</button>').click(function(e) {
              e.preventDefault();
              $select.multipleSelect('uncheckAll');
            });

            var $dropdown = $select.next().find('.ms-drop');
            $dropdown.append($applyButton);
            $dropdown.append($clearAllButton);
          });
        }

        /**
         * Handle Search Filter
         */
        var $isotopifySearchInput = $isotopifyFilters.find('[name=search]');

        if ($isotopifySearchInput.length) {
          var $isotopifySearchButton = $isotopifyFilters.find('input.form-submit');
          Drupal.settings.isotopify[uniqueID].searchResults = '';

          $isotopifySearchButton.click(function(e) {
            e.preventDefault();

            var text = $isotopifySearchInput.val();

            if (text.length) {
              $.getJSON(settings.callback + "/" + text, function(data) {
                Drupal.settings.isotopify[uniqueID].searchResults = data;
                Drupal.isotopify.update(uniqueID);
              });
            }
            else {
              Drupal.settings.isotopify[uniqueID].searchResults = '';
              Drupal.isotopify.update(uniqueID);
            }
          });
        }

        /**
         * Handle daterange
         */
        settings.beginDateRange = '';
        settings.endDateRange = '';
        if ($isotopifyFilterDateRange.length) {

          // Add the button to the page.
          title = $isotopifyFilterDateRange.data('title');
          var $isotopifyFilterDateRangeButton = $('<button class="isotopify-filter-daterange-button">' + title + '</button>');
          $isotopifyFilterDateRange.append($isotopifyFilterDateRangeButton);

          $isotopifyFilterDateRangeButton.click(function(e) {
            e.preventDefault();
          });

          $isotopifyFilterDateRange.find('.form-type-textfield').hide();

          var minDate = '2015-10-01';
          var maxDate = '2016-10-01';
          $isotopifyFilterDateRangeButton.dateRangePicker({
            startDate: minDate,
            endDate: maxDate,
            customTopBar: 'Select a date range',
            hoveringTooltip: false,
            setValue: function(s) {
            }
          }).bind('datepicker-apply',function(event,obj) {
            if (obj.value == '1969-12-31 to 1969-12-31' || obj.date1 == 'Invalid Date' || obj.date2 == 'Invalid Date') {
              //settings.beginDateRange = '';
              //settings.endDateRange = '';
              $isotopifyFilterDateRangeButton.data('dateRangePicker').clear();
            }
            else {
              /* This event will be triggered when user clicks on the apply button */
              var date1 = new Date(obj.date1);
              var date1Year = date1.getFullYear();
              var date1YearStr = date1Year.toString();
              var date1Month = date1.getMonth() + 1;
              var date1MonthStr = date1Month.toString();
              if (date1MonthStr.length == 1) {
                date1MonthStr = '0' + date1MonthStr;
              }
              var date1Day = date1.getDate();
              var date1DayStr = date1Day.toString();
              if (date1DayStr.length == 1) {
                date1DayStr = '0' + date1DayStr;
              }
              settings.beginDateRange = date1YearStr + date1MonthStr + date1DayStr;

              var date2 = new Date(obj.date2);
              var date2Year = date2.getFullYear();
              var date2YearStr = date2Year.toString();
              var date2Month = date2.getMonth() + 1;
              var date2MonthStr = date2Month.toString();
              if (date2MonthStr.length == 1) {
                date2MonthStr = '0' + date2MonthStr;
              }
              var date2Day = date2.getDate();
              var date2DayStr = date2Day.toString();
              if (date2DayStr.length == 1) {
                date2DayStr = '0' + date2DayStr;
              }

              settings.endDateRange = date2YearStr + date2MonthStr + date2DayStr;
            }

            Drupal.isotopify.update(uniqueID);
          });
        }

      });
    }
  };

  Drupal.isotopify = Drupal.isotopify || {};

  /**
   * Filter Isotope
   *
   * @param uniqueID
   */
  Drupal.isotopify.update = function(uniqueID) {
    Drupal.settings.isotopify[uniqueID].grid.isotope({filter: function() {
      $this = $(this);
      var settings = Drupal.settings.isotopify[uniqueID];
      /**
       * Filter Checkboxes
       */
      var checkboxTest = true;

      // Loop through all the selections
      for (var id in settings.filter.checkboxes) {

        // If the filter is empty skip it.
        if (!settings.filter.checkboxes[id].length) {
          continue;
        }

        // Test the values in a single dropdown. This is an OR test. If any one
        // of them work we can skip testing the rest.
        var singleDropdownTest = false;
        for (var key in settings.filter.checkboxes[id]) {
          if ($this.hasClass('filter--' + id + '--' + settings.filter.checkboxes[id][key])) {
            singleDropdownTest = true;
            break;
          }
        }

        checkboxTest = checkboxTest && singleDropdownTest;
      }


      /**
       * Filter date range
       */
      daterangeTest = true;
      if (settings.beginDateRange.length && settings.endDateRange.length) {
        if ($this.data('daterange') >= settings.beginDateRange && $this.data('daterange') <= settings.endDateRange) {
          daterangeTest = true;
        }
        else {
          daterangeTest = false;
        }
      }

      /**
       * Filter search
       */
      var nid = $this.data('nid');
      searchTest = true;
      if (Drupal.settings.isotopify[uniqueID].searchResults.length && $.inArray(nid.toString(), Drupal.settings.isotopify[uniqueID].searchResults) == -1) {
        searchTest = false;
      }

      // Return the result of those tests.
      return checkboxTest && daterangeTest && searchTest;
    }});
  }
})(jQuery);
