<?php

/**
 * Returns themed content for wrapper
 */
function isotopify_preprocess_isotopify_wrapper(&$variables) {
  $variables['theme_hook_suggestions'][] = 'isotopify_wrapper__' . $variables['view_id'];
}

/**
 * Returns themed content for each element
 */
function isotopify_preprocess_isotopify_item(&$variables) {
  $variables['data_attributes'] = 'data-nid="' . $variables['item-id'] . '"';

  if (!empty($variables['daterange'])) {
        $variables['data_attributes'] .= ' data-daterange="' . $variables['daterange'] . '"';
      }

  foreach ($variables['sort'] as $key => $value) {
    $variables['data_attributes'] .= ' data-sort-' . $key . '="' . $value . '"';
  }
  $variables['theme_hook_suggestions'][] = 'isotopify_item__' . $variables['view_id'];
}