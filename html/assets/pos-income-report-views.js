/* Reuses the existing Store Income and Service Income report content and controls. */
(function(){'use strict';
var templates={"store":"<div class=\"page\">\n          \n\n    <header class=\"page-header ptr-report-heading\">\n      <h2 class=\"ptr-report-title\" id=\"ptr-store-title\">Store Income</h2>\n      <div class=\"header-actions\" aria-label=\"Report actions\">\n        <button class=\"button\" type=\"button\" data-email-report=\"\">Email</button>\n        <button class=\"button button-primary\" type=\"button\" data-print-report=\"\">Print / PDF</button>\n      </div>\n    </header>\n\n    <section class=\"report-toolbar\" aria-label=\"Reporting period\">\n      <div class=\"period-control\">\n        <div class=\"period-tabs\" role=\"tablist\" aria-label=\"Choose reporting period\">\n          <button class=\"period-tab\" type=\"button\" role=\"tab\" aria-selected=\"true\" data-period=\"day\">Day</button>\n          <button class=\"period-tab\" type=\"button\" role=\"tab\" aria-selected=\"false\" data-period=\"week\">Week</button>\n          <button class=\"period-tab\" type=\"button\" role=\"tab\" aria-selected=\"false\" data-period=\"year\">Year</button>\n          <button class=\"period-tab\" type=\"button\" role=\"tab\" aria-selected=\"false\" data-period=\"range\">Range</button>\n        </div>\n      </div>\n\n      <div class=\"picker-panel\" data-picker=\"day\">\n        <div class=\"picker-row\">\n          <div class=\"field\">\n            <label for=\"dayDate\">Report date</label>\n            <input id=\"dayDate\" name=\"dayDate\" type=\"date\" value=\"2026-08-31\" max=\"2026-08-31\">\n          </div>\n        </div>\n      </div>\n\n      <div class=\"picker-panel\" data-picker=\"week\" hidden=\"\">\n        <div class=\"picker-row\">\n          <div class=\"field\">\n            <label for=\"weekValue\">Report week</label>\n            <input id=\"weekValue\" name=\"weekValue\" type=\"week\" value=\"2026-W36\">\n            <output class=\"week-range\" for=\"weekValue\" data-week-range=\"\" aria-live=\"polite\">Aug 31 – Sep 6, 2026</output>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"picker-panel\" data-picker=\"year\" hidden=\"\">\n        <div class=\"picker-row\">\n          <div class=\"field\">\n            <label for=\"yearValue\">Report year</label>\n            <select id=\"yearValue\" name=\"yearValue\">\n              <option>2024</option>\n              <option>2025</option>\n              <option selected=\"\">2026</option>\n            </select>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"picker-panel\" data-picker=\"range\" hidden=\"\">\n        <div class=\"picker-row\">\n          <div class=\"field\">\n            <label for=\"fromDate\">From date</label>\n            <input id=\"fromDate\" name=\"fromDate\" type=\"date\" value=\"2026-08-01\" max=\"2026-08-31\">\n          </div>\n          <div class=\"field\">\n            <label for=\"toDate\">To date</label>\n            <input id=\"toDate\" name=\"toDate\" type=\"date\" value=\"2026-08-31\" max=\"2026-08-31\">\n          </div>\n          <button class=\"button button-primary\" type=\"button\" data-apply-range=\"\">Apply range</button>\n        </div>\n        <p class=\"date-error\" data-date-error=\"\" role=\"alert\" hidden=\"\">The From date must be on or before the To date.</p>\n      </div>\n    </section>\n\n    <section class=\"report-meta\" aria-label=\"Report context\">\n      <h3 data-period-title=\"\">Today</h3>\n      <div class=\"meta-line\">\n        <span data-date-label=\"\">Aug 31, 2026 · 12:00 AM–2:42 PM</span>\n        <span class=\"meta-separator\" aria-hidden=\"true\">•</span>\n        <span>Central Time (CT)</span>\n      </div>\n    </section>\n\n    <section class=\"content-grid\" data-day-view=\"\">\n      <article class=\"card panel\">\n        <header class=\"section-heading\">\n          <h3>Payment breakdown</h3>\n          <strong class=\"section-total\" data-payment-total=\"\">$3,842.65</strong>\n        </header>\n        <div class=\"payment-list\" data-payment-list=\"\">\n          <a class=\"payment-row\" href=\"pos-technician-report.html?tab=card\" data-payment-method=\"card\" aria-label=\"View Card payments\">\n            <span class=\"method-name\"><span>Card</span><span class=\"allocation-count\" data-payment-count=\"\">21 allocations</span></span>\n            <strong class=\"method-amount\" data-payment-amount=\"2468.20\">$2,468.20</strong>\n          </a>\n          <button class=\"payment-row\" type=\"button\" data-payment-method=\"cash\" aria-label=\"View Cash payments\">\n            <span class=\"method-name\"><span>Cash</span><span class=\"allocation-count\" data-payment-count=\"\">8 allocations</span></span>\n            <strong class=\"method-amount\" data-payment-amount=\"923.45\">$923.45</strong>\n          </button>\n          <button class=\"payment-row\" type=\"button\" data-payment-method=\"gift\" aria-label=\"View Gift Card payments\">\n            <span class=\"method-name\"><span>Gift Card</span><span class=\"allocation-count\" data-payment-count=\"\">3 allocations</span></span>\n            <strong class=\"method-amount\" data-payment-amount=\"312\">$312.00</strong>\n          </button>\n          <button class=\"payment-row\" type=\"button\" data-payment-method=\"zelle\" aria-label=\"View Zelle payments\">\n            <span class=\"method-name\"><span>Zelle</span><span class=\"allocation-count\" data-payment-count=\"\">2 allocations</span></span>\n            <strong class=\"method-amount\" data-payment-amount=\"139\">$139.00</strong>\n          </button>\n          <button class=\"payment-row\" type=\"button\" data-payment-method=\"wallet\" aria-label=\"View VLINKPAY Wallet payments\">\n            <span class=\"method-name\"><span>VLINKPAY Wallet</span><span class=\"allocation-count\" data-payment-count=\"\">0 allocations</span></span>\n            <strong class=\"method-amount\" data-payment-amount=\"0\">$0.00</strong>\n          </button>\n        </div>\n      </article>\n\n      <article class=\"card panel\">\n        <header class=\"section-heading\">\n          <h3>Details</h3>\n        </header>\n        <div class=\"detail-list\">\n          <div class=\"detail-row\"><span>Services subtotal</span><strong data-detail=\"services\">$2,920.00</strong></div>\n          <div class=\"detail-row\"><span>Service discounts</span><strong class=\"negative\" data-detail=\"discounts\">−$147.50</strong></div>\n          <div class=\"detail-row\"><span>Products subtotal</span><strong data-detail=\"products\">$218.75</strong></div>\n          <div class=\"detail-row\"><span>Sales tax</span><strong data-detail=\"tax\">$221.40</strong></div>\n          <div class=\"detail-row\"><span>Tips</span><strong data-detail=\"tips\">$630.00</strong></div>\n          <div class=\"detail-row\"><span>Supply Fee</span><strong data-supply-fee=\"\">$0.00</strong></div>\n          <div class=\"detail-row\"><span>Merchant Fee</span><strong data-merchant-fee=\"\">$0.00</strong></div>\n          <div class=\"detail-row\"><span>Return Transactions</span><strong><span data-return-count=\"\">0</span> · <span data-return-total=\"\">$0.00</span></strong></div>\n          <div class=\"detail-row total-detail\"><span>Total collected</span><strong data-detail=\"total\">$3,842.65</strong></div>\n        </div>\n      </article>\n    </section>\n\n    <section class=\"card table-card\" data-table-view=\"\" hidden=\"\" aria-label=\"Income report table\">\n      <header class=\"section-heading\">\n        <h3 data-table-title=\"\">Daily collection</h3>\n        <strong class=\"section-total\" data-table-total=\"\">$0.00</strong>\n      </header>\n      <div class=\"table-scroll\" tabindex=\"0\" aria-label=\"Scrollable income report data\">\n        <table class=\"report-table\">\n          <thead>\n            <tr>\n              <th scope=\"col\" data-first-column=\"\">Date</th>\n              <th scope=\"col\">Card</th>\n              <th scope=\"col\">Cash</th>\n              <th scope=\"col\">Gift Card</th>\n              <th scope=\"col\">Zelle</th>\n              <th scope=\"col\">Wallet</th>\n              <th scope=\"col\">Tips (included)</th>\n              <th scope=\"col\">Total Collected</th>\n            </tr>\n          </thead>\n          <tbody data-report-table-body=\"\"></tbody>\n          <tfoot>\n            <tr>\n              <td>Period total</td>\n              <td data-table-total-cell=\"card\">$0.00</td>\n              <td data-table-total-cell=\"cash\">$0.00</td>\n              <td data-table-total-cell=\"gift\">$0.00</td>\n              <td data-table-total-cell=\"zelle\">$0.00</td>\n              <td data-table-total-cell=\"wallet\">$0.00</td>\n              <td class=\"tip-cell\" data-table-total-cell=\"tip\">$0.00</td>\n              <td data-table-grand-total=\"\">$0.00</td>\n            </tr>\n          </tfoot>\n        </table>\n      </div>\n    </section>\n        </div><div class=\"overlay\" data-order-drawer=\"\" aria-hidden=\"true\">\n    <aside class=\"drawer\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"drawerTitle\">\n      <header class=\"drawer-header\">\n        <div>\n          <h2 id=\"drawerTitle\" data-drawer-title=\"\">Card payments</h2>\n          <p class=\"drawer-subtitle\" data-drawer-subtitle=\"\">Today · Central Time (CT)</p>\n        </div>\n        <button class=\"button button-icon\" type=\"button\" aria-label=\"Close order list\" data-close-drawer=\"\">×</button>\n      </header>\n      <div class=\"drawer-summary\">\n        <div class=\"drawer-summary-item\"><span>Orders shown</span><strong data-drawer-count=\"\">0</strong></div>\n        <div class=\"drawer-summary-item\"><span>Selected amount</span><strong data-drawer-amount=\"\">$0.00</strong></div>\n      </div>\n      <div class=\"order-list\" data-order-list=\"\"></div>\n    </aside>\n  </div><div class=\"overlay modal-shell\" data-email-modal=\"\" aria-hidden=\"true\">\n    <section class=\"modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"emailTitle\">\n      <header class=\"modal-header\">\n        <div>\n          <h2 id=\"emailTitle\">Email report</h2>\n          <p class=\"drawer-subtitle\">Send a PDF snapshot of the report currently shown.</p>\n        </div>\n        <button class=\"button button-icon\" type=\"button\" aria-label=\"Close email dialog\" data-close-email=\"\">×</button>\n      </header>\n      <div class=\"modal-body\">\n        <div class=\"field\">\n          <label for=\"reportRecipient\">Recipient email</label>\n          <input id=\"reportRecipient\" name=\"reportRecipient\" type=\"email\" value=\"owner@lunasalon.com\" placeholder=\"e.g. owner@lunasalon.com\" autocomplete=\"email\">\n        </div>\n        <p class=\"date-error\" data-email-error=\"\" role=\"alert\" hidden=\"\">Enter a valid email address.</p>\n        <div class=\"snapshot-card\">\n          <strong>Luna Nail Studio — Store Income</strong>\n          <span data-email-snapshot=\"\">Today · Aug 31, 2026 · $3,842.65</span>\n          <span>Central Time (CT) · PDF attachment</span>\n        </div>\n      </div>\n      <footer class=\"modal-footer\">\n        <button class=\"button\" type=\"button\" data-cancel-email=\"\">Cancel</button>\n        <button class=\"button button-primary\" type=\"button\" data-send-report=\"\">Send report</button>\n      </footer>\n    </section>\n  </div><div class=\"toast\" data-toast=\"\" role=\"status\" aria-live=\"polite\" hidden=\"\"></div>","service":"<div class=\"page\">\n          \n\n    <header class=\"compact-header ptr-report-heading\">\n      <h2 class=\"ptr-report-title\" id=\"ptr-service-title\">Service Income</h2>\n    </header>\n\n    <section class=\"toolbar-card\" data-range-form=\"\" aria-label=\"Report date range\">\n      <div class=\"custom-range\">\n        <div class=\"date-fields\">\n          <div class=\"field\"><label for=\"from-date\">From date</label><input id=\"from-date\" name=\"fromDate\" type=\"date\" value=\"2026-08-31\"></div>\n          <div class=\"field\"><label for=\"to-date\">To date</label><input id=\"to-date\" name=\"toDate\" type=\"date\" value=\"2026-08-31\"></div>\n          <button class=\"button button-primary\" type=\"button\" data-apply-range=\"\">Run report</button>\n        </div>\n        <p class=\"date-error\" data-date-error=\"\" hidden=\"\" role=\"alert\">Start date must be on or before end date.</p>\n      </div>\n    </section>\n    <section class=\"ptr-income-context\" aria-label=\"Report context\"><h3 data-service-context-title></h3><p data-service-context-date></p></section>\n\n    <section class=\"empty-state\" data-empty-state=\"\" hidden=\"\">\n      <span class=\"empty-icon\" aria-hidden=\"true\">▥</span><h3>No completed services</h3><p>No completed service lines were found for this reporting period. Try a wider date range or return after checkout activity.</p>\n    </section>\n\n    <div data-report-content=\"\">\n      <div class=\"chart-stack\">\n        <section class=\"chart-card\" data-chart=\"revenue\" data-orientation=\"vertical\" aria-label=\"Revenue by Service\">\n          <header class=\"chart-header\">\n            <h3>Revenue by Service</h3>\n            <div class=\"chart-total\"><strong data-total-revenue=\"\">$4,286.00</strong><span>Net revenue</span></div>\n          </header>\n          <div class=\"chart-body\">\n            <div class=\"column-plot\">\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 100%\" type=\"button\" data-service-id=\"deluxe-pedicure\" data-color=\"violet\"><span class=\"bar-value\">$1,170</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Deluxe Pedicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 86.2%\" type=\"button\" data-service-id=\"gel-manicure\" data-color=\"blue\"><span class=\"bar-value\">$1,008</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Gel Manicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 66.7%\" type=\"button\" data-service-id=\"king-pedicure\" data-color=\"teal\"><span class=\"bar-value\">$780</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">King Pedicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 43.1%\" type=\"button\" data-service-id=\"classic-manicure\" data-color=\"gold\"><span class=\"bar-value\">$504</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Classic Manicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 27.4%\" type=\"button\" data-service-id=\"callus-treatment\" data-color=\"rose\"><span class=\"bar-value\">$320</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Deluxe Pedicure — Callus Treatment</span></span><span class=\"service-type-chip\">Add-on</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 21.2%\" type=\"button\" data-service-id=\"acrylic-full-set\" data-color=\"cyan\"><span class=\"bar-value\">$248</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Acrylic Full Set</span></span><span class=\"service-type-chip inactive\">Inactive</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 12.3%\" type=\"button\" data-service-id=\"nail-art\" data-color=\"indigo\"><span class=\"bar-value\">$144</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Gel Manicure — Nail Art</span></span><span class=\"service-type-chip\">Add-on</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 9.6%\" type=\"button\" data-service-id=\"polish-change\" data-color=\"green\"><span class=\"bar-value\">$112</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Polish Change</span></span></span></button></div>\n            </div>\n          </div>\n        </section>\n\n        <section class=\"chart-card\" data-chart=\"count\" data-orientation=\"vertical\" aria-label=\"Count by Service\">\n          <header class=\"chart-header\">\n            <h3>Count by Service</h3>\n            <div class=\"chart-total\"><strong data-total-count=\"\">104</strong><span>Service lines</span></div>\n          </header>\n          <div class=\"chart-body\">\n            <div class=\"column-plot\">\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 100%\" type=\"button\" data-service-id=\"gel-manicure\" data-color=\"blue\"><span class=\"bar-value\">28</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Gel Manicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 75%\" type=\"button\" data-service-id=\"classic-manicure\" data-color=\"gold\"><span class=\"bar-value\">21</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Classic Manicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 64.3%\" type=\"button\" data-service-id=\"deluxe-pedicure\" data-color=\"violet\"><span class=\"bar-value\">18</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Deluxe Pedicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 42.9%\" type=\"button\" data-service-id=\"king-pedicure\" data-color=\"teal\"><span class=\"bar-value\">12</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">King Pedicure</span></span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 35.7%\" type=\"button\" data-service-id=\"callus-treatment\" data-color=\"rose\"><span class=\"bar-value\">10</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Deluxe Pedicure — Callus Treatment</span></span><span class=\"service-type-chip\">Add-on</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 21.4%\" type=\"button\" data-service-id=\"nail-art\" data-color=\"indigo\"><span class=\"bar-value\">6</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Gel Manicure — Nail Art</span></span><span class=\"service-type-chip\">Add-on</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 17.9%\" type=\"button\" data-service-id=\"acrylic-full-set\" data-color=\"cyan\"><span class=\"bar-value\">5</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Acrylic Full Set</span></span><span class=\"service-type-chip inactive\">Inactive</span></span></button></div>\n              <div class=\"rank-row\" data-rank-row=\"\"><button class=\"bar-button\" style=\"--bar-size: 14.3%\" type=\"button\" data-service-id=\"polish-change\" data-color=\"green\"><span class=\"bar-value\">4</span><span class=\"bar-track\" data-column-bar=\"\"><span class=\"bar-fill\"></span></span><span class=\"service-label\"><span class=\"service-name-line\"><span class=\"service-name\" data-service-name=\"\">Polish Change</span></span></span></button></div>\n            </div>\n          </div>\n        </section>\n      </div>\n    </div>\n        </div><div class=\"detail-overlay\" data-detail-overlay=\"\" aria-hidden=\"true\">\n    <aside class=\"drawer-panel\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"detail-title\">\n      <header class=\"drawer-header\">\n        <div><p class=\"drawer-kicker\">Completed service lines</p><h2 id=\"detail-title\" data-detail-title=\"\">Service details</h2><p class=\"drawer-subtitle\">Aug 31, 2026 · America/Chicago</p></div>\n        <button class=\"close-button\" type=\"button\" data-close-detail=\"\" aria-label=\"Close service details\">×</button>\n      </header>\n      <div class=\"drawer-summary\">\n        <div class=\"drawer-stat\"><span>Net revenue</span><strong data-detail-revenue=\"\">$0.00</strong></div>\n        <div class=\"drawer-stat\"><span>Completed count</span><strong data-detail-count=\"\">0 service lines</strong></div>\n      </div>\n      <div class=\"drawer-body\">\n        <div class=\"drawer-meta\"><h3>Recent source transactions</h3><span>Showing 5 most recent</span></div>\n        <div class=\"ticket-list\">\n          <div class=\"ticket-header\" aria-hidden=\"true\"><span>Ticket / technician</span><span>Original / discount</span><span>Net</span></div>\n          <article class=\"ticket-row\" data-detail-row=\"\"><div class=\"ticket-main\"><div class=\"ticket-id\">#1048 · 10:42 AM</div><div class=\"ticket-time\">Aug 31, 2026</div><div class=\"ticket-tech\">Technician · Mia Johnson</div></div><div class=\"ticket-finance\"><div><span>Original / discount</span><strong>$70.00 / <b class=\"discount-value\">−$5.00</b></strong></div><div><span>Net revenue</span><strong>$65.00</strong></div></div></article>\n          <article class=\"ticket-row\" data-detail-row=\"\"><div class=\"ticket-main\"><div class=\"ticket-id\">#1052 · 11:18 AM</div><div class=\"ticket-time\">Aug 31, 2026</div><div class=\"ticket-tech\">Technician · Sophia Lee</div></div><div class=\"ticket-finance\"><div><span>Original / discount</span><strong>$65.00 / $0.00</strong></div><div><span>Net revenue</span><strong>$65.00</strong></div></div></article>\n          <article class=\"ticket-row\" data-detail-row=\"\"><div class=\"ticket-main\"><div class=\"ticket-id\">#1057 · 12:05 PM</div><div class=\"ticket-time\">Aug 31, 2026</div><div class=\"ticket-tech\">Technician · Olivia Davis</div></div><div class=\"ticket-finance\"><div><span>Original / discount</span><strong>$75.00 / <b class=\"discount-value\">−$10.00</b></strong></div><div><span>Net revenue</span><strong>$65.00</strong></div></div></article>\n          <article class=\"ticket-row\" data-detail-row=\"\"><div class=\"ticket-main\"><div class=\"ticket-id\">#1061 · 1:36 PM</div><div class=\"ticket-time\">Aug 31, 2026</div><div class=\"ticket-tech\">Technician · Emma Wilson</div></div><div class=\"ticket-finance\"><div><span>Original / discount</span><strong>$65.00 / $0.00</strong></div><div><span>Net revenue</span><strong>$65.00</strong></div></div></article>\n          <article class=\"ticket-row\" data-detail-row=\"\"><div class=\"ticket-main\"><div class=\"ticket-id\">#1069 · 2:22 PM</div><div class=\"ticket-time\">Aug 31, 2026</div><div class=\"ticket-tech\">Technician · Ava Martinez</div></div><div class=\"ticket-finance\"><div><span>Original / discount</span><strong>$70.00 / <b class=\"discount-value\">−$5.00</b></strong></div><div><span>Net revenue</span><strong>$65.00</strong></div></div></article>\n        </div>\n      </div>\n      <footer class=\"drawer-footer\"><p>Totals include all source lines. Only the five most recent are shown in this prototype.</p><button class=\"button button-primary\" type=\"button\">Open completed orders</button></footer>\n    </aside>\n  </div>"},mounted=new WeakMap();
function enhanceDates(root){
  const data=window.NEXORA_TECHNICIAN_REPORT_DATA;
  root.querySelectorAll('input[type="date"],input[type="month"],input[type="week"]').forEach(input=>{
    let wrapper=input.closest('.ptr-income-date');
    if(!wrapper){
      wrapper=document.createElement('span');wrapper.className='ptr-income-date';
      const icon=document.createElement('img');icon.src='../assets/icon-oneqr/issue-2040-oneqr-calendar-days-3d.png';icon.alt='';icon.setAttribute('aria-hidden','true');
      const display=document.createElement('span');display.dataset.dateDisplay='';display.setAttribute('aria-hidden','true');
      input.before(wrapper);wrapper.append(icon,display,input);
      input.addEventListener('change',()=>enhanceDates(root));
    }
    let label='';
    const type=input.getAttribute('type');
    if(input.value){
      if(type==='month' && /^\d{4}-\d{2}$/.test(input.value))label=new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric'}).format(data.parseDate(input.value+'-01'));
      else if(type==='week' && /^\d{4}-W\d{2}$/.test(input.value)){
        const [year,week]=input.value.split('-W').map(Number),date=new Date(year,0,4);
        date.setDate(date.getDate()-(date.getDay()+6)%7+(week-1)*7);
        const range=data.period('Weekly',data.iso(date));label=range.label;
      }else if(/^\d{4}-\d{2}-\d{2}$/.test(input.value))label=data.formatDate(input.value);
    }
    wrapper.querySelector('[data-date-display]').textContent=label;
  });
}
function periodKeys(root){
  root.addEventListener('keydown',event=>{
    const group=event.target.closest('.ptr-segments,.period-tabs');
    if(!group||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const buttons=Array.from(group.querySelectorAll('button[role="tab"]')),index=buttons.indexOf(event.target);
    if(index<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    const target=buttons[next];target.click();target.focus({preventScroll:true});
  });
}
function printReport(){document.body.classList.add('pos-income-printing');try{window.print();}finally{document.body.classList.remove('pos-income-printing');}}
function initStore(root){


      const TODAY = '2026-08-31'
      const THIS_WEEK = '2026-W36'
      const THIS_YEAR = 2026
      const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      const fullDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
      const rowDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
      const $ = (selector) => root.querySelector(selector)
      const $$ = (selector) => [...root.querySelectorAll(selector)]
      const state = { period: 'day', activeReport: null, lastFocus: null }

      const methodNames = {
        card: 'Card',
        cash: 'Cash',
        gift: 'Gift Card',
        zelle: 'Zelle',
        wallet: 'VLINKPAY Wallet',
      }

      const orderFixtures = {
        card: [
          ['#1048', '2:31 PM · Mia Johnson', 186.40],
          ['#1046', '1:54 PM · Sophia Davis', 124.75],
          ['#1043', '12:42 PM · Emma Wilson', 212.20],
          ['#1039', '11:38 AM · Ava Martinez', 97.50],
          ['#1034', '10:11 AM · Olivia Brown', 154.00],
        ],
        cash: [
          ['#1047', '2:12 PM · Isabella Thomas', 82.25],
          ['#1041', '12:05 PM · Charlotte Lee', 143.70],
          ['#1036', '10:44 AM · Amelia Clark', 69.00],
        ],
        gift: [
          ['#1044', '1:03 PM · Harper Hall', 125.00],
          ['#1037', '11:09 AM · Evelyn Young', 98.00],
          ['#1031', '9:22 AM · Abigail King', 89.00],
        ],
        zelle: [
          ['#1042', '12:18 PM · Emily Scott', 74.00],
          ['#1033', '9:48 AM · Ella Green', 65.00],
        ],
        wallet: [
          ['#0975', 'Aug 24 · Grace Adams', 145.00],
          ['#0938', 'Aug 21 · Chloe Baker', 140.00],
        ],
      }

      const todayReport = {
        title: 'Today',
        dateLabel: 'Aug 31, 2026 · 12:00 AM–2:42 PM',
        shortLabel: 'Today · Aug 31, 2026',
        total: 3842.65,
        transactions: 28,
        payments: { card: [2468.20, 21], cash: [923.45, 8], gift: [312, 3], zelle: [139, 2], wallet: [0, 0] },
        details: { services: 2920, discounts: 147.50, products: 218.75, tax: 221.40, tips: 630 },
      }

      const weekRows = [
        { key: '2026-08-31', card: 2468.20, cash: 923.45, gift: 312, zelle: 139, wallet: 0, tip: 630, total: 3842.65, transactions: 28 },
        { key: '2026-09-01', card: 1900, cash: 720, gift: 180, zelle: 98.20, wallet: 100, tip: 430, total: 2998.20, transactions: 22 },
        { key: '2026-09-02', card: 2010.50, cash: 730, gift: 210, zelle: 124, wallet: 50, tip: 450, total: 3124.50, transactions: 24 },
        { key: '2026-09-03', card: 1750.40, cash: 600, gift: 180, zelle: 100, wallet: 50, tip: 395, total: 2680.40, transactions: 19 },
        { key: '2026-09-04', card: 2200.15, cash: 800, gift: 225, zelle: 100, wallet: 50, tip: 520, total: 3375.15, transactions: 25 },
        { key: '2026-09-05', card: 1789, cash: 590, gift: 231, zelle: 80, wallet: 35, tip: 485, total: 2725, transactions: 19 },
        { key: '2026-09-06', card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0 },
      ]

      const baseYearRows = [
        { month: 0, card: 28120.40, cash: 9812, gift: 2450, zelle: 1968, wallet: 900, tip: 5210, total: 43250.40, transactions: 312 },
        { month: 1, card: 31840.20, cash: 10920, gift: 2800, zelle: 2250, wallet: 1100, tip: 5900, total: 48910.20, transactions: 348 },
        { month: 2, card: 36420.75, cash: 12420, gift: 3050, zelle: 2590, wallet: 1200, tip: 6700, total: 55680.75, transactions: 401 },
        { month: 3, card: 34110.30, cash: 11300, gift: 2780, zelle: 2750, wallet: 1200, tip: 6200, total: 52140.30, transactions: 376 },
        { month: 4, card: 39080.10, cash: 13450, gift: 3100, zelle: 3050, wallet: 1200, tip: 7100, total: 59880.10, transactions: 425 },
        { month: 5, card: 40250.80, cash: 13980, gift: 3200, zelle: 2690, wallet: 1200, tip: 7350, total: 61320.80, transactions: 439 },
        { month: 6, card: 45142.85, cash: 15100, gift: 3750, zelle: 3100, wallet: 1250, tip: 8200, total: 68342.85, transactions: 482 },
        { month: 7, card: 48400.60, cash: 16320.60, gift: 4108, zelle: 2884, wallet: 777, tip: 9760, total: 72490.20, transactions: 516 },
        { month: 8, card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0, future: true },
        { month: 9, card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0, future: true },
        { month: 10, card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0, future: true },
        { month: 11, card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0, future: true },
      ]

      function dateFromIso(iso) { return new Date(`${iso}T00:00:00Z`) }
      function isoFromDate(date) { return date.toISOString().slice(0, 10) }
      function roundMoney(value) { return Math.round(value * 100) / 100 }

      function setText(selector, value) {
        const element = $(selector)
        if (element) element.textContent = value
      }

      function formatRange(from, to) { return `${fullDate.format(dateFromIso(from))} – ${fullDate.format(dateFromIso(to))}` }
      function formatWeekRange(from, to) { return formatRange(from,to) }

      function syntheticDay(iso) {
        if (iso === TODAY) return { ...weekRows[0] }
        const date = dateFromIso(iso)
        const day = date.getUTCDate()
        if (date.getUTCDay() === 0) return { key: iso, card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0 }
        const totalCents = 175000 + ((day * 13711) % 150000)
        const card = Math.round(totalCents * 0.63)
        const cash = Math.round(totalCents * 0.22)
        const gift = Math.round(totalCents * 0.06)
        const zelle = Math.round(totalCents * 0.05)
        const wallet = totalCents - card - cash - gift - zelle
        return {
          key: iso,
          card: card / 100,
          cash: cash / 100,
          gift: gift / 100,
          zelle: zelle / 100,
          wallet: wallet / 100,
          tip: Math.round(totalCents * 0.16) / 100,
          total: totalCents / 100,
          transactions: 15 + (day % 15),
        }
      }

      function dateRange(from, to) {
        const rows = []
        const cursor = dateFromIso(from)
        const end = dateFromIso(to)
        while (cursor <= end) {
          rows.push(syntheticDay(isoFromDate(cursor)))
          cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
        return rows
      }

      function weekBounds(value) {
        const match = /^(\d{4})-W(\d{2})$/.exec(value)
        if (!match) return [TODAY, '2026-09-06']
        const year = Number(match[1])
        const week = Number(match[2])
        const jan4 = new Date(Date.UTC(year, 0, 4))
        const day = jan4.getUTCDay() || 7
        const monday = new Date(jan4)
        monday.setUTCDate(jan4.getUTCDate() - day + 1 + ((week - 1) * 7))
        const sunday = new Date(monday)
        sunday.setUTCDate(monday.getUTCDate() + 6)
        return [isoFromDate(monday), isoFromDate(sunday)]
      }

      function reportForDay(iso) {
        if (iso === TODAY) return { ...todayReport }
        const row = syntheticDay(iso)
        const tips = row.tip
        const tax = roundMoney(row.total * 0.057)
        const products = roundMoney(row.total * 0.08)
        const discounts = roundMoney(row.total * 0.04)
        const services = roundMoney(row.total + discounts - products - tax - tips)
        return {
          title: 'Day report',
          dateLabel: `${fullDate.format(dateFromIso(iso))} · Full business day`,
          shortLabel: `Day · ${fullDate.format(dateFromIso(iso))}`,
          total: row.total,
          transactions: row.transactions,
          payments: {
            card: [row.card, Math.round(row.transactions * 0.75)],
            cash: [row.cash, Math.round(row.transactions * 0.3)],
            gift: [row.gift, Math.round(row.transactions * 0.1)],
            zelle: [row.zelle, Math.round(row.transactions * 0.08)],
            wallet: [row.wallet, Math.round(row.transactions * 0.05)],
          },
          details: { services, discounts, products, tax, tips },
        }
      }

      function yearRows(year) {
        if (year === THIS_YEAR) {
          return baseYearRows.map((row) => ({ ...row, key: `${year}-${String(row.month + 1).padStart(2, '0')}` }))
        }
        const factor = year === 2025 ? 0.91 : 0.82
        return baseYearRows.map((row) => {
          const scaled = {}
          ;['card', 'cash', 'gift', 'zelle', 'wallet', 'tip'].forEach((key) => { scaled[key] = roundMoney(row[key] * factor) })
          return {
            ...row,
            ...scaled,
            key: `${year}-${String(row.month + 1).padStart(2, '0')}`,
            total: roundMoney(scaled.card + scaled.cash + scaled.gift + scaled.zelle + scaled.wallet),
            transactions: Math.round(row.transactions * factor),
            future: false,
          }
        })
      }

      function summarizeRows(rows) {
        return rows.reduce((sum, row) => {
          ;['card', 'cash', 'gift', 'zelle', 'wallet', 'tip', 'total', 'transactions'].forEach((key) => {
            sum[key] += Number(row[key] || 0)
          })
          return sum
        }, { card: 0, cash: 0, gift: 0, zelle: 0, wallet: 0, tip: 0, total: 0, transactions: 0 })
      }

      function showPicker(period) {
        $$('[data-period]').forEach((button) => { const active=button.dataset.period===period;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1; })
        $$('[data-picker]').forEach((picker) => { picker.hidden = picker.dataset.picker !== period })
      }

      function renderCommon(report) {
        state.activeReport = report
        setText('[data-period-title]', report.title)
        setText('[data-date-label]', report.dateLabel)
        setText('[data-payment-total]', currency.format(report.total))

        Object.entries(report.payments).forEach(([method, [amount, count]]) => {
          const row = $(`[data-payment-method="${method}"]`)
          if (row) {
            row.hidden = false
            const amountElement = row.querySelector('[data-payment-amount]')
            amountElement.textContent = currency.format(amount)
            amountElement.setAttribute('data-payment-amount', String(amount))
            row.querySelector('[data-payment-count]').textContent = `${count} allocations`
          }
        })
        setText('[data-email-snapshot]', `${report.shortLabel} · ${currency.format(report.total)}`)
        enhanceDates(root)
      }

      function renderDay(iso) {
        state.period = 'day'
        $('[name="dayDate"]').value = iso
        showPicker('day')
        $('[data-day-view]').hidden = false
        $('[data-table-view]').hidden = true
        const report = reportForDay(iso)
        populateReportTable([syntheticDay(iso)], 'date')
        renderCommon(report)
        setText('[data-detail="services"]', currency.format(report.details.services))
        setText('[data-detail="discounts"]', `−${currency.format(report.details.discounts)}`)
        setText('[data-detail="products"]', currency.format(report.details.products))
        setText('[data-detail="tax"]', currency.format(report.details.tax))
        setText('[data-detail="tips"]', currency.format(report.details.tips))
        setText('[data-detail="total"]', currency.format(report.total))
      }

      function populateReportTable(rows, rowKind) {
        const totals = summarizeRows(rows)
        const isYear = rowKind === 'month'
        setText('[data-first-column]', isYear ? 'Month' : 'Date')

        const body = $('[data-report-table-body]')
        body.innerHTML = rows.map((row) => {
          const date = isYear ? new Date(Date.UTC(Number(row.key.slice(0, 4)), Number(row.key.slice(5, 7)) - 1, 1)) : dateFromIso(row.key)
          const label = isYear ? `${monthName.format(date)} ${date.getUTCFullYear()}` : rowDate.format(date)
          const meta = row.future ? 'Future month' : `${row.transactions} transactions`
          return `
            <tr class="report-data-row${row.future ? ' future-row' : ''}" tabindex="0" data-report-row data-row-kind="${rowKind}" data-row-key="${row.key}" data-future="${Boolean(row.future)}">
              <td class="row-period">${label}<span>${meta}</span></td>
              <td>${currency.format(row.card)}</td>
              <td>${currency.format(row.cash)}</td>
              <td>${currency.format(row.gift)}</td>
              <td>${currency.format(row.zelle)}</td>
              <td>${currency.format(row.wallet)}</td>
              <td class="tip-cell">${currency.format(row.tip)}</td>
              <td class="total-cell">${currency.format(row.total)}</td>
            </tr>`
        }).join('')

        ;['card', 'cash', 'gift', 'zelle', 'wallet', 'tip'].forEach((method) => setText(`[data-table-total-cell="${method}"]`, currency.format(totals[method])))
        setText('[data-table-grand-total]', currency.format(totals.total))
        return totals
      }

      function renderTable(rows, options) {
        const totals = populateReportTable(rows, options.rowKind)
        const isYear = options.rowKind === 'month'
        $('[data-day-view]').hidden = true
        $('[data-table-view]').hidden = false
        setText('[data-table-title]', isYear ? 'Monthly collection' : 'Daily collection')
        setText('[data-table-total]', currency.format(totals.total))
        const report = {
          title: options.title,
          dateLabel: options.dateLabel,
          shortLabel: options.shortLabel,
          total: roundMoney(totals.total),
          transactions: totals.transactions,
          payments: {
            card: [roundMoney(totals.card), 0],
            cash: [roundMoney(totals.cash), 0],
            gift: [roundMoney(totals.gift), 0],
            zelle: [roundMoney(totals.zelle), 0],
            wallet: [roundMoney(totals.wallet), 0],
          },
        }
        renderCommon(report)
      }

      function renderWeek() {
        state.period = 'week'
        showPicker('week')
        const value = $('[name="weekValue"]').value || THIS_WEEK
        const [from, to] = weekBounds(value)
        setText('[data-week-range]', formatWeekRange(from, to))
        const rows = value === THIS_WEEK ? weekRows.map((row) => ({ ...row })) : dateRange(from, to)
        const current = value === THIS_WEEK
        renderTable(rows, {
          rowKind: 'date',
          title: current ? 'This Week' : `Week · ${formatRange(from, to)}`,
          dateLabel: `${formatRange(from, to)} · Monday–Sunday`,
          shortLabel: `${current ? 'This Week' : 'Week'} · ${formatRange(from, to)}`,
        })
      }

      function renderYear() {
        state.period = 'year'
        showPicker('year')
        const year = Number($('[name="yearValue"]').value || THIS_YEAR)
        renderTable(yearRows(year), {
          rowKind: 'month',
          title: year === THIS_YEAR ? 'This Year' : `Year ${year}`,
          dateLabel: `${year} · 12 calendar months`,
          shortLabel: `${year === THIS_YEAR ? 'This Year' : 'Year'} · ${year}`,
        })
      }

      function renderRange(from, to) {
        state.period = 'range'
        showPicker('range')
        renderTable(dateRange(from, to), {
          rowKind: 'date',
          title: `Range · ${formatRange(from, to)}`,
          dateLabel: `${formatRange(from, to)} · Inclusive dates`,
          shortLabel: `Range · ${formatRange(from, to)}`,
        })
      }

      function selectPeriod(period) {
        $('[data-date-error]').hidden = true
        if (period === 'day') renderDay($('[name="dayDate"]').value || TODAY)
        if (period === 'week') renderWeek()
        if (period === 'year') renderYear()
        if (period === 'range') renderRange($('[name="fromDate"]').value, $('[name="toDate"]').value)
      }

      function openDrawer(key, title) {
        const report = state.activeReport
        const rows = orderFixtures[key] || []
        const amount = report.payments[key][0]
        const count = report.payments[key][1]
        state.lastFocus = document.activeElement
        setText('[data-drawer-title]', title)
        setText('[data-drawer-subtitle]', `${report.shortLabel} · Central Time (CT)`)
        setText('[data-drawer-count]', String(count))
        setText('[data-drawer-amount]', currency.format(amount))
        $('[data-order-list]').innerHTML = rows.map(([id, meta, rowAmount]) => `
          <article class="order-row" data-order-row>
            <div><div class="order-id">${id}</div><div class="order-meta">${meta}</div></div>
            <div><div class="order-amount">${currency.format(rowAmount)}</div><div class="order-status">Completed</div></div>
          </article>
        `).join('')
        const drawer = $('[data-order-drawer]')
        drawer.setAttribute('aria-hidden', 'false')
        document.body.style.overflow = 'hidden'
        $('[data-close-drawer]').focus()
      }

      function closeDrawer() {
        $('[data-order-drawer]').setAttribute('aria-hidden', 'true')
        document.body.style.overflow = ''
        if (state.lastFocus?.focus) state.lastFocus.focus()
      }

      function openEmail() {
        state.lastFocus = document.activeElement
        $('[data-email-error]').hidden = true
        $('[data-email-modal]').setAttribute('aria-hidden', 'false')
        document.body.style.overflow = 'hidden'
        $('[name="reportRecipient"]').focus()
      }

      function closeEmail() {
        $('[data-email-modal]').setAttribute('aria-hidden', 'true')
        document.body.style.overflow = ''
        if (state.lastFocus?.focus) state.lastFocus.focus()
      }

      let toastTimer
      function showToast(message) {
        const toast = $('[data-toast]')
        toast.textContent = message
        toast.hidden = false
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => { toast.hidden = true }, 5000)
      }

      function openReportRow(row) {
        if (row.dataset.future === 'true') return
        if (row.dataset.rowKind === 'date') {
          renderDay(row.dataset.rowKey)
          return
        }
        const [year, month] = row.dataset.rowKey.split('-').map(Number)
        const from = `${year}-${String(month).padStart(2, '0')}-01`
        const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
        const to = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`
        $('[name="fromDate"]').value = from
        $('[name="toDate"]').value = to
        renderRange(from, to)
      }

      periodKeys(root);

      $$('[data-period]').forEach((button) => button.addEventListener('click', () => selectPeriod(button.dataset.period)))
      $('[name="dayDate"]').addEventListener('change', (event) => { if(event.target.value)renderDay(event.target.value); })
      $('[name="weekValue"]').addEventListener('change', renderWeek)
      $('[name="yearValue"]').addEventListener('change', renderYear)
      $('[data-apply-range]').addEventListener('click', () => {
        const from = $('[name="fromDate"]').value
        const to = $('[name="toDate"]').value
        const error = $('[data-date-error]')
        if (!from || !to || from > to) {
          error.hidden = false
          return
        }
        error.hidden = true
        renderRange(from, to)
      })

      $('[data-report-table-body]').addEventListener('click', (event) => {
        const row = event.target.closest('[data-report-row]')
        if (row) openReportRow(row)
      })
      $('[data-report-table-body]').addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key)) return
        const row = event.target.closest('[data-report-row]')
        if (!row) return
        event.preventDefault()
        openReportRow(row)
      })

      $$('button[data-payment-method]').forEach((row) => row.addEventListener('click', () => openDrawer(row.dataset.paymentMethod, `${methodNames[row.dataset.paymentMethod]} payments`)))
      $('[data-close-drawer]').addEventListener('click', closeDrawer)
      $('[data-order-drawer]').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeDrawer() })

      $('[data-email-report]').addEventListener('click', openEmail)
      $('[data-close-email]').addEventListener('click', closeEmail)
      $('[data-cancel-email]').addEventListener('click', closeEmail)
      $('[data-email-modal]').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeEmail() })
      $('[data-send-report]').addEventListener('click', () => {
        const input = $('[name="reportRecipient"]')
        const email = input.value.trim()
        const error = $('[data-email-error]')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          error.hidden = false
          input.focus()
          return
        }
        error.hidden = true
        closeEmail()
        showToast(`Report snapshot sent to ${email}.`)
      })

      $('[data-print-report]').addEventListener('click', () => printReport())

      root.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return
        if ($('[data-email-modal]').getAttribute('aria-hidden') === 'false') closeEmail()
        else if ($('[data-order-drawer]').getAttribute('aria-hidden') === 'false') closeDrawer()
      })

      renderDay(TODAY)

return function(){if($('[data-email-modal]').getAttribute('aria-hidden')==='false')closeEmail();if($('[data-order-drawer]').getAttribute('aria-hidden')==='false')closeDrawer();};
}
function initService(root){

    const dateError = root.querySelector('[data-date-error]')
    const detailOverlay = root.querySelector('[data-detail-overlay]')
    const closeDetailButton = root.querySelector('[data-close-detail]')
    let activeDetailTrigger = null

    const detailData = {
      'deluxe-pedicure': { name: 'Deluxe Pedicure', revenue: '$1,170.00', count: '18 service lines' },
      'gel-manicure': { name: 'Gel Manicure', revenue: '$1,008.00', count: '28 service lines' },
      'king-pedicure': { name: 'King Pedicure', revenue: '$780.00', count: '12 service lines' },
      'classic-manicure': { name: 'Classic Manicure', revenue: '$504.00', count: '21 service lines' },
      'callus-treatment': { name: 'Deluxe Pedicure — Callus Treatment', revenue: '$320.00', count: '10 service lines' },
      'acrylic-full-set': { name: 'Acrylic Full Set', revenue: '$248.00', count: '5 service lines' },
      'nail-art': { name: 'Gel Manicure — Nail Art', revenue: '$144.00', count: '6 service lines' },
      'polish-change': { name: 'Polish Change', revenue: '$112.00', count: '4 service lines' },
    }

    function closeDetail() {
      detailOverlay.setAttribute('aria-hidden', 'true')
      document.body.classList.remove('has-overlay')
      activeDetailTrigger?.focus()
    }

    const reportData = window.NEXORA_TECHNICIAN_REPORT_DATA;
    const fixtureDate = root.querySelector('[name="fromDate"]').value;
    const today = reportData.iso(new Date());
    const chartMarkup = Array.from(root.querySelectorAll('.column-plot')).map(plot => plot.innerHTML);
    function renderRange() {
      const from=root.querySelector('[name="fromDate"]').value,to=root.querySelector('[name="toDate"]').value;
      const invalid=!from||!to||from>to;dateError.hidden=!invalid;if(invalid)return;
      const label=from===to?reportData.formatDate(from):reportData.formatDate(from)+' – '+reportData.formatDate(to);
      root.querySelector('[data-service-context-title]').textContent=from===to?reportData.formatDate(from):'Range';
      root.querySelector('[data-service-context-date]').textContent=label+' · America/Chicago';
      const hasData=fixtureDate>=from&&fixtureDate<=to;
      root.querySelectorAll('.column-plot').forEach((plot,index) => { plot.innerHTML=hasData?chartMarkup[index]:'<p class="ptr-service-empty">No completed services in this period.</p>'; });
      root.querySelector('[data-total-revenue]').textContent=hasData?'$4,286.00':'$0.00';
      root.querySelector('[data-total-count]').textContent=hasData?'104':'0';
      root.querySelector('.drawer-subtitle').textContent=label+' · America/Chicago';
      enhanceDates(root);
    }
    root.querySelector('[data-apply-range]').addEventListener('click',renderRange);
    root.querySelectorAll('[name="fromDate"],[name="toDate"]').forEach(input=>{input.max=today;});
    renderRange();

    root.addEventListener('click',event => {
      const button=event.target.closest('[data-service-id]');if(!button)return;
      const detail=detailData[button.dataset.serviceId];if(!detail)return;
      root.querySelector('[data-detail-title]').textContent=detail.name;
      root.querySelector('[data-detail-revenue]').textContent=detail.revenue;
      root.querySelector('[data-detail-count]').textContent=detail.count;
      activeDetailTrigger=button;detailOverlay.setAttribute('aria-hidden','false');document.body.classList.add('has-overlay');closeDetailButton.focus();
    });
    root.querySelector('.drawer-footer .button').addEventListener('click',()=>{location.href='pos-completed-services.html';});

    closeDetailButton.addEventListener('click', closeDetail)
    detailOverlay.addEventListener('click', (event) => { if (event.target === detailOverlay) closeDetail() })
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || detailOverlay.getAttribute('aria-hidden') === 'true') return
      closeDetail()
    })

return function(){if(detailOverlay.getAttribute('aria-hidden')==='false')closeDetail();};
}

window.NEXORA_POS_INCOME_REPORTS={show:function(container,kind){var state=mounted.get(container);if(!state){state={views:{},active:''};mounted.set(container,state);}if(state.active!==kind&&state.views[state.active])state.views[state.active].deactivate();if(!state.views[kind]){var view=document.createElement('section');view.dataset.posIncome=kind;view.setAttribute('aria-labelledby','ptr-'+kind+'-title');view.innerHTML=templates[kind];container.appendChild(view);state.views[kind]={view:view,deactivate:(kind==='store'?initStore:initService)(view)};}Object.keys(state.views).forEach(function(key){state.views[key].view.hidden=key!==kind;});state.active=kind;container.hidden=false;},hide:function(container){var state=mounted.get(container);if(state&&state.views[state.active])state.views[state.active].deactivate();if(state)state.active='';container.hidden=true;}};
})();
