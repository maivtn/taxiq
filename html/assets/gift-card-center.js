/* Gift Card Center: PO catalog hierarchy plus operational screens read on
 * staging-merchant.vlinkpay.com, Oct 27, 2026. Prototype state stays local.
 * Nexora entry: /dashboard/pos?tab=gift-card-center opens Issue Digital in Front Desk.
 * Sources: /gift-voucher/product-management/{issue-digital,quick-create-card,sell-egift-form},
 * /payment-process/payment-gift-card, /settings/{benefits-setup,membership-report},
 * /reports/{card-transaction-history,expiring-cards}. */
(function () {
  "use strict";
  const root = document.getElementById("gift-center"),
    dialog = document.getElementById("gift-dialog");
  if (!root || !dialog) return;
  const storageKey = "nexora.gift-card-center.v1";
  const asset = "../assets/gift-card-center/";
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value) || 0);
  const date = (value) =>
    value
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(value.length === 10 ? value + "T12:00:00" : value))
      : "";
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const addDays = (value, days) => {
    const d = new Date(value + "T12:00:00");
    d.setDate(d.getDate() + Number(days));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const terms = [
    "Valid for services only. Not applicable to products.",
    "No cash value.",
    "Valid for one-time use per invoice.",
    "Please present this card before payment.",
    "Cannot be combined with membership credit. Customer must use all available credit before applying any discount.",
  ];
  const colors = ['#1e293b','#064e3b','#7f1d1d','#4c1d95','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ffd84d','#dbcd43'];
  const textColors = ['#3b82f6','#ca8a04','#ffffff','#000000'];
  const automaticColors = {textColor:'#e6c575',holderColor:'#ffffff',amountColor:'#e6c575',infoColor:'#eeeeee'};
  const brandPrompts = window.NEXORA_GIFT_BRAND_PROMPTS || [];
  const logoStyles = ['Luxury Gold','Minimalist','Vintage Badge','Playful','Modern – Tech','Pastel','Vibrant'];
  const typeIcons = {
    "Gift Card": "gift-card",
    Membership: "membership",
    "Crypto Card": "crypto-card",
    "Prepaid Card": "prepaid",
    Discount: "discount",
    Promotion: "promotion",
  };
  const paymentIcons = {
    Gift: "gift",
    Cash: "cash",
    "Credit Card": "credit",
    Zelle: "zelle",
    Venmo: "venmo",
    VLINKPAY: "vlinkpay",
  };
  const definitions = {
    issue: [
      "Issue Digital",
      "Issue card in-store and sell directly to customer",
    ],
    membership: [
      "Issue Digital",
      "Issue card in-store and sell directly to customer",
    ],
    quick: ["Quick Setup", "Issue card and sell it online through VLINKPAY"],
    advanced: [
      "Advanced Setup",
      "Issue card and sell it online through VLINKPAY",
    ],
    cards: ["Product Management", "Manage all issued cards"],
    redeem: ["Gift Card Payment", ""],
    benefits: [
      "Membership Program Setup",
      "Configure membership tiers, benefits and packages for your customers",
    ],
    "membership-package": ["Create Membership Package", ""],
    members: [
      "Membership report",
      "Track membership package sales, usage and redemptions.",
    ],
    transactions: [
      "Gift Card Payment History",
      "Review every gift card redemption and payment transaction.",
    ],
    expiring: [
      "Expiring Cards",
      "View and filter customers whose cards are about to expire.",
    ],
  };
  const routeMap = {
    "/gift-voucher/product-management/issue-digital": "issue",
    "/gift-voucher/product-management/quick-create-card": "quick",
    "/gift-voucher/product-management/sell-egift-form": "advanced",
    "/gift-voucher/product-management": "cards",
    "/payment-process/payment-gift-card": "redeem",
    "/settings/benefits-setup": "benefits",
    "/settings/membership-report": "members",
    "/reports/card-transaction-history": "transactions",
    "/reports/expiring-cards": "expiring",
  };
  const sampleCards = [
    {
      id: "gc-demo-1",
      type: "Gift Card",
      source: "store",
      name: "Mary Smith",
      email: "mary.smith@example.com",
      number: "2853 0000 0000 1502",
      created: "2026-10-07",
      amount: 200,
      balance: 195,
      payment: "Cash",
      status: "Active",
      expires: "",
      terms: terms.join("\n"),
    },
    {
      id: "gc-demo-2",
      type: "Membership",
      source: "store",
      name: "Mary Smith",
      email: "mary.smith@example.com",
      number: "0874 0000 0000 8177",
      created: "2026-03-26",
      amount: 500,
      balance: 500,
      payment: "Cash",
      status: "Active",
      expires: "2026-06-24",
      period: 90,
      tier: "PLATINUM",
      terms: terms.join("\n"),
    },
    {
      id: "gc-demo-3",
      type: "Gift Card",
      source: "store",
      name: "Mai Test",
      email: "mai.test@example.com",
      number: "6478 0000 0000 6308",
      created: "2026-10-02",
      amount: 50,
      balance: 50,
      payment: "Cash",
      status: "Active",
      expires: "",
      terms: terms.join("\n"),
    },
  ];
  function load() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
    } catch (_) {}
    return {
      cards: Array.isArray(saved.cards)
        ? saved.cards
        : sampleCards.map((c) => ({ ...c })),
      benefits: Array.isArray(saved.benefits)
        ? saved.benefits
        : [
            {
              id: "BEN698",
              name: "Gift",
              unit: "Time Used",
              active: true,
              date: "2026-06-23",
              icon: "gift",
            },
            {
              id: "BEN692",
              name: "Cashback",
              unit: "Currency",
              active: true,
              date: "2026-06-04",
              icon: "hand-coins",
            },
          ],
      packages: Array.isArray(saved.packages)
        ? saved.packages
        : [
            {
              id: "PKG001",
              name: "PLATINUM",
              price: 500,
              period: 90,
              benefits: ["BEN698"],
              active: true,
              date: "2026-03-26",
            },
          ],
      transactions: Array.isArray(saved.transactions)
        ? saved.transactions
        : [
            {
              id: "c6914e16-demo-3ad199c5",
              date: "2026-10-07",
              type: "Redeem",
              amount: -5,
              card: "gc-demo-1",
              balance: 195,
              status: "Completed",
              note: "-",
            },
          ],
      drafts:
        saved.drafts && typeof saved.drafts === "object" ? saved.drafts : {},
      settings: saved.settings || {
        email: false,
        emailDays: 30,
        sms: false,
        smsDays: 30,
      },
      savedTerms: saved.savedTerms || terms.join("\n"),
      // Display balances belong to the prototype, never the staging wallet.
      cryptoWallet: saved.cryptoWallet || {usdt:1000,usdv:1000},
    };
  }
  let store = load(),
    view = "",
    subtab = "",
    formDraft = null,
    filter = {
      query: "",
      type: "All",
      status: "All Statuses",
      from: "",
      to: "",
      locked: "All Statuses",
      searchBy: "Card Number",
      minimum: "",
      maximum: "",
      days: 30,
    },
    page = 1,
    pageSize = 10,
    visibleColumns = null,
    paymentMode = "";
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch (_) {
      /* Keep the current session usable when browser storage is full. */
    }
  }
  function url(next, tab) {
    return (
      "gift-card-center.html" +
      (next
        ? "?view=" +
          encodeURIComponent(next) +
          (tab ? "&tab=" + encodeURIComponent(tab) : "")
        : "")
    );
  }
  function navigate(next, tab = "", push = true) {
    if (dialog.open) dialog.close();
    if (push) history.pushState({}, "", url(next, tab));
    view = Object.hasOwn(definitions, next) ? next : "issue";
    subtab = tab;
    page = 1;
    pageSize = 10;
    filter = {
      query: "",
      type: "All",
      status: "All Statuses",
      from: "",
      to: "",
      locked: "All Statuses",
      searchBy: "Card Number",
      minimum: "",
      maximum: "",
      days: 30,
    };
    visibleColumns = null;
    paymentMode = "";
    formDraft = null;
    render();
    window.scrollTo({ top: 0 });
  }
  function setDraft() {
    store.drafts[view] = formDraft;
    save();
  }
  function getDraft() {
    const defaults = {
      type: ["membership", "membership-package"].includes(view)
        ? "Membership"
        : "Gift Card",
      tier:
        view === "membership"
          ? "Member"
          : view === "membership-package"
            ? "SILVER"
            : "STARTER",
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      amount: 50,
      discount: 0,
      maxDiscount: 10,
      promotionType: "Amount",
      cryptoAssets: [],
      cryptoAmounts: {},
      cryptoUnits: {},
      cryptoQuantity: 1,
      sendGift: false,
      requireAccount: false,
      feeCurrency: "USDV",
      recipientName: "",
      recipientEmail: "",
      payment: "Cash",
      period: ["membership", "membership-package"].includes(view)
        ? "30"
        : "none",
      benefit: "",
      category: "",
      quantity: 50,
      terms: store.savedTerms,
      brand: "Bitcoin Nail Bar",
      slogan: "GIFT CARD",
      brandPhone: "",
      brandEmail: "",
      website: "",
      background: 1,
      color: "",
      textColor: "#e6c575",
      holderColor: "#ffffff",
      amountColor: "#e6c575",
      infoColor: "#eeeeee",
      logo: "",
      logoPrompt: "",
      logoCategory: 0,
      logoStyles: [],
      products: "",
      samePercent: false,
      percent: 5,
      allowCustom: true,
      mostPopular: false,
      benefits: [],
      vouchers: [{ amount: 25, percent: 5, quantity: 1, terms: "" }],
      egifts: [{ amount: 25, percent: 5, quantity: 1, terms: "" }],
    };
    return { ...defaults, ...store.drafts[view] };
  }
  function button(label, action, extra = "", cls = "") {
    return `<button type="button" class="gc-button ${cls}" data-action="${action}" ${extra}>${label}</button>`;
  }
  function field(label, name, options = {}) {
    const value = options.value ?? formDraft?.[name] ?? "";
    return `<label class="gc-field">${label ? `<span>${label}${options.required ? ' <b class="gc-required">*</b>' : ""}</span>` : ""}<input name="${name}" type="${options.type || "text"}" value="${esc(value)}" ${options.placeholder ? `placeholder="${esc(options.placeholder)}"` : ""} ${options.required ? "required" : ""} ${options.min !== undefined ? `min="${options.min}"` : ""} ${options.max !== undefined ? `max="${options.max}"` : ""} ${options.step ? `step="${options.step}"` : ""} ${options.readonly ? "readonly" : ""} ${options.list?`list="${options.list}"`:""} aria-label="${esc(options.placeholder||label.replace(/<[^>]*>/g,""))}"></label>`;
  }
  function select(label, name, items, value, extra = "") {
    return `<label class="gc-field"><span>${label}</span><select name="${name}" ${extra}>${items
      .map((x) => {
        const val = typeof x === "string" ? x : x[0],
          text = typeof x === "string" ? x : x[1];
        return `<option value="${esc(val)}" ${String(value) === String(val) ? "selected" : ""}>${esc(text)}</option>`;
      })
      .join("")}</select></label>`;
  }
  function dateField(label, name, value = "") {
    return `<label class="gc-field"><span>${label}</span><span class="gc-date"><span data-date-label>${value ? date(value) : label}</span><input type="date" name="${name}" value="${esc(value)}" aria-label="${esc(label)}" ${name === "dob" || name === "expiryDate" ? "required" : ""}></span></label>`;
  }
  function amountField(label, name, value, options = {}) {
    return `<label class="gc-field"><span>${label}${options.required ? ' <b class="gc-required">*</b>' : ""}</span><span class="gc-input-prefix"><span>${options.prefix || "$"}</span><input type="number" name="${name}" value="${esc(value)}" min="${options.min ?? 0}" ${options.max !== undefined ? `max="${options.max}"` : ""} step="${options.step || "0.01"}" placeholder="Custom" ${options.required ? "required" : ""}></span></label>`;
  }
  function choices(name, items, value, labels) {
    return `<div class="gc-choices">${items.map((x, i) => `<button type="button" class="gc-choice" data-choice="${name}" data-value="${esc(x)}" aria-pressed="${String(x).toLowerCase() === String(value).toLowerCase()}">${esc(labels ? labels[i] : x)}</button>`).join("")}</div>`;
  }
  function presetAmount(name, values, value, options = {}) {
    const preset=values.includes(Number(value));
    return `<div class="gc-choices">${values.map((n) => `<button type="button" class="gc-choice" data-choice="${name}" data-value="${n}" aria-pressed="${Number(value) === n}">${money(n).replace(".00", "")}</button>`).join("")}<span class="gc-custom">${amountField("", name, preset?"":value, { min: 0, ...options, required: !preset })}</span></div>`;
  }
  function preview() {
    const d = formDraft;
    const expiry=d.period==='date'&&d.expiryDate?date(d.expiryDate):d.period==='none'?'No Expiration':date(addDays(today(),d.period==='date'?30:d.period));
    return `<div class="gc-preview" data-card-preview style="${d.color?`background:${esc(d.color)};`:`background-image:url('${asset}background-${d.background}.png');background-size:cover;`}color:${esc(d.textColor)}"><div class="gc-preview-top"><div class="gc-preview-brand"><span class="gc-logo-slot">${d.logo?`<img src="${esc(d.logo)}" alt="" class="gc-brand-logo">`:''}</span><div><strong data-preview-brand>${esc(d.brand)}</strong><div class="gc-preview-type" data-preview-slogan>${esc(d.slogan)}</div></div></div><span class="gc-preview-value" data-preview-amount style="color:${esc(d.amountColor)}">${(d.type==='Discount'||d.type==='Promotion'&&d.promotionType==='Discount')?`${d.discount}%`:money(d.amount).replace('.00','')}</span></div><div class="gc-preview-number">•••• •••• •••• ••••</div><div class="gc-preview-expiry" style="color:${esc(d.infoColor)}">VALID THRU <span data-preview-expiry>${expiry}</span></div><span data-preview-holder style="color:${esc(d.holderColor)}">${esc(d.name)}</span><div class="gc-preview-bottom" style="color:${esc(d.infoColor)}"><span data-preview-type>${esc(d.type.toUpperCase())}</span><span class="gc-preview-provider"><img src="../assets/pos-payment/vlinkpay-logo.png" alt=""><strong>VLINKPAY</strong></span></div></div>`;
  }
  function textColorControl(label,name) {
    const value=formDraft[name];
    return `<div class="gc-text-color"><span>${label}</span><div><button type="button" class="gc-auto-color" data-text-auto="${name}">AUTO</button>${textColors.map(color=>`<button type="button" class="gc-color" style="--color:${color}" data-text-color="${name}" data-value="${color}" aria-label="Select color" aria-pressed="${value===color}"></button>`).join('')}<label class="gc-color gc-custom-color">${icon('palette')}<input type="color" name="${name}" value="${value}" aria-label="${esc(label)}"></label></div></div>`;
  }
  function brandIdentity() {
    const d=formDraft,category=brandPrompts[Number(d.logoCategory)]||brandPrompts[0];
    return `<section class="gc-card gc-brand-identity"><div class="gc-brand-heading"><span class="gc-subhead">${icon('sparkles')}BRAND IDENTITY ${icon('info')}</span><div class="gc-actions">${button(icon('folder')+'Library','library')}<label class="gc-file">${icon('upload')}Upload Logo<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label></div></div><div class="gc-style-tags">${logoStyles.map((label,index)=>`<button type="button" data-logo-style="${index}" aria-pressed="${d.logoStyles.includes(index)}">${label}</button>`).join('')}</div><label class="gc-field"><textarea name="logoPrompt" placeholder="Describe your logo idea" aria-label="Describe your logo idea">${esc(d.logoPrompt)}</textarea></label><div class="gc-suggestion-heading"><span>SUGGESTED DESCRIPTIONS <small>for</small></span><select name="logoCategory" aria-label="SUGGESTED DESCRIPTIONS">${brandPrompts.map((item,index)=>`<option value="${index}" ${Number(d.logoCategory)===index?'selected':''}>${esc(item.category.toUpperCase())}</option>`).join('')}</select></div><div class="gc-logo-suggestions">${(category?.prompts||[]).map((prompt,index)=>`<button type="button" data-logo-prompt="${index}" title="${esc(prompt)}">${esc(prompt)}</button>`).join('')}</div>${button(icon('sparkles')+'Generate Logo with AI','generate-logo','disabled','primary gc-generate-logo')}</section>`;
  }
  function phoneField(name,placeholder,required=false) {
    return `<div class="gc-phone-field"><select name="${name}Country" aria-label="${esc(placeholder)}"><option>+1</option></select>${field('',name,{placeholder,type:'tel',required})}</div>`;
  }
  function designer() {
    const d=formDraft;
    return `<aside class="gc-stack gc-designer"><section class="gc-card gc-card-stage"><div data-preview-container>${preview()}</div><button type="button" class="gc-preview-flip" data-action="flip">${icon('rotate-cw')}TAB TO FLIP CARD</button></section><section class="gc-card"><details class="gc-disclosure" data-gc-panel="design" open><summary>${icon('palette')}<span>DESIGN COLLECTION</span>${icon('info')}</summary><div class="gc-colors">${Array.from({length:10},(_,i)=>`<button type="button" class="gc-color" data-background="${i+1}" aria-label="Background ${i+1}" aria-pressed="${!d.color&&d.background===i+1}" style="background:url('${asset}background-${i+1}.png') center/cover"></button>`).join('')}${colors.map(c=>`<button type="button" class="gc-color" data-color="${c}" aria-label="Select theme color" aria-pressed="${d.color===c}" style="--color:${c}"></button>`).join('')}<label class="gc-color gc-custom-color">${icon('palette')}<input name="color" type="color" value="${d.color||'#152448'}" aria-label="Custom theme color"></label></div></details><details class="gc-disclosure gc-text-disclosure" data-gc-panel="text"><summary><span>CUSTOM TEXT COLOR (ADVANCED)</span>${icon('info')}</summary><div>${[['Brand Name & Slogan','textColor'],['Card Holder Name','holderColor'],['Amount Value','amountColor'],['Other info (Card type, Card number, Valid thru, Terms of use, Contact info)','infoColor']].map(([label,name])=>textColorControl(label,name)).join('')}</div></details></section>${brandIdentity()}<section class="gc-card"><details class="gc-disclosure" data-gc-panel="business"><summary>${icon('contact')}<span>BUSINESS INFORMATION & CONTACT</span>${icon('info')}</summary><div class="gc-stack">${field('Brand Name','brand')}${field('Brand Slogan','slogan')}<div class="gc-field"><span>Phone Number</span>${phoneField('brandPhone','(555) 123-4567')}</div>${field('Email Address','brandEmail',{type:'email'})}${field('Website','website',{type:'url'})}${button(icon('save')+'Save','save-draft')}</div></details></section></aside>`;
  }
  function termsEditor(name = "terms") {
    return `${["issue","membership"].includes(view)?"":`<div class="gc-actions" style="justify-content:flex-end;margin-bottom:10px">${button("Load T & C", "load-terms")}${button("Save T & C", "save-terms")}</div>`}<label class="gc-field"><textarea name="${name}" placeholder="${esc(terms.join("\n"))}">${esc(formDraft[name])}</textarea></label><div class="gc-terms">SUGGESTED TERMS<br>${terms.map((t, i) => `<button type="button" data-term="${i}">${esc(t)}</button>`).join("")}</div>`;
  }
  function panel(title, body) {
    const isTerms=title==='Terms and Conditions';
    return `<details class="gc-card gc-form-panel" data-gc-panel="${esc(title)}" ${isTerms?'':'open'}><summary><span class="gc-panel-title">${title}${icon('info')}</span>${isTerms?`<span class="gc-actions">${button(icon('folder-open')+'Load T & C','load-terms')}${button(icon('save')+'Save T & C','save-terms')}</span>`:''}</summary><div class="gc-panel-body">${body}</div></details>`;
  }
  const tierOptions={
    'Gift Card':['STARTER','BRONZE','SILVER','GOLD','PLATINUM','ELITE'],
    Membership:['Member','Silver','Gold','Platinum','Diamond','Royal'],
    Discount:['Welcome','Birthday','Student','Senior','Referral','Review'],
    Promotion:['Welcome','Birthday','Student','Senior','Referral','Review']
  };
  function productLine() {
    const d=formDraft,tiers=tierOptions[d.type]||[];
    return panel('Select Product Line <b class="gc-required">*</b>',`<div class="gc-products">${Object.entries(typeIcons).map(([name,file])=>`<button type="button" class="gc-choice" data-choice="type" data-value="${name}" aria-pressed="${d.type===name}"><img src="${asset}icon-${file}.png" alt="">${name}</button>`).join('')}</div>${tiers.length?`<div class="gc-tier-options">${choices('tier',tiers,d.tier)}<div class="gc-custom-tier">${field('','tier',{placeholder:'Custom',value:tiers.some(t=>t.toLowerCase()===String(d.tier).toLowerCase())?'':d.tier})}</div></div>`:''}`);
  }
  function customerInformation(member=false) {
    const d=formDraft;
    return panel('Customer Information'+(member?' <b class="gc-required">*</b>':''),`<div class="gc-fields ${member?'gc-member-customer':'three'}">${field('','name',{placeholder:member?'Name *':'Name',required:member,list:'gc-customer-options'})}<datalist id="gc-customer-options">${[...new Set(store.cards.map(c=>c.name).filter(Boolean))].map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist>${field('','email',{placeholder:'Email',type:'email'})}${member?dateField('Date of Birth *','dob',d.dob):''}${phoneField('phone',member?'Phone Number *':'Phone Number',member)}${member?field('','address',{placeholder:'Address (optional)'}):''}</div>`);
  }
  function expiration() {
    const d=formDraft;
    return panel('Expiration <b class="gc-required">*</b>',select('','period',[['30','30 Days'],['60','60 Days'],['90','90 Days'],['180','180 Days'],['365','365 Days'],['date','Select Date…'],['none','No Expiration']],d.period)+(d.period==='date'?dateField('Select Date…','expiryDate',d.expiryDate):''));
  }
  function discountChoices(required=true) {
    const d=formDraft,preset=[5,10,15,20].includes(Number(d.discount));
    return `${choices('discount',[5,10,15,20],d.discount,['5%','10%','15%','20%'])}${amountField('','discount',preset||!d.discount?'':d.discount,{prefix:'%',min:0,max:100,required:required&&!preset})}`;
  }
  function paymentMethods() {
    return panel('Payment Method <b class="gc-required">*</b>',`<div class="gc-products gc-payment-methods">${Object.entries(paymentIcons).map(([name,file])=>`<button type="button" class="gc-choice" data-choice="payment" data-value="${name}" aria-pressed="${formDraft.payment===name}"><img src="${asset}payment-${file}.png" alt="">${name}</button>`).join('')}</div><div class="gc-fee"><span>Platform Service Fee (0%)</span><strong>Free</strong></div><div class="gc-submit"><button type="submit" class="gc-button primary large">Confirm Issuance</button></div>`);
  }
  const cryptoAssetList=['VMM','USDT','USDV','VPOINT','VMMBONUS','BTC','ETH','VMMC','USDC','Dogecoin','ADA','VCREDIT','VGIFT','VNV','XRP','VLG','USDR','VPC','VND','USD','VPOINT_ALT','WINNER','SHIB'].map(code=>({id:code.toLowerCase(),code:code==='VPOINT_ALT'?'VPOINT':code,icon:code==='VPOINT_ALT'?'vpoint':code==='VPOINT'?'vpoint-rewards':code.toLowerCase()}));
  const cryptoAsset=id=>cryptoAssetList.find(item=>item.id===id);
  const cryptoBalance=id=>Number(store.cryptoWallet[id])||0;
  const cryptoImage=item=>`<img src="${asset}currencies/${item.icon}.png" alt="${item.code}">`;
  const cryptoValue=()=>formDraft.cryptoAssets.reduce((sum,id)=>sum+(Number(formDraft.cryptoAmounts[id])||0),0);
  const cryptoQuantity=()=>Math.max(1,Math.floor(Number(formDraft.cryptoQuantity)||1));
  const cryptoFee=()=>Math.round(cryptoValue()*cryptoQuantity()*1.5)/100;
  function cryptoReady(){
    const quantity=cryptoQuantity(),fee=cryptoFee(),currency=formDraft.feeCurrency.toLowerCase();
    return formDraft.cryptoAssets.length>0&&formDraft.cryptoAssets.every(id=>Number(formDraft.cryptoAmounts[id])>0&&Number(formDraft.cryptoAmounts[id])*quantity+(id===currency?fee:0)<=cryptoBalance(id))&&fee<=cryptoBalance(currency);
  }
  function cryptoSummary() {
    const d=formDraft,value=cryptoValue(),quantity=cryptoQuantity(),fee=cryptoFee();
    return `${d.cryptoAssets.length?`<details class="gc-crypto-used" open><summary>Total Crypto Used ${icon('chevron-down')}</summary>${d.cryptoAssets.map(id=>`<div>${cryptoImage(cryptoAsset(id))}<strong>${cryptoAsset(id).code}</strong><span>${money(Number(d.cryptoAmounts[id])*quantity)}<small>≈ ${Number(d.cryptoAmounts[id])*quantity||0} ${cryptoAsset(id).code}</small></span></div>`).join('')}<div class="gc-crypto-total"><span>Card Value<strong>${money(value)}</strong></span><span>Total Value<strong>${money(value*quantity)}</strong></span></div></details>`:''}<div class="gc-crypto-fees"><div><span>Platform Service Fee (0%)</span><strong>Free</strong></div><div><span>Transfer Fee (1.5%)</span><strong>${fee?money(fee):'Free'}</strong></div><div><span>Total Fees ${button(icon('info'),'crypto-fees','aria-label="Open fees overview"','icon-only')}</span><strong>${fee?money(fee):'Free'}</strong></div></div><div class="gc-crypto-fee-method"><span>Fee Payment Method</span><label class="gc-fee-currency">${cryptoImage(cryptoAsset(d.feeCurrency.toLowerCase()))}<select name="feeCurrency" aria-label="Fee Payment Method">${cryptoAssetList.map(item=>`<option value="${item.code}" ${d.feeCurrency===item.code?'selected':''} ${cryptoBalance(item.id)>0?'':'disabled'}>${item.code}</option>`).join('')}</select></label><small>Exchange Rate 1 ${esc(d.feeCurrency)} = $1</small><strong>${fee.toFixed(2)}</strong></div><div class="gc-submit"><button type="submit" class="gc-button primary large" ${cryptoReady()?'':'disabled'}>Confirm Issuance</button></div>`;
  }
  function cryptoFields(){
    const d=formDraft,quantity=cryptoQuantity();
    return panel('Select Crypto Assets <b class="gc-required">*</b>',`<details class="gc-assets-picker" data-gc-panel="crypto-picker"><summary>${d.cryptoAssets.length?d.cryptoAssets.map(id=>`<span>${cryptoImage(cryptoAsset(id))}${cryptoAsset(id).code}</span>`).join(''):'Select Crypto Assets'}${icon('chevron-down')}</summary><div class="gc-assets-options"><strong>Select Assets</strong>${cryptoAssetList.map(item=>`<label><input type="checkbox" data-crypto-asset="${item.id}" ${d.cryptoAssets.includes(item.id)?'checked':''} ${cryptoBalance(item.id)>0?'':'disabled'}>${cryptoImage(item)}<span>${item.code}<small>${cryptoBalance(item.id).toFixed(4)} ${item.code}</small></span><small>Value: ${money(cryptoBalance(item.id))}</small></label>`).join('')}</div></details><div class="gc-asset-values">${d.cryptoAssets.map(id=>{const item=cryptoAsset(id);return `<section><div class="gc-asset-name">${cryptoImage(item)}<strong>${item.code}</strong><small>Qty: ${cryptoBalance(id)} ${item.code}<br>Value: ${money(cryptoBalance(id))}</small></div><div class="gc-asset-input"><span>$</span><input type="number" data-crypto-amount="${id}" aria-label="${item.code}" placeholder="0" value="${esc(d.cryptoAmounts[id]||'')}" min="0.01" max="${cryptoBalance(id)/quantity}" step="0.01" required><select data-crypto-unit="${id}" aria-label="${item.code}"><option ${d.cryptoUnits[id]==='USD'||!d.cryptoUnits[id]?'selected':''}>USD</option><option ${d.cryptoUnits[id]===item.code?'selected':''}>${item.code}</option></select><button type="button" class="gc-button icon-only" data-crypto-remove="${id}" aria-label="Remove">${icon('trash-2')}</button></div></section>`;}).join('')}</div><p class="gc-note">Select one or more crypto assets to back the card value</p>`)+panel('Card Quantity <b class="gc-required">*</b>',`<div class="gc-quantity"><button class="gc-button" type="button" data-crypto-quantity="-1" ${quantity===1?'disabled':''}>−</button><input name="cryptoQuantity" type="number" min="1" step="1" value="${quantity}" aria-label="Card Quantity" required><button class="gc-button" type="button" data-crypto-quantity="1">+</button></div><label class="gc-check"><input type="checkbox" name="sendGift" ${d.sendGift?'checked':''}>Send as a gift ${icon('info')}</label>${d.sendGift?`<div class="gc-fields">${field('Recipient Name','recipientName',{placeholder:'John Doe'})}${field('Recipient Email','recipientEmail',{placeholder:'johndoe@example.com',type:'email'})}</div>`:''}<label class="gc-check"><input type="checkbox" name="requireAccount" ${d.requireAccount?'checked':''}>Require VlinkPay account to use card ${icon('info')}</label>`)+`<section class="gc-card" data-crypto-summary>${cryptoSummary()}</section>`;
  }
  function refreshCrypto(){
    if(formDraft?.type!=='Crypto Card')return;
    formDraft.amount=cryptoValue();setDraft();
    const summary=root.querySelector('[data-crypto-summary]');if(summary)summary.innerHTML=cryptoSummary();
    updatePreview();refreshIcons();
  }
  function issue() {
    const d=formDraft,member=d.type==='Membership',discount=d.type==='Discount',promotion=d.type==='Promotion',crypto=d.type==='Crypto Card';
    let body=productLine();
    if(crypto)body+=cryptoFields();
    else {
      body+=customerInformation(member);
      if(member)body+=panel('Benefits <b class="gc-required">*</b>',`${select('','benefit',[['','Select Benefit'],...store.benefits.filter(b=>b.active).map(b=>[b.id,b.name])],d.benefit,'required')}<div style="margin-top:10px">${button('+ Add Benefit','add-benefit')}</div>`);
      if(member||discount||promotion)body+=expiration();
      if(discount)body+=panel('Discount <b class="gc-required">*</b>',discountChoices())+panel('Max Discount Amount',presetAmount('maxDiscount',[10,15,20,25],d.maxDiscount));
      else if(promotion)body+=panel('Promotion Type <b class="gc-required">*</b>',`${choices('promotionType',['Amount','Discount'],d.promotionType)}<div class="gc-promotion-value">${d.promotionType==='Discount'?discountChoices():presetAmount('amount',[5,10,15,20,25],d.amount)}</div>`);
      else body+=panel((member?'Price':'Amount')+' <b class="gc-required">*</b>',presetAmount('amount',member?[50,100,500,1000,2000]:[50,100,250,500],d.amount));
      if(member)body+=panel('Discount (Optional)',discountChoices(false));
      body+=panel('Terms and Conditions',termsEditor())+paymentMethods();
    }
    return `<form id="gc-issue-form" class="gc-form-layout">${designer()}<div class="gc-stack"><p class="gc-required-note"><span class="gc-required">*</span> required</p>${body}</div></form>`;
  }
  function quick() {
    const d = formDraft;
    return `<form id="gc-quick-form" class="gc-form-layout">${designer()}<div class="gc-stack"><p class="gc-required-note"><span class="gc-required">*</span> required</p>${panel('Step 1: Select Product Line <b class="gc-required">*</b>', `${choices("type", ["Gift Card", "Voucher"], d.type)}<div style="margin-top:15px">${select("", "category", [["", "Select Category"], "Beauty", "Restaurant", "Apparel", "Prepaid Cards", "Destination", "Entertainment", "Home", "Lifestyle", "Shopping", "Wellness"], d.category, "required")}</div>`)}${panel('Step 2: Amount & Cashback <b class="gc-required">*</b>', `<span class="gc-note">Amount ($) ($25 – $5,000)</span>${presetAmount("amount", [50, 100, 250, 500], d.amount, { min: 25, max: 5000 })}<div style="margin-top:16px">${choices("percent", [5, 10, 15, 20], d.percent, ["5%", "10%", "15%", "20%"])}${amountField("Cashback (%)", "percent", d.percent, { prefix: "%", max: 100 })}</div>`)}${panel('Step 3: Quantity <b class="gc-required">*</b>', `${choices("quantity", [50, 100, 200, 400], d.quantity)}${amountField("", "quantity", d.quantity, { prefix: "#", required: true, min: 1, step: 1 })}`)}${panel("Step 4: Terms and conditions", termsEditor())}<div class="gc-submit"><button type="submit" class="gc-button primary large">Create</button></div></div></form>`;
  }
  function advancedCard(kind, item, index) {
    const voucher = kind === "vouchers";
    return `<article class="gc-advanced-card gc-card"><div class="gc-preview" style="background-image:url('${item.image || asset + "background-" + (item.background || (voucher ? 3 : 1)) + ".png"}');background-size:cover"><div class="gc-preview-top"><strong>${esc(formDraft.brand)}</strong><span>${voucher ? "E-VOUCHER" : "E-GIFT CARD"}</span></div><div class="gc-preview-bottom"><strong style="font-size:22px">${money(item.amount)}</strong><strong>${item.percent}%</strong></div></div><div class="gc-advanced-tools"><button type="button" data-action="template" data-kind="${kind}" data-index="${index}">Template design</button><label>Upload<input type="file" data-card-upload="${kind}:${index}" accept="image/*" style="display:none"></label><button type="button" data-action="preview-advanced" data-kind="${kind}" data-index="${index}">Preview</button></div><div class="gc-advanced-controls"><span class="gc-note">${voucher ? "Voucher Amount" : "Gift Amount"} (require)<br>($25 – $5,000)</span><input type="number" class="gc-search" data-advanced="${kind}:${index}:amount" value="${item.amount}" min="25" max="5000" step=".01" required><div class="gc-fields" style="margin-top:14px"><label class="gc-field"><span>${voucher ? "Discount (%)" : "Cashback (%)"}</span><input type="number" data-advanced="${kind}:${index}:percent" value="${item.percent}" min="0" max="100" required></label><label class="gc-field"><span>Quantity</span><input type="number" data-advanced="${kind}:${index}:quantity" value="${item.quantity}" min="1" required></label></div><button type="button" class="gc-button" style="margin-top:12px;width:100%" data-action="conditions" data-kind="${kind}" data-index="${index}">Conditions of Use <b class="gc-required">*</b></button><label class="gc-check"><input type="checkbox" data-remove-card="${kind}:${index}">Select</label><button type="button" class="gc-button" data-action="remove-advanced" data-kind="${kind}" data-index="${index}">Remove</button></div></article>`;
  }
  function advanced() {
    const d = formDraft;
    return `<form id="gc-advanced-form"><div class="gc-advanced-intro"><p><strong>Step 1:</strong> Let’s get acquainted! To sell E-Gift on VLINKPAY, we first ask that you need KYB</p><p><strong>Step 2:</strong> Let’s get acquainted! To sell E-Gift on VLINKPAY, we ask that you provide, Logo Product and Services, % Cashback, Conditions of Use.<br>E-Gift card or E-Voucher, business time and date of Operation.</p><a class="gc-breadcrumb" href="owner-setting.html?tab=business-verification">This flow requires business verification (KYB). ${icon("arrow-up-right")}</a></div><div class="gc-stack">${panel('Business logo <b class="gc-required">*</b>', `<div class="gc-actions"><label class="gc-file">Click here to update logo<input name="logo" type="file" accept="image/*" ${d.logo ? "" : "required"}></label>${d.logo ? `<img src="${esc(d.logo)}" class="gc-brand-logo" alt="">` : ""}<span class="gc-note">Customize your brand logo and text</span></div>`)}${panel('List of products and services <b class="gc-required">*</b>', `<div class="gc-fields">${field("", "products", { placeholder: "Product or service", required: true })}<div class="gc-fields"><label class="gc-check"><input type="checkbox" name="samePercent" ${d.samePercent ? "checked" : ""}>Same Percent (%)</label>${field("", "percent", { type: "number", min: 0, max: 100 })}</div></div><p class="gc-note">*Specify if applicable to all products or only specific items</p>`)}</div>${[
      ["vouchers", "E-Voucher", "Add E-Voucher"],
      ["egifts", "E-Gift Card", "Add E-Gift Card"],
    ]
      .map(
        ([kind, title, add]) =>
          `<h2 class="gc-section-line">${title}</h2><div class="gc-advanced-row">${d[kind].map((x, i) => advancedCard(kind, x, i)).join("")}<button type="button" class="gc-add-card" data-action="add-advanced" data-kind="${kind}">${icon("credit-card")} ${add}</button></div>`,
      )
      .join(
        "",
      )}<label class="gc-check"><input type="checkbox" name="allowCustom" ${d.allowCustom ? "checked" : ""}>Allow users to specify the eGift amount</label><p>Merchant Cashback : ${d.percent}%</p>${panel('Terms and Conditions <b class="gc-required">*</b>', termsEditor())}<p>By clicking Create, you have read and you agree to the above Terms and Conditions.</p><button type="submit" class="gc-button primary large">Create</button></form>`;
  }
  function pagination(count) {
    const sizes = view === "cards" ? [10, 20, 30] : [10, 20, 50, 100];
    const pages = Math.max(1, Math.ceil(count / pageSize));
    page = Math.min(page, pages);
    return `<div class="gc-pagination"><span>Rows per page:</span><select name="pageSize" aria-label="Rows per page">${sizes.map((n) => `<option ${n === pageSize ? "selected" : ""}>${n}</option>`).join("")}</select><button type="button" class="gc-page-button" data-action="previous" aria-label="Previous page" ${page === 1 ? "disabled" : ""}>‹</button><button type="button" class="gc-page-button" aria-current="page">${page}</button><button type="button" class="gc-page-button" data-action="next" aria-label="Next page" ${page === pages ? "disabled" : ""}>›</button><span>Go to page:</span><input type="number" name="page" min="1" max="${pages}" value="${page}" aria-label="Go to page"></div>`;
  }
  function rowsPage(rows) {
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(page, pages);
    return rows.slice((page - 1) * pageSize, page * pageSize);
  }
  function table(headers, rows, empty = "") {
    const selected = visibleColumns || headers.map((_, i) => i);
    return `<div class="gc-table-wrap"><table class="gc-table"><thead><tr>${headers.map((h, i) => (selected.includes(i) ? `<th scope="col">${esc(h)}</th>` : "")).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, i) => (selected.includes(i) ? `<td>${cell}</td>` : "")).join("")}</tr>`).join("") || `<tr><td class="gc-empty" colspan="${selected.length}">${esc(empty)}</td></tr>`}</tbody></table></div>`;
  }
  function tabs(items, selected, attr = "tab") {
    return `<div class="gc-top-tabs" role="tablist">${items.map(([value, label]) => `<button type="button" role="tab" data-${attr}="${value}" aria-selected="${selected === value}">${label}</button>`).join("")}</div>`;
  }
  const number = (card) =>
    card.number.slice(0, 4) + " **** **** " + card.number.slice(-4);
  function cardType(card) {
    return `<span class="gc-badge">${esc(card.type)}</span><br><span class="gc-badge blue">${card.source === "online" ? "Issued on VLINKPAY" : "Issued in Store"}</span>`;
  }
  function matchesDate(row, field = "created") {
    return (
      (!filter.from || row[field] >= filter.from) &&
      (!filter.to || row[field] <= filter.to)
    );
  }
  function matchesText(value) {
    return (
      !filter.query ||
      String(value).toLowerCase().includes(filter.query.toLowerCase())
    );
  }
  function cards() {
    const all = store.cards.filter(
      (card) =>
        (subtab !== "online" || card.source === "online") &&
        (subtab !== "store" || card.source === "store"),
    );
    const rows = all.filter(
      (card) =>
        (filter.type === "All" || card.type === filter.type) &&
        (["Amount", "Discount"].includes(filter.searchBy)
          ? (filter.minimum === "" ||
              Number(
                filter.searchBy === "Amount" ? card.amount : card.discount || 0,
              ) >= Number(filter.minimum)) &&
            (filter.maximum === "" ||
              Number(
                filter.searchBy === "Amount" ? card.amount : card.discount || 0,
              ) <= Number(filter.maximum))
          : matchesText(
              filter.searchBy === "Card Number"
                ? card.number.replace(/\s/g, "") + " " + number(card)
                : filter.searchBy === "Email"
                  ? card.email
                  : card.phone || "",
            )) &&
        matchesDate(card) &&
        (filter.status === "All Statuses" ||
          (card.approval || "Approved") === filter.status) &&
        (filter.locked === "All Statuses" ||
          Boolean(card.locked) === (filter.locked === "Locked")),
    );
    const headers = [
      "Type",
      "Customer",
      "Card Number",
      "Created Date",
      "Amount",
      "Payment Method",
      "Actions",
    ];
    const types = [
      "All",
      "Gift Card",
      "Crypto Card",
      "Membership",
      "E-Gift Card",
      "Voucher",
      "Promotion",
      "Discount",
      "Prepaid Card",
    ];
    return `${tabs(
      [
        ["all", "ALL"],
        ["online", "ISSUED ON VLINKPAY"],
        ["store", "ISSUED IN STORE"],
      ],
      subtab || "all",
    )}<section class="gc-card"><div class="gc-choices">${types.map((type) => `<button type="button" class="gc-choice" data-filter-type="${type}" aria-pressed="${filter.type === type}">${type} <span class="gc-badge">${type === "All" ? all.length : all.filter((c) => c.type === type).length}</span></button>`).join("")}</div><div class="gc-filter-row">${select("Search by", "searchBy", ["Card Number", "Email", "Phone", "Amount", "Discount"], filter.searchBy)}${["Amount", "Discount"].includes(filter.searchBy) ? `<label class="gc-field"><span>From (${filter.searchBy === "Amount" ? "$" : "%"})</span><input type="number" name="minimum" min="0" value="${esc(filter.minimum)}"></label><label class="gc-field"><span>To (${filter.searchBy === "Amount" ? "$" : "%"})</span><input type="number" name="maximum" min="0" value="${esc(filter.maximum)}"></label>` : `<input class="gc-search" name="query" data-query placeholder="${{ "Card Number": "Enter card number...", Email: "Enter email address...", Phone: "Enter phone number..." }[filter.searchBy]}" value="${esc(filter.query)}" aria-label="${filter.searchBy}">`}${dateField("Created Date From", "from", filter.from)}${dateField("To", "to", filter.to)}${select("Product Status", "status", ["All Statuses", "Awaiting Approval", "Approved", "Rejected", "Inactive", "Waiting Update"], filter.status)}${select("Card Locked", "locked", ["All Statuses", "Locked", "Unlocked"], filter.locked)}${button(icon("list-filter"), "columns", 'aria-label="Columns"', "icon-only")}</div>${table(
      headers,
      rowsPage(rows).map((card) => [
        cardType(card),
        `<strong>${esc(card.name || "-")}</strong><small>${esc(card.email || "")}</small><small>${esc(card.phone || "")}</small>`,
        number(card),
        date(card.created),
        `<strong style="color:#147b67">${money(card.amount)}</strong>`,
        esc(card.payment),
        button(
          icon("eye"),
          "details",
          `data-id="${esc(card.id)}" aria-label="View Details"`,
          "icon-only",
        ),
      ]),
    )}${pagination(rows.length)}</section>`;
  }
  function benefits() {
    const packages = subtab === "packages";
    const rows = (packages ? store.packages : store.benefits).filter(
      (item) =>
        matchesText(item.id + " " + item.name) &&
        (filter.status === "All Statuses" ||
          (item.active ? "Active" : "Inactive") === filter.status),
    );
    return `${tabs(
      [
        ["benefits", "Benefit List"],
        ["packages", "Membership package"],
      ],
      packages ? "packages" : "benefits",
    )}<section class="gc-card"><div class="gc-filter-row"><input class="gc-search" name="query" data-query placeholder="${packages ? "Package ID, Name" : "Benefit ID, Name"}" value="${esc(filter.query)}" aria-label="${packages ? "Package ID, Name" : "Benefit ID, Name"}">${select("Status", "status", ["All Statuses", "Active", "Inactive"], filter.status)}</div>${
      packages
        ? table(
            [
              "Package ID",
              "Package Name",
              "Price",
              "Currency",
              "Billing Cycle",
              "Benefit Count",
              "Status",
              "Sale Status",
              "Created Date",
              "Last Updated Date",
              "Actions",
            ],
            rowsPage(rows).map((p) => [
              esc(p.id),
              esc(p.name),
              money(p.price),
              "USD",
              esc(p.period) + " days",
              p.benefits.length,
              `<input type="checkbox" class="gc-switch" data-toggle-package="${p.id}" aria-label="${esc(p.name)}" ${p.active ? "checked" : ""}><span class="gc-badge">${p.active ? "ACTIVE" : "INACTIVE"}</span>`,
              p.active ? "ACTIVE" : "INACTIVE",
              date(p.date),
              date(p.updated || p.date),
              button(
                icon("pencil"),
                "edit-package",
                `data-id="${p.id}" aria-label="${esc(p.name)}"`,
                "icon-only",
              ),
            ]),
          )
        : table(
            [
              "Icon",
              "Benefit ID",
              "Benefit Name",
              "Benefit Unit",
              "Status",
              "Created Date",
              "Actions",
            ],
            rowsPage(rows).map((b) => [
              `<img src="../assets/icon-oneqr/issue-2040-oneqr-${esc(b.icon || "gift")}-3d.png" alt="" width="30" height="30">`,
              esc(b.id),
              esc(b.name),
              esc(b.unit),
              `<input type="checkbox" class="gc-switch" data-toggle-benefit="${b.id}" aria-label="${esc(b.name)}" ${b.active ? "checked" : ""}> <span class="gc-badge">${b.active ? "ACTIVE" : "INACTIVE"}</span>`,
              date(b.date),
              button(
                icon("pencil"),
                "edit-benefit",
                `data-id="${b.id}" aria-label="${esc(b.name)}"`,
                "icon-only",
              ),
            ]),
          )
    }${pagination(rows.length)}</section>`;
  }
  function membershipPackage() {
    const d = formDraft;
    return `<form id="gc-package-form" class="gc-form-layout">${designer()}<div class="gc-stack"><label class="gc-check"><input type="checkbox" name="mostPopular" ${d.mostPopular ? "checked" : ""}>Mark as Most Popular</label><p class="gc-required-note"><span class="gc-required">*</span> required</p>${panel('Step 1: Package Name <b class="gc-required">*</b>', `${choices("tier", ["SILVER", "GOLD", "PLATINUM", "ELITE"], d.tier)}${field("", "tier", { placeholder: "Custom", required: true })}`)}${panel(
      'Step 2: Benefits <b class="gc-required">*</b>',
      store.benefits
        .filter((b) => b.active)
        .map(
          (b) =>
            `<label class="gc-check"><input type="checkbox" name="packageBenefit" value="${b.id}" ${d.benefits.includes(b.id) ? "checked" : ""}>${esc(b.name)}</label>`,
        )
        .join("") + button("+ Add Benefit", "add-benefit"),
    )}${panel('Step 3: Price <b class="gc-required">*</b>', presetAmount("amount", [50, 100, 500, 1000, 2000], d.amount))}${panel("Step 4: Discount", `${choices("discount", [5, 10, 15, 20], d.discount, ["5%", "10%", "15%", "20%"])}${amountField("", "discount", d.discount, { prefix: "%", max: 100 })}`)}${panel('Step 5: Membership Period <b class="gc-required">*</b>', `${choices("period", [30, 60, 90, 180, 365], d.period, ["30 Days", "60 Days", "90 Days", "180 Days", "365 Days"])}${field("", "period", { type: "number", min: 1, required: true, placeholder: "Custom" })}`)}${panel("Step 6: Terms & Conditions", termsEditor())}<button type="submit" class="gc-button primary large">Create and Activate Package</button></div></form>`;
  }
  function members() {
    const packages = subtab === "packages",
      cards = store.cards.filter(
        (c) =>
          c.type === "Membership" &&
          matchesText(number(c) + " " + c.number + " " + c.tier) &&
          matchesDate(c),
      );
    const groups = store.packages.filter((p) => matchesText(p.name));
    return `${tabs(
      [
        ["cards", "Member Card Report"],
        ["packages", "Membership Package Report"],
      ],
      packages ? "packages" : "cards",
    )}<section class="gc-card"><div class="gc-filter-row"><input class="gc-search" data-query name="query" placeholder="${packages ? "Package name..." : "Card number, Package name..."}" value="${esc(filter.query)}" aria-label="${packages ? "Package name..." : "Card number, Package name..."}">${packages ? "" : dateField("Start date", "from", filter.from) + dateField("End date", "to", filter.to)}</div>${
      packages
        ? table(
            [
              "Package Name",
              "Period",
              "Price",
              "Total members",
              "Active",
              "Expired",
              "Fee Percent",
              "Fee Amount",
              "% Discount",
              "Discount Amount",
              "Total Revenue",
            ],
            rowsPage(groups).map((p) => {
              const cs = store.cards.filter(
                (c) => c.type === "Membership" && c.tier === p.name,
              );
              return [
                esc(p.name),
                p.period + " days",
                money(p.price),
                cs.length,
                cs.filter((c) => !c.expires || c.expires >= today()).length,
                cs.filter((c) => c.expires && c.expires < today()).length,
                "0%",
                money(0),
                (p.discount || 0) + "%",
                money(((p.price || 0) * (p.discount || 0)) / 100),
                money(cs.reduce((s, c) => s + c.amount, 0)),
              ];
            }),
          )
        : table(
            [
              "Card number",
              "Package Name",
              "Start Date",
              "End Date",
              "Period",
              "Price",
              "Fee Percent",
              "Fee Amount",
              "% Discount",
              "Discount Amount",
              "Total Revenue",
            ],
            rowsPage(cards).map((c) => [
              number(c),
              esc(c.tier || "MEMBER"),
              date(c.created),
              c.expires ? date(c.expires) : "-",
              (c.period || 30) + " days",
              money(c.amount),
              "0%",
              money(0),
              (c.discount || 0) + "%",
              money((c.amount * (c.discount || 0)) / 100),
              money(c.amount * (1 - (c.discount || 0) / 100)),
            ]),
          )
    }${pagination(packages ? groups.length : cards.length)}</section>`;
  }
  function filteredTransactions(cardId) {
    return store.transactions.filter((t) => {
      const c = store.cards.find((c) => c.id === t.card);
      return (
        (!cardId || t.card === cardId) &&
        matchesText((c?.name || "") + " " + (c?.number || "") + " " + t.id) &&
        (filter.type === "All" ||
          filter.type === "All Types" ||
          t.type === filter.type) &&
        (filter.status === "All Statuses" || t.status === filter.status) &&
        matchesDate(t, "date")
      );
    });
  }
  function transactionRows(rows) {
    return rows.map((t) => {
      const c = store.cards.find((c) => c.id === t.card);
      return [
        date(t.date),
        esc(t.type),
        money(t.amount),
        `${esc(c?.type || "Gift Card")}<small>Digital</small>`,
        `${c ? number(c) : "-"}<small>${esc(c?.name || "")}</small>`,
        `<span class="gc-badge">${esc(t.status)}</span>`,
        `<small>${esc(t.id)}</small>`,
        money(t.balance),
        "-",
        esc(t.note || "-"),
      ];
    });
  }
  const transactionHeaders = [
    "Transaction Date",
    "Type",
    "Amount",
    "Product",
    "Card Information",
    "Status",
    "Transaction ID",
    "Balance",
    "Performed by",
    "Note",
  ];
  function transactions() {
    const rows = filteredTransactions();
    return `<section class="gc-card"><div class="gc-filter-row"><input class="gc-search" data-query name="query" placeholder="Card holder, Card Number, TxID" value="${esc(filter.query)}" aria-label="Card holder, Card Number, TxID">${dateField("Start date", "from", filter.from)}${dateField("End date", "to", filter.to)}${select("Type", "type", ["All Types", "Redeem", "TopUp", "Purchase", "Refund", "Reload"], filter.type === "All" ? "All Types" : filter.type)}${select("Status", "status", ["All Statuses", "Completed", "Pending", "Failed"], filter.status)}${button(icon("list-filter"), "columns", 'aria-label="Columns"', "icon-only")}${button(icon("download") + "Export", "export")}</div>${table(transactionHeaders, transactionRows(rowsPage(rows)))}${pagination(rows.length)}</section>`;
  }
  function expiring() {
    if (subtab === "automatic") {
      return `${tabs(
        [
          ["cards", "Card list"],
          ["automatic", "Automatic sending"],
        ],
        "automatic",
      )}<form id="gc-reminders-form" class="gc-card gc-auto">${[
        [
          "email",
          "Email",
          "Enable automatic emails for expiring cards",
          "Turn this on to automatically send expiry reminder emails based on the number of days you configure.",
        ],
        [
          "sms",
          "SMS",
          "Enable automatic SMS for expiring cards",
          "Turn this on to automatically send expiry reminder SMS (using your AI Hub SMS credit) based on the number of days you configure, independently of email.",
        ],
      ]
        .map(
          ([key, title, label, help]) =>
            `<section><h3>${title}</h3><label class="gc-check"><input class="gc-switch" type="checkbox" name="${key}" ${store.settings[key] ? "checked" : ""}><span>${label}<small>${help}</small></span></label><div class="gc-actions" style="margin-top:14px"><span class="gc-note">Send a reminder</span><label class="gc-field"><input name="${key}Days" type="number" min="1" value="${store.settings[key + "Days"]}" placeholder="e.g. 30" aria-label="Send a reminder" ${store.settings[key] ? "" : "disabled"} required></label><span class="gc-note">days before expiry</span></div></section>`,
        )
        .join(
          "",
        )}<div><button type="submit" class="gc-button primary">Save settings</button></div></form>`;
    }
    const rows = store.cards.filter(
      (c) =>
        c.expires &&
        c.expires >= today() &&
        c.expires <= addDays(today(), filter.days) &&
        (filter.type === "All" ||
          filter.type === "All Types" ||
          (c.type === "Membership" ? "Membership Card" : c.type) ===
            filter.type) &&
        matchesText(
          c.number + " " + c.name + " " + c.email + " " + (c.phone || ""),
        ),
    );
    return `${tabs(
      [
        ["cards", "Card list"],
        ["automatic", "Automatic sending"],
      ],
      "cards",
    )}<section class="gc-card"><div class="gc-filter-row"><input class="gc-search" data-query name="query" placeholder="Card number, Customer name, Email, Phone..." aria-label="Card number, Customer name, Email, Phone..." value="${esc(filter.query)}">${select("Card Type", "type", ["All Types", "Gift Card", "Promotion Card", "Membership Card", "Discount Card", "Prepaid Card", "Crypto Card"], filter.type === "All" ? "All Types" : filter.type)}${select(
      "Expiring within",
      "days",
      [7, 15, 30, 60, 90].map((n) => [n, n + " days"]),
      filter.days,
    )}${button("Send Bulk Reminders", "bulk-reminders", rows.length ? "" : "disabled")}</div>${table(
      [
        "Type",
        "Customer",
        "Card Number",
        "Balance",
        "Expiry Date",
        "Status",
        "Email Sent",
        "Actions",
      ],
      rowsPage(rows).map((c) => [
        cardType(c),
        esc(c.name || "-"),
        number(c),
        money(c.balance),
        date(c.expires),
        esc(c.status),
        c.emailSent ? date(c.emailSent) : "-",
        button(
          icon("eye"),
          "details",
          `data-id="${c.id}" aria-label="View Details"`,
          "icon-only",
        ),
      ]),
      "No expiring cards found",
    )}${pagination(rows.length)}</section>`;
  }
  const redeemOptions = [
    [
      "amount",
      "Enter Amount",
      "Merchant inputs the amount. QR is generated with the exact value for the customer to scan.",
      "banknote",
    ],
    [
      "vlinkpay",
      "Scan VLINKPAY Issued Card QR",
      "Accept gift cards and vouchers purchased by customers on VLINKPAY, including E-Gift Cards and E-Vouchers.",
      "scan-line",
    ],
    [
      "store",
      "Scan Store Digital Card QR",
      "Accept digital cards issued by the merchant at the store, including gift cards, memberships, prepaid cards, discounts, and promotions.",
      "qr-code",
    ],
    [
      "charity",
      "Scan QR Charity Gift Card",
      "Accept charity gift cards issued through VLINKPAY's charity program.",
      "heart-handshake",
    ],
  ];
  function redeem() {
    if (paymentMode === "amount") {
      return `<div class="gc-payment-form">${button(icon("arrow-left") + "Gift Card Payment", "payment-back")}<h2>E-Gift Card Payment</h2><form id="gc-payment-form" class="gc-stack">${amountField("Enter amount", "paymentAmount", "", { required: true, min: 0.01 })}<label class="gc-field"><span>Note (optional)</span><textarea name="note"></textarea></label><button type="submit" class="gc-button primary">Generate QR Code</button></form><div data-payment-preview></div></div>`;
    }
    return `<div class="gc-top-tabs"><span class="gc-button">Gift Card Payment</span></div><div class="gc-redeem-options">${redeemOptions.map(([key, title, copy, ic]) => `<button type="button" class="gc-redeem-option" data-payment="${key}">${icon(ic)}<strong>${title}</strong><p>${copy}</p></button>`).join("")}</div>`;
  }
  function scanCard(kind) {
    const title =
      kind === "charity"
        ? "Pay with Charity Gift Card"
        : redeemOptions.find((o) => o[0] === kind)[1];
    openDialog(
      title,
      `<form>${field(kind === "vlinkpay" ? "Gift Card QR Code" : "Card Number", "cardCode", { value: "", required: true, placeholder: kind === "vlinkpay" ? "Enter or scan QR code" : "Enter card number or scan..." })}<p class="gc-note" data-card-error hidden>Please check and try again</p>${footer("Continue")}</form>`,
      (event) => {
        event.preventDefault();
        const raw = String(
            new FormData(event.currentTarget).get("cardCode"),
          ).trim(),
          digits = raw.replace(/[^0-9]/g, "");
        const card = store.cards.find(
          (c) =>
            (c.id === raw || c.number.replace(/\s/g, "") === digits) &&
            !c.locked &&
            (kind !== "store" || c.source === "store") &&
            (kind !== "vlinkpay" || c.source === "online"),
        );
        if (card) {
          cardDetails(card.id);
          return;
        }
        dialog.querySelector("[data-card-error]").hidden = false;
      },
    );
  }
  function render() {
    const panels=root.dataset.view===view?[...root.querySelectorAll('[data-gc-panel]')].map(node=>[node.dataset.gcPanel,node.open]):[];
    root.dataset.view=view;
    const [title, description] = definitions[view];
    document.title = "Nexora Touch — " + title;
    if (
      [
        "issue",
        "membership",
        "quick",
        "advanced",
        "membership-package",
      ].includes(view)
    )
      formDraft = formDraft || getDraft();
    const actions = [
      "issue",
      "membership",
      "quick",
      "membership-package",
    ].includes(view)
      ? button(
          icon("save") + "Save for Update Later",
          "save-draft",
          "",
          "outline",
        )
      : view === "cards"
        ? `<a class="gc-button primary" href="${url("issue")}" data-view="issue">${icon("plus")}Issue Card</a>`
        : view === "benefits"
          ? subtab === "packages"
            ? `<a class="gc-button primary" href="${url("membership-package")}" data-view="membership-package">Create Membership Package</a>`
            : button("Create Benefit", "add-benefit", "", "primary")
          : "";
    const content = {
      issue,
      membership: issue,
      quick,
      advanced,
      cards,
      benefits,
      "membership-package": membershipPackage,
      members,
      transactions,
      expiring,
      redeem,
    }[view]();
    root.innerHTML = `<div class="gc-head"><div><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</div><div class="gc-head-actions">${actions}</div></div>${content}`;
    for(const [key,open] of panels){const panel=[...root.querySelectorAll("[data-gc-panel]")].find(node=>node.dataset.gcPanel===key);if(panel)panel.open=open;}
    updateIssueValidity();
    refreshIcons();
    window.NEXORA_FRONT_DESK_TABS?.sync?.({active:"gift-card-center"});
    window.NEXORA_SHELL?.refreshSidebar?.();
  }
  function refreshIcons() {
    window.lucide?.createIcons?.();
  }
  function openDialog(title, body, submit) {
    if (dialog.open) dialog.close();
    dialog.setAttribute("aria-labelledby", "gc-dialog-title");
    dialog.innerHTML = `<div class="gc-dialog-head"><h2 id="gc-dialog-title">${esc(title)}</h2><button type="button" class="gc-button icon-only" data-close aria-label="Close">${icon("x")}</button></div>${body}`;
    dialog
      .querySelector("[data-close]")
      .addEventListener("click", () => dialog.close());
    dialog
      .querySelectorAll("[data-cancel]")
      .forEach((b) => b.addEventListener("click", () => dialog.close()));
    if (submit)
      dialog.querySelector("form")?.addEventListener("submit", submit);
    dialog.showModal();
    refreshIcons();
  }
  const footer = (label = "Create") =>
    `<div class="gc-actions"><button type="button" class="gc-button" data-cancel>Cancel</button><button class="gc-button primary" type="submit">${label}</button></div>`;
  function benefitDialog(id) {
    const existing = store.benefits.find((b) => b.id === id);
    let selectedIcon = existing?.icon || "gift";
    openDialog(
      existing ? "Benefit Name" : "Create New Benefit",
      `<p>Fill in the required information to create a new benefit</p><form><div class="gc-field"><span>Benefit Icon</span><small>Select a preset icon or upload your own image</small><div class="gc-icon-choices">${["gift", "hand-coins", "percent", "cake", "star", "crown"].map((name) => `<button type="button" data-benefit-icon="${name}" aria-label="Icon"><img src="../assets/icon-oneqr/issue-2040-oneqr-${name}-3d.png" alt=""></button>`).join("")}</div></div>${field("Benefit Name", "benefitName", { value: existing?.name || "", placeholder: "Enter benefit name", required: true })}<div class="gc-choices"><span class="gc-note">Suggestions</span>${["Discount", "Cashback", "Gift", "Birthday"].map((label) => `<button type="button" class="gc-choice" data-suggest-benefit="${label}">${label}</button>`).join("")}</div>${select("Benefit Unit", "benefitUnit", [["", "Select benefit unit"], "Percentage (%)", "Currency", "Time Used"], existing?.unit || "", "required")}${footer()}
    </form>`,
      (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const b = {
          id: existing?.id || "BEN" + String(Date.now()).slice(-7),
          name: String(data.get("benefitName")).trim(),
          unit: data.get("benefitUnit"),
          icon: selectedIcon,
          active: existing?.active ?? true,
          date: existing?.date || today(),
        };
        if (!b.name || !b.unit) return;
        if (existing) Object.assign(existing, b);
        else store.benefits.push(b);
        if (formDraft) {
          formDraft.benefit = b.id;
          setDraft();
        }
        save();
        dialog.close();
        render();
      },
    );
    dialog.querySelectorAll("[data-benefit-icon]").forEach((b) =>
      b.addEventListener("click", () => {
        selectedIcon = b.dataset.benefitIcon;
        dialog
          .querySelectorAll("[data-benefit-icon]")
          .forEach((other) =>
            other.setAttribute("aria-pressed", String(other === b)),
          );
      }),
    );
    dialog.querySelectorAll("[data-suggest-benefit]").forEach((b) =>
      b.addEventListener("click", () => {
        dialog.querySelector("[name=benefitName]").value =
          b.dataset.suggestBenefit;
      }),
    );
  }
  function cardDetails(id, tab = "info") {
    const card = store.cards.find((c) => c.id === id);
    if (!card) return;
    const detailRows = [
      ["Amount", money(card.amount)],
      ["Card Number", number(card)],
      ["PIN", "••••"],
      ["Current Balance", money(card.balance)],
      [
        "Times Used",
        store.transactions.filter((t) => t.card === id && t.type === "Redeem")
          .length,
      ],
      ["Expiration Date", card.expires ? date(card.expires) : "-"],
      ["Received Via", "-"],
      ["Phone Number", card.phone || "-"],
      ["Email", card.email || "-"],
      ["Payment Method", card.payment || "-"],
    ];
    const info = `<div class="gc-actions" style="margin:12px 0">${button("Send SMS", "card-sms", `data-id="${id}" ${card.phone ? "" : "disabled"}`)}${button("Send Email", "card-email", `data-id="${id}" ${card.email ? "" : "disabled"}`)}${button("Print", "card-print")}${button("Download", "card-download", `data-id="${id}"`)}${button("Reload", "card-reload", `data-id="${id}"`)}</div><p><span class="gc-badge">${card.approval || "Approved"}</span></p><div class="gc-fields">${detailRows.map(([label, value]) => `<div class="gc-field"><span class="gc-note">${label}</span><strong>${esc(value)}</strong></div>`).join("")}</div><h3 style="margin-top:20px">Terms & Conditions</h3><p style="white-space:pre-wrap">${esc(card.terms || "-")}</p>`;
    openDialog(
      "Product Details",
      `${tabs(
        [
          ["info", "Card Info"],
          ["transactions", "Transaction History"],
          ["history", "Product History"],
        ],
        tab,
        "detail-tab",
      )}<div>${tab === "info" ? info : tab === "transactions" ? table(transactionHeaders, transactionRows(store.transactions.filter((t) => t.card === id))) : table(["Created Date", "Type", "Status"], [[date(card.created), esc(card.type), esc(card.approval || "Approved")]])}</div>`,
    );
    dialog
      .querySelectorAll("[data-detail-tab]")
      .forEach((b) =>
        b.addEventListener("click", () => cardDetails(id, b.dataset.detailTab)),
      );
    dialog.querySelectorAll("[data-action]").forEach((b) =>
      b.addEventListener("click", () => {
        const action = b.dataset.action;
        if (action === "card-print") {
          document.body.classList.add("gc-printing");
          window.print();
          document.body.classList.remove("gc-printing");
        } else if (action === "card-download") downloadCard(card);
        else if (action === "card-reload") reloadCard(card);
        else if (action === "card-sms" || action === "card-email")
          contactCard(card, action === "card-sms" ? "sms" : "email");
      }),
    );
  }
  function contactCard(card, mode) {
    const label = mode === "sms" ? "Send SMS" : "Send Email";
    openDialog(
      label,
      `<form>${
        mode === "sms"
          ? select(
              "Country",
              "country",
              [
                ["+1", "United States (+1)"],
                ["+84", "Vietnam (+84)"],
              ],
              "+1",
            )
          : ""
      }${field(mode === "sms" ? "Phone number" : "Email", "recipient", { value: mode === "sms" ? card.phone : card.email, type: mode === "sms" ? "tel" : "email", required: true })}${footer(label)}</form>`,
      (event) => {
        event.preventDefault();
        store.deliveryDrafts = store.deliveryDrafts || [];
        store.deliveryDrafts.push({
          card: card.id,
          channel: mode,
          recipient: new FormData(event.currentTarget).get("recipient"),
          status: "Pending",
          date: today(),
        });
        save();
        dialog.close();
        cardDetails(card.id);
      },
    );
  }
  function reloadCard(card) {
    openDialog(
      "Reload",
      `<form>${amountField("Amount", "amount", "", { required: true, min: 0.01 })}${select("Payment Method", "payment", Object.keys(paymentIcons), "Cash")}${footer("Reload")}</form>`,
      (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget),
          amount = Number(data.get("amount"));
        if (amount <= 0) return;
        card.balance = Number(card.balance) + amount;
        store.transactions.unshift({
          id: "local-" + Date.now(),
          date: today(),
          type: "Reload",
          amount,
          card: card.id,
          balance: card.balance,
          status: "Completed",
          note: "-",
        });
        save();
        cardDetails(card.id);
      },
    );
  }
  function download(content, name, type = "text/csv;charset=utf-8") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  }
  async function downloadCard(card) {
    const bg = card.background || 1;
    let image = "";
    try {
      const blob = await (
        await fetch(asset + "background-" + bg + ".png")
      ).blob();
      image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="540" viewBox="0 0 860 540"><rect width="860" height="540" rx="32" fill="${esc(card.color || "#152448")}"/>${image ? `<image href="${image}" width="860" height="540" preserveAspectRatio="xMidYMid slice"/>` : ""}<g font-family="Arial,sans-serif" fill="${esc(card.textColor || "#e6c575")}"><text x="50" y="90" font-size="32">${esc(card.brand || "Bitcoin Nail Bar")}</text><text x="50" y="135" font-size="22">${esc(card.type)}</text><text x="50" y="280" font-size="50">${money(card.amount)}</text><text x="50" y="410" font-size="27">${number(card)}</text><text x="50" y="470" font-size="24">${esc(card.name || "")}</text></g></svg>`;
    download(svg, "gift-card-" + card.id + ".svg", "image/svg+xml");
  }
  function columnsDialog() {
    const headers =
      view === "cards"
        ? [
            "Type",
            "Customer",
            "Card Number",
            "Created Date",
            "Amount",
            "Payment Method",
            "Actions",
          ]
        : transactionHeaders;
    const selected = visibleColumns || headers.map((_, i) => i);
    openDialog(
      "Columns",
      `<form>${headers.map((h, i) => `<label class="gc-check"><input type="checkbox" name="column" value="${i}" ${selected.includes(i) ? "checked" : ""}>${h}</label>`).join("")}${footer("Save")}</form>`,
      (event) => {
        event.preventDefault();
        const selected = [
          ...new FormData(event.currentTarget).getAll("column"),
        ].map(Number);
        if (!selected.length) return;
        visibleColumns = selected;
        dialog.close();
        render();
      },
    );
  }
  function conditionsDialog(kind, index) {
    const card = formDraft[kind][index];
    openDialog(
      "Conditions of Use",
      `<form><label class="gc-field"><textarea name="conditions" required>${esc(card.terms)}</textarea></label>${footer("Save")}</form>`,
      (event) => {
        event.preventDefault();
        card.terms = new FormData(event.currentTarget).get("conditions");
        setDraft();
        dialog.close();
      },
    );
  }
  function libraryDialog() {
    openDialog(
      "Library",
      `<div class="gc-icon-choices">${["nexora-touch-logo.png", "nexora-logo.svg"].map((file, i) => `<button type="button" style="width:150px;height:80px" data-library="${file}" aria-label="${i ? "Nexora Touch" : "NEXORA TOUCH"}"><img src="../assets/${file}" alt="Nexora Touch"></button>`).join("")}</div>`,
    );
    dialog.querySelectorAll("[data-library]").forEach((b) =>
      b.addEventListener("click", () => {
        formDraft.logo = "../assets/" + b.dataset.library;
        setDraft();
        dialog.close();
        render();
      }),
    );
  }
  function updateIssueValidity(){
    if(!formDraft||formDraft.type!=='Membership')return;
    const submit=root.querySelector('#gc-issue-form [type=submit]');
    if(submit)submit.disabled=!(formDraft.name.trim()&&formDraft.phone.trim()&&formDraft.dob&&formDraft.benefit&&Number(formDraft.amount)>0&&(formDraft.period!=='date'||formDraft.expiryDate));
  }
  function updatePreview() {
    if (!formDraft) return;
    updateIssueValidity();
    const previewHost = root.querySelector("[data-preview-container]");
    if (previewHost) previewHost.innerHTML = preview();
  }
  function exportTransactions() {
    const rows = filteredTransactions(),
      values = transactionRows(rows).map((row) =>
        row.map((cell) => String(cell).replace(/<[^>]+>/g, " ")),
      );
    const csv = [transactionHeaders, ...values]
      .map((row) =>
        row
          .map((value) => '"' + String(value).replace(/"/g, '""') + '"')
          .join(","),
      )
      .join("\r\n");
    download("\uFEFF" + csv, "gift-card-payment-history.csv");
  }
  function routeLink(event) {
    const a = event.target.closest("[data-view]");
    if (
      !a ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return false;
    event.preventDefault();
    navigate(a.dataset.view);
    return true;
  }
  root.addEventListener("click", (event) => {
    if (routeLink(event)) return;
    const b = event.target.closest("button");
    if (!b || b.disabled) return;
    if(b.dataset.cryptoQuantity){formDraft.cryptoQuantity=Math.max(1,cryptoQuantity()+Number(b.dataset.cryptoQuantity));setDraft();render();return;}
    if(b.dataset.cryptoRemove){formDraft.cryptoAssets=formDraft.cryptoAssets.filter(id=>id!==b.dataset.cryptoRemove);refreshCrypto();render();return;}
    if (b.dataset.textColor || b.dataset.textAuto) {
      const name=b.dataset.textColor||b.dataset.textAuto;
      formDraft[name]=b.dataset.textAuto?automaticColors[name]:b.dataset.value;
      setDraft();render();return;
    }
    if (b.dataset.logoStyle !== undefined) {
      const index=Number(b.dataset.logoStyle),selected=new Set(formDraft.logoStyles);
      if(selected.has(index))selected.delete(index);else selected.add(index);
      formDraft.logoStyles=[...selected];setDraft();render();return;
    }
    if (b.dataset.logoPrompt !== undefined) {
      const category=brandPrompts[Number(formDraft.logoCategory)]||brandPrompts[0];
      formDraft.logoPrompt=category.prompts[Number(b.dataset.logoPrompt)];setDraft();
      const input=root.querySelector('[name=logoPrompt]');input.value=formDraft.logoPrompt;input.focus();return;
    }
    if (b.dataset.choice) {
      const key = b.dataset.choice;
      if(key==='type'&&formDraft.type===b.dataset.value)return;
      formDraft[key] = ["amount", "discount", "percent", "quantity", "maxDiscount"].includes(
        key,
      )
        ? Number(b.dataset.value)
        : b.dataset.value;
      if (key === "type" && formDraft.type === "Membership") {
        formDraft.tier = "Member";
        formDraft.benefit = "";
        formDraft.amount = 50;
        formDraft.discount = 0;
        formDraft.period = "30";
      } else if (key === "type") {
        formDraft.period = ['Discount','Promotion'].includes(formDraft.type)?'30':'none';
        formDraft.tier=tierOptions[formDraft.type]?.[0]||'';
        if(['Gift Card','Prepaid Card'].includes(formDraft.type)){formDraft.amount=50;formDraft.discount=0;}
        if(formDraft.type==='Crypto Card')formDraft.amount=cryptoValue();
        if(formDraft.type==='Discount'){formDraft.discount=5;formDraft.maxDiscount=10;formDraft.amount=0;}
        if(formDraft.type==='Promotion'){formDraft.promotionType='Amount';formDraft.amount=5;}
      }
      if(key==='promotionType')formDraft.amount=formDraft.promotionType==='Amount'?5:0;
      if(key==='type')formDraft.slogan=formDraft.type==='Crypto Card'?'':formDraft.type.toUpperCase();
      setDraft();
      render();
      return;
    }
    if (b.dataset.background) {
      formDraft.background = Number(b.dataset.background);
      formDraft.color = "";
      setDraft();
      render();
      return;
    }
    if (b.dataset.color) {
      formDraft.color = b.dataset.color;
      setDraft();
      render();
      return;
    }
    if (b.dataset.term !== undefined) {
      formDraft.terms =
        (formDraft.terms ? formDraft.terms + "\n" : "") +
        terms[Number(b.dataset.term)];
      setDraft();
      render();
      return;
    }
    if (b.dataset.tab) {
      subtab = b.dataset.tab;
      page = 1;
      visibleColumns = null;
      const u = new URL(location.href);
      u.searchParams.set("tab", subtab);
      history.replaceState({}, "", u);
      render();
      return;
    }
    if (b.dataset.filterType) {
      filter.type = b.dataset.filterType;
      page = 1;
      render();
      return;
    }
    if (b.dataset.payment) {
      if (b.dataset.payment === "amount") {
        paymentMode = "amount";
        render();
      } else scanCard(b.dataset.payment);
      return;
    }
    const action = b.dataset.action;
    if (!action) return;
    if(action==='crypto-fees'){
      const fee=cryptoFee();openDialog('Total Fees',`<div class="gc-crypto-fees"><div><span>Platform Service Fee (0%)</span><strong>Free</strong></div><div><span>Transfer Fee (1.5%)</span><strong>${fee?money(fee):'Free'}</strong></div><div><span>Total Fees</span><strong>${fee?money(fee):'Free'}</strong></div></div>`);return;
    }
    if (action === "save-draft") {
      setDraft();
      return;
    }
    if (action === "load-terms") {
      event.preventDefault();
      root.querySelector('[data-gc-panel="Terms and Conditions"]')?.setAttribute("open", "");
      formDraft.terms = store.savedTerms;
      setDraft();
      render();
      return;
    }
    if (action === "save-terms") {
      event.preventDefault();
      store.savedTerms = formDraft.terms;
      save();
      return;
    }
    if (action === "flip") {
      const host = root.querySelector("[data-preview-container]");
      if (host.dataset.flipped === "true") {
        host.dataset.flipped = "false";
        host.innerHTML = preview();
      } else {
        host.dataset.flipped = "true";
        host.innerHTML = `<div class="gc-preview gc-preview-back">${esc(formDraft.terms || "-").replace(/\n/g, "<br>")}</div>`;
      }
      return;
    }
    if (action === "library") {
      libraryDialog();
      return;
    }
    if (action === "add-benefit" || action === "edit-benefit") {
      benefitDialog(b.dataset.id);
      return;
    }
    if (action === "edit-package") {
      const p = store.packages.find((p) => p.id === b.dataset.id);
      if (!p) return;
      navigate("membership-package");
      formDraft = {
        ...getDraft(),
        editId: p.id,
        tier: p.name,
        amount: p.price,
        period: p.period,
        benefits: p.benefits,
        discount: p.discount || 0,
      };
      render();
      return;
    }
    if (action === "columns") {
      columnsDialog();
      return;
    }
    if (action === "details") {
      cardDetails(b.dataset.id);
      return;
    }
    if (action === "export") {
      exportTransactions();
      return;
    }
    if (action === "previous" || action === "next") {
      page += action === "next" ? 1 : -1;
      render();
      return;
    }
    if (action === "payment-back") {
      paymentMode = "";
      render();
      return;
    }
    if (action === "add-advanced") {
      formDraft[b.dataset.kind].push({
        amount: 25,
        percent: 5,
        quantity: 1,
        terms: "",
      });
      setDraft();
      render();
      return;
    }
    if (action === "remove-advanced") {
      formDraft[b.dataset.kind].splice(Number(b.dataset.index), 1);
      setDraft();
      render();
      return;
    }
    if (action === "conditions") {
      conditionsDialog(b.dataset.kind, Number(b.dataset.index));
      return;
    }
    if (action === "preview-advanced") {
      const item = formDraft[b.dataset.kind][Number(b.dataset.index)];
      openDialog(
        "Preview",
        `<div class="gc-preview" style="background-image:url('${item.image || asset + 'background-' + (item.background || (b.dataset.kind === 'vouchers' ? 3 : 1)) + '.png'}');background-size:cover"><strong>${esc(formDraft.brand)}</strong><strong>${money(item.amount)}</strong><p>${esc(item.terms || formDraft.terms)}</p></div>`,
      );
      return;
    }
    if (action === "template") {
      openDialog(
        "Template design",
        `<div class="gc-colors">${Array.from({ length: 10 }, (_, i) => `<button type="button" class="gc-color" data-template="${i + 1}" aria-label="Background ${i + 1}" style="width:65px;height:45px;border-radius:6px;background:url('${asset}background-${i + 1}.png') center/cover"></button>`).join("")}</div>`,
      );
      dialog.querySelectorAll("[data-template]").forEach((t) =>
        t.addEventListener("click", () => {
          formDraft[b.dataset.kind][Number(b.dataset.index)].background =
            Number(t.dataset.template);
          setDraft();
          dialog.close();
          render();
        }),
      );
      return;
    }
    if (action === "bulk-reminders") {
      store.reminderDrafts = store.cards
        .filter(
          (c) =>
            c.expires &&
            c.expires >= today() &&
            c.expires <= addDays(today(), filter.days),
        )
        .map((c) => ({ card: c.id, status: "Pending", date: today() }));
      save();
      return;
    }
  });
  root.addEventListener("input", (event) => {
    const input = event.target;
    if(input.name==='cryptoQuantity'&&formDraft?.type==='Crypto Card'){formDraft.cryptoQuantity=Math.max(1,Math.floor(Number(input.value)||1));root.querySelectorAll('[data-crypto-amount]').forEach(node=>node.max=cryptoBalance(node.dataset.cryptoAmount)/cryptoQuantity());refreshCrypto();return;}
    if(input.dataset.cryptoAmount){formDraft.cryptoAmounts[input.dataset.cryptoAmount]=Number(input.value)||0;refreshCrypto();return;}
    if (input.matches("[data-query]")) {
      const position = input.selectionStart;
      filter.query = input.value;
      page = 1;
      render();
      const next = root.querySelector("[data-query]");
      next?.focus();
      next?.setSelectionRange(position, position);
      return;
    }
    if (input.dataset.advanced) {
      const [kind, index, key] = input.dataset.advanced.split(":");
      formDraft[kind][Number(index)][key] = Number(input.value);
      setDraft();
      return;
    }
    if (
      formDraft &&
      input.name &&
      input.type !== "file" &&
      input.name !== "packageBenefit"
    ) {
      formDraft[input.name] =
        input.type === "checkbox"
          ? input.checked
          : input.type === "number"
            ? Number(input.value)
            : input.value;
      if(['amount','tier','discount','maxDiscount'].includes(input.name)){
        root.querySelectorAll('[data-choice="'+input.name+'"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===String(formDraft[input.name]))));
        if(input.name==='amount'||input.name==='maxDiscount')input.required=true;
        if(input.name==='discount')input.required=formDraft.type==='Discount'||formDraft.type==='Promotion'&&formDraft.promotionType==='Discount';
      }
      setDraft();
      updatePreview();
    }
  });
  root.addEventListener("change", (event) => {
    const input = event.target;
    if(input.dataset.cryptoAsset){formDraft.cryptoAssets=[...root.querySelectorAll('[data-crypto-asset]:checked')].map(node=>node.dataset.cryptoAsset);refreshCrypto();render();return;}
    if(input.dataset.cryptoUnit){formDraft.cryptoUnits[input.dataset.cryptoUnit]=input.value;setDraft();return;}
    if(input.name==='sendGift'||input.name==='cryptoQuantity'){formDraft[input.name]=input.name==='sendGift'?input.checked:Math.max(1,Math.floor(Number(input.value)||1));refreshCrypto();render();return;}
    if(input.name==='feeCurrency'){formDraft.feeCurrency=input.value;refreshCrypto();return;}
    if (input.type === "file") {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (input.dataset.cardUpload) {
          const [kind, index] = input.dataset.cardUpload.split(":");
          formDraft[kind][Number(index)].image = reader.result;
        } else formDraft.logo = reader.result;
        setDraft();
        render();
      };
      reader.readAsDataURL(file);
      return;
    }
    if(input.name==='logoCategory'){
      formDraft.logoCategory=Number(input.value);setDraft();render();return;
    }
    if(input.name==='name'&&formDraft){
      const customer=store.cards.find(card=>card.name===input.value);
      if(customer){for(const name of ['email','phone']){if(customer[name]){formDraft[name]=customer[name];const input=root.querySelector('[name="'+name+'"]');if(input)input.value=customer[name];}}setDraft();updateIssueValidity();return;}
    }
    if (input.name === "packageBenefit") {
      formDraft.benefits = [
        ...root.querySelectorAll("[name=packageBenefit]:checked"),
      ].map((i) => i.value);
      setDraft();
      return;
    }
    if (input.dataset.toggleBenefit) {
      const b = store.benefits.find(
        (b) => b.id === input.dataset.toggleBenefit,
      );
      if (b) b.active = input.checked;
      save();
      render();
      return;
    }
    if (input.dataset.togglePackage) {
      const p = store.packages.find(
        (p) => p.id === input.dataset.togglePackage,
      );
      if (p) p.active = input.checked;
      save();
      render();
      return;
    }
    if (input.name === "pageSize") {
      pageSize = Number(input.value);
      page = 1;
      render();
      return;
    }
    if (input.name === "page") {
      page = Math.max(1, Number(input.value) || 1);
      render();
      return;
    }
    if (!formDraft && Object.hasOwn(filter, input.name)) {
      filter[input.name] =
        input.name === "days" ? Number(input.value) : input.value;
      if (input.name === "searchBy") {
        filter.query = "";
        filter.minimum = "";
        filter.maximum = "";
      }
      page = 1;
      render();
      return;
    }
    if (input.type === "date")
      input.closest(".gc-date").querySelector("[data-date-label]").textContent =
        input.value ? date(input.value) : input.getAttribute("aria-label");
    if (formDraft && input.name === "period") {
      render();
      return;
    }
    if (view === "expiring" && ["email", "sms"].includes(input.name)) {
      const days = root.querySelector("[name=" + input.name + "Days]");
      if (days) days.disabled = !input.checked;
    }
  });
  document.addEventListener('pointerdown',event=>{
    root.querySelectorAll('.gc-assets-picker[open]').forEach(picker=>{if(!picker.contains(event.target))picker.open=false;});
  });
  root.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const picker=root.querySelector('.gc-assets-picker[open]');if(picker){event.preventDefault();event.stopPropagation();picker.open=false;picker.querySelector('summary').focus();}
  });
  root.addEventListener('invalid',event=>{
    let panel=event.target.closest('details');
    while(panel&&root.contains(panel)){panel.open=true;panel=panel.parentElement.closest('details');}
  },true);
  let nextCardNumber = Date.now() * 1000;
  function newCard(extra = {}) {
    const id =
        "gc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      serial = String(++nextCardNumber).padStart(16, "0").slice(-16);
    return {
      id,
      number: serial.replace(/(.{4})/g, "$1 ").trim(),
      created: today(),
      source: "store",
      approval: "Approved",
      status: "Active",
      balance: Number(formDraft.amount),
      ...formDraft,
      ...extra,
    };
  }
  root.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    if (form.id === "gc-issue-form") {
      if(formDraft.type==='Crypto Card'){
        if(!cryptoReady())return;
        store.cards.unshift(newCard({amount:cryptoValue(),balance:cryptoValue(),quantity:cryptoQuantity(),payment:'VLINKPAY',expires:'',name:formDraft.sendGift?formDraft.recipientName:formDraft.name,email:formDraft.sendGift?formDraft.recipientEmail:formDraft.email}));save();navigate('cards','store');return;
      }
      if (formDraft.type === "Membership" && !formDraft.dob) {
        root.querySelector("[name=dob]").focus();
        return;
      }
      const expiry =
        formDraft.period === "none"
          ? ""
          : formDraft.period === "date"
            ? formDraft.expiryDate
            : addDays(today(), formDraft.period);
      store.cards.unshift(
        newCard({
          expires: ["Membership","Discount","Promotion"].includes(formDraft.type) ? expiry : "",
          period:
            ["Membership","Discount","Promotion"].includes(formDraft.type) ? Number(formDraft.period) || 0 : 0,
        }),
      );
      save();
      navigate("cards", "store");
      return;
    }
    if (form.id === "gc-quick-form") {
      if (Number(formDraft.amount) < 25 || Number(formDraft.amount) > 5000) {
        root.querySelector("[name=amount]").focus();
        return;
      }
      store.cards.unshift(
        newCard({
          type: formDraft.type === "Voucher" ? "Voucher" : "E-Gift Card",
          source: "online",
          expires: "",
          payment: "VLINKPAY",
        }),
      );
      save();
      navigate("cards", "online");
      return;
    }
    if (form.id === "gc-advanced-form") {
      const items = [...formDraft.vouchers, ...formDraft.egifts];
      if (!items.length) return;
      const invalid = items.find((c) => !c.terms);
      if (invalid) {
        const kind = formDraft.vouchers.includes(invalid)
          ? "vouchers"
          : "egifts";
        conditionsDialog(kind, formDraft[kind].indexOf(invalid));
        return;
      }
      for (const [kind, type] of [
        ["vouchers", "Voucher"],
        ["egifts", "E-Gift Card"],
      ])
        for (const item of formDraft[kind])
          store.cards.unshift(
            newCard({
              amount: item.amount,
              balance: item.amount,
              percent: item.percent,
              quantity: item.quantity,
              type,
              terms: item.terms,
              source: "online",
              expires: "",
              payment: "VLINKPAY",
            }),
          );
      save();
      navigate("cards", "online");
      return;
    }
    if (form.id === "gc-package-form") {
      if (!formDraft.benefits.length) {
        root.querySelector("[name=packageBenefit]")?.focus();
        return;
      }
      const p = {
        id: formDraft.editId || "PKG" + String(Date.now()).slice(-7),
        name: formDraft.tier,
        price: Number(formDraft.amount),
        period: Number(formDraft.period),
        benefits: formDraft.benefits,
        active: true,
        date: today(),
        discount: Number(formDraft.discount),
        terms: formDraft.terms,
        updated: today(),
      };
      const existing = store.packages.find((x) => x.id === p.id);
      if (existing) Object.assign(existing, p);
      else store.packages.push(p);
      save();
      navigate("benefits", "packages");
      return;
    }
    if (form.id === "gc-reminders-form") {
      const data = new FormData(form);
      store.settings = {
        email: data.has("email"),
        sms: data.has("sms"),
        emailDays: Number(data.get("emailDays")) || 30,
        smsDays: Number(data.get("smsDays")) || 30,
      };
      save();
      return;
    }
    if (form.id === "gc-payment-form") {
      const data = new FormData(form),
        amount = Number(data.get("paymentAmount"));
      const preview = root.querySelector("[data-payment-preview]");
      preview.innerHTML = `<section class="gc-card"><h3>Preview</h3><strong>${money(amount)}</strong><p>${esc(data.get("note") || "")}</p><div class="gc-qr" data-local-payment-qr></div></section>`;
      const host = preview.querySelector("[data-local-payment-qr]");
      if (window.QRCode) {
        new window.QRCode(host, {
          text: JSON.stringify({
            type: "gift-card-payment-preview",
            amount,
            note: String(data.get("note") || ""),
          }),
          width: 220,
          height: 220,
        });
      }
      return;
    }
  });
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    navigate(params.get("view") || "", params.get("tab") || "", false);
  });
  const initial = new URLSearchParams(location.search);
  navigate(initial.get("view") || "", initial.get("tab") || "", false);
})();
