(function () {
  'use strict';
  const TILE_BACKGROUNDS = [
    'linear-gradient(135deg, #F472B6, #BE185D)',
    'linear-gradient(135deg, #60A5FA, #1D4ED8)',
    'linear-gradient(135deg, #34D399, #047857)',
    'linear-gradient(135deg, #FBBF24, #B45309)',
    'linear-gradient(135deg, #A78BFA, #6D28D9)',
    'linear-gradient(135deg, #FB923C, #C2410C)',
    'linear-gradient(135deg, #22D3EE, #0E7490)',
    'linear-gradient(135deg, #F87171, #B91C1C)',
    'linear-gradient(135deg, #EC4899, #7E22CE)',
    'linear-gradient(135deg, #6366F1, #312E81)',
    'linear-gradient(135deg, #14B8A6, #0F766E)',
    'linear-gradient(135deg, #06B6D4, #0369A1)',
    'linear-gradient(135deg, #84CC16, #3F6212)',
    'linear-gradient(135deg, #EAB308, #A16207)',
    'linear-gradient(135deg, #F97316, #9A3412)',
    'linear-gradient(135deg, #EF4444, #991B1B)',
    'linear-gradient(135deg, #D946EF, #86198F)',
    'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    'linear-gradient(135deg, #0EA5E9, #075985)',
    'linear-gradient(135deg, #10B981, #065F46)',
    'linear-gradient(135deg, #F43F5E, #9F1239)',
    'linear-gradient(135deg, #64748B, #334155)',
    'linear-gradient(135deg, #A855F7, #4338CA)',
    'linear-gradient(135deg, #2DD4BF, #155E75)'
  ];
  const ACTION_ICON_CHOICES = [
    'link-2', 'globe-2', 'external-link', 'qr-code', 'mouse-pointer-click',
    'calendar-check', 'calendar-check-2', 'calendar-days', 'calendar-range', 'clock-3',
    'phone', 'phone-call', 'mail', 'message-circle', 'message-square',
    'messages-square', 'send', 'navigation', 'map-pin', 'map-pinned',
    'home', 'building-2', 'store', 'briefcase-business', 'user',
    'users', 'contact-round', 'id-card', 'user-check', 'user-plus',
    'star', 'heart', 'gift', 'crown', 'gem',
    'sparkles', 'badge-check', 'shield-check', 'check-circle', 'circle-plus',
    'shopping-bag', 'credit-card', 'wallet', 'wallet-cards', 'coins',
    'dollar-sign', 'circle-dollar-sign', 'receipt', 'receipt-text', 'hand-coins',
    'image', 'video', 'play', 'monitor', 'smartphone',
    'tablet', 'radio', 'menu', 'list', 'tags',
    'ticket-percent', 'megaphone', 'bell', 'book-open', 'graduation-cap',
    'file-text', 'folder', 'clipboard-list', 'calculator', 'code-2',
    'printer', 'newspaper', 'rocket', 'zap', 'settings',
    'activity', 'bar-chart-3', 'chart-no-axes-combined', 'trending-up', 'sprout', 'infinity',
    'badge', 'badge-dollar-sign', 'blocks', 'apple', 'list-checks',
    'utensils', 'heart-handshake', 'ticket', 'images', 'file-check-2',
    'clipboard-check', 'clipboard-x', 'file-question', 'folder-tree', 'notebook-pen',
    'pencil', 'square-pen', 'save', 'download', 'upload-cloud',
    'copy', 'eye', 'search', 'scan-line', 'share-2',
    'refresh-cw', 'rotate-ccw', 'undo-2', 'sliders-horizontal', 'settings-2',
    'shield', 'shield-plus', 'info', 'circle-help', 'circle-question-mark',
    'alert-triangle', 'triangle-alert', 'octagon-alert', 'check', 'circle-check',
    'circle-check-big', 'x-circle', 'trash-2', 'inbox', 'voicemail',
    'phone-forwarded', 'phone-off', 'message-circle-question', 'message-circle-off', 'users-round',
    'user-circle', 'user-round-check', 'user-x', 'key-round', 'languages',
    'layers', 'layers-2', 'layers-3', 'layout-dashboard', 'layout-grid',
    'layout-template', 'list-filter', 'panel-left', 'panel-top', 'arrow-left-right'
  ];
  window.ONEQR_ACTION_APPEARANCE = Object.freeze({
    backgrounds: Object.freeze(TILE_BACKGROUNDS),
    icons: Object.freeze(ACTION_ICON_CHOICES)
  });
})();
