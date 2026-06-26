const TaxIQLayout = (() => {
  const rootPath = document.body.dataset.root || ".";
  const currentPage = document.body.dataset.page || "dashboard";

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
    "run-detail":"fa-solid fa-list-check",    connections:"fa-solid fa-plug",
    payouts:"fa-solid fa-hand-holding-dollar",ledger:"fa-solid fa-book",
    exceptions:"fa-solid fa-triangle-exclamation", jurisdictions:"fa-solid fa-map",
    forms:"fa-solid fa-file-lines",           "ai-advisor":"fa-solid fa-robot",
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
    onboarding:{title:"Onboarding", file:"onboarding.html", subtitle:"First merchant setup, ICP fit, guided empty states, and launch checklist."},
    employers:{title:"Employers", file:"employers.html", subtitle:"Businesses, locations, registrations, and deposit schedules."},
    employees:{title:"Employees", file:"employees.html", subtitle:"Employee and worker tax profiles."},
    "employee-profile":{title:"Employee Profile", file:"employee-profile.html", subtitle:"Profile detail, payroll history, and tax status."},
    "payroll-runs":{title:"Payroll Runs", file:"payroll-runs.html", subtitle:"Create, review, approve, and finalize payroll runs."},
    "run-detail":{title:"Payroll Run Detail", file:"run-detail.html", subtitle:"Validation, line items, exceptions, ledger, and audit."},
    connections:{title:"Connections", file:"connections.html", subtitle:"Payroll, HRIS, payout, and webhook integrations."},
    payouts:{title:"Staff Payouts", file:"payouts.html", subtitle:"Technician payout ledger, evidence, and 1099 sync."},
    ledger:{title:"Tax Ledger", file:"tax-ledger.html", subtitle:"Immutable tax and payout ledger records."},
    exceptions:{title:"Exceptions", file:"exceptions.html", subtitle:"Blocking issues and review workflow."},
    "data-quality":{title:"Data Quality", file:"data-quality.html", subtitle:"Missing data, evidence gaps, integration errors, and CPA readiness."},
    jurisdictions:{title:"Jurisdictions", file:"jurisdictions.html", subtitle:"Federal, state, and local tax footprint."},
    forms:{title:"Forms & Reports", file:"forms-reports.html", subtitle:"Payroll, 1099, CPA, and year-end export center."},
    "ai-advisor":{title:"AI Advisor", file:"ai-advisor.html", subtitle:"AI CFO, official-rule watch, support, and deduction reminders."},
    ocr:{title:"OCR Vault", file:"ocr-vault.html", subtitle:"Receipts, bills, invoices, and AI extraction review."},
    "share-links":{title:"Share Links", file:"share-links.html", subtitle:"Secure upload, review, QR, and profile links."},
    gps:{title:"GPS Mileage", file:"gps-mileage.html", subtitle:"Trip tracking and mileage deduction review."},
    cpa:{title:"CPA Review", file:"cpa-review.html", subtitle:"Connect third-party CPA/bookkeeper to review records and prepare merchant tax filing packages."},
    "tip-ledger":{title:"Tip Ledger", file:"tip-ledger.html", subtitle:"No Tax on Tips — track, classify, and report qualified tips year-round."},
    "tax-estimate":{title:"Tax Estimate", file:"tax-estimate.html", subtitle:"Quarterly and annual federal/state estimated tax dashboard."},
    webhooks:{title:"Webhooks", file:"webhooks.html", subtitle:"Outbound event delivery monitor."},
    "audit-log":{title:"Audit Log", file:"audit-log.html", subtitle:"Immutable action log — every view, change, export, and system event."},
    notifications:{title:"Notifications", file:"notifications.html", subtitle:"Alerts, deposit reminders, CPA requests, and compliance notices."},
    "compliance-review":{title:"Compliance Review", file:"compliance-review.html", subtitle:"Legal, privacy, disclaimer, and go-live readiness checklist."},
    billing:{title:"Billing & Plans", file:"billing.html", subtitle:"Merchant subscription, feature packaging, invoices, and upgrade path."},
    settings:{title:"Settings", file:"settings.html", subtitle:"Roles, security, data retention, and tenant controls."}
  };

  const navGroups = [
    ["Overview",["dashboard","analytics","onboarding"]],
    ["Payroll",["employers","employees","payroll-runs","payouts","connections"]],
    ["Tax IQ",["ledger","exceptions","data-quality","jurisdictions","forms","ocr","share-links","gps","cpa","tip-ledger","tax-estimate","ai-advisor"]],
    ["System",["webhooks","audit-log","notifications","compliance-review","billing","settings"]]
  ];

  function pageHref(id){
    if(id === "dashboard") return rootPath === "." ? "index.html" : "../index.html";
    return rootPath === "." ? "pages/" + pages[id].file : pages[id].file;
  }

  function renderHeader(meta){
    return [
      '<header class="topbar sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-5 border-b border-slate-800 bg-slate-900/95 px-6 py-3 backdrop-blur max-md:flex-col max-md:items-start max-md:px-4">',
        '<div class="title">',
          '<h2 class="m-0 text-lg font-black text-slate-50">' + meta.title + '</h2>',
          '<p class="mt-1 text-xs text-slate-500">' + meta.subtitle + '</p>',
        '</div>',
        '<div class="tools flex min-w-0 items-center gap-2 max-md:w-full">',
          '<label class="search flex h-9 min-w-72 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs font-bold text-slate-500 max-md:min-w-0 max-md:flex-1">',
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
      "#taxiq-sidebar{width:260px;transition:width .22s cubic-bezier(.4,0,.2,1);overflow:hidden}",
      "#taxiq-main{transition:margin-left .22s cubic-bezier(.4,0,.2,1)}",
      /* nav items */
      ".sb-item{display:flex;align-items:center;gap:10px;padding:0 10px;height:44px;border-radius:8px;",
        "text-decoration:none;color:#94a3b8;font-size:13px;font-weight:600;",
        "overflow:hidden;white-space:nowrap;transition:background .12s,color .12s;cursor:pointer}",
      ".sb-item:not(.sb-active):hover{background:rgba(255,255,255,.06);color:#e2e8f0}",
      ".sb-item.sb-active{background:rgba(99,102,241,.15);color:#a5b4fc}",
      /* group labels */
      ".sb-group-label{padding:14px 10px 4px;font-size:10px;font-weight:900;",
        "text-transform:uppercase;letter-spacing:.08em;color:#475569;",
        "white-space:nowrap;overflow:hidden;",
        "transition:opacity .15s,height .22s cubic-bezier(.4,0,.2,1),padding .22s cubic-bezier(.4,0,.2,1)}",
      /* brand + account text */
      ".sb-brand-text,.sb-acct-text{overflow:hidden;white-space:nowrap;margin-left:10px;",
        "transition:opacity .18s,max-width .22s cubic-bezier(.4,0,.2,1),margin-left .22s cubic-bezier(.4,0,.2,1);",
        "max-width:180px}",
      /* toggle icon spin */
      "#sb-toggle-icon{transition:transform .22s cubic-bezier(.4,0,.2,1);display:block}",
      /* mobile: sidebar becomes top bar */
      "@media(max-width:767px){",
        "#taxiq-sidebar{position:static!important;width:100%!important;border-right:none;border-bottom:1px solid #1e293b}",
        "#taxiq-sidebar .sb-brand-row{padding:0 12px}",
        "#taxiq-sidebar .sb-toggle-btn{display:none}",
        "#taxiq-sidebar .sb-nav{flex-direction:row;overflow-x:auto;overflow-y:hidden;flex:none;padding:6px 8px;gap:2px}",
        "#taxiq-sidebar .sb-group-label{display:none}",
        "#taxiq-sidebar .sb-item{flex-direction:column;align-items:center;justify-content:center;",
          "gap:3px;height:auto;min-height:54px;min-width:58px;padding:6px 4px;",
          "white-space:normal;overflow:visible;border-radius:8px}",
        "#taxiq-sidebar .sb-label{font-size:9px;text-align:center;line-height:1.2;",
          "max-width:56px;word-break:break-word;white-space:normal}",
        "#taxiq-sidebar .sb-icon{font-size:16px!important;width:auto!important}",
        "#taxiq-sidebar .sb-acct-row{display:none}",
        "#taxiq-main{margin-left:0!important}",
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
      "#taxiq-sidebar.sb-collapsed .sb-brand-row{padding:0 6px}"
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
    } else {
      sidebar.classList.add("sb-collapsed");
      if(main) main.style.marginLeft = "80px";
    }
  }

  function renderSidebar(){
    const navHTML = navGroups.map(function(group){
      const label = group[0];
      const ids   = group[1];
      return '<div class="sb-group-label">' + label + '</div>' +
        ids.map(function(id){
          const active = id === currentPage ? " sb-active" : "";
          const icon   = pageIcons[id] || "fa-solid fa-circle";
          return '<a class="sb-item' + active + '" href="' + pageHref(id) + '">' +
            '<i class="' + icon + ' fa-fw sb-icon" style="font-size:16px;width:20px;text-align:center;flex-shrink:0"></i>' +
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
            '<p class="text-[10px] text-slate-500 mt-0.5">tenant_demo_001</p>',
          '</div>',
        '</div>',
      '</aside>'
    ].join("");
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
      '<div class="app min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">',
        renderSidebar(),
        '<main id="taxiq-main" class="main min-h-screen flex-1" style="margin-left:' + (_sbOpen ? '260' : '80') + 'px">',
          renderHeader(meta),
          '<section class="content p-6 max-md:p-4" id="content"></section>',
        '</main>',
      '</div>',
      '<div class="modal-backdrop fixed inset-0 z-40 hidden items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm" id="modalRoot"></div>',
      '<div class="toast fixed bottom-5 right-5 z-50 grid gap-2" id="toast"></div>'
    ].join("");
    renderContent();
    applySidebarState(_sbOpen);
    window.taxiqToggleSidebar = function(){
      _sbOpen = !_sbOpen;
      localStorage.setItem("taxiq_sb", _sbOpen ? "1" : "0");
      applySidebarState(_sbOpen);
    };
  }

  return { currentPage, pageHref, pages, renderShell, ui };
})();

window.TaxIQLayout = TaxIQLayout;
