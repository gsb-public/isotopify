(function ($) {
  Drupal.behaviors.isotopify = {
    attach: function (context, settings) {
      $('.isotopify').each(function(index) {
        var uniqueID = $(this).attr('id');

        var settings = Drupal.settings.isotopify[uniqueID];
        var $isotopeWrapper = $(this).find('.isotopify-wrapper');


        if (typeof settings.lazyLoad !== 'undefined' && settings.lazyLoad) {
          var $imgs = $isotopeWrapper.find('img');

          $imgs.lazyload({
            failure_limit: Math.max($imgs.length - 1, 0)
          });
        }

        Drupal.settings.isotopify[uniqueID].grid = $isotopeWrapper.isotope({
          itemSelector: settings.itemSelector,
          layoutMode: 'fitRows'
        });

        Drupal.settings.isotopify[uniqueID].grid.on('layoutComplete', function() {
          $(window).trigger("scroll");
        });

        $isotopifyFilters = $(this).find('.isotopify-filters');

        /**
         * Handle Checkboxes
         */
        $isotopifyFilters.find('.form-select').multipleSelect({
          width: 180,
          maxHeight: 300,
          selectAll: false,
          //multiple: true,
          //multipleWidth: 220,
          minimumCountSelected: 0
        });

        $(this).find('.isotopify-filters .isotopify-checkboxes input').click(function(e) {
          Drupal.isotopify.update(uniqueID);
        });

        /**
         * Handle Search Filter
         */
        Drupal.settings.isotopify[uniqueID].searchResults = '';

        $isotopifySearch = $(this).find('.isotopify-search');
        $isotopifySearch.find('#edit-submit').click(function(e) {
          e.preventDefault();

          var text = $isotopifySearch.find('#edit-search').val();

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
      $('#' + uniqueID + ' .isotopify-checkboxes').each(function() {
        checkboxTest = false;
        $checkboxes = $(this).find('input:checked');

        // If nothing is checked then assume that it's true.
        if ($checkboxes.length) {
          // Loop through all checked items. If any of them are a match then the
          // whole thing is true.
          $checkboxes.each(function() {
            if ($this.hasClass($(this).val())) {
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
      var nid = $(this).data('nid');
      searchTest = true;
      if (Drupal.settings.isotopify[uniqueID].searchResults.length && $.inArray(nid.toString(), Drupal.settings.isotopify[uniqueID].searchResults) == -1) {
        searchTest = false;
      }

      // Return the result of those tests.
      return checkboxesTest && searchTest;
    }});
  }
})(jQuery);
