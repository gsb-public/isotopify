<div class="isotopify-checkboxes">
  <?php foreach ($values as $key => $value): ?>
    <div class="form-item">
      <input type="checkbox" name="<?php print $key; ?>" value="<?php print $key; ?>">
      <label class="option"><?php print $value; ?></label>
    </div>
  <?php endforeach; ?>
</div>