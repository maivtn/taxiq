/* UI copy and catalogs from the referenced Nexora POS screens and supplied PO prototypes. */
window.POS_PROMOTIONS_DEMO_DATA = {
  "copy": {
    "en": {
      "description": "See which deals and coupons are running, and when.",
      "eyebrow": "Reward / Promotions",
      "language": "Language",
      "addPromotion": "Add promotion",
      "noPromotions": "No promotions yet. Add one and it appears at checkout for visits inside its window.",
      "startTemplate": "Start with a template",
      "templateTitle": "Choose a template. Make it yours. Preview.",
      "templateDescription": "Templates fill in the name, terms, discount and schedule. Offers are illustrative; new promotions start disabled until you turn them on.",
      "templateNote": "Have your own design? Start with a template, then upload your banner. Choosing a template does not publish a promotion.",
      "useTemplate": "Use this template",
      "statsAria": "Promotion overview",
      "statTotal": "Promotions",
      "statEnabled": "Enabled",
      "statBanners": "Banners created",
      "managerAria": "Manage promotions",
      "searchPlaceholder": "Search promotion name or badge…",
      "filterAria": "Filter promotions",
      "filterAll": "All statuses",
      "filterDisabled": "Disabled",
      "clearFilters": "Clear filters",
      "loadError": "Could not load promotions",
      "loadErrorHint": "Check your connection and try again.",
      "retry": "Try again",
      "emptyTitle": "No promotions yet",
      "emptyHint": "Choose a template or add your first promotion.",
      "noMatches": "No promotions found",
      "noMatchesHint": "Try another search or choose a different status.",
      "rateOff": "{{rate}} off",
      "specialOffer": "SPECIAL OFFER",
      "inactiveBadge": "Off",
      "activate": "Enable promotion",
      "deactivate": "Disable",
      "edit": "Edit promotion",
      "editAction": "Edit",
      "duplicate": "Duplicate",
      "preview": "Preview",
      "copySuffix": "Copy",
      "moreActions": "More actions",
      "chipCheckout": "POS checkout",
      "chipSms": "SMS",
      "chipEmail": "Email",
      "chipHero": "OneQR hero",
      "chipNearby": "Discover Nearby",
      "chipSearch": "Search Deals",
      "chipCommunity": "Community",
      "chipCross": "Cross-promo",
      "listingPending": "Public listing waiting for review",
      "listingRejected": "Public listing rejected: {{reason}}",
      "manageTitle": "Manage deals & coupons",
      "manageHint": "Track progress, pause, duplicate, and see who redeemed.",
      "kpiRunning": "Running",
      "kpiClaimed": "Coupons claimed",
      "kpiUses": "Redemptions",
      "kpiDiscount": "Discount given",
      "kpiRevenue": "Revenue with offer",
      "searchPrograms": "Search programs…",
      "typeFilterAria": "Offer type",
      "typeAll": "All",
      "dealLabel": "Deal",
      "couponLabel": "Coupon",
      "filterStatusAll": "All statuses",
      "colProgram": "Program",
      "colType": "Type",
      "colSchedule": "Schedule",
      "colProgress": "Progress",
      "colDiscount": "Discount",
      "colRevenue": "Revenue",
      "colStatus": "Status",
      "statusRunning": "Running",
      "statusScheduled": "Scheduled",
      "statusPaused": "Paused",
      "statusSoldOut": "Sold out",
      "statusEnded": "Ended",
      "statusDraft": "Draft",
      "statusPendingReview": "Pending review",
      "statusRejected": "Rejected",
      "progressUses": "{{used}} uses",
      "progressCoupon": "Claimed {{claimed}}/{{total}} · used {{used}}",
      "noEnd": "No end",
      "smsAction": "SMS via AI Hub",
      "smsSoon": "SMS via AI Hub is not on this page yet.",
      "historyAction": "Redemption history",
      "historySoon": "Redemption history is not on this page yet.",
      "historyTitle": "Redemption history",
      "historyHint": "Each time an offer is applied at the POS: who used it, how it was confirmed, who applied it, and the discount.",
      "historyToday": "Today",
      "history7": "7 days",
      "history30": "30 days",
      "historyAllPrograms": "All programs",
      "historyAllMethods": "All methods",
      "historyAllResults": "All results",
      "historyMethodPhone": "Phone",
      "historyMethodCode": "Code",
      "historyMethodPromotion": "Promotion",
      "historyMethodCoupon": "Coupon",
      "historyApplied": "Applied",
      "historyVoided": "Voided",
      "historyRejected": "Rejected",
      "historyTime": "Time",
      "historyClient": "Client",
      "historyMethod": "Method",
      "historyBy": "Applied by",
      "historyDiscount": "Discount",
      "historyResult": "Result",
      "historyEmpty": "No redemptions",
      "historyLoading": "Loading…",
      "historyExport": "CSV",
      "historyExporting": "Exporting…",
      "historyExported": "CSV downloaded",
      "historyExportFailed": "Could not export the CSV.",
      "historyPage": "{{count}} · page {{page}} / {{pages}}",
      "historyPrev": "Previous",
      "historyNext": "Next",
      "historyLoadError": "Could not load redemption history.",
      "historyNote": "Phone numbers stay masked. A void is recorded by the POS; this screen only shows it.",
      "codesAction": "Issued codes",
      "codesTitle": "Issued codes",
      "codesHint": "Codes sent for {{name}}. One phone can appear on more than one row.",
      "codesAllStatuses": "All statuses",
      "codesStatusHeld": "Held",
      "codesStatusUsed": "Used",
      "codesStatusReleased": "Released",
      "codesStatusSmsFailed": "SMS failed",
      "codesColCode": "Code",
      "codesColPhone": "Phone",
      "codesColClaimed": "Claimed",
      "codesColHold": "Hold until",
      "codesColStatus": "Status",
      "codesColUsed": "Used",
      "codesColOrder": "Order",
      "codesEmpty": "No codes issued",
      "codesLoadError": "Could not load issued codes.",
      "codesClose": "Close",
      "metricsNote": "Discount given and revenue show up when a POS bill is linked to the program.",
      "calTitle": "Run calendar",
      "calHint": "What runs when over 4 months.",
      "legendToday": "Today",
      "schEyebrow": "Run schedule",
      "schDates": "Run dates",
      "schStart": "Start",
      "schEnd": "End",
      "schNoEnd": "No end date",
      "schNoEndDeal": "Runs until you turn it off.",
      "schNoEndCoupon": "Coupons still stop when sold out.",
      "schDays": "Days of week",
      "schPresetWeekdays": "Weekdays",
      "schPresetSlow": "Tue–Thu (slow)",
      "schPresetWeekend": "Weekend",
      "schPresetAll": "Every day",
      "schHours": "Hours",
      "schAllDay": "All day (shop opening hours)",
      "schFrom": "From",
      "schTo": "To",
      "schSkip": "Skip dates",
      "schSkipHint": "Add a date (holiday, closed…)",
      "schAddSkip": "Add skip date",
      "schAuto": "Automation",
      "schAutoOn": "Auto-start",
      "schAutoOnHint": "Scheduled → Running on time.",
      "schAutoOff": "Auto-end",
      "schAutoOffHint": "Outside days and hours the POS will not apply it.",
      "schRemind": "Remind me 2 days before it ends",
      "schRemindHint": "With extend or duplicate.",
      "schYearly": "Repeat every year",
      "schYearlyHint": "A draft is created next year for you to approve.",
      "schPreviewRuns": "Runs",
      "schPreviewFrom": "from",
      "schPreviewTo": "to",
      "schPreviewNoEnd": "— no end date",
      "schPreviewDayCount": "{{count}} run days",
      "schPreviewSkip": "skipping {{count}} dates",
      "schWarnEnd": "End date must be after the start date.",
      "schWarnDays": "Pick at least one day.",
      "schWarnHours": "End time must be after the start time.",
      "schWithin": "Within the run window.",
      "schWillSchedule": "Status becomes Scheduled.",
      "schCancel": "Cancel",
      "schSave": "Save schedule",
      "schSaved": "Schedule saved",
      "bannerUnit": "banner",
      "promotionPoster": "Promotion poster",
      "closePreview": "Close preview",
      "printHint": "Print or save as PDF.",
      "print": "Print poster",
      "delete": "Delete promotion",
      "deleteBlocked": "Customers have already used this promotion, so it cannot be deleted. Switch it off instead.",
      "deleteConfirmTitle": "Delete promotion",
      "deleteConfirmMessage": "Delete \"{{name}}\"? This cannot be undone.",
      "createSuccess": "Promotion created.",
      "updateSuccess": "Promotion updated.",
      "enableSuccess": "\"{{name}}\" is now enabled.",
      "disableSuccess": "\"{{name}}\" is now disabled.",
      "deleteSuccess": "\"{{name}}\" was deleted.",
      "studioEyebrow": "Promotion studio",
      "createTitle": "Create promotion",
      "editTitle": "Edit promotion",
      "helpTitle": "Review these 4 parts before using your offer",
      "helpSteps": "① Name & eligible services → ② Discount → ③ Days & times → ④ Banners & placements",
      "helpNote": "Preview as you edit. Save, then enable the promotion from your list when you are ready.",
      "detailsSection": "01 / Promotion details",
      "nameLabel": "Promotion name",
      "namePlaceholder": "e.g. Weekday savings",
      "badgeLabel": "Badge · optional",
      "badgePlaceholder": "e.g. Happy Hours",
      "detailsHint": "Example: 15% off Classic Pedicure, Tue–Thu 10 AM–2 PM; cannot be combined. Clearly state who qualifies and exclusions.",
      "descriptionLabel": "Description · optional",
      "eligibleServicesLabel": "Eligible services",
      "eligibleServicesAll": "All services",
      "eligibleServicesTip": "From the POS service menu. The POS discounts only these services on the bill; Booking tags only these; add-ons are suggested only with a main service.",
      "scheduleSummaryServices": "Eligible services: {{services}}",
      "descriptionPlaceholder": "e.g. 15% off Classic Pedicure, Tue–Thu 10 AM–2 PM",
      "photoLabel": "Image (optional)",
      "scheduleSection": "02 / Discount & schedule",
      "typeLabel": "Discount type",
      "typePercent": "Percent · %",
      "typeAmount": "Amount · $",
      "typePercentShort": "%",
      "typeAmountShort": "$",
      "valueLabel": "Discount value",
      "offerKindRowLabel": "Type",
      "offerKindDealHint": "Unlimited · auto-applies when eligible",
      "offerKindCouponHint": "Limited slots · claim by phone · stops when sold out",
      "offerKindChangeStep": "Change in step ①",
      "slotsLabel": "Slots",
      "slotsPlaceholder": "e.g. 100",
      "perClientLabel": "Per client",
      "dealPer": {
        "visit": "1 per visit",
        "week": "1 per week",
        "month": "1 per month"
      },
      "couponPer": {
        "one": "1 time(s)",
        "two": "2 time(s)",
        "three": "3 time(s)"
      },
      "discountRowLabel": "Discount",
      "discountRowHint": "per use",
      "daysRowLabel": "Days",
      "daysFollowDatesHint": "These dates only include {{days}}. Weekdays outside this range stay off.",
      "dayUnavailable": "This weekday is outside the selected dates.",
      "hoursRowLabel": "Hours",
      "hoursRowHint": "shop time",
      "whoRowLabel": "Customer",
      "whoRowHint": "requirement when used",
      "customerReqLabel": "Customer requirement",
      "customerReq": {
        "online": "Online booking required",
        "appt": "Appointment required",
        "checkin": "Check-in required",
        "none": "No requirement"
      },
      "minSpendLabel": "Minimum spend ($)",
      "minSpendPlaceholder": "e.g. 40 — leave blank for none",
      "monthlyCapLabel": "Monthly cap ($)",
      "monthlyCapPlaceholder": "e.g. 500 — leave blank for no cap",
      "holdDaysLabel": "Hold (days)",
      "couponCodeLabel": "Coupon code (optional)",
      "couponCodePlaceholder": "e.g. NAIL15",
      "moreConditions": "＋ More conditions (optional): goal, minimum spend, cap, code…",
      "scheduleSummaryTitle": "Summary",
      "scheduleSummaryOffer": "Save {{offer}}",
      "scheduleSummaryDeal": "Deal · unlimited — save {{offer}}",
      "scheduleSummaryCoupon": "Coupon · {{slots}} slots — save {{offer}}",
      "daysLabel": "Days it runs",
      "startLabel": "Starts at",
      "endLabel": "Ends at",
      "timeHint": "Shop local time. Start and end times must be on the same day.",
      "placementsSection": "03 / Placements",
      "activeLabel": "Offer this at checkout",
      "checkoutHint": "Available in the POS checkout.",
      "heroLabel": "OneQR hero",
      "heroHint": "Show this promotion’s banners.",
      "publicLabel": "Submit to Search Deals",
      "publicHint": "Public listing requires a separate review.",
      "publicNote": "A public request does not turn on paid advertising or referral rewards.",
      "bannersSection": "04 / Banners & posters",
      "bannerHint": "Reorder banners to choose the cover image. Every banner opens the same promotion.",
      "chooseTheme": "Choose template",
      "uploadedTheme": "Uploaded image",
      "addBanner": "Add banner",
      "themeAlreadyUsed": "Each color template can only be used once. Pick another or upload an image.",
      "themeUsedOption": "{{name}} (in use)",
      "cover": "Cover",
      "previewBanner": "Preview banner",
      "moveUp": "Move up",
      "moveDown": "Move down",
      "removeBanner": "Remove banner",
      "previewPrint": "Preview & print poster",
      "previousBanner": "Previous banner",
      "nextBanner": "Next banner",
      "bannerError": "Keep between 1 and 8 banners.",
      "bannerImageInvalidType": "Use a JPG, PNG, or WebP image under 10 MB.",
      "theme": {
        "purple": "Signature · Purple",
        "gold": "Luxury · Gold",
        "rose": "Soft · Rose",
        "ocean": "Ocean · Blue",
        "teal": "Fresh · Teal",
        "sage": "Nature · Sage",
        "peach": "Sunset · Peach",
        "slate": "Minimal · Slate"
      },
      "upload": "Upload your design",
      "chooseFile": "Choose an image",
      "currentImage": "Current banner image",
      "uploadHint": "PNG / JPG / WebP · up to 8 MB · up to 8 banners",
      "uploadRatioHint": "For the best display, use a 3:1 image (e.g., 1200 × 400 px).",
      "previewUntitled": "Promotion name",
      "livePreviewTitle": "Live preview · updates as you type",
      "liveColorLabel": "Banner colour",
      "liveBannerMeta": "Banner ({{count}}/{{max}}) · first is the cover",
      "liveColorOnce": "Each colour once per promotion (• = in use)",
      "livePreviewHint": "Updates as you type. Switch tabs to see Banner, OneQR, App, Check-in, and POS.",
      "liveTypeDeal": "Deal · unlimited",
      "liveTypeCoupon": "Coupon · limited slots",
      "liveTypeDealShort": "Deal",
      "liveTypeCouponShort": "Coupon",
      "livePosCheckout": "POS checkout",
      "offerKindDealName": "Deal",
      "offerKindCouponName": "Coupon",
      "liveTabBanner": "Banner",
      "liveTabOneQr": "OneQR",
      "liveTabApp": "App",
      "liveTabKiosk": "Check-in",
      "liveTabPos": "POS",
      "liveShopName": "Your salon",
      "liveNearbyPartner": "NEARBY PARTNER",
      "livePartnerOffer": "Bubble tea 1+1",
      "livePartnerPlace": "Partner café · 0.3 mi",
      "liveOneQrCaption": "50/50: left half is always yours · right half is a nearby partner.",
      "liveAppExplore": "App · Explore",
      "liveView": "View",
      "liveKioskIdle": "Check-in kiosk · idle",
      "liveKioskPhone": "Enter phone to check in",
      "livePosService": "Service",
      "livePosCaption": "POS applies automatically when eligible",
      "invalidPreview": "Enter a valid discount",
      "saveNote": "New promotions are saved disabled.",
      "editNote": "Changes take effect after saving.",
      "editDetailLoading": "Loading banners…",
      "editDetailLoadError": "Could not load banners for this promotion. Close and try again.",
      "windowInvalid": "Start and end cannot be the same time. An earlier end runs overnight.",
      "errorNameRequired": "Enter a name for this promotion.",
      "errorValueRequired": "Enter how much this promotion takes off.",
      "errorValueInvalid": "The amount off must be greater than 0.",
      "errorValuePercentMax": "A percent discount cannot be more than {{max}}%.",
      "errorValueAmountMax": "An amount discount cannot be more than ${{max}}.",
      "errorDaysRequired": "Pick at least one day this promotion runs.",
      "errorWindowRequired": "Pick both a start and an end time.",
      "datesRowLabel": "Run dates",
      "datesRowHintCoupon": "Start date is required. Leave the end date empty for no end date.",
      "errorDatePair": "Leave both dates empty for no end date, or set an end date on or after the start.",
      "startDateLabel": "Start date",
      "endDateLabel": "End date",
      "errorStartDateRequired": "A coupon needs a start date.",
      "errorEndDateBeforeStart": "The end date must be on or after the start date.",
      "errorSlotsRequired": "Enter at least 1 slot.",
      "errorHoldDaysRequired": "Enter how many days the code is held.",
      "errorHoldDaysRange": "Hold days must be between 1 and 365.",
      "discountLockedHint": "Codes have already been issued, so the discount stays as it is.",
      "offerTypeLocked": "Deal or coupon cannot be changed",
      "errorServicesRequired": "Pick at least one service for this coupon.",
      "errorPosCheckoutRequired": "A deal must stay on at POS checkout.",
      "save": "Save promotion",
      "cancel": "Cancel",
      "backToList": "Back to promotions",
      "createPageDescription": "Same quick flow as today, with helpful tools on the right.",
      "createPageIntro": "Pick a template or let AI suggest one for your industry — edit anything, then save.",
      "editPageIntro": "Update this offer on the same studio page, then save.",
      "quickCreatePill": "Quick create",
      "studio": {
        "title": "Choose a template · make it yours · preview",
        "subtitle": "Up to 20 templates per industry · choosing one does not publish.",
        "aiQuick": "Quick create with AI",
        "aiSoon": "Coming soon",
        "aiClose": "Close",
        "aiShopName": "Your salon",
        "aiShopIndustry": "Nail · from Salon Settings",
        "aiWantTitle": "What does the shop want?",
        "aiIntent": {
          "fill": "Fill weekday openings",
          "new": "Get new customers",
          "back": "Win back lapsed clients",
          "ticket": "Grow the ticket",
          "season": "Season / upcoming holiday",
          "coupon": "Limited coupon"
        },
        "aiQueryPlaceholder": "Or type: fill Tuesday mornings, coupon for lapsed clients…",
        "aiSuggest": "Suggest",
        "aiSuggestionsTitle": "3 suggestions for your nail shop",
        "aiWhy": "Why",
        "aiWhyReason": {
          "goal": "matches goal",
          "deal": "unlimited deal",
          "coupon": "limited slots",
          "slowDefault": "fills weekday slow hours",
          "couponDefault": "new-guest coupon, capped slots",
          "retainDefault": "brings regulars back",
          "general": "good fit for your shop"
        },
        "aiUse": "Use →",
        "aiNoMatch": "No match — try another intent.",
        "aiNote": "Prototype simulation: AI picks from the template library by industry, goal, day and season. The live version also uses your shop’s POS data and never publishes without owner approval.",
        "previewTitle": "Template preview",
        "previewTabCard": "Customer card",
        "previewTabBanner": "Banner",
        "previewTabOneQr": "OneQR",
        "previewTabKiosk": "Check-in",
        "previewTabPos": "POS",
        "previewClaimLink": "nexora.link/c/…",
        "previewGet": "Get",
        "previewShopName": "Your salon",
        "previewNearbyPartner": "NEARBY PARTNER",
        "previewPartnerOffer": "Bubble tea 1+1",
        "previewPartnerPlace": "Saigon Boba · 0.3 mi",
        "previewOneQrCaption": "Left: this offer · right: partner (if cross-promo on)",
        "previewKioskIdle": "Check-in kiosk · idle",
        "previewKioskPhone": "Enter phone to check in",
        "previewPosService": "Eligible service",
        "previewPosDealHint": "POS applies automatically when eligible",
        "previewPosCouponHint": "Cashier looks up phone → applies once",
        "previewOffer": "Offer",
        "previewSchedule": "Schedule",
        "previewAudience": "Audience",
        "previewRequirement": "Requirement",
        "previewRequirementNone": "None",
        "previewSlots": "Slots",
        "previewMinSpend": "Minimum",
        "previewCode": "Code",
        "previewPrev": "Prev",
        "previewNext": "Next",
        "previewUse": "Use this template →",
        "typeQuestion": "What are you creating?",
        "dealTitle": "Deal · promotion",
        "dealHint": "Unlimited · shown as a banner · auto-applies when eligible",
        "kindDeal": "Deal",
        "kindCoupon": "Coupon",
        "previewKindDeal": "DEAL",
        "previewKindCoupon": "COUPON",
        "previewPosCheckout": "POS checkout",
        "couponTitle": "Coupon",
        "couponHint": "Limited slots · claimed by phone · stops when sold out",
        "noTemplates": "No templates yet",
        "industryLabel": "② Industry",
        "industryGroupLabel": "Group",
        "industryItemLabel": "Industry",
        "yourShop": "your shop",
        "otherIndustries": "Other industry… ({{count}})",
        "allIndustries": "All industries",
        "industryNote": "Industry is the catalog group. Service group lists the industries inside the selected group, in catalog order.",
        "searchPlaceholder": "Search templates: pedicure, birthday, combo…",
        "goalLabel": "Goal",
        "serviceLabel": "Service group",
        "goals": {
          "all": "All",
          "new": "New customers",
          "slow": "Fill slow hours",
          "push": "Push services",
          "ticket": "Higher ticket",
          "retain": "Bring back",
          "community": "Community",
          "seasonal": "Seasonal"
        },
        "services": {
          "all": "All",
          "manicure": "Manicure & gel",
          "pedicure": "Pedicure & feet",
          "dip": "Dip & extensions"
        },
        "showing": "Showing {{shown}} / {{total}} templates",
        "couponFieldsNote": "Slots, code and minimum come from the template library — you can edit them below.",
        "emptyTitle": "No templates for this filter",
        "emptyNoType": "This type has no templates in the catalog yet. You can still create one in the form below.",
        "emptyNoIndustry": "This industry has no templates for the selected type.",
        "emptyReset": "Show my shop templates",
        "view": "View",
        "useTemplate": "Use template →",
        "inUse": "✓ In use",
        "templatePill": "Template: {{name}}"
      },
      "goalLabel": "Goal",
      "goal": {
        "slow": "Fill slow hours",
        "back": "Bring customers back",
        "new": "Get new customers",
        "gift": "Sell gift cards"
      },
      "goalPill": "Suggested for goal: {{goal}}",
      "goalChannelsUpdated": "Channels re-suggested for this goal",
      "channelsSection": "03 / Channels",
      "channelsPolicyNote": "Nexora is the source of truth: every channel uses a Nexora deal page, QR, coupon token, tracking URL and report.",
      "tierInternalTitle": "1 · Internal — my customers",
      "tierInternalHint": "Your salon’s own channels. No fee, no revenue share.",
      "tierInternalTag": "$0 · no fee, no review",
      "tierPublicTitle": "2 · Public — NEXORA network",
      "tierPublicHint": "Shown across the network. No placement guarantee.",
      "tierPublicReview": "first-time review",
      "tierPublicOrganic": "organic click $0",
      "tierPaidTitle": "3 · Paid Boost — paid",
      "tierPaidHint": "No spend until the owner sets a budget and approves.",
      "tierPaidTag": "needs Public + budget + owner approval",
      "channelSuggested": "★ Suggested",
      "channelNewBadge": "NEW",
      "channelSwitchOn": "Running",
      "channelSwitchOff": "Off",
      "postToLabel": "Post to socials / SMS / Email:",
      "postWhenNow": "When enabled",
      "postWhenAuto": "By promotion milestones",
      "postMilestones": "T−3 · start · every 7 days · T−2 expiry",
      "postScheduleEdit": "View & edit",
      "postScheduleTip": "Milestones: 3 days before start, on start, every 7 days (rotating banner), and 2 days before expiry. Moving the dates moves the schedule.",
      "postScheduleHint": "Individual posts are edited on the Programs tab. This page only chooses how they go out.",
      "crossPromoTitle": "Allow cross-promotion for this offer",
      "crossPromoHint": "Shows on the banner of nearby opted-in shops (up to 10 miles, nearest first). NEXORA picks the shops — never same-group competitors or sensitive categories.",
      "checkInCardTitle": "Check-in screen — banners & offers",
      "checkInCardHint": "Kiosk at the door · every visitor sees it",
      "previewCheckIn": "Preview kiosk",
      "bookingCardTitle": "Booking — run the offer at booking",
      "bookingCardHint": "Booking page · AI Voice · confirmations",
      "previewBooking": "Preview booking page",
      "showMoreChannels": "Show {{count}} more channels ▾",
      "showLessChannels": "Show less",
      "noSuggestedChannels": "No suggested channels for this goal.",
      "channelNotConnected": "Channel not connected — open Connections to set it up.",
      "paidNeedsPublic": "Turn on at least one Public channel before Paid Boost.",
      "couponSummary": "Schedule: {{schedule}} · Edit dates, caps, and audience in Advanced.",
      "editAdvanced": "Edit",
      "advancedTitle": "Advanced settings",
      "advancedOptional": "Optional",
      "advStartDate": "Start date",
      "advEndDate": "End date",
      "advRedemptionCap": "Redemption cap (total slots)",
      "advPerPerson": "Limit per person",
      "advPerPerson1": "1 time",
      "advPerPerson2": "2 times",
      "advPerPersonUnlimited": "Unlimited",
      "advHoldDays": "Hold a claimed slot (days)",
      "advBudgetCap": "Budget cap (paid only)",
      "advAudience": "Applies to · POS verifies at check-in",
      "advAudienceRec": "Let Nexora recommend",
      "advAudienceAll": "Everyone",
      "advAudienceNew": "New customers (first visit)",
      "advAudienceExisting": "Existing customers",
      "advAudienceLapsed": "Inactive 45+ days",
      "advCampaign": "Campaign",
      "advCampaignNone": "None",
      "advCampaignOpening": "Grand opening (in window)",
      "advCampaignFall": "Fall Color Collection",
      "advApproval": "Approval",
      "advApprovalDraft": "Save as draft",
      "advApprovalOwner": "Owner approval required",
      "advApprovalInternal": "Auto-enable internal only",
      "heroMixTitle": "Partner content on OneQR Hero & check-in idle screen",
      "heroMix": {
        "own": {
          "title": "Own offer only",
          "hint": "Default. No partner content."
        },
        "strip": {
          "title": "Partner strip",
          "hint": "Small labeled partner deal under the main offer."
        },
        "rotate": {
          "title": "Rotating partner card",
          "hint": "Rotates after the salon offer is shown first."
        }
      },
      "perfFeeTitle": "Accept performance fee",
      "perfFeeHint": "10% eligible service (new) · 5% returning after 90 days when enabled.",
      "toolsSmartTitle": "Smart tools",
      "toolsSmartHint": "Helpful shortcuts, not extra required steps.",
      "toolsAiCopyTitle": "AI content",
      "toolsAiCopyHint": "Generate name, description, SMS, email, and social caption.",
      "toolsPreflightTitle": "Preflight check",
      "toolsComingSoon": "Coming soon",
      "preflightOffer": "Offer, schedule, and terms are complete.",
      "preflightChannels": "Owned channels selected: POS checkout and OneQR Hero.",
      "preflightSms": "SMS audience has opt-in customers available.",
      "preflightPaid": "Paid boost needs owner approval before any ad spend.",
      "saveDraft": "Save draft",
      "turnOn": "Turn on",
      "turnOnPublic": "Turn on & send Public for review",
      "turnOnPublicHint": "Internal channels start now; Public shows after first review.",
      "submitForApproval": "Submit for approval",
      "submitNeedsPublic": "Turn on Search Deals (Public) before submitting for approval."
    },
    "vi": {
      "description": "Xem Deal và Coupon nào đang chạy, và chạy lúc nào.",
      "eyebrow": "Ưu đãi / Khuyến mãi",
      "language": "Ngôn ngữ",
      "addPromotion": "Thêm chương trình",
      "noPromotions": "Chưa có chương trình nào. Thêm một chương trình để nó hiện ở quầy cho các lượt khách trong khung giờ.",
      "startTemplate": "Bắt đầu từ mẫu",
      "templateTitle": "Chọn mẫu. Sửa vài thông tin. Xem trước.",
      "templateDescription": "Mẫu điền sẵn tên, mô tả, ưu đãi và lịch chạy. Giá chỉ minh họa; bản mới luôn tắt cho đến khi bạn bật.",
      "templateNote": "Có thiết kế riêng? Chọn mẫu để điền nội dung, sau đó upload banner. Chương trình mới chưa được xuất bản khi bấm Dùng mẫu.",
      "useTemplate": "Dùng mẫu này",
      "statsAria": "Tổng quan chương trình",
      "statTotal": "Chương trình",
      "statEnabled": "Đang bật",
      "statBanners": "Banner đã tạo",
      "managerAria": "Quản lý chương trình",
      "searchPlaceholder": "Tìm tên chương trình hoặc badge…",
      "filterAria": "Lọc chương trình",
      "filterAll": "Tất cả trạng thái",
      "filterDisabled": "Đang tắt",
      "clearFilters": "Xóa bộ lọc",
      "loadError": "Không tải được chương trình",
      "loadErrorHint": "Kiểm tra kết nối và thử lại.",
      "retry": "Thử lại",
      "emptyTitle": "Chưa có chương trình",
      "emptyHint": "Chọn mẫu hoặc tạo chương trình đầu tiên.",
      "noMatches": "Không tìm thấy chương trình",
      "noMatchesHint": "Thử tên khác hoặc chọn trạng thái khác.",
      "rateOff": "giảm {{rate}}",
      "specialOffer": "ƯU ĐÃI",
      "inactiveBadge": "Đã tắt",
      "activate": "Bật chương trình",
      "deactivate": "Tạm tắt",
      "edit": "Sửa chương trình",
      "editAction": "Chỉnh sửa",
      "duplicate": "Nhân bản",
      "preview": "Xem trước",
      "copySuffix": "Bản sao",
      "moreActions": "Thao tác khác",
      "chipCheckout": "Thanh toán POS",
      "chipSms": "SMS",
      "chipEmail": "Email",
      "chipHero": "Banner OneQR",
      "chipNearby": "Khám phá gần đây",
      "chipSearch": "Tìm ưu đãi",
      "chipCommunity": "Cộng đồng",
      "chipCross": "Đối tác chéo",
      "listingPending": "Kênh công khai đang chờ duyệt",
      "listingRejected": "Kênh công khai bị từ chối: {{reason}}",
      "manageTitle": "Quản lý Deal & Coupon",
      "manageHint": "Xem tiến độ, tạm dừng, nhân bản, và xem ai đã dùng ưu đãi.",
      "kpiRunning": "Đang chạy",
      "kpiClaimed": "Coupon đã lấy",
      "kpiUses": "Lượt đã dùng",
      "kpiDiscount": "Giảm giá đã trừ",
      "kpiRevenue": "Doanh thu có ưu đãi",
      "searchPrograms": "Tìm chương trình…",
      "typeFilterAria": "Loại ưu đãi",
      "typeAll": "Tất cả",
      "dealLabel": "Deal",
      "couponLabel": "Coupon",
      "filterStatusAll": "Mọi trạng thái",
      "colProgram": "Chương trình",
      "colType": "Loại",
      "colSchedule": "Lịch chạy",
      "colProgress": "Tiến độ",
      "colDiscount": "Giảm đã trừ",
      "colRevenue": "Doanh thu",
      "colStatus": "Trạng thái",
      "statusRunning": "Đang chạy",
      "statusScheduled": "Lên lịch",
      "statusPaused": "Tạm dừng",
      "statusSoldOut": "Hết suất",
      "statusEnded": "Đã kết thúc",
      "statusDraft": "Nháp",
      "statusPendingReview": "Chờ duyệt",
      "statusRejected": "Từ chối",
      "progressUses": "{{used}} lượt áp",
      "progressCoupon": "Lấy {{claimed}}/{{total}} · dùng {{used}}",
      "noEnd": "Không kết thúc",
      "smsAction": "Gửi SMS qua AI Hub",
      "smsSoon": "SMS qua AI Hub chưa có trên trang này.",
      "historyAction": "Lịch sử redeem",
      "historySoon": "Lịch sử redeem chưa có trên trang này.",
      "historyTitle": "Lịch sử redeem",
      "historyHint": "Mỗi lần ưu đãi được áp ở POS: ai dùng, cách xác nhận, ai áp, giảm bao nhiêu.",
      "historyToday": "Hôm nay",
      "history7": "7 ngày",
      "history30": "30 ngày",
      "historyAllPrograms": "Mọi chương trình",
      "historyAllMethods": "Mọi cách xác nhận",
      "historyAllResults": "Mọi kết quả",
      "historyMethodPhone": "Số điện thoại",
      "historyMethodCode": "Mã",
      "historyMethodPromotion": "Khuyến mãi",
      "historyMethodCoupon": "Coupon",
      "historyApplied": "Đã áp",
      "historyVoided": "Đã huỷ",
      "historyRejected": "Từ chối",
      "historyTime": "Thời gian",
      "historyClient": "Khách",
      "historyMethod": "Cách xác nhận",
      "historyBy": "Người áp",
      "historyDiscount": "Giảm",
      "historyResult": "Kết quả",
      "historyEmpty": "Chưa có lượt redeem",
      "historyLoading": "Đang tải…",
      "historyExport": "CSV",
      "historyExporting": "Đang xuất…",
      "historyExported": "Đã tải CSV",
      "historyExportFailed": "Không xuất được CSV.",
      "historyPage": "{{count}} · trang {{page}} / {{pages}}",
      "historyPrev": "Trước",
      "historyNext": "Sau",
      "historyLoadError": "Không tải được lịch sử redeem.",
      "historyNote": "Số điện thoại luôn được che. Lượt huỷ do POS ghi; màn này chỉ xem.",
      "codesAction": "Mã đã cấp",
      "codesTitle": "Mã đã cấp",
      "codesHint": "Mã đã gửi cho {{name}}. Một số điện thoại có thể có nhiều dòng.",
      "codesAllStatuses": "Mọi trạng thái",
      "codesStatusHeld": "Đang giữ",
      "codesStatusUsed": "Đã dùng",
      "codesStatusReleased": "Đã trả suất",
      "codesStatusSmsFailed": "Gửi SMS lỗi",
      "codesColCode": "Mã",
      "codesColPhone": "Số điện thoại",
      "codesColClaimed": "Lúc lấy",
      "codesColHold": "Giữ đến",
      "codesColStatus": "Trạng thái",
      "codesColUsed": "Lúc dùng",
      "codesColOrder": "Phiếu",
      "codesEmpty": "Chưa cấp mã",
      "codesLoadError": "Không tải được mã đã cấp.",
      "codesClose": "Đóng",
      "metricsNote": "Giảm đã trừ và doanh thu hiện khi bill POS gắn với chương trình.",
      "calTitle": "Lịch chạy",
      "calHint": "Chương trình nào chạy lúc nào trong 4 tháng.",
      "legendToday": "Hôm nay",
      "schEyebrow": "Lịch chạy",
      "schDates": "Thời gian chạy",
      "schStart": "Bắt đầu",
      "schEnd": "Kết thúc",
      "schNoEnd": "Không đặt ngày kết thúc",
      "schNoEndDeal": "Chạy tới khi chủ tiệm tắt.",
      "schNoEndCoupon": "Coupon vẫn tự dừng khi hết suất.",
      "schDays": "Ngày trong tuần",
      "schPresetWeekdays": "T2–T6",
      "schPresetSlow": "T3–T5 (giờ vắng)",
      "schPresetWeekend": "Cuối tuần",
      "schPresetAll": "Mỗi ngày",
      "schHours": "Giờ áp dụng",
      "schAllDay": "Cả ngày (theo giờ mở cửa của tiệm)",
      "schFrom": "Từ",
      "schTo": "Đến",
      "schSkip": "Ngày nghỉ không chạy",
      "schSkipHint": "Thêm ngày (lễ, tiệm đóng cửa…)",
      "schAddSkip": "Thêm ngày nghỉ",
      "schAuto": "Tự động",
      "schAutoOn": "Tự bật lúc bắt đầu",
      "schAutoOnHint": "Lên lịch thành Đang chạy đúng giờ.",
      "schAutoOff": "Tự tắt lúc kết thúc",
      "schAutoOffHint": "Ngoài ngày và giờ, POS không áp ưu đãi.",
      "schRemind": "Nhắc chủ tiệm 2 ngày trước khi hết",
      "schRemindHint": "Kèm nút gia hạn hoặc nhân bản.",
      "schYearly": "Lặp lại mỗi năm",
      "schYearlyHint": "Năm sau tự tạo bản nháp cùng ngày, duyệt rồi mới chạy.",
      "schPreviewRuns": "Chương trình sẽ chạy",
      "schPreviewFrom": "từ",
      "schPreviewTo": "đến",
      "schPreviewNoEnd": "— không có ngày kết thúc",
      "schPreviewDayCount": "{{count}} ngày chạy",
      "schPreviewSkip": "trừ {{count}} ngày nghỉ",
      "schWarnEnd": "Ngày kết thúc phải sau ngày bắt đầu.",
      "schWarnDays": "Chọn ít nhất 1 ngày trong tuần.",
      "schWarnHours": "Giờ kết thúc phải sau giờ bắt đầu.",
      "schWithin": "Đang trong thời gian chạy.",
      "schWillSchedule": "Trạng thái sẽ là Lên lịch.",
      "schCancel": "Hủy",
      "schSave": "Lưu lịch chạy",
      "schSaved": "Đã lưu lịch chạy",
      "bannerUnit": "banner",
      "promotionPoster": "Poster chương trình",
      "closePreview": "Đóng xem trước",
      "printHint": "In hoặc lưu PDF.",
      "print": "In poster",
      "delete": "Xoá chương trình",
      "deleteBlocked": "Đã có khách dùng chương trình này nên không thể xoá. Hãy tắt chương trình thay vì xoá.",
      "deleteConfirmTitle": "Xoá chương trình",
      "deleteConfirmMessage": "Xoá \"{{name}}\"? Hành động này không thể hoàn tác.",
      "createSuccess": "Đã tạo chương trình.",
      "updateSuccess": "Đã cập nhật chương trình.",
      "enableSuccess": "Đã bật \"{{name}}\".",
      "disableSuccess": "Đã tắt \"{{name}}\".",
      "deleteSuccess": "Đã xoá \"{{name}}\".",
      "studioEyebrow": "Studio chương trình",
      "createTitle": "Tạo khuyến mãi",
      "editTitle": "Chỉnh sửa khuyến mãi",
      "helpTitle": "Chỉnh 4 phần trước khi dùng",
      "helpSteps": "① Tên & dịch vụ áp dụng → ② Mức giảm → ③ Ngày & giờ → ④ Banner & nơi hiển thị",
      "helpNote": "Xem preview bên cạnh khi sửa. Lưu, sau đó chủ động bật chương trình tại danh sách.",
      "detailsSection": "01 / Thông tin chương trình",
      "nameLabel": "Tên chương trình",
      "namePlaceholder": "VD: Ưu đãi ngày thường",
      "badgeLabel": "Nhãn · tùy chọn",
      "badgePlaceholder": "VD: Happy Hours",
      "detailsHint": "Ví dụ: Giảm 15% Classic Pedicure, thứ Ba–thứ Năm 10–14h; không cộng dồn. Ghi rõ ai được dùng và điều kiện loại trừ.",
      "descriptionLabel": "Mô tả · tùy chọn",
      "eligibleServicesLabel": "Dịch vụ áp dụng",
      "eligibleServicesAll": "Mọi dịch vụ",
      "eligibleServicesTip": "Lấy từ danh mục dịch vụ của POS. POS chỉ trừ giảm giá trên đúng dịch vụ này trong bill; Booking gắn nhãn đúng dịch vụ; add-on chỉ gợi ý khi khách chọn dịch vụ chính.",
      "scheduleSummaryServices": "Dịch vụ áp dụng: {{services}}",
      "descriptionPlaceholder": "VD: Giảm 15% Classic Pedicure, thứ Ba–thứ Năm 10–14h",
      "photoLabel": "Hình ảnh (không bắt buộc)",
      "scheduleSection": "02 / Giảm giá & lịch chạy",
      "typeLabel": "Kiểu giảm giá",
      "typePercent": "Phần trăm · %",
      "typeAmount": "Số tiền · $",
      "typePercentShort": "%",
      "typeAmountShort": "$",
      "valueLabel": "Mức giảm",
      "offerKindRowLabel": "Loại",
      "offerKindDealHint": "Không giới hạn số lượng · tự áp khi đủ điều kiện",
      "offerKindCouponHint": "Có số suất · khách lấy bằng SĐT · hết suất tự dừng",
      "offerKindChangeStep": "Đổi ở bước ①",
      "slotsLabel": "Số suất",
      "slotsPlaceholder": "vd 100",
      "perClientLabel": "Mỗi khách",
      "dealPer": {
        "visit": "1 lần / lượt ghé",
        "week": "1 lần / tuần",
        "month": "1 lần / tháng"
      },
      "couponPer": {
        "one": "1 lần",
        "two": "2 lần",
        "three": "3 lần"
      },
      "discountRowLabel": "Giảm",
      "discountRowHint": "mỗi lần dùng",
      "daysRowLabel": "Ngày chạy",
      "daysFollowDatesHint": "Khoảng ngày này chỉ có {{days}}. Thứ không nằm trong khoảng sẽ bị tắt.",
      "dayUnavailable": "Thứ này không nằm trong khoảng ngày đã chọn.",
      "hoursRowLabel": "Giờ",
      "hoursRowHint": "giờ của tiệm",
      "whoRowLabel": "Khách",
      "whoRowHint": "yêu cầu khi dùng",
      "customerReqLabel": "Yêu cầu khách",
      "customerReq": {
        "online": "Cần đặt lịch online",
        "appt": "Cần hẹn trước",
        "checkin": "Cần check-in tại tiệm",
        "none": "Không yêu cầu"
      },
      "minSpendLabel": "Chi tiêu tối thiểu ($)",
      "minSpendPlaceholder": "vd: 40 — để trống nếu không giới hạn",
      "monthlyCapLabel": "Trần giảm / tháng ($)",
      "monthlyCapPlaceholder": "vd: 500 — để trống nếu không trần",
      "holdDaysLabel": "Giữ lượt (ngày)",
      "couponCodeLabel": "Mã coupon (tuỳ chọn)",
      "couponCodePlaceholder": "VD: NAIL15",
      "moreConditions": "＋ Thêm điều kiện (không bắt buộc): mục tiêu, chi tiêu tối thiểu, trần giảm, mã coupon…",
      "scheduleSummaryTitle": "Tóm tắt",
      "scheduleSummaryOffer": "Giảm {{offer}}",
      "scheduleSummaryDeal": "Deal · không giới hạn — giảm {{offer}}",
      "scheduleSummaryCoupon": "Coupon · {{slots}} suất — giảm {{offer}}",
      "daysLabel": "Ngày áp dụng",
      "startLabel": "Bắt đầu",
      "endLabel": "Kết thúc",
      "timeHint": "Giờ địa phương của tiệm. Khung giờ bắt đầu và kết thúc trong cùng ngày.",
      "placementsSection": "03 / Nơi hiển thị",
      "activeLabel": "Áp dụng ở quầy thanh toán",
      "checkoutHint": "Giữ chức năng POS hiện có.",
      "heroLabel": "Banner OneQR",
      "heroHint": "Hiển thị các banner của chương trình.",
      "publicLabel": "Gửi public lên Search Deals",
      "publicHint": "Chờ duyệt trước khi hiển thị công khai.",
      "publicNote": "Public không tự bật quảng cáo trả phí hoặc thưởng giới thiệu.",
      "bannersSection": "04 / Banner và poster",
      "bannerHint": "Mỗi chương trình có nhiều banner. Đổi thứ tự để chọn hình đầu; tất cả cùng mở đúng chương trình.",
      "chooseTheme": "Chọn màu",
      "uploadedTheme": "Ảnh upload",
      "addBanner": "Thêm banner",
      "themeAlreadyUsed": "Mỗi màu template chỉ dùng một lần. Chọn màu khác hoặc upload ảnh.",
      "themeUsedOption": "{{name}} (đã dùng)",
      "cover": "Bìa",
      "previewBanner": "Xem banner",
      "moveUp": "Đưa lên",
      "moveDown": "Đưa xuống",
      "removeBanner": "Xóa banner",
      "previewPrint": "Xem & in poster",
      "previousBanner": "Banner trước",
      "nextBanner": "Banner sau",
      "bannerError": "Giữ từ 1 đến 8 banner.",
      "bannerImageInvalidType": "Dùng ảnh JPG, PNG hoặc WebP dưới 10 MB.",
      "theme": {
        "purple": "Signature · Tím",
        "gold": "Luxury · Vàng",
        "rose": "Soft · Hồng",
        "ocean": "Ocean · Xanh dương",
        "teal": "Fresh · Xanh ngọc",
        "sage": "Nature · Xanh lá",
        "peach": "Sunset · Cam đào",
        "slate": "Minimal · Xám"
      },
      "upload": "Tải thiết kế của bạn",
      "chooseFile": "Chọn ảnh",
      "currentImage": "Ảnh banner hiện tại",
      "uploadHint": "PNG / JPG / WebP · tối đa 8 MB · tối đa 8 banner",
      "uploadRatioHint": "Để banner hiển thị đẹp, nên dùng ảnh tỷ lệ 3:1 (ví dụ: 1200 × 400 px).",
      "previewUntitled": "Tên chương trình",
      "livePreviewTitle": "Xem trước · cập nhật khi gõ",
      "liveColorLabel": "Màu banner",
      "liveBannerMeta": "Banner ({{count}}/{{max}}) · cái đầu là ảnh bìa",
      "liveColorOnce": "Mỗi màu chỉ dùng 1 lần trong 1 khuyến mãi (• = đang dùng)",
      "livePreviewHint": "Cập nhật khi bạn gõ. Đổi tab để xem Banner, OneQR, App, Check-in và POS.",
      "liveTypeDeal": "Deal · không giới hạn",
      "liveTypeCoupon": "Coupon · có số suất",
      "liveTypeDealShort": "Deal",
      "liveTypeCouponShort": "Coupon",
      "livePosCheckout": "Thanh toán POS",
      "offerKindDealName": "Deal",
      "offerKindCouponName": "Coupon",
      "liveTabBanner": "Banner",
      "liveTabOneQr": "OneQR",
      "liveTabApp": "App",
      "liveTabKiosk": "Check-in",
      "liveTabPos": "POS",
      "liveShopName": "Tiệm của bạn",
      "liveNearbyPartner": "ĐỐI TÁC GẦN TIỆM",
      "livePartnerOffer": "Trà sữa 1+1",
      "livePartnerPlace": "Quán đối tác · 0.3 mi",
      "liveOneQrCaption": "50/50: nửa trái luôn là tiệm · nửa phải là đối tác gần.",
      "liveAppExplore": "App · Khám phá",
      "liveView": "Xem",
      "liveKioskIdle": "Máy check-in · màn chờ",
      "liveKioskPhone": "Nhập SĐT để check-in",
      "livePosService": "Dịch vụ",
      "livePosCaption": "POS tự áp khi đủ điều kiện",
      "invalidPreview": "Nhập mức giảm hợp lệ",
      "saveNote": "Chương trình mới được lưu ở trạng thái tắt.",
      "editNote": "Thay đổi có hiệu lực sau khi lưu.",
      "editDetailLoading": "Đang tải banner…",
      "editDetailLoadError": "Không tải được banner của chương trình này. Đóng và thử lại.",
      "windowInvalid": "Giờ bắt đầu và giờ kết thúc không được trùng. Giờ kết thúc sớm hơn là khung qua đêm.",
      "errorNameRequired": "Vui lòng nhập tên chương trình.",
      "errorValueRequired": "Vui lòng nhập mức giảm.",
      "errorValueInvalid": "Mức giảm phải lớn hơn 0.",
      "errorValuePercentMax": "Mức giảm theo phần trăm không được vượt quá {{max}}%.",
      "errorValueAmountMax": "Mức giảm theo số tiền không được vượt quá ${{max}}.",
      "errorDaysRequired": "Chọn ít nhất một ngày áp dụng.",
      "errorWindowRequired": "Chọn cả giờ bắt đầu và giờ kết thúc.",
      "datesRowLabel": "Ngày chạy",
      "datesRowHintCoupon": "Coupon cần ngày bắt đầu. Để trống ngày kết thúc nếu không có hạn.",
      "errorDatePair": "Để trống cả hai ngày nếu không có ngày kết thúc, hoặc chọn ngày kết thúc từ ngày bắt đầu trở đi.",
      "startDateLabel": "Ngày bắt đầu",
      "endDateLabel": "Ngày kết thúc",
      "errorStartDateRequired": "Coupon cần ngày bắt đầu.",
      "errorEndDateBeforeStart": "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
      "errorSlotsRequired": "Nhập tổng suất từ 1 trở lên.",
      "errorHoldDaysRequired": "Nhập số ngày giữ mã.",
      "errorHoldDaysRange": "Số ngày giữ mã phải từ 1 đến 365.",
      "discountLockedHint": "Đã cấp mã nên không đổi mức giảm.",
      "offerTypeLocked": "Không đổi Deal / Coupon",
      "errorServicesRequired": "Coupon cần chọn ít nhất một dịch vụ.",
      "errorPosCheckoutRequired": "Deal phải bật kênh thanh toán POS.",
      "save": "Lưu khuyến mãi",
      "cancel": "Huỷ",
      "backToList": "Quay lại khuyến mãi",
      "createPageDescription": "Giữ flow tạo nhanh như hiện tại, thêm vài công cụ hữu ích bên phải.",
      "createPageIntro": "Chọn mẫu, hoặc để AI gợi ý theo ngành của tiệm — sửa tuỳ ý rồi lưu.",
      "editPageIntro": "Sửa chương trình trên cùng trang studio, rồi lưu.",
      "quickCreatePill": "Tạo nhanh",
      "studio": {
        "title": "Chọn mẫu · sửa theo ý · xem trước",
        "subtitle": "Tối đa 20 mẫu mỗi ngành · chọn mẫu chưa đăng gì, sửa thoải mái ở các bước dưới.",
        "aiQuick": "Tạo nhanh bằng AI",
        "aiSoon": "Sắp có",
        "aiClose": "Đóng",
        "aiShopName": "Tiệm của bạn",
        "aiShopIndustry": "Nail · từ Salon Settings",
        "aiWantTitle": "Tiệm muốn gì?",
        "aiIntent": {
          "fill": "Lấp giờ trống ngày thường",
          "new": "Kéo khách mới",
          "back": "Khách lâu chưa quay lại",
          "ticket": "Tăng giá trị hoá đơn",
          "season": "Theo mùa / lễ sắp tới",
          "coupon": "Coupon giới hạn số suất"
        },
        "aiQueryPlaceholder": "Hoặc gõ: lấp giờ trống sáng thứ 3, coupon cho khách lâu chưa quay lại…",
        "aiSuggest": "Gợi ý",
        "aiSuggestionsTitle": "3 gợi ý cho tiệm nail của bạn",
        "aiWhy": "Vì sao",
        "aiWhyReason": {
          "goal": "đúng mục tiêu",
          "deal": "không giới hạn",
          "coupon": "có số suất",
          "slowDefault": "lấp giờ vắng T2–T5",
          "couponDefault": "coupon khách mới, có số suất để kiểm soát chi phí",
          "retainDefault": "giữ khách cũ quay lại",
          "general": "phù hợp với tiệm"
        },
        "aiUse": "Dùng →",
        "aiNoMatch": "Chưa tìm được mẫu phù hợp — thử chọn ý khác.",
        "aiNote": "Mô phỏng trong prototype: AI chọn từ thư viện mẫu theo ngành của tiệm, mục tiêu, ngày và mùa. Bản thật dùng thêm dữ liệu POS của tiệm và không tự đăng — chủ tiệm duyệt.",
        "previewTitle": "Xem mẫu",
        "previewTabCard": "Thẻ khách thấy",
        "previewTabBanner": "Banner",
        "previewTabOneQr": "OneQR",
        "previewTabKiosk": "Máy check-in",
        "previewTabPos": "POS",
        "previewClaimLink": "nexora.link/c/…",
        "previewGet": "Lấy",
        "previewShopName": "Tiệm của bạn",
        "previewNearbyPartner": "ĐỐI TÁC GẦN TIỆM",
        "previewPartnerOffer": "Trà sữa 1+1",
        "previewPartnerPlace": "Saigon Boba · 0.3 mi",
        "previewOneQrCaption": "Nửa trái là ưu đãi này · nửa phải đối tác khác ngành (nếu tiệm tích quảng cáo chéo)",
        "previewKioskIdle": "Máy check-in · màn chờ",
        "previewKioskPhone": "Nhập SĐT để check-in",
        "previewPosService": "Dịch vụ đủ điều kiện",
        "previewPosDealHint": "POS tự áp khi đủ điều kiện",
        "previewPosCouponHint": "Thu ngân tìm SĐT khách → áp 1 lần",
        "previewOffer": "Ưu đãi",
        "previewSchedule": "Lịch chạy",
        "previewAudience": "Đối tượng",
        "previewRequirement": "Yêu cầu khách",
        "previewRequirementNone": "Không yêu cầu",
        "previewSlots": "Số suất",
        "previewMinSpend": "Chi tiêu tối thiểu",
        "previewCode": "Mã",
        "previewPrev": "Mẫu trước",
        "previewNext": "Mẫu sau",
        "previewUse": "Dùng mẫu này →",
        "typeQuestion": "Tạo loại nào?",
        "dealTitle": "Deal · khuyến mãi",
        "dealHint": "Không giới hạn số lượng · hiện như banner · tự áp khi đủ điều kiện",
        "kindDeal": "Deal",
        "kindCoupon": "Coupon",
        "previewKindDeal": "DEAL",
        "previewKindCoupon": "COUPON",
        "previewPosCheckout": "Thanh toán POS",
        "couponTitle": "Coupon",
        "couponHint": "Có số suất · khách lấy bằng SĐT · hết suất tự dừng",
        "noTemplates": "Chưa có mẫu",
        "industryLabel": "② Chọn ngành",
        "industryGroupLabel": "Nhóm",
        "industryItemLabel": "Ngành",
        "yourShop": "tiệm của bạn",
        "otherIndustries": "Ngành khác… ({{count}})",
        "allIndustries": "Mọi ngành",
        "industryNote": "Industry là nhóm trong danh mục. Nhóm dịch vụ là các ngành con của nhóm đang chọn, đúng thứ tự danh mục.",
        "searchPlaceholder": "Tìm mẫu: pedicure, sinh nhật, combo…",
        "goalLabel": "Mục tiêu",
        "serviceLabel": "Nhóm dịch vụ",
        "goals": {
          "all": "Tất cả",
          "new": "Kéo khách mới",
          "slow": "Lấp giờ trống",
          "push": "Đẩy dịch vụ",
          "ticket": "Tăng hoá đơn",
          "retain": "Giữ khách",
          "community": "Cộng đồng",
          "seasonal": "Theo mùa"
        },
        "services": {
          "all": "Tất cả",
          "manicure": "Manicure & Gel",
          "pedicure": "Pedicure & chân",
          "dip": "Nối móng & Dip"
        },
        "showing": "Hiện {{shown}} / {{total}} mẫu",
        "couponFieldsNote": "Số suất, mã, chi tiêu tối thiểu lấy từ thư viện mẫu — tiệm sửa được",
        "emptyTitle": "Chưa có mẫu cho bộ lọc này",
        "emptyNoType": "Loại này chưa có mẫu trong danh mục. Vẫn tạo được bằng form phía dưới.",
        "emptyNoIndustry": "Ngành này chưa có mẫu cho loại đang chọn.",
        "emptyReset": "Hiện mẫu của tiệm",
        "view": "Xem",
        "useTemplate": "Dùng mẫu →",
        "inUse": "✓ Đang dùng",
        "templatePill": "Mẫu: {{name}}"
      },
      "goalLabel": "Mục tiêu",
      "goal": {
        "slow": "Lấp giờ vắng",
        "back": "Kéo khách cũ quay lại",
        "new": "Tìm khách mới",
        "gift": "Bán gift card"
      },
      "goalPill": "Gợi ý theo mục tiêu: {{goal}}",
      "goalChannelsUpdated": "Đã chọn lại kênh gợi ý theo mục tiêu",
      "channelsSection": "03 / Kênh phát",
      "channelsPolicyNote": "Nexora là nguồn dữ liệu chính: mọi kênh dùng trang deal, QR, coupon token, link tracking và báo cáo của Nexora.",
      "tierInternalTitle": "1 · Internal — khách của tôi",
      "tierInternalHint": "Chỉ kênh của chính tiệm. Không mất phí, không chia doanh thu.",
      "tierInternalTag": "$0 · không phí, không duyệt",
      "tierPublicTitle": "2 · Public — mạng lưới NEXORA",
      "tierPublicHint": "Hiện trên mạng lưới. Không cam kết vị trí.",
      "tierPublicReview": "cần duyệt lần đầu",
      "tierPublicOrganic": "click organic $0",
      "tierPaidTitle": "3 · Paid Boost — trả phí",
      "tierPaidHint": "Không tốn tiền cho tới khi owner đặt ngân sách và duyệt.",
      "tierPaidTag": "cần Public + ngân sách + owner duyệt",
      "channelSuggested": "★ Gợi ý",
      "channelNewBadge": "MỚI",
      "channelSwitchOn": "Đang chạy",
      "channelSwitchOff": "TẮT",
      "postToLabel": "Đăng lên mạng xã hội / SMS / Email:",
      "postWhenNow": "Ngay khi bật",
      "postWhenAuto": "Theo mốc chương trình",
      "postMilestones": "T−3 · ngày mở · mỗi 7 ngày · T−2 hết hạn",
      "postScheduleEdit": "Xem & sửa lịch",
      "postScheduleTip": "Theo mốc: bài tự đăng 3 ngày trước khi bắt đầu, đúng ngày bắt đầu, nhắc lại mỗi 7 ngày (đổi banner), và 2 ngày trước hết hạn. Đổi ngày chương trình thì lịch tự dời.",
      "postScheduleHint": "Lịch đăng từng bài nằm ở tab Chương trình. Trang tạo này chỉ chọn cách đăng.",
      "crossPromoTitle": "Cho chạy quảng cáo chéo với ưu đãi này",
      "crossPromoHint": "Hiện trên nửa banner QR của tiệm gần (tự mở rộng tới 10 mile, gần trước) đã bật quảng cáo chéo. NEXORA tự chọn tiệm — không hiện ở tiệm cùng nhóm ngành, không hiện ở ngành nhạy cảm.",
      "checkInCardTitle": "Màn check-in — banner & ưu đãi",
      "checkInCardHint": "iPad / máy check-in ở cửa · khách nào vào cũng thấy",
      "previewCheckIn": "Xem trước màn check-in",
      "bookingCardTitle": "Booking — chạy ưu đãi lúc khách đặt lịch",
      "bookingCardHint": "Trang đặt lịch · AI Voice · tin xác nhận",
      "previewBooking": "Xem trước trang đặt lịch",
      "showMoreChannels": "Xem thêm {{count}} kênh ▾",
      "showLessChannels": "Thu gọn",
      "noSuggestedChannels": "Không có kênh gợi ý cho mục tiêu này.",
      "channelNotConnected": "Kênh chưa kết nối — mở tab Kết nối.",
      "paidNeedsPublic": "Paid Boost cần bật ít nhất một kênh Public trước.",
      "couponSummary": "Lịch: {{schedule}} · Chỉnh ngày, suất và đối tượng trong Nâng cao.",
      "editAdvanced": "Chỉnh",
      "advancedTitle": "Cài đặt nâng cao",
      "advancedOptional": "Tùy chọn",
      "advStartDate": "Ngày bắt đầu",
      "advEndDate": "Ngày kết thúc",
      "advRedemptionCap": "Tổng suất (giới hạn redeem)",
      "advPerPerson": "Giới hạn / người",
      "advPerPerson1": "1 lần",
      "advPerPerson2": "2 lần",
      "advPerPersonUnlimited": "Không giới hạn",
      "advHoldDays": "Giữ lượt đã lấy (ngày)",
      "advBudgetCap": "Ngân sách (chỉ Paid)",
      "advAudience": "Áp dụng cho · POS tự kiểm lúc check-in",
      "advAudienceRec": "Để Nexora gợi ý",
      "advAudienceAll": "Mọi khách",
      "advAudienceNew": "Khách mới (lần đầu)",
      "advAudienceExisting": "Khách hiện có",
      "advAudienceLapsed": "45+ ngày chưa quay lại",
      "advCampaign": "Chiến dịch",
      "advCampaignNone": "Không",
      "advCampaignOpening": "Khai trương (đang trong cửa sổ)",
      "advCampaignFall": "Bộ màu mùa thu",
      "advApproval": "Duyệt",
      "advApprovalDraft": "Lưu nháp",
      "advApprovalOwner": "Cần owner duyệt",
      "advApprovalInternal": "Tự bật kênh Internal",
      "heroMixTitle": "Nội dung đối tác trên OneQR Hero & màn chờ check-in",
      "heroMix": {
        "own": {
          "title": "Chỉ offer của tiệm",
          "hint": "Mặc định. Không có nội dung đối tác."
        },
        "strip": {
          "title": "Dải đối tác",
          "hint": "Deal đối tác nhỏ có nhãn dưới offer chính."
        },
        "rotate": {
          "title": "Thẻ đối tác xoay vòng",
          "hint": "Xoay sau khi offer của tiệm đã hiện trước."
        }
      },
      "perfFeeTitle": "Chấp nhận phí thành công",
      "perfFeeHint": "10% dịch vụ đủ điều kiện (khách mới) · 5% quay lại sau 90 ngày nếu bật.",
      "toolsSmartTitle": "Công cụ nhanh",
      "toolsSmartHint": "Công cụ hỗ trợ, không biến thành bước bắt buộc.",
      "toolsAiCopyTitle": "Nội dung AI",
      "toolsAiCopyHint": "Tạo tên, mô tả, SMS, email và caption social.",
      "toolsPreflightTitle": "Kiểm tra trước khi chạy",
      "toolsComingSoon": "Sắp có",
      "preflightOffer": "Ưu đãi, lịch chạy và điều khoản đã đủ.",
      "preflightChannels": "Đã chọn kênh nội bộ: thanh toán POS và banner OneQR.",
      "preflightSms": "Nhóm SMS có khách đã đồng ý nhận tin.",
      "preflightPaid": "Đẩy trả phí cần chủ tiệm duyệt trước khi phát sinh chi phí quảng cáo.",
      "saveDraft": "Lưu nháp",
      "turnOn": "Bật chương trình",
      "turnOnPublic": "Bật & gửi duyệt Public",
      "turnOnPublicHint": "Kênh nội bộ chạy ngay; kênh Public hiện sau khi duyệt lần đầu.",
      "submitForApproval": "Gửi duyệt",
      "submitNeedsPublic": "Bật Search Deals (Public) trước khi gửi duyệt."
    }
  },
  "groups": [
    {
      "id": "beauty",
      "vi": "Làm đẹp & chăm sóc cá nhân",
      "en": "Beauty & personal care",
      "icon": "cosmetics"
    },
    {
      "id": "food",
      "vi": "Ăn uống",
      "en": "Food & drink",
      "icon": "restaurant"
    },
    {
      "id": "shop",
      "vi": "Mua sắm",
      "en": "Shopping",
      "icon": "retail"
    },
    {
      "id": "health",
      "vi": "Sức khoẻ",
      "en": "Health",
      "icon": "spa"
    },
    {
      "id": "auto",
      "vi": "Xe & di chuyển",
      "en": "Auto & transport",
      "icon": "repair"
    },
    {
      "id": "home",
      "vi": "Nhà cửa & sửa chữa",
      "en": "Home & repair",
      "icon": "home"
    },
    {
      "id": "finance",
      "vi": "Tài chính · pháp lý · địa ốc",
      "en": "Finance · legal · real estate",
      "icon": "lifestyle"
    },
    {
      "id": "travel",
      "vi": "Du lịch & lưu trú",
      "en": "Travel & stay",
      "icon": "travel"
    },
    {
      "id": "edu",
      "vi": "Giáo dục & đào tạo",
      "en": "Education & training",
      "icon": "lifestyle"
    },
    {
      "id": "event",
      "vi": "Sự kiện & giải trí",
      "en": "Events & entertainment",
      "icon": "retail"
    },
    {
      "id": "family",
      "vi": "Gia đình & thú cưng",
      "en": "Family & pets",
      "icon": "retail"
    },
    {
      "id": "biz",
      "vi": "Dịch vụ doanh nghiệp & công nghệ",
      "en": "Business services & tech",
      "icon": "lifestyle"
    },
    {
      "id": "community",
      "vi": "Cộng đồng & phi lợi nhuận",
      "en": "Community & non-profit",
      "icon": "retail"
    }
  ],
  "industries": [
    {
      "id": "nail",
      "group": "beauty",
      "vi": "Nail",
      "en": "Nail salon",
      "icon": "nail"
    },
    {
      "id": "pedi",
      "group": "beauty",
      "vi": "Pedicure / chân",
      "en": "Pedicure",
      "icon": "pedicure"
    },
    {
      "id": "spa",
      "group": "beauty",
      "vi": "Spa & Massage",
      "en": "Spa & massage",
      "icon": "spa"
    },
    {
      "id": "lash",
      "group": "beauty",
      "vi": "Mi & chân mày",
      "en": "Lashes & brows",
      "icon": "spa"
    },
    {
      "id": "hair",
      "group": "beauty",
      "vi": "Tóc & salon",
      "en": "Hair salon",
      "icon": "hair"
    },
    {
      "id": "barber",
      "group": "beauty",
      "vi": "Barber / tóc nam",
      "en": "Barbershop",
      "icon": "hair"
    },
    {
      "id": "skin",
      "group": "beauty",
      "vi": "Da & facial",
      "en": "Skin & facial",
      "icon": "spa"
    },
    {
      "id": "pmu",
      "group": "beauty",
      "vi": "Phun xăm / PMU / xăm",
      "en": "PMU & tattoo",
      "icon": "tattoo"
    },
    {
      "id": "medspa",
      "group": "beauty",
      "vi": "Thẩm mỹ y khoa",
      "en": "Medspa & aesthetics",
      "icon": "cosmetics"
    },
    {
      "id": "wax",
      "group": "beauty",
      "vi": "Wax / tẩy lông",
      "en": "Waxing",
      "icon": "cosmetics"
    },
    {
      "id": "fitness",
      "group": "beauty",
      "vi": "Gym & thể hình",
      "en": "Gym & fitness",
      "icon": "fitness"
    },
    {
      "id": "yoga",
      "group": "beauty",
      "vi": "Yoga & pilates",
      "en": "Yoga & pilates",
      "icon": "yoga"
    },
    {
      "id": "diet",
      "group": "beauty",
      "vi": "Giảm cân & dinh dưỡng",
      "en": "Weight loss & nutrition",
      "icon": "nutrition"
    },
    {
      "id": "food",
      "group": "food",
      "vi": "Nhà hàng / quán ăn",
      "en": "Restaurant",
      "icon": "restaurant"
    },
    {
      "id": "fastfood",
      "group": "food",
      "vi": "Bánh mì / ăn nhanh",
      "en": "Fast food & sandwiches",
      "icon": "fast-food"
    },
    {
      "id": "drink",
      "group": "food",
      "vi": "Cà phê / trà sữa",
      "en": "Coffee & bubble tea",
      "icon": "coffee"
    },
    {
      "id": "bakery",
      "group": "food",
      "vi": "Bánh / tiệc ngọt",
      "en": "Bakery & desserts",
      "icon": "bakery"
    },
    {
      "id": "hotpot",
      "group": "food",
      "vi": "Lẩu · nướng · buffet",
      "en": "Hotpot · BBQ · buffet",
      "icon": "hot-pot"
    },
    {
      "id": "seafood",
      "group": "food",
      "vi": "Hải sản",
      "en": "Seafood",
      "icon": "seafood"
    },
    {
      "id": "vegan",
      "group": "food",
      "vi": "Chay",
      "en": "Vegetarian & vegan",
      "icon": "nutrition"
    },
    {
      "id": "foodtruck",
      "group": "food",
      "vi": "Food truck",
      "en": "Food truck",
      "icon": "food-truck"
    },
    {
      "id": "bar",
      "group": "food",
      "vi": "Bar · pub · karaoke",
      "en": "Bar · pub · karaoke",
      "icon": "bar"
    },
    {
      "id": "banquet",
      "group": "food",
      "vi": "Nhà hàng tiệc cưới",
      "en": "Wedding banquet hall",
      "icon": "home"
    },
    {
      "id": "catering",
      "group": "food",
      "vi": "Catering / đặt tiệc",
      "en": "Catering",
      "icon": "restaurant"
    },
    {
      "id": "homefood",
      "group": "food",
      "vi": "Đồ ăn nhà làm / online",
      "en": "Home-cooked & online food",
      "icon": "takeaway"
    },
    {
      "id": "market",
      "group": "shop",
      "vi": "Chợ / siêu thị",
      "en": "Grocery & market",
      "icon": "retail"
    },
    {
      "id": "convenience",
      "group": "shop",
      "vi": "Tiện lợi / tạp hoá",
      "en": "Convenience store",
      "icon": "retail"
    },
    {
      "id": "supply",
      "group": "shop",
      "vi": "Supply nail & spa / đồ nghề",
      "en": "Nail & spa supply",
      "icon": "nail"
    },
    {
      "id": "cosmetic",
      "group": "shop",
      "vi": "Mỹ phẩm / nước hoa",
      "en": "Cosmetics & perfume",
      "icon": "cosmetics"
    },
    {
      "id": "import",
      "group": "shop",
      "vi": "Hàng xách tay",
      "en": "Imported goods",
      "icon": "retail"
    },
    {
      "id": "fashion",
      "group": "shop",
      "vi": "Thời trang / áo dài",
      "en": "Fashion & áo dài",
      "icon": "apparel"
    },
    {
      "id": "shoes",
      "group": "shop",
      "vi": "Giày / túi xách",
      "en": "Shoes & bags",
      "icon": "apparel"
    },
    {
      "id": "jewelry",
      "group": "shop",
      "vi": "Vàng bạc / trang sức",
      "en": "Jewelry & gold",
      "icon": "jewelry"
    },
    {
      "id": "electronics",
      "group": "shop",
      "vi": "Điện thoại / điện tử",
      "en": "Phones & electronics",
      "icon": "electronics"
    },
    {
      "id": "furniture",
      "group": "shop",
      "vi": "Nội thất / gia dụng",
      "en": "Furniture & appliances",
      "icon": "furniture"
    },
    {
      "id": "flower",
      "group": "shop",
      "vi": "Hoa tươi / quà tặng",
      "en": "Flowers & gifts",
      "icon": "flowers"
    },
    {
      "id": "eyewear",
      "group": "shop",
      "vi": "Kính thời trang",
      "en": "Eyewear store",
      "icon": "retail"
    },
    {
      "id": "dental",
      "group": "health",
      "vi": "Nha sĩ",
      "en": "Dentist",
      "icon": "spa"
    },
    {
      "id": "eye",
      "group": "health",
      "vi": "Mắt kính / nhãn khoa",
      "en": "Optometry",
      "icon": "spa"
    },
    {
      "id": "clinic",
      "group": "health",
      "vi": "Bác sĩ gia đình / phòng khám",
      "en": "Family doctor & clinic",
      "icon": "spa"
    },
    {
      "id": "specialist",
      "group": "health",
      "vi": "Bác sĩ chuyên khoa",
      "en": "Medical specialist",
      "icon": "spa"
    },
    {
      "id": "chiro",
      "group": "health",
      "vi": "Chiropractor / vật lý trị liệu",
      "en": "Chiropractic & physical therapy",
      "icon": "spa"
    },
    {
      "id": "acupuncture",
      "group": "health",
      "vi": "Châm cứu / đông y",
      "en": "Acupuncture & herbal",
      "icon": "spa"
    },
    {
      "id": "pharm",
      "group": "health",
      "vi": "Nhà thuốc / thuốc bổ",
      "en": "Pharmacy & supplements",
      "icon": "spa"
    },
    {
      "id": "lab",
      "group": "health",
      "vi": "Xét nghiệm / chẩn đoán",
      "en": "Lab & imaging",
      "icon": "spa"
    },
    {
      "id": "mental",
      "group": "health",
      "vi": "Tâm lý / tư vấn",
      "en": "Mental health & counseling",
      "icon": "spa"
    },
    {
      "id": "homehealth",
      "group": "health",
      "vi": "Chăm sóc người già / tại nhà",
      "en": "Home health & senior care",
      "icon": "spa"
    },
    {
      "id": "carwash",
      "group": "auto",
      "vi": "Rửa xe / detailing",
      "en": "Car wash & detailing",
      "icon": "repair"
    },
    {
      "id": "mechanic",
      "group": "auto",
      "vi": "Sửa xe / thay nhớt",
      "en": "Auto repair & oil change",
      "icon": "repair"
    },
    {
      "id": "tire",
      "group": "auto",
      "vi": "Lốp / thắng",
      "en": "Tires & brakes",
      "icon": "repair"
    },
    {
      "id": "bodyshop",
      "group": "auto",
      "vi": "Body shop / sơn xe",
      "en": "Body shop & paint",
      "icon": "repair"
    },
    {
      "id": "tint",
      "group": "auto",
      "vi": "Tint / phụ kiện / audio",
      "en": "Tint · accessories · audio",
      "icon": "repair"
    },
    {
      "id": "dealer",
      "group": "auto",
      "vi": "Mua bán xe",
      "en": "Car sales & dealer",
      "icon": "repair"
    },
    {
      "id": "carrental",
      "group": "auto",
      "vi": "Cho thuê xe",
      "en": "Car rental",
      "icon": "repair"
    },
    {
      "id": "ride",
      "group": "auto",
      "vi": "Đưa đón / taxi / sân bay",
      "en": "Rides · taxi · airport",
      "icon": "repair"
    },
    {
      "id": "bus",
      "group": "auto",
      "vi": "Xe đò / xe khách",
      "en": "Intercity bus",
      "icon": "repair"
    },
    {
      "id": "moving",
      "group": "auto",
      "vi": "Vận chuyển / dọn nhà",
      "en": "Moving & hauling",
      "icon": "repair"
    },
    {
      "id": "cargo",
      "group": "auto",
      "vi": "Gửi hàng về VN / cargo",
      "en": "Cargo to Vietnam",
      "icon": "repair"
    },
    {
      "id": "inspection",
      "group": "auto",
      "vi": "Đăng kiểm / giấy tờ xe",
      "en": "Inspection & registration",
      "icon": "repair"
    },
    {
      "id": "clean",
      "group": "home",
      "vi": "Dọn dẹp nhà cửa",
      "en": "House cleaning",
      "icon": "home"
    },
    {
      "id": "remodel",
      "group": "home",
      "vi": "Sửa nhà / remodel",
      "en": "Remodeling & contractor",
      "icon": "home"
    },
    {
      "id": "plumbing",
      "group": "home",
      "vi": "Điện / nước",
      "en": "Electrical & plumbing",
      "icon": "home"
    },
    {
      "id": "hvac",
      "group": "home",
      "vi": "Điện lạnh / HVAC",
      "en": "HVAC",
      "icon": "home"
    },
    {
      "id": "roof",
      "group": "home",
      "vi": "Mái nhà / roofing",
      "en": "Roofing",
      "icon": "home"
    },
    {
      "id": "floor",
      "group": "home",
      "vi": "Sàn / gạch / đá",
      "en": "Flooring & tile",
      "icon": "home"
    },
    {
      "id": "paint",
      "group": "home",
      "vi": "Sơn nhà",
      "en": "Painting",
      "icon": "home"
    },
    {
      "id": "landscape",
      "group": "home",
      "vi": "Sân vườn / cây cảnh",
      "en": "Landscaping",
      "icon": "home"
    },
    {
      "id": "pool",
      "group": "home",
      "vi": "Hồ bơi",
      "en": "Pool service",
      "icon": "home"
    },
    {
      "id": "pest",
      "group": "home",
      "vi": "Diệt côn trùng",
      "en": "Pest control",
      "icon": "home"
    },
    {
      "id": "garage",
      "group": "home",
      "vi": "Cửa / garage / cửa sổ",
      "en": "Doors · garage · windows",
      "icon": "home"
    },
    {
      "id": "security",
      "group": "home",
      "vi": "Camera / an ninh / smart home",
      "en": "Security & smart home",
      "icon": "home"
    },
    {
      "id": "laundry",
      "group": "home",
      "vi": "Giặt ủi / dry clean",
      "en": "Laundry & dry cleaning",
      "icon": "home"
    },
    {
      "id": "locksmith",
      "group": "home",
      "vi": "Thợ khoá",
      "en": "Locksmith",
      "icon": "home"
    },
    {
      "id": "tax",
      "group": "finance",
      "vi": "Thuế / kế toán",
      "en": "Tax & accounting",
      "icon": "lifestyle"
    },
    {
      "id": "insurance",
      "group": "finance",
      "vi": "Bảo hiểm",
      "en": "Insurance",
      "icon": "lifestyle"
    },
    {
      "id": "remit",
      "group": "finance",
      "vi": "Gửi tiền / đổi tiền",
      "en": "Money transfer & exchange",
      "icon": "lifestyle"
    },
    {
      "id": "loan",
      "group": "finance",
      "vi": "Vay / mortgage",
      "en": "Loans & mortgage",
      "icon": "lifestyle"
    },
    {
      "id": "immigration",
      "group": "finance",
      "vi": "Luật sư di trú",
      "en": "Immigration lawyer",
      "icon": "lifestyle"
    },
    {
      "id": "injury",
      "group": "finance",
      "vi": "Luật sư tai nạn / thương tích",
      "en": "Injury lawyer",
      "icon": "lifestyle"
    },
    {
      "id": "lawyer",
      "group": "finance",
      "vi": "Luật sư gia đình / kinh doanh",
      "en": "Family & business lawyer",
      "icon": "lifestyle"
    },
    {
      "id": "notary",
      "group": "finance",
      "vi": "Công chứng / dịch thuật",
      "en": "Notary & translation",
      "icon": "lifestyle"
    },
    {
      "id": "realtor",
      "group": "finance",
      "vi": "Địa ốc mua bán",
      "en": "Real estate agent",
      "icon": "lifestyle"
    },
    {
      "id": "rental",
      "group": "finance",
      "vi": "Cho thuê / quản lý nhà",
      "en": "Rental & property management",
      "icon": "lifestyle"
    },
    {
      "id": "invest",
      "group": "finance",
      "vi": "Đầu tư / crypto",
      "en": "Investing & crypto",
      "icon": "lifestyle"
    },
    {
      "id": "flight",
      "group": "travel",
      "vi": "Vé máy bay",
      "en": "Flights",
      "icon": "travel"
    },
    {
      "id": "tour",
      "group": "travel",
      "vi": "Tour / du lịch",
      "en": "Tours",
      "icon": "travel"
    },
    {
      "id": "hotel",
      "group": "travel",
      "vi": "Khách sạn / homestay",
      "en": "Hotels & stays",
      "icon": "travel"
    },
    {
      "id": "visa",
      "group": "travel",
      "vi": "Visa / hộ chiếu / giấy tờ",
      "en": "Visa & passport services",
      "icon": "travel"
    },
    {
      "id": "vietschool",
      "group": "edu",
      "vi": "Trường Việt ngữ",
      "en": "Vietnamese language school",
      "icon": "lifestyle"
    },
    {
      "id": "tutor",
      "group": "edu",
      "vi": "Dạy kèm / luyện thi",
      "en": "Tutoring & test prep",
      "icon": "lifestyle"
    },
    {
      "id": "beautyschool",
      "group": "edu",
      "vi": "Trường nail / thẩm mỹ (license)",
      "en": "Beauty school & license",
      "icon": "lifestyle"
    },
    {
      "id": "driving",
      "group": "edu",
      "vi": "Dạy lái xe",
      "en": "Driving school",
      "icon": "lifestyle"
    },
    {
      "id": "esl",
      "group": "edu",
      "vi": "Tiếng Anh / ESL / quốc tịch",
      "en": "English & citizenship classes",
      "icon": "lifestyle"
    },
    {
      "id": "arts",
      "group": "edu",
      "vi": "Nhạc · hoạ · võ · năng khiếu",
      "en": "Music · art · martial arts",
      "icon": "lifestyle"
    },
    {
      "id": "vocational",
      "group": "edu",
      "vi": "Đào tạo nghề / kỹ năng",
      "en": "Vocational & skills",
      "icon": "lifestyle"
    },
    {
      "id": "photo",
      "group": "event",
      "vi": "Chụp ảnh / quay phim",
      "en": "Photo & video",
      "icon": "retail"
    },
    {
      "id": "bridal",
      "group": "event",
      "vi": "Áo cưới / makeup cô dâu",
      "en": "Bridal & makeup",
      "icon": "retail"
    },
    {
      "id": "planner",
      "group": "event",
      "vi": "Tổ chức tiệc / sự kiện",
      "en": "Event planning",
      "icon": "retail"
    },
    {
      "id": "music",
      "group": "event",
      "vi": "Nhạc sống / MC / DJ",
      "en": "Live music · MC · DJ",
      "icon": "retail"
    },
    {
      "id": "rentalevent",
      "group": "event",
      "vi": "Thuê rạp / bàn ghế / trang trí",
      "en": "Party rentals & decor",
      "icon": "retail"
    },
    {
      "id": "entertain",
      "group": "event",
      "vi": "Giải trí / vui chơi",
      "en": "Entertainment & recreation",
      "icon": "retail"
    },
    {
      "id": "daycare",
      "group": "family",
      "vi": "Giữ trẻ / daycare",
      "en": "Daycare",
      "icon": "retail"
    },
    {
      "id": "kids",
      "group": "family",
      "vi": "Đồ trẻ em / mẹ & bé",
      "en": "Kids & baby",
      "icon": "retail"
    },
    {
      "id": "pet",
      "group": "family",
      "vi": "Thú cưng / grooming",
      "en": "Pets & grooming",
      "icon": "retail"
    },
    {
      "id": "vet",
      "group": "family",
      "vi": "Thú y",
      "en": "Veterinary",
      "icon": "retail"
    },
    {
      "id": "senior",
      "group": "family",
      "vi": "Nhà dưỡng lão / sinh hoạt người già",
      "en": "Senior living & adult daycare",
      "icon": "retail"
    },
    {
      "id": "print",
      "group": "biz",
      "vi": "In ấn / bảng hiệu",
      "en": "Printing & signage",
      "icon": "lifestyle"
    },
    {
      "id": "marketing",
      "group": "biz",
      "vi": "Marketing / web / thiết kế",
      "en": "Marketing · web · design",
      "icon": "lifestyle"
    },
    {
      "id": "software",
      "group": "biz",
      "vi": "POS / phần mềm",
      "en": "POS & software",
      "icon": "lifestyle"
    },
    {
      "id": "staffing",
      "group": "biz",
      "vi": "Tuyển dụng / nhân sự",
      "en": "Staffing & HR",
      "icon": "lifestyle"
    },
    {
      "id": "lease",
      "group": "biz",
      "vi": "Sang tiệm / mặt bằng / thuê ghế",
      "en": "Business for sale · lease · booth",
      "icon": "lifestyle"
    },
    {
      "id": "commercialclean",
      "group": "biz",
      "vi": "Vệ sinh công nghiệp",
      "en": "Commercial cleaning",
      "icon": "lifestyle"
    },
    {
      "id": "telecom",
      "group": "biz",
      "vi": "Viễn thông / internet",
      "en": "Telecom & internet",
      "icon": "lifestyle"
    },
    {
      "id": "techrepair",
      "group": "biz",
      "vi": "Sửa điện thoại / máy tính",
      "en": "Phone & computer repair",
      "icon": "lifestyle"
    },
    {
      "id": "equipment",
      "group": "biz",
      "vi": "Thiết bị ngành (nhà hàng, tiệm)",
      "en": "Commercial equipment",
      "icon": "lifestyle"
    },
    {
      "id": "temple",
      "group": "community",
      "vi": "Chùa / nhà thờ",
      "en": "Temple & church",
      "icon": "retail"
    },
    {
      "id": "association",
      "group": "community",
      "vi": "Hội đoàn / cộng đồng",
      "en": "Associations",
      "icon": "retail"
    },
    {
      "id": "charity",
      "group": "community",
      "vi": "Từ thiện / gây quỹ",
      "en": "Charity & fundraising",
      "icon": "retail"
    },
    {
      "id": "media",
      "group": "community",
      "vi": "Báo chí / radio / truyền hình",
      "en": "Media & press",
      "icon": "retail"
    },
    {
      "id": "beauty_other",
      "group": "beauty",
      "vi": "Khác (Làm đẹp)",
      "en": "Other",
      "icon": "cosmetics"
    },
    {
      "id": "food_other",
      "group": "food",
      "vi": "Khác (Ăn uống)",
      "en": "Other",
      "icon": "restaurant"
    },
    {
      "id": "shop_other",
      "group": "shop",
      "vi": "Khác (Mua sắm)",
      "en": "Other",
      "icon": "retail"
    },
    {
      "id": "health_other",
      "group": "health",
      "vi": "Khác (Sức khoẻ)",
      "en": "Other",
      "icon": "spa"
    },
    {
      "id": "auto_other",
      "group": "auto",
      "vi": "Khác (Xe)",
      "en": "Other",
      "icon": "repair"
    },
    {
      "id": "home_other",
      "group": "home",
      "vi": "Khác (Nhà cửa)",
      "en": "Other",
      "icon": "home"
    },
    {
      "id": "finance_other",
      "group": "finance",
      "vi": "Khác (Tài chính)",
      "en": "Other",
      "icon": "lifestyle"
    },
    {
      "id": "travel_other",
      "group": "travel",
      "vi": "Khác (Du lịch)",
      "en": "Other",
      "icon": "travel"
    },
    {
      "id": "edu_other",
      "group": "edu",
      "vi": "Khác (Giáo dục)",
      "en": "Other",
      "icon": "lifestyle"
    },
    {
      "id": "event_other",
      "group": "event",
      "vi": "Khác (Sự kiện)",
      "en": "Other",
      "icon": "retail"
    },
    {
      "id": "family_other",
      "group": "family",
      "vi": "Khác (Gia đình)",
      "en": "Other",
      "icon": "retail"
    },
    {
      "id": "biz_other",
      "group": "biz",
      "vi": "Khác (Dịch vụ doanh nghiệp)",
      "en": "Other",
      "icon": "lifestyle"
    },
    {
      "id": "community_other",
      "group": "community",
      "vi": "Khác (Cộng đồng)",
      "en": "Other",
      "icon": "retail"
    }
  ],
  "channels": [
    {
      "id": "pos",
      "tier": "int",
      "name": {
        "en": "POS checkout",
        "vi": "Thanh toán POS"
      },
      "description": {
        "en": "Apply at checkout",
        "vi": "Áp dụng khi tính tiền"
      },
      "status": {
        "en": "Ready",
        "vi": "Sẵn sàng"
      }
    },
    {
      "id": "receipt",
      "tier": "int",
      "name": {
        "en": "POS Receipt",
        "vi": "Hoá đơn POS"
      },
      "description": {
        "en": "Next-visit coupon on print or SMS receipt",
        "vi": "Coupon lần sau trên hoá đơn in / SMS"
      },
      "status": {
        "en": "Connected",
        "vi": "Đã kết nối"
      }
    },
    {
      "id": "oneqr",
      "tier": "int",
      "name": {
        "en": "OneQR Hero",
        "vi": "Banner OneQR"
      },
      "description": {
        "en": "Primary deal on the business QR",
        "vi": "Ưu đãi chính trên QR của tiệm"
      },
      "status": {
        "en": "No ad spend",
        "vi": "Không tốn phí quảng cáo"
      }
    },
    {
      "id": "sms",
      "tier": "int",
      "name": {
        "en": "Customer SMS",
        "vi": "SMS khách của tiệm"
      },
      "description": {
        "en": "Opt-in customers only",
        "vi": "Chỉ khách đã đồng ý nhận tin"
      },
      "status": {
        "en": "Opt-in checked",
        "vi": "Đã kiểm đồng ý nhận tin"
      }
    },
    {
      "id": "email",
      "tier": "int",
      "name": {
        "en": "Email",
        "vi": "Email"
      },
      "description": {
        "en": "Campaign email with tracking link",
        "vi": "Email có link theo dõi"
      },
      "status": {
        "en": "Sender verified",
        "vi": "Đã xác minh"
      }
    },
    {
      "id": "fb",
      "tier": "int",
      "name": {
        "en": "Facebook Page",
        "vi": "Trang Facebook"
      },
      "description": {
        "en": "Post banner and caption",
        "vi": "Đăng banner và chú thích"
      },
      "status": {
        "en": "Connected",
        "vi": "Đã kết nối"
      }
    },
    {
      "id": "ig",
      "tier": "int",
      "name": {
        "en": "Instagram",
        "vi": "Instagram"
      },
      "description": {
        "en": "Feed and story sizes",
        "vi": "Bài viết và story"
      },
      "status": {
        "en": "Asset ready",
        "vi": "Đã có ảnh"
      }
    },
    {
      "id": "gbp",
      "tier": "int",
      "name": {
        "en": "Google Business",
        "vi": "Google Doanh nghiệp"
      },
      "description": {
        "en": "Update post with booking link",
        "vi": "Bài update kèm link đặt lịch"
      },
      "status": {
        "en": "Connected",
        "vi": "Đã kết nối"
      }
    },
    {
      "id": "web",
      "tier": "int",
      "name": {
        "en": "Website Widget",
        "vi": "Tiện ích website"
      },
      "description": {
        "en": "Embed deal on website",
        "vi": "Nhúng ưu đãi vào website"
      },
      "status": {
        "en": "Code ready",
        "vi": "Đã có mã nhúng"
      }
    },
    {
      "id": "gift",
      "tier": "int",
      "name": {
        "en": "Gift Card Center",
        "vi": "Trung tâm thẻ quà"
      },
      "description": {
        "en": "Bundle with gift card campaign",
        "vi": "Gắn ưu đãi vào thẻ quà"
      },
      "status": {
        "en": "Connected",
        "vi": "Đã kết nối"
      }
    },
    {
      "id": "link",
      "tier": "int",
      "name": {
        "en": "Custom link",
        "vi": "Link tuỳ chỉnh"
      },
      "description": {
        "en": "UTM link for any channel",
        "vi": "Link UTM cho kênh khác"
      },
      "status": {
        "en": "Ready",
        "vi": "Sẵn sàng"
      }
    },
    {
      "id": "nearby",
      "tier": "pub",
      "name": {
        "en": "Deals Nearby / Explore",
        "vi": "Deals Nearby / Explore"
      },
      "description": {
        "en": "Local discovery feed",
        "vi": "Feed khám phá gần đây"
      },
      "status": {
        "en": "Automatic review",
        "vi": "Duyệt tự động"
      }
    },
    {
      "id": "search",
      "tier": "pub",
      "name": {
        "en": "Search Deals",
        "vi": "Tìm ưu đãi"
      },
      "description": {
        "en": "When customers search deals",
        "vi": "Hiện khi khách tìm ưu đãi"
      },
      "status": {
        "en": "Automatic review",
        "vi": "Duyệt tự động"
      }
    },
    {
      "id": "community",
      "tier": "pub",
      "name": {
        "en": "Community",
        "vi": "Cộng đồng"
      },
      "description": {
        "en": "Industry coupons · Feed · Deal Match",
        "vi": "Coupon theo ngành · Bảng tin · Ghép ưu đãi"
      },
      "status": {
        "en": "Automatic review",
        "vi": "Duyệt tự động"
      }
    },
    {
      "id": "xpromo",
      "tier": "pub",
      "name": {
        "en": "Cross-promo partners",
        "vi": "Đối tác chéo"
      },
      "description": {
        "en": "Shown on non-competing partners’ OneQR / idle screen",
        "vi": "Deal hiện ở OneQR / màn chờ của tiệm không cạnh tranh"
      },
      "status": {
        "en": "Automatic review",
        "vi": "Duyệt tự động"
      }
    }
  ],
  "checkin": [
    {
      "id": "idle",
      "emoji": "🖼",
      "name": {
        "en": "Idle screen (rotation)",
        "vi": "Màn chờ (xoay vòng)"
      },
      "hint": {
        "en": "when nobody is checking in",
        "vi": "khi chưa ai check-in"
      }
    },
    {
      "id": "after",
      "emoji": "🎯",
      "name": {
        "en": "After phone entry",
        "vi": "Sau khi nhập SĐT"
      },
      "hint": {
        "en": "personal · only if eligible",
        "vi": "cá nhân · chỉ khi đủ điều kiện"
      }
    },
    {
      "id": "wait",
      "emoji": "🪑",
      "name": {
        "en": "Waiting screen",
        "vi": "Màn mời ngồi chờ"
      },
      "hint": {
        "en": "while waiting",
        "vi": "trong lúc chờ tới lượt"
      }
    },
    {
      "id": "done",
      "emoji": "🙏",
      "name": {
        "en": "After payment",
        "vi": "Sau thanh toán"
      },
      "hint": {
        "en": "rebook · referral",
        "vi": "hẹn lần sau · giới thiệu bạn"
      }
    }
  ],
  "booking": [
    {
      "id": "page",
      "emoji": "🖼",
      "name": {
        "en": "Booking page banner",
        "vi": "Banner trang đặt lịch"
      }
    },
    {
      "id": "slot",
      "emoji": "🏷",
      "name": {
        "en": "Tag eligible time slots",
        "vi": "Nhãn trên khung giờ áp dụng"
      }
    },
    {
      "id": "addon",
      "emoji": "➕",
      "name": {
        "en": "Suggest as add-on",
        "vi": "Gợi ý dịch vụ thêm"
      }
    },
    {
      "id": "ai",
      "emoji": "🤖",
      "name": {
        "en": "AI Voice / receptionist mentions",
        "vi": "AI Voice / lễ tân nhắc"
      }
    },
    {
      "id": "confirm",
      "emoji": "✉️",
      "name": {
        "en": "In confirmations & reminders",
        "vi": "Kèm tin xác nhận & nhắc lịch"
      }
    },
    {
      "id": "hold",
      "emoji": "🔒",
      "name": {
        "en": "Hold a slot at booking",
        "vi": "Giữ suất khi đặt lịch"
      }
    }
  ],
  "services": [
    {
      "id": "pedicure",
      "name": "Pedicure",
      "services": [
        {
          "id": "President 7 Star",
          "name": "President 7 Star"
        },
        {
          "id": "Bitcoin 24k Gold",
          "name": "Bitcoin 24k Gold"
        },
        {
          "id": "Paris Pearl",
          "name": "Paris Pearl"
        },
        {
          "id": "Milk and Honey",
          "name": "Milk and Honey"
        },
        {
          "id": "Classic Pedicure",
          "name": "Classic Pedicure"
        },
        {
          "id": "Add Gel Polish On Any Pedicure",
          "name": "Add Gel Polish On Any Pedicure"
        },
        {
          "id": "Surcharge for A removal Gel or Power",
          "name": "Surcharge for A removal Gel or Power"
        },
        {
          "id": "Extra massage a minute",
          "name": "Extra massage a minute"
        }
      ]
    },
    {
      "id": "manicure",
      "name": "Manicure",
      "services": [
        {
          "id": "Milk & Honey",
          "name": "Milk & Honey"
        },
        {
          "id": "Gel Shellac Manicure",
          "name": "Gel Shellac Manicure"
        },
        {
          "id": "Gel Polish Change (without manicure)",
          "name": "Gel Polish Change (without manicure)"
        },
        {
          "id": "Add Gel Polish Manicure or Pedicure",
          "name": "Add Gel Polish Manicure or Pedicure"
        },
        {
          "id": "Gel Polish Remover",
          "name": "Gel Polish Remover"
        },
        {
          "id": "Deluxe Manicure",
          "name": "Deluxe Manicure"
        },
        {
          "id": "Classic Manicure",
          "name": "Classic Manicure"
        }
      ]
    },
    {
      "id": "kids-menu",
      "name": "Kid's Menu",
      "services": [
        {
          "id": "Pedicure",
          "name": "Pedicure"
        },
        {
          "id": "Manicure",
          "name": "Manicure"
        },
        {
          "id": "Regular Polish on Nails",
          "name": "Regular Polish on Nails"
        },
        {
          "id": "Regular Polish on Toes",
          "name": "Regular Polish on Toes"
        },
        {
          "id": "Gel Add-On",
          "name": "Gel Add-On"
        }
      ]
    },
    {
      "id": "acrylic-full-set",
      "name": "Acrylic Nail — Full Set",
      "services": [
        {
          "id": "Acrylic with polish",
          "name": "Acrylic with polish"
        },
        {
          "id": "Full Set Shellac",
          "name": "Full Set Shellac"
        },
        {
          "id": "White or Pear Tip",
          "name": "White or Pear Tip"
        },
        {
          "id": "Color Powder",
          "name": "Color Powder"
        },
        {
          "id": "Ombre Full Set",
          "name": "Ombre Full Set"
        },
        {
          "id": "Pink & White",
          "name": "Pink & White"
        },
        {
          "id": "Ombre full 2 color",
          "name": "Ombre full 2 color"
        },
        {
          "id": "Ombre 3 color",
          "name": "Ombre 3 color"
        }
      ]
    },
    {
      "id": "acrylic-fill-in",
      "name": "Acrylic Nail — Fill-in",
      "services": [
        {
          "id": "Acrylic with polish",
          "name": "Acrylic with polish"
        },
        {
          "id": "Shellac",
          "name": "Shellac"
        },
        {
          "id": "White or Pear Tip",
          "name": "White or Pear Tip"
        },
        {
          "id": "Color Powder",
          "name": "Color Powder"
        },
        {
          "id": "Ombre",
          "name": "Ombre"
        },
        {
          "id": "Pink & White",
          "name": "Pink & White"
        },
        {
          "id": "Ombre full 2 color",
          "name": "Ombre full 2 color"
        },
        {
          "id": "Ombre 3 color",
          "name": "Ombre 3 color"
        }
      ]
    },
    {
      "id": "dipping-nail",
      "name": "Dipping Nail",
      "services": [
        {
          "id": "Dipping Powder",
          "name": "Dipping Powder"
        },
        {
          "id": "Dipping Powder With Tip",
          "name": "Dipping Powder With Tip"
        },
        {
          "id": "Pink & White Dipping Powder",
          "name": "Pink & White Dipping Powder"
        },
        {
          "id": "Dipping Powder Ombre",
          "name": "Dipping Powder Ombre"
        },
        {
          "id": "Add Full Manicure",
          "name": "Add Full Manicure"
        },
        {
          "id": "Add Cuticle Care",
          "name": "Add Cuticle Care"
        }
      ]
    },
    {
      "id": "builder-gel",
      "name": "Builder Gel — Full Set",
      "services": [
        {
          "id": "Natural Nail Set",
          "name": "Natural Nail Set"
        },
        {
          "id": "Full Set With Tip",
          "name": "Full Set With Tip"
        }
      ]
    },
    {
      "id": "gel-x",
      "name": "Gel-X",
      "services": [
        {
          "id": "Full Set Gel X",
          "name": "Full Set Gel X"
        },
        {
          "id": "Refill Gel X",
          "name": "Refill Gel X"
        }
      ]
    },
    {
      "id": "gel-additional-services",
      "name": "Gel Service — Additional Services",
      "services": [
        {
          "id": "Shellac Polish Change Hand",
          "name": "Shellac Polish Change Hand"
        },
        {
          "id": "Shellac Polish Change Toes",
          "name": "Shellac Polish Change Toes"
        },
        {
          "id": "Special Shapes",
          "name": "Special Shapes"
        },
        {
          "id": "Different Shapes",
          "name": "Different Shapes"
        },
        {
          "id": "Long Length",
          "name": "Long Length"
        },
        {
          "id": "Cut Down + Change Different Shape",
          "name": "Cut Down + Change Different Shape"
        },
        {
          "id": "Cuticle Trim (With Services)",
          "name": "Cuticle Trim (With Services)"
        },
        {
          "id": "Gel Color Change On Acrylic Nail",
          "name": "Gel Color Change On Acrylic Nail"
        },
        {
          "id": "Nail Repair (Dip Gel Polish)",
          "name": "Nail Repair (Dip Gel Polish)"
        },
        {
          "id": "Take Off With Service",
          "name": "Take Off With Service"
        },
        {
          "id": "Take Off Without Services",
          "name": "Take Off Without Services"
        }
      ]
    },
    {
      "id": "additional",
      "name": "Additional",
      "services": [
        {
          "id": "Extra Massage",
          "name": "Extra Massage"
        },
        {
          "id": "Paraffin Wax",
          "name": "Paraffin Wax"
        },
        {
          "id": "Collagen Sock",
          "name": "Collagen Sock"
        },
        {
          "id": "Collagen Gloves",
          "name": "Collagen Gloves"
        },
        {
          "id": "Hot Stone Massage Added on",
          "name": "Hot Stone Massage Added on"
        },
        {
          "id": "Gel Polish Add-On",
          "name": "Gel Polish Add-On"
        },
        {
          "id": "Shellac Polish Change Hand",
          "name": "Shellac Polish Change Hand"
        },
        {
          "id": "Shellac Polish Change Toes",
          "name": "Shellac Polish Change Toes"
        },
        {
          "id": "Shellac with Pedicure or Manicure",
          "name": "Shellac with Pedicure or Manicure"
        },
        {
          "id": "Shellac Take Off with Services",
          "name": "Shellac Take Off with Services"
        },
        {
          "id": "Shellac Take Off without Services",
          "name": "Shellac Take Off without Services"
        },
        {
          "id": "French Tips or Color Tips add on",
          "name": "French Tips or Color Tips add on"
        },
        {
          "id": "Regular Polish Change Hand",
          "name": "Regular Polish Change Hand"
        },
        {
          "id": "Regular Polish Change Toes",
          "name": "Regular Polish Change Toes"
        },
        {
          "id": "Nail Take Off Without Services",
          "name": "Nail Take Off Without Services"
        },
        {
          "id": "Nail Take Off with Services",
          "name": "Nail Take Off with Services"
        },
        {
          "id": "Nail Cut Down",
          "name": "Nail Cut Down"
        },
        {
          "id": "Nail Repair",
          "name": "Nail Repair"
        },
        {
          "id": "Nail Design",
          "name": "Nail Design"
        },
        {
          "id": "Acrylic Gel Color Change",
          "name": "Acrylic Gel Color Change"
        },
        {
          "id": "Acrylic Toe",
          "name": "Acrylic Toe"
        },
        {
          "id": "Acrylic Toe Refill",
          "name": "Acrylic Toe Refill"
        },
        {
          "id": "Extra-long nail 1 in",
          "name": "Extra-long nail 1 in"
        },
        {
          "id": "Extra-long nail 2 in",
          "name": "Extra-long nail 2 in"
        },
        {
          "id": "Nail Buffing Cream",
          "name": "Nail Buffing Cream"
        }
      ]
    },
    {
      "id": "waxing",
      "name": "Waxing Services",
      "services": [
        {
          "id": "Eyebrow",
          "name": "Eyebrow"
        },
        {
          "id": "Lip",
          "name": "Lip"
        },
        {
          "id": "Chin",
          "name": "Chin"
        },
        {
          "id": "Sideburns",
          "name": "Sideburns"
        },
        {
          "id": "Full Face",
          "name": "Full Face"
        },
        {
          "id": "Underarms",
          "name": "Underarms"
        },
        {
          "id": "Half Arms",
          "name": "Half Arms"
        },
        {
          "id": "Full Arms",
          "name": "Full Arms"
        },
        {
          "id": "Lower Legs",
          "name": "Lower Legs"
        },
        {
          "id": "Upper Legs",
          "name": "Upper Legs"
        },
        {
          "id": "Full Legs",
          "name": "Full Legs"
        },
        {
          "id": "Back",
          "name": "Back"
        },
        {
          "id": "Bikini",
          "name": "Bikini"
        },
        {
          "id": "Brazilian",
          "name": "Brazilian"
        }
      ]
    }
  ],
  "placements": [
    {
      "id": "search",
      "name": "Search Deals",
      "description": "Appears above eligible organic results."
    },
    {
      "id": "explore",
      "name": "Explore & Nearby",
      "description": "Reaches customers browsing offers near the target area."
    },
    {
      "id": "network",
      "name": "Network banner",
      "description": "Uses the cover banner across eligible Nexora placements."
    }
  ]
};
