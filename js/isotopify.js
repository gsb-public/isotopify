(function ($) {
  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {
      $('.isotopify').each(function(index) {
        $this = $(this);
        var uniqueID = $this.attr('id');
        var settings = Drupal.settings.isotopify[uniqueID];
        settings.filter = settings.filter || {};
        settings.filter.checkboxes = settings.filter.checkboxes || {};
        settings.filter.daterange = settings.filter.daterange || {};
        settings.filter.search = settings.filter.search || {};
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

            // Use the label for the placeholder and hide it.
            var $label = $select.prev('label');
            $label.hide();

            var multipleSelectOptions = {
              width: 180,
              maxHeight: 300,
              selectAll: false,
              minimumCountSelected: 0,
              countSelected: $label.text(),
              placeholder: $label.text()
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
              Drupal.isotopify.setFilter.checkboxes(uniqueID, isotopifyID, choices);
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
          settings.filter.search.results = null;

          $isotopifySearchButton.click(function(e) {
            e.preventDefault();

            var text = $isotopifySearchInput.val();

            if (text.length) {
              settings.filter.search.term = text;
              $.getJSON(settings.callback + "/" + text, function(data) {
                Drupal.settings.isotopify[uniqueID].filter.search.results = data;
                Drupal.isotopify.update(uniqueID);
              });
            }
            else {
              settings.filter.search.results = null;
              Drupal.isotopify.update(uniqueID);
            }
          });
        }

        /**
         * Handle daterange
         */
        settings.filter.daterange.begin = '';
        settings.filter.daterange.end = '';
        if ($isotopifyFilterDateRange.length) {

          // Add the button to the page.
          title = $isotopifyFilterDateRange.data('title');
          var $isotopifyFilterDateRangeButton = $('<button class="isotopify-filter-daterange-button">' + title + '</button>');
          $isotopifyFilterDateRange.append($isotopifyFilterDateRangeButton);

          $isotopifyFilterDateRangeButton.click(function(e) {
            e.preventDefault();
          });

          $isotopifyFilterDateRange.find('.form-type-textfield').hide();

          // Get the current range
          var minDate = null;
          var maxDate = null;
          $isotopeWrapper.find('.isotopify-item').each(function() {
            var $item = $(this);
            if ($item.data('daterange') != 19691231) {
              if (minDate == null || parseInt($item.data('daterange')) < minDate) {
                minDate = parseInt($item.data('daterange'));
              }

              if (maxDate == null || parseInt($item.data('daterange')) > maxDate) {
                maxDate = parseInt($item.data('daterange'));
              }
            }
          });

          var minDateFormatted = minDate.toString().substr(0, 4) + '-' + minDate.toString().substr(4, 2) + '-' + minDate.toString().substr(6, 2);
          var minDateObj = new Date(minDateFormatted);
          minDateObj.setMonth(minDateObj.getMonth()-1);
          minDate = Drupal.isotopify.convertDateObj(minDateObj);
          minDateFormatted = minDate.substr(0, 4) + '-' + minDate.substr(4, 2) + '-' + minDate.substr(6, 2);

          var maxDateFormatted = maxDate.toString().substr(0, 4) + '-' + maxDate.toString().substr(4, 2) + '-' + maxDate.toString().substr(6, 2);
          var maxDateObj = new Date(maxDateFormatted);
          maxDateObj.setMonth(maxDateObj.getMonth()+1);
          maxDate = Drupal.isotopify.convertDateObj(maxDateObj);
          maxDateFormatted = maxDate.substr(0, 4) + '-' + maxDate.substr(4, 2) + '-' + maxDate.substr(6, 2);

          $isotopifyFilterDateRangeButton.dateRangePicker({
            startDate: minDateFormatted,
            endDate: maxDateFormatted,
            hoveringTooltip: false,
            setValue: function(s) {
            }
          }).bind('datepicker-apply',function(event,obj) {
            if (obj.value == '1969-12-31 to 1969-12-31' || obj.date1 == 'Invalid Date' || obj.date2 == 'Invalid Date') {
              Drupal.isotopify.setFilter.daterange(uniqueID, '', '');
            }
            else {
              /* This event will be triggered when user clicks on the apply button */
              var date1 = new Date(obj.date1);
              var beginDateRange = Drupal.isotopify.convertDateObj(date1);
              var date2 = new Date(obj.date2);
              var endDateRange = Drupal.isotopify.convertDateObj(date2);

              Drupal.isotopify.setFilter.daterange(uniqueID, beginDateRange, endDateRange);
            }

            Drupal.isotopify.update(uniqueID);
          }).click(function(e) { // Close picker if the button is clicked when it's opened
            e.preventDefault();
            if ($(this).hasClass('open')) {
              $(this).data('dateRangePicker').close();
            }
          }).bind('datepicker-opened',function() { // Add classes when the picker is opened
            $(this).removeClass('closed');
            $(this).addClass('open');
          }).bind('datepicker-closed',function() { // Add classes when the picker is closed
            $(this).removeClass('open');
            $(this).addClass('closed');
          });

          // Move the close button.
          var $topBar = $('.date-picker-wrapper .drp_top-bar').detach();
          $topBar.find('.apply-btn').val(Drupal.t('Done'));
          $topBar.find('.default-top').hide();
          $('.date-picker-wrapper').append($topBar);

        }
      });
    }
  };

  Drupal.isotopify = Drupal.isotopify || {};

  Drupal.isotopify.convertDateObj = function(date) {
    var dateYear = date.getFullYear();
    var dateYearStr = dateYear.toString();
    var dateMonth = date.getMonth() + 1;
    var dateMonthStr = dateMonth.toString();
    if (dateMonthStr.length == 1) {
      dateMonthStr = '0' + dateMonthStr;
    }
    var dateDay = date.getDate();
    var dateDayStr = dateDay.toString();
    if (dateDayStr.length == 1) {
      dateDayStr = '0' + dateDayStr;
    }
    return dateYearStr + dateMonthStr + dateDayStr;
  }

  /**
   * Filter Isotope
   *
   * @param uniqueID
   */
  Drupal.isotopify.update = function(uniqueID) {
    var settings = Drupal.settings.isotopify[uniqueID];

    /**
     * Update pills
     */
    $pills = $('#isotopify .pills');

    if (!$pills.length) {
      $pills = $('<div class="pills"></div>');
      $('#isotopify').prepend($pills);
    }

    // Clear out the pills.
    $pills.empty();
    var hasPills = false;

    // Checkboxes
    for (var id in settings.filter.checkboxes) {

      // If the filter is empty skip it.
      if (!settings.filter.checkboxes[id].length) {
        continue;
      }

      // Start Adding Pills
      for (var key in settings.filter.checkboxes[id]) {
        var selection = settings.filter.checkboxes[id][key];
        var title = $('#edit-filter-' + id + ' option[value="' + selection + '"]').text();
        $pills.append(Drupal.isotopify.pill.make(uniqueID, title, selection, id, 'checkbox'));
        hasPills = true;
      }
    }

    // Date Range
    if (settings.filter.daterange.begin.length && settings.filter.daterange.end.length) {
      var beginYear = settings.filter.daterange.begin.substr(0,4);
      var beginMonth = settings.filter.daterange.begin.substr(4,2) - 1;
      var beginDay = settings.filter.daterange.begin.substr(6,2);
      var endYear = settings.filter.daterange.end.substr(0,4);
      var endMonth = settings.filter.daterange.end.substr(4,2) - 1;
      var endDay = settings.filter.daterange.end.substr(6,2);

      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var title = beginDay + ' ' + months[beginMonth] + ' ' + beginYear + ' - ' + endDay + ' ' + months[endMonth] + ' ' + endYear;
      $pills.append(Drupal.isotopify.pill.make(uniqueID, title, '', 'daterange', 'daterange'));
      hasPills = true;
    }

    // Search
    if (settings.filter.search.results != null && settings.filter.search.term.length) {
      $pills.append(Drupal.isotopify.pill.make(uniqueID, settings.filter.search.term, '', 'search', 'search'));
      hasPills = true;
    }


    // Add clear all button.
    $clearAllButton = $('<button class="clear-filters">' + Drupal.t('Clear All') + '</button>');
    $clearAllButton.click(function() {
      for (var id in settings.filter.checkboxes) {
        Drupal.isotopify.setFilter.checkboxes(uniqueID, id, []);
      }

      Drupal.isotopify.setFilter.daterange(uniqueID, '', '');

      Drupal.isotopify.setFilter.search(uniqueID, '', null);

      Drupal.isotopify.update(uniqueID);
    });

    if (hasPills) {
      $pills.append($clearAllButton);
    }

    /**
     * Update Isotope
     */
    Drupal.settings.isotopify[uniqueID].grid.isotope({filter: function() {
      $this = $(this);

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
          }
        }

        checkboxTest = checkboxTest && singleDropdownTest;
      }


      /**
       * Filter date range
       */
      daterangeTest = true;
      if (settings.filter.daterange.begin.length && settings.filter.daterange.end.length) {
        if ($this.data('daterange') >= settings.filter.daterange.begin && $this.data('daterange') <= settings.filter.daterange.end) {
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
      if (settings.filter.search.results != null) {
        if (!settings.filter.search.results.length || $.inArray(nid.toString(), settings.filter.search.results) == -1) {
          searchTest = false;
        }
      }

      // Return the result of those tests.
      return checkboxTest && daterangeTest && searchTest;
    }});
  }

  Drupal.isotopify.setFilter = Drupal.isotopify.filterSet || {};

  Drupal.isotopify.setFilter.checkboxes = function(uniqueID, filterID, choices) {
    var settings = Drupal.settings.isotopify[uniqueID];

    settings.filter.checkboxes[filterID] = choices;
    $('#edit-filter-' + filterID).multipleSelect('setSelects', choices);
  }

  Drupal.isotopify.setFilter.daterange = function(uniqueID, beginDate, endDate) {
    var settings = Drupal.settings.isotopify[uniqueID];

    if (!beginDate.length || !endDate.length) {
      $('.isotopify-filter-daterange-button').data('dateRangePicker').clear();
      settings.filter.daterange.begin = '';
      settings.filter.daterange.endDateRange = '';
    }
    else {
      settings.filter.daterange.begin = beginDate;
      settings.filter.daterange.end = endDate;
    }

  }

  Drupal.isotopify.setFilter.search = function(uniqueID, text, results) {
    var settings = Drupal.settings.isotopify[uniqueID];

    settings.filter.search.text = text;
    settings.filter.search.results = results;
    $('#isotopify-filters .form-item-search input').val('');
  }

  Drupal.isotopify.pill = Drupal.isotopify.pill || {};

  Drupal.isotopify.pill.make = function(uniqueID, title, key, filterID, type) {
    var settings = Drupal.settings.isotopify[uniqueID];

    var $pill = $('<span class="filter-button"></span>');
    $pill.prepend('<span class="term">' + title + '</span>');
    $closeButton = $('<a class="filter-exit" data-filter-id="' + filterID + '" data-item-key="' + key + '" data-item-type="' + type + '">' + Drupal.t('Clear') + '</a>');
    $closeButton.click(function() {
      $this = $(this);
      var filterID = $this.data('filter-id');
      var itemKey = $this.data('item-key');
      var itemType = $this.data('item-type');

      switch(itemType) {
        case 'checkbox':
          var options = settings.filter.checkboxes[filterID];
          for (var optionKey in options) {
            if (options[optionKey] == key) {
              options.splice(optionKey, 1);
            }
          }

          Drupal.isotopify.setFilter.checkboxes(uniqueID, filterID, options);
          break;

        case 'daterange':
          Drupal.isotopify.setFilter.daterange(uniqueID, '', '');
          break;

        case 'search':
          Drupal.isotopify.setFilter.search(uniqueID, '', null);
          break;
      }

      Drupal.isotopify.update(uniqueID);
    });
    $pill.append($closeButton);
    return $pill;
  }

  Drupal.isotopify.pill.clearCheckbox = function() {

  }
})(jQuery);
