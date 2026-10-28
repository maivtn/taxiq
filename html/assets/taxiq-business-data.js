/* Dashboard/Analytics demo content copied from the existing Tax IQ prototype. No live tax data. */
window.NEXORA_TAXIQ_BUSINESS = {
  "metrics": [
    [
      "Total Gross Pay",
      "$1.05M",
      "Q2 payroll and bonus gross",
      "green",
      "payroll-runs"
    ],
    [
      "Tax Withheld",
      "$193.3K",
      "Federal/state employee taxes",
      "cyan",
      "ledger"
    ],
    [
      "Open Exceptions",
      "5",
      "4 blocking strict mode",
      "yellow",
      "exceptions"
    ],
    [
      "Evidence Vault",
      "6",
      "Receipts and payout proofs",
      "red",
      "ocr"
    ]
  ],
  "runs": [
    [
      "pr_2026_06_15",
      "Jun 1-14",
      "Jun 19, 2026",
      "Jun 24, 2026",
      "142",
      "$312,448",
      "$54,621",
      "18",
      "Ledger Posted"
    ],
    [
      "pr_2026_06_01",
      "May 18-31",
      "Jun 5, 2026",
      "Jun 11, 2026",
      "142",
      "$309,882",
      "$53,974",
      "12",
      "Ledger Posted"
    ],
    [
      "pr_2026_05_15",
      "May 1-17",
      "May 22, 2026",
      "May 28, 2026",
      "139",
      "$304,122",
      "$53,061",
      "42",
      "Review Required"
    ],
    [
      "pr_bonus_q2",
      "Q2 Bonus",
      "Jun 15, 2026",
      "Jun 18, 2026",
      "48",
      "$124,000",
      "$31,000",
      "8",
      "Ledger Posted"
    ],
    [
      "pr_2026_07_01",
      "Jun 15-28",
      "Jul 3, 2026",
      "Jul 8, 2026",
      "144",
      "$0",
      "$0",
      "-",
      "Pending"
    ],
    [
      "pr_correction_01",
      "Correction",
      "Jun 20, 2026",
      "Jun 24, 2026",
      "3",
      "$4,840",
      "$689",
      "68",
      "Validation Failed"
    ]
  ],
  "exceptions": [
    [
      "ex_001",
      "WITHHOLDING_DISCREPANCY",
      "High",
      "Payroll",
      "Open",
      "pr_correction_01",
      "Payroll submitted $690. Tax IQ expected $698.89."
    ],
    [
      "ex_002",
      "TIN_VERIFICATION_PENDING",
      "Medium",
      "HR",
      "Open",
      "Q2",
      "6 employees have unverified SSN/TIN."
    ],
    [
      "ex_003",
      "W4_STALE",
      "Medium",
      "HR",
      "Open",
      "YTD",
      "3 employees are still using 2024 W-4 forms."
    ],
    [
      "ex_004",
      "JURISDICTION_MISMATCH",
      "Medium",
      "Tax",
      "Reviewing",
      "pr_2026_05_15",
      "Work CA vs residence TX for 2 employees."
    ],
    [
      "ex_005",
      "TAX_PROFILE_MISSING",
      "Low",
      "HR",
      "Open",
      "pr_2026_07_01",
      "2 new hires are missing tax profiles."
    ]
  ],
  "jurisdictions": [
    [
      "US-FED",
      "Federal",
      "$348,011",
      "$148,238",
      "Active",
      "Semiweekly",
      "Jun 24, 2026",
      "8"
    ],
    [
      "US-TX",
      "Texas",
      "$6,920",
      "$48,821",
      "Active",
      "Quarterly",
      "Jul 31, 2026",
      "6"
    ],
    [
      "US-CA",
      "California",
      "$112,440",
      "$10,122",
      "Review",
      "Semiweekly",
      "Jun 24, 2026",
      "42"
    ],
    [
      "US-NY",
      "New York",
      "$37,768",
      "$4,603",
      "Missing setup",
      "Monthly",
      "Jul 15, 2026",
      "61"
    ]
  ],
  "analyticsMetrics": [
    [
      "Average Risk",
      "24",
      "Across scored runs",
      "success"
    ],
    [
      "Integration Success",
      "99.7%",
      "Current period",
      "info"
    ],
    [
      "Blocking Exceptions",
      "4",
      "Strict mode blockers",
      "warning"
    ],
    [
      "Missing Profiles",
      "2",
      "Tax profiles needed",
      "danger"
    ]
  ],
  "jurisdictionChart": [
    {
      "label": "Federal",
      "value": 210000,
      "display": "$210K",
      "sub": "Income + FICA",
      "tone": "danger"
    },
    {
      "label": "California",
      "value": 59600,
      "display": "$59.6K",
      "sub": "State withholding",
      "tone": "warning"
    },
    {
      "label": "New York",
      "value": 40000,
      "display": "$40K",
      "sub": "State withholding",
      "tone": "primary"
    },
    {
      "label": "Texas SUTA",
      "value": 6920,
      "display": "$6.9K",
      "sub": "Employer tax",
      "tone": "success"
    }
  ]
};
