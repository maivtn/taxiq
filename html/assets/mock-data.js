window.TaxIQMockData = {
  metrics:[
    ["Total Gross Pay","$1.05M","Q2 payroll and bonus gross","green","payroll-runs"],
    ["Tax Withheld","$193.3K","Federal/state employee taxes","cyan","ledger"],
    ["Open Exceptions","5","4 blocking strict mode","yellow","exceptions"],
    ["Evidence Vault","6","Receipts and payout proofs","red","ocr"]
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
    ["tle_004","pr_2026_06_15","Marcus Chen","US-FED","federal_income_tax","$3,780.77","$491.50","$0","sha256:g7h8"],
    ["tle_005","pr_2026_06_15","Marcus Chen","US-FED","social_security","$4,230.77","$262.31","$262.31","sha256:i9j0"],
    ["tle_006","pr_2026_05_15","David Kim","US-CA","ca_state_income_tax","$3,141.54","$314.15","$0","sha256:k1l2"],
    ["tle_007","pr_2026_06_01","Sofia Reyes","US-FED","federal_income_tax","$2,634.62","$341.22","$0","sha256:m3n4"],
    ["tle_008","pr_2026_06_01","Sofia Reyes","US-FED","medicare","$2,884.62","$41.83","$41.83","sha256:o5p6"],
    ["tle_009","pr_bonus_q2","Bonus pool","US-FED","supplemental_withholding","$124,000.00","$27,280.00","$0","sha256:q7r8"],
    ["tle_010","pr_2026_06_15","Aisha Okafor","US-FED","social_security","$3,230.77","$200.31","$200.31","sha256:s9t0"],
    ["tle_011","pr_2026_06_15","Noah Patel","US-NY","ny_state_income_tax","$2,769.23","$132.50","$0","sha256:u1v2"],
    ["tle_012","pr_2026_06_15","Retail sample","US-TX","suta_employer_tax","$18,420.00","$0","$488.13","sha256:w3x4"]
  ],
  jurisdictions:[
    ["US-FED","Federal","$348,011","$148,238","Active","Semiweekly","Jun 24, 2026","8"],
    ["US-TX","Texas","$6,920","$48,821","Active","Quarterly","Jul 31, 2026","6"],
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
    ["evt_01JZ006","tax_iq.ledger.posted","tenant_demo_001","https://api.nexora.example/webhooks/taxiq","1","Delivered","2 min ago","2 min ago","—"],
    ["evt_01JZ005","tax_iq.validation.warning","tenant_demo_001","https://api.nexora.example/webhooks/taxiq","1","Delivered","2 min ago","2 min ago","—"],
    ["evt_01JZ003","tax_iq.validation.failed","tenant_demo_001","https://retail.example.com/taxiq/events","3","Retrying","47 min ago","-","HTTP 429 rate limited"],
    ["evt_01JZ001","employee.tax_profile.validated","tenant_biz_1024","https://hrcloud.example.com/taxiq/callback","8","Dead Letter","5h ago","-","401 invalid signature"]
  ],
  receipts:[
    // [id, vendor, category, amount, source, status, owner, confidence, tax, rcpt_num, captured_at, image_ref]
    ["rcpt_001","Beauty Supply Warehouse","Supplies","$384.20","Camera","Approved","Owner","94%","$31.60","REC-0042","Jun 18 14:00","rcpt_001.jpg"],
    ["rcpt_002","AT&T Phone Bill","Utilities","$129.00","Email import","Needs Review","Bookkeeper","67%","$0.00","INV-0918","Jun 20 09:15","rcpt_002.jpg"],
    ["rcpt_003","Unknown Zelle memo","Payment evidence","$250.00","Payout upload","Missing purpose","Finance","—","—","—","Jun 15 18:21","—"],
    ["rcpt_004","Nail Supply Co.","Supplies","$212.50","File upload","Approved","Owner","91%","$17.50","NS-8812","Jun 22 10:30","rcpt_004.jpg"],
    ["rcpt_005","City Water Dept","Utilities","$88.00","Email import","Processing","Owner","—","—","—","Jun 24 11:00","—"],
    ["rcpt_006","Square POS Receipt","Equipment","$495.00","Camera","Needs Review","Owner","72%","$40.75","SQ-2026061","Jun 23 16:20","rcpt_006.jpg"]
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
      ["US-TX","Texas SUTA","$6,920","$4,882","$2,038","Quarterly","Low"],
      ["US-CA","California","$59,600","$10,122","$49,478","Semiweekly","Medium"],
      ["US-NY","New York","$40,000","$4,603","$35,397","Monthly","Medium"]
    ]
  },
  connections:[
    ["conn_nt_biz789","Nexora Touch Payroll","biz_789","OAuth 2.0","HMAC SHA-256","payroll+employees+webhooks","Connected","2 min ago","https://api.nexora.example/webhooks/taxiq","—"],
    ["conn_hrcloud_biz1024","TechCorp HRIS","biz_1024","API Key","HMAC SHA-256","employees+webhooks","Connected","8 min ago","https://hrcloud.example.com/taxiq/callback","—"],
    ["conn_retail_biz2201","Retail Partners Payroll","biz_2201","API Key","HMAC SHA-256","payroll+webhooks","Degraded","47 min ago","https://retail.example.com/taxiq/events","HTTP 429 rate limited"],
    ["conn_qbo_biz789","QuickBooks Accounting","biz_789","OAuth 2.0","None","accounting+reports","Connected","1h ago","https://quickbooks.intuit.com/appcenter","—"]
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
  ],
  plans:[
    ["Starter","$99/mo","1 location","OCR Vault, Share Links, GPS Mileage, Tip Ledger","Owner-operated nail/beauty shop"],
    ["Growth","$249/mo","Up to 3 locations","Tax Estimate, CPA Review, payroll sync, audit log","Growing merchant with staff payouts"],
    ["Pro","$499/mo","Multi-location","API access, webhooks, advanced role controls, custom reports","Franchise or accounting-heavy operator"],
    ["Partner API","Custom","Partner volume","Embedded Tax IQ APIs, webhook package, partner support","Payroll/accounting software partner"]
  ],
  invoices:[
    ["inv_2026_006","Jun 2026","Growth Plan","$249.00","Paid","Jun 1, 2026"],
    ["inv_2026_005","May 2026","Growth Plan","$249.00","Paid","May 1, 2026"],
    ["inv_cpa_001","CPA estimate deposit","Nguyen CPA Group retainer","$250.00","Pending approval","Jun 24, 2026"]
  ]
};
