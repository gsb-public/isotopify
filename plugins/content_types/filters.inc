<?php

$plugin = array(
  'title' => t('Isotopify Filters'),
  'category' => t('Custom Content & Features'),
  'single' => TRUE,
  'all contexts' => TRUE,
);

/**
 * Implements hook_PLUGIN_content_type_render().
 */
function isotopify_filters_content_type_render($subtype, $conf, $panel_args, $context, $incoming) {
  return (object) array(
    'content' => array(
      '#markup' => '<div id="isotopify-filters-pane"></div>',
    ),
  );
}
