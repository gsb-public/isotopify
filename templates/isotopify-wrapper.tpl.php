<div id="<?php print $unique_id; ?>" class="isotopify" data-isotopify-callback="<?php print $callback; ?>">
  <?php if (!empty($filters)): ?>
    <div class="isotopify-filters">
      <?php print $filters; ?>
    </div>
  <?php endif; ?>
  <div class="isotopify-wrapper">
    <?php print $isotope_data; ?>
  </div>
</div>