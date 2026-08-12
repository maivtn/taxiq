const TaxIQLayout = (() => {
  const rootPath = document.body.dataset.root || ".";
  const currentPage = document.body.dataset.page || "dashboard";
  const isPagesShell = rootPath === "..";

  const ui = {
    btn:"btn inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white",
    primary:"primary border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-400",
    panel:"panel rounded-lg border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20",
    card:"card rounded-lg border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20",
    panelHead:"flex min-h-12 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3",
    panelBody:"panel-body p-4",
    tableWrap:"table-wrap overflow-auto",
    th:"whitespace-nowrap border-b border-slate-800 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-500",
    td:"whitespace-nowrap border-b border-slate-800/80 px-3 py-3 align-top text-xs text-slate-300",
    nav:"flex h-9 items-center gap-2 border-r-4 border-transparent px-3 text-xs font-bold text-slate-400 transition hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white",
    navActive:"border-indigo-500 bg-indigo-500/10 text-white",
    iconBox:"grid h-5 w-5 place-items-center rounded-md bg-slate-800 text-[10px] font-black text-slate-300",
    input:"min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
  };

  const pageIcons = {
    dashboard:"fa-solid fa-chart-pie",       analytics:"fa-solid fa-chart-line",
    onboarding:"fa-solid fa-clipboard-list", "data-quality":"fa-solid fa-clipboard-check",
    employers:"fa-solid fa-building",         employees:"fa-solid fa-users",
    "employee-profile":"fa-solid fa-user",    "payroll-runs":"fa-solid fa-money-bill-wave",
    "run-detail":"fa-solid fa-list-check",    "quick-pay":"fa-solid fa-bolt",
    "pay-engine":"fa-solid fa-sliders",       "weekly-payroll":"fa-solid fa-calendar-week",
    pos:"fa-solid fa-display",                checkout:"fa-solid fa-cash-register",
    reviews:"fa-solid fa-star",
    "tax-1099":"fa-solid fa-file-invoice-dollar", connections:"fa-solid fa-plug",
    payouts:"fa-solid fa-hand-holding-dollar",ledger:"fa-solid fa-book",
    exceptions:"fa-solid fa-triangle-exclamation", jurisdictions:"fa-solid fa-map",
    forms:"fa-solid fa-file-lines",
    "ai-assistant":"fa-solid fa-wand-magic-sparkles",
    ocr:"fa-solid fa-receipt",                "share-links":"fa-solid fa-link",
    gps:"fa-solid fa-location-dot",           cpa:"fa-solid fa-user-tie",
    "tip-ledger":"fa-solid fa-coins",         "tax-estimate":"fa-solid fa-calculator",
    "compliance-review":"fa-solid fa-scale-balanced",
    webhooks:"fa-solid fa-globe",             "audit-log":"fa-solid fa-magnifying-glass",
    notifications:"fa-solid fa-bell",         billing:"fa-solid fa-credit-card",
    settings:"fa-solid fa-gear"
  };

  const pages = {
    dashboard:{title:"Dashboard", file:"index.html", subtitle:"US payroll, payout, Tax IQ, and advisory overview."},
    analytics:{title:"Analytics", file:"analytics.html", subtitle:"Risk, tax, payout, and operational trends."},
    onboarding:{title:"Onboarding", file:"onboarding.html", subtitle:"First merchant setup, business profile, connections, and launch checklist."},
    employers:{title:"Employers", file:"employers.html", subtitle:"Businesses, locations, registrations, and deposit schedules."},
    employees:{title:"Employees", file:"employees.html", subtitle:"Employee and worker tax profiles."},
    "employee-profile":{title:"Employee Profile", file:"employee-profile.html", subtitle:"Profile detail, payroll history, and tax status."},
    "payroll-runs":{title:"Payroll Runs", file:"payroll-runs.html", subtitle:"Create, review, approve, and finalize payroll runs."},
    "run-detail":{title:"Payroll Run Detail", file:"run-detail.html", subtitle:"Validation, line items, exceptions, ledger, and audit."},
    "quick-pay":{title:"Quick Pay", file:"quick-pay.html", subtitle:"Dashboard > Quick Pay"},
    "pay-engine":{title:"Pay Engine", file:"pay-engine.html", subtitle:"Staff > Payroll > Pay Engine"},
    "weekly-payroll":{title:"Weekly Payroll", file:"weekly-payroll.html", subtitle:"Staff > Payroll > This Week"},
    pos:{title:"POS", file:"pos.html", subtitle:"Check in > Turn Board > Checkout"},
    checkout:{title:"Checkout", file:"checkout.html", subtitle:"Ticket > Tip > Payment > Receipt > TaxIQ sync"},
    connections:{title:"Connections", file:"connections.html", subtitle:"Payroll, HRIS, payout, and webhook integrations."},
    payouts:{title:"Payout Hub", file:"payouts.html", subtitle:"Payout > Overview"},
    ledger:{title:"Tax Ledger", file:"tax-ledger.html", subtitle:"Immutable tax and payout ledger records."},
    exceptions:{title:"Exceptions", file:"exceptions.html", subtitle:"Blocking issues and review workflow."},
    "data-quality":{title:"Data Quality", file:"data-quality.html", subtitle:"Missing data, evidence gaps, integration errors, and CPA readiness."},
    jurisdictions:{title:"Jurisdictions", file:"jurisdictions.html", subtitle:"Federal, state, and local tax footprint."},
    forms:{title:"Forms & Reports", file:"forms-reports.html", subtitle:"Payroll, 1099, CPA, and year-end export center."},
    "ai-advisor":{title:"AI Advisor", file:"ai-advisor.html", subtitle:"AI CFO, official-rule watch, support, and deduction reminders."},
    "ai-assistant":{title:"AI Assistant", file:"ai-assistant.html", subtitle:"Real-time AI receptionist, scheduling, bookkeeping, and revenue insights for your shop."},
    reviews:{title:"Reviews", file:"reviews.html", subtitle:"Google > Yelp > Facebook > Customer feedback"},
    ocr:{title:"OCR Vault", file:"ocr-vault.html", subtitle:"Receipts, bills, invoices, and AI extraction review."},
    "share-links":{title:"Share Links", file:"share-links.html", subtitle:"Secure upload, review, QR, and profile links."},
    gps:{title:"GPS Mileage", file:"gps-mileage.html", subtitle:"Trip tracking and mileage deduction review."},
    cpa:{title:"CPA Review", file:"cpa-review.html", subtitle:"Connect third-party CPA/bookkeeper to review records and prepare merchant tax filing packages."},
    "tip-ledger":{title:"Tip Ledger", file:"tip-ledger.html", subtitle:"No Tax on Tips — track, classify, and report qualified tips year-round."},
    "tax-estimate":{title:"Tax Estimate", file:"tax-estimate.html", subtitle:"Quarterly and annual federal/state estimated tax dashboard."},
    "tax-1099":{title:"Tax Center — 1099/W-2", file:"tax-1099.html", subtitle:"Tax → 1099/W-2 · Deadline: 1099-NEC → Jan 31 · Form 1096 → Feb 28"},
    webhooks:{title:"Webhooks", file:"webhooks.html", subtitle:"Outbound event delivery monitor."},
    "audit-log":{title:"Audit Log", file:"audit-log.html", subtitle:"Immutable action log — every view, change, export, and system event."},
    notifications:{title:"Notifications", file:"notifications.html", subtitle:"Alerts, deposit reminders, CPA requests, and compliance notices."},
    "compliance-review":{title:"Compliance Review", file:"compliance-review.html", subtitle:"Legal, privacy, disclaimer, and operational readiness checklist."},
    billing:{title:"Billing & Plans", file:"billing.html", subtitle:"Merchant subscription, feature packaging, invoices, and upgrade path."},
    settings:{title:"Settings", file:"settings.html", subtitle:"Roles, security, data retention, and tenant controls."}
  };

  const navGroups = [
    ["Overview",["dashboard","analytics","onboarding"]],
    ["Merchant Ops",["pos","checkout","quick-pay","payouts","reviews","ai-assistant"]],
    ["Payroll",["employers","employees","payroll-runs","pay-engine","weekly-payroll","connections"]],
    ["Tax IQ",["ledger","exceptions","data-quality","jurisdictions","forms","tax-1099","ocr","share-links","gps","cpa","tip-ledger","tax-estimate","ai-advisor"]],
    ["System",["webhooks","audit-log","notifications","compliance-review","billing","settings"]]
  ];
  const hiddenNavItems = new Set(["webhooks","audit-log"]);

  function pageHref(id){
    if(id === "dashboard") return rootPath === "." ? "index.html" : "../index.html";
    return rootPath === "." ? "taxiq/" + pages[id].file : pages[id].file;
  }

  function renderHeader(meta){
    const mobileMenuButton = isPagesShell ? [
      '<button class="mobile-menu-btn hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-200 transition hover:bg-slate-800 hover:text-white max-md:inline-flex" type="button" aria-label="Open navigation menu" aria-controls="taxiq-sidebar" aria-expanded="false" data-mobile-sidebar-open>',
        '<i class="fa-solid fa-bars" aria-hidden="true"></i>',
      '</button>'
    ].join("") : "";
    return [
      '<header class="topbar sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-5 border-b border-slate-800 bg-slate-900/95 px-6 py-3 backdrop-blur max-lg:flex-col max-lg:items-start max-md:px-4" style="background:linear-gradient(90deg,rgba(16,23,42,.98),rgba(27,31,58,.98) 48%,rgba(21,31,56,.98));border-color:rgba(88,108,160,.30);box-shadow:0 14px 36px rgba(0,0,0,.20)">',
        '<div class="flex min-w-0 items-start gap-3 max-md:w-full">',
          mobileMenuButton,
          '<div class="title min-w-0 flex-1">',
            '<h2 class="m-0 text-lg font-black text-slate-50" style="text-shadow:0 0 22px rgba(124,58,237,.22)">' + meta.title + '</h2>',
            '<p class="mt-1 text-xs text-slate-500" style="color:#8797c3">' + meta.subtitle + '</p>',
          '</div>',
        '</div>',
        '<div class="tools flex min-w-0 items-center gap-2 max-lg:w-full">',
          '<label class="search flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs font-bold text-slate-500 lg:max-w-sm" style="border-color:rgba(88,108,160,.42);background:rgba(6,10,22,.72);box-shadow:inset 0 1px 0 rgba(255,255,255,.04)">',
            'Search <input class="' + ui.input + '" id="globalSearch" placeholder="runs, workers, issues..." autocomplete="off">',
          '</label>',
          '<a class="' + ui.btn + '" href="' + pageHref("notifications") + '" style="position:relative">',
            'Alerts <span style="background:#ef4444;color:#fff;border-radius:9px;padding:1px 5px;font-size:9px;margin-left:2px;font-weight:900">3</span>',
          '</a>',
        '</div>',
      '</header>'
    ].join("");
  }

  /* ── sidebar state ── persisted in localStorage ── */
  let _sbOpen = localStorage.getItem("taxiq_sb") !== "0";

  function injectSidebarCSS(){
    if(document.getElementById("taxiq-sb-css")) return;
    const s = document.createElement("style");
    s.id = "taxiq-sb-css";
    s.textContent = [
      /* sidebar shell */
      "#taxiq-sidebar{width:260px;transition:width .22s cubic-bezier(.4,0,.2,1);overflow:hidden;background:linear-gradient(180deg,#10162a 0%,#0d1224 52%,#090d19 100%)!important;border-color:rgba(88,108,160,.28)!important;box-shadow:18px 0 45px rgba(0,0,0,.22)}",
      "#taxiq-main{min-width:0;transition:margin-left .22s cubic-bezier(.4,0,.2,1),width .22s cubic-bezier(.4,0,.2,1)}",
      /* nav items */
      ".sb-item{display:flex;align-items:center;gap:10px;padding:0 10px;height:44px;border-radius:8px;",
        "text-decoration:none;color:#97a6cf;font-size:13px;font-weight:700;",
        "overflow:hidden;white-space:nowrap;transition:background .12s,color .12s,border-color .12s,box-shadow .12s;cursor:pointer;border:1px solid transparent}",
      ".sb-item:not(.sb-active):hover{background:rgba(124,58,237,.13);border-color:rgba(124,58,237,.22);color:#e9efff}",
      ".sb-item.sb-active{background:linear-gradient(90deg,rgba(124,58,237,.75),rgba(79,70,229,.46));border-color:rgba(168,85,247,.55);color:#fff;box-shadow:0 10px 26px rgba(124,58,237,.22),inset 0 1px 0 rgba(255,255,255,.12)}",
      ".sb-item.sb-active .sb-icon{color:#fff;text-shadow:0 0 16px rgba(255,255,255,.28)}",
      ".taxiq-ai-icon{position:relative;display:inline-grid!important;place-items:center;width:20px!important;height:20px!important;line-height:1;color:inherit;text-shadow:none!important;flex-shrink:0}",
      ".taxiq-ai-icon-box{display:grid;place-items:center;width:17px;height:17px;border:2px solid currentColor;border-radius:5px;font-size:8px;font-weight:950;letter-spacing:-.03em;line-height:1;background:transparent}",
      ".taxiq-ai-sparkle{position:absolute;right:-2px;top:-3px;width:9px;height:9px;background:currentColor;clip-path:polygon(50% 0,62% 35%,100% 50%,62% 65%,50% 100%,38% 65%,0 50%,38% 35%);filter:drop-shadow(0 0 5px rgba(255,255,255,.28))}",
      /* group labels */
      ".sb-group-label{padding:14px 10px 4px;font-size:10px;font-weight:900;",
        "text-transform:uppercase;letter-spacing:.09em;color:#8ea0c3;",
        "white-space:nowrap;overflow:hidden;",
        "transition:opacity .15s,height .22s cubic-bezier(.4,0,.2,1),padding .22s cubic-bezier(.4,0,.2,1)}",
      /* brand + account text */
      ".sb-brand-text,.sb-acct-text{overflow:hidden;white-space:nowrap;margin-left:10px;",
        "transition:opacity .18s,max-width .22s cubic-bezier(.4,0,.2,1),margin-left .22s cubic-bezier(.4,0,.2,1);",
        "max-width:180px}",
      /* toggle icon spin */
      "#sb-toggle-icon{transition:transform .22s cubic-bezier(.4,0,.2,1);display:block}",
      /* mobile: sidebar becomes a sticky horizontal icon strip at the top */
      "@media(max-width:767px){",
        "#taxiq-sidebar{position:sticky!important;top:0;width:100%!important;z-index:30;border-right:none;border-bottom:1px solid rgba(88,108,160,.30)}",
        "#taxiq-sidebar .sb-brand-row{height:52px;padding:0 12px}",
        "#taxiq-sidebar .sb-toggle-btn{display:none}",
        /* the flex-1 utility only sets flex-grow — must set display:flex for row layout to take effect */
        "#taxiq-sidebar .sb-nav{display:flex;flex-direction:row;flex:none;gap:4px;",
          "overflow-x:auto;overflow-y:hidden;scroll-snap-type:x proximity;",
          "padding:6px 8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}",
        "#taxiq-sidebar .sb-nav::-webkit-scrollbar{display:none}",
        "#taxiq-sidebar .sb-group-label{display:none}",
        "#taxiq-sidebar .sb-item{flex:0 0 auto;flex-direction:column;align-items:center;justify-content:center;",
          "gap:3px;height:auto;min-height:54px;width:60px;min-width:60px;padding:6px 4px;",
          "scroll-snap-align:start;white-space:normal;overflow:visible;border-radius:10px}",
        "#taxiq-sidebar .sb-label{font-size:9px;text-align:center;line-height:1.2;",
          "max-width:56px;word-break:break-word;white-space:normal}",
        "#taxiq-sidebar .sb-icon{font-size:16px!important;width:auto!important}",
        "#taxiq-sidebar .sb-acct-row{display:none}",
        "#taxiq-main{margin-left:0!important;width:100%!important}",
        ".taxiq-pages-shell #taxiq-sidebar{position:fixed!important;inset:0 auto 0 0!important;top:0!important;width:300px!important;max-width:86vw!important;z-index:45;border-right:1px solid rgba(88,108,160,.30)!important;border-bottom:0;transform:translateX(-105%);transition:transform .24s cubic-bezier(.4,0,.2,1),width .22s cubic-bezier(.4,0,.2,1)}",
        ".taxiq-pages-shell #taxiq-sidebar.mobile-drawer-open{transform:translateX(0)}",
        ".taxiq-pages-shell #taxiq-sidebar.sb-collapsed{width:300px!important;max-width:86vw!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-brand-row{height:68px;padding:0 14px!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-toggle-btn{display:none!important}",
        ".taxiq-pages-shell #taxiq-sidebar .mobile-sidebar-close{display:flex!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-nav{display:block!important;flex:1;overflow-y:auto;overflow-x:hidden;padding:8px}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-group-label{display:block!important;opacity:1!important;height:auto!important;padding:14px 10px 4px!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-item{flex:0 0 auto!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;height:44px!important;min-height:44px!important;width:auto!important;min-width:0!important;padding:0 10px!important;white-space:nowrap!important;overflow:hidden!important;border-radius:8px!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-label{font-size:13px!important;text-align:left!important;line-height:1.25!important;max-width:none!important;word-break:normal!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-icon{font-size:16px!important;width:20px!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-acct-row{display:flex!important}",
        ".taxiq-pages-shell #taxiq-sidebar .sb-brand-text,",
        ".taxiq-pages-shell #taxiq-sidebar .sb-acct-text{opacity:1!important;max-width:180px!important;margin-left:10px!important}",
        "body.taxiq-mobile-menu-open{overflow:hidden}",
      "}",
      /* ── collapsed (desktop) ── */
      "#taxiq-sidebar.sb-collapsed{width:80px}",
      "#taxiq-sidebar.sb-collapsed .sb-brand-text,",
      "#taxiq-sidebar.sb-collapsed .sb-acct-text{opacity:0;max-width:0;margin-left:0}",
      "#taxiq-sidebar.sb-collapsed .sb-group-label{opacity:0;height:0;padding:0}",
      "#taxiq-sidebar.sb-collapsed .sb-item{",
        "flex-direction:column;justify-content:center;align-items:center;",
        "gap:3px;height:auto;min-height:56px;padding:8px 4px;",
        "white-space:normal;overflow:visible}",
      "#taxiq-sidebar.sb-collapsed .sb-label{",
        "font-size:9px;text-align:center;line-height:1.3;",
        "max-width:68px;word-break:break-word;white-space:normal;overflow:visible}",
      "#taxiq-sidebar.sb-collapsed .sb-icon{font-size:17px!important;width:auto!important}",
      "#taxiq-sidebar.sb-collapsed #sb-toggle-icon{transform:rotate(180deg)}",
      /* collapsed brand row — reduce padding so logo+toggle fit in 80px */
      "#taxiq-sidebar.sb-collapsed .sb-brand-row{padding:0 6px}",
      "#taxiq-sidebar .taxiq-ai-icon{width:20px!important;height:20px!important;font-size:initial!important}",
      "#taxiq-sidebar.sb-collapsed .taxiq-ai-icon{width:22px!important;height:22px!important}"
    ].join("");
    document.head.appendChild(s);
  }

  function applySidebarState(open){
    const sidebar = document.getElementById("taxiq-sidebar");
    const main    = document.getElementById("taxiq-main");
    if(!sidebar) return;
    if(open){
      sidebar.classList.remove("sb-collapsed");
      if(main) main.style.marginLeft = "260px";
      if(main) main.style.width = "calc(100% - 260px)";
    } else {
      sidebar.classList.add("sb-collapsed");
      if(main) main.style.marginLeft = "80px";
      if(main) main.style.width = "calc(100% - 80px)";
    }
  }

  function renderPageIcon(id){
    if(id === "ai-advisor"){
      return [
        '<span class="taxiq-ai-icon sb-icon" aria-hidden="true" style="flex-shrink:0">',
          '<span class="taxiq-ai-icon-box">AI</span>',
          '<span class="taxiq-ai-sparkle"></span>',
        '</span>'
      ].join("");
    }
    const icon = pageIcons[id] || "fa-solid fa-circle";
    return '<i class="' + icon + ' fa-fw sb-icon" style="font-size:16px;width:20px;text-align:center;flex-shrink:0"></i>';
  }

  function renderSidebar(){
    const navHTML = navGroups.map(function(group){
      const label = group[0];
      const ids   = group[1].filter(function(id){ return !hiddenNavItems.has(id); });
      return '<div class="sb-group-label">' + label + '</div>' +
        ids.map(function(id){
          const active = id === currentPage ? " sb-active" : "";
          return '<a class="sb-item' + active + '" href="' + pageHref(id) + '">' +
            renderPageIcon(id) +
            '<span class="sb-label">' + pages[id].title + '</span>' +
          '</a>';
        }).join("");
    }).join("");

    return [
      '<aside id="taxiq-sidebar" class="sidebar fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-800 bg-slate-900' + (_sbOpen ? '' : ' sb-collapsed') + '">',
        /* Brand row */
        '<div class="sb-brand-row flex h-[68px] shrink-0 items-center justify-between border-b border-slate-800 px-3">',
          '<div class="flex min-w-0 flex-1 items-center overflow-hidden">',
            '<div class="shrink-0 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-black text-white">TIQ</div>',
            '<div class="sb-brand-text">',
              '<p class="text-sm font-black text-slate-100 leading-none">TaxIQ</p>',
              '<p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">US Payroll + Tax</p>',
            '</div>',
          '</div>',
          '<button onclick="window.taxiqToggleSidebar()" class="sb-toggle-btn shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" style="min-width:28px;cursor:pointer">',
            '<i id="sb-toggle-icon" class="fa-solid fa-chevron-left" style="font-size:9px"></i>',
          '</button>',
          isPagesShell ? '<button type="button" class="mobile-sidebar-close hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white" aria-label="Close navigation menu" data-mobile-sidebar-close><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' : '',
        '</div>',
        /* Nav */
        '<nav class="sb-nav flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">',
          navHTML,
        '</nav>',
        /* Account */
        '<div class="sb-acct-row flex shrink-0 items-center border-t border-slate-800 px-3 py-3">',
          '<div class="shrink-0 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 text-xs font-black text-white">PA</div>',
          '<div class="sb-acct-text">',
            '<p class="text-xs font-black text-slate-100 leading-none">Payroll Admin</p>',
            '<p class="text-[10px] text-slate-500 mt-0.5">tenant_001</p>',
          '</div>',
        '</div>',
      '</aside>'
    ].join("");
  }

  function setMobileDrawerOpen(open){
    if(!isPagesShell) return;
    const sidebar = document.getElementById("taxiq-sidebar");
    const button = document.querySelector("[data-mobile-sidebar-open]");
    const backdrop = document.querySelector("[data-mobile-sidebar-backdrop]");
    if(sidebar) sidebar.classList.toggle("mobile-drawer-open", open);
    if(button) button.setAttribute("aria-expanded", open ? "true" : "false");
    if(backdrop){
      backdrop.classList.toggle("hidden", !open);
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
    if(document.body && document.body.classList){
      document.body.classList.toggle("taxiq-mobile-menu-open", open);
    }
  }

  function wireMobileDrawer(){
    if(!isPagesShell) return;
    const button = document.querySelector("[data-mobile-sidebar-open]");
    const backdrop = document.querySelector("[data-mobile-sidebar-backdrop]");
    const closeButton = document.querySelector("[data-mobile-sidebar-close]");
    const sidebar = document.getElementById("taxiq-sidebar");

    if(button) button.addEventListener("click", function(){ setMobileDrawerOpen(true); });
    if(backdrop) backdrop.addEventListener("click", function(){ setMobileDrawerOpen(false); });
    if(closeButton) closeButton.addEventListener("click", function(){ setMobileDrawerOpen(false); });
    if(sidebar){
      sidebar.querySelectorAll("a").forEach(function(link){
        link.addEventListener("click", function(){ setMobileDrawerOpen(false); });
      });
    }
    if(!window.taxiqMobileDrawerKeydownWired){
      document.addEventListener("keydown", function(event){
        if(event.key === "Escape") setMobileDrawerOpen(false);
      });
      window.taxiqMobileDrawerKeydownWired = true;
    }
    setMobileDrawerOpen(false);
  }

  function renderShell(renderContent){
    const meta = pages[currentPage] || pages.dashboard;
    document.title = "TaxIQ - " + meta.title;
    if (!document.getElementById("fa-cdn")) {
      const lnk = document.createElement("link");
      lnk.id = "fa-cdn"; lnk.rel = "stylesheet";
      lnk.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
      document.head.appendChild(lnk);
    }
    injectSidebarCSS();
    _sbOpen = localStorage.getItem("taxiq_sb") !== "0";
    document.getElementById("app").innerHTML = [
      '<div class="app min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row' + (isPagesShell ? ' taxiq-pages-shell' : '') + '">',
        renderSidebar(),
        '<main id="taxiq-main" class="main min-h-screen flex-1" style="margin-left:' + (_sbOpen ? '260' : '80') + 'px;width:calc(100% - ' + (_sbOpen ? '260' : '80') + 'px)">',
          renderHeader(meta),
          '<section class="content p-6 max-md:p-4" id="content"></section>',
        '</main>',
      '</div>',
      isPagesShell ? '<button type="button" class="mobile-sidebar-backdrop fixed inset-0 z-40 hidden bg-slate-950/70 backdrop-blur-sm md:hidden" aria-label="Close navigation menu" aria-hidden="true" data-mobile-sidebar-backdrop></button>' : '',
      '<div class="modal-backdrop fixed inset-0 z-40 hidden items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm" id="modalRoot"></div>',
      '<div class="toast fixed bottom-5 right-5 z-50 grid gap-2" id="toast"></div>'
    ].join("");
    renderContent();
    applySidebarState(_sbOpen);
    wireMobileDrawer();
    /* on the mobile horizontal nav strip, bring the active item into view */
    if (window.matchMedia("(max-width:767px)").matches) {
      const active = document.querySelector("#taxiq-sidebar .sb-item.sb-active");
      if (active && active.scrollIntoView) {
        active.scrollIntoView({ inline: "center", block: "nearest" });
      }
    }
    window.taxiqToggleSidebar = function(){
      _sbOpen = !_sbOpen;
      localStorage.setItem("taxiq_sb", _sbOpen ? "1" : "0");
      applySidebarState(_sbOpen);
    };
  }

  return { currentPage, pageHref, pages, renderShell, ui };
})();

window.TaxIQLayout = TaxIQLayout;
