/* Navigation labels and hierarchy from the Oct 27, 2026 PO handoff.
 * Original PO previews are intentionally retained for screens outside this phase.
 * Serve the repository root so ../../from-po/ preview links are available. */
(function () {
  'use strict';
  var preview = '../../from-po/NEXORA_TOUCH_dev_handoff_2026-10-27/';
  var front = {
    checkin: 'pos-front-desk.html?section=checkin', tickets: 'pos-front-desk-tickets.html',
    turns: 'pos-front-desk-turn-board.html', turnboard: 'pos-front-desk-turn-board.html',
    booking: 'pos-front-desk.html?section=appointments&bookingView=booking',
    checkout: 'pos-direct-checkout.html?view=list', checkoutcustomer: 'pos-direct-checkout.html?view=list',
    completed: 'pos-completed-services.html', estimate: 'pos-front-desk.html?section=estimate'
  };
  function resolve(href, opsView) {
    if (opsView && front[opsView]) return front[opsView];
    if (opsView === 'clock') return 'pos-phase-1.html?tab=clock';
    if (!href) return '';
    if (href === '#modules') return 'dashboard.html';
    if (href === '#salon-home') return preview + 'salon-home.html#salon-home';
    if (href === '#dashboard-onboarding') return preview + 'dashboard.html#dashboard-onboarding';
    if (href.indexOf('#module-') === 0) {
      var module = href.slice(8);
      return 'dashboard.html?module=' + (module === 'aihub-marketing' ? 'aihub&section=marketing' : module);
    }
    var anchors = {
      '#pos-front-desk': 'pos-front-desk.html',
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
    if (href[0] === '#') return preview + 'dashboard.html' + href;
    if (!/^https?:/.test(href)) return (href.indexOf('products/') === 0 || href.indexOf('nexora_') === 0 || href === 'index.html') ? preview + href : href;
    var u;
    try { u = new URL(href); } catch (_) { return href; }
    if (u.hostname !== 'nexoratouch.com') return href;
    var path = u.pathname, tab = u.searchParams.get('tab');
    if (path === '/dashboard/community') return 'community.html?tab=' + (tab || 'feed');
    if (path === '/dashboard/reviews') return 'nexora-review.html';
    if (path === '/dashboard/pos' && front[tab]) return front[tab];
    if (path === '/dashboard/pos' && tab === 'timeclock') return 'pos-phase-1.html?tab=clock';
    if (path === '/dashboard/pos/printer') return 'pos-phase-1.html?tab=printer';
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
      var qrTabs = {'one-qr':'one-qr', tip:'qr-stations', payment:'accept-payment', referral:'referral-link', 'staff-invite':'staff-invite-qr'};
      var qrTab = qrTabs[u.searchParams.get('section')];
      if (qrTab) return 'qr-stations.html?tab=' + qrTab;
    }
    if (path === '/dashboard/settings/profile') return 'owner-setting.html';
    if (path === '/dashboard/settings/kyb') return 'owner-setting.html?tab=business-verification';
    if (path === '/dashboard/news-library') return 'news-library.html?tab=' + (tab || 'news');
    if (path === '/dashboard/package-management') return 'nexora-packages.html?tab=overview';
    return href; // Keep PO external destinations where no equivalent local screen exists.
  }
  var nodes = [
  {
    "key": "public-home",
    "label": "Trang chủ Nexora ↗",
    "iconKey": "home",
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
    "label": "Hướng dẫn bắt đầu",
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
            "label": "Đón khách",
            "href": "#pos-front-desk",
            "opsView": "checkin"
          },
          {
            "key": "phieu-dich-vu",
            "label": "Phiếu dịch vụ",
            "href": "#pos-front-desk",
            "opsView": "tickets"
          },
          {
            "key": "chia-turn",
            "label": "Chia turn",
            "href": "#pos-front-desk",
            "opsView": "turns"
          },
          {
            "key": "at-lich",
            "label": "Đặt lịch",
            "href": "#pos-front-desk",
            "opsView": "booking"
          },
          {
            "key": "thu-tien",
            "label": "Thu tiền",
            "href": "#pos-front-desk",
            "opsView": "checkout"
          },
          {
            "key": "a-hoan-tat",
            "label": "Đã hoàn tất",
            "href": "#pos-front-desk",
            "opsView": "completed"
          },
          {
            "key": "bao-gia",
            "label": "Báo giá",
            "href": "#pos-front-desk",
            "opsView": "estimate"
          },
          {
            "key": "cham-cong",
            "label": "Chấm công",
            "href": "#pos-front-desk",
            "opsView": "clock"
          }
        ]
      },
      {
        "key": "quan-ly-tiem",
        "label": "Quản lý tiệm",
        "children": [
          {
            "key": "pos-booking",
            "label": "Lịch hẹn",
            "href": "#pos-booking-calendar"
          },
          {
            "key": "pos-settings",
            "label": "Cài đặt tiệm",
            "href": "#pos-salon-settings-info"
          },
          {
            "key": "salon-menu-nav",
            "label": "Menu dịch vụ",
            "href": "#pos-salon-settings-services"
          },
          {
            "key": "bao-cao",
            "label": "Báo cáo",
            "href": "https://nexoratouch.com/dashboard/pos/report/technician"
          },
          {
            "key": "may-in-bien-lai",
            "label": "Máy in biên lai",
            "href": "https://nexoratouch.com/dashboard/pos/printer"
          }
        ]
      },
      {
        "key": "khach-tiep-thi",
        "label": "Khách & tiếp thị",
        "children": [
          {
            "key": "khach-hang",
            "label": "Khách hàng",
            "href": "https://nexoratouch.com/dashboard/pos?tab=customer"
          },
          {
            "key": "pos-call-log",
            "label": "Nhật ký cuộc gọi",
            "href": "#pos-call-log"
          },
          {
            "key": "pos-promotions",
            "label": "Khuyến mãi",
            "href": "#pos-promotions"
          },
          {
            "key": "pos-sms",
            "label": "Chiến dịch SMS",
            "href": "#pos-sms-campaigns"
          },
          {
            "key": "pos-loyalty",
            "label": "Tích điểm",
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
        "label": "Tài chính & chi trả",
        "iconKey": "payments",
        "href": "#module-payments"
      }
    ]
  },
  {
    "key": "products",
    "label": "Tất cả sản phẩm",
    "availability": "preview",
    "children": [
      {
        "key": "community",
        "label": "Community",
        "iconKey": "community",
        "children": [
          {
            "key": "bang-tin",
            "label": "Bảng tin",
            "href": "https://nexoratouch.com/dashboard/community"
          },
          {
            "key": "nhom-cho",
            "label": "Nhóm & Chợ",
            "href": "https://nexoratouch.com/dashboard/community?tab=groups"
          },
          {
            "key": "viec-lam",
            "label": "Việc làm",
            "href": "https://nexoratouch.com/dashboard/community?tab=jobs"
          },
          {
            "key": "tin-nhan-cuoc-goi",
            "label": "Tin nhắn & cuộc gọi",
            "href": "https://nexoratouch.com/dashboard/community?tab=connect"
          }
        ]
      },
      {
        "key": "booking",
        "label": "AI Hub",
        "iconKey": "aihub",
        "children": [
          {
            "key": "ai-marketing",
            "label": "AI Marketing",
            "iconKey": "marketing",
            "href": "#module-aihub-marketing"
          },
          {
            "key": "ai-voice-si-pos",
            "label": "AI Voice · SI POS",
            "iconKey": "ai-voice",
            "href": "#pos-ai-voice"
          },
          {
            "key": "sms-campaigns",
            "label": "SMS Campaigns",
            "iconKey": "news",
            "href": "https://nexoratouch.com/dashboard/ai-hub?tab=sms-campaigns"
          },
          {
            "key": "spin-wheel",
            "label": "Spin Wheel",
            "iconKey": "spinwheel",
            "href": "#module-spinwheel"
          },
          {
            "key": "ai-receptionist",
            "label": "AI Receptionist",
            "children": [
              {
                "key": "lich-hen",
                "label": "Lịch hẹn",
                "href": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=today"
              },
              {
                "key": "lich",
                "label": "Lịch",
                "href": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=calendar"
              },
              {
                "key": "khach-hang-2",
                "label": "Khách hàng",
                "href": "#pos-voice-customers"
              },
              {
                "key": "nhat-ky-cuoc-goi",
                "label": "Nhật ký cuộc gọi",
                "href": "#pos-call-log"
              },
              {
                "key": "goi-su-dung",
                "label": "Gói sử dụng",
                "href": "https://nexoratouch.com/dashboard/ai-hub?tab=plans"
              },
              {
                "key": "cai-dat-le-tan-ai",
                "label": "Cài đặt Lễ tân AI",
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
                "label": "Khuyến mãi POS",
                "href": "https://nexoratouch.com/dashboard/pos/promotions"
              },
              {
                "key": "review",
                "label": "Reviews",
                "href": "https://nexoratouch.com/dashboard/reviews"
              },
              {
                "key": "khach-hang-3",
                "label": "Khách hàng",
                "href": "https://nexoratouch.com/dashboard/ai-hub?tab=customers"
              },
              {
                "key": "analytics",
                "label": "Analytics",
                "href": "https://nexoratouch.com/dashboard/analytics"
              },
              {
                "key": "vlinkpay-campaigns",
                "label": "Chiến dịch · VLinkPay",
                "newTab": true,
                "href": "https://merchant.vlinkpay.com/campaign-management?pageIndex=0&pageSize=10"
              },
              {
                "key": "vlinkpay-ai-ads",
                "label": "AI Ads · VLinkPay",
                "newTab": true,
                "href": "https://merchant.vlinkpay.com/marketing-tools"
              }
            ]
          }
        ]
      },
      {
        "key": "business-tools",
        "label": "Công cụ doanh nghiệp",
        "iconKey": "oneqr",
        "availability": "preview",
        "children": [
          {
            "key": "stations",
            "label": "One QR",
            "iconKey": "oneqr",
            "children": [
              {
                "key": "qr-tai-tiem",
                "label": "QR tại tiệm",
                "children": [
                  {
                    "key": "tong-quan-one-qr",
                    "label": "Tổng quan One QR",
                    "href": "#module-oneqr"
                  },
                  {
                    "key": "oneqr-2",
                    "label": "OneQR",
                    "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=one-qr"
                  },
                  {
                    "key": "nhan-tip",
                    "label": "Nhận tip",
                    "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=tip"
                  },
                  {
                    "key": "nhan-thanh-toan",
                    "label": "Nhận thanh toán",
                    "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=payment"
                  },
                  {
                    "key": "qr-khach-tu-check-in",
                    "label": "QR khách tự check-in",
                    "href": "https://nexoratouch.com/dashboard/pos/public-checkin"
                  },
                  {
                    "key": "thiet-bi-tu-check-in",
                    "label": "Thiết bị tự check-in",
                    "href": "https://nexoratouch.com/dashboard/pos/devices"
                  }
                ]
              },
              {
                "key": "chia-se-moi",
                "label": "Chia sẻ & mời",
                "children": [
                  {
                    "key": "lien-ket-gioi-thieu",
                    "label": "Liên kết giới thiệu",
                    "href": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=referral"
                  },
                  {
                    "key": "qr-moi-nhan-vien",
                    "label": "QR mời nhân viên",
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
                "label": "Thu nhập tiệm",
                "children": [
                  {
                    "key": "tong-quan-thanh-toan",
                    "label": "Tổng quan thanh toán",
                    "href": "#module-payments"
                  },
                  {
                    "key": "nhan-thanh-toan-2",
                    "label": "Nhận thanh toán",
                    "href": "https://nexoratouch.com/dashboard/reports?tab=receive_payments"
                  }
                ]
              },
              {
                "key": "chi-tra-nhan-vien",
                "label": "Chi trả nhân viên",
                "children": [
                  {
                    "key": "tong-quan-tien-tip",
                    "label": "Tổng quan tiền tip",
                    "href": "https://nexoratouch.com/dashboard/tips?tab=overview"
                  },
                  {
                    "key": "danh-sach-tip",
                    "label": "Danh sách tip",
                    "href": "https://nexoratouch.com/dashboard/reports?tab=tips"
                  },
                  {
                    "key": "payroll-chi-tra",
                    "label": "Payroll / chi trả",
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
                "label": "Máy cà thẻ",
                "children": [
                  {
                    "key": "hoat-dong-thanh-toan",
                    "label": "Hoạt động thanh toán",
                    "href": "https://nexoratouch.com/dashboard/reports?tab=direct_payments"
                  }
                ]
              },
              {
                "key": "cau-hinh",
                "label": "Cấu hình",
                "children": [
                  {
                    "key": "quan-ly-danh-muc",
                    "label": "Quản lý danh mục",
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
        ]
      }
    ]
  },
  {
    "key": "news-library",
    "label": "Tin tức & Tài liệu",
    "iconKey": "news",
    "href": "https://nexoratouch.com/dashboard/news-library?tab=news"
  },
  {
    "key": "support",
    "label": "Hỗ trợ",
    "iconKey": "support",
    "href": "https://nexoratouch.com/dashboard/support"
  },
  {
    "key": "settings",
    "label": "Cài đặt",
    "iconKey": "settings",
    "href": "owner-setting.html",
    "page": "owner-settings",
    "accountOnly": true
  }
];
  function prepare(items) {
    items.forEach(function (node) {
      if (node.href) node.href = resolve(node.href, node.opsView);
      if (node.href && node.href.indexOf('community.html?tab=') === 0) { node.page = 'community'; node.tab = node.href.split('tab=')[1]; }
      if (node.href && node.href.indexOf('booking-book-phase-1.html?tab=') === 0) { node.page = 'booking'; node.tab = new URLSearchParams(node.href.split('?')[1]).get('tab'); }
      if (node.href && node.href.indexOf('qr-stations.html?tab=') === 0) { node.page = 'stations'; node.tab = new URLSearchParams(node.href.split('?')[1]).get('tab'); }
      if (node.children) prepare(node.children);
    });
  }
  prepare(nodes);
  window.NEXORA_SHELL_NAV = {nodes: nodes, resolve: resolve};
})();
