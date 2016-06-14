<div id="<?php print $unique_id; ?>" class="isotopify <?php print drupal_html_class($view_id); ?>" data-isotopify-callback="<?php print $callback; ?>">
  <?php if (!empty($filters)): ?>
    <div class="isotopify-filters">
      <?php print $filters; ?>
    </div>
  <?php endif; ?>
  <?php if (!empty($title)): ?>
    <h2 class="isotopify-title"><?php print $title; ?></h2>
  <?php endif; ?>
  <?php print $header; ?>
  <div class="no-results-text">
    <?php print $no_results; ?>
  </div>
  <div class="isotopify-wrapper">
    <?php print $isotope_data; ?>
  </div>
  <?php print $footer; ?>
</div>
