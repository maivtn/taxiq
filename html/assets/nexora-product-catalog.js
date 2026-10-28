/* Product copy and availability from PO dashboard.html, Oct 27, 2026. */
window.NEXORA_PRODUCT_CATALOG = {
  "oneqr": {
    "title": "One QR",
    "description": "One fixed QR code with role-based menus. Guests can check in, book appointments, view services and offers, leave reviews, tip or pay, depending on configuration.",
    "status": "7 QR tools",
    "groups": [
      {
        "name": "In-salon QR",
        "items": [
          {
            "label": "OneQR",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=one-qr"
          },
          {
            "label": "Accept tips",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=tip"
          },
          {
            "label": "Receive payments",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=payment"
          },
          {
            "label": "Check-in",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=check-in"
          }
        ]
      },
      {
        "name": "Share & invite",
        "items": [
          {
            "label": "Referral Link",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=referral"
          },
          {
            "label": "Staff Invite QR",
            "url": "https://nexoratouch.com/dashboard/touchpoints?tab=stations&section=staff-invite"
          }
        ]
      }
    ],
    "key": "oneqr",
    "iconKey": "oneqr",
    "dashboardVisible": true,
    "category": "pos payments customers",
    "search": "oneqr qr tip reviews danh gia thanh toan",
    "cardDescription": "One QR opens services, tips, reviews and payments on a phone.",
    "cardCategory": "QR EXPERIENCE",
    "cardStatus": "5 operating areas",
    "tags": [
      "Custom menu",
      "Tips & payments"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 7,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "payments": {
    "title": "Payments & Payouts",
    "description": "Salon income, staff payouts and card transactions. Proposed screens are marked.",
    "status": "9 screens",
    "groups": [
      {
        "name": "Salon income",
        "items": [
          {
            "label": "Receive payments",
            "url": "https://nexoratouch.com/dashboard/reports?tab=receive_payments"
          },
          {
            "label": "Income by period",
            "url": "payment-income-period.html"
          }
        ]
      },
      {
        "name": "Staff payouts",
        "items": [
          {
            "label": "Tip overview",
            "url": "https://nexoratouch.com/dashboard/tips?tab=overview"
          },
          {
            "label": "Tip list",
            "url": "https://nexoratouch.com/dashboard/reports?tab=tips"
          },
          {
            "label": "Payroll / payouts",
            "url": "https://nexoratouch.com/dashboard/tips?tab=payouts"
          },
          {
            "label": "Direct Savings",
            "url": "https://nexoratouch.com/dashboard/tips?tab=savings"
          },
          {
            "label": "Payout history by staff member",
            "url": "staff-payout-history.html"
          }
        ]
      },
      {
        "name": "Card terminal",
        "items": [
          {
            "label": "Payment activity",
            "url": "https://nexoratouch.com/dashboard/reports?tab=direct_payments"
          },
          {
            "label": "Card transaction history (proposed)",
            "unavailable": true
          },
          {
            "label": "Card terminal reconciliation (proposed)",
            "unavailable": true
          }
        ]
      },
      {
        "name": "Settings",
        "items": [
          {
            "label": "Category management",
            "url": "https://nexoratouch.com/dashboard/category-management"
          }
        ]
      }
    ],
    "key": "payments",
    "iconKey": "payments",
    "dashboardVisible": true,
    "category": "payments analytics",
    "search": "payments payouts thu nhap tiệm income nhan vien lich su chi tra payroll giao dich may ca the card terminal thanh toan tips doi soat",
    "cardDescription": "Track income, tips, transactions and team payouts.",
    "cardCategory": "PAYMENTS",
    "cardStatus": "9 screens",
    "tags": [
      "Receive payments",
      "Staff payouts"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 9,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "pos": {
    "title": "SI POS",
    "description": "Run your salon across the front desk, schedule, team, customers and revenue.",
    "status": "Hub",
    "groups": [
      {
        "name": "Front desk & services",
        "items": [
          {
            "label": "Check-in",
            "description": "Confirm customer arrival",
            "icon": "arrival",
            "url": "https://nexoratouch.com/dashboard/pos?tab=checkin"
          },
          {
            "label": "Tickets",
            "description": "View active services",
            "icon": "ticket",
            "url": "https://nexoratouch.com/dashboard/pos?tab=orderlist"
          },
          {
            "label": "Turn Board",
            "description": "Track service rotation",
            "icon": "queue",
            "url": "https://nexoratouch.com/dashboard/pos?tab=turnboard"
          },
          {
            "label": "Checkout",
            "description": "Complete checkout",
            "icon": "card",
            "url": "https://nexoratouch.com/dashboard/pos?tab=checkoutcustomer"
          },
          {
            "label": "Gift Card Center",
            "description": "Open gift cards and membership tools",
            "icon": "gift",
            "url": "#module-gift"
          },
          {
            "label": "Completed Services",
            "description": "View completed services",
            "icon": "done",
            "url": "https://nexoratouch.com/dashboard/pos?tab=completed"
          },
          {
            "label": "Salon Service Menu",
            "description": "Open this salon’s live service menu",
            "icon": "list",
            "url": "https://nexoratouch.com/menu/bitcoin-nail-bar-1b8cb587-9d36bc13?oneQrAs=customer"
          },
          {
            "label": "Manage services",
            "description": "Edit services, prices and durations",
            "icon": "settings",
            "url": "https://nexoratouch.com/dashboard/pos/settings/services"
          }
        ]
      },
      {
        "name": "Schedule & staff",
        "items": [
          {
            "label": "Appointments",
            "description": "View and manage appointments",
            "icon": "calendar",
            "url": "https://nexoratouch.com/dashboard/pos?tab=booking"
          },
          {
            "label": "Booking calendar",
            "description": "View bookings by day",
            "icon": "calendar",
            "url": "#pos-booking-calendar"
          },
          {
            "label": "Technician appointments",
            "description": "View appointments by technician",
            "icon": "team",
            "url": "#pos-booking-staff"
          },
          {
            "label": "Estimate",
            "description": "Estimate service cost",
            "icon": "estimate",
            "url": "https://nexoratouch.com/dashboard/pos?tab=estimate"
          },
          {
            "label": "Time clock",
            "description": "Track staff hours",
            "icon": "clock",
            "url": "https://nexoratouch.com/dashboard/pos?tab=timeclock"
          }
        ]
      },
      {
        "name": "Customers & growth",
        "items": [
          {
            "label": "Booking requests",
            "description": "View customer booking requests",
            "icon": "calendar",
            "url": "#pos-booking-requests"
          },
          {
            "label": "Booking calendar",
            "description": "View booked customer times",
            "icon": "calendar",
            "url": "#pos-booking-calendar"
          },
          {
            "label": "Customer appointments",
            "description": "View customer appointments",
            "icon": "customer",
            "url": "#pos-booking-customers"
          },
          {
            "label": "Technician appointments",
            "description": "View appointments by technician",
            "icon": "team",
            "url": "#pos-booking-staff"
          },
          {
            "label": "Customer profiles",
            "description": "Customer and service history",
            "icon": "customer",
            "url": "https://nexoratouch.com/dashboard/pos?tab=customer"
          },
          {
            "label": "Loyalty",
            "description": "Reward points and customer benefits",
            "icon": "star",
            "url": "https://nexoratouch.com/dashboard/pos/loyalty"
          },
          {
            "label": "Promotions",
            "description": "Create customer offers",
            "icon": "gift",
            "url": "https://nexoratouch.com/dashboard/pos/promotions"
          },
          {
            "label": "Reviews",
            "description": "View customer feedback",
            "icon": "star",
            "url": "https://nexoratouch.com/dashboard/reviews"
          },
          {
            "label": "AI Receptionist",
            "description": "Help with appointments and calls",
            "icon": "spark",
            "url": "#pos-ai-voice"
          }
        ]
      },
      {
        "name": "Marketing & campaigns",
        "items": [
          {
            "label": "Create campaign",
            "description": "Choose a goal, audience and message",
            "icon": "spark",
            "url": "products/ai-marketing/studio.html#create"
          },
          {
            "label": "Manage campaigns",
            "description": "View and edit saved drafts",
            "icon": "list",
            "url": "products/ai-marketing/studio.html#manage"
          },
          {
            "label": "Marketing performance",
            "description": "Compare reach and booked appointments",
            "icon": "chart",
            "url": "products/ai-marketing/studio.html#performance"
          },
          {
            "label": "SMS Campaigns",
            "description": "Open SMS campaigns in NEXORA",
            "icon": "phone",
            "url": "https://nexoratouch.com/dashboard/ai-hub?tab=sms-campaigns"
          }
        ]
      },
      {
        "name": "AI Voice & calls",
        "items": [
          {
            "label": "AI Voice overview",
            "description": "Calls and customers in SI POS",
            "icon": "phone",
            "url": "#pos-ai-voice"
          },
          {
            "label": "Call log",
            "description": "Review calls and outcomes",
            "icon": "list",
            "url": "#pos-call-log"
          },
          {
            "label": "Call customers",
            "description": "Open profiles linked to calls",
            "icon": "customer",
            "url": "#pos-voice-customers"
          },
          {
            "label": "AI Voice setup",
            "description": "Setup guide on Nexora",
            "icon": "settings",
            "url": "https://nexoratouch.com/dashboard/ai-hub/setup-guide"
          }
        ]
      },
      {
        "name": "Revenue & payments",
        "items": [
          {
            "label": "Sales",
            "description": "View the available payments report",
            "icon": "chart",
            "url": "https://nexoratouch.com/dashboard/reports?tab=receive_payments"
          },
          {
            "label": "Transactions",
            "description": "Track payment activity",
            "icon": "list",
            "url": "https://nexoratouch.com/dashboard/reports?tab=direct_payments"
          },
          {
            "label": "Staff payouts",
            "description": "View staff payouts",
            "icon": "team",
            "url": "https://nexoratouch.com/dashboard/tips?tab=payouts"
          },
          {
            "label": "Analytics",
            "description": "View tip and QR trends",
            "icon": "chart",
            "url": "https://nexoratouch.com/dashboard/analytics"
          }
        ]
      },
      {
        "name": "POS management",
        "items": [
          {
            "label": "Salon settings",
            "description": "Salon information and operating settings",
            "icon": "settings",
            "url": "https://nexoratouch.com/dashboard/pos/settings/salon-information"
          },
          {
            "label": "POS reports",
            "description": "Track staff and revenue",
            "icon": "chart",
            "url": "https://nexoratouch.com/dashboard/pos/report/technician"
          },
          {
            "label": "Receipt printer",
            "description": "Configure receipt printers",
            "icon": "settings",
            "url": "https://nexoratouch.com/dashboard/pos/printer"
          }
        ]
      },
      {
        "name": "Gift Card Center",
        "sections": [
          {
            "name": "Issue & design",
            "items": [
              {
                "label": "Issue digital card",
                "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital",
                "newTab": true
              },
              {
                "label": "Membership card",
                "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital?type=membership",
                "newTab": true
              },
              {
                "label": "Quick online setup",
                "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/quick-create-card?type=0",
                "newTab": true
              },
              {
                "label": "Advanced E-Gift setup",
                "description": "This flow requires business verification (KYB).",
                "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/sell-egift-form?type=0",
                "newTab": true
              }
            ]
          },
          {
            "name": "Manage & accept",
            "items": [
              {
                "label": "Manage issued cards",
                "url": "https://merchant.vlinkpay.com/gift-voucher/product-management?tab=all&pageSize=10",
                "newTab": true
              },
              {
                "label": "Accept card payment",
                "url": "https://merchant.vlinkpay.com/payment-process/payment-gift-card",
                "newTab": true
              }
            ]
          },
          {
            "name": "Membership & reports",
            "items": [
              {
                "label": "Membership program",
                "url": "https://merchant.vlinkpay.com/settings/benefits-setup",
                "newTab": true
              },
              {
                "label": "Membership report",
                "url": "https://merchant.vlinkpay.com/settings/membership-report",
                "newTab": true
              },
              {
                "label": "Card payment history",
                "url": "https://merchant.vlinkpay.com/reports/card-transaction-history",
                "newTab": true
              },
              {
                "label": "Expiring cards",
                "url": "https://merchant.vlinkpay.com/reports/expiring-cards",
                "newTab": true
              }
            ]
          }
        ]
      }
    ],
    "key": "pos",
    "iconKey": "pos",
    "dashboardVisible": true,
    "category": "pos customers analytics",
    "search": "si pos super intelligence pos dieu hanh tiem quầy dich vu lich nhan su khach hang doanh thu thanh toan checkin check-in booking",
    "cardDescription": "Check-in, turn board, appointments and sales in one flow.",
    "cardCategory": "OPERATIONS",
    "cardStatus": "Hub",
    "tags": [
      "Check-in",
      "Schedule & staff"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 0,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "aihub": {
    "title": "AI Hub",
    "description": "AI receptionist and marketing tools in one place.",
    "status": "2 AI assistants",
    "groups": [
      {
        "name": "AI Receptionist",
        "sections": [
          {
            "name": "Booking",
            "items": [
              {
                "label": "Appointments",
                "url": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=today"
              },
              {
                "label": "Calendar",
                "url": "https://nexoratouch.com/dashboard/ai-hub?tab=booking&view=calendar"
              }
            ]
          },
          {
            "name": "Customers & calls",
            "items": [
              {
                "label": "Customers",
                "url": "#pos-voice-customers"
              },
              {
                "label": "Call Log",
                "url": "#pos-call-log"
              }
            ]
          },
          {
            "name": "Setup",
            "items": [
              {
                "label": "Plans",
                "url": "https://nexoratouch.com/dashboard/ai-hub?tab=plans"
              },
              {
                "label": "AI Receptionist Settings",
                "url": "https://nexoratouch.com/dashboard/ai-hub?tab=settings"
              },
              {
                "label": "AI Voice setup guide",
                "url": "https://nexoratouch.com/dashboard/ai-hub/setup-guide"
              }
            ]
          }
        ]
      },
      {
        "name": "Marketing Assistant",
        "upcoming": "In development: AI content, review reply suggestions, customer segments and campaign results.",
        "sections": [
          {
            "name": "Nexora",
            "items": [
              {
                "label": "POS promotions",
                "url": "https://nexoratouch.com/dashboard/pos/promotions"
              },
              {
                "label": "Reviews",
                "url": "https://nexoratouch.com/dashboard/reviews"
              },
              {
                "label": "Customers",
                "url": "https://nexoratouch.com/dashboard/ai-hub?tab=customers"
              },
              {
                "label": "Analytics",
                "url": "https://nexoratouch.com/dashboard/analytics"
              }
            ]
          },
          {
            "name": "VLinkPay",
            "items": [
              {
                "label": "Campaigns",
                "url": "https://merchant.vlinkpay.com/campaign-management?pageIndex=0&pageSize=10",
                "newTab": true
              },
              {
                "label": "Prize wheel demo",
                "demo": "wheel"
              },
              {
                "label": "AI Ads",
                "url": "https://merchant.vlinkpay.com/marketing-tools"
              }
            ]
          }
        ]
      }
    ],
    "key": "aihub",
    "iconKey": "aihub",
    "dashboardVisible": true,
    "category": "marketing customers",
    "search": "ai hub ai receptionist marketing assistant ai marketing vlinkpay campaign management ai ads sms chien dich quang cao noi dung khach hang booking call log",
    "cardDescription": "AI Receptionist supports appointments and calls; Marketing Assistant helps reach customers.",
    "cardCategory": "AI ASSISTANTS",
    "cardStatus": "2 AI assistants",
    "tags": [
      "AI Receptionist",
      "Marketing Assistant"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 1,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "reviews": {
    "title": "Reviews",
    "description": "Customer reviews and feedback.",
    "status": "Available",
    "groups": [
      {
        "name": "Reviews",
        "items": [
          {
            "label": "View reviews",
            "url": "https://nexoratouch.com/dashboard/reviews"
          }
        ]
      }
    ],
    "key": "reviews",
    "iconKey": "reviews",
    "dashboardVisible": true,
    "category": "customers marketing",
    "search": "reviews danh gia google yelp phan hoi khach hang",
    "cardDescription": "Track guest reviews and responses after a service.",
    "cardCategory": "FEEDBACK",
    "cardStatus": "Available",
    "tags": [
      "Reviews",
      "Customer feedback"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 10,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "gift": {
    "title": "Gift Card Center",
    "description": "Issue, design, manage and accept gift cards; track memberships and expiration.",
    "status": "Available",
    "groups": [
      {
        "name": "Issue & design",
        "items": [
          {
            "label": "Issue digital card",
            "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital",
            "newTab": true
          },
          {
            "label": "Membership card",
            "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/issue-digital?type=membership",
            "newTab": true
          },
          {
            "label": "Quick online setup",
            "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/quick-create-card?type=0",
            "newTab": true
          },
          {
            "label": "Advanced E-Gift setup",
            "description": "This flow requires business verification (KYB).",
            "url": "https://merchant.vlinkpay.com/gift-voucher/product-management/sell-egift-form?type=0",
            "newTab": true
          }
        ]
      },
      {
        "name": "Manage & accept",
        "items": [
          {
            "label": "Manage issued cards",
            "url": "https://merchant.vlinkpay.com/gift-voucher/product-management?tab=all&pageSize=10",
            "newTab": true
          },
          {
            "label": "Accept card payment",
            "url": "https://merchant.vlinkpay.com/payment-process/payment-gift-card",
            "newTab": true
          }
        ]
      },
      {
        "name": "Membership & reports",
        "items": [
          {
            "label": "Membership program",
            "url": "https://merchant.vlinkpay.com/settings/benefits-setup",
            "newTab": true
          },
          {
            "label": "Membership report",
            "url": "https://merchant.vlinkpay.com/settings/membership-report",
            "newTab": true
          },
          {
            "label": "Card payment history",
            "url": "https://merchant.vlinkpay.com/reports/card-transaction-history",
            "newTab": true
          },
          {
            "label": "Expiring cards",
            "url": "https://merchant.vlinkpay.com/reports/expiring-cards",
            "newTab": true
          }
        ]
      }
    ],
    "key": "gift",
    "iconKey": "gift",
    "dashboardVisible": true,
    "category": "gift marketing",
    "search": "gift card voucher qua tang membership phát hành thiết kế e-gift thanh toán báo cáo hết hạn",
    "cardDescription": "Issue gift and digital cards and manage membership benefits.",
    "cardCategory": "SI POS · CARDS & MEMBERSHIP",
    "cardStatus": "Inside SI POS",
    "tags": [
      "Gift Card",
      "Membership"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 5,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "analytics": {
    "title": "Analytics",
    "description": "Tip trends, rankings and QR point performance.",
    "status": "Available",
    "groups": [
      {
        "name": "Reports",
        "items": [
          {
            "label": "View analytics",
            "url": "https://nexoratouch.com/dashboard/analytics"
          }
        ]
      }
    ],
    "key": "analytics",
    "iconKey": "analytics",
    "dashboardVisible": true,
    "category": "analytics payments",
    "search": "analytics bao cao phan tich doanh thu tip hieu suat nhan vien qr",
    "cardDescription": "See tip trends and performance at each QR touchpoint.",
    "cardCategory": "ANALYTICS",
    "cardStatus": "Available",
    "tags": [
      "Tip trends",
      "QR performance"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 11,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "community": {
    "title": "Community",
    "description": "Connect businesses, professionals and customers through content, opportunities and conversations.",
    "status": "Available",
    "groups": [
      {
        "name": "Community & jobs",
        "items": [
          {
            "label": "Feed",
            "url": "https://nexoratouch.com/dashboard/community"
          },
          {
            "label": "Groups & Market",
            "url": "https://nexoratouch.com/dashboard/community?tab=groups"
          },
          {
            "label": "Jobs",
            "url": "https://nexoratouch.com/dashboard/community?tab=jobs"
          },
          {
            "label": "Extra shifts",
            "url": "https://nexoratouch.com/dashboard/community?tab=shift"
          }
        ]
      },
      {
        "name": "Communication",
        "items": [
          {
            "label": "Messages, group chats & calls",
            "url": "https://nexoratouch.com/dashboard/community?tab=connect"
          }
        ]
      }
    ],
    "key": "community",
    "iconKey": "community",
    "dashboardVisible": true,
    "category": "community",
    "search": "community cong dong bang tin nhom cho fanpage blog viec lam ca lam them deal coupon tin nhan chat goi thoai video call messages calls",
    "cardDescription": "Businesses, professionals and customers connect through content, opportunities and conversations.",
    "cardCategory": "CONNECT",
    "cardStatus": "Available",
    "tags": [
      "Jobs & offers",
      "Chat, voice & video"
    ],
    "action": "View details",
    "availability": "available",
    "showcaseOrder": 6,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "taxiq": {
    "title": "Tax IQ",
    "description": "A concept for organizing income, expenses, and receipts; no live data is connected.",
    "status": "Concept preview",
    "pending": true,
    "groups": [
      {
        "name": "For businesses · preview",
        "items": [
          {
            "label": "Business overview",
            "unavailable": true
          },
          {
            "label": "Business income",
            "unavailable": true
          },
          {
            "label": "Operating expenses",
            "unavailable": true
          },
          {
            "label": "Receipts",
            "unavailable": true
          }
        ]
      },
      {
        "name": "For individuals · preview",
        "items": [
          {
            "label": "Personal overview",
            "unavailable": true
          },
          {
            "label": "Personal income",
            "unavailable": true
          },
          {
            "label": "Personal expenses",
            "unavailable": true
          },
          {
            "label": "Personal receipts",
            "unavailable": true
          }
        ]
      }
    ],
    "key": "taxiq",
    "iconKey": "taxiq",
    "dashboardVisible": false,
    "availability": "preview",
    "showcaseOrder": 8,
    "landingHref": "salon-home.html#salon-feature-explorer"
  },
  "spinwheel": {
    "title": "Spin Wheel",
    "description": "A prize wheel preview shows how an interactive customer campaign could work.",
    "status": "Preview",
    "pending": true,
    "groups": [
      {
        "name": "Spin Wheel",
        "items": [
          {
            "label": "Try the prize wheel",
            "url": "products/spin-wheel/create.html"
          }
        ]
      }
    ],
    "key": "spinwheel",
    "iconKey": "spinwheel",
    "dashboardVisible": true,
    "category": "marketing gift",
    "search": "spin wheel vong quay vong quay so giai thuong qua tang uu dai chien dich marketing thu quay",
    "cardDescription": "A prize wheel preview shows how an interactive customer campaign could work.",
    "cardCategory": "INTERACTIVE PRIZE WHEEL",
    "cardStatus": "Preview",
    "tags": [
      "Set rewards",
      "Try a spin"
    ],
    "action": "Try the prize wheel",
    "availability": "preview",
    "showcaseOrder": 4,
    "landingHref": "salon-home.html#salon-feature-explorer"
  }
};
