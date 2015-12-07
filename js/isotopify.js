(function ($) {
  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {
      $('.isotopify').each(function(index) {
        $this = $(this);
        var uniqueID = $this.attr('id');
        var settings = Drupal.settings.isotopify[uniqueID];
        var $isotopifyFilters = $this.find('.isotopify-filters');
        var $isotopifyFilterCheckboxes = $isotopifyFilters.find('select.isotopify-filter-checkboxes');
        var $isotopeWrapper = $this.find('.isotopify-wrapper');

        // Remove unused filter options
        $isotopifyFilterCheckboxes.each(function() {
          $select = $(this);
          filterID = $select.data('isotopify-id');
          $select.find('option').each(function() {
            $option = $(this);
            if (!$isotopeWrapper.find('.filter--' + filterID + '--' + $option.val()).length) {
              $option.remove();
            }
          });
        });

        // handle lazy load
        if (typeof settings.lazyLoad !== 'undefined' && settings.lazyLoad) {
          var $imgs = $isotopeWrapper.find('img');

          $imgs.lazyload({
            failure_limit: Math.max($imgs.length - 1, 0)
          });
        }

        // Enable isotope
        Drupal.settings.isotopify[uniqueID].grid = $isotopeWrapper.isotope({
          itemSelector: settings.itemSelector,
          layoutMode: 'fitRows'
        });

        // Add scroll event for lazyload
        Drupal.settings.isotopify[uniqueID].grid.on('layoutComplete', function() {
          $(window).trigger("scroll");
        });

        /**
         * Handle Checkboxes
         */
        $isotopifyFilterCheckboxes.multipleSelect({
          width: 180,
          maxHeight: 300,
          selectAll: false,
          //multiple: true,
          //multipleWidth: 220,
          minimumCountSelected: 0
        });

        $isotopifyFilterCheckboxes.change(function(e) {
          Drupal.isotopify.update(uniqueID);
        });


        /**
         * Handle Search Filter
         */
        var $isotopifySearchInput = $isotopifyFilters.find('[name=search]');
        var $isotopifySearchButton = $isotopifyFilters.find('input.form-submit');
        Drupal.settings.isotopify[uniqueID].searchResults = '';


        $isotopifySearchButton.click(function(e) {
          e.preventDefault();

          var text = $isotopifySearchInput.val();

          if (text.length) {
            console.log(settings);
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

      /**
       * Filter Checkboxes
       */
      checkboxesTest = true;
      $('#' + uniqueID + ' select.isotopify-filter-checkboxes').each(function() {
        $select = $(this);
        checkboxTest = false;
        $options = $select.find(':selected');
        var selectID = $select.data('isotopify-id');

        // If nothing is checked then assume that it's true.
        if ($options.length) {
          // Loop through all the selected options. If any of them are a match then the
          // whole thing is true.
          $options.each(function() {
            $option = $(this);
            filterID = $option.val();
            if ($this.hasClass('filter--' + selectID + '--' + filterID)) {
              checkboxTest = true;
              return false;
            }
          });
        }
        else {
          checkboxTest = true;
        }

        checkboxesTest = checkboxesTest && checkboxTest;
      });

      /**
       * Filter search
       */
      var nid = $this.data('nid');
      searchTest = true;
      if (Drupal.settings.isotopify[uniqueID].searchResults.length && $.inArray(nid.toString(), Drupal.settings.isotopify[uniqueID].searchResults) == -1) {
        searchTest = false;
      }

      // Return the result of those tests.
      return checkboxesTest && searchTest;
    }});
  }
})(jQuery);
