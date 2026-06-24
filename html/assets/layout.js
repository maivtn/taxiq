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

  const pages = {
    dashboard:{title:"Dashboard", file:"index.html", subtitle:"US payroll, payout, Tax IQ, and advisory overview."},
    analytics:{title:"Analytics", file:"analytics.html", subtitle:"Risk, tax, payout, and operational trends."},
    employers:{title:"Employers", file:"employers.html", subtitle:"Businesses, locations, registrations, and deposit schedules."},
    employees:{title:"Employees", file:"employees.html", subtitle:"Employee and worker tax profiles."},
    "employee-profile":{title:"Employee Profile", file:"employee-profile.html", subtitle:"Profile detail, payroll history, and tax status."},
    "payroll-runs":{title:"Payroll Runs", file:"payroll-runs.html", subtitle:"Create, review, approve, and finalize payroll runs."},
    "run-detail":{title:"Payroll Run Detail", file:"run-detail.html", subtitle:"Validation, line items, exceptions, ledger, and audit."},
    connections:{title:"Connections", file:"connections.html", subtitle:"Payroll, HRIS, payout, and webhook integrations."},
    payouts:{title:"Staff Payouts", file:"payouts.html", subtitle:"Technician payout ledger, evidence, and 1099 sync."},
    ledger:{title:"Tax Ledger", file:"tax-ledger.html", subtitle:"Immutable tax and payout ledger records."},
    exceptions:{title:"Exceptions", file:"exceptions.html", subtitle:"Blocking issues and review workflow."},
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
    settings:{title:"Settings", file:"settings.html", subtitle:"Roles, security, data retention, and tenant controls."}
  };

  const navGroups = [
    ["Overview",["dashboard","analytics"]],
    ["Payroll",["employers","employees","payroll-runs","payouts","connections"]],
    ["Tax IQ",["ledger","exceptions","jurisdictions","forms","ocr","share-links","gps","cpa","tip-ledger","tax-estimate","ai-advisor"]],
    ["System",["webhooks","audit-log","notifications","settings"]]
  ];

  function pageHref(id){
    if(id === "dashboard") return rootPath === "." ? "index.html" : "../index.html";
    return rootPath === "." ? `pages/${pages[id].file}` : pages[id].file;
  }

  function icon(id){
    return pages[id].title.split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
  }

  function renderSidebar(){
    return `
      <aside class="sidebar fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col border-r border-slate-800 bg-slate-900 max-md:static max-md:w-full">
        <div class="brand flex h-[68px] items-center gap-3 border-b border-slate-800 px-4"><div class="mark grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-black text-white">TIQ</div><div><h1 class="m-0 text-sm font-black leading-none">TaxIQ Demo</h1><p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">US Payroll + Payout</p></div></div>
        <nav class="nav max-md:grid max-md:grid-cols-2">${navGroups.map(([label,ids])=>`<div class="group-label px-4 pb-2 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-600 max-md:col-span-2">${label}</div>${ids.map(id=>`<a class="${ui.nav} ${id===currentPage?ui.navActive:""}" href="${pageHref(id)}"><span class="${ui.iconBox}">${icon(id)}</span><span>${pages[id].title}</span></a>`).join("")}`).join("")}</nav>
        <div class="account mt-auto flex items-center gap-3 border-t border-slate-800 p-4"><div class="avatar grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-400 text-xs font-black text-white">PA</div><div><strong class="block text-xs font-black">Payroll Admin</strong><span class="block text-[10px] text-slate-500">tenant_demo_001</span></div></div>
      </aside>`;
  }

  function renderHeader(meta){
    return `
      <header class="topbar sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-5 border-b border-slate-800 bg-slate-900/95 px-6 py-3 backdrop-blur max-md:flex-col max-md:items-start max-md:px-4">
        <div class="title"><h2 class="m-0 text-lg font-black text-slate-50">${meta.title}</h2><p class="mt-1 text-xs text-slate-500">${meta.subtitle}</p></div>
        <div class="tools flex min-w-0 items-center gap-2 max-md:w-full"><label class="search flex h-9 min-w-72 items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 text-xs font-bold text-slate-500 max-md:min-w-0 max-md:flex-1">Search <input class="${ui.input}" id="globalSearch" placeholder="runs, workers, issues..." autocomplete="off"></label><a class="${ui.btn}" href="${pageHref("notifications")}" style="position:relative">Alerts <span style="background:#ef4444;color:#fff;border-radius:9px;padding:1px 5px;font-size:9px;margin-left:2px;font-weight:900">3</span></a><button class="${ui.btn} ${ui.primary}" data-modal="create-run">New Run</button></div>
      </header>`;
  }

  function renderShell(renderContent){
    const meta = pages[currentPage] || pages.dashboard;
    document.title = `TaxIQ Demo - ${meta.title}`;
    document.getElementById("app").innerHTML = `
      <div class="app min-h-screen bg-slate-950 text-slate-100 md:flex">
        ${renderSidebar()}
        <main class="main min-h-screen flex-1 md:ml-[260px]">
          ${renderHeader(meta)}
          <section class="content p-6 max-md:p-4" id="content"></section>
        </main>
      </div>
      <div class="modal-backdrop fixed inset-0 z-40 hidden items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm" id="modalRoot"></div>
      <div class="toast fixed bottom-5 right-5 z-50 grid gap-2" id="toast"></div>`;
    renderContent();
  }

  return { currentPage, pageHref, pages, renderShell, ui };
})();

window.TaxIQLayout = TaxIQLayout;
