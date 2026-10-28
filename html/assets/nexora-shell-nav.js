/* Merchant hierarchy from the PO handoff; every destination is an integrated local page. */
(function () {
  'use strict';
  // Preserve the English preference shared with the PO handoff.
  try { window.localStorage.setItem('nexora-dashboard-language-v1', 'en'); } catch (_) {}
  var front = {
    checkin: 'pos-front-desk.html?section=checkin', tickets: 'pos-front-desk-tickets.html',
    turns: 'pos-front-desk-turn-board.html', turnboard: 'pos-front-desk-turn-board.html',
    booking: 'pos-front-desk.html?section=appointments&bookingView=booking',
    checkout: 'pos-direct-checkout.html?view=list', checkoutcustomer: 'pos-direct-checkout.html?view=list',
    completed: 'pos-completed-services.html', estimate: 'pos-front-desk.html?section=estimate'
  };
  function resolve(href, opsView) {
    if (opsView && front[opsView]) return front[opsView];
    if (opsView === 'clock') return 'pos-front-desk.html?section=clock';
    if (!href) return '';
    if(href==='pos-qr-checkin.html')return 'qr-stations.html?tab=check-in&setup=qr';
    if(href==='pos-checkin-devices.html')return 'qr-stations.html?tab=check-in&setup=device';
    if(href==='pos-shop-income-report.html')return 'pos-technician-report.html?tab=store';
    if(href==='pos-service-income-report.html')return 'pos-technician-report.html?tab=service';
    if (href === '#modules') return 'dashboard.html';
    if (href === '#salon-home') return 'salon-home.html';
    if (href === '#dashboard-onboarding') return 'nexora-getting-started.html';
    if (href.indexOf('#module-') === 0) {
      var module = href.slice(8);
      if (module === 'gift') return 'gift-card-center.html';
      return 'dashboard.html?module=' + (module === 'aihub-marketing' ? 'aihub&section=marketing' : module);
    }
    var anchors = {
      '#pos-front-desk': 'pos-front-desk.html',
      '#pos-ai-voice': 'pos-ai-voice.html',
      '#pos-booking-calendar': 'pos-front-desk.html?section=appointments&bookingView=appointment&view=calendar',
      '#pos-booking-requests': 'pos-front-desk.html?section=appointments&bookingView=booking',
      '#pos-booking-customers': 'pos-front-desk.html?section=appointments&bookingView=appointment&view=table',
      '#pos-booking-staff': 'pos-front-desk.html?section=appointments&bookingView=appointment&view=calendar',
      '#pos-salon-settings-info': 'pos-salon-settings.html?section=information',
      '#pos-salon-settings-services': 'pos-salon-settings.html?section=services',
      '#pos-call-log': 'booking-book-phase-1.html?tab=calllog',
      '#pos-voice-customers': 'booking-book-phase-1.html?tab=customers',
      '#pos-promotions': 'reward-promotions.html', '#pos-sms-campaigns': 'nexora-sms-dashboard.html',
      '#pos-loyalty': 'salon-setup-reward.html'
    };
    if (anchors[href]) return anchors[href];
    if (href[0] === '#') return 'dashboard.html' + href;
    if (!/^https?:/.test(href)) {
      if (/^(nexora_home_de_xuat|index)\.html/.test(href)) return 'nexora-home.html';
      if (href === 'products/spin-wheel/create.html') return 'vlinkpay-campaigns.html?view=create';
      if (href.indexOf('products/') === 0) {
        var product = href.split('/')[1], modules = {'si-pos':'pos','one-qr':'oneqr','payments-payouts':'payments','ai-hub':'aihub','ai-marketing':'aihub&section=marketing','reviews':'reviews','gift-card-center':'gift','analytics':'analytics','community':'community','spin-wheel':'spinwheel','tax-iq':'taxiq'};
        if (product === 'gift-card-center') return 'gift-card-center.html';
        if (product === 'ai-voice-sms') return 'pos-ai-voice.html';
        return 'dashboard.html?module=' + (modules[product] || 'pos');
      }
      return href;
    }
    var u;
    try { u = new URL(href); } catch (_) { return href; }
    if (u.hostname === 'merchant.vlinkpay.com' || u.hostname === 'staging-merchant.vlinkpay.com') {
      if (u.pathname === '/campaign-management') return 'vlinkpay-campaigns.html';
      if (u.pathname === '/marketing-tools') return 'ai-ads.html';
      var giftViews = {'/gift-voucher/product-management/issue-digital':'issue','/gift-voucher/product-management/quick-create-card':'quick','/gift-voucher/product-management/sell-egift-form':'advanced','/gift-voucher/product-management':'cards','/payment-process/payment-gift-card':'redeem','/settings/benefits-setup':'benefits','/settings/membership-report':'members','/reports/card-transaction-history':'transactions','/reports/expiring-cards':'expiring'};
      if (giftViews[u.pathname]) return 'gift-card-center.html?view=' + (u.pathname.endsWith('/issue-digital') && u.searchParams.get('type') === 'membership' ? 'membership' : giftViews[u.pathname]);
    }
    if (u.hostname !== 'nexoratouch.com' && u.hostname !== 'staging-web.nexoratouch.com') return href;
    var path = u.pathname, tab = u.searchParams.get('tab');
    if (path === '/dashboard') return 'dashboard.html';
    if (path === '/dashboard/settings') return 'owner-setting.html';
    if (path === '/dashboard/settings/staff') return 'owner-setting.html?tab=staff';
    if (path === '/dashboard/pos' && tab === 'gift-card-center') return 'gift-card-center.html';
    if (path === '/dashboard/community') return 'community.html?tab=' + (tab || 'feed');
    if (path === '/dashboard/reviews') return 'nexora-review.html';
    if (path === '/dashboard/pos' && front[tab]) return front[tab];
    if (path === '/dashboard/pos' && tab === 'timeclock') return 'pos-front-desk.html?section=clock';
    if (path === '/dashboard/pos/sms-campaigns') return 'nexora-sms-dashboard.html';
    if (path === '/dashboard/pos/printer') return 'pos-printer-setup.html';
    if (path === '/dashboard/pos/report/card') return 'pos-technician-report.html?tab=card';
    var localRoutes = {'/dashboard/pos/report/technician':'pos-technician-report.html','/dashboard/pos/public-checkin':'qr-stations.html?tab=check-in&setup=qr','/dashboard/pos/devices':'qr-stations.html?tab=check-in&setup=device','/dashboard/analytics':'nexora-analytics.html','/dashboard/category-management':'payment-categories.html','/dashboard/support':'nexora-support.html','/dashboard/ai-hub/setup-guide':'salon-guide-ai-voice.html'};
    if (localRoutes[path]) return localRoutes[path];
    if (path === '/dashboard/reports') return {'receive_payments':'payment-income.html',tips:'tip-list.html',direct_payments:'payment-activity.html'}[tab] || 'payment-income.html?tab=overview';
    if (path === '/dashboard/tips') return {overview:'tip-overview.html',payouts:'staff-payouts.html',savings:'direct-savings.html'}[tab] || 'tip-overview.html';
    if (path.indexOf('/menu/') === 0) return '../menu/menu.html';
    if (path === '/dashboard/pos' && tab === 'orderlist') return front.tickets;
    if (path === '/dashboard/pos' && tab === 'customer') return 'booking-book-phase-1.html?tab=customers';
    if (path === '/dashboard/pos/promotions') return 'reward-promotions.html';
    if (path === '/dashboard/pos/loyalty') return 'salon-setup-reward.html';
    if (path === '/dashboard/pos/settings/services') return 'pos-salon-settings.html?section=services';
    if (path === '/dashboard/pos/settings/salon-information') return 'pos-salon-settings.html?section=information';
    if (path === '/dashboard/ai-hub') {
      if (tab === 'sms-campaigns') return 'nexora-sms-dashboard.html';
      if (['booking','customers','calllog','plans','settings'].indexOf(tab) !== -1) return 'booking-book-phase-1.html?tab=' + tab + (u.searchParams.has('view') ? '&view=' + u.searchParams.get('view') : '');
    }
    if (path === '/dashboard/touchpoints') {
      var checkinSection=u.searchParams.get('section');
      if(checkinSection==='public-checkin'||checkinSection==='devices')return 'qr-stations.html?tab=check-in&setup='+(checkinSection==='devices'?'device':'qr');
      var qrTabs = {'check-in':'check-in','one-qr':'one-qr', tip:'qr-stations', payment:'accept-payment', referral:'referral-link', 'staff-invite':'staff-invite-qr'};
      var qrTab = qrTabs[u.searchParams.get('section')];
      if (qrTab) return 'qr-stations.html?tab=' + qrTab;
    }
    if (path.indexOf('/dashboard/settings/staff/') === 0) return 'owner-staff-profile.html?staffId=' + encodeURIComponent(path.split('/').pop());
    if (path === '/dashboard/settings/affiliate') return 'owner-setting.html?tab=affiliate-link';
    if (path === '/dashboard/settings/service-applications') return 'owner-setting.html?tab=service-applications';
    if (path === '/dashboard/settings/privacy') return 'owner-setting.html?tab=terms-privacy';
    if (path === '/dashboard/settings/profile') return 'owner-setting.html';
    if (path === '/dashboard/settings/kyb') return 'owner-setting.html?tab=business-verification';
    if (path === '/dashboard/news-library') return 'news-library.html?tab=' + (tab || 'news');
    if (path === '/dashboard/package-management') return 'nexora-packages.html?tab=overview';
    return href;
  }
  var nodes = [
  {
    "key": "public-home",
    "label": "Nexora Home",
    "externalIndicator": true,
    "iconKey": "public-home",
    "href": "nexora_home_de_xuat.html"
  },
  {
    "key": "home",
    "label": "Salon Home",
    "iconKey": "home",
    "href": "#salon-home"
  },
  {
    "key": "dashboard",
    "label": "Dashboard",
    "iconKey": "dashboard",
    "href": "#modules"
  },
  {
    "key": "start-link",
    "label": "Getting started",
    "iconKey": "onboarding",
    "href": "#dashboard-onboarding"
  },
  {
    "key": "pos",
    "label": "SI POS",
    "iconKey": "pos",
    "children": [
      {
        "key": "front-desk",
        "label": "Front Desk",
        "href": "#pos-front-desk",
        "children": [
          {
            "key": "on-khach",
            "label": "Check-in",
            "href": "#pos-front-desk",
            "opsView": "checkin"
          },
          {
            "key": "phieu-dich-vu",
            "label": "Tickets",
            "href": "#pos-front-desk",
            "opsView": "tickets"
          },
          {
            "key": "chia-turn",
            "label": "Turn Board",
            "href": "#pos-front-desk",
            "opsView": "turns"
          },
          {
            "key": "at-lich",
            "label": "Booking",
            "href": "#pos-front-desk",
            "opsView": "booking"
          },
          {
            "key": "thu-tien",
            "label": "Checkout",
            "href": "#pos-front-desk",
            "opsView": "checkout"
          },
          {
            "key": "a-hoan-tat",
            "label": "Completed Services",
            "href": "#pos-front-desk",
            "opsView": "completed"
          },
          {
            "key": "bao-gia",
            "label": "Estimate",
            "href": "#pos-front-desk",
            "opsView": "estimate"
          },
          {
            "key": "cham-cong",
            "label": "Time clock",
            "href": "#pos-front-desk",
            "opsView": "clock"
          }
        ]
      },
      {
        "key": "quan-ly-tiem",
        "label": "Salon management",
        "href": "pos-salon-settings.html?section=information",
        "children": [
          {
            "key": "pos-booking",
            "label": "Appointments",
            "href": "#pos-booking-calendar"
          },
          {
            "key": "pos-settings",
            "label": "Salon settings",
            "href": "#pos-salon-settings-info"
          },
          {
            "key": "salon-menu-nav",
            "label": "Service menu",
            "href": "#pos-salon-settings-services"
          },
          {
            "key": "bao-cao",
            "label": "Reports",
            "href": "https://nexoratouch.com/dashboard/pos/report/technician"
          },
          {
            "key": "may-in-bien-lai",
            "label": "Receipt printer",
            "href": "https://nexoratouch.com/dashboard/pos/printer"
          }
        ]
      },
      {
        "key": "khach-tiep-thi",
        "label": "Customers & marketing",
        "children": [
          {
            "key": "khach-hang",
            "label": "Customers",
            "href": "https://nexoratouch.com/dashboard/pos?tab=customer"
          },
          {
            "key": "pos-call-log",
            "label": "Call log",
            "navContext": "pos",
            "href": "#pos-call-log"
          },
          {
            "key": "pos-promotions",
            "label": "Promotions",
            "href": "#pos-promotions"
          },
          {
            "key": "pos-sms",
            "label": "SMS Campaign",
            "href": "#pos-sms-campaigns"
          },
          {
            "key": "pos-loyalty",
            "label": "Loyalty",
            "href": "#pos-loyalty"
          },
          {
            "key": "pos-gift",
            "label": "Gift Card Center",
            "href": "#module-gift"
          }
        ]
      },
      {
        "key": "tai-chinh-chi-tra",
        "label": "Finance & payouts",
        "iconKey": "payments",
        "showIcon": true,
        "externalIndicator": true,
        "shortcutTo": "tong-quan-thanh-toan",
        "href": "#module-payments"
      }
    ]
  },
  {
    "key": "products",
    "label": "All products",
    "toggleProducts": true
  },
  {
    "key": "community",
    "productMenu": true,
    "label": "Community",
    "iconKey": "community",
    "href": "https://nexoratouch.com/dashboard/community",
    "children": [
      {
        "key": "bang-tin",
        "label": "Feed",
        "href": "https://nexoratouch.com/dashboard/community"
      },
      {
        "key": "nhom-cho",
        "label": "Groups & Market",
        "href": "https://nexoratouch.com/dashboard/community?tab=groups"
      },
      {
        "key": "viec-lam",
        "label": "Jobs",
        "href": "https://nexoratouch.com/dashboard/community?tab=jobs"
      },
      {
        "key": "community-extra-shifts",
        "label": "Extra shifts",
        "href": "https://nexoratouch.com/dashboard/community?tab=shift"
      },
      {
        "key": "community-deals",
        "label": "Deals & Coupons",
        "availability": "unavailable"
      },
      {
        "key": "tin-nhan-cuoc-goi",
        "label": "Messages & calls",
        "href": "https://nexoratouch.com/dashboard/community?tab=connect"
      }
    ],
    "showIcon": true
  },
  {
    "key": "booking",
    "productMenu": true,
    "label": "AI Hub",
    "iconKey": "aihub",
    "children": [
      {
        "key": "ai-marketing",
        "label": "AI Marketing",
        "iconKey": "marketing",
        "showIcon": true,
        "href": "#module-aihub-marketing"
      },
      {
        "key": "ai-voice-si-pos",
        "label": "AI Voice · SI POS",
        "iconKey": "ai-voice",
        "showIcon": true,
        "href": "#pos-ai-voice"
      },
      {
        "key": "aihub-sms-campaigns",
        "label": "SMS Campaigns",
        "iconKey": "news",
        "showIcon": true,
        "navContext": "aihub",
        "href": "https://nexoratouch.com/dashboard/ai-hub?tab=sms-campaigns"
      },
      {
        "key": "spin-wheel",
        "label": "Spin Wheel",
        "iconKey": "spinwheel",
        "showIcon": true,
        "href": "#module-spinwheel"
      },
      {
        "key": "ai-receptionist",
        "label": "AI Receptionist",
        "dividerBefore": true,
        "children": [
          {
            "key": "lich-hen",
            "label": "Appointments",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=today"
          },
          {
            "key": "lich",
            "label": "Calendar",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=calendar"
          },
          {
            "key": "khach-hang-2",
            "label": "Customers",
            "href": "#pos-voice-customers"
          },
          {
            "key": "nhat-ky-cuoc-goi",
            "label": "Call log",
            "navContext": "ai-receptionist",
            "href": "#pos-call-log"
          },
          {
            "key": "goi-su-dung",
            "label": "Plans",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=plans"
          },
          {
            "key": "cai-dat-le-tan-ai",
            "label": "AI Receptionist Settings",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=settings"
          }
        ]
      },
      {
        "key": "marketing-assistant",
        "label": "Marketing Assistant",
        "children": [
          {
            "key": "khuyen-mai-pos",
            "label": "POS promotions",
            "href": "https://nexoratouch.com/dashboard/pos/promotions"
          },
          {
            "key": "review",
            "label": "Reviews",
            "href": "https://nexoratouch.com/dashboard/reviews"
          },
          {
            "key": "khach-hang-3",
            "label": "Customers",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=customers"
          },
          {
            "key": "analytics",
            "label": "Analytics",
            "href": "https://nexoratouch.com/dashboard/analytics"
          },
          {
            "key": "vlinkpay-campaigns",
            "label": "Campaigns · VLinkPay",
            "newTab": true,
            "href": "https://merchant.vlinkpay.com/campaign-management?pageIndex=0&pageSize=10"
          },
          {
            "key": "vlinkpay-ai-ads",
            "label": "AI Ads · VLinkPay",
            "href": "https://merchant.vlinkpay.com/marketing-tools"
          }
        ]
      }
    ],
    "showIcon": true
  },
  {
    "key": "business-tools",
    "productMenu": true,
    "label": "Business tools",
    "iconKey": "oneqr",
    "availability": "preview",
    "children": [
      {
        "key": "stations",
        "label": "One QR",
        "iconKey": "oneqr",
        "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=one-qr",
        "children": [
          {
            "key": "qr-tai-tiem",
            "label": "In-salon QR",
            "children": [
              {
                "key": "tong-quan-one-qr",
                "label": "One QR overview",
                "href": "#module-oneqr"
              },
              {
                "key": "oneqr-2",
                "label": "OneQR",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=one-qr"
              },
              {
                "key": "nhan-tip",
                "label": "Accept tips",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=tip"
              },
              {
                "key": "nhan-thanh-toan",
                "label": "Receive payments",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=payment"
              },
              {
                "key": "customer-self-check-in",
                "label": "Check-in",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=check-in"
              }
            ]
          },
          {
            "key": "chia-se-moi",
            "label": "Share & invite",
            "children": [
              {
                "key": "lien-ket-gioi-thieu",
                "label": "Referral Link",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=referral"
              },
              {
                "key": "qr-moi-nhan-vien",
                "label": "Staff Invite QR",
                "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=staff-invite"
              }
            ]
          }
        ]
      },
      {
        "key": "payments",
        "label": "Payment Gateway",
        "iconKey": "payments",
        "children": [
          {
            "key": "thu-nhap-tiem",
            "label": "Salon income",
            "children": [
              {
                "key": "tong-quan-thanh-toan",
                "label": "Payment overview",
                "href": "#module-payments"
              },
              {
                "key": "nhan-thanh-toan-2",
                "label": "Receive payments",
                "href": "https://nexoratouch.com/dashboard/reports?tab=receive_payments"
              }
            ]
          },
          {
            "key": "chi-tra-nhan-vien",
            "label": "Staff payouts",
            "children": [
              {
                "key": "tong-quan-tien-tip",
                "label": "Tip overview",
                "href": "https://nexoratouch.com/dashboard/tips?tab=overview"
              },
              {
                "key": "danh-sach-tip",
                "label": "Tip list",
                "href": "https://nexoratouch.com/dashboard/reports?tab=tips"
              },
              {
                "key": "payroll-chi-tra",
                "label": "Payroll / payouts",
                "href": "https://nexoratouch.com/dashboard/tips?tab=payouts"
              },
              {
                "key": "direct-savings",
                "label": "Direct Savings",
                "href": "https://nexoratouch.com/dashboard/tips?tab=savings"
              }
            ]
          },
          {
            "key": "may-ca-the",
            "label": "Card terminal",
            "children": [
              {
                "key": "hoat-dong-thanh-toan",
                "label": "Payment activity",
                "href": "https://nexoratouch.com/dashboard/reports?tab=direct_payments"
              }
            ]
          },
          {
            "key": "cau-hinh",
            "label": "Settings",
            "children": [
              {
                "key": "quan-ly-danh-muc",
                "label": "Category management",
                "href": "https://nexoratouch.com/dashboard/category-management"
              }
            ]
          }
        ]
      },
      {
        "key": "reviews-2",
        "label": "Reviews",
        "iconKey": "reviews",
        "href": "https://nexoratouch.com/dashboard/reviews"
      },
      {
        "key": "analytics-2",
        "label": "Analytics",
        "iconKey": "analytics",
        "href": "https://nexoratouch.com/dashboard/analytics"
      },
      {
        "key": "tax-iq",
        "label": "Tax IQ",
        "iconKey": "taxiq",
        "href": "#module-taxiq",
        "availability": "preview"
      }
    ],
    "showIcon": true
  },
  {
    "key": "news-library",
    "label": "News & Library",
    "iconKey": "news",
    "href": "https://nexoratouch.com/dashboard/news-library?tab=news"
  },
  {
    "key": "support",
    "label": "Support",
    "iconKey": "support",
    "href": "https://nexoratouch.com/dashboard/support"
  },
  {
    "key": "settings",
    "label": "Settings",
    "iconKey": "settings",
    "href": "owner-setting.html",
    "page": "owner-settings",
    "accountOnly": true
  }
];
  function prepare(items) {
    items.forEach(function (node) {
      if (node.href) node.href = resolve(node.href, node.opsView);
      if (node.href && node.navContext) node.href += (node.href.indexOf('?') === -1 ? '?' : '&') + 'nav=' + encodeURIComponent(node.navContext);
      if (node.newTab && node.href && !/^https?:/.test(node.href)) { node.externalIndicator = true; delete node.newTab; }
      if (node.href && node.href.indexOf('community.html?tab=') === 0) { node.page = 'community'; node.tab = node.href.split('tab=')[1]; }
      if (node.href && node.href.indexOf('booking-book-phase-1.html?tab=') === 0) { node.page = 'booking'; node.tab = new URLSearchParams(node.href.split('?')[1]).get('tab'); }
      if (node.href && node.href.indexOf('qr-stations.html?tab=') === 0) { node.page = 'stations'; node.tab = new URLSearchParams(node.href.split('?')[1]).get('tab'); }
      if (node.children) prepare(node.children);
    });
  }
  prepare(nodes);
  window.NEXORA_SHELL_NAV = {nodes: nodes, resolve: resolve};
})();
