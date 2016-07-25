(function ($) {
  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {

      // We handle Isotope differently depending on the responsive state
      var responsive = false;

      // Setup only basic Isotope filtering for the responsive side tray
      if (Modernizr.mq('(max-width: 920px)')) {
        responsive = true;
        $('.isotopify').each(function(index) {
          Drupal.isotopify.initIsotope(this, responsive);
        });
        return;
      }

      $('.isotopify').each(function(index) {

        Drupal.isotopify.initIsotope(this, responsive);

        $this = $(this);
        var uniqueID = $this.attr('id');

        var settings = Drupal.settings.isotopify[uniqueID];

        var $isotopifyFilters = $this.find('.isotopify-filters');
        var $isotopifyFilterCheckboxes = $isotopifyFilters.find('select.isotopify-filter-checkboxes');
        var $isotopifyFilterDateRange = $isotopifyFilters.find('.isotopify-filter-daterange');
        var $isotopifySort = $isotopifyFilters.find('.isotopify-filter-sort');
        var $isotopeWrapper = $this.find('.isotopify-wrapper');

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
            var checkedOptions = [];
            var $select = $(this);
            filterID = $select.data('isotopify-id');
            $select.find('option').each(function() {
              $option = $(this);
              if (!$isotopeWrapper.find('.filter--' + filterID + '--' + $option.val()).length) {
                $option.remove();
              }

              // Also check if the checkbox is checked to set defaults.
              if ($option.is(':checked')) {
                checkedOptions.push($option.val());
              }
            });

            // If we have checked checkboxes the set the defaults.
            if (checkedOptions.length) {
              settings.filter.checkboxes[filterID] = checkedOptions;
            }

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

            var $applyButton = $('<button class="checkbox-apply">' + Drupal.t('Done') + '</button>').click(function (e) {
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
         * Handle daterange
         */
        settings.filter.daterange.begin = '';
        settings.filter.daterange.end = '';
        if ($isotopifyFilterDateRange.length) {

          // Get the default value.
          var dateRangeDefaultBegin = $isotopifyFilterDateRange.find('#edit-date-range-from').val();
          var dateRangeDefaultEnd = $isotopifyFilterDateRange.find('#edit-date-range-to').val();

          if (dateRangeDefaultBegin && dateRangeDefaultBegin.length && dateRangeDefaultEnd.length) {
            // Set the filter based on the default value.
            Drupal.isotopify.setFilter.daterange(uniqueID, dateRangeDefaultBegin, dateRangeDefaultEnd);
          }

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
            if (parseInt($item.data('daterange')) != 99999999) {
              if (minDate == null || parseInt($item.data('daterange')) < minDate) {
                minDate = parseInt($item.data('daterange'));
              }

              if (maxDate == null || parseInt($item.data('daterange')) > maxDate) {
                maxDate = parseInt($item.data('daterange'));
              }
            }
          });

          var minDateFormatted = minDate.toString().substr(0, 4) + '-' + minDate.toString().substr(4, 2) + '-' + minDate.toString().substr(6, 2);
          //var minDateObj = new Date(minDateFormatted);
          var minDateObj = new Date();
          //minDateObj.setMonth(minDateObj.getMonth()-1);
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
            customTopBar:  "Select a Start Date",
            setValue: function(s) {
            }
          }).bind('datepicker-first-date-selected', function(event, obj) {
            /* This event will be triggered when first date is selected */

            $("div.custom-top").show();
            $("div.custom-top").text("Select an End Date");

          }).bind('datepicker-change', function(event, obj) {
            /* This event will be triggered when second date is selected */

            $("div.custom-top").hide();

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
            $("div.custom-top").text("Select a Start Date");
            $("div.custom-top").show();
            $(this).addClass('open');
          }).bind('datepicker-closed',function() { // Add classes when the picker is closed
            $(this).removeClass('open');
            $(this).addClass('closed');
          });

          // Move the close button.
          var $topBarText = $('.date-picker-wrapper .custom-top').detach();
          var $topBar = $('.date-picker-wrapper .drp_top-bar').detach();
          $topBar.find('.apply-btn').val(Drupal.t('Done'));
          $topBar.find('.default-top').hide();
          $('.date-picker-wrapper').append($topBar);
          $('.date-picker-wrapper').prepend($topBarText);

        }

        /*
         * Let links set checkboxes.
         */
        $('a[href^="' + window.location.origin + window.location.pathname + '"]').each(function() {
          $link = $(this);
          // Need to create a faux element so we can parse the url.
          var a = document.createElement('a');
          a.href = $link.attr('href');

          // While the link may begin the same as the current url that doesn't
          // mean it matches. Check for that.
          if (a.origin + a.pathname == window.location.origin + window.location.pathname && a.search.length) {
            // Split up the parameters.
            var parameters = a.search.replace('?', '').split('&');

            // Add a click event that sets the checkboxes and updates the page.
            $link.click(function(e) {
              e.preventDefault();
              for (var key in parameters) {
                var options = parameters[key].split('=');
                Drupal.isotopify.setFilter.checkboxes(uniqueID, options[0], options[1].split(','));
              }
              Drupal.isotopify.update(uniqueID);
            });
          }
        });

        // If there is the filter pane on the page then use it.
        if ($('#isotopify-filters-pane').length) {
          $('#isotopify-filters-pane').append($isotopifyFilters.detach());
        }

        // Add show direct url fields.
        if ($('body').hasClass('logged-in')) {
          var $directURLField = $('<input id="direct-url-field" type="text" size=100 />');

          var $linkBuilder = $('<p id="direct-url-link"><a href="#">' + Drupal.t('Show the direct url to this filter') + '</a></p>').click(function(e) {
            e.preventDefault();
            var $link = $(this).find('a');

            if ($link.hasClass('open')) {
              $link.text(Drupal.t('Show the direct url to this filter'));
              $directURLField.hide();
            }
            else {
              $link.text(Drupal.t('Hide the direct url filed'));
              $directURLField.show();
            }

            $link.toggleClass('open');
          });

          $('#direct-url-field').remove();
          $('#direct-url-link').remove();
          $('#isotopify-filters-pane').prepend($directURLField);
          $('#isotopify-filters-pane').prepend($linkBuilder);
          $directURLField.hide();
        }

        Drupal.isotopify.update(uniqueID);
      });
    }
  };

  Drupal.isotopify = Drupal.isotopify || {};

  Drupal.isotopify.initIsotope = function(self, responsive) {

    $this = $(self);
    var uniqueID = $this.attr('id');
    Drupal.settings.isotopify[uniqueID].responsive = responsive;
    var settings = Drupal.settings.isotopify[uniqueID];
    settings.filter = settings.filter || {};
    settings.filter.checkboxes = settings.filter.checkboxes || {};
    settings.filter.daterange = settings.filter.daterange || {};
    settings.filter.daterange.begin = [];
    settings.filter.daterange.end = [];
    settings.filter.search = settings.filter.search || {};
    var $isotopifyFilters = $this.find('.isotopify-filters');
    var $isotopifySort = $isotopifyFilters.find('.isotopify-filter-sort');
    var $isotopeWrapper = $this.find('.isotopify-wrapper');

    // Define default properties for isotope
    isotopeProperties = {
      itemSelector: settings.itemSelector,
      layoutMode: 'fitRows'
    };

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
        value = Drupal.isotopify.addAdditionalSorts($sort, value);
        Drupal.settings.isotopify[uniqueID].grid.isotope({
          sortBy: value
        })
      });
    }

    // Enable isotope
    Drupal.settings.isotopify[uniqueID].grid = $isotopeWrapper.isotope(isotopeProperties);
    Drupal.settings.isotopify[uniqueID].grid.on('arrangeComplete', function (event, filteredItems) {
       if (filteredItems.length) {
          $('#' + uniqueID).removeClass('no-results');
        }
        else {
         $('#' + uniqueID).addClass('no-results');
        }
    });

    Drupal.settings.isotopify[uniqueID].grid.on('arrangeComplete', function (event, filteredItems) {
      if (filteredItems.length) {
        $isotopeWrapper.removeClass('no-results');
      }
      else {
        $isotopeWrapper.addClass('no-results');
      }
    });

    Drupal.isotopify.initSearchFilter(uniqueID, settings, $isotopifyFilters);

    Drupal.isotopify.doDefaultSort(uniqueID, settings, $isotopifySort);

  }

  Drupal.isotopify.initSearchFilter = function(uniqueID, settings, $isotopifyFilters) {

    /**
     * Handle Search Filter
     */
    var $isotopifySearchInput = $isotopifyFilters.find('[name=search]');

    if ($isotopifySearchInput.length) {
      var $isotopifySearchButton = $isotopifyFilters.find('input.form-submit');
      settings.filter.search.results = null;
      $('#edit-search--2').keypress(function(e) {
        if (e.keyCode == 13) {
          $('#isotopify-filters #edit-submit').click();
          return false; // prevent the button click from happening
        }
      });

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
  }

  Drupal.isotopify.doDefaultSort = function(uniqueID, settings, $isotopifySort) {
    /**
     * Handle Default sorting
     */
    if ($isotopifySort.length) {

      debugger;
      var defaultSort = Drupal.isotopify.addAdditionalSorts($isotopifySort, $isotopifySort.val());

      // Sort by the default sort value.
      Drupal.settings.isotopify[uniqueID].grid.isotope({
        sortBy: defaultSort
      });

    }
  }

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
   * Add any additional sort items that were specified.
   */
  Drupal.isotopify.addAdditionalSorts = function($select, sortID) {
    var additionalSorts = $select.data('isotopify-additional-sort-' + sortID);
    if (additionalSorts !== 'undefined') {
      additionalSorts.unshift(sortID);
      sortID = additionalSorts;
    }

    return sortID;
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
      $('#isotopify h2.isotopify-title').after($pills);
    }

    // Clear out the pills.
    $pills.empty();
    var hasPills = false;

    // Checkboxes
    for (var id in settings.filter.checkboxes) {

      // If the filter is empty skip it.
      if (settings.filter.checkboxes[id] == null || !settings.filter.checkboxes[id].length) {
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

      $('#edit-filters input:checked').each(function() {
        $(this).attr('checked', false);
      });

      $('#edit-date-range-from').val('');
      $('#edit-date-range-to').val('');

      $('#edit-filters input:checked').each(function() {
        $(this).attr('checked', false);
      });

      Drupal.isotopify.update(uniqueID);
    });

    if (hasPills) {
      $pills.append($clearAllButton);
      if (settings.filterTitle.length) {
        $('h2.isotopify-title').text(settings.filterTitle);
      }
    }
    else {
      if (settings.filterTitle.length) {
        $('h2.isotopify-title').text(settings.title);
      }
    }

    // Update the direct url field.
    if ($('#direct-url-field').length) {
      var filters = {};
      $('a.filter-exit').each(function() {
        var $filter = $(this);
        if ($filter.data('item-type') == "checkbox") {
          var key = $filter.data('item-key');
          var filterID = $filter.data('filter-id');
          filters[filterID] = filters[filterID] || [];
          filters[filterID].push(key);
        }
      });

      // Add the date range
      if (settings.filter.daterange.begin.length && settings.filter.daterange.end.length) {
        filters['date-range-from'] = [];
        filters['date-range-from'].push(settings.filter.daterange.begin);
        filters['date-range-to'] = [];
        filters['date-range-to'].push(settings.filter.daterange.end);
      }

      var link = window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?';
      for (var filterID in filters) {
        link += filterID + '=';

        for (var key in filters[filterID]) {
          link += filters[filterID][key];
          if (key != filters[filterID].length -1) {
            link += ',';
          }
        }

        link += '&';
      }

      link = link.substring(0, link.length - 1);
      $('#direct-url-field').val(link);
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
        if (settings.filter.checkboxes[id] == null || !settings.filter.checkboxes[id].length) {
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
        if ($this.data('daterange') == 99999999 || ($this.data('daterange') >= settings.filter.daterange.begin && $this.data('daterange') <= settings.filter.daterange.end)) {
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
    if (!Drupal.settings.isotopify[uniqueID].responsive) {
      $('#edit-filter-' + filterID).multipleSelect('setSelects', choices);
    }
    // begin by unchecking all the checkboxes under the filterID
    $('.form-item-filter-' + filterID + ' input:checked').each(function() {
      $(this).attr('checked', false);
    });
    // now recheck the checkboxes that are in the list of choices under the filterID
    $('.form-item-filter-' + filterID + ' input').each(function() {
      if ($.inArray($(this).val(), choices) > -1) {
        $(this).attr('checked', true);
      }
    });

  }

  Drupal.isotopify.setFilter.daterange = function(uniqueID, beginDate, endDate) {
    var settings = Drupal.settings.isotopify[uniqueID];

    if (!beginDate.length || !endDate.length) {
      if ($('.isotopify-filter-daterange-button').length) {
        $('.isotopify-filter-daterange-button').data('dateRangePicker').clear();
      }
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
