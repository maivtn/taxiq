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
  ],
  tips:[
    ["tip_001","2026-06-24","Cash","$45.00","Pedicure","CASH","LIKELY_QUALIFIED","Jun 24 4:30pm","receipt_photo"],
    ["tip_002","2026-06-24","Zelle","$30.00","Manicure","DIRECT","LIKELY_QUALIFIED","Jun 24 2:15pm","screenshot"],
    ["tip_003","2026-06-23","Venmo","$20.00","Eyebrows","DIRECT","NEEDS_REVIEW","Jun 23 6:00pm","None"],
    ["tip_004","2026-06-23","Card/POS","$55.00","Nail Full Set","POS_OWNER_PAID","LIKELY_QUALIFIED","Jun 23 5:30pm","POS record"],
    ["tip_005","2026-06-22","Cash","$25.00","Pedicure","CASH","LIKELY_QUALIFIED","Jun 22 3:45pm","None"],
    ["tip_006","2026-06-20","Cash App","$40.00","Lashes","DIRECT","LIKELY_QUALIFIED","Jun 20 7:00pm","screenshot"]
  ],
  auditLog:[
    ["2026-06-24 16:30","payroll_admin_44","FINALIZED","payroll_run","pr_2026_06_15","Payroll run finalized with 1 TIN warning. Admin override noted."],
    ["2026-06-24 16:25","system","POSTED","tax_ledger","tle_001","Immutable ledger entries generated for pr_2026_06_15."],
    ["2026-06-24 10:22","payroll_admin_44","CREATED","share_link","shr_001","CPA review link created with 15-day expiry for Nguyen CPA Group."],
    ["2026-06-24 09:10","finance_user","UPDATED","payout","PAY-2026-001","Evidence image attached. Business purpose confirmed."],
    ["2026-06-23 15:00","system","WEBHOOK_DELIVERED","webhook_event","evt_01JZ006","tax_iq.ledger.posted delivered to tenant_demo_001."],
    ["2026-06-22 11:00","payroll_admin_44","EXPORTED","report","rpt_q2_2026","CPA report package generated: PDF + CSV for Q2 2026."],
    ["2026-06-21 09:45","system","WEBHOOK_FAILED","webhook_event","evt_01JZ001","employee.tax_profile.validated — dead letter after 8 attempts."],
    ["2026-06-20 09:00","hr_user","UPDATED","employee","emp_1002","TIN verification initiated. Secure link sent to employee."],
    ["2026-06-18 14:00","system","OCR_PROCESSED","receipt","rcpt_001","AI extraction completed with 94% confidence."],
    ["2026-06-18 09:30","payroll_admin_44","CREATED","connection","conn_nt_biz_789","Nexora Touch payroll connection added with webhook signing."],
    ["2026-06-15 18:21","owner_user","CREATED","payout","PAY-2026-001","Payout created for likesaa — $250 via Zelle."],
    ["2026-06-15 17:00","system","TIP_CLASSIFIED","tip_entry","tip_004","POS/card tip auto-classified as LIKELY_QUALIFIED."]
  ],
  taxEstimate:{
    ytdIncome:"$1,050,000",
    ytdWithheld:"$193,300",
    estimatedAnnual:"$4,200,000",
    estimatedTax:"$840,000",
    estimatedBalance:"$646,700",
    quarters:[
      ["Q1 2026","$252,000","$48,000","$50,400","Due","Paid","Apr 15, 2026"],
      ["Q2 2026","$298,000","$54,621","$59,600","Due Jul 15","Review","Jul 15, 2026"],
      ["Q3 2026 (est.)","$280,000","—","$56,000","Not yet","Pending","Sep 15, 2026"],
      ["Q4 2026 (est.)","$220,000","—","$44,000","Not yet","Pending","Jan 15, 2027"]
    ],
    byJurisdiction:[
      ["US-FED","Federal","$210,000","$48,000","$162,000","Semiweekly","High"],
      ["US-TX","Texas","$0","$48,821","—","Quarterly","Low"],
      ["US-CA","California","$59,600","$10,122","$49,478","Semiweekly","Medium"],
      ["US-NY","New York","$40,000","$4,603","$35,397","Monthly","Medium"]
    ]
  },
  connections:[
    ["conn_nt_biz789","Nexora Touch Payroll","biz_789","OAuth 2.0","HMAC SHA-256","payroll+employees+webhooks","Connected","2 min ago"],
    ["conn_hrcloud_biz1024","TechCorp HRIS","biz_1024","API Key","HMAC SHA-256","employees+webhooks","Connected","8 min ago"],
    ["conn_retail_biz2201","Retail Partners Payroll","biz_2201","API Key","HMAC SHA-256","payroll+webhooks","Degraded","47 min ago"],
    ["conn_qbo_biz789","QuickBooks Accounting","biz_789","OAuth 2.0","None","accounting+reports","Connected","1h ago"]
  ],
  notifications:[
    {id:"ntf_001",type:"DEPOSIT_ALERT",severity:"High",title:"Federal deposit due today — Jun 24",body:"$54,621 federal semiweekly deposit is due today. Ensure account is funded.",resource:"tax-estimate",at:"Jun 24 08:00",read:false},
    {id:"ntf_002",type:"EXCEPTION_OPEN",severity:"High",title:"5 exceptions require review",body:"4 blocking exceptions in strict mode. Next payroll run will be blocked.",resource:"exceptions",at:"Jun 24 07:45",read:false},
    {id:"ntf_003",type:"CPA_REQUEST",severity:"Medium",title:"CPA flagged missing receipt — rcpt_003",body:"Nguyen CPA Group requested business purpose for unknown Zelle memo $250.",resource:"cpa",at:"Jun 23 15:30",read:false},
    {id:"ntf_004",type:"TIN_PENDING",severity:"Medium",title:"TIN verification pending — 6 workers",body:"6 employees have unverified SSN/TIN. Strict mode run will be blocked.",resource:"employees",at:"Jun 23 09:00",read:true},
    {id:"ntf_005",type:"WEBHOOK_DEAD_LETTER",severity:"High",title:"Webhook dead letter — evt_01JZ001",body:"employee.tax_profile.validated failed after 8 attempts. Manual review required.",resource:"webhooks",at:"Jun 21 09:45",read:true},
    {id:"ntf_006",type:"TIP_CAP",severity:"Low",title:"No Tax on Tips — cap at 7.4% for likesaa",body:"$1,850 of $25,000 federal limit tracked for tax year 2026.",resource:"tip-ledger",at:"Jun 21 08:00",read:true}
  ],
  apiKeys:[
    ["key_live_a1b2","Production API Key","LIVE","Full access","Jun 1, 2026","Active","payroll_admin_44"],
    ["key_live_c3d4","CPA Report Export Key","LIVE","Reports only","Jun 18, 2026","Active","finance_user"],
    ["key_test_e5f6","Developer Sandbox Key","TEST","Full access","Jun 1, 2026","Active","payroll_admin_44"]
  ]
};

function statusClass(v){return /posted|delivered|ready|active|verified|connected|confirmed|extracted|calculated|candidate|qualified|paid/i.test(v) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 before:bg-emerald-400" : /review|pending|draft|retry|requested|watch|needs|invited|medium/i.test(v) ? "border-amber-500/30 bg-amber-500/10 text-amber-300 before:bg-amber-400" : /failed|dead|missing|open|high|cancelled/i.test(v) ? "border-rose-500/30 bg-rose-500/10 text-rose-300 before:bg-rose-400" : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 before:bg-indigo-400";}
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
function rowActions(...btns){return `<div class="flex gap-1 flex-nowrap">${btns.join("")}</div>`;}
function actionBtn(label, modal){return modal ? `<button class="${ui.btn}" data-modal="${modal}">${label}</button>` : `<button class="${ui.btn}" data-toast="${label} queued.">${label}</button>`;}
function filterBar(...selects){return `<div class="flex flex-wrap gap-2 mb-4">${selects.map(([label,opts])=>`<select class="form-control" style="width:auto;min-width:150px"><option>${label}</option>${opts.map(o=>`<option>${o}</option>`).join("")}</select>`).join("")}</div>`;}

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
  notifications:renderNotifications, settings:renderSettings
};

function renderPage(){
  document.getElementById("content").innerHTML = (renderers[currentPage] || renderDashboard)();
}

/* ─── DASHBOARD ─── */
function renderDashboard(){
  const runRows = data.runs.slice(0,5).map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[5],r[6],r[7],status(r[8])],{click:true,href:pageHref("run-detail")}));
  const issues = data.exceptions.slice(0,4).map(e=>listItem(e[1],`${e[6]} Owner: ${e[3]}.`,e[2]==="High"?"red":"yellow")).join("");
  return `<div class="grid-4" style="margin-bottom:14px">${data.metrics.map(metric).join("")}</div><div class="split"><div>${panel("Recent Payroll Runs",table(["Run ID","Period","Pay Date","Gross","Tax","Risk","Status"],runRows),`<a class="btn" href="${pageHref("payroll-runs")}">View All</a>`)}</div>${panel("TaxIQ Issues",`<div class="panel-body list">${issues}</div>`,`<a class="btn" href="${pageHref("exceptions")}">Open Queue</a>`)}</div><div class="grid-3" style="margin-top:14px">${panel("AI Advisor",`<div class="panel-body">${listItem("AI CFO","Cash-flow and tax planning prompts are ready.","green")}</div>`,`<a class="btn" href="${pageHref("ai-advisor")}">Open</a>`)}${panel("OCR Vault",`<div class="panel-body">${listItem("Receipt Capture","3 evidence records are stored for review.","blue")}</div>`,`<a class="btn" href="${pageHref("ocr")}">Open</a>`)}${panel("Share Links",`<div class="panel-body">${listItem("Secure Links","CPA, technician, and profile links are active.","yellow")}</div>`,`<a class="btn" href="${pageHref("share-links")}">Open</a>`)}</div>`;
}

/* ─── ANALYTICS ─── */
function renderAnalytics(){
  const riskRows = data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[7],status(r[8])]));
  return `${filterBar(["All periods",["Q1 2026","Q2 2026","YTD 2026"]],["All employers",["Acme Manufacturing LLC","TechCorp Solutions Inc.","Retail Partners Group"]])}<div class="grid-4" style="margin-bottom:14px">${[["Average Risk","24","Across scored runs","green"],["Webhook Success","99.7%","Current sample","cyan"],["Blocking Exceptions","4","Strict mode blockers","yellow"],["Missing Profiles","2","Tax profiles needed","red"]].map(metric).join("")}</div><div class="grid-2">${panel("Risk by Run",table(["Run","Period","Risk","Status"],riskRows))}${panel("Deposit Calendar",table(["Jurisdiction","Schedule","Next Due"],data.jurisdictions.map(j=>row([j[1],j[5],j[6]]))))}</div>`;
}

/* ─── EMPLOYERS ─── */
function renderEmployers(){
  const empRows = data.employers.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],e[5],e[6],e[7],status(e[8]),rowActions(actionBtn("Edit","edit-employer"),actionBtn("Registrations","employer-registrations"))]));
  return panel("Employers",table(["Employer","ID","Industry","Employees","Registrations","Deposit Schedule","Next Deposit","Health","Status","Actions"],empRows),`<button class="btn primary" data-modal="employer">Add Employer</button>`);
}

/* ─── EMPLOYEES ─── */
function renderEmployees(){
  return `${filterBar(["All TIN statuses",["Verified","Pending","Missing"]],["All W-4 years",["2026","2024","Missing"]],["All departments",["Finance","Engineering","Operations","Sales","Support"]])}${panel("Employees",table(["Employee","ID","Dept","Residence","Work","TIN","W-4","Filing","Updated","Risk"],data.employees.map(e=>row([e[0],`<span class="mono">${e[1]}</span>`,e[2],e[3],e[4],status(e[5]),status(e[6]),e[7],e[8],e[9]],{click:true,href:pageHref("employee-profile")}))),`<button class="btn primary" data-modal="employee">Invite Employee</button> <button class="btn" data-toast="Employee roster exported.">Export Roster</button>`)}`;
}

/* ─── EMPLOYEE PROFILE ─── */
function renderEmployeeProfile(){
  return `<div class="detail"><div>${panel("Employee Summary",`<div class="panel-body"><div class="grid-2"><div class="card panel-body"><div class="label">Employee</div><div class="value" style="font-size:22px">Jane A. Nguyen</div><div class="sub">Finance - Acme Manufacturing LLC</div></div><div class="card panel-body"><div class="label">Tax Status</div><div class="value" style="font-size:22px">Pending</div><div class="sub">TIN verification in progress</div></div></div></div>`,`${actionBtn("Edit Profile","edit-employee")} ${actionBtn("Resend Invite","")}`)}${panel("Payroll Tax History",table(["Run","Gross","Taxable","Employee Tax","Employer Tax","Net","Status"],data.lineItems.slice(0,3).map(i=>row(["pr_2026_06_15",i[2],i[3],i[5],i[6],i[7],status(i[8])]))))}</div><div>${panel("Tax Profile",`<div class="panel-body"><div class="row"><span>Form</span><span>W-4 2026</span></div><div class="row"><span>Filing</span><span>Single</span></div><div class="row"><span>SSN</span><span class="mono">***-**-6789</span></div><div class="row"><span>Token</span><span class="mono">tok_ssn_abc123</span></div><div class="notice">TIN verification is pending. Resolve before strict finalization.</div></div>`,`${actionBtn("Verify TIN","tin-verification")} ${actionBtn("Edit Tax Status","edit-tax-status")}`)}${panel("Recent Tips",`<div class="panel-body">${listItem("Tip Ledger","Worker has 6 tip entries this month. YTD: $215 tracked.","green")}</div>`,`<a class="btn" href="${pageHref("tip-ledger")}">View Ledger</a>`)}</div></div>`;
}

/* ─── PAYROLL RUNS ─── */
function renderRuns(){
  return `${filterBar(["All statuses",["Ledger Posted","Review Required","Pending","Validation Failed"]],["All employers",["Acme Manufacturing LLC","TechCorp Solutions Inc.","Retail Partners Group"]])}${panel("Payroll Runs",table(["Run ID","Period","Pay Date","Deposit Due","Employees","Gross","Tax","Risk","Status"],data.runs.map(r=>row([`<span class="mono">${r[0]}</span>`,r[1],r[2],r[3],r[4],r[5],r[6],r[7],status(r[8])],{click:true,href:pageHref("run-detail")}))),`<button class="btn primary" data-modal="create-run">Create Run</button>`)}`;
}

/* ─── RUN DETAIL ─── */
function renderRunDetail(){
  const steps=["Draft","Imported","Validated","Tax Preview","Approved","Finalized","Ledger Posted","Reported"].map((s,i)=>`<div class="step ${i<6?"done":i===6?"current":""}">${s}</div>`).join("");
  const checks=[["Schema and source integrity","Pass","142 employee records matched import checksum."],["TIN/W-4 readiness","Warn","1 TIN is pending with manual review note."],["Ledger reconciliation","Pass","Employee and employer taxes match posted ledger."]].map(c=>listItem(`${c[0]} ${status(c[1])}`,c[2],c[1]==="Pass"?"green":"yellow")).join("");
  return `<div class="actions" style="margin-bottom:14px"><a class="btn" href="${pageHref("payroll-runs")}">Back</a><button class="btn" data-modal="line-items">Line Items</button><button class="btn" data-toast="Run cancelled. Reason required.">Cancel Run</button><button class="btn primary" data-modal="finalize">Finalize Run</button>${status("Ledger Posted")}</div><div class="steps">${steps}</div><div class="detail"><div>${panel("Validation Gate",`<div class="panel-body list">${checks}</div>`)}${panel("Line Items",table(["Employee","Dept","Gross","Taxable","Pre-tax","Employee Tax","Employer Tax","Net","Status"],data.lineItems.map(i=>row(i.map((v,idx)=>idx===8?status(v):v)))))}${panel("Tax Breakdown",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash","Action"],data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1,l.length-1),`<span class="mono text-[10px] text-slate-600">${l[l.length-1]}</span>`,actionBtn("Verify","verify-hash")]))))}</div><div>${panel("Run Summary",`<div class="panel-body"><div class="row"><span>Run ID</span><span class="mono">pr_2026_06_15</span></div><div class="row"><span>Gross Pay</span><span>$312,448</span></div><div class="row"><span>Employee Tax</span><span>$54,621</span></div><div class="row"><span>Employer Tax</span><span>$26,402</span></div><div class="row"><span>Deposit Due</span><span>Jun 24, 2026</span></div></div>`)}${panel("Audit Trail",`<div class="panel-body list">${listItem("Finalized payroll run","payroll_admin_44 - Validation passed with one warning.","green")}${listItem("Posted tax ledger","system - Generated immutable ledger entries.","blue")}</div>`,`<a class="btn" href="${pageHref("audit-log")}">Full Audit Log</a>`)}</div></div>`;
}

/* ─── CONNECTIONS ─── */
function renderConnections(){
  const connRows = data.connections.map(c=>row([`<span class="mono">${c[0]}</span>`,c[1],c[2],c[3],c[4],c[5],status(c[6]),c[7],rowActions(actionBtn("Test","test-connection"),actionBtn("Edit","edit-connection"),actionBtn("Revoke",""))]));
  return `${filterBar(["All statuses",["Connected","Degraded"]],["All auth",["OAuth 2.0","API Key"]])}${panel("Connections",table(["Conn ID","Name","Employer","Auth","Signing","Scopes","Status","Last Sync","Actions"],connRows),`<button class="btn primary" data-modal="connection">Add Connection</button>`)}`;
}

/* ─── PAYOUTS ─── */
function renderPayouts(){
  return `${filterBar(["All periods",["Jun 1-15","May 16-31","May 1-15"]],["All methods",["Zelle","PayPal","Cash","ACH","Check"]],["All statuses",["Confirmed","Pending","Cancelled"]])}<div style="display:flex;justify-content:flex-end;margin-bottom:10px">${actionBtn("Export CSV","")}</div>${panel("Staff Payouts",table(["Payout","Worker","Staff ID","Period","Amount","Method","Type","Status","Evidence","Actions"],data.payouts.map(p=>row([`<span class="mono">${p[0]}</span>`,...p.slice(1,7),status(p[7]),p[8],rowActions(actionBtn("Review","payout-detail"),actionBtn("Mark Paid",""),actionBtn("Dispute",""))]))),`<button class="btn primary" data-modal="payout">Create Payout</button>`)}`;
}

/* ─── TAX LEDGER ─── */
function renderLedger(){
  const ledRows = data.ledger.map(l=>row([`<span class="mono">${l[0]}</span>`,...l.slice(1,l.length-1),`<span class="mono text-[10px] text-slate-600">${l[l.length-1]}</span>`,actionBtn("Verify","verify-hash")]));
  return `${filterBar(["All jurisdictions",["US-FED","US-TX","US-CA","US-NY"]],["All types",["federal_income_tax","social_security","medicare","ca_state_income_tax"]],["All runs",["pr_2026_06_15","pr_2026_06_01","pr_2026_05_15"]])}${panel("Tax Ledger",table(["Entry","Run","Employee","Jurisdiction","Type","Taxable","Employee Tax","Employer Tax","Hash","Action"],ledRows),`<button class="btn primary" data-modal="report">Download Report</button>`)}`;
}

/* ─── EXCEPTIONS ─── */
function renderExceptions(){
  const exRows = data.exceptions.map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],status(e[2]),e[3],status(e[4]),e[5],e[6],rowActions(actionBtn("Resolve","resolve-exception"),actionBtn("Assign",""),actionBtn("Note",""))],{wrap:6}));
  return `${filterBar(["All statuses",["Open","Reviewing","Closed"]],["All severities",["High","Medium","Low"]],["All owners",["Payroll","HR","Tax"]])}${panel("Exceptions Queue",table(["ID","Type","Severity","Owner","Status","Run","Description","Actions"],exRows))}`;
}

/* ─── JURISDICTIONS ─── */
function renderJurisdictions(){
  const jRows = data.jurisdictions.map(j=>row([j[0],j[1],j[2],j[3],status(j[4]),j[5],j[6],j[7],rowActions(actionBtn("Edit","edit-jurisdiction"),actionBtn("Sync",""))]));
  return `<div class="grid-2">${panel("Jurisdiction Summary",table(["ID","Name","Employee Tax","Employer Tax","Registration","Schedule","Next Due","Risk","Actions"],jRows))}${panel("US Payroll Tax Programs",table(["Program","Level","Agency","Forms"],[["Federal income tax withholding","Federal","IRS","W-4, 941, W-2"],["Social Security and Medicare","Federal","IRS","941, W-2"],["FUTA","Federal","IRS","940"],["State withholding","State","State revenue agencies","State returns"],["SUTA","State","State workforce agencies","SUTA wage reports"]].map(row)))}</div>`;
}

/* ─── FORMS & REPORTS ─── */
function renderForms(){
  const formRows = data.forms.map(f=>row([f[0],f[1],f[2],f[3],f[4],status(f[5]),rowActions(actionBtn("Preview","preview-form"),actionBtn("Share","share-form"),actionBtn("Download",""),actionBtn("Archive",""))]));
  return `${filterBar(["All types",["W-2","1099","941","940","SUTA"]],["All periods",["YTD 2026","Q2 2026"]],["All statuses",["Ready","Draft","Needs Review"]])}${panel("Forms & Reports",table(["Report","Period","Records","Source","Due","Status","Actions"],formRows),`<button class="btn primary" data-modal="report">Generate Package</button>`)}`;
}

/* ─── AI ADVISOR ─── */
function renderAiAdvisor(){return `<div class="grid-4" style="margin-bottom:14px">${[["AI CFO","On","Cash-flow and tax prompts","green"],["Rule Watch","Concept","Official sources required","cyan"],["Deduction Lists","3","Industry reminders","yellow"],["Guided Help","Ready","Context support","red"]].map(metric).join("")}</div><div class="grid-2">${panel("AI CFO Prompt Starters",table(["Area","Prompt","Action"],[["Cash flow","Review upcoming payroll, payout, rent, supplies, and tax pressure.","Ask"],["Tax planning","Find missing records before quarter close.","Ask"],["Support","Explain what screen to use next when blocked.","Ask"]].map(r=>row([r[0],r[1],`<button class="btn primary" data-modal="ai-cfo">${r[2]}</button>`],{wrap:1}))))}${panel("Government Rule Watch",table(["Source","Topic","Impact","Next Action"],[["IRS / State agencies","Payroll and 1099 deadline monitor",status("Review"),"Connect official-source feed."],["State revenue agencies","Sales tax and local payroll changes",status("Watch"),"Map merchant location."],["Workforce agencies","Worker classification and SUTA notices",status("High"),"Create classification warning."]].map(row)))}</div>${panel("Industry Deduction Checklist",table(["Industry","Checklist Ideas"],[["Nail salon","Supplies, booth rent, merchant fees, towels, uniforms, licenses, insurance, software, marketing, mileage."],["Beauty business","Product inventory, training, equipment, booking software, business phone, client amenities, rent."],["Contractor","Tools, mileage, phone, home office, payment fees, tax prep, education, insurance."]].map(r=>row(r,{wrap:1}))))}`;
}

/* ─── OCR VAULT ─── */
function renderOcr(){
  const receiptRows = data.receipts.map(r=>row([`<span class="mono">${r[0]}</span>`,...r.slice(1,5),status(r[5]),r[6],rowActions(actionBtn("View","view-receipt"),actionBtn("Edit","edit-receipt"),actionBtn("Approve",""),actionBtn("Delete","delete-receipt"))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Stored Records","3","Bills and evidence","green"],["Needs Review","2","Manual category check","cyan"],["OCR Sources","4","Camera, email, upload, payout","yellow"],["Lost Receipt Risk","Low","Vault enabled","red"]].map(metric).join("")}</div>${panel("Receipt Vault + AI OCR",table(["ID","Vendor","Type","Amount","Source","Status","Owner","Actions"],receiptRows),`<button class="btn primary" data-modal="receipt">Capture Receipt</button>`)}${panel("OCR Review Fields",table(["Field","Purpose","Required"],[["Receipt image","Preserve evidence and run AI extraction.","When expense exists"],["Vendor / payee","Map expense to category and CPA package.","Yes"],["Business purpose","Explain deduction relevance.","Yes"]].map(row)))}`;
}

/* ─── SHARE LINKS ─── */
function renderShareLinks(){
  const linkRows = data.shareLinks.map(s=>row([`<span class="mono">${s[0]}</span>`,s[1],s[2],s[3],status(s[4]),rowActions(actionBtn("View","share-link-detail"),actionBtn("Copy",""),actionBtn("QR","share-link-qr"),actionBtn("Revoke","revoke-share-link"))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Active Links","2","Upload/review access","green"],["Default Expiry","15d","Can be never expire","cyan"],["QR Support","Yes","Same permission model","yellow"],["Audit Log","On","Every open/upload","red"]].map(metric).join("")}</div>${panel("Payout / Profile Share Links",table(["Link ID","Recipient","Access","Expires","Status","Actions"],linkRows),`<button class="btn primary" data-modal="share-link">Create Link</button>`)}${panel("Share Link Rules",`<div class="panel-body list">${listItem("Upload-only","Recipient can upload receipts, W-9, payout evidence, or missing profile fields.","blue")}${listItem("Review-only","CPA or reviewer can inspect selected ledger and evidence records.","green")}${listItem("Expiration","Default is 15 days. Public profile links may never expire.","yellow")}</div>`)}`;
}

/* ─── GPS MILEAGE ─── */
function renderGps(){
  const tripRows = data.trips.map(t=>row([`<span class="mono">${t[0]}</span>`,...t.slice(1,4),status(t[4]),rowActions(actionBtn("View","view-trip"),actionBtn("Edit","edit-trip"),actionBtn("Mark Reviewed",""),actionBtn("Delete","delete-trip"))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Trips","3","Tracked or pending review","green"],["Total Miles","30.3","Prototype sample","cyan"],["Deduction Candidates","2","CPA should review","yellow"],["Policy Checks","1","Ambiguous route purpose","red"]].map(metric).join("")}</div>${panel("GPS Mileage Tracker",table(["Trip ID","Route","Miles","Purpose","Status","Actions"],tripRows),`<button class="btn primary" data-modal="trip">Start Trip</button>`)}${panel("Mileage Data To Collect",table(["Field","Why It Matters","Required"],[["GPS start/end","Supports route evidence.","When mileage is claimed"],["Business purpose","Explains deduction relevance.","Yes"],["Vehicle profile","Supports owner/worker mileage records.","Recommended"]].map(row)))}`;
}

/* ─── CPA REVIEW ─── */
function renderCpa(){
  const cpaRows = data.cpa.map(c=>row([c[0],c[1],status(c[2]),c[3],rowActions(actionBtn("Portal","cpa-portal"),actionBtn("Upload","cpa-upload"),actionBtn("Revoke",""))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["CPA Connections","3","Third-party firms","green"],["Est. Review Cost","$647.50","Example CPA package","cyan"],["Missing Evidence","4","Open CPA requests","yellow"],["Merchant Approval","Required","Before filing/export","red"]].map(metric).join("")}</div>${panel("Third-party CPA / Accountant Connections",table(["Firm","Scope","Status","Next Step","Actions"],cpaRows),`<button class="btn primary" data-modal="cpa">Connect CPA Firm</button>`)}<div class="grid-2" style="margin-top:14px">${panel("Cost Preview Before Connecting",table(["Provider","Type","Rate","Est. Hours","Est. Total","Retainer","Best For"],data.cpaRates.map(r=>row(r))))}${panel("Tax Filing Review Workflow",table(["Step","Owner","Output","Status"],[["1. Connect CPA / bookkeeper","Merchant","Secure portal invite + access scope",status("Invited")],["2. Share merchant package","Tax IQ","Ledger, receipts, payouts, mileage, payroll reports",status("Ready")],["3. CPA reviews records","CPA / accountant","Comments, missing-file requests, risk notes",status("Review")],["4. Prepare filing package","CPA / accountant","Draft tax filing support package",status("Requested")],["5. Merchant approval","Merchant","Approve export/share before final filing",status("Required")]].map(row)))}</div><div class="grid-2" style="margin-top:14px">${panel("CPA Work Queue",`<div class="panel-body list">${listItem("Request missing receipt","rcpt_003 needs business purpose and clear vendor.","yellow")}${listItem("Review worker classification","Payout says wage but worker is 1099 contractor.","red")}${listItem("Prepare merchant filing package","Export payout, receipt, mileage, payroll, and Tax IQ ledger records for accountant review.","green")}${listItem("Merchant filing approval","CPA can prepare package, but merchant must approve final export/share action.","blue")}</div>`)}${panel("Pricing Rules",`<div class="panel-body list">${listItem("Preview before invite","Merchant sees hourly rate, estimated hours, retainer, and estimated total before connecting accountant.","green")}${listItem("Approval before billing","No CPA work starts until merchant approves the estimate or accepts a custom quote.","yellow")}${listItem("Actual bill may change","Final cost depends on missing records, filing complexity, and CPA scope changes.","blue")}</div>`)}</div>`;
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
  const jRows = d.byJurisdiction.map(j=>row([j[0],j[1],j[2],j[3],j[4],j[5],status(j[6])]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Est. Annual Tax","$840,000","Federal + state combined","red"],["YTD Withheld","$193,300","Through Jun 2026","green"],["Estimated Balance","$646,700","Subject to withholding changes","yellow"],["Next Deposit","Jun 24, 2026","Federal semiweekly","cyan"]].map(metric).join("")}</div><div class="notice" style="margin-bottom:14px">Estimates are based on current payroll data and may change. Final tax liability must be confirmed by a licensed tax professional or CPA.</div><div class="grid-2">${panel("Quarterly Estimate",table(["Quarter","Gross","Withheld","Est. Tax","Amount Due","Status","Due Date"],qRows))}${panel("By Jurisdiction",table(["ID","Name","Est. Tax","Deposited","Balance","Schedule","Risk"],jRows))}</div><div class="grid-2" style="margin-top:14px">${panel("Deposit Schedule Alerts",`<div class="panel-body list">${listItem("Federal semiweekly — Jun 24, 2026","$54,621 employee tax due. Ensure account funded by deposit date.","red")}${listItem("Texas SUTA — Jul 31, 2026","Quarterly SUTA payment. Verify wage base and rate.","yellow")}${listItem("California semiweekly — Jun 24, 2026","$10,122 CA withholding due.","yellow")}${listItem("New York monthly — Jul 15, 2026","$4,603 NY withholding due.","blue")}</div>`,`<button class="btn" data-modal="report">Export Deposit Schedule</button>`)}${panel("Actions",`<div class="panel-body list">${listItem("Connect CPA for final estimate","CPA can review estimate assumptions and adjust for deductions, credits, and filing status.","green")}${listItem("Update withholding","If estimate is significantly off, update W-4 instructions or employer withholding.","yellow")}</div>`,`<button class="btn primary" data-modal="cpa">Connect CPA</button>`)}</div>`;
}

/* ─── WEBHOOKS ─── */
function renderWebhooks(){
  const wRows = data.webhooks.map(e=>row([`<span class="mono">${e[0]}</span>`,e[1],e[2],e[3],status(e[4]),e[5],e[6],rowActions(actionBtn("Payload","webhook-payload"),actionBtn("Retry","webhook-retry"))]));
  return `<div class="grid-4" style="margin-bottom:14px">${[["Delivered","1,284","99.7% success rate","green"],["Pending","7","In delivery queue","cyan"],["Retrying","3","Next retry in 5 min","yellow"],["Dead Letter","1","Manual review required","red"]].map(metric).join("")}</div>${filterBar(["All statuses",["Delivered","Retrying","Dead Letter","Pending"]],["All event types",["tax_iq.ledger.posted","tax_iq.validation.warning","tax_iq.validation.failed","employee.tax_profile.validated"]])}${panel("Recent Events",table(["Event ID","Type","Tenant","Attempts","Status","Created","Delivered","Actions"],wRows),`<button class="btn primary" data-modal="webhook-retry">Retry Failed</button>`)}`;
}

/* ─── AUDIT LOG ─── */
function renderAuditLog(){
  const logRows = data.auditLog.map(l=>row([l[0],l[1],`<span class="mono text-indigo-300">${l[2]}</span>`,l[3],`<span class="mono">${l[4]}</span>`,l[5]]));
  return `${filterBar(["All resource types",["payroll_run","tax_ledger","employee","payout","receipt","share_link","webhook_event","tip_entry","report","connection"]],["All actions",["CREATED","UPDATED","FINALIZED","EXPORTED","POSTED","WEBHOOK_DELIVERED","WEBHOOK_FAILED","OCR_PROCESSED","TIP_CLASSIFIED"]],["All actors",["payroll_admin_44","finance_user","hr_user","owner_user","system"]])}<div style="display:flex;justify-content:flex-end;margin-bottom:10px">${actionBtn("Export Log","")}</div>${panel("Audit Log — Immutable Action Record",table(["Timestamp","Actor","Action","Resource Type","Resource ID","Detail"],logRows))}${panel("Audit Policy",`<div class="panel-body list">${listItem("Immutable records","Every create, update, delete, and export is logged. Records cannot be modified.","green")}${listItem("7-year retention","Audit logs are retained for 7 years per tax compliance requirements.","blue")}${listItem("Full PII export requires approval","Actor must be authorized merchant admin. Logged immediately.","yellow")}${listItem("Soft deletes only","No data is hard-deleted. Deletion events are logged with actor and reason.","red")}</div>`)}`;
}

/* ─── SETTINGS ─── */
function renderSettings(){
  const keyRows = data.apiKeys.map(k=>row([`<span class="mono">${k[0]}</span>`,k[1],`<span class="mono">${k[2]}</span>`,k[3],k[4],status(k[5]),k[6],rowActions(actionBtn("Rotate",""),actionBtn("Revoke",""))]));
  return `<div class="grid-2">${panel("US Payroll Scope",`<div class="panel-body"><div class="row"><span>Country</span><span>United States</span></div><div class="row"><span>Tax levels</span><span>Federal, State, Local</span></div><div class="row"><span>Employee forms</span><span>W-4, W-2</span></div><div class="row"><span>Employer returns</span><span>941, 940, SUTA</span></div></div>`)}${panel("Role & Access",table(["Permission","Payroll Admin","CPA","Auditor","Action"],[["Export data",status("Active"),status("Active"),status("Active"),actionBtn("Edit","")],["Finalize run",status("Active"),status("Missing"),status("Missing"),actionBtn("Edit","")],["Review package",status("Active"),status("Active"),status("Active"),actionBtn("Edit","")],["Manage settings",status("Active"),status("Missing"),status("Missing"),actionBtn("Edit","")]].map(row)))}${panel("Data Protection",`<div class="panel-body"><div class="row"><span>SSN/TIN storage</span><span>Tokenized</span></div><div class="row"><span>PII export approval</span><span>Required</span></div><div class="row"><span>Webhook signing</span><span>HMAC SHA-256</span></div><div class="row"><span>Audit retention</span><span>7 years</span></div></div>`,`${actionBtn("Configure","")}`)}${panel("Guided Help",`<div class="panel-body list">${listItem("First-time tour","Explain payroll, payout, Tax IQ, OCR, share links, GPS, CPA review.","blue")}${listItem("What next","Show recommended next action when a workflow is blocked.","green")}</div>`,`<button class="btn primary" data-toast="Tour started. Follow the guided steps.">Start Tour</button>`)}</div><div class="grid-2" style="margin-top:14px">${panel("API Keys",table(["Key ID","Name","Env","Scopes","Created","Status","Owner","Actions"],keyRows),`<button class="btn primary" data-modal="create-api-key">Create Key</button>`)}${panel("Notification Preferences",`<div class="panel-body">${[["Deposit due reminders","3-day and same-day alerts for scheduled tax deposits.",true],["Exception open alerts","Immediate alert when blocking exception is created.",true],["CPA request notifications","When CPA flags a missing record or requests files.",true],["Webhook dead letter alerts","When webhook delivery fails after max retries.",true],["Tip cap warnings","When worker approaches the $25,000 annual tip cap.",false]].map(([l,t,c])=>modalCheck(l,t,c)).join("")}</div>`,`<button class="btn primary" data-action-toast="Notification preferences saved.">Save Preferences</button>`)}</div>`;
}

/* ─── NOTIFICATIONS ─── */
function renderNotifications(){
  const unread = data.notifications.filter(n=>!n.read).length;
  const sev = {High:"red",Medium:"yellow",Low:"blue"};
  const nRows = data.notifications.map(n=>row([
    n.at,
    `<span class="flex items-center gap-2">${!n.read?`<span class="h-2 w-2 shrink-0 rounded-full bg-indigo-400 inline-block"></span>`:"<span class='h-2 w-2 inline-block'></span>"}<span>${n.title}</span></span>`,
    n.body,status(n.severity),
    `<a class="${ui.btn}" href="${pageHref(n.resource)}">Open</a> ${n.read?"":actionBtn("Mark Read","")}`
  ],{wrap:2}));
  return `<div class="grid-4" style="margin-bottom:14px">${[
    ["Unread",String(unread),"Require attention","red"],
    ["Deposit Alerts","1","Jun 24 due today","yellow"],
    ["CPA Requests","1","Missing receipt flagged","cyan"],
    ["System Events","2","Webhook + exception","green"]
  ].map(metric).join("")}</div><div style="display:flex;justify-content:flex-end;margin-bottom:10px">${actionBtn("Mark All Read","")}</div>${filterBar(["All severities",["High","Medium","Low"]],["All types",["DEPOSIT_ALERT","EXCEPTION_OPEN","CPA_REQUEST","TIN_PENDING","WEBHOOK_DEAD_LETTER","TIP_CAP"]])}${panel("Notification Center",table(["Time","Title","Detail","Severity","Actions"],nRows))}`;
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

  /* EMPLOYER MODALS */
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
  "view-receipt":{
    title:"Receipt Detail",
    body:"Full OCR extraction, confidence scores, business purpose, category, and audit trail.",
    cta:"Approve",
    content:()=>[
      modalSection("Extracted Fields", table(["Field","Value","Confidence"],[
        row(["Vendor","Beauty Supply Warehouse","94%"]),
        row(["Amount","$384.20","91%"]),
        row(["Date","Jun 18, 2026","88%"]),
        row(["Category","Supplies","86%"]),
        row(["Tax","$31.60","72%"]),
        row(["Receipt number","REC-20260618-0042","80%"])
      ])),
      modalSection("Business Details", modalGrid([
        modalField("Business purpose","Supplies for salon operations"),
        modalField("Owner","Owner"),
        modalSelect("Category",[["Supplies",true],["Utilities"],["Payment evidence"],["Travel"]]),
        modalField("Related payout","—")
      ])),
      modalSection("Audit Trail", table(["Time","Actor","Event"],[
        row(["Jun 18 14:00","system","OCR processed — 94% confidence"]),
        row(["Jun 18 14:05","owner_user","Receipt created via camera capture"]),
        row(["Pending","—","Awaiting human approval"])
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
        modalField("Date","Jun 18, 2026"),
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

  /* SHARE LINK MODALS */
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

  /* API KEY MODAL */
  "create-api-key":{
    title:"Create API Key",
    body:"Generate a new API key for payroll system integration, report automation, or developer access. Keys are shown only once.",
    cta:"Generate Key",
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
