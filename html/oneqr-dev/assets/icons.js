(() => {
  // Selected assets from html/assets/icon-oneqr, bundled with this standalone demo.
  const files = Object.freeze({
    "globe": "issue-2040-oneqr-globe-2-3d.png",
    "map-pin": "issue-2040-oneqr-map-pin-3d.png",
    "search": "issue-2040-oneqr-ticket-3d.png",
    "home": "issue-2040-oneqr-home-3d.png",
    "locate": "issue-2040-oneqr-map-pin-3d.png",
    "check": "issue-2040-oneqr-check-3d.png",
    "navigation": "issue-2040-oneqr-map-3d.png",
    "sparkles": "issue-2040-oneqr-sparkles-3d.png",
    "gift": "issue-2040-oneqr-gift-3d.png",
    "download": "issue-2040-oneqr-package-3d.png",
    "arrow-up-right": "issue-2040-oneqr-square-arrow-out-up-right-3d.png",
    "contact-phone": "issue-2040-oneqr-phone-3d.png",
    "contact-message": "issue-2040-oneqr-message-circle-3d.png",
    "contact-card": "issue-2040-oneqr-user-round-3d.png",
    "contact-wallet": "issue-2040-oneqr-wallet-3d.png",
    "contact-navigation": "issue-2040-oneqr-map-3d.png",
    "contact-user-plus": "issue-2040-oneqr-users-round-3d.png",
    "contact-share": "issue-2040-oneqr-share-2-3d.png",
    "checkin": "issue-2040-oneqr-scan-line-3d.png",
    "booking": "issue-2040-oneqr-calendar-check-3d.png",
    "services": "issue-2040-oneqr-list-3d.png",
    "tip": "issue-2040-oneqr-hand-coins-3d.png",
    "facebook": "issue-2040-oneqr-facebook-3d.png",
    "instagram": "issue-2040-oneqr-instagram-3d.png",
    "website": "issue-2040-oneqr-globe-2-3d.png",
    "directions": "issue-2040-oneqr-map-3d.png",
    "star": "issue-2040-oneqr-star-3d.png",
    "coupon": "issue-2040-oneqr-ticket-3d.png",
    "deal": "issue-2040-oneqr-tag-3d.png",
    "calendar": "issue-2040-oneqr-calendar-days-3d.png",
    "clock": "issue-2040-oneqr-clock-3d.png",
    "active": "issue-2040-oneqr-circle-check-3d.png",
    "partner": "issue-2040-oneqr-users-round-3d.png",
    "note": "issue-2040-oneqr-receipt-3d.png",
    "customer": "issue-2040-oneqr-user-round-3d.png",
    "store": "issue-2040-oneqr-store-3d.png",
    "filter": "issue-2040-oneqr-settings-2-3d.png",
    "food": "issue-2040-oneqr-utensils-3d.png",
    "wish": "issue-2040-oneqr-wand-2-3d.png",
    "auto": "issue-2040-oneqr-car-3d.png",
    "health": "issue-2040-oneqr-heart-3d.png",
    "shopping": "issue-2040-oneqr-shopping-bag-3d.png",
    "nail": "salon-nail-polish-iconscout-10843584.png"
  });
  function image(name) {
    const file = files[name];
    return file ? `<img class="icon" src="assets/icons/oneqr/${file}" alt="" draggable="false">` : '';
  }
  window.OneQrIcons = Object.freeze({ image });
})();
