const { currentPage, pageHref, renderShell, ui } = window.TaxIQLayout;

const tones = {
  green:"border-emerald-500 text-emerald-300 bg-emerald-500/10",
  cyan:"border-cyan-500 text-cyan-300 bg-cyan-500/10",
  yellow:"border-amber-500 text-amber-300 bg-amber-500/10",
  red:"border-rose-500 text-rose-300 bg-rose-500/10",
  blue:"border-indigo-500 text-indigo-300 bg-indigo-500/10"
};

const data = {
  metrics:[
    ["Total Gross Pay","$1.05M","Q2 payroll and bonus gross","green"],
    ["Tax Withheld","$193.3K","Federal/state employee taxes","cyan"],
    ["Open Exceptions","5","4 blocking strict mode","yellow"],
    ["Evidence Vault","3","Receipts and payout proofs","red"]
  ],
  runs:[
    ["pr_2026_06_15","Jun 1-14","Jun 19, 2026","Jun 24, 2026","142","$312,448","$54,621","18","Ledger Posted"],
    ["pr_2026_06_01","May 18-31","Jun 5, 2026","Jun 11, 2026","142","$309,882","$53,974","12","Ledger Posted"],
    ["pr_2026_05_15","May 1-17","May 22, 2026","May 28, 2026","139","$304,122","$53,061","42","Review Required"],
    ["pr_bonus_q2","Q2 Bonus","Jun 15, 2026","Jun 18, 2026","48","$124,000","$31,000","8","Ledger Posted"],
    ["pr_2026_07_01","Jun 15-28","Jul 3, 2026","Jul 8, 2026","144","$0","$0","-","Pending"],
    ["pr_correction_01","Correction","Jun 20, 2026","Jun 24, 2026","3","$4,840","$689","68","Validation Failed"]
  ],
  lineItems:[
    ["Jane A. Nguyen","Finance","$3,769.23","$3,449.23","$320.00","$698.89","$288.34","$2,750.34","Calculated"],
    ["Marcus Chen","Engineering","$4,230.77","$3,780.77","$450.00","$784.22","$312.31","$2,996.55","Calculated"],
    ["Sofia Reyes","Operations","$2,884.62","$2,634.62","$250.00","$535.11","$220.11","$2,149.51","Calculated"],
    ["David Kim","Sales","$3,461.54","$3,141.54","$320.00","$641.88","$268.80","$2,499.66","Needs Review"]
  ],
  employees:[
    ["Jane A. Nguyen","emp_1002","Finance","TX","TX","Pending","2026","Single","Jun 10, 2026","18"],
    ["Marcus Chen","emp_0891","Engineering","TX","TX","Verified","2026","Married filing jointly","May 28, 2026","10"],
    ["Sofia Reyes","emp_0334","Operations","TX","TX","Verified","2026","Single","Apr 16, 2026","8"],
    ["David Kim","emp_0112","Sales","TX","CA","Verified","2024","Head of household","Dec 20, 2024","35"],
    ["Noah Patel","emp_1441","Support","NY","NY","Missing","Missing","Unknown","Not started","61"]
  ],
  employers:[
    ["Acme Manufacturing LLC","biz_789","Manufacturing","142","FED, TX, CA","Semiweekly","Jun 24, 2026","99.8%","Active"],
    ["TechCorp Solutions Inc.","biz_1024","Software","387","FED, NY","Monthly","Jul 15, 2026","100%","Active"],
    ["Retail Partners Group","biz_2201","Retail","91","FED, TX","Monthly","Jul 15, 2026","74%","Degraded"]
  ],
  payouts:[
    ["PAY-2026-001","likesaa","NL501TESX","01-15 Jun","$250.00","Zelle","Tip + wage","Confirmed","1 image"],
    ["PAY-2026-002","anna","NL502ANNA","01-15 Jun","$180.00","Zelle","Tip","Pending","2 images"],
    ["PAY-2026-003","mai","NL503MAIV","01-10 Jun","$95.00","PayPal","Bonus","Confirmed","None"],
    ["PAY-2026-004","likesaa","NL501TESX","16-31 May","$715.00","Zelle","Wage + tip","Cancelled","1 image"]
  ],
  exceptions:[
    ["ex_001","WITHHOLDING_DISCREPANCY","High","Payroll","Open","pr_correction_01","Payroll submitted $690. Tax IQ expected $698.89."],
    ["ex_002","TIN_VERIFICATION_PENDING","Medium","HR","Open","Q2","6 employees have unverified SSN/TIN."],
    ["ex_003","W4_STALE","Medium","HR","Open","YTD","3 employees are still using 2024 W-4 forms."],
    ["ex_004","JURISDICTION_MISMATCH","Medium","Tax","Reviewing","pr_2026_05_15","Work CA vs residence TX for 2 employees."],
    ["ex_005","TAX_PROFILE_MISSING","Low","HR","Open","pr_2026_07_01","2 new hires are missing tax profiles."]
  ],
  ledger:[
    ["tle_001","pr_2026_06_15","Jane Nguyen","US-FED","federal_income_tax","$3,449.23","$410.55","$0","sha256:a1b2"],
    ["tle_002","pr_2026_06_15","Jane Nguyen","US-FED","social_security","$3,769.23","$233.69","$233.69","sha256:c3d4"],
    ["tle_003","pr_2026_06_15","Jane Nguyen","US-FED","medicare","$3,769.23","$54.65","$54.65","sha256:e5f6"],
    ["tle_006","pr_2026_05_15","David Kim","US-CA","ca_state_income_tax","$3,141.54","$314.15","$0","sha256:k1l2"]
  ],
  jurisdictions:[
    ["US-FED","Federal","$348,011","$148,238","Active","Semiweekly","Jun 24, 2026","8"],
    ["US-TX","Texas","$0","$48,821","Active","Quarterly","Jul 31, 2026","6"],
    ["US-CA","California","$112,440","$10,122","Review","Semiweekly","Jun 24, 2026","42"],
    ["US-NY","New York","$37,768","$4,603","Missing setup","Monthly","Jul 15, 2026","61"]
  ],
  forms:[
    ["W-2 Wage Summary","YTD 2026","142","Payroll ledger","Jan 31, 2027","Draft"],
    ["1099 Contractor Report","Q2 2026","18","Vendor ledger","Jan 31, 2027","Ready"],
    ["Federal 941 Worksheet","Q2 2026","1","Tax ledger","Jul 31, 2026","Ready"],
    ["Federal 940 FUTA Worksheet","YTD 2026","1","Employer tax ledger","Jan 31, 2027","Draft"],
    ["State SUTA Reconciliation","Q2 2026","3","State wage base ledger","Varies by state","Needs Review"]
  ],
  webhooks:[
    ["evt_01JZ006","tax_iq.ledger.posted","tenant_demo_001","1","Delivered","2 min ago","2 min ago"],
    ["evt_01JZ005","tax_iq.validation.warning","tenant_demo_001","1","Delivered","2 min ago","2 min ago"],
    ["evt_01JZ003","tax_iq.validation.failed","tenant_demo_001","3","Retrying","47 min ago","-"],
    ["evt_01JZ001","employee.tax_profile.validated","tenant_biz_1024","8","Dead Letter","5h ago","-"]
  ],
  receipts:[
    ["rcpt_001","Beauty Supply Warehouse","Supplies","$384.20","AI photo capture","Extracted","Owner"],
    ["rcpt_002","Phone utility bill","Utilities","$129.00","Email import","Needs Review","Bookkeeper"],
    ["rcpt_003","Unknown Zelle memo","Payment evidence","$250.00","Payout upload","Missing purpose","Finance"]
  ],
  shareLinks:[
    ["shr_001","CPA Review","Ledger + receipts","15 days","Active"],
    ["shr_002","Technician upload","Payout evidence only","Never","Active"],
    ["shr_003","Friend referral profile","Public business profile","15 days","Draft"]
  ],
  trips:[
    ["trip_001","Home to salon","18.4","Owner business commute review","Needs CPA policy check"],
    ["trip_002","Salon to supply store","7.8","Business supplies","Deduction candidate"],
    ["trip_003","Salon to bank","4.1","Cash deposit","Deduction candidate"]
  ],
  cpa:[
    ["Nguyen CPA Group","1099 package + receipt review","Invited","Waiting for portal acceptance"],
    ["Internal bookkeeper","Monthly close review","Connected","Review missing evidence"],
    ["Tax partner","Quarterly estimate","Requested","Owner approval required"]
  ],
  cpaRates:[
    ["Nguyen CPA Group","CPA firm","$185/hr","3.5 hr","$647.50","$250 retainer","Best for tax filing package"],
    ["Internal bookkeeper","Bookkeeper","$75/hr","2.0 hr","$150.00","No retainer","Best for monthly cleanup"],
    ["Tax partner","Tax preparer","$125/hr","1.5 hr","$187.50","$100 retainer","Best for quarterly estimate"]
  ]
};

function statusClass(v){return /posted|delivered|ready|active|verified|connected|confirmed|extracted|calculated|candidate/i.test(v) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 before:bg-emerald-400" : /review|pending|draft|retry|requested|watch|needs|invited/i.test(v) ? "border-amber-500/30 bg-amber-500/10 text-amber-300 before:bg-amber-400" : /failed|dead|missing|open|high|cancelled/i.test(v) ? "border-rose-500/30 bg-rose-500/10 text-rose-300 before:bg-rose-400" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 before:bg-indigo-400";}
function status(v){return `<span class="status inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-black before:block before:h-1.5 before:w-1.5 before:rounded-full ${statusClass(v)}">${v}</span>`;}
function metric([label,value,sub,color]){return `<div class="${ui.card} border-t-4 ${tones[color] || tones.blue} p-4"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;}
function table(headers, rows){
  return `<div class="${ui.tableWrap}"><table class="w-full border-collapse text-xs"><thead><tr>${headers.map(h=>`<th class="${ui.th}">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td class="${ui.td}" colspan="${headers.length}"><div class="empty">No records.</div></td></tr>`}</tbody></table></div>`;
}
function row(cells, opts={}){
  return `<tr class="${opts.click ? "clickable cursor-pointer hover:bg-slate-800/60" : "hover:bg-slate-800/30"}" ${opts.href ? `data-href="${opts.href}"` : ""}>${cells.map((c,i)=>`<td class="${ui.td} ${opts.wrap && i===opts.wrap ? "wrap whitespace-normal min-w-64" : ""}">${c}</td>`).join("")}</tr>`;
}
function panel(title, body, actions=""){return `<div class="${ui.panel}"><div class="${ui.panelHead}"><h3 class="text-sm font-black text-slate-100">${title}</h3><div class="actions">${actions}</div></div>${body}</div>`;}
function listItem(title,text,color="blue"){return `<div class="item flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"><span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color==="green"?"bg-emerald-400":color==="yellow"?"bg-amber-400":color==="red"?"bg-rose-400":"bg-indigo-400"}"></span><div><div class="item-title text-xs font-black text-slate-100">${title}</div><div class="item-text mt-1 text-xs leading-relaxed text-slate-400">${text}</div></div></div>`;}

const renderers = {
  dashboard:renderDashboard, analytics:renderAnalytics, employers:renderEmployers, employees:renderEmployees, "employee-profile":renderEmployeeProfile,
  "payroll-runs":renderRuns, "run-detail":renderRunDetail, connections:renderConnections, payouts:renderPayouts, ledger:renderLedger,
  exceptions:renderExceptions, jurisdictions:renderJurisdictions, forms:renderForms, "ai-advisor":renderAiAdvisor, ocr:renderOcr,
  "share-links":renderShareLinks, gps:renderGps, cpa:renderCpa, webhooks:renderWebhooks, settings:renderSettings
};

function renderPage(){
  document.getElementById("content").innerHTML = (renderers[currentPage] || renderDashboard)();
}

function renderDashboard(){
  const runRows = data.runs.slice(0,5).map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[5],r[6],r[7],status(r[8])],{click:true,href:pageHref("run-detail")}));
  const issues = data.exceptions.slice(0,4).map(e=>listItem(e[1],`${e[6]} Owner: ${e[3]}.`,e[2]==="High"?"red":"yellow")).join("");
  return `<div class="grid-4" style="margin-bottom:14px">${data.metrics.map(metric).join("")}</div><div class="split"><div>${panel("Recent Payroll Runs",table(["Run ID","Period","Pay Date","Gross","Tax","Risk","Status"],runRows),`<a class="btn" href="${pageHref("payroll-runs")}">View All</a>`)}</div>${panel("TaxIQ Issues",`<div class="panel-body list">${issues}</div>`,`<a class="btn" href="${pageHref("exceptions")}">Open Queue</a>`)}</div><div class="grid-3" style="margin-top:14px">${panel("AI Advisor",`<div class="panel-body">${listItem("AI CFO","Cash-flow and tax planning prompts are ready.","green")}</div>`,`<a class="btn" href="${pageHref("ai-advisor")}">Open</a>`)}${panel("OCR Vault",`<div class="panel-body">${listItem("Receipt Capture","3 evidence records are stored for review.","blue")}</div>`,`<a class="btn" href="${pageHref("ocr")}">Open</a>`)}${panel("Share Links",`<div class="panel-body">${listItem("Secure Links","CPA, technician, and profile links are active.","yellow")}</div>`,`<a class="btn" href="${pageHref("share-links")}">Open</a>`)}</div>`;
}
function renderAnalytics(){
  const riskRows = data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[7],status(r[8])]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Average Risk","24","Across scored runs","green"],["Webhook Success","99.7%","Current sample","cyan"],["Blocking Exceptions","4","Strict mode blockers","yellow"],["Missing Profiles","2","Tax profiles needed","red"]].map(metric).join("")}</div><div class="grid-2">${panel("Risk by Run",table(["Run","Period","Risk","Status"],riskRows))}${panel("Deposit Calendar",table(["Jurisdiction","Schedule","Next Due"],data.jurisdictions.map(j=>row([j[1],j[5],j[6]]))))}</div>`;
}
function renderEmployers(){return panel("Employers",table(["Employer","ID","Industry","Employees","Registrations","Deposit Schedule","Next Deposit","Health","Status"],data.employers.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],e[5],e[6],e[7],status(e[8])]))),`<button class="btn primary" data-modal="employer">Add Employer</button>`);}
function renderEmployees(){return panel("Employees",table(["Employee","ID","Dept","Residence","Work","TIN","W-4","Filing","Updated","Risk"],data.employees.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],status(e[5]),status(e[6]),e[7],e[8],e[9]],{click:true,href:pageHref("employee-profile")}))),`<button class="btn primary" data-modal="employee">Invite Employee</button>`);}
function renderEmployeeProfile(){
  return `<div class="detail"><div>${panel("Employee Summary",`<div class="panel-body"><div class="grid-2"><div class="card panel-body"><div class="label">Employee</div><div class="value" style="font-size:22px">Jane A. Nguyen</div><div class="sub">Finance - Acme Manufacturing LLC</div></div><div class="card panel-body"><div class="label">Tax Status</div><div class="value" style="font-size:22px">Pending</div><div class="sub">TIN verification in progress</div></div></div></div>`)}${panel("Payroll Tax History",table(["Run","Gross","Taxable","Employee Tax","Employer Tax","Net","Status"],data.lineItems.slice(0,3).map(i=>row(["pr_2026_06_15",i[2],i[3],i[5],i[6],i[7],status(i[8])]))))}</div><div>${panel("Tax Profile",`<div class="panel-body"><div class="row"><span>Form</span><span>W-4 2026</span></div><div class="row"><span>Filing</span><span>Single</span></div><div class="row"><span>SSN</span><span class="mono">***-**-6789</span></div><div class="row"><span>Token</span><span class="mono">tok_ssn_abc123</span></div><div class="notice">TIN verification is pending. Resolve before strict finalization.</div></div>`,`<button class="btn primary" data-modal="tin-verification">Verify TIN</button>`)}</div></div>`;
}
function renderRuns(){return panel("Payroll Runs",table(["Run ID","Period","Pay Date","Deposit Due","Employees","Gross","Tax","Risk","Status"],data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[3],r[4],r[5],r[6],r[7],status(r[8])],{click:true,href:pageHref("run-detail")}))),`<button class="btn primary" data-modal="create-run">Create Run</button>`);}
function renderRunDetail(){
  const steps=["Draft","Imported","Validated","Tax Preview","Approved","Finalized","Ledger Posted","Reported"].map((s,i)=>`<div class="step ${i<6?"done":i===6?"current":""}">${s}</div>`).join("");
  const checks=[["Schema and source integrity","Pass","142 employee records matched import checksum."],["TIN/W-4 readiness","Warn","1 TIN is pending with manual review note."],["Ledger reconciliation","Pass","Employee and employer taxes match posted ledger."]].map(c=>listItem(`${c[0]} ${status(c[1])}`,c[2],c[1]==="Pass"?"green":"yellow")).join("");
  return `<div class="actions" style="margin-bottom:14px"><a class="btn" href="${pageHref("payroll-runs")}">Back</a><button class="btn" data-modal="line-items">Line Items</button><button class="btn primary" data-modal="finalize">Finalize Run</button>${status("Ledger Posted")}</div><div class="steps">${steps}</div><div class="detail"><div>${panel("Validation Gate",`<div class="panel-body list">${checks}</div>`)}${panel("Line Items",table(["Employee","Dept","Gross","Taxable","Pre-tax","Employee Tax","Employer Tax","Net","Status"],data.lineItems.map(i=>row(i.map((v,idx)=>idx===8?status(v):v)))))}${panel("Tax Breakdown",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash"],data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1)]))))}</div><div>${panel("Run Summary",`<div class="panel-body"><div class="row"><span>Run ID</span><span class="mono">pr_2026_06_15</span></div><div class="row"><span>Gross Pay</span><span>$312,448</span></div><div class="row"><span>Employee Tax</span><span>$54,621</span></div><div class="row"><span>Employer Tax</span><span>$26,402</span></div><div class="row"><span>Deposit Due</span><span>Jun 24, 2026</span></div></div>`)}${panel("Audit Trail",`<div class="panel-body list">${listItem("Finalized payroll run","payroll_admin_44 - Validation passed with one warning.","green")}${listItem("Posted tax ledger","system - Generated immutable ledger entries.","blue")}</div>`)}</div></div>`;
}
function renderConnections(){return panel("Connections",`<div class="panel-body list">${data.employers.map(e=>listItem(e[0],`conn_nt_${e[1]} - client_credentials - webhook signed - Last sync: 6 min ago`,e[8]==="Active"?"green":"yellow")).join("")}</div>`,`<button class="btn primary" data-modal="connection">Add Connection</button>`);}
function renderPayouts(){return panel("Staff Payouts",table(["Payout","Worker","Staff ID","Period","Amount","Method","Type","Status","Evidence","Action"],data.payouts.map(p=>row([`<span class="mono">${p[0]}</span>`,...p.slice(1,7),status(p[7]),p[8],`<button class="btn" data-modal="payout-detail">Review</button>`]))),`<button class="btn primary" data-modal="payout">Create Payout</button>`);}
function renderLedger(){return panel("Tax Ledger",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash"],data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1)]))),`<button class="btn primary" data-modal="report">Download Report</button>`);}
function renderExceptions(){return panel("Exceptions Queue",`<div class="panel-body list">${data.exceptions.map(e=>listItem(`${e[1]} - ${status(e[4])}`,`${e[6]} Owner: ${e[3]}. Run: ${e[5]}.`,e[2]==="High"?"red":"yellow")).join("")}</div>`);}
function renderJurisdictions(){return `<div class="grid-2">${panel("Jurisdiction Summary",table(["ID","Name","Employee Tax","Employer Tax","Registration","Schedule","Next Due","Risk"],data.jurisdictions.map(j=>row([j[0],j[1],j[2],j[3],status(j[4]),j[5],j[6],j[7]]))))}${panel("US Payroll Tax Programs",table(["Program","Level","Agency","Forms"],[["Federal income tax withholding","Federal","IRS","W-4, 941, W-2"],["Social Security and Medicare","Federal","IRS","941, W-2"],["FUTA","Federal","IRS","940"],["State withholding","State","State revenue agencies","State returns"],["SUTA","State","State workforce agencies","SUTA wage reports"]].map(row)))}</div>`;}
function renderForms(){return panel("Forms & Reports",table(["Report","Period","Records","Source","Due","Status"],data.forms.map(f=>row([f[0],f[1],f[2],f[3],f[4],status(f[5])]))),`<button class="btn primary" data-modal="report">Generate Package</button>`);}
function renderAiAdvisor(){return `<div class="grid-4" style="margin-bottom:14px">${[["AI CFO","On","Cash-flow and tax prompts","green"],["Rule Watch","Concept","Official sources required","cyan"],["Deduction Lists","3","Industry reminders","yellow"],["Guided Help","Ready","Context support","red"]].map(metric).join("")}</div><div class="grid-2">${panel("AI CFO Prompt Starters",table(["Area","Prompt","Action"],[["Cash flow","Review upcoming payroll, payout, rent, supplies, and tax pressure.","Ask"],["Tax planning","Find missing records before quarter close.","Ask"],["Support","Explain what screen to use next when blocked.","Ask"]].map(r=>row([r[0],r[1],`<button class="btn primary" data-modal="ai-cfo">${r[2]}</button>`],{wrap:1}))))}${panel("Government Rule Watch",table(["Source","Topic","Impact","Next Action"],[["IRS / State agencies","Payroll and 1099 deadline monitor",status("Review"),"Connect official-source feed."],["State revenue agencies","Sales tax and local payroll changes",status("Watch"),"Map merchant location."],["Workforce agencies","Worker classification and SUTA notices",status("High"),"Create classification warning."]].map(row)))}</div>${panel("Industry Deduction Checklist",table(["Industry","Checklist Ideas"],[["Nail salon","Supplies, booth rent, merchant fees, towels, uniforms, licenses, insurance, software, marketing, mileage."],["Beauty business","Product inventory, training, equipment, booking software, business phone, client amenities, rent."],["Contractor","Tools, mileage, phone, home office, payment fees, tax prep, education, insurance."]].map(r=>row(r,{wrap:1}))))}`;
}
function renderOcr(){return `<div class="grid-4" style="margin-bottom:14px">${[["Stored Records","3","Bills and evidence","green"],["Needs Review","2","Manual category check","cyan"],["OCR Sources","4","Camera, email, upload, payout","yellow"],["Lost Receipt Risk","Low","Vault enabled","red"]].map(metric).join("")}</div>${panel("Receipt Vault + AI OCR",table(["ID","Vendor","Type","Amount","Source","Status","Owner"],data.receipts.map(r=>row([`<span class="mono">${r[0]}</span>`,...r.slice(1,5),status(r[5]),r[6]]))),`<button class="btn primary" data-modal="receipt">Capture Receipt</button>`)}${panel("OCR Review Fields",table(["Field","Purpose","Required"],[["Receipt image","Preserve evidence and run AI extraction.","When expense exists"],["Vendor / payee","Map expense to category and CPA package.","Yes"],["Business purpose","Explain deduction relevance.","Yes"]].map(row)))}`;
}
function renderShareLinks(){return `<div class="grid-4" style="margin-bottom:14px">${[["Active Links","2","Upload/review access","green"],["Default Expiry","15d","Can be never expire","cyan"],["QR Support","Yes","Same permission model","yellow"],["Audit Log","On","Every open/upload","red"]].map(metric).join("")}</div>${panel("Payout / Profile Share Links",table(["Link ID","Recipient","Access","Expires","Status","Action"],data.shareLinks.map(s=>row([`<span class="mono">${s[0]}</span>`,s[1],s[2],s[3],status(s[4]),`<button class="btn" data-modal="share-link-detail">View Link</button>`]))),`<button class="btn primary" data-modal="share-link">Create Link</button>`)}${panel("Share Link Rules",`<div class="panel-body list">${listItem("Upload-only","Recipient can upload receipts, W-9, payout evidence, or missing profile fields.","blue")}${listItem("Review-only","CPA or reviewer can inspect selected ledger and evidence records.","green")}${listItem("Expiration","Default is 15 days. Public profile links may never expire.","yellow")}</div>`)}`;
}
function renderGps(){return `<div class="grid-4" style="margin-bottom:14px">${[["Trips","3","Tracked or pending review","green"],["Total Miles","30.3","Prototype sample","cyan"],["Deduction Candidates","2","CPA should review","yellow"],["Policy Checks","1","Ambiguous route purpose","red"]].map(metric).join("")}</div>${panel("GPS Mileage Tracker",table(["Trip ID","Route","Miles","Purpose","Status"],data.trips.map(t=>row([`<span class="mono">${t[0]}</span>`,...t.slice(1,4),status(t[4])]))),`<button class="btn primary" data-modal="trip">Start Trip</button>`)}${panel("Mileage Data To Collect",table(["Field","Why It Matters","Required"],[["GPS start/end","Supports route evidence.","When mileage is claimed"],["Business purpose","Explains deduction relevance.","Yes"],["Vehicle profile","Supports owner/worker mileage records.","Recommended"]].map(row)))}`;
}
function renderCpa(){return `<div class="grid-4" style="margin-bottom:14px">${[["CPA Connections","3","Third-party firms","green"],["Est. Review Cost","$647.50","Example CPA package","cyan"],["Missing Evidence","4","Open CPA requests","yellow"],["Merchant Approval","Required","Before filing/export","red"]].map(metric).join("")}</div>${panel("Third-party CPA / Accountant Connections",table(["Firm","Scope","Status","Next Step"],data.cpa.map(c=>row([c[0],c[1],status(c[2]),c[3]]))),`<button class="btn primary" data-modal="cpa">Connect CPA Firm</button>`)}<div class="grid-2" style="margin-top:14px">${panel("Cost Preview Before Connecting",table(["Provider","Type","Rate","Est. Hours","Est. Total","Retainer","Best For"],data.cpaRates.map(r=>row(r))))}${panel("Tax Filing Review Workflow",table(["Step","Owner","Output","Status"],[
  ["1. Connect CPA / bookkeeper","Merchant","Secure portal invite + access scope",status("Invited")],
  ["2. Share merchant package","Tax IQ","Ledger, receipts, payouts, mileage, payroll reports",status("Ready")],
  ["3. CPA reviews records","CPA / accountant","Comments, missing-file requests, risk notes",status("Review")],
  ["4. Prepare filing package","CPA / accountant","Draft tax filing support package",status("Requested")],
  ["5. Merchant approval","Merchant","Approve export/share before final filing",status("Required")]
].map(row)))}</div><div class="grid-2" style="margin-top:14px">${panel("CPA Work Queue",`<div class="panel-body list">${listItem("Request missing receipt","rcpt_003 needs business purpose and clear vendor.","yellow")}${listItem("Review worker classification","Payout says wage but worker is 1099 contractor.","red")}${listItem("Prepare merchant filing package","Export payout, receipt, mileage, payroll, and Tax IQ ledger records for accountant review.","green")}${listItem("Merchant filing approval","CPA can prepare package, but merchant must approve final export/share action.","blue")}</div>`)}${panel("Pricing Rules",`<div class="panel-body list">${listItem("Preview before invite","Merchant sees hourly rate, estimated hours, retainer, and estimated total before connecting accountant.","green")}${listItem("Approval before billing","No CPA work starts until merchant approves the estimate or accepts a custom quote.","yellow")}${listItem("Actual bill may change","Final cost depends on missing records, filing complexity, and CPA scope changes.","blue")}</div>`)}</div>`;
}
function renderWebhooks(){return `<div class="grid-4" style="margin-bottom:14px">${[["Delivered","1,284","99.7% success rate","green"],["Pending","7","In delivery queue","cyan"],["Retrying","3","Next retry in 5 min","yellow"],["Dead Letter","1","Manual review required","red"]].map(metric).join("")}</div>${panel("Recent Events",table(["Event ID","Type","Tenant","Attempts","Status","Created","Delivered"],data.webhooks.map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],e[2],e[3],status(e[4]),e[5],e[6]]))),`<button class="btn primary" data-modal="webhook-retry">Retry Failed</button>`)}`;
}
function renderSettings(){return `<div class="grid-2">${panel("US Payroll Scope",`<div class="panel-body"><div class="row"><span>Country</span><span>United States</span></div><div class="row"><span>Tax levels</span><span>Federal, State, Local</span></div><div class="row"><span>Employee forms</span><span>W-4, W-2</span></div><div class="row"><span>Employer returns</span><span>941, 940, SUTA</span></div></div>`)}${panel("Role & Access",table(["Permission","Payroll Admin","CPA","Auditor"],[["Export data",status("Active"),status("Active"),status("Active")],["Finalize run",status("Active"),status("Missing"),status("Missing")],["Review package",status("Active"),status("Active"),status("Active")],["Manage settings",status("Active"),status("Missing"),status("Missing")]].map(row)))}${panel("Data Protection",`<div class="panel-body"><div class="row"><span>SSN/TIN storage</span><span>Tokenized</span></div><div class="row"><span>PII export approval</span><span>Required</span></div><div class="row"><span>Webhook signing</span><span>HMAC SHA-256</span></div><div class="row"><span>Audit retention</span><span>7 years</span></div></div>`)}${panel("Guided Help",`<div class="panel-body list">${listItem("First-time tour","Explain payroll, payout, Tax IQ, OCR, share links, GPS, CPA review.","blue")}${listItem("What next","Show recommended next action when a workflow is blocked.","green")}</div>`)}</div>`;}

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

const modalCopy = {
  "create-run":{
    title:"Create Payroll Run",
    body:"Open a new pay period, import line items, and run validation before approval.",
    cta:"Create Draft",
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
  employee:{
    title:"Invite Employee",
    body:"Send an employee self-service link for tax profile and W-4 collection.",
    cta:"Send Invite",
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
  employer:{
    title:"Add Employer",
    body:"Create business profile, locations, registrations, deposit schedule, and integration setup.",
    cta:"Save Employer",
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
  payout:{
    title:"Create Payout",
    body:"Record technician payout, method, type, period, evidence, and TaxIQ sync status.",
    cta:"Save Payout",
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
  report:{
    title:"Generate Report Package",
    body:"Build a CPA-ready package with ledger, payout, receipt, mileage, and report files.",
    cta:"Generate",
    content:()=>[
      modalSection("Package Scope", modalGrid([
        modalSelect("Report type",[["CPA year-end package",true],["Payroll run package"],["1099 support package"],["Mileage package"]]),
        modalSelect("Date range",[["Q2 2026",true],["YTD 2026"],["Custom range"]]),
        modalSelect("Format",[["PDF + CSV",true],["PDF only"],["CSV only"]]),
        modalSelect("PII mode",[["Masked SSN/TIN",true],["Full PII - approval required"]])
      ])),
      modalSection("Included Sections", `<div class="list">${modalCheck("Tax ledger","Employee and employer tax detail.")}${modalCheck("Payout ledger","Worker payouts, evidence, and classification.")}${modalCheck("Receipt OCR vault","Bills, invoices, receipts, categories, and proof index.")}${modalCheck("GPS mileage","Trip purpose and deduction candidates.")}</div>`),
      modalSection("Export Validation", table(["Check","Result"],[
        row(["Ledger totals reconcile",status("Ready")]),
        row(["Missing evidence flagged",status("Review")]),
        row(["Audit trail included",status("Ready")])
      ]))
    ].join("")
  },
  receipt:{
    title:"Capture Receipt",
    body:"Upload or take a photo. AI extracts vendor, amount, date, category, and confidence.",
    cta:"Queue OCR",
    content:()=>[
      modalSection("Upload Source", modalGrid([
        modalSelect("Source",[["Camera capture",true],["File upload"],["Email import"],["Payout evidence"]]),
        modalField("Owner","Owner"),
        modalField("Business purpose","Supplies for salon operations"),
        modalSelect("Initial category",[["Supplies",true],["Utilities"],["Payment evidence"],["Travel"],["Meals"]])
      ])),
      modalSection("AI Extraction Preview", table(["Field","Value","Confidence"],[
        row(["Vendor","Beauty Supply Warehouse","94%"]),
        row(["Amount","$384.20","91%"]),
        row(["Date","Jun 18, 2026","88%"]),
        row(["Category","Supplies","86%"])
      ])),
      modalSection("Review Rules", `<div class="list">${modalCheck("Require human review below 90% confidence","Low-confidence fields enter review queue.")}${modalCheck("Store original image","Keep source proof for CPA package and audit trail.")}${modalCheck("Detect duplicate receipt","Compare vendor, amount, date, and image hash.")}</div>`)
    ].join("")
  },
  "share-link":{
    title:"Create Share Link",
    body:"Choose recipient, access type, expiration, QR option, and audit controls.",
    cta:"Create Link",
    content:()=>[
      modalSection("Recipient & Access", modalGrid([
        modalSelect("Recipient type",[["CPA / tax preparer",true],["Technician"],["Friend/referral"],["External reviewer"]]),
        modalField("Recipient name","Nguyen CPA Group"),
        modalSelect("Access mode",[["Review-only",true],["Upload-only"],["Review + upload"]]),
        modalSelect("Expiration",[["15 days",true],["7 days"],["30 days"],["Never expires"]])
      ])),
      modalSection("Shared Data", `<div class="list">${modalCheck("Tax ledger summary","Share selected tax ledger entries.")}${modalCheck("Receipts and proof index","Allow recipient to review OCR evidence.")}${modalCheck("Payout evidence","Include payout records and screenshots.")}${modalCheck("Public profile QR","Only for non-sensitive business profile links.", false)}</div>`),
      modalSection("Security", modalGrid([
        modalSelect("Require passcode",[["Yes",true],["No"]]),
        modalSelect("Download permission",[["Disabled",true],["PDF only"],["PDF + CSV"]])
      ]))
    ].join("")
  },
  "share-link-detail":{
    title:"Share Link Detail",
    body:"View recipient access, expiration, upload permissions, QR behavior, and audit history before copying or disabling the link.",
    cta:"Copy Link",
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
  trip:{
    title:"Start GPS Trip",
    body:"Capture start/end, route, miles, vehicle, and business purpose for deduction review.",
    cta:"Start Tracking",
    content:()=>[
      modalSection("Trip Setup", modalGrid([
        modalField("Vehicle","2022 Toyota Sienna"),
        modalSelect("Trip type",[["Business supplies",true],["Client visit"],["Bank deposit"],["Commute review"],["Other"]]),
        modalField("Start location","Salon"),
        modalField("End location","Beauty Supply Warehouse"),
        modalField("Start time","Now"),
        modalField("Expected miles","7.8")
      ])),
      modalSection("Deduction Evidence", `<div class="list">${modalCheck("Capture GPS start/end","Required for route evidence.")}${modalCheck("Require business purpose","Needed before CPA package export.")}${modalCheck("Flag commute-like routes","Trips from home to regular workplace need CPA review.", false)}</div>`),
      modalSection("Estimate", table(["Metric","Value"],[
        row(["Mileage rate","IRS rate configured in settings"]),
        row(["Estimated miles","7.8"]),
        row(["Status",status("Deduction candidate")])
      ]))
    ].join("")
  },
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
      modalSection("Access Scope", `<div class="list">${modalCheck("Ledger and reports","Read-only access to Tax IQ ledger, payroll summaries, payout records, and generated reports.")}${modalCheck("Receipts and evidence vault","CPA can inspect OCR receipts, bills, invoices, payout screenshots, and proof index.")}${modalCheck("Comment and request files","CPA can request missing receipts, explanations, W-9/W-4 support, or business purpose notes.")}${modalCheck("Prepare filing package","CPA can organize draft filing package for merchant review.")}${modalCheck("Submit/file taxes directly","Disabled by default. Merchant approval and external CPA workflow required.", false)}</div>`),
      modalSection("Filing Package Checklist", table(["Package Area","Records Shared","Status"],[
        row(["Payroll / W-2 support","Payroll runs, employee tax ledger, forms summary",status("Ready")]),
        row(["1099 contractor support","Payout ledger, technician summaries, W-9 request status",status("Review")]),
        row(["Deductions evidence","OCR receipts, GPS mileage, business purpose notes",status("Open")]),
        row(["No Tax on Tips support","Tip ledger, proof archive, annual qualified-tip report",status("Ready")])
      ])),
      modalSection("Merchant Approval Rules", table(["Rule","Behavior"],[
        row(["Read-only default","CPA cannot edit merchant source records directly."]),
        row(["Export approval","CSV/full PII export requires merchant approval."]),
        row(["Filing decision","Tax IQ prepares support data; CPA/tax preparer makes filing judgment."]),
        row(["Audit trail","Every view, comment, request, export, and package generation is logged."])
      ])),
      modalSection("Open Requests", table(["Request","Status"],[
        row(["rcpt_003 business purpose",status("Open")]),
        row(["Worker classification review",status("Review")]),
        row(["Quarter package export",status("Ready")])
      ]))
    ].join("")
  },
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
  "ai-cfo":{
    title:"Ask AI CFO",
    body:"Open a guided finance prompt with payroll pressure, upcoming deposits, missing records, and recommended CPA questions.",
    cta:"Prepare Advice",
    content:()=>[
      modalSection("Question", modalField("Prompt","Review upcoming payroll, payout, rent, supplies, and tax pressure. Tell me what to do before quarter close.","textarea")),
      modalSection("Data AI CFO Can Use", `<div class="list">${modalCheck("Payroll and tax ledger","Use totals, due dates, and open exceptions.")}${modalCheck("Receipt OCR vault","Identify missing evidence and large expense categories.")}${modalCheck("GPS mileage","Suggest trips that need purpose notes.")}${modalCheck("CPA requests","Prioritize open review items.")}</div>`),
      modalSection("Output Preview", table(["Advice Area","Example"],[
        row(["Cash flow","Reserve funds for Jun 24 federal deposit before discretionary payouts."]),
        row(["Tax cleanup","Resolve TIN pending and rcpt_003 purpose before exporting CPA package."]),
        row(["CPA questions","Ask CPA whether commute-like home-to-salon trip is deductible."])
      ]))
    ].join("")
  },
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
  const root = document.getElementById("modalRoot");
  root.innerHTML = `<div class="modal max-h-[88vh] w-full max-w-5xl overflow-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60"><div class="modal-head flex items-start justify-between gap-4 border-b border-slate-800 p-5"><div><h3 class="m-0 text-lg font-black text-slate-50">${title}</h3><p class="mt-1 text-xs text-slate-500">${body}</p></div><button class="${ui.btn}" data-close>Close</button></div><div class="modal-body p-5">${config.content()}</div><div class="modal-foot flex justify-end gap-2 border-t border-slate-800 px-5 py-4"><button class="${ui.btn}" data-close>Cancel</button><button class="${ui.btn} ${ui.primary}" data-action-toast="${cta} queued.">${cta}</button></div></div>`;
  root.classList.add("open");
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
  if(modalBtn) openModal(modalBtn.dataset.modal);
  const close = event.target.closest("[data-close]");
  if(close) document.getElementById("modalRoot").classList.remove("open");
  const msg = event.target.closest("[data-toast],[data-action-toast]");
  if(msg) toast(msg.dataset.toast || msg.dataset.actionToast);
});
document.addEventListener("input", event=>{
  if(event.target.id !== "globalSearch") return;
  const q = event.target.value.toLowerCase();
  document.querySelectorAll("tbody tr,.item").forEach(el=>{el.style.display = el.textContent.toLowerCase().includes(q) ? "" : "none";});
});

renderShell(renderPage);
