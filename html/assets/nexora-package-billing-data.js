(function (root) {
  'use strict';

  const records = [
    {
      "transactionId": "NXR-20260810-0003",
      "paymentStatus": "paid",
      "product": "Professional Pro",
      "packageName": "Professional Pro",
      "billing": "Monthly subscription",
      "billingTerm": "1 month",
      "invoiceNumber": "NX-2026-0810-023749",
      "receiptNumber": "RCPT-2026-0810-023749",
      "dateIssued": "2026-08-10T07:42:00+07:00",
      "dateDue": "2026-08-10T23:59:59+07:00",
      "datePaid": "2026-08-10T07:42:00+07:00",
      "currency": "USD",
      "seller": { "name": "NEXORA TOUCH", "legalName": "NEXORA TOUCH, LLC", "addressLines": ["5900 Balcones Drive, Suite 100", "Austin, TX 78731", "United States"], "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "addressLines": ["Richmond, TX 77406", "United States"], "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": { "brand": "Visa", "last4": "4242" },
      "processor": "Stripe",
      "processorTransactionId": "pi_3NX_023749",
      "lineItems": [
        { "description": "Professional Pro", "period": "Aug 10-Sep 10, 2026", "quantity": 1, "unitPrice": 79, "amount": 79 }
      ],
      "subtotal": 79,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 79,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0810-023749.pdf",
      "receiptFile": "assets/billing-documents/Receipt-RCPT-2026-0810-023749.pdf"
    },
    {
      "transactionId": "SMS-20260811-0001",
      "paymentStatus": "payment_due",
      "product": "Voice Credit",
      "packageName": "Voice Credit",
      "billing": "Voice Credit",
      "billingTerm": "",
      "invoiceNumber": "NX-2026-0811-1CCEE7",
      "receiptNumber": null,
      "dateIssued": "2026-08-11T09:00:00+07:00",
      "dateDue": "2026-08-18T23:59:59+07:00",
      "datePaid": null,
      "currency": "USD",
      "seller": { "name": "NEXORA TOUCH", "legalName": "NEXORA TOUCH, LLC", "addressLines": ["5900 Balcones Drive, Suite 100", "Austin, TX 78731", "United States"], "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "addressLines": ["Richmond, TX 77406", "United States"], "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": null,
      "processor": null,
      "processorTransactionId": null,
      "lineItems": [
        { "description": "Voice Credit", "period": "", "quantity": 1, "unitPrice": 179, "amount": 179 }
      ],
      "subtotal": 179,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 179,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0811-1CCEE7.pdf",
      "receiptFile": null
    },
    {
      "transactionId": "VMS-20260701-0002",
      "paymentStatus": "overdue",
      "product": "AI Voice Pro",
      "packageName": "AI Voice Pro",
      "billing": "Monthly subscription",
      "billingTerm": "1 month",
      "invoiceNumber": "NX-2026-0701-000002",
      "receiptNumber": null,
      "dateIssued": "2026-07-01T09:35:00+07:00",
      "dateDue": "2026-07-08T23:59:59+07:00",
      "datePaid": null,
      "currency": "USD",
      "seller": { "name": "NEXORA TOUCH", "legalName": "NEXORA TOUCH, LLC", "addressLines": ["5900 Balcones Drive, Suite 100", "Austin, TX 78731", "United States"], "email": "support@nexoratouch.com" },
      "billTo": { "name": "Bitcoin Nail Bar", "addressLines": ["Richmond, TX 77406", "United States"], "email": "billing@bitcoinnailbar.com" },
      "paymentMethod": null,
      "processor": null,
      "processorTransactionId": null,
      "lineItems": [
        { "description": "AI Voice Pro", "period": "Jul 1-Aug 1, 2026", "quantity": 1, "unitPrice": 199, "amount": 199 }
      ],
      "subtotal": 199,
      "taxLabel": "Tax",
      "taxRate": 0,
      "taxAmount": 0,
      "total": 199,
      "invoiceFile": "assets/billing-documents/Invoice-NX-2026-0701-000002.pdf",
      "receiptFile": null
    }
  ];

  root.NEXORA_PACKAGE_BILLING_RECORDS = records;
})(typeof window !== 'undefined' ? window : globalThis);
