const { currentPage, pageHref, renderShell, ui } = window.TaxIQLayout;

const tones = {
  green:"border-emerald-500 text-emerald-300 bg-emerald-500/10",
  cyan:"border-cyan-500 text-cyan-300 bg-cyan-500/10",
  yellow:"border-amber-500 text-amber-300 bg-amber-500/10",
  red:"border-rose-500 text-rose-300 bg-rose-500/10",
  blue:"border-indigo-500 text-indigo-300 bg-indigo-500/10"
};

const data = window.TaxIQMockData;

let activeGpsTrip = null;

function gpsToRad(value){return value * Math.PI / 180;}
function gpsDistanceMiles(points){
  if(!points || points.length < 2) return 0;
  const radiusMiles = 3958.8;
  let total = 0;
  for(let i = 1; i < points.length; i++){
    const a = points[i - 1], b = points[i];
    const dLat = gpsToRad(b.lat - a.lat);
    const dLon = gpsToRad(b.lng - a.lng);
    const lat1 = gpsToRad(a.lat);
    const lat2 = gpsToRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    total += radiusMiles * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  return total;
}
function gpsPointLabel(point){
  if(!point) return "Waiting for GPS";
  return point.label || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

function statusClass(v){return /posted|delivered|ready|active|verified|connected|confirmed|extracted|calculated|candidate|qualified|paid/i.test(v) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 before:bg-emerald-400" : /review|pending|draft|retry|requested|watch|needs|invited|medium/i.test(v) ? "border-amber-500/30 bg-amber-500/10 text-amber-300 before:bg-amber-400" : /failed|dead|missing|open|high|cancelled/i.test(v) ? "border-rose-500/30 bg-rose-500/10 text-rose-300 before:bg-rose-400" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 before:bg-indigo-400";}
function status(v){return `<span class="status inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-black before:block before:h-1.5 before:w-1.5 before:rounded-full ${statusClass(v)}">${v}</span>`;}
function metric([label,value,sub,color,href]){
  const body = `<div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div>`;
  const cls = `${ui.card} border-t-4 ${tones[color] || tones.blue} p-4 ${href ? "metric-link block transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-slate-900" : ""}`;
  return href ? `<a class="${cls}" href="${pageHref(href)}">${body}</a>` : `<div class="${cls}">${body}</div>`;
}
function moneyNumber(value){return Number(String(value ?? "").replace(/[^0-9.-]/g,"")) || 0;}
function moneyText(value){return value.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:value % 1 ? 2 : 0});}
function table(headers, rows){
  const sticky = /actions?/i.test(headers[headers.length - 1] || "");
  return `<div class="${ui.tableWrap} ${sticky ? "sticky-last-col" : ""}"><table class="w-full border-collapse text-xs"><thead><tr>${headers.map(h=>`<th class="${ui.th}">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td class="${ui.td}" colspan="${headers.length}"><div class="empty"><strong>No records yet.</strong><span>Add a record or adjust filters to continue.</span></div></td></tr>`}</tbody></table></div>`;
}
function row(cells, opts={}){
  return `<tr class="${opts.className || ""} ${opts.click ? "clickable cursor-pointer hover:bg-slate-800/60" : "hover:bg-slate-800/30"}" ${opts.href ? `data-href="${opts.href}"` : ""}>${cells.map((c,i)=>`<td class="${ui.td} ${Array.isArray(opts.wrap) ? (opts.wrap.includes(i) ? "wrap whitespace-normal min-w-64" : "") : (opts.wrap === i ? "wrap whitespace-normal min-w-64" : "")}">${c}</td>`).join("")}</tr>`;
}
function panel(title, body, actions=""){return `<div class="${ui.panel}"><div class="${ui.panelHead}"><h3 class="text-sm font-black text-slate-100">${title}</h3><div class="actions">${actions}</div></div>${body}</div>`;}
function listItem(title,text,color="blue"){return `<div class="item flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"><span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color==="green"?"bg-emerald-400":color==="yellow"?"bg-amber-400":color==="red"?"bg-rose-400":"bg-indigo-400"}"></span><div><div class="item-title text-xs font-black text-slate-100">${title}</div><div class="item-text mt-1 text-xs leading-relaxed text-slate-400">${text}</div></div></div>`;}
function rowActions(...btns){return `<div class="flex gap-1 flex-nowrap">${btns.join("")}</div>`;}
function actionBtn(label, modal){return modal ? `<button class="${ui.btn}" data-modal="${modal}">${label}</button>` : `<button class="${ui.btn}" data-toast="${label} queued.">${label}</button>`;}
function filterBar(...selects){return `<div class="flex flex-wrap gap-2 mb-4">${selects.map(([label,opts])=>`<select class="form-control" style="width:auto;min-width:150px"><option>${label}</option>${opts.map(o=>`<option>${o}</option>`).join("")}</select>`).join("")}</div>`;}
function barChart(items){
  const max = Math.max(...items.map(i=>i.value), 1);
  return `<div class="chart-panel">${items.map(item=>`
    <div class="chart-row">
      <div class="chart-label"><strong>${item.label}</strong><span>${item.sub || ""}</span></div>
      <div class="chart-track"><div class="chart-bar ${item.color || "blue"}" style="width:${Math.max(8, Math.round(item.value / max * 100))}%"></div></div>
      <div class="chart-value">${item.display || item.value}</div>
    </div>`).join("")}</div>`;
}
function miniMap(){
  return `<div class="route-map" aria-label="Route preview placeholder">
    <div class="map-grid"></div>
    <div class="map-route"></div>
    <div class="map-pin start">A</div>
    <div class="map-pin end">B</div>
  </div>`;
}
function skeletonPreview(){
  return `<div class="skeleton-stack" aria-label="Loading state preview">
    <div class="skeleton-line w-40"></div>
    <div class="skeleton-grid">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
  </div>`;
}

const renderers = {
  dashboard:renderDashboard, analytics:renderAnalytics,
  employers:renderEmployers, employees:renderEmployees, "employee-profile":renderEmployeeProfile,
  "payroll-runs":renderRuns, "run-detail":renderRunDetail,
  connections:renderConnections, payouts:renderPayouts,
  ledger:renderLedger, exceptions:renderExceptions, jurisdictions:renderJurisdictions,
  forms:renderForms, "ai-advisor":renderAiAdvisor, ocr:renderOcr,
  "share-links":renderShareLinks, gps:renderGps, cpa:renderCpa,
  "tip-ledger":renderTipLedger, "tax-estimate":renderTaxEstimate,
  webhooks:renderWebhooks, "audit-log":renderAuditLog,
  notifications:renderNotifications, billing:renderBilling, settings:renderSettings
};

function renderPage(){
  document.getElementById("content").innerHTML = (renderers[currentPage] || renderDashboard)();
}

/* ─── DASHBOARD ─── */
function renderDashboard(){
  const runRows = data.runs.slice(0,5).map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[5],r[6],r[7],status(r[8])],{click:true,href:pageHref("run-detail")}));
  const issues = data.exceptions.slice(0,4).map(e=>listItem(e[1],`${e[6]} Owner: ${e[3]}.`,e[2]==="High"?"red":"yellow")).join("");
  const workflowCards = [
    ["AI Advisor","AI CFO","Cash-flow and tax planning prompts are ready.","green","ai-advisor"],
    ["OCR Vault","Receipt Capture","6 evidence records are stored for review.","blue","ocr"],
    ["Share Links","Secure Links","CPA, technician, and profile links are active.","yellow","share-links"],
    ["Tax Estimate","Quarterly Forecast","Federal, SUTA, and state balances are ready.","red","tax-estimate"],
    ["Tip Ledger","No Tax on Tips","YTD qualified tip tracking and cap warnings.","cyan","tip-ledger"],
    ["GPS Mileage","Route Evidence","A to B mileage trips ready for CPA review.","green","gps"]
  ].map(([title,item,text,color,href])=>panel(title,`<div class="panel-body">${listItem(item,text,color)}</div>`,`<a class="btn" href="${pageHref(href)}">Open</a>`)).join("");
  return `<div class="grid-4" style="margin-bottom:14px">${data.metrics.map(metric).join("")}</div><div class="split"><div>${panel("Recent Payroll Runs",table(["Run ID","Period","Pay Date","Gross","Tax","Risk","Status"],runRows),`<a class="btn" href="${pageHref("payroll-runs")}">View All</a>`)}</div>${panel("TaxIQ Issues",`<div class="panel-body list">${issues}</div>`,`<a class="btn" href="${pageHref("exceptions")}">Open Queue</a>`)}</div><div class="grid-3" style="margin-top:14px">${workflowCards}</div>`;
}

/* ─── ANALYTICS ─── */
function renderAnalytics(){
  const riskRows = data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[7],status(r[8])]));
  const jurisdictionChart = barChart([
    {label:"Federal",value:210000,display:"$210K",sub:"Income + FICA",color:"red"},
    {label:"California",value:59600,display:"$59.6K",sub:"State withholding",color:"yellow"},
    {label:"New York",value:40000,display:"$40K",sub:"State withholding",color:"blue"},
    {label:"Texas SUTA",value:6920,display:"$6.9K",sub:"Employer tax",color:"green"}
  ]);
  const riskTrend = barChart(data.runs.map(r=>({label:r[0],value:Number(r[7]) || 0,display:r[7],sub:r[1],color:(Number(r[7]) || 0) > 50 ? "red" : (Number(r[7]) || 0) > 25 ? "yellow" : "green"})));
  return `${filterBar(["All periods",["Q1 2026","Q2 2026","YTD 2026"]],["All employers",["Acme Manufacturing LLC","TechCorp Solutions Inc.","Retail Partners Group"]])}<div class="grid-4" style="margin-bottom:14px">${[["Average Risk","24","Across scored runs","green"],["Webhook Success","99.7%","Current sample","cyan"],["Blocking Exceptions","4","Strict mode blockers","yellow"],["Missing Profiles","2","Tax profiles needed","red"]].map(metric).join("")}</div><div class="grid-2">${panel("Risk Trend by Payroll Run",riskTrend)}${panel("Tax by Jurisdiction",jurisdictionChart)}</div><div class="grid-2" style="margin-top:14px">${panel("Risk by Run",table(["Run","Period","Risk","Status"],riskRows))}${panel("Deposit Calendar",table(["Jurisdiction","Schedule","Next Due"],data.jurisdictions.map(j=>row([j[1],j[5],j[6]]))))}</div>`;
}

/* ─── EMPLOYERS ─── */
function renderEmployers(){
  const empRows = data.employers.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],e[5],e[6],e[7],status(e[8]),rowActions(actionBtn("View","employer-detail"),actionBtn("Edit","edit-employer"),actionBtn("Registrations","employer-registrations"))]));
  return panel("Employers",table(["Employer","ID","Industry","Employees","Registrations","Deposit Schedule","Next Deposit","Health","Status","Actions"],empRows),`<button class="btn primary" data-modal="employer">Add Employer</button>`);
}

/* ─── EMPLOYEES ─── */
function renderEmployees(){
  const empRows = data.employees.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],status(e[5]),status(e[6]),e[7],e[8],e[9],rowActions(`<a class="${ui.btn}" href="${pageHref("employee-profile")}">View</a>`,actionBtn("Verify","tin-verification"),actionBtn("Request W-4",""))]));
  return `${filterBar(["All TIN statuses",["Verified","Pending","Missing"]],["All W-4 years",["2026","2024","Missing"]],["All departments",["Finance","Engineering","Operations","Sales","Support"]])}${panel("Employees",table(["Employee","ID","Dept","Residence","Work","TIN","W-4","Filing","Updated","Risk","Actions"],empRows),`<button class="btn primary" data-modal="employee">Invite Employee</button> <button class="btn" data-toast="Employee roster exported.">Export Roster</button>`)}<div class="pagination-bar"><span>Showing 1-5 of 142 employees</span><div><button class="${ui.btn}" disabled>Previous</button><button class="${ui.btn}">Page 1</button><button class="${ui.btn}">Next</button></div></div>`;
}

/* ─── EMPLOYEE PROFILE ─── */
function renderEmployeeProfile(){
  return `<div class="detail"><div>${panel("Employee Summary",`<div class="panel-body"><div class="grid-2"><div class="card panel-body"><div class="label">Employee</div><div class="value" style="font-size:22px">Jane A. Nguyen</div><div class="sub">Finance - Acme Manufacturing LLC</div></div><div class="card panel-body"><div class="label">Tax Status</div><div class="value" style="font-size:22px">Pending</div><div class="sub">TIN verification in progress</div></div></div></div>`,`${actionBtn("Edit Profile","edit-employee")} ${actionBtn("Resend Invite","")}`)}${panel("Payroll Tax History",table(["Run","Gross","Taxable","Employee Tax","Employer Tax","Net","Status"],data.lineItems.slice(0,3).map(i=>row(["pr_2026_06_15",i[2],i[3],i[5],i[6],i[7],status(i[8])]))))}</div><div>${panel("Tax Profile",`<div class="panel-body"><div class="row"><span>Form</span><span>W-4 2026</span></div><div class="row"><span>Filing</span><span>Single</span></div><div class="row"><span>SSN</span><span class="mono">***-**-6789</span></div><div class="row"><span>Token</span><span class="mono">tok_ssn_abc123</span></div><div class="notice">TIN verification is pending. Resolve before strict finalization.</div></div>`,`${actionBtn("Verify TIN","tin-verification")} ${actionBtn("Edit Tax Status","edit-tax-status")}`)}${panel("Recent Tips",`<div class="panel-body">${listItem("Tip Ledger","Worker has 6 tip entries this month. YTD: $215 tracked.","green")}</div>`,`<a class="btn" href="${pageHref("tip-ledger")}">View Ledger</a>`)}</div></div>`;
}

/* ─── PAYROLL RUNS ─── */
function renderRuns(){
  const runActions = r => {
    const primary = /Pending|Validation Failed/i.test(r[8]) ? actionBtn("Finalize","finalize") : /Review Required/i.test(r[8]) ? actionBtn("Review","line-items") : actionBtn("Report","report");
    return rowActions(`<a class="${ui.btn}" href="${pageHref("run-detail")}">View</a>`,primary,actionBtn("Line Items","line-items"));
  };
  return `${filterBar(["All statuses",["Ledger Posted","Review Required","Pending","Validation Failed"]],["All employers",["Acme Manufacturing LLC","TechCorp Solutions Inc.","Retail Partners Group"]])}${panel("Payroll Runs",table(["Run ID","Period","Pay Date","Deposit Due","Employees","Gross","Tax","Risk","Status","Actions"],data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[3],r[4],r[5],r[6],r[7],status(r[8]),runActions(r)]))),`<button class="btn primary" data-modal="create-run">Create Run</button>`)}`;
}

/* ─── RUN DETAIL ─── */
function renderRunDetail(){
  const steps=["Draft","Imported","Validated","Tax Preview","Approved","Finalized","Ledger Posted","Reported"].map((s,i)=>`<div class="step ${i<6?"done":i===6?"current":""}">${s}</div>`).join("");
  const checks=[["Schema and source integrity","Pass","142 employee records matched import checksum."],["TIN/W-4 readiness","Warn","1 TIN is pending with manual review note."],["Ledger reconciliation","Pass","Employee and employer taxes match posted ledger."]].map(c=>listItem(`${c[0]} ${status(c[1])}`,c[2],c[1]==="Pass"?"green":"yellow")).join("");
  return `<div class="actions" style="margin-bottom:14px"><a class="btn" href="${pageHref("payroll-runs")}">Back</a><button class="btn" data-modal="line-items">Line Items</button><button class="btn" data-toast="Run cancelled. Reason required.">Cancel Run</button><button class="btn primary" data-modal="finalize">Finalize Run</button>${status("Ledger Posted")}</div><div class="steps">${steps}</div><div class="detail"><div>${panel("Validation Gate",`<div class="panel-body list">${checks}</div>`)}${panel("Line Items",table(["Employee","Dept","Gross","Taxable","Pre-tax","Employee Tax","Employer Tax","Net","Status"],data.lineItems.map(i=>row(i.map((v,idx)=>idx===8?status(v):v)))))}${panel("Tax Breakdown",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash","Action"],data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1,l.length-1),`<span class="mono text-[10px] text-slate-600">${l[l.length-1]}</span>`,actionBtn("Verify","verify-hash")]))))}</div><div>${panel("Run Summary",`<div class="panel-body"><div class="row"><span>Run ID</span><span class="mono">pr_2026_06_15</span></div><div class="row"><span>Gross Pay</span><span>$312,448</span></div><div class="row"><span>Employee Tax</span><span>$54,621</span></div><div class="row"><span>Employer Tax</span><span>$26,402</span></div><div class="row"><span>Deposit Due</span><span>Jun 24, 2026</span></div></div>`)}${panel("Audit Trail",`<div class="panel-body list">${listItem("Finalized payroll run","payroll_admin_44 - Validation passed with one warning.","green")}${listItem("Posted tax ledger","system - Generated immutable ledger entries.","blue")}</div>`,`<a class="btn" href="${pageHref("audit-log")}">Full Audit Log</a>`)}</div></div>`;
}

/* ─── CONNECTIONS ─── */
function renderConnections(){
  const connRows = data.connections.map(c=>row([`<span class="mono">${c[0]}</span>`,c[1],c[2],c[3],c[4],c[5],status(c[6]),c[7],`<span class="mono">${c[8]}</span>`,c[9],rowActions(actionBtn("Test","test-connection"),actionBtn("Edit","edit-connection"),`<button class="${ui.btn}" data-revoke-conn="${c[0]}">Revoke</button>`)],{wrap:[8,9]}));
  return `${filterBar(["All statuses",["Connected","Degraded"]],["All auth",["OAuth 2.0","API Key"]])}${panel("Connections",table(["Conn ID","Name","Employer","Auth","Signing","Scopes","Status","Last Sync","Endpoint URL","Last Error","Actions"],connRows),`<button class="btn primary" data-modal="connection">Add Connection</button>`)}`;
}

/* ─── PAYOUTS ─── */
function renderPayouts(){
  return `${filterBar(["All periods",["Jun 1-15","May 16-31","May 1-15"]],["All methods",["Zelle","PayPal","Cash","ACH","Check"]],["All statuses",["Confirmed","Pending","Cancelled"]])}<div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button class="${ui.btn}" data-toast="CSV export prepared and downloading.">Export CSV</button></div>${panel("Staff Payouts",table(["Payout","Worker","Staff ID","Period","Amount","Method","Type","Status","Evidence","Actions"],data.payouts.map(p=>row([`<span class="mono">${p[0]}</span>`,...p.slice(1,7),status(p[7]),p[8],rowActions(actionBtn("Review","payout-detail"),`<button class="${ui.btn}" data-mark-paid="${p[0]}">Mark Paid</button>`,`<button class="${ui.btn}" data-toast="Dispute opened for ${p[0]}. Finance team notified.">Dispute</button>`)]))),`<button class="btn primary" data-modal="payout">Create Payout</button>`)}`;
}

/* ─── TAX LEDGER ─── */
function renderLedger(){
  const ledRows = data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1,l.length-1),`<span class="mono text-[10px] text-slate-600">${l[l.length-1]}</span>`,actionBtn("Verify","verify-hash")]));
  const taxable = data.ledger.reduce((sum,l)=>sum + moneyNumber(l[5]),0);
  const employeeTax = data.ledger.reduce((sum,l)=>sum + moneyNumber(l[6]),0);
  const employerTax = data.ledger.reduce((sum,l)=>sum + moneyNumber(l[7]),0);
  return `${filterBar(["All jurisdictions",["US-FED","US-TX","US-CA","US-NY"]],["All types",["federal_income_tax","social_security","medicare","ca_state_income_tax","suta_employer_tax"]],["All runs",["pr_2026_06_15","pr_2026_06_01","pr_2026_05_15","pr_bonus_q2"]])}<div class="grid-3" style="margin-bottom:14px">${[["Taxable Wages",moneyText(taxable),"Across visible ledger","green"],["Employee Tax",moneyText(employeeTax),"Withholding entries","cyan"],["Employer Tax",moneyText(employerTax),"FICA/SUTA entries","yellow"]].map(metric).join("")}</div>${panel("Tax Ledger",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash","Action"],ledRows),`<button class="btn primary" data-modal="report">Download Report</button>`)}`;
}

/* ─── EXCEPTIONS ─── */
function renderExceptions(){
  const exRows = data.exceptions.map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],status(e[2]),e[3],status(e[4]),e[5],e[6],rowActions(`<button class="${ui.btn}" data-resolve-exc="${e[0]}">Resolve</button>`,`<button class="${ui.btn}" data-toast="Assigned ${e[0]} to ${e[3]} team.">Assign</button>`,`<button class="${ui.btn}" data-toast="Note saved for ${e[0]}.">Note</button>`)],{wrap:6}));
  return `${filterBar(["All statuses",["Open","Reviewing","Closed"]],["All severities",["High","Medium","Low"]],["All owners",["Payroll","HR","Tax"]])}${panel("Exceptions Queue",table(["ID","Type","Severity","Owner","Status","Run","Description","Actions"],exRows))}`;
}

/* ─── JURISDICTIONS ─── */
function renderJurisdictions(){
  const jRows = data.jurisdictions.map(j=>row([j[0],j[1],j[2],j[3],status(j[4]),j[5],j[6],j[7],rowActions(actionBtn("Edit","edit-jurisdiction"),actionBtn("Sync",""))]));
  return `<div class="grid-2">${panel("Jurisdiction Summary",table(["ID","Name","Employee Tax","Employer Tax","Registration","Schedule","Next Due","Risk","Actions"],jRows))}${panel("US Payroll Tax Programs",table(["Program","Level","Agency","Forms"],[["Federal income tax withholding","Federal","IRS","W-4, 941, W-2"],["Social Security and Medicare","Federal","IRS","941, W-2"],["FUTA","Federal","IRS","940"],["State withholding","State","State revenue agencies","State withholding returns"],["SUTA","State","State workforce agencies","SUTA wage reports"]].map(r=>row(r,{wrap:3}))))}</div>`;
}

/* ─── FORMS & REPORTS ─── */
function renderForms(){
  const formRows = data.forms.map(f=>row([f[0],f[1],f[2],f[3],f[4],status(f[5]),rowActions(actionBtn("Preview","preview-form"),actionBtn("Share","share-form"),actionBtn("Download",""),actionBtn("Archive",""))]));
  return `${filterBar(["All types",["W-2","1099","941","940","SUTA"]],["All periods",["YTD 2026","Q2 2026"]],["All statuses",["Ready","Draft","Needs Review"]])}${panel("Forms & Reports",table(["Report","Period","Records","Source","Due","Status","Actions"],formRows),`<button class="btn primary" data-modal="report">Generate Package</button>`)}`;
}

/* ─── AI ADVISOR ─── */
function renderAiAdvisor(){return `<div class="grid-4" style="margin-bottom:14px">${[["AI CFO","On","Cash-flow and tax prompts","green"],["Rule Watch","Beta","Official-source monitor enabled","cyan"],["Deduction Lists","6","Industry reminders","yellow"],["Guided Help","Ready","Context support","red"]].map(metric).join("")}</div><div class="grid-2">${panel("AI CFO Prompt Starters",table(["Area","Prompt","Action"],[["Cash flow","Review upcoming payroll, payout, rent, supplies, and tax pressure.","Ask"],["Tax planning","Find missing records before quarter close.","Ask"],["Support","Explain what screen to use next when blocked.","Ask"]].map(r=>row([r[0],r[1],`<button class="btn primary" data-modal="ai-cfo">${r[2]}</button>`],{wrap:1}))))}${panel("Government Rule Watch",table(["Source","Topic","Impact","Next Action"],[["IRS / State agencies","Payroll and 1099 deadline monitor",status("Review"),"Verify official feed source, map deadlines to merchant profile, then create owner task."],["State revenue agencies","Sales tax and local payroll changes",status("Watch"),"Map merchant location to state/local rules and show changes by effective date."],["Workforce agencies","Worker classification and SUTA notices",status("High"),"Create classification warning before payout sync or CPA package export."],["IRS mileage rate feed","Business mileage standard rate",status("Active"),"Version rate by tax year and surface estimate inside GPS Mileage."],["Tip legislation watch","No Tax on Tips eligibility and caps",status("Beta"),"Track updates by tax year and show CPA review note when rule changes."]].map(r=>row(r,{wrap:[1,3]}))))}</div>${panel("Industry Deduction Checklist",table(["Industry","Checklist Ideas"],[["Nail salon","Supplies, booth rent, merchant fees, towels, uniforms, licenses, insurance, software, marketing, mileage."],["Beauty business","Product inventory, training, equipment, booking software, business phone, client amenities, rent."],["Contractor","Tools, mileage, phone, home office, payment fees, tax prep, education, insurance."],["Restaurant","Food inventory, delivery platform fees, kitchen supplies, uniforms, POS fees, cleaning, licenses, tips and payroll records."],["Freelancer / Gig worker","Mileage, phone, laptop, software, home office, payment processing fees, marketing, education."],["Healthcare / clinic","Medical supplies, licensing, malpractice insurance, continuing education, booking software, mileage."]].map(r=>row(r,{wrap:1}))))}`;
}

/* ─── OCR VAULT ─── */
function renderOcr(){
  const approved  = data.receipts.filter(r=>/Approved|Extracted/.test(r[5]));
  const review    = data.receipts.filter(r=>/Needs Review|Missing purpose/.test(r[5]));
  const processing= data.receipts.filter(r=>r[5]==="Processing");

  function confColor(c){
    if(c==="—") return "text-slate-500";
    const n=parseInt(c);
    return n>=90?"text-emerald-400":n>=75?"text-amber-400":"text-rose-400";
  }

  const vaultRows = [...approved,...review].map(r=>row([
    `<span class="mono">${r[0]}</span>`,r[1],r[2],r[3],r[4],
    `<span class="${confColor(r[7])} font-black text-xs">${r[7]}</span>`,
    r[8], status(r[5]), r[6],
    rowActions(actionBtn("View","view-receipt"),actionBtn("Edit","edit-receipt"),
      r[7]!=="—"&&parseInt(r[7])<90 ? actionBtn("Review OCR","ocr-review") : `<button class="${ui.btn}" data-approve-receipt="${r[0]}">Approve</button>`,
      `<button class="${ui.btn}" data-modal="delete-receipt" data-ctx-id="${r[0]}">Delete</button>`)
  ]));

  const processingRows = processing.map(r=>row([
    `<span class="mono">${r[0]}</span>`,r[1],r[2],r[3],r[4],r[10],
    `<span class="inline-flex items-center gap-1.5 text-xs text-amber-300 font-black">
      <span class="h-2 w-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>Processing
    </span>`,
    "~2 min"
  ]));

  return `
    <div class="grid-4" style="margin-bottom:14px">
      ${[
        ["Vault Records",String(approved.length),"Approved & extracted","green"],
        ["Needs Review",String(review.length),"Low confidence or missing field","yellow"],
        ["Processing",String(processing.length),"OCR running","cyan"],
        ["Sources","4","Camera · Upload · Email · Payout","red"]
      ].map(metric).join("")}
    </div>
    ${filterBar(
      ["All statuses",["Approved","Needs Review","Missing purpose","Processing"]],
      ["All categories",["Supplies","Utilities","Payment evidence","Equipment","Meals","Travel"]],
      ["All sources",["Camera","File upload","Email import","Payout upload"]],
      ["Confidence",["≥90% (high)","75–89% (medium)","<75% (low)"]]
    )}
    ${processing.length ? panel("OCR Processing Queue",table(
      ["ID","Vendor","Category","Amount","Source","Queued","Status","Est. Time"],
      processingRows.length ? processingRows : [row(["—","—","—","—","—","—","No items processing","—"])]
    ),`<button class="btn" data-toast="Processing queue refreshed.">Refresh</button>`) : ""}
    ${panel("Receipt Vault — AI OCR",
      table(["ID","Vendor","Category","Amount","Source","Confidence","Tax","Status","Owner","Actions"],vaultRows),
      `<button class="btn primary" data-modal="receipt">Capture Receipt</button> <button class="btn" data-modal="ocr-batch-approve">Approve High Confidence</button> <button class="btn" data-toast="Vault exported to CPA package.">Export to CPA</button>`
    )}
    <div class="grid-2" style="margin-top:14px">
      ${panel("OCR Extraction Fields",table(["Field","Extracted From","Confidence Target","Required"],[
        row(["Vendor / Payee","Merchant name, top of receipt","≥ 85%","Yes"]),
        row(["Total amount","Bottom total line, bold/large","≥ 90%","Yes"]),
        row(["Tax amount","Tax line, labeled 'Tax' or 'GST'","≥ 80%","Recommended"]),
        row(["Date","Header date, ISO or US format","≥ 88%","Yes"]),
        row(["Receipt number","'Receipt #' or 'Invoice #' line","≥ 75%","Recommended"]),
        row(["Category","Vendor name → category lookup","≥ 80%","Auto-assigned"])
      ]))}
      ${panel("Capture Sources",`<div class="panel-body list">
        ${listItem("Camera (in-app)","Point at receipt — AI crops, deskews, and enhances before OCR. Best for paper bills.","green")}
        ${listItem("File upload","PDF, PNG, JPG up to 10 MB. Supports multi-page invoices. Drag-and-drop supported.","blue")}
        ${listItem("Email import","Forward bills to your TaxIQ inbox address. Automatic attachment extraction.","cyan")}
        ${listItem("Payout upload","Attach screenshot directly from Staff Payouts when creating a payout record.","yellow")}
      </div>`,`<button class="btn primary" data-modal="receipt">Capture Receipt</button>`)}
    </div>`;
}

/* ─── SHARE LINKS ─── */
function renderShareLinks(){
  const linkRows = data.shareLinks.map(s=>row([`<span class="mono">${s[0]}</span>`,s[1],s[2],s[3],status(s[4]),rowActions(actionBtn("View","share-link-detail"),`<button class="${ui.btn}" data-copy="taxiq.link/${s[0]}">Copy Link</button>`,actionBtn("QR","share-link-qr"),s[4]==="Draft" ? `<button class="${ui.btn} primary" data-publish-share="${s[0]}">Publish</button>` : `<button class="${ui.btn}" data-modal="revoke-share-link" data-ctx-id="${s[0]}">Revoke</button>`)]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Active Links","2","Upload/review access","green"],["Default Expiry","15d","Can be never expire","cyan"],["QR Support","Yes","Same permission model","yellow"],["Audit Log","On","Every open/upload","red"]].map(metric).join("")}</div>${panel("Payout / Profile Share Links",table(["Link ID","Recipient","Access","Expires","Status","Actions"],linkRows),`<button class="btn primary" data-modal="share-link">Create Link</button>`)}${panel("Share Link Rules",`<div class="panel-body list">${listItem("Upload-only","Recipient can upload receipts, W-9, payout evidence, or missing profile fields.","blue")}${listItem("Review-only","CPA or reviewer can inspect selected ledger and evidence records.","green")}${listItem("Expiration","Default is 15 days. Public profile links may never expire.","yellow")}</div>`)}`;
}

/* ─── GPS MILEAGE ─── */
function renderGps(){
  const tripRows = data.trips.map(t=>row([`<span class="mono">${t[0]}</span>`,...t.slice(1,4),status(t[4]),rowActions(actionBtn("View","view-trip"),actionBtn("Edit","edit-trip"),actionBtn("Mark Reviewed",""),actionBtn("Delete","delete-trip"))]));
  const totalMiles = data.trips.reduce((sum,t)=>sum + (parseFloat(t[2]) || 0), 0).toFixed(1);
  const candidateCount = data.trips.filter(t=>/candidate/i.test(t[4])).length;
  const policyCount = data.trips.filter(t=>/check|review/i.test(t[4])).length;
  const activePanel = activeGpsTrip ? panel("Active Trip Tracking",`<div class="panel-body list">${listItem("Tracking in progress",`${activeGpsTrip.startLabel} → destination pending. ${activeGpsTrip.points.length} GPS point(s) captured so far.`,"green")}${listItem("Stop to save A → B route","Open Start Trip and press Stop Trip when you arrive at the destination.","blue")}</div>`,`<button class="btn primary" data-modal="trip">Stop Trip</button>`) : "";
  const deductionEstimate = moneyText(Number(totalMiles) * 0.725);
  return `<div class="grid-4" style="margin-bottom:14px">${[[ "Trips",String(data.trips.length),"Tracked or pending review","green"],["Total Miles",totalMiles,"Current demo records","cyan"],["2026 IRS Rate","$0.725/mi","Business mileage estimate","yellow"],["Est. Deduction",deductionEstimate,"Before CPA review","red"]].map(metric).join("")}</div>${activePanel}<div class="grid-2" style="margin-bottom:14px">${panel("Route Preview",`<div class="panel-body">${miniMap()}<div class="sub">Map placeholder for point A → point B route preview. Production can render Google Maps, Mapbox, or Apple Maps based on merchant location consent.</div></div>`)}${panel("Mileage Policy Notes",`<div class="panel-body list">${listItem("Business purpose required","Every trip must explain why it was business related before export.","green")}${listItem("Commute-like routes need CPA review","Home to regular workplace may need special review and cannot be auto-approved.","yellow")}${listItem("Rate versioning","Rate should be stored by tax year and updated from official source monitor.","blue")}</div>`)}</div>${panel("GPS Mileage Tracker",table(["Trip ID","Route","Miles","Purpose","Status","Actions"],tripRows),`<button class="btn primary" data-modal="trip">${activeGpsTrip ? "Stop Active Trip" : "Start Trip"}</button>`)}${panel("Mileage Data To Collect",table(["Field","Why It Matters","Required"],[["GPS start/end","Supports route evidence.","When mileage is claimed"],["Point A → Point B route","Saves the route when user presses Stop at destination.","Yes"],["Business purpose","Explains deduction relevance.","Yes"],["Vehicle profile","Supports owner/worker mileage records.","Recommended"]].map(row)))}`;
}

/* ─── CPA REVIEW ─── */
function renderCpa(){
  const cpaRows = data.cpa.map(c=>row([c[0],c[1],status(c[2]),c[3],rowActions(actionBtn("Portal","cpa-portal"),actionBtn("Upload","cpa-upload"),actionBtn("Revoke",""))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["CPA Connections","3","Third-party firms","green"],["Est. Review Cost","$647.50","Example CPA package","cyan"],["Missing Evidence","4","Open CPA requests","yellow"],["Merchant Approval","Required","Before filing/export","red"]].map(metric).join("")}</div>${panel("Third-party CPA / Accountant Connections",table(["Firm","Scope","Status","Next Step","Actions"],cpaRows),`<button class="btn primary" data-modal="cpa">Connect CPA Firm</button>`)}<div class="grid-2" style="margin-top:14px">${panel("Cost Preview Before Connecting",table(["Provider","Type","Rate","Est. Hours","Est. Total","Retainer","Best For"],data.cpaRates.map(r=>row(r,{wrap:6}))))}${panel("Tax Filing Review Workflow",table(["Step","Owner","Output","Status"],[["1. Connect CPA / bookkeeper","Merchant","Secure portal invite + access scope",status("Invited")],["2. Share merchant package","Tax IQ","Ledger, receipts, payouts, mileage, payroll reports",status("Ready")],["3. CPA reviews records","CPA / accountant","Comments, missing-file requests, risk notes",status("Review")],["4. Prepare filing package","CPA / accountant","Draft tax filing support package",status("Requested")],["5. Merchant approval","Merchant","Approve export/share before final filing",status("Required")]].map(r=>row(r,{wrap:[0,2]}))))}</div><div class="grid-2" style="margin-top:14px">${panel("CPA Work Queue",`<div class="panel-body list">${listItem("Request missing receipt","rcpt_003 needs business purpose and clear vendor.","yellow")}${listItem("Review worker classification","Payout says wage but worker is 1099 contractor.","red")}${listItem("Prepare merchant filing package","Export payout, receipt, mileage, payroll, and Tax IQ ledger records for accountant review.","green")}${listItem("Merchant filing approval","CPA can prepare package, but merchant must approve final export/share action.","blue")}</div>`)}${panel("Pricing Rules",`<div class="panel-body list">${listItem("Preview before invite","Merchant sees hourly rate, estimated hours, retainer, and estimated total before connecting accountant.","green")}${listItem("Approval before billing","No CPA work starts until merchant approves the estimate or accepts a custom quote.","yellow")}${listItem("Actual bill may change","Final cost depends on missing records, filing complexity, and CPA scope changes.","blue")}</div>`)}</div>`;
}

/* ─── TIP LEDGER ─── */
function renderTipLedger(){
  const tipRows = data.tips.map(t=>row([`<span class="mono">${t[0]}</span>`,t[1],t[2],t[3],t[4],t[5],status(t[6]),t[7],t[8],rowActions(actionBtn("Detail","tip-detail"),actionBtn("Edit","edit-tip"),actionBtn("Delete","delete-tip"))]));
  return `<div class="notice" style="margin-bottom:14px">Tax IQ is a record keeping and reporting tool, not legal or tax advice. Eligibility, final deduction amount, and tax forms must be confirmed by a licensed tax professional.</div><div class="grid-4" style="margin-bottom:14px">${[["Today's Tips","$75.00","Cash + Zelle — Jun 24","green"],["Month-to-Date","$215.00","Jun 2026 tracked","cyan"],["Year-to-Date","$1,850.00","Tax year 2026","yellow"],["$25K Cap Used","7.4%","$1,850 of $25,000","red"]].map(metric).join("")}</div>${filterBar(["All methods",["Cash","Zelle","Venmo","Cash App","Card/POS","QR","Other"]],["All sources",["CASH","DIRECT","POS_OWNER_PAID"]],["All statuses",["LIKELY_QUALIFIED","NEEDS_REVIEW","NOT_QUALIFIED"]])}${panel("Tip Ledger — Tax Year 2026",table(["ID","Date","Method","Amount","Service","Source","Qualified Status","Entered","Proof","Actions"],tipRows),`<button class="btn primary" data-modal="add-tip">Add Tip</button> <button class="btn" data-modal="report">Export CPA Package</button>`)}<div class="grid-2" style="margin-top:14px">${panel("YTD by Method",table(["Method","Total","Tips","Avg","Status"],[row(["Cash","$625.00","8","$78.13",status("LIKELY_QUALIFIED")]),row(["Zelle","$480.00","6","$80.00",status("LIKELY_QUALIFIED")]),row(["Card/POS","$415.00","5","$83.00",status("LIKELY_QUALIFIED")]),row(["Venmo","$210.00","4","$52.50",status("NEEDS_REVIEW")]),row(["Cash App","$120.00","2","$60.00",status("LIKELY_QUALIFIED")])]))}${panel("Qualified Status Breakdown",`<div class="panel-body list">${listItem("Likely Qualified — $1,640 (88.6%)","Voluntary, tipped occupation, proof attached or payment method confirmed.","green")}${listItem("Needs Review — $210 (11.4%)","Venmo entries missing occupation confirmation. Ask CPA before claiming deduction.","yellow")}${listItem("Cap Progress","$1,850 of $25,000 federal limit used. MAGI phase-out may apply above $150K single / $300K joint.","blue")}</div>`,`<button class="btn" data-modal="report">View Yearly Report</button>`)}</div>`;
}

/* ─── TAX ESTIMATE ─── */
function renderTaxEstimate(){
  const d = data.taxEstimate;
  const qRows = d.quarters.map(q=>row([q[0],q[1],q[2],q[3],q[4],status(q[5]),q[6]]));
  const jRows = d.byJurisdiction.map(j=>row([j[0],j[1],j[2],j[3],j[4],j[5],status(j[6])],{wrap:1}));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Est. Annual Tax","$840,000","Federal + state combined","red"],["YTD Withheld","$193,300","Through Jun 2026","green"],["Estimated Balance","$646,700","Subject to withholding changes","yellow"],["Next Deposit","Jun 24, 2026","Federal semiweekly","cyan"]].map(metric).join("")}</div><div class="notice" style="margin-bottom:14px">Estimates are based on current payroll data and may change. Final tax liability must be confirmed by a licensed tax professional or CPA.</div><div class="grid-2">${panel("Quarterly Estimate",table(["Quarter","Gross","Withheld","Est. Tax","Amount Due","Status","Due Date"],qRows))}${panel("By Jurisdiction",table(["ID","Name","Est. Tax","Deposited","Balance","Schedule","Risk"],jRows))}</div><div class="grid-2" style="margin-top:14px">${panel("Deposit Schedule Alerts",`<div class="panel-body list">${listItem("Federal semiweekly — Jun 24, 2026","$54,621 employee tax due. Ensure account funded by deposit date.","red")}${listItem("Texas SUTA — Jul 31, 2026","Quarterly SUTA payment. Verify wage base and rate.","yellow")}${listItem("California semiweekly — Jun 24, 2026","$10,122 CA withholding due.","yellow")}${listItem("New York monthly — Jul 15, 2026","$4,603 NY withholding due.","blue")}</div>`,`<button class="btn" data-modal="report">Export Deposit Schedule</button>`)}${panel("Actions",`<div class="panel-body list">${listItem("Connect CPA for final estimate","CPA can review estimate assumptions and adjust for deductions, credits, and filing status.","green")}${listItem("Update withholding","If estimate is significantly off, update W-4 instructions or employer withholding.","yellow")}</div>`,`<button class="btn primary" data-modal="cpa">Connect CPA</button>`)}</div>`;
}

/* ─── WEBHOOKS ─── */
function renderWebhooks(){
  const wRows = data.webhooks.map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],e[2],`<span class="mono">${e[3]}</span>`,e[4],status(e[5]),e[6],e[7],e[8],rowActions(actionBtn("Payload","webhook-payload"),actionBtn("Retry","webhook-retry"))],{wrap:[3,8]}));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Delivered","1,284","99.7% success rate","green"],["Pending","7","In delivery queue","cyan"],["Retrying","3","Next retry in 5 min","yellow"],["Dead Letter","1","Manual review required","red"]].map(metric).join("")}</div>${filterBar(["All statuses",["Delivered","Retrying","Dead Letter","Pending"]],["All event types",["tax_iq.ledger.posted","tax_iq.validation.warning","tax_iq.validation.failed","employee.tax_profile.validated"]])}${panel("Recent Events",table(["Event ID","Type","Tenant","Endpoint URL","Attempts","Status","Created","Delivered","Last Error","Actions"],wRows),`<button class="btn primary" data-modal="webhook-retry">Retry Failed</button>`)}`;
}

/* ─── AUDIT LOG ─── */
function renderAuditLog(){
  const logRows = data.auditLog.map(l=>row([l[0],l[1],`<span class="mono text-indigo-300">${l[2]}</span>`,l[3],`<span class="mono">${l[4]}</span>`,l[5]]));
  const dateRange = `<div class="filter-strip"><label class="form-field compact"><span>From</span><input class="form-control" type="date" value="2026-06-18"></label><label class="form-field compact"><span>To</span><input class="form-control" type="date" value="2026-06-24"></label><button class="${ui.btn}" data-toast="Audit date range applied.">Apply Date Range</button></div>`;
  return `${dateRange}${filterBar(["All resource types",["payroll_run","tax_ledger","employee","payout","receipt","share_link","webhook_event","tip_entry","report","connection"]],["All actions",["CREATED","UPDATED","FINALIZED","EXPORTED","POSTED","WEBHOOK_DELIVERED","WEBHOOK_FAILED","OCR_PROCESSED","TIP_CLASSIFIED"]],["All actors",["payroll_admin_44","finance_user","hr_user","owner_user","system"]])}<div style="display:flex;justify-content:flex-end;margin-bottom:10px">${actionBtn("Export Log","")}</div>${panel("Audit Log — Immutable Action Record",table(["Timestamp","Actor","Action","Resource Type","Resource ID","Detail"],logRows))}${panel("Audit Policy",`<div class="panel-body list">${listItem("Immutable records","Every create, update, delete, and export is logged. Records cannot be modified.","green")}${listItem("7-year retention","Audit logs are retained for 7 years per tax compliance requirements.","blue")}${listItem("Full PII export requires approval","Actor must be authorized merchant admin. Logged immediately.","yellow")}${listItem("Soft deletes only","No data is hard-deleted. Deletion events are logged with actor and reason.","red")}</div>`)}`;
}

/* ─── SETTINGS ─── */
function renderBilling(){
  const planRows = data.plans.map(p=>row([p[0],p[1],p[2],p[3],p[4],rowActions(actionBtn("Select","billing-plan"),actionBtn("Compare","billing-plan"))],{wrap:[3,4]}));
  const invoiceRows = data.invoices.map(i=>row([`<span class="mono">${i[0]}</span>`,i[1],i[2],i[3],status(i[4]),i[5],rowActions(i[4]==="Pending approval" ? actionBtn("Approve","billing-approval") : actionBtn("View","billing-approval"),actionBtn("Download",""))],{wrap:2}));
  return `<div class="grid-4" style="margin-bottom:14px">${[
    ["Current Plan","Growth","Merchant subscription","green"],
    ["MRR","$249","Per merchant location group","cyan"],
    ["CPA Add-on","Approval required","No work starts before approval","yellow"],
    ["API Partner","Future","Separate contract path","red"]
  ].map(metric).join("")}</div><div class="grid-2" style="margin-bottom:14px">${panel("Business Model Decision",`<div class="panel-body list">${listItem("Primary model: merchant subscription","Merchant pays Tax IQ monthly for records, OCR, GPS, Tip Ledger, Tax Estimate, CPA package, and compliance workflow.","green")}${listItem("Secondary model: CPA marketplace referral","CPA/bookkeeper cost is shown as a separate estimate. Merchant must approve before work starts.","yellow")}${listItem("Partner model: API licensing","Payroll/accounting partners can buy embedded Tax IQ APIs later. This needs separate architecture and contract.","blue")}</div>`)}${panel("ICP Packaging",`<div class="panel-body list">${listItem("Best initial ICP","Vietnamese-owned nail salons and beauty businesses in the U.S. with staff payouts, tips, receipts, GPS, and CPA needs.","green")}${listItem("Owner UX","Simple dashboard, upload/share, CPA approval, billing, and guided next steps.","blue")}${listItem("Admin/CPA UX","Deeper ledger, payroll run, tax estimate, evidence, audit, and filing package workflows.","yellow")}</div>`)}</div>${panel("Plans",table(["Plan","Price","Limit","Included Features","Best For","Actions"],planRows),`<button class="btn primary" data-modal="billing-plan">Upgrade Plan</button>`)}<div class="grid-2" style="margin-top:14px">${panel("Invoices & Approvals",table(["Invoice","Period","Item","Amount","Status","Date","Actions"],invoiceRows))}${panel("Loading State Pattern",`<div class="panel-body">${skeletonPreview()}<div class="sub">Use this skeleton pattern when replacing mock data with API calls, especially tables, KPI cards, OCR queue, and billing invoices.</div></div>`)}</div>${panel("Production Billing Rules",`<div class="panel-body list">${listItem("Who can view billing","Merchant owner and tenant admin. CPA can only see CPA engagement cost, not merchant subscription billing.","green")}${listItem("Upgrade / downgrade","Show feature delta, prorated charge, renewal date, and Terms acceptance before plan change.","yellow")}${listItem("Invoice delivery","In-app invoice center plus email copy to billing contact. Every billing event goes to Audit Log.","blue")}${listItem("Compliance disclaimer","Billing approval is separate from tax/legal advice. CPA marketplace work requires explicit merchant approval.","red")}</div>`)}`;
}

function renderSettings(){
  const keyRows = data.apiKeys.map(k=>row([`<span class="mono">${k[0]}</span>`,k[1],`<span class="mono">${k[2]}</span>`,k[3],k[4],status(k[5]),k[6],rowActions(`<button class="${ui.btn}" data-rotate-key="${k[0]}">Rotate</button>`,`<button class="${ui.btn}" data-revoke-key="${k[0]}">Revoke</button>`)]));
  return `<div class="grid-2">${panel("US Payroll Scope",`<div class="panel-body"><div class="row"><span>Country</span><span>United States</span></div><div class="row"><span>Tax levels</span><span>Federal, State, Local</span></div><div class="row"><span>Employee forms</span><span>W-4, W-2</span></div><div class="row"><span>Employer returns</span><span>941, 940, SUTA</span></div></div>`)}${panel("Role & Access",table(["Permission","Payroll Admin","CPA","Auditor","Action"],[["Export data",status("Active"),status("Active"),status("Active"),actionBtn("Edit","")],["Finalize run",status("Active"),status("Missing"),status("Missing"),actionBtn("Edit","")],["Review package",status("Active"),status("Active"),status("Active"),actionBtn("Edit","")],["Manage settings",status("Active"),status("Missing"),status("Missing"),actionBtn("Edit","")]].map(row)))}${panel("Data Protection",`<div class="panel-body"><div class="row"><span>SSN/TIN storage</span><span>Tokenized</span></div><div class="row"><span>PII export approval</span><span>Required</span></div><div class="row"><span>Webhook signing</span><span>HMAC SHA-256</span></div><div class="row"><span>Audit retention</span><span>7 years</span></div></div>`,`${actionBtn("Configure","")}`)}${panel("Guided Help",`<div class="panel-body list">${listItem("First-time tour","Explain payroll, payout, Tax IQ, OCR, share links, GPS, CPA review.","blue")}${listItem("What next","Show recommended next action when a workflow is blocked.","green")}</div>`,`<button class="btn primary" data-toast="Tour started. Follow the guided steps.">Start Tour</button>`)}</div><div class="grid-2" style="margin-top:14px">${panel("API Keys",table(["Key ID","Name","Env","Scopes","Created","Status","Owner","Actions"],keyRows),`<button class="btn primary" data-modal="create-api-key">Create Key</button>`)}${panel("Notification Preferences",`<div class="panel-body">${[["Deposit due reminders","3-day and same-day alerts for scheduled tax deposits.",true],["Exception open alerts","Immediate alert when blocking exception is created.",true],["CPA request notifications","When CPA flags a missing record or requests files.",true],["Webhook dead letter alerts","When webhook delivery fails after max retries.",true],["Tip cap warnings","When worker approaches the $25,000 annual tip cap.",false]].map(([l,t,c])=>modalCheck(l,t,c)).join("")}</div>`,`<button class="btn primary" data-action-toast="Notification preferences saved.">Save Preferences</button>`)}</div>`;
}

/* ─── NOTIFICATIONS ─── */
function renderNotifications(){
  const unread = data.notifications.filter(n=>!n.read).length;
  const sev = {High:"red",Medium:"yellow",Low:"blue"};
  const nRows = data.notifications.map(n=>row([
    n.at,
    `<span class="flex items-center gap-2">${!n.read?`<span class="h-2 w-2 shrink-0 rounded-full bg-indigo-400 inline-block"></span>`:"<span class='h-2 w-2 inline-block'></span>"}<span>${n.title}</span></span>`,
    n.body,status(n.severity),status(n.read ? "Read" : "Unread"),
    `<a class="${ui.btn}" href="${pageHref(n.resource)}">Open</a> ${n.read?"":`<button class="${ui.btn}" data-mark-read="${n.id}">Mark Read</button>`}`
  ],{wrap:2,className:n.read ? "read-row" : "unread-row"}));
  return `<div class="grid-4" style="margin-bottom:14px">${[
    ["Unread",String(unread),"Require attention","red"],
    ["Deposit Alerts","1","Jun 24 due today","yellow"],
    ["CPA Requests","1","Missing receipt flagged","cyan"],
    ["System Events","2","Webhook + exception","green"]
  ].map(metric).join("")}</div><div style="display:flex;justify-content:flex-end;margin-bottom:10px"><button class="${ui.btn}" data-mark-all-read>Mark All Read</button></div>${filterBar(["Read status",["Unread","Read"]],["All severities",["High","Medium","Low"]],["All types",["DEPOSIT_ALERT","EXCEPTION_OPEN","CPA_REQUEST","TIN_PENDING","WEBHOOK_DEAD_LETTER","TIP_CAP"]])}${panel("Notification Center",table(["Time","Title","Detail","Severity","Read Status","Actions"],nRows))}`;
}

/* ─── UI HELPERS ─── */
function modalField(label, value, type="text"){
  const input = type === "textarea"
    ? `<textarea class="form-control min-h-24">${value}</textarea>`
    : `<input class="form-control" value="${value}">`;
  return `<label class="form-field"><span>${label}</span>${input}</label>`;
}
function modalSelect(label, options){
  return `<label class="form-field"><span>${label}</span><select class="form-control">${options.map(([text,selected])=>`<option ${selected ? "selected" : ""}>${text}</option>`).join("")}</select></label>`;
}
function modalCheck(label, text, checked=true){
  return `<label class="check-row"><input type="checkbox" ${checked ? "checked" : ""}><span><strong>${label}</strong><small>${text}</small></span></label>`;
}
function modalSection(title, content){
  return `<section class="modal-section"><h4>${title}</h4>${content}</section>`;
}
function modalGrid(fields){
  return `<div class="modal-grid">${fields.join("")}</div>`;
}

/* ─── MODAL CONTENT ─── */
const modalCopy = {
  /* PAYROLL WORKFLOW */
  "create-run":{
    title:"Create Payroll Run",
    body:"Open a new pay period, import line items, and run validation before approval.",
    cta:"Create Draft",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs = modal.querySelectorAll("input.form-control");
        const employer = inputs[0]?.value || "New Employer";
        const start    = inputs[1]?.value || "2026-07-01";
        const end      = inputs[2]?.value || "2026-07-14";
        const payDate  = inputs[3]?.value || "2026-07-18";
        const runId    = "pr_"+start.replace(/-/g,"").slice(2);
        data.runs.unshift([runId,start+" to "+end,payDate,payDate,"0","$0","$0","—","Pending"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Draft run created: "+runId);
      });
    },
    content:()=>[
      modalSection("Run Setup", modalGrid([
        modalField("Employer","Acme Manufacturing LLC"),
        modalSelect("Pay Schedule",[["Biweekly",true],["Weekly"],["Semi-monthly"],["Monthly"]]),
        modalField("Period Start","2026-06-15"),
        modalField("Period End","2026-06-28"),
        modalField("Pay Date","2026-07-03"),
        modalField("Deposit Due","2026-07-08")
      ])),
      modalSection("Import Sources", [
        modalCheck("Payroll source", "Import gross pay, hours, bonuses, and deductions from connected payroll file."),
        modalCheck("Tax profiles", "Require TIN/W-4 status before strict finalization."),
        modalCheck("Payout evidence", "Attach payout records for technician or contractor review.", false)
      ].join("")),
      modalSection("Pre-flight Checklist", table(["Check","Owner","Result"],[
        row(["Employer registration","Tax IQ",status("Active")]),
        row(["Employee profiles","HR",status("Review")]),
        row(["Jurisdiction setup","Tax",status("Ready")])
      ]))
    ].join("")
  },
  finalize:{
    title:"Finalize Payroll Run",
    body:"Strict mode checks blocking exceptions, TIN/W-4 status, jurisdiction setup, and ledger reconciliation.",
    cta:"Finalize",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const note = modal.querySelector("textarea")?.value || "";
        if(!note.trim()){ toast("Required: enter an approval note before finalizing."); return; }
        const run = data.runs.find(r=>r[0]==="pr_2026_06_15");
        if(run) run[8]="Ledger Posted";
        data.auditLog.unshift(["2026-06-24 "+new Date().toTimeString().slice(0,5),"payroll_admin_44","FINALIZED","payroll_run","pr_2026_06_15",note.slice(0,80)]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Payroll run finalized and posted to ledger.");
      });
    },
    content:()=>[
      modalSection("Finalization Gate", `<div class="list">${listItem("Ledger reconciliation","Employee and employer tax totals match generated ledger entries.","green")}${listItem("TIN/W-4 warning","1 worker has pending TIN verification. Admin override requires note.","yellow")}${listItem("Deposit schedule","Federal semiweekly deposit date is Jun 24, 2026.","green")}</div>`),
      modalSection("Approval Note", modalField("Required note","Approved with one documented TIN warning. CPA package will flag this item.","textarea")),
      modalSection("Posting Preview", table(["Record","Amount","Destination"],[
        row(["Gross wages","$312,448","Payroll ledger"]),
        row(["Employee tax","$54,621","Tax ledger"]),
        row(["Employer tax","$26,402","Tax ledger"])
      ]))
    ].join("")
  },
  "line-items":{
    title:"Line Items",
    body:"Review employee gross pay, taxable wages, employee tax, employer tax, and net pay.",
    cta:"Export CSV",
    content:()=>[
      modalSection("Run Totals", modalGrid([
        modalField("Run ID","pr_2026_06_15"),
        modalField("Employees","142"),
        modalField("Gross Pay","$312,448"),
        modalField("Employee Tax","$54,621")
      ])),
      modalSection("Employee Line Items", table(["Employee","Dept","Gross","Taxable","Pre-tax","Employee Tax","Employer Tax","Net","Status"],data.lineItems.map(i=>row(i.map((v,idx)=>idx===8?status(v):v))))),
      modalSection("Review Controls", `<div class="list">${modalCheck("Lock reviewed lines","Prevent accidental recalculation after approval.")}${modalCheck("Export with audit hashes","Include row hash and run hash in CSV export.")}</div>`)
    ].join("")
  },

  /* EMPLOYER MODALS */
  employer:{
    title:"Add Employer",
    body:"Create business profile, locations, registrations, deposit schedule, and integration setup.",
    cta:"Save Employer",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs = modal.querySelectorAll("input.form-control");
        const name = (inputs[0]?.value||"").trim() || "New Employer";
        const ein  = (inputs[1]?.value||"").trim() || "00-0000000";
        const id   = "biz_"+Math.floor(Math.random()*9000+1000);
        data.employers.push([name,id,inputs[2]?.value||"Service","0","FED","Monthly","—","—","Active"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Employer saved: "+name+" ("+id+")");
      });
    },
    content:()=>[
      modalSection("Business Profile", modalGrid([
        modalField("Legal business name","Acme Manufacturing LLC"),
        modalField("EIN","12-3456789"),
        modalField("Industry","Beauty / Salon Services"),
        modalField("Primary state","TX")
      ])),
      modalSection("Payroll Tax Setup", table(["Jurisdiction","Registration","Deposit Schedule"],[
        row(["Federal",status("Active"),"Semiweekly"]),
        row(["Texas",status("Active"),"Quarterly"]),
        row(["California",status("Review"),"Semiweekly"])
      ])),
      modalSection("Controls", `<div class="list">${modalCheck("Enable strict finalization","Block payroll runs when required registration or tax profile is missing.")}${modalCheck("Create audit workspace","Store owner approvals, deposits, and generated reports.")}</div>`)
    ].join("")
  },
  "edit-employer":{
    title:"Edit Employer",
    body:"Update business profile, registrations, deposit schedule, and integration settings.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Business Profile", modalGrid([
        modalField("Legal business name","Acme Manufacturing LLC"),
        modalField("EIN","12-3456789"),
        modalField("Industry","Manufacturing"),
        modalField("Primary state","TX"),
        modalField("Contact email","admin@acme.example"),
        modalSelect("Status",[["Active",true],["Inactive"],["Suspended"]])
      ])),
      modalSection("Deposit Settings", modalGrid([
        modalSelect("Federal schedule",[["Semiweekly",true],["Monthly"],["Quarterly"]]),
        modalField("Federal account","FED-ACH-789 (masked)"),
        modalSelect("State TX schedule",[["Quarterly",true],["Monthly"]]),
        modalField("Next deposit due","Jun 24, 2026")
      ])),
      modalSection("Strict Mode", `<div class="list">${modalCheck("Require TIN verification","Block finalization if TIN is unverified.")}${modalCheck("Require W-4 current year","Warn if employee W-4 is prior year.")}</div>`)
    ].join("")
  },
  "employer-detail":{
    title:"Employer Detail",
    body:"View employer profile, locations, registrations, contacts, payroll history, and recent audit events.",
    cta:"Close",
    content:()=>[
      modalSection("Business Profile", table(["Field","Value"],[
        row(["Legal name","Acme Manufacturing LLC"]),
        row(["Employer ID","biz_789"]),
        row(["EIN","**-***6789"]),
        row(["Industry","Manufacturing"]),
        row(["Primary address","1200 Commerce Park Dr, Austin, TX"]),
        row(["Contact person","Patricia Adams — payroll_admin@acme.example"])
      ])),
      modalSection("Registration Footprint", table(["Jurisdiction","Registration","Deposit Schedule","Next Due","Owner"],[
        row(["US-FED",status("Active"),"Semiweekly","Jun 24, 2026","Payroll"]),
        row(["US-TX",status("Active"),"Quarterly","Jul 31, 2026","Tax"]),
        row(["US-CA",status("Review"),"Semiweekly","Jun 24, 2026","CPA"]),
        row(["US-NY",status("Missing setup"),"Monthly","Jul 15, 2026","Tax"])
      ])),
      modalSection("Recent Payroll Runs", table(["Run","Period","Gross","Tax","Status"],data.runs.slice(0,4).map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[5],r[6],status(r[8])])))),
      modalSection("Recent Activity", `<div class="list">${listItem("Payroll run finalized","pr_2026_06_15 was finalized and posted to ledger.","green")}${listItem("CA registration review","CPA requested confirmation for CA work location.","yellow")}${listItem("Connection healthy","Nexora Touch Payroll synced 2 min ago.","blue")}</div>`)
    ].join("")
  },
  "employer-registrations":{
    title:"Employer Registrations",
    body:"Manage state and federal payroll tax registrations for this employer.",
    cta:"Save Registrations",
    content:()=>[
      modalSection("Current Registrations", table(["Jurisdiction","Account Number","Registration","Deposit Schedule","Next Due","Action"],[
        row(["US-FED","XX-XXXXXXX (masked)",status("Active"),"Semiweekly","Jun 24, 2026",actionBtn("Edit","")]),
        row(["US-TX","TX-XXXX (masked)",status("Active"),"Quarterly","Jul 31, 2026",actionBtn("Edit","")]),
        row(["US-CA","CA-XXXX (masked)",status("Review"),"Semiweekly","Jun 24, 2026",actionBtn("Edit","")]),
        row(["US-NY","—",status("Missing setup"),"—","—",actionBtn("Add","edit-jurisdiction")])
      ])),
      modalSection("Add Registration", modalGrid([
        modalSelect("Jurisdiction",[["Select state",true],["US-NY"],["US-FL"],["US-WA"],["US-IL"]]),
        modalField("State account number",""),
        modalSelect("Deposit schedule",[["Monthly",true],["Quarterly"],["Semiweekly"]]),
        modalField("Registration date","")
      ]))
    ].join("")
  },

  /* EMPLOYEE MODALS */
  employee:{
    title:"Invite Employee",
    body:"Send an employee self-service link for tax profile and W-4 collection.",
    cta:"Send Invite",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs = modal.querySelectorAll("input.form-control");
        const name  = (inputs[0]?.value||"").trim() || "New Employee";
        const email = (inputs[1]?.value||"").trim() || "—";
        const empId = "emp_"+Math.floor(Math.random()*9000+1000);
        data.employees.push([name,empId,"—","TX","TX","Pending","Missing","Unknown","Today","0"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Invite sent to "+name+" ("+email+")");
      });
    },
    content:()=>[
      modalSection("Employee Invite", modalGrid([
        modalField("Legal name","Jane A. Nguyen"),
        modalField("Email","jane.nguyen@example.com"),
        modalField("Department","Finance"),
        modalSelect("Worker type",[["W-2 Employee",true],["1099 Contractor"],["Unknown - needs review"]])
      ])),
      modalSection("Required Collection", `<div class="list">${modalCheck("W-4 profile","Filing status, dependents, extra withholding.")}${modalCheck("TIN verification","Collect masked SSN token and verification consent.")}${modalCheck("State tax profile","Residence/work state mapping for payroll tax.")}</div>`),
      modalSection("Link Settings", modalGrid([
        modalSelect("Expiration",[["15 days",true],["7 days"],["30 days"],["Never"]]),
        modalSelect("Reminder cadence",[["Every 3 days",true],["Once only"],["Every 7 days"]])
      ]))
    ].join("")
  },
  "edit-employee":{
    title:"Edit Employee Profile",
    body:"Update employee details, department, worker type, and tax profile settings.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Employee Details", modalGrid([
        modalField("Legal name","Jane A. Nguyen"),
        modalField("Email","jane.nguyen@example.com"),
        modalField("Employee ID","emp_1002"),
        modalField("Department","Finance"),
        modalSelect("Worker type",[["W-2 Employee",true],["1099 Contractor"],["Unknown"]]),
        modalSelect("Status",[["Active",true],["On leave"],["Terminated"]])
      ])),
      modalSection("Tax Jurisdiction", modalGrid([
        modalSelect("Residence state",[["Texas (TX)",true],["California (CA)"],["New York (NY)"],["Florida (FL)"]]),
        modalSelect("Work state",[["Texas (TX)",true],["California (CA)"],["New York (NY)"],["Florida (FL)"]]),
        modalField("Start date","2024-01-15"),
        modalField("Last W-4 update","Jun 10, 2026")
      ])),
      modalSection("Notifications", `<div class="list">${modalCheck("Send W-4 reminder if older than 1 year","Auto-reminder to employee and HR.")}${modalCheck("Alert on state mismatch","Notify if residence and work state diverge mid-year.")}</div>`)
    ].join("")
  },
  "edit-tax-status":{
    title:"Edit Employee Tax Status",
    body:"Update filing status, W-4 withholding, state adjustments, and tax profile overrides.",
    cta:"Update Tax Status",
    content:()=>[
      modalSection("W-4 Information", modalGrid([
        modalSelect("W-4 tax year",[["2026",true],["2025"],["2024"]]),
        modalSelect("Filing status",[["Single",true],["Married filing jointly"],["Married filing separately"],["Head of household"],["Qualifying surviving spouse"]]),
        modalField("Dependents claimed","2"),
        modalField("Extra withholding / pay period","$0.00")
      ])),
      modalSection("State Withholding", modalGrid([
        modalSelect("Residence state",[["Texas — no state income tax",true],["California"],["New York"],["Florida"]]),
        modalField("State extra withholding","$0.00"),
        modalSelect("Work state",[["Texas (TX)",true],["California (CA)"],["New York (NY)"]])
      ])),
      modalSection("Blocking Status", table(["Check","Result","Action"],[
        row(["TIN verification",status("Pending"),"Resolve to unblock strict mode"]),
        row(["W-4 year",status("Ready"),"Current year on file"]),
        row(["State setup",status("Active"),"TX residence + TX work"])
      ])),
      modalSection("Override Note", modalField("Reason for manual update","Updating W-4 per employee request after life event change.","textarea"))
    ].join("")
  },

  /* CONNECTION MODALS */
  connection:{
    title:"Add Connection",
    body:"Connect payroll, HRIS, payout, or accounting system using signed webhooks and scoped API access.",
    cta:"Connect",
    content:()=>[
      modalSection("Connector", modalGrid([
        modalSelect("System type",[["Payroll provider",true],["HRIS"],["Accounting"],["Payout wallet"],["Webhook only"]]),
        modalField("Connection name","Nexora Touch Payroll"),
        modalSelect("Auth method",[["OAuth 2.0",true],["API key"],["SFTP import"],["Webhook signing only"]]),
        modalField("Environment","Production")
      ])),
      modalSection("Scopes", `<div class="list">${modalCheck("Read payroll runs","Import gross pay, deductions, and taxes.")}${modalCheck("Read employee profiles","Import worker classification and tax profile status.")}${modalCheck("Write webhook events","Notify external systems when Tax IQ ledger posts.")}</div>`),
      modalSection("Security", modalGrid([
        modalField("Webhook signature","HMAC SHA-256"),
        modalField("Retry policy","5 attempts with backoff")
      ]))
    ].join("")
  },
  "edit-connection":{
    title:"Edit Connection",
    body:"Update connection name, auth method, scopes, and webhook configuration.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Connection Settings", modalGrid([
        modalField("Connection name","Nexora Touch Payroll"),
        modalSelect("Auth method",[["OAuth 2.0",true],["API key"],["SFTP import"],["Webhook signing only"]]),
        modalField("Webhook URL","https://api.nexora.example/webhooks/taxiq (masked)"),
        modalSelect("Environment",[["Production",true],["Staging"],["Sandbox"]])
      ])),
      modalSection("Scopes", `<div class="list">${modalCheck("Read payroll runs","Import gross pay, deductions, and taxes.")}${modalCheck("Read employee profiles","Import worker classification and tax profile status.")}${modalCheck("Write webhook events","Notify external systems when Tax IQ ledger posts.")}${modalCheck("Read payout records","Import payout data for evidence matching.", false)}</div>`),
      modalSection("Security", modalGrid([
        modalField("Signing secret","••••••••••••••• (masked)"),
        modalField("Last rotated","Jun 18, 2026"),
        modalSelect("Retry policy",[["5 attempts with backoff",true],["3 attempts"],["10 attempts"]]),
        modalField("Timeout","30 seconds")
      ]))
    ].join("")
  },
  "test-connection":{
    title:"Test Connection",
    body:"Verify endpoint health, signing, and delivery before relying on this connection for payroll events.",
    cta:"Send Test Ping",
    content:()=>[
      modalSection("Connection Health", table(["Check","Result","Detail"],[
        row(["Endpoint reachable",status("Active"),"200 OK in 142ms"]),
        row(["HMAC signature valid",status("Active"),"Header X-TaxIQ-Signature matches"]),
        row(["Auth token valid",status("Active"),"OAuth token not expired"]),
        row(["Last delivery",status("Delivered"),"tax_iq.ledger.posted — 2 min ago"])
      ])),
      modalSection("Test Payload", `<div class="panel-body">${modalField("Event type to send","tax_iq.test.ping")}${modalField("Payload","{ \"event\": \"test\", \"source\": \"taxiq_health_check\" }")}</div>`),
      modalSection("Expected Response", `<div class="list">${listItem("200 OK required","Any non-2xx response triggers retry logic.","green")}${listItem("Signature check","Receiver should verify X-TaxIQ-Signature header using your shared secret.","blue")}</div>`)
    ].join("")
  },

  /* EXCEPTION MODALS */
  "resolve-exception":{
    title:"Resolve Exception",
    body:"Document the resolution, override justification, and notify the relevant owner before clearing the exception.",
    cta:"Mark Resolved",
    content:()=>[
      modalSection("Exception Detail", table(["Field","Value"],[
        row(["ID","ex_001"]),
        row(["Type","WITHHOLDING_DISCREPANCY"]),
        row(["Severity",status("High")]),
        row(["Owner","Payroll"]),
        row(["Run","pr_correction_01"]),
        row(["Description","Payroll submitted $690. Tax IQ expected $698.89."])
      ])),
      modalSection("Resolution", modalGrid([
        modalSelect("Resolution type",[["Corrected — payroll resubmitted",true],["Waived — business decision","False positive — rule error","Escalated to CPA"]]),
        modalField("Corrected value","$698.89"),
        modalField("Reference","pr_correction_02")
      ])),
      modalSection("Justification Note", modalField("Required note","Correction run pr_correction_02 submitted with correct withholding amount of $698.89.","textarea")),
      modalSection("Notifications", `<div class="list">${modalCheck("Notify Payroll owner","Send resolution summary to payroll@example.com.")}${modalCheck("Log to audit trail","Record actor, timestamp, and resolution note. Cannot be undone.")}</div>`)
    ].join("")
  },

  /* TAX LEDGER MODALS */
  "verify-hash":{
    title:"Verify Ledger Hash",
    body:"Confirm the cryptographic integrity of this tax ledger entry. Hash is immutable and stored at posting time.",
    cta:"Copy Hash",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const hashText = "sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";
        navigator.clipboard?.writeText(hashText).catch(()=>{});
        toast("Hash copied to clipboard.");
      });
    },
    content:()=>[
      modalSection("Entry", table(["Field","Value"],[
        row(["Entry ID","tle_001"]),
        row(["Run","pr_2026_06_15"]),
        row(["Employee","Jane Nguyen"]),
        row(["Type","federal_income_tax"]),
        row(["Taxable Wages","$3,449.23"]),
        row(["Employee Tax","$410.55"])
      ])),
      modalSection("Hash Verification", table(["Check","Result"],[
        row(["SHA-256 hash","sha256:a1b2c3d4e5f6..."]),
        row(["Stored at posting",status("Jun 24, 2026 16:25:11 UTC")]),
        row(["Chain integrity",status("Verified")]),
        row(["Tamper detected",status("None")])
      ])),
      modalSection("What This Means", `<div class="list">${listItem("Immutable record","Once posted, this entry cannot be changed. Any correction creates a new entry.","green")}${listItem("Audit chain","Hash chain links each entry to the previous, preventing silent insertion.","blue")}${listItem("CPA export","Full hash list is included in CPA report package on request.","yellow")}</div>`)
    ].join("")
  },

  /* JURISDICTION MODALS */
  "edit-jurisdiction":{
    title:"Edit Jurisdiction",
    body:"Update registration status, deposit schedule, account reference, and agency contact for this jurisdiction.",
    cta:"Update Jurisdiction",
    content:()=>[
      modalSection("Jurisdiction", modalGrid([
        modalField("Jurisdiction ID","US-CA"),
        modalField("Name","California"),
        modalSelect("Registration status",[["Active",true],["Review"],["Missing setup"],["Inactive"]]),
        modalSelect("Deposit schedule",[["Semiweekly",true],["Monthly"],["Quarterly"],["Annually"]])
      ])),
      modalSection("Account", modalGrid([
        modalField("State account number","CA-XXXXXXXX (masked)"),
        modalField("Agency name","California EDD / FTB"),
        modalField("Next due date","Jun 24, 2026"),
        modalField("Registration date","2024-03-01")
      ])),
      modalSection("Alerts", `<div class="list">${modalCheck("Alert 3 days before deposit due","Notify payroll admin when deposit is approaching.")}${modalCheck("Alert if registration expires","Auto-flag if annual registration renewal is needed.")}</div>`)
    ].join("")
  },

  /* FORMS & REPORTS MODALS */
  "preview-form":{
    title:"Form Preview",
    body:"Review form content, records included, and filing deadline before downloading or sharing.",
    cta:"Download",
    content:()=>[
      modalSection("Form Summary", modalGrid([
        modalField("Form","Federal 941 Worksheet"),
        modalField("Period","Q2 2026"),
        modalField("Records","1 employer"),
        modalField("Source","Tax ledger"),
        modalField("Due","Jul 31, 2026"),
        modalField("Status","Ready")
      ])),
      modalSection("Content Preview", table(["Line","Description","Amount"],[
        row(["1","Total wages, tips, other compensation","$312,448.00"]),
        row(["2","Federal income tax withheld","$54,621.00"]),
        row(["5a","Taxable social security wages","$312,448.00"]),
        row(["5c","Taxable Medicare wages","$312,448.00"]),
        row(["13","Total deposits for the quarter","$54,621.00"])
      ])),
      modalSection("Filing Instructions", `<div class="list">${listItem("Due Jul 31, 2026","Q2 941 due date. File electronically via IRS e-file or approved EFTPS.","yellow")}${listItem("Signature required","Authorized officer must sign before submission.","blue")}</div>`)
    ].join("")
  },
  "share-form":{
    title:"Share Form with CPA",
    body:"Grant read-only access to this form for your connected CPA or bookkeeper.",
    cta:"Share",
    content:()=>[
      modalSection("Share To", modalGrid([
        modalSelect("CPA / Recipient",[["Nguyen CPA Group",true],["Internal bookkeeper"],["Tax partner"]]),
        modalSelect("Access",[["Review-only",true],["Download allowed"]]),
        modalSelect("Expiration",[["15 days",true],["7 days"],["30 days"],["Never"]])
      ])),
      modalSection("Form Being Shared", table(["Form","Period","Status"],[
        row(["Federal 941 Worksheet","Q2 2026",status("Ready")])
      ])),
      modalSection("Notification", `<div class="list">${modalCheck("Email CPA with direct link","Send secure link to CPA's registered email.")}${modalCheck("Log share to audit trail","Record who shared what, when, and to whom.")}</div>`)
    ].join("")
  },
  report:{
    title:"Generate Report Package",
    body:"Build a CPA-ready package with ledger, payout, receipt, mileage, and report files.",
    cta:"Generate",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const selects = modal.querySelectorAll("select");
        const type    = selects[0]?.value || "CPA year-end package";
        const range   = selects[1]?.value || "Q2 2026";
        const fmt     = selects[2]?.value || "PDF + CSV";
        const pii     = selects[3]?.value || "Masked SSN/TIN";
        const checks  = [...modal.querySelectorAll("input[type=checkbox]:checked")].map(c=>c.closest("label,div")?.textContent?.trim()?.split("\n")[0]||"").filter(Boolean);
        const rptId   = "rpt_" + Date.now().toString(36);
        const stamp   = new Date().toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
        const sections= checks.length ? checks.join(", ") : "all sections";
        data.auditLog.unshift([stamp,"payroll_admin_44","EXPORTED","report",rptId,
          type + " generated: " + fmt + " — " + range + " — " + sections + " — " + pii + "."
        ]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage();
        toast("Report package generated: " + type + " (" + range + ", " + fmt + ")");
      });
    },
    content:()=>[
      modalSection("Package Scope", modalGrid([
        modalSelect("Report type",[["CPA year-end package",true],["Payroll run package"],["1099 support package"],["Mileage package"],["Tip ledger package"]]),
        modalSelect("Date range",[["Q2 2026",true],["YTD 2026"],["Custom range"]]),
        modalSelect("Format",[["PDF + CSV",true],["PDF only"],["CSV only"]]),
        modalSelect("PII mode",[["Masked SSN/TIN",true],["Full PII - approval required"]])
      ])),
      modalSection("Included Sections", `<div class="list">${modalCheck("Tax ledger","Employee and employer tax detail.")}${modalCheck("Payout ledger","Worker payouts, evidence, and classification.")}${modalCheck("Receipt OCR vault","Bills, invoices, receipts, categories, and proof index.")}${modalCheck("GPS mileage","Trip purpose and deduction candidates.")}${modalCheck("Tip ledger","YTD qualified tips and method summary.", false)}</div>`),
      modalSection("Export Validation", table(["Check","Result"],[
        row(["Ledger totals reconcile",status("Ready")]),
        row(["Missing evidence flagged",status("Review")]),
        row(["Audit trail included",status("Ready")])
      ]))
    ].join("")
  },

  /* OCR VAULT MODALS */
  receipt:{
    title:"Capture Receipt / Bill",
    body:"Photo or file → OCR runs in your browser → fields auto-filled. No data sent to server.",
    cta:"Save to Vault",
    afterOpen(modal){
      /* ── helpers ── */
      const $  = id => modal.querySelector(id);
      const show = id => ["rcpt-pick","rcpt-cam","rcpt-proc","rcpt-result"].forEach(s=>{
        const el=modal.querySelector("#"+s); if(el) el.style.display=(s===id)?"":"none";
      });
      const mainCta = $("#modalMainCta");
      if(mainCta) mainCta.style.display="none";

      /* ── Save to Vault — real action ── */
      mainCta?.addEventListener("click", e=>{
        e.stopPropagation(); // block generic data-action-toast handler
        const vendor   = ($("#ocrVendor")?.value||"").trim()||"Unknown Vendor";
        const total    = ($("#ocrTotal")?.value ||"").trim()||"—";
        const tax      = ($("#ocrTax")?.value   ||"").trim()||"—";
        const rcptNo   = ($("#ocrNum")?.value   ||"").trim()||"—";
        const category = $("#ocrCategory")?.value||"Supplies";
        const owner    = modal.querySelector("select")?.value||"Owner";
        const id       = "rcpt_"+(data.receipts.length+1).toString().padStart(3,"0");
        const stamp    = new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
        data.receipts.unshift([id, vendor, category, total, "Camera", "Needs Review", owner, "—", tax, rcptNo, stamp, "—"]);
        /* stop camera, close modal */
        modal.querySelectorAll("video").forEach(v=>{
          if(v.srcObject){v.srcObject.getTracks().forEach(t=>t.stop());v.srcObject=null;}
        });
        if(modal._camStream) modal._camStream.stop();
        document.getElementById("modalRoot").classList.remove("open");
        renderPage();
        toast("Receipt saved to vault: "+vendor+" "+total);
      });

      /* ── load Tesseract.js from CDN (once) ── */
      const loadTesseract = ()=>window.Tesseract
        ? Promise.resolve()
        : new Promise((ok,fail)=>{
            const s=document.createElement("script");
            s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
            s.onload=ok; s.onerror=fail;
            document.head.appendChild(s);
          });

      /* ── parse raw OCR text into structured fields ── */
      const parse = txt => {
        const lines = txt.split("\n").map(l=>l.trim()).filter(Boolean);
        const vendor = lines.find(l=>/[a-zA-Z]{3}/.test(l))||"";
        const dollars= [...txt.matchAll(/\$?\s*(\d{1,5}[,.]?\d{2})/g)]
                         .map(m=>parseFloat(m[1].replace(",",".")));
        const total  = dollars.length ? "$"+Math.max(...dollars).toFixed(2) : "";
        const taxM   = txt.match(/tax[:\s]+\$?\s*([\d,.]+)/i);
        const tax    = taxM ? "$"+parseFloat(taxM[1].replace(",",".")).toFixed(2) : "";
        const dateM  = txt.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s+\d{1,2},?\s+\d{4})\b/i);
        const date   = dateM ? dateM[0] : "";
        const numM   = txt.match(/(?:receipt|invoice|order|ref|no\.?)[:\s#]*([A-Z0-9\-]{3,20})/i);
        const rcptNo = numM ? numM[1] : "";
        return {vendor,total,tax,date,rcptNo};
      };

      /* ── run OCR on an image src (dataURL or blob URL) ── */
      const runOCR = async src => {
        show("rcpt-proc");
        const bar = $("#rcptBar");
        try {
          await loadTesseract();
          const {data:{text}} = await Tesseract.recognize(src,"eng",{
            logger:m=>{ if(m.status==="recognizing text"&&bar) bar.style.width=(m.progress*100)+"%"; }
          });
          const p = parse(text);
          /* populate inputs */
          [["#ocrVendor",p.vendor],["#ocrTotal",p.total],["#ocrTax",p.tax],
           ["#ocrDate",p.date],   ["#ocrNum",p.rcptNo]].forEach(([id,v])=>{
            const el=$(id); if(el) el.value=v;
          });
          const raw=$("#ocrRaw"); if(raw) raw.textContent=text.trim().slice(0,800)||(text.trim()||"(no text found)");
        } catch(e) {
          const raw=$("#ocrRaw"); if(raw) raw.textContent="OCR error: "+e.message;
        }
        show("rcpt-result");
        if(mainCta) mainCta.style.display="";
      };

      /* ── handle image (dataURL or File) ── */
      const handleImg = (src, file) => {
        const prev=$("#rcptPreview");
        if(prev){ prev.src=src||URL.createObjectURL(file); prev.style.display="block"; }
        runOCR(src||URL.createObjectURL(file));
      };
      const handleFile = f => {
        if(!f) return;
        if(f.type.startsWith("image/")){
          const r=new FileReader(); r.onload=e=>handleImg(e.target.result); r.readAsDataURL(f);
        } else { handleImg(null,f); } // PDF — pass blob URL directly
      };

      /* ── Camera button ── */
      $("#rcptCamBtn")?.addEventListener("click", async ()=>{
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if(isMobile){
          // Mobile: trigger native camera via file input
          $("#rcptCamInput")?.click();
        } else {
          // Desktop: show live viewfinder
          show("rcpt-cam");
          let facing="environment", stream=null;
          const video=$("#rcptVideo");
          const startCam = async mode=>{
            if(stream) stream.getTracks().forEach(t=>t.stop());
            try{
              stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:mode}}});
              video.srcObject=stream; await video.play();
            }catch{
              // No camera permission → show file upload instead
              show("rcpt-pick");
              alert("Camera access denied. Please use Upload File instead, or allow camera in browser settings.");
            }
          };
          await startCam(facing);
          $("#rcptCapture")?.addEventListener("click",()=>{
            const c=document.createElement("canvas");
            c.width=video.videoWidth||640; c.height=video.videoHeight||480;
            c.getContext("2d").drawImage(video,0,0);
            if(stream) stream.getTracks().forEach(t=>t.stop());
            handleImg(c.toDataURL("image/jpeg",.92));
          });
          $("#rcptFlip")?.addEventListener("click",()=>{
            facing=facing==="environment"?"user":"environment"; startCam(facing);
          });
          // store stream ref for cleanup on modal close
          modal._camStream = {stop:()=>{ if(stream) stream.getTracks().forEach(t=>t.stop()); }};
        }
      });

      /* ── Upload & Camera file inputs ── */
      $("#rcptFileBtn") ?.addEventListener("click",  ()=>$("#rcptFileInput")?.click());
      $("#rcptFileInput")?.addEventListener("change", e=>handleFile(e.target.files[0]));
      $("#rcptCamInput") ?.addEventListener("change", e=>handleFile(e.target.files[0]));

      /* ── Drag-drop on pick area ── */
      const drop=$("#rcpt-pick");
      drop?.addEventListener("dragover", e=>{e.preventDefault(); drop.style.outlineColor="#4f46e5";});
      drop?.addEventListener("dragleave",()=>{ drop.style.outlineColor=""; });
      drop?.addEventListener("drop", e=>{
        e.preventDefault(); drop.style.outlineColor="";
        handleFile(e.dataTransfer.files[0]);
      });
    },
    content:()=>`
      <!-- STEP 1: Pick source -->
      <div id="rcpt-pick" style="outline:2px dashed #334155;border-radius:12px;padding:32px;text-align:center">
        <div style="font-size:48px;line-height:1;margin-bottom:12px;opacity:.55">🧾</div>
        <div style="font-weight:900;font-size:15px;color:#e2e8f0;margin-bottom:6px">Take a photo or upload a receipt</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:24px">JPG · PNG · PDF — any nail salon expense receipt</div>
        <div style="display:flex;gap:12px;max-width:380px;margin:0 auto 14px">
          <button id="rcptCamBtn"  class="${ui.btn} ${ui.primary}" style="flex:1;height:44px;font-size:13px">📷 Camera</button>
          <button id="rcptFileBtn" class="${ui.btn}"               style="flex:1;height:44px;font-size:13px">📁 Upload File</button>
        </div>
        <div style="font-size:10px;color:#475569">OCR runs locally in your browser — no data is sent to any server</div>
        <!-- hidden inputs -->
        <input id="rcptCamInput"  type="file" accept="image/*" capture="environment" style="display:none">
        <input id="rcptFileInput" type="file" accept="image/*,application/pdf"       style="display:none">
      </div>

      <!-- STEP 2: Desktop camera viewfinder -->
      <div id="rcpt-cam" style="display:none">
        <div style="position:relative;background:#000;border-radius:12px;overflow:hidden">
          <video id="rcptVideo" autoplay playsinline muted style="width:100%;max-height:300px;display:block;object-fit:cover"></video>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:62%;height:66%;border:2px solid rgba(99,102,241,.7);border-radius:6px;box-shadow:0 0 0 9999px rgba(0,0,0,.35);pointer-events:none"></div>
          <div style="position:absolute;bottom:0;left:0;right:0;padding:6px;text-align:center;font-size:10px;color:rgba(255,255,255,.45)">Align receipt within the frame · good lighting · all 4 corners visible</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
          <button id="rcptCapture" class="${ui.btn} ${ui.primary}" style="height:40px">Capture Photo</button>
          <button id="rcptFlip"    class="${ui.btn}"               style="height:40px">Flip Camera</button>
          <button class="${ui.btn}" style="height:40px" onclick="document.getElementById('rcpt-cam').style.display='none';document.getElementById('rcpt-pick').style.display=''">Back</button>
        </div>
      </div>

      <!-- STEP 3: OCR processing -->
      <div id="rcpt-proc" style="display:none;text-align:center;padding:40px 24px">
        <img id="rcptPreview" style="max-height:120px;max-width:100%;object-fit:contain;border-radius:8px;margin-bottom:16px;display:none">
        <div style="font-weight:900;color:#e2e8f0;margin-bottom:6px">Reading receipt with Tesseract OCR...</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:16px">Running locally in browser · no network request</div>
        <div style="margin:0 auto 10px;width:280px;height:6px;background:#1e293b;border-radius:3px;overflow:hidden">
          <div id="rcptBar" style="height:100%;width:0;background:linear-gradient(90deg,#4f46e5,#06b6d4);border-radius:3px;transition:width .25s linear"></div>
        </div>
        <div style="font-size:10px;color:#475569">5–15 seconds depending on image size and quality</div>
      </div>

      <!-- STEP 4: Results + business details -->
      <div id="rcpt-result" style="display:none">
        <div class="grid-2" style="gap:16px;margin-bottom:16px">
          <div>
            <img id="rcptPreview" style="width:100%;max-height:160px;object-fit:contain;border-radius:8px;background:#0f172a;margin-bottom:10px;display:none">
            ${modalSection("Extracted Fields — edit if wrong", `
              <div class="panel-body" style="display:grid;gap:8px">
                <label class="form-field"><span>Vendor / Payee</span><input id="ocrVendor" class="form-control" placeholder="e.g. Beauty Supply Warehouse"></label>
                <label class="form-field"><span>Total Amount</span>  <input id="ocrTotal"  class="form-control" placeholder="e.g. $384.20"></label>
                <label class="form-field"><span>Tax Amount</span>    <input id="ocrTax"    class="form-control" placeholder="e.g. $31.60"></label>
                <label class="form-field"><span>Date</span>          <input id="ocrDate"   class="form-control" placeholder="e.g. Jun 18, 2026"></label>
                <label class="form-field"><span>Receipt #</span>     <input id="ocrNum"    class="form-control" placeholder="e.g. REC-0042"></label>
                <label class="form-field"><span>Category</span>
                  <select id="ocrCategory" class="form-control">
                    <option>Supplies</option><option>Utilities</option><option>Equipment</option>
                    <option>Payment evidence</option><option>Travel</option><option>Meals</option>
                    <option>Software</option><option>Other</option>
                  </select>
                </label>
              </div>`)}
          </div>
          <div>
            ${modalSection("Raw OCR text",`<div class="panel-body"><pre id="ocrRaw" style="font-size:9px;color:#64748b;white-space:pre-wrap;max-height:260px;overflow-y:auto;line-height:1.5;font-family:monospace">Waiting...</pre></div>`)}
          </div>
        </div>
        ${modalSection("Business Details", modalGrid([
          modalField("Business purpose","e.g. Supplies for salon — gel nails, acetone, files"),
          modalSelect("Owner",[["Owner",true],["Bookkeeper"],["Finance"],["Manager"]]),
          modalSelect("Attach to payout",[["None",true],["PAY-2026-001"],["PAY-2026-002"]]),
          modalSelect("CPA package",[["Yes — standard package",true],["Yes — on request only"],["No"]])
        ]))}
        ${modalSection("Storage Settings",`<div class="list">
          ${modalCheck("Flag for review if any field < 90% confidence","Low-confidence fields enter the review queue.")}
          ${modalCheck("Store original image","Keep source for 7-year audit trail and CPA package.")}
          ${modalCheck("Detect duplicates","Compare vendor + amount + date against existing vault.")}
        </div>`)}
      </div>`
  },
  "view-receipt":{
    title:"Receipt Detail — rcpt_001",
    body:"Full OCR extraction, confidence scores, original image, business purpose, and audit trail.",
    cta:"Approve Receipt",
    content:()=>[
      modalSection("Original Image", `
        <div style="display:flex;gap:16px;align-items:flex-start">
          <div style="flex-shrink:0;width:160px;min-height:200px;border:2px solid #334155;border-radius:8px;background:#0f172a;display:flex;align-items:center;justify-content:center">
            <span style="color:#64748b;font-size:10px;font-weight:900;letter-spacing:.05em;text-align:center;padding:12px">RECEIPT IMAGE<br>PLACEHOLDER<br><br><span style="font-weight:400">rcpt_001.jpg<br>Camera · Jun 18</span></span>
          </div>
          <div style="flex:1">${table(["Field","Extracted Value","Confidence"],[
            row(["Vendor","Beauty Supply Warehouse",`<span class="text-emerald-400 font-black">94%</span>`]),
            row(["Total Amount","$384.20",`<span class="text-emerald-400 font-black">91%</span>`]),
            row(["Tax Amount","$31.60",`<span class="text-amber-400 font-black">72%</span>`]),
            row(["Date","Jun 18, 2026",`<span class="text-emerald-400 font-black">88%</span>`]),
            row(["Receipt #","REC-0042",`<span class="text-amber-400 font-black">80%</span>`]),
            row(["Category","Supplies",`<span class="text-emerald-400 font-black">86%</span>`])
          ])}</div>
        </div>`),
      modalSection("Business Details", modalGrid([
        modalField("Business purpose","Supplies for salon operations — gel nails, acetone, files"),
        modalField("Owner","Owner"),
        modalSelect("Category",[["Supplies",true],["Utilities"],["Equipment"],["Payment evidence"],["Travel"],["Meals"]]),
        modalField("Related payout","—"),
        modalSelect("CPA package",[["Yes — standard package",true],["Yes — on request only"],["No"]]),
        modalField("Vendor address","1234 Commerce Blvd, Houston TX (OCR extracted)")
      ])),
      modalSection("Status", table(["Check","Result","Detail"],[
        row(["Duplicate check",status("Ready"),"No matching vendor+amount+date in vault"]),
        row(["All fields extracted",status("Review"),"Tax field confidence 72% — human review recommended"]),
        row(["Business purpose",status("Active"),"Documented"]),
        row(["CPA package",status("Ready"),"Included in standard export"])
      ])),
      modalSection("Audit Trail", table(["Time","Actor","Event"],[
        row(["Jun 18 14:00","system","Photo captured via in-app camera"]),
        row(["Jun 18 14:03","system","OCR processed — avg confidence 86% — flagged tax field 72%"]),
        row(["Jun 18 14:05","owner_user","Business purpose added: 'Supplies for salon operations'"]),
        row(["Jun 18 14:10","owner_user","Category confirmed: Supplies"]),
        row(["Pending","—","Awaiting final approval"])
      ]))
    ].join("")
  },
  "edit-receipt":{
    title:"Edit Receipt",
    body:"Update category, business purpose, owner, and related record before approval.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Edit Fields", modalGrid([
        modalField("Vendor","Beauty Supply Warehouse"),
        modalField("Amount","$384.20"),
        modalField("Tax amount","$31.60"),
        modalField("Date","Jun 18, 2026"),
        modalField("Receipt number","REC-0042"),
        modalSelect("Category",[["Supplies",true],["Utilities"],["Payment evidence"],["Travel"],["Meals"],["Equipment"],["Software"]]),
        modalField("Business purpose","Supplies for salon operations"),
        modalField("Owner","Owner")
      ])),
      modalSection("Related Records", modalGrid([
        modalSelect("Attach to payout",[["None",true],["PAY-2026-001"],["PAY-2026-002"]]),
        modalSelect("Include in CPA package",[["Yes",true],["No"]])
      ])),
      modalSection("Edit Note", modalField("Reason for change","Correcting category from 'Unknown' to 'Supplies' based on vendor name.","textarea"))
    ].join("")
  },
  "ocr-review":{
    title:"Review Low-Confidence Fields",
    body:"One or more extracted fields have confidence below 90%. Review and correct each field before approving the receipt.",
    cta:"Save & Approve",
    content:()=>[
      modalSection("Original Image", `
        <div style="display:flex;gap:16px;align-items:flex-start">
          <div style="flex-shrink:0;width:140px;min-height:180px;border:2px solid #f59e0b;border-radius:8px;background:#0f172a;display:flex;align-items:center;justify-content:center">
            <span style="color:#64748b;font-size:10px;font-weight:900;text-align:center;padding:10px">RECEIPT IMAGE<br>rcpt_002.jpg</span>
          </div>
          <div style="flex:1"><div class="notice" style="margin-bottom:8px">Fields highlighted in amber have confidence below 90% and require manual confirmation.</div>
          ${table(["Field","OCR Result","Confidence","Correct Value"],[
            row(["Vendor","AT&T Phone Bill",`<span class="text-emerald-400 font-black">91%</span>`,"<span class='text-slate-400 text-xs'>Auto-accepted</span>"]),
            row(["Total Amount","$129.00",`<span class="text-emerald-400 font-black">93%</span>`,"<span class='text-slate-400 text-xs'>Auto-accepted</span>"]),
            row(["Tax Amount","$0.00",`<span class="text-amber-400 font-black">67%</span>`,modalField("","$0.00")]),
            row(["Date","Jun 20, 2026",`<span class="text-amber-400 font-black">79%</span>`,modalField("","Jun 20, 2026")]),
            row(["Receipt #","INV-0918",`<span class="text-amber-400 font-black">74%</span>`,modalField("","INV-0918")])
          ])}</div>
        </div>`),
      modalSection("Business Details", modalGrid([
        modalField("Business purpose","Monthly phone bill — business line for salon"),
        modalSelect("Category",[["Utilities",true],["Supplies"],["Equipment"],["Software"],["Other"]]),
        modalSelect("Deductible portion",[["100% business",true],["50% business / 50% personal"],["Custom %"]]),
        modalSelect("Include in CPA package",[["Yes",true],["No"]])
      ])),
      modalSection("Reviewer Note (Optional)", modalField("Note","Tax field OCR read $0 — confirmed correct, phone plan is tax-exempt.","textarea"))
    ].join("")
  },
  "ocr-batch-approve":{
    title:"Approve High-Confidence Receipts",
    body:"Review and approve all receipts where every extracted field is ≥ 90% confidence. Low-confidence items are excluded.",
    cta:"Approve All Listed",
    content:()=>[
      modalSection("Eligible for Batch Approval", table(["ID","Vendor","Amount","Avg Confidence","Category","Status"],[
        row([`<span class="mono">rcpt_001</span>`,"Beauty Supply Warehouse","$384.20",`<span class="text-emerald-400 font-black">91%</span>`,"Supplies",status("Extracted")]),
        row([`<span class="mono">rcpt_004</span>`,"Nail Supply Co.","$212.50",`<span class="text-emerald-400 font-black">91%</span>`,"Supplies",status("Extracted")])
      ])),
      modalSection("Excluded — Needs Manual Review", table(["ID","Vendor","Issue"],[
        row([`<span class="mono">rcpt_002</span>`,"AT&T Phone Bill","Tax field 67%, Date 79% — below threshold"]),
        row([`<span class="mono">rcpt_003</span>`,"Unknown Zelle memo","No OCR data — payout upload without image"]),
        row([`<span class="mono">rcpt_006</span>`,"Square POS Receipt","Multiple fields below 80% — manual review required"])
      ])),
      modalSection("Approval Settings", `<div class="list">
        ${modalCheck("Add reviewer note to each record","Tag batch approval with actor and date.")}
        ${modalCheck("Include in CPA package immediately","Approved receipts enter standard CPA export queue.")}
        ${modalCheck("Alert if business purpose is missing","Do not approve records without a documented purpose.", false)}
      </div>`)
    ].join("")
  },

  /* SHARE LINK MODALS */
  "share-link":{
    title:"Create Share Link",
    body:"Choose recipient, access type, expiration, QR option, and audit controls.",
    cta:"Create Link",
    afterOpen(modal){
      // Passcode toggle
      const pcToggle = modal.querySelector("#slPcToggle");
      const pcRow    = modal.querySelector("#slPcRow");
      pcToggle?.addEventListener("change", ()=>{
        if(pcRow) pcRow.style.display = pcToggle.value==="No" ? "none" : "";
      });
      // Save
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs   = modal.querySelectorAll("input.form-control");
        const name     = (inputs[0]?.value||"").trim() || "New Recipient";
        const access   = modal.querySelectorAll("select.form-control")[2]?.value || "Review-only";
        const expiry   = modal.querySelectorAll("select.form-control")[3]?.value || "15 days";
        const passcode = (modal.querySelector("#slPasscode")?.value||"").trim();
        const hasPC    = pcToggle?.value!=="No" && passcode;
        const linkId   = "shr_"+String(data.shareLinks.length+1).padStart(3,"0");
        data.shareLinks.push([linkId,name,access,expiry,"Active"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage();
        toast("Share link created: "+linkId+(hasPC?" (passcode protected)":""));
      });
    },
    content:()=>[
      modalSection("Recipient & Access", modalGrid([
        modalSelect("Recipient type",[["CPA / tax preparer",true],["Technician"],["Friend/referral"],["External reviewer"]]),
        modalField("Recipient name","Nguyen CPA Group"),
        modalSelect("Access mode",[["Review-only",true],["Upload-only"],["Review + upload"]]),
        modalSelect("Expiration",[["15 days",true],["7 days"],["30 days"],["Never expires"]])
      ])),
      modalSection("Shared Data", `<div class="list">${modalCheck("Tax ledger summary","Share selected tax ledger entries.")}${modalCheck("Receipts and proof index","Allow recipient to review OCR evidence.")}${modalCheck("Payout evidence","Include payout records and screenshots.")}${modalCheck("Public profile QR","Only for non-sensitive business profile links.", false)}</div>`),
      modalSection("Security", `<div class="modal-grid"><label class="form-field"><span>Require passcode</span><select id="slPcToggle" class="form-control"><option selected>Yes</option><option>No</option></select></label><label class="form-field"><span>Download permission</span><select class="form-control"><option selected>Disabled</option><option>PDF only</option><option>PDF + CSV</option></select></label></div><div id="slPcRow" class="modal-grid" style="margin-top:8px"><label class="form-field"><span>Passcode</span><input id="slPasscode" class="form-control" type="text" placeholder="e.g. 1234 or SALON2026" autocomplete="off"></label></div>`)
    ].join("")
  },
  "share-link-detail":{
    title:"Share Link Detail",
    body:"View recipient access, expiration, upload permissions, QR behavior, and audit history before copying or disabling the link.",
    cta:"Copy Link",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const url = modal.querySelector("input[value*='taxiq.link']")?.value || "taxiq.link/shr_001";
        navigator.clipboard?.writeText("https://"+url).catch(()=>{});
        toast("Link copied: https://"+url);
      });
    },
    content:()=>[
      modalSection("Link Summary", modalGrid([
        modalField("Link ID","shr_001"),
        modalField("Recipient","CPA Review"),
        modalField("Access","Ledger + receipts"),
        modalField("Expires","15 days"),
        modalField("Status","Active"),
        modalField("Short URL","taxiq.link/shr_001")
      ])),
      modalSection("Permissions", table(["Permission","Enabled"],[
        row(["View ledger",status("Active")]),
        row(["View receipt images",status("Active")]),
        row(["Upload missing files",status("Missing")]),
        row(["Download CSV",status("Missing")])
      ])),
      modalSection("Audit Trail", table(["Time","Event","IP / Device"],[
        row(["Jun 24 10:21","Link created","Owner dashboard"]),
        row(["Jun 24 10:22","QR generated","Owner dashboard"]),
        row(["Not opened yet","Waiting for recipient","-"])
      ]))
    ].join("")
  },
  "share-link-qr":{
    title:"QR Code — Share Link",
    body:"Generate and download a QR code for this share link. Scan to open in a mobile browser.",
    cta:"Download QR",
    content:()=>[
      modalSection("QR Code", `<div class="panel-body text-center"><div style="border:2px dashed #334155;border-radius:12px;padding:40px;margin:0 auto;max-width:220px;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.06em">QR CODE PLACEHOLDER<br><br><span style="font-size:10px;font-weight:400">taxiq.link/shr_001</span></div></div>`),
      modalSection("Link Details", modalGrid([
        modalField("Link ID","shr_001"),
        modalField("Recipient","CPA Review"),
        modalField("Access","Review-only — Ledger + receipts"),
        modalField("Expires","Jun 9, 2026 (15 days from creation)")
      ])),
      modalSection("QR Settings", `<div class="list">${modalCheck("Include logo in QR","Embed TaxIQ logo in center of QR code.")}${modalCheck("High resolution (300dpi)","Export print-quality PNG for physical distribution.")}${modalCheck("Same permissions as link","QR inherits access scope — no separate permission set.")}</div>`)
    ].join("")
  },
  "revoke-share-link":{
    title:"Revoke Share Link",
    body:"Immediately disable this link. The recipient will lose access on their next attempt to open it.",
    cta:"Revoke Link",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const ctx = window._modalCtx||{};
        const id  = ctx.ctxId || data.shareLinks[0]?.[0];
        const lnk = data.shareLinks.find(s=>s[0]===id);
        if(lnk){ lnk[4]="Revoked"; }
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Share link revoked: "+id+". Recipient access removed immediately.");
      });
    },
    content:()=>[
      modalSection("Link Being Revoked", table(["Field","Value"],[
        row(["Link ID","shr_001"]),
        row(["Recipient","CPA Review"]),
        row(["Access","Ledger + receipts"]),
        row(["Status",status("Active")]),
        row(["Opened","Not opened yet"])
      ])),
      modalSection("Impact", `<div class="list">${listItem("Immediate effect","Recipient cannot open this link after revocation, even if they have the URL.","red")}${listItem("QR codes invalidated","Any QR code pointing to this link is also disabled.","yellow")}${listItem("Audit logged","Revocation event is recorded with actor and timestamp.","blue")}</div>`),
      modalSection("Revocation Note", modalField("Reason (optional)","Sharing period ended — CPA review complete.","textarea"))
    ].join("")
  },

  /* GPS MILEAGE MODALS */
  trip:{
    title:"Start GPS Trip",
    body:"Start at point A, stop at point B, then save route, miles, time, vehicle, and business purpose for CPA review.",
    cta:"Close",
    afterOpen(modal){
      const $ = sel => modal.querySelector(sel);
      const mainCta = $("#modalMainCta");
      if(mainCta) mainCta.style.display = "none";

      const setText = (sel, text) => { const el = $(sel); if(el) el.textContent = text; };
      const readField = sel => ($(sel)?.value || "").trim();
      const addPoint = pos => {
        if(!activeGpsTrip) return;
        activeGpsTrip.points.push({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          at: new Date().toISOString()
        });
        updateUi();
      };
      const updateUi = () => {
        const running = !!activeGpsTrip;
        const miles = running ? gpsDistanceMiles(activeGpsTrip.points).toFixed(2) : "0.00";
        setText("#gpsState", running ? "Tracking active" : "Ready to start");
        setText("#gpsStartValue", running ? activeGpsTrip.startLabel : readField("#gpsStartLabel") || "Point A not set");
        setText("#gpsEndValue", running ? "Destination pending" : readField("#gpsEndLabel") || "Point B not set");
        setText("#gpsPointCount", running ? String(activeGpsTrip.points.length) : "0");
        setText("#gpsLiveMiles", miles);
        const startBtn = $("#gpsStartBtn"), stopBtn = $("#gpsStopBtn");
        if(startBtn) startBtn.disabled = running;
        if(stopBtn) stopBtn.disabled = !running;
      };
      const getManualPoint = label => ({lat: 0, lng: 0, label, manual: true, at: new Date().toISOString()});

      $("#gpsStartBtn")?.addEventListener("click", () => {
        const startLabel = readField("#gpsStartLabel") || "Point A";
        const vehicle = readField("#gpsVehicle") || "2022 Toyota Sienna";
        const purpose = readField("#gpsPurpose") || "Business purpose pending";
        const tripType = $("#gpsTripType")?.value || "Business supplies";
        activeGpsTrip = {startLabel, vehicle, purpose, tripType, startedAt:new Date(), points:[]};
        setText("#gpsMessage","Tracking started. Drive to point B, then press Stop Trip.");

        if(navigator.geolocation){
          activeGpsTrip.watchId = navigator.geolocation.watchPosition(addPoint, () => {
            activeGpsTrip.points.push(getManualPoint(startLabel));
            setText("#gpsMessage","GPS permission unavailable. Trip can still be saved using manual point A/B labels and expected miles.");
            updateUi();
          }, {enableHighAccuracy:true, maximumAge:5000, timeout:10000});
        } else {
          activeGpsTrip.points.push(getManualPoint(startLabel));
          setText("#gpsMessage","GPS is not available in this browser. Trip can still be saved manually.");
        }
        updateUi();
      });

      $("#gpsStopBtn")?.addEventListener("click", () => {
        if(!activeGpsTrip) return;
        const endLabel = readField("#gpsEndLabel") || "Point B";
        const expectedMiles = parseFloat(readField("#gpsExpectedMiles"));
        const points = activeGpsTrip.points.slice();
        if(points.length < 2) points.push(getManualPoint(endLabel));
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(pos => {
            points.push({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,at:new Date().toISOString()});
            saveTrip(points);
          }, () => saveTrip(points), {enableHighAccuracy:true, maximumAge:5000, timeout:8000});
        } else {
          saveTrip(points);
        }

        function saveTrip(finalPoints){
          if(activeGpsTrip?.watchId && navigator.geolocation) navigator.geolocation.clearWatch(activeGpsTrip.watchId);
          const canUseGpsMiles = finalPoints.length > 1 && finalPoints.every(p => !p.manual);
          const gpsMiles = canUseGpsMiles ? gpsDistanceMiles(finalPoints) : 0;
          const miles = gpsMiles > 0.01 ? gpsMiles : (Number.isFinite(expectedMiles) && expectedMiles > 0 ? expectedMiles : 0);
          const id = "trip_" + (data.trips.length + 1).toString().padStart(3,"0");
          const route = `${activeGpsTrip.startLabel} to ${endLabel}`;
          data.trips.unshift([id, route, miles.toFixed(1), activeGpsTrip.purpose, "Deduction candidate", {
            vehicle: activeGpsTrip.vehicle,
            tripType: activeGpsTrip.tripType,
            startedAt: activeGpsTrip.startedAt.toISOString(),
            endedAt: new Date().toISOString(),
            start: gpsPointLabel(finalPoints[0]),
            end: gpsPointLabel(finalPoints[finalPoints.length - 1]),
            points: finalPoints
          }]);
          activeGpsTrip = null;
          document.getElementById("modalRoot").classList.remove("open");
          renderPage();
          toast(`Trip saved: ${route} (${miles.toFixed(1)} mi)`);
        }
      });

      updateUi();
    },
    content:()=>`
      ${modalSection("Point A to Point B Tracker", `
        <div class="grid-2">
          <label class="form-field"><span>Point A / Start label</span><input id="gpsStartLabel" class="form-control" value="Salon"></label>
          <label class="form-field"><span>Point B / Destination label</span><input id="gpsEndLabel" class="form-control" value="Beauty Supply Warehouse"></label>
          <label class="form-field"><span>Vehicle</span><input id="gpsVehicle" class="form-control" value="2022 Toyota Sienna"></label>
          <label class="form-field"><span>Trip type</span><select id="gpsTripType" class="form-control"><option>Business supplies</option><option>Client visit</option><option>Bank deposit</option><option>Commute review</option><option>Other</option></select></label>
          <label class="form-field"><span>Expected miles fallback</span><input id="gpsExpectedMiles" class="form-control" value="7.8"></label>
          <label class="form-field"><span>Business purpose</span><input id="gpsPurpose" class="form-control" value="Supplies for salon operations"></label>
        </div>
        <div class="notice" style="margin-top:12px" id="gpsMessage">Press Start at point A. When you arrive at point B, press Stop Trip to save the route.</div>
      `)}
      ${modalSection("Live Tracking Status", table(["Field","Value"],[
        row(["State",`<span id="gpsState">Ready to start</span>`]),
        row(["Start",`<span id="gpsStartValue">Point A not set</span>`]),
        row(["Destination",`<span id="gpsEndValue">Point B not set</span>`]),
        row(["GPS points captured",`<span id="gpsPointCount">0</span>`]),
        row(["Live miles",`<span id="gpsLiveMiles">0.00</span>`])
      ]))}
      ${modalSection("Actions", `
        <div class="panel-body" style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" id="gpsStartBtn" type="button">Start Tracking at Point A</button>
          <button class="btn" id="gpsStopBtn" type="button" disabled>Stop Trip at Point B & Save</button>
        </div>
      `)}
      ${modalSection("Deduction Evidence", `<div class="list">${modalCheck("Capture GPS start/end","Required for route evidence.")}${modalCheck("Save A → B route when stopped","The trip is saved only after user presses Stop at destination.")}${modalCheck("Require business purpose","Needed before CPA package export.")}${modalCheck("Flag commute-like routes","Trips from home to regular workplace need CPA review.", false)}</div>`)}
    `
  },
  "view-trip":{
    title:"Trip Detail",
    body:"Review route, miles, business purpose, deduction analysis, and CPA recommendation.",
    cta:"Confirm Purpose",
    content:()=>[
      modalSection("Trip Summary", modalGrid([
        modalField("Trip ID","trip_002"),
        modalField("Route","Salon to supply store"),
        modalField("Miles","7.8"),
        modalField("Vehicle","2022 Toyota Sienna"),
        modalField("Date","Jun 22, 2026"),
        modalField("Purpose","Business supplies")
      ])),
      modalSection("Deduction Analysis", table(["Item","Value"],[
        row(["Estimated deduction","$5.28 (at IRS 67¢/mile rate)"]),
        row(["Status",status("Deduction candidate")]),
        row(["CPA recommendation","Include in mileage log — purpose is clearly business."]),
        row(["Proof","GPS track start/end captured"])
      ])),
      modalSection("Route Map", `<div class="panel-body text-center"><div style="border:2px dashed #334155;border-radius:12px;padding:40px;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.06em">MAP PLACEHOLDER<br><span style="font-size:10px;font-weight:400">Salon → Supply Store: 7.8 mi</span></div></div>`)
    ].join("")
  },
  "edit-trip":{
    title:"Edit Trip",
    body:"Update route, miles, vehicle, purpose, and deduction status. All changes are audit logged.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Trip Details", modalGrid([
        modalField("Route","Salon to supply store"),
        modalField("Miles","7.8"),
        modalSelect("Trip type",[["Business supplies",true],["Client visit"],["Bank deposit"],["Commute review"],["Other"]]),
        modalField("Vehicle","2022 Toyota Sienna"),
        modalField("Date","Jun 22, 2026"),
        modalField("Start location","Salon — 1234 Main St")
      ])),
      modalSection("Purpose & Evidence", `<div class="list">${modalCheck("Business purpose documented","Required for deduction claim.")}${modalCheck("GPS proof captured","Start and end coordinates logged.")}${modalCheck("Submit to CPA package","Include in next export.")}</div>`),
      modalSection("Edit Reason", modalField("Reason for change","Correcting mileage from estimated to actual GPS reading.","textarea"))
    ].join("")
  },

  /* PAYOUT MODALS */
  payout:{
    title:"Create Payout",
    body:"Record technician payout, method, type, period, evidence, and TaxIQ sync status.",
    cta:"Save Payout",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs = modal.querySelectorAll("input.form-control");
        const worker = (inputs[0]?.value||"").trim() || "Unknown Worker";
        const amount = (inputs[1]?.value||"").trim() || "$0.00";
        const method = modal.querySelectorAll("select.form-control")[0]?.value || "Zelle";
        const type   = modal.querySelectorAll("select.form-control")[1]?.value || "Tip + wage";
        const period = (inputs[2]?.value||"").trim() || "—";
        const payId  = "PAY-2026-"+String(data.payouts.length+1).padStart(3,"0");
        data.payouts.unshift([payId,worker.split("/")[0].trim(),"NL-NEW",period,amount,method,type,"Pending","None"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Payout saved: "+payId+" — "+amount+" via "+method);
      });
    },
    content:()=>[
      modalSection("Payout Detail", modalGrid([
        modalField("Worker","likesaa / NL501TESX"),
        modalField("Amount","$250.00"),
        modalSelect("Method",[["Zelle",true],["Cash"],["PayPal"],["Check"],["ACH"]]),
        modalSelect("Type",[["Tip + wage",true],["Tip"],["Bonus"],["Reimbursement"]]),
        modalField("Period","2026-06-01 to 2026-06-15"),
        modalField("Reference","ZELLE-250-0615")
      ])),
      modalSection("Evidence", `<div class="list">${modalCheck("Payment screenshot","Required for Zelle/PayPal/Cash App payouts.")}${modalCheck("Business purpose","Required when payout type is unclear.")}${modalCheck("Sync to Tax IQ ledger","Create immutable payout evidence record.")}</div>`),
      modalSection("Classification Review", table(["Question","Answer","Status"],[
        row(["Worker classification","1099 contractor",status("Review")]),
        row(["Tax form support","1099 package",status("Ready")]),
        row(["Duplicate payout check","No duplicate found",status("Ready")])
      ]))
    ].join("")
  },
  "payout-detail":{
    title:"Payout Detail",
    body:"Review payout method, worker profile, evidence image count, tax sync status, and any unclear business purpose.",
    cta:"Mark Reviewed",
    content:()=>[
      modalSection("Payout Record", modalGrid([
        modalField("Payout ID","PAY-2026-001"),
        modalField("Worker","likesaa"),
        modalField("Staff ID","NL501TESX"),
        modalField("Amount","$250.00"),
        modalField("Method","Zelle"),
        modalField("Evidence","1 image attached")
      ])),
      modalSection("Review Findings", `<div class="list">${listItem("Evidence matched","Uploaded screenshot amount matches payout ledger.","green")}${listItem("Business purpose present","Memo indicates tip + wage for Jun 1-15 period.","green")}${listItem("Classification check","Worker profile is 1099; include in contractor package.","yellow")}</div>`),
      modalSection("Audit", table(["Time","Actor","Action"],[
        row(["Jun 15 18:21","Owner","Created payout"]),
        row(["Jun 15 18:24","Finance","Attached evidence"]),
        row(["Jun 16 09:10","Tax IQ","Synced to payout ledger"])
      ]))
    ].join("")
  },

  /* WEBHOOK MODALS */
  "webhook-retry":{
    title:"Retry Webhook Delivery",
    body:"Review failed webhook events, retry policy, signing status, and dead-letter handling before requeueing delivery.",
    cta:"Retry Delivery",
    content:()=>[
      modalSection("Failed Events", table(["Event","Type","Attempts","Status"],data.webhooks.filter(e=>/Retrying|Dead Letter/.test(e[4])).map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],e[3],status(e[4])])))),
      modalSection("Retry Settings", modalGrid([
        modalField("Retry window","24 hours"),
        modalField("Backoff","5m, 15m, 1h, 4h"),
        modalField("Signature","HMAC SHA-256"),
        modalField("Dead-letter owner","Platform Admin")
      ])),
      modalSection("Before Retry", `<div class="list">${modalCheck("Validate endpoint health","Confirm receiver returns 2xx before bulk retry.")}${modalCheck("Regenerate signature timestamp","Avoid replay rejection on receiver side.")}${modalCheck("Keep dead-letter history","Do not overwrite original failure reason.")}</div>`)
    ].join("")
  },
  "webhook-payload":{
    title:"Webhook Event Payload",
    body:"View the full event payload, delivery headers, response, and attempt history for this webhook event.",
    cta:"Copy Payload",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const payload = modal.querySelector("pre")?.textContent || "{}";
        navigator.clipboard?.writeText(payload).catch(()=>{});
        toast("Payload copied to clipboard.");
      });
    },
    content:()=>[
      modalSection("Event Details", table(["Field","Value"],[
        row(["Event ID","evt_01JZ006"]),
        row(["Type","tax_iq.ledger.posted"]),
        row(["Tenant","tenant_demo_001"]),
        row(["Status",status("Delivered")]),
        row(["Created","2 min ago"]),
        row(["Delivered","2 min ago"])
      ])),
      modalSection("Payload", `<div class="panel-body"><pre class="mono text-[11px] text-slate-300" style="overflow:auto;max-height:200px;white-space:pre-wrap">${JSON.stringify({event:"tax_iq.ledger.posted",tenant_id:"tenant_demo_001",run_id:"pr_2026_06_15",posted_at:"2026-06-24T16:25:11Z",entries:4,gross:"312448.00",employee_tax:"54621.00",employer_tax:"26402.00"},null,2)}</pre></div>`),
      modalSection("Delivery Headers", table(["Header","Value"],[
        row(["X-TaxIQ-Signature","sha256=a1b2c3d4...e5f6 (truncated)"]),
        row(["X-TaxIQ-Event","tax_iq.ledger.posted"]),
        row(["Content-Type","application/json"]),
        row(["X-TaxIQ-Delivery","evt_01JZ006"])
      ]))
    ].join("")
  },

  /* CPA MODALS */
  cpa:{
    title:"Connect CPA / Accountant",
    body:"Connect a third-party CPA, tax preparer, or bookkeeper and preview hourly cost before they review merchant records or prepare tax filing packages.",
    cta:"Approve Estimate & Send Invite",
    content:()=>[
      modalSection("Third-party Firm", modalGrid([
        modalField("Firm","Nguyen CPA Group"),
        modalField("Contact email","review@nguyencpa.example"),
        modalSelect("Firm type",[["CPA firm",true],["Bookkeeper"],["Tax preparer"],["Enrolled agent"]]),
        modalField("License / PTIN","CPA / PTIN on file"),
        modalSelect("Engagement",[["Merchant tax filing support",true],["Year-end tax prep"],["Quarterly estimate"],["Payroll review"],["1099 package"]]),
        modalSelect("Access duration",[["15 days",true],["30 days"],["Until revoked"]])
      ])),
      modalSection("Cost Preview", modalGrid([
        modalSelect("Billing model",[["Hourly estimate",true],["Fixed quote"],["Monthly retainer"],["Free consultation"]]),
        modalField("Hourly rate","$185/hr"),
        modalField("Estimated hours","3.5"),
        modalField("Estimated professional fee","$647.50"),
        modalField("Retainer due now","$250.00"),
        modalField("TaxIQ platform fee","$0.00 for demo")
      ])),
      modalSection("Price Approval", table(["Item","Amount","Notes"],[
        row(["CPA review estimate","$647.50","3.5 hr x $185/hr"]),
        row(["Retainer due before work starts","$250.00","Applied toward final invoice"]),
        row(["Estimated balance after retainer","$397.50","Subject to scope changes"]),
        row(["Merchant approval required",status("Required"),"No CPA work starts until merchant accepts estimate"])
      ])),
      modalSection("Access Scope", `<div class="list">${modalCheck("Ledger and reports","Read-only access to Tax IQ ledger, payroll summaries, payout records, and generated reports.")}${modalCheck("Receipts and evidence vault","CPA can inspect OCR receipts, bills, invoices, payout screenshots, and proof index.")}${modalCheck("Comment and request files","CPA can request missing receipts, explanations, W-9/W-4 support, or business purpose notes.")}${modalCheck("Prepare filing package","CPA can organize draft filing package for merchant review.")}${modalCheck("Submit/file taxes directly","Disabled by default. Merchant approval and external CPA workflow required.", false)}</div>`)
    ].join("")
  },
  "cpa-portal":{
    title:"CPA Portal Access",
    body:"Manage what your CPA can see, review open requests, and track their progress.",
    cta:"Manage Access",
    content:()=>[
      modalSection("CPA Firm", table(["Field","Value"],[
        row(["Firm","Nguyen CPA Group"]),
        row(["Status",status("Invited")]),
        row(["Access scope","Ledger, receipts, payouts, mileage"]),
        row(["Access duration","15 days"]),
        row(["Last active","Waiting for acceptance"]),
        row(["Open requests","3"])
      ])),
      modalSection("Open CPA Requests", `<div class="list">${listItem("Missing receipt","rcpt_003 — Unknown Zelle memo needs business purpose and vendor.","red")}${listItem("Worker classification","PAY-2026-002 worker type needs confirmation.","yellow")}${listItem("Quarter close package","CPA waiting for Q2 export approval from merchant.","blue")}</div>`),
      modalSection("Access Controls", `<div class="list">${modalCheck("Ledger (read-only)","CPA can view tax ledger entries.")}${modalCheck("Receipts","CPA can view OCR receipts and proof index.")}${modalCheck("Payout evidence","CPA can view payout screenshots.")}${modalCheck("Export / download","Disabled — requires per-export merchant approval.", false)}</div>`)
    ].join("")
  },
  "cpa-upload":{
    title:"Upload Files for CPA",
    body:"Send additional files, receipts, or explanations to your CPA workspace.",
    cta:"Upload to CPA Workspace",
    content:()=>[
      modalSection("File Details", modalGrid([
        modalSelect("File type",[["Receipt / proof image",true],["W-9 / W-4 form"],["Explanation memo"],["Bank statement"],["Other document"]]),
        modalField("Description","Business purpose memo for rcpt_003 Zelle payment."),
        modalSelect("Related record",[["rcpt_003",true],["PAY-2026-001"],["PAY-2026-002"],["Other"]]),
        modalSelect("CPA recipient",[["Nguyen CPA Group",true],["Internal bookkeeper"],["Tax partner"]])
      ])),
      modalSection("Upload", `<div class="panel-body"><div style="border:2px dashed #334155;border-radius:12px;padding:32px;text-align:center;color:#64748b;font-size:12px">Drag & drop or click to select file<br><small>PDF, PNG, JPG, XLSX — max 10MB</small></div></div>`),
      modalSection("Upload Rules", `<div class="list">${modalCheck("Log upload to audit trail","Record file name, actor, and timestamp.")}${modalCheck("Notify CPA by email","Send upload notification to CPA's registered email.")}</div>`)
    ].join("")
  },

  /* TIN VERIFICATION */
  "tin-verification":{
    title:"Verify TIN / W-4",
    body:"Start a TIN verification check, review masked SSN/token status, and confirm whether payroll finalization should be blocked.",
    cta:"Start Verification",
    content:()=>[
      modalSection("Employee Tax Identity", modalGrid([
        modalField("Employee","Jane A. Nguyen"),
        modalField("Employee ID","emp_1002"),
        modalField("Masked SSN","***-**-6789"),
        modalField("Token","tok_ssn_abc123"),
        modalSelect("W-4 year",[["2026",true],["2025"],["Missing"]]),
        modalField("Last updated","Jun 10, 2026")
      ])),
      modalSection("Blocking Policy", table(["Policy","Result"],[
        row(["TIN verification pending",status("Review")]),
        row(["W-4 current year",status("Ready")]),
        row(["Finalization mode","Warn unless strict mode enabled"])
      ])),
      modalSection("Required Actions", `<div class="list">${modalCheck("Send secure employee link","Employee can confirm tax profile without exposing full SSN.")}${modalCheck("Record verification audit","Store who initiated verification and final result.")}</div>`)
    ].join("")
  },

  /* AI ADVISOR */
  "ai-cfo":{
    title:"Ask AI CFO",
    body:"Open a guided finance prompt with payroll pressure, upcoming deposits, missing records, and recommended CPA questions.",
    cta:"Prepare Advice",
    content:()=>[
      modalSection("Question", modalField("Prompt","Review upcoming payroll, payout, rent, supplies, and tax pressure. Tell me what to do before quarter close.","textarea")),
      modalSection("Data AI CFO Can Use", `<div class="list">${modalCheck("Payroll and tax ledger","Use totals, due dates, and open exceptions.")}${modalCheck("Receipt OCR vault","Identify missing evidence and large expense categories.")}${modalCheck("GPS mileage","Suggest trips that need purpose notes.")}${modalCheck("CPA requests","Prioritize open review items.")}${modalCheck("Tip ledger","Include YTD tips in cash-flow analysis.")}</div>`),
      modalSection("Output Preview", table(["Advice Area","Example"],[
        row(["Cash flow","Reserve funds for Jun 24 federal deposit before discretionary payouts."]),
        row(["Tax cleanup","Resolve TIN pending and rcpt_003 purpose before exporting CPA package."]),
        row(["CPA questions","Ask CPA whether commute-like home-to-salon trip is deductible."])
      ]))
    ].join("")
  },

  /* TIP LEDGER MODALS */
  "add-tip":{
    title:"Add Tip",
    body:"Manually record a tip entry. All tips are timestamped and stored in your Tax IQ Tip Ledger.",
    cta:"Save Tip",
    afterOpen(modal){
      let selectedMethod = "Cash";
      // Method chip selection
      modal.querySelectorAll(".btn[data-toast^='Method:']").forEach(btn=>{
        btn.addEventListener("click", e=>{
          e.stopPropagation();
          selectedMethod = btn.textContent.trim();
          modal.querySelectorAll(".btn[data-toast^='Method:']").forEach(b=>b.classList.remove("primary"));
          btn.classList.add("primary");
        });
      });
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const amtInput = modal.querySelector("input.form-control");
        const amount   = (amtInput?.value||"$0.00").replace(/[^0-9.]/g,"");
        const service  = modal.querySelectorAll("select.form-control")[0]?.value || "Other";
        const date     = modal.querySelectorAll("input.form-control")[2]?.value || "2026-06-24";
        if(!parseFloat(amount)){ toast("Enter a tip amount before saving."); return; }
        const tipId = "tip_"+String(data.tips.length+1).padStart(3,"0");
        const now   = new Date().toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
        data.tips.unshift([tipId,date,selectedMethod,"$"+parseFloat(amount).toFixed(2),service,
          /Cash/.test(selectedMethod)?"CASH":"DIRECT","LIKELY_QUALIFIED",now,"None"]);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Tip saved: $"+parseFloat(amount).toFixed(2)+" via "+selectedMethod);
      });
    },
    content:()=>[
      modalSection("Tip Amount & Method", `<div class="panel-body"><label class="form-field" style="margin-bottom:12px"><span>Tip Amount</span><input class="form-control" style="font-size:28px;font-weight:900;height:56px;text-align:center" value="$0.00"></label><div class="grid-4" style="gap:8px">${["Cash","Zelle","Venmo","Cash App","Card/POS","QR","PayPal","Other"].map((m,i)=>`<button class="btn ${i===0?"primary":""}" data-toast="Method: ${m}">${m}</button>`).join("")}</div></div>`),
      modalSection("Service Details", modalGrid([
        modalSelect("Service type",[["Nail full set",true],["Pedicure"],["Manicure"],["Eyebrows"],["Lashes"],["Waxing"],["Facial"],["Other"]]),
        modalField("Service amount (optional)","$55.00"),
        modalField("Received date","2026-06-24"),
        modalField("Received time","Now")
      ])),
      modalSection("Compliance", `<div class="list">${modalCheck("This was a voluntary tip","Required for No Tax on Tips qualification.")}${modalCheck("This was NOT a mandatory service charge","Service charges are not qualified tips.")}</div>`),
      modalSection("Proof & Notes", modalGrid([
        modalSelect("Proof type",[["Screenshot",true],["Receipt photo"],["POS record"],["Cash note"],["None"]]),
        modalField("Note (optional)","Direct Zelle from customer — Jun 24 pedicure.")
      ])),
      modalSection("Disclaimer", `<div class="notice">Tax IQ records your tip for documentation purposes only. Final qualified status and deduction eligibility must be confirmed by your CPA or tax preparer.</div>`)
    ].join("")
  },
  "tip-detail":{
    title:"Tip Detail",
    body:"Full tip record including method, qualified status, proof, and complete audit history.",
    cta:"Edit Tip",
    content:()=>[
      modalSection("Tip Record", table(["Field","Value"],[
        row(["Tip ID","tip_002"]),
        row(["Date","Jun 24, 2026 2:15pm"]),
        row(["Method","Zelle"]),
        row(["Amount","$30.00"]),
        row(["Service","Manicure"]),
        row(["Source","DIRECT — customer paid technician directly"]),
        row(["Qualified Status",status("LIKELY_QUALIFIED")]),
        row(["Proof","screenshot attached"])
      ])),
      modalSection("Qualification Analysis", `<div class="list">${listItem("Voluntary tip — confirmed","Worker confirmed this was a voluntary tip, not a service charge.","green")}${listItem("Tipped occupation — nail technician","Occupation qualifies under IRS guidelines for No Tax on Tips.","green")}${listItem("Proof on file","Screenshot provides direct tip evidence.","green")}${listItem("Income limit check","Final eligibility subject to MAGI phase-out. Confirm with CPA.","yellow")}</div>`),
      modalSection("Audit History", table(["Time","Actor","Event"],[
        row(["Jun 24 2:15pm","likesaa (technician)","Tip created — method: Zelle"]),
        row(["Jun 24 2:15pm","system","Auto-classified as LIKELY_QUALIFIED"]),
        row(["Jun 24 2:16pm","system","Proof screenshot linked — tip_002_proof.png"])
      ]))
    ].join("")
  },
  "edit-tip":{
    title:"Edit Tip",
    body:"Update tip amount, method, or details. All edits are audit logged with before/after values.",
    cta:"Save Changes",
    content:()=>[
      modalSection("Tip Fields", modalGrid([
        modalField("Tip amount","$30.00"),
        modalSelect("Method",[["Zelle",true],["Cash"],["Venmo"],["Cash App"],["Card/POS"],["QR"],["Other"]]),
        modalSelect("Service type",[["Manicure",true],["Pedicure"],["Nail full set"],["Eyebrows"],["Lashes"],["Other"]]),
        modalField("Service amount","$45.00"),
        modalField("Received date","2026-06-24"),
        modalField("Received time","2:15pm")
      ])),
      modalSection("Compliance", `<div class="list">${modalCheck("Voluntary tip","Confirm tip was voluntary and not a service charge.")}${modalCheck("Proof on file","Confirm screenshot or proof is linked.")}</div>`),
      modalSection("Edit Reason", modalField("Required reason for edit","Correcting service type from 'Pedicure' to 'Manicure'.","textarea")),
      modalSection("Disclaimer", `<div class="notice">Edits are logged permanently in the audit trail. The original value is preserved before/after for CPA review.</div>`)
    ].join("")
  },

  /* SOFT DELETE MODALS */
  "delete-tip":{
    title:"Delete Tip Entry",
    body:"Soft delete only. The record is preserved in the audit log with actor, reason, and timestamp. No tax record is ever hard-deleted.",
    cta:"Delete Tip",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const reason = modal.querySelector("textarea")?.value?.trim();
        if(!reason){ toast("A deletion reason is required."); return; }
        const ctx = window._modalCtx||{};
        const id  = ctx.ctxId || data.tips[0]?.[0];
        const idx = data.tips.findIndex(t=>t[0]===id);
        if(idx>=0) data.tips.splice(idx,1);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Tip deleted (soft). Audit record preserved.");
      });
    },
    content:()=>[
      modalSection("Tip Being Deleted", table(["Field","Value"],[
        row(["Tip ID","tip_002"]),
        row(["Date","Jun 24, 2026 2:15pm"]),
        row(["Amount","$30.00 via Zelle"]),
        row(["Qualified Status",status("LIKELY_QUALIFIED")])
      ])),
      modalSection("Deletion Reason (Required)", modalField("Reason","Entered in error — duplicate entry for same Zelle transaction.","textarea")),
      modalSection("Policy", `<div class="list">${listItem("Soft delete only","Record is preserved in audit log. Hard deletion is not permitted for tax records.","red")}${listItem("Audit logged","Deletion actor, reason, and before-state are permanently stored.","blue")}${listItem("YTD adjusted","YTD tip total and cap progress will update immediately after deletion.","yellow")}</div>`)
    ].join("")
  },
  "delete-receipt":{
    title:"Delete Receipt",
    body:"Soft delete only. The receipt image and OCR data are preserved for audit. The record is removed from the active vault.",
    cta:"Delete Receipt",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const reason = modal.querySelector("textarea")?.value?.trim();
        if(!reason){ toast("A deletion reason is required."); return; }
        const ctx = window._modalCtx||{};
        const id  = ctx.ctxId || data.receipts[0]?.[0];
        const idx = data.receipts.findIndex(r=>r[0]===id);
        if(idx>=0) data.receipts.splice(idx,1);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Receipt deleted (soft). Image preserved in cold storage.");
      });
    },
    content:()=>[
      modalSection("Receipt Being Deleted", table(["Field","Value"],[
        row(["Receipt ID","rcpt_001"]),
        row(["Vendor","Beauty Supply Warehouse"]),
        row(["Amount","$384.20"]),
        row(["Status",status("Extracted")])
      ])),
      modalSection("Deletion Reason (Required)", modalField("Reason","Duplicate capture — original already stored from email import.","textarea")),
      modalSection("Policy", `<div class="list">${listItem("Image preserved","Original photo and OCR extraction are kept in cold storage.","blue")}${listItem("CPA impact","If this receipt is in an active CPA package, the package will flag the removal.","yellow")}${listItem("Audit logged","Deletion is recorded with before-state, actor, and reason.","red")}</div>`)
    ].join("")
  },
  "delete-trip":{
    title:"Delete Trip",
    body:"Soft delete only. GPS route and purpose are preserved in the audit log. The trip is removed from the active mileage deduction list.",
    cta:"Delete Trip",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const reason = modal.querySelector("textarea")?.value?.trim();
        if(!reason){ toast("A deletion reason is required."); return; }
        const ctx = window._modalCtx||{};
        const id  = ctx.ctxId || data.trips[0]?.[0];
        const idx = data.trips.findIndex(t=>t[0]===id);
        if(idx>=0) data.trips.splice(idx,1);
        document.getElementById("modalRoot").classList.remove("open");
        renderPage(); toast("Trip deleted (soft). GPS data preserved in audit log.");
      });
    },
    content:()=>[
      modalSection("Trip Being Deleted", table(["Field","Value"],[
        row(["Trip ID","trip_001"]),
        row(["Route","Home to salon — 18.4 mi"]),
        row(["Status",status("Needs CPA policy check")]),
        row(["Deduction estimate","~$12.33 removed from mileage total"])
      ])),
      modalSection("Deletion Reason (Required)", modalField("Reason","Commute route — CPA confirmed home-to-workplace is not deductible.","textarea")),
      modalSection("Policy", `<div class="list">${listItem("Soft delete only","GPS coordinates and trip data preserved in audit.","blue")}${listItem("Mileage adjusted","YTD deduction total updates when trip is removed.","yellow")}${listItem("Audit logged","Deletion is permanent and audit-trailed. Cannot be undone.","red")}</div>`)
    ].join("")
  },

  /* BILLING MODALS */
  "billing-plan":{
    title:"Plan & Feature Packaging",
    body:"Compare subscription plans and confirm which revenue model the product should support first.",
    cta:"Request Upgrade",
    content:()=>[
      modalSection("Recommended Business Model", table(["Model","Who Pays","When To Use","Architecture Impact"],[
        row(["Merchant subscription","Business owner / merchant","MVP and vertical nail/beauty rollout","Tenant billing, plan gates, invoice center"],{wrap:[2,3]}),
        row(["CPA marketplace referral","Merchant approves CPA estimate","CPA review and filing package add-on","CPA engagement approval, referral fee tracking"],{wrap:[2,3]}),
        row(["Partner API licensing","Payroll/accounting partner","Embedded Tax IQ in another platform","API metering, partner contract, webhook SLAs"],{wrap:[2,3]})
      ])),
      modalSection("Plan Comparison", table(["Plan","Price","Limit","Included Features","Best For"],data.plans.map(p=>row(p,{wrap:[3,4]})))),
      modalSection("Upgrade Approval", `<div class="list">${modalCheck("Show feature delta","Merchant sees what unlocks before upgrade.")}${modalCheck("Show prorated charge","Billing engine calculates current-cycle difference.")}${modalCheck("Require Terms acceptance","Plan change is audit logged with actor, timestamp, and accepted terms version.")}</div>`)
    ].join("")
  },
  "billing-approval":{
    title:"Billing Approval",
    body:"Review a subscription invoice or CPA estimate before approving payment.",
    cta:"Approve",
    content:()=>[
      modalSection("Invoice / Estimate", table(["Field","Value"],[
        row(["Invoice","inv_cpa_001"]),
        row(["Item","Nguyen CPA Group retainer"]),
        row(["Amount","$250.00"]),
        row(["Status",status("Pending approval")]),
        row(["Approver","Merchant owner"])
      ])),
      modalSection("Approval Rules", `<div class="list">${listItem("Merchant approval required","No CPA work starts until owner accepts the estimate or retainer.","yellow")}${listItem("Audit logged","Approval, rejection, and payment events are written to immutable audit log.","blue")}${listItem("Separate from subscription","CPA engagement cost is separate from Tax IQ monthly plan.","green")}</div>`),
      modalSection("Approval Note", modalField("Note","Approve retainer for Q2 CPA package review.","textarea"))
    ].join("")
  },

  /* API KEY MODAL */
  "create-api-key":{
    title:"Create API Key",
    body:"Generate a new API key for payroll system integration, report automation, or developer access. Keys are shown only once.",
    cta:"Generate Key",
    afterOpen(modal){
      modal.querySelector("#modalMainCta")?.addEventListener("click", e=>{
        e.stopPropagation();
        const inputs = modal.querySelectorAll("input.form-control");
        const name = (inputs[0]?.value||"").trim() || "New API Key";
        const env  = modal.querySelectorAll("select.form-control")[0]?.value || "Production (LIVE)";
        const scope= modal.querySelectorAll("select.form-control")[1]?.value || "Full access";
        const isLive = /production/i.test(env);
        const prefix = isLive ? "taxiq_live_" : "taxiq_test_";
        const newKey = prefix+[...Array(32)].map(()=>Math.floor(Math.random()*36).toString(36)).join("");
        const shortId= "key_"+(isLive?"live":"test")+"_"+Math.random().toString(36).slice(2,6);
        data.apiKeys.unshift([shortId,name,isLive?"LIVE":"TEST",scope,"Jun 24, 2026","Active","payroll_admin_44"]);
        // Show key in modal body
        const body = modal.querySelector(".modal-body");
        if(body){
          const notice = document.createElement("div");
          notice.style.cssText="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;margin-top:12px";
          notice.innerHTML=`<div style="color:#f8fafc;font-size:11px;font-weight:900;margin-bottom:8px">⚠️ Copy this key now — it will never be shown again</div><div style="font-family:monospace;font-size:11px;color:#a5f3fc;word-break:break-all;background:#020617;padding:10px;border-radius:6px">${newKey}</div><button class="${ui.btn}" style="margin-top:10px" data-copy="${newKey}">Copy Key</button>`;
          body.appendChild(notice);
          modal.querySelector("#modalMainCta").style.display="none";
        }
        renderPage(); toast("API key generated: "+shortId);
      });
    },
    content:()=>[
      modalSection("Key Configuration", modalGrid([
        modalField("Key name","CPA Export Automation"),
        modalSelect("Environment",[["Production (LIVE)",true],["Sandbox (TEST)"]]),
        modalSelect("Scopes",[["Full access",true],["Reports only"],["Read-only"],["Webhooks only"],["Payroll only"]]),
        modalSelect("Expiration",[["Never",true],["90 days"],["1 year"],["Custom"]])
      ])),
      modalSection("Security Controls", `<div class="list">${modalCheck("Restrict to IP allowlist","Limit key usage to known IP ranges. Requests from other IPs will be rejected.")}${modalCheck("Require webhook signing","Key can only be used with HMAC-verified endpoint configurations.")}${modalCheck("Log every API call","Record endpoint, actor, HTTP status, and timestamp for each request.")}${modalCheck("Alert on unusual usage","Notify admin if request volume or IP range changes unexpectedly.", false)}</div>`),
      modalSection("Important Notice", `<div class="notice">Your key will be shown only once after creation. Copy it to a secure secrets manager immediately. Tax IQ does not store unmasked key values. If lost, rotate the key from this settings page.</div>`)
    ].join("")
  }
};

function openModal(key){
  const config = modalCopy[key] || {
    title:"Workflow Detail",
    body:"Review and complete this Tax IQ workflow.",
    cta:"Continue",
    content:()=>modalSection("Details", `<div class="panel-body">No additional configuration is required for this workflow.</div>`)
  };
  const {title, body, cta} = config;
  if(!cta) return;
  const root = document.getElementById("modalRoot");
  root.innerHTML = `<div class="modal max-h-[88vh] w-full max-w-5xl overflow-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60"><div class="modal-head flex items-start justify-between gap-4 border-b border-slate-800 p-5"><div><h3 class="m-0 text-lg font-black text-slate-50">${title}</h3><p class="mt-1 text-xs text-slate-500">${body}</p></div><button class="${ui.btn}" data-close>Close</button></div><div class="modal-body p-5">${config.content()}</div><div class="modal-foot flex justify-end gap-2 border-t border-slate-800 px-5 py-4"><button class="${ui.btn}" data-close>Cancel</button><button class="${ui.btn} ${ui.primary}" id="modalMainCta" data-action-toast="${cta} queued.">${cta}</button></div></div>`;
  root.classList.add("open");
  if(config.afterOpen) config.afterOpen(root.querySelector(".modal"));
}
function toast(msg){
  const box = document.getElementById("toast");
  const item = document.createElement("div");
  item.textContent = msg;
  box.appendChild(item);
  setTimeout(()=>item.remove(),2600);
}

document.addEventListener("click", event=>{
  const linkRow = event.target.closest("[data-href]");
  if(linkRow) window.location.href = linkRow.dataset.href;
  const modalBtn = event.target.closest("[data-modal]");
  if(modalBtn){ window._modalCtx = Object.assign({},modalBtn.dataset); openModal(modalBtn.dataset.modal); }
  const close = event.target.closest("[data-close]");
  if(close){
    // stop any live camera stream
    document.querySelectorAll("#modalRoot video").forEach(v=>{
      if(v.srcObject){v.srcObject.getTracks().forEach(t=>t.stop());v.srcObject=null;}
    });
    const modal=document.querySelector("#modalRoot .modal");
    if(modal?._camStream) modal._camStream.stop();
    document.getElementById("modalRoot").classList.remove("open");
  }
  const msg = event.target.closest("[data-toast],[data-action-toast]");
  if(msg) toast(msg.dataset.toast || msg.dataset.actionToast);

  /* ── real action handlers ── */
  // Approve receipt
  const approveRcpt = event.target.closest("[data-approve-receipt]");
  if(approveRcpt){
    const r = data.receipts.find(x=>x[0]===approveRcpt.dataset.approveReceipt);
    if(r){ r[5]="Approved"; renderPage(); toast("Receipt approved: "+r[1]); }
  }
  // Resolve exception
  const resolveExc = event.target.closest("[data-resolve-exc]");
  if(resolveExc){
    const e = data.exceptions.find(x=>x[0]===resolveExc.dataset.resolveExc);
    if(e){ e[4]="Closed"; renderPage(); toast("Exception resolved: "+e[0]); }
  }
  // Mark single notification read
  const markRead = event.target.closest("[data-mark-read]");
  if(markRead){
    const n = data.notifications.find(x=>x.id===markRead.dataset.markRead);
    if(n){ n.read=true; renderPage(); toast("Notification marked as read."); }
  }
  // Mark all notifications read
  const markAll = event.target.closest("[data-mark-all-read]");
  if(markAll){ data.notifications.forEach(n=>n.read=true); renderPage(); toast("All notifications marked as read."); }
  // Clipboard copy
  const copyEl = event.target.closest("[data-copy]");
  if(copyEl){
    navigator.clipboard?.writeText(copyEl.dataset.copy).catch(()=>{});
    toast("Copied to clipboard: "+copyEl.dataset.copy.slice(0,40));
  }
  // Publish draft share link
  const publishShare = event.target.closest("[data-publish-share]");
  if(publishShare){
    const s = data.shareLinks.find(x=>x[0]===publishShare.dataset.publishShare);
    if(s){ s[4]="Active"; renderPage(); toast("Share link published: "+s[0]); }
  }
  // Revoke connection
  const revokeConn = event.target.closest("[data-revoke-conn]");
  if(revokeConn){
    const c = data.connections.find(x=>x[0]===revokeConn.dataset.revokeConn);
    if(c){ c[6]="Revoked"; renderPage(); toast("Connection revoked: "+c[1]); }
  }
  // Mark payout as paid
  const markPaid = event.target.closest("[data-mark-paid]");
  if(markPaid){
    const p = data.payouts.find(x=>x[0]===markPaid.dataset.markPaid);
    if(p){ p[7]="Confirmed"; renderPage(); toast("Payout confirmed: "+p[0]); }
  }
  // Revoke API key
  const revokeKey = event.target.closest("[data-revoke-key]");
  if(revokeKey){
    const k = data.apiKeys.find(x=>x[0]===revokeKey.dataset.revokeKey);
    if(k){ k[5]="Revoked"; renderPage(); toast("API key revoked."); }
  }
  // Rotate API key
  const rotateKey = event.target.closest("[data-rotate-key]");
  if(rotateKey){
    const k = data.apiKeys.find(x=>x[0]===rotateKey.dataset.rotateKey);
    if(k){
      const suffix = Math.random().toString(36).slice(2,6);
      k[0] = k[0].replace(/_[^_]+$/,"_"+suffix);
      k[4] = "Jun 24, 2026"; k[5] = "Active";
      renderPage(); toast("API key rotated. Save the new key ID immediately.");
    }
  }
});
document.addEventListener("input", event=>{
  if(event.target.id !== "globalSearch") return;
  const q = event.target.value.toLowerCase();
  document.querySelectorAll("tbody tr,.item").forEach(el=>{el.style.display = el.textContent.toLowerCase().includes(q) ? "" : "none";});
});
document.addEventListener("change", event=>{
  const sel = event.target.closest("select.form-control");
  if(!sel) return;
  const bar = sel.parentElement;
  const active = [...bar.querySelectorAll("select.form-control")]
    .map(s => s.value === s.options[0].text ? null : s.value.toLowerCase())
    .filter(Boolean);
  document.querySelectorAll("tbody tr, .item").forEach(el=>{
    el.style.display = !active.length || active.every(f => el.textContent.toLowerCase().includes(f)) ? "" : "none";
  });
});

renderShell(renderPage);
