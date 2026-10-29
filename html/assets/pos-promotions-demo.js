/* Browser-local interactions for the two standalone POS Promotions prototypes. */
(function () {
  "use strict";
  const data = window.POS_PROMOTIONS_DEMO_DATA;
  const $ = (id) => document.getElementById(id);
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const storageKey = "nexora:pos-promotions-standalone:v1";
  const languageKey = "nexora:pos-promotions-standalone:language";
  const adsCreditKey = "nexora:ads-credit:v1";
  // Match the existing Ads Credit wallet: $350 balance less $30 on hold.
  const defaultAdsCreditCents = 32000;
  const lowAdsCreditCents = 3000;
  const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const money = (value) =>
    "$" +
    Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const number = (value) => Number(value || 0).toLocaleString("en-US");
  const iso = (date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  const today = () => iso(new Date());
  const date = (value) =>
    value ? dateFormat.format(new Date(value.slice(0, 10) + "T12:00:00")) : "";
  const time = (value) => {
    if (!value) return "";
    const [h, m] = value.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  let language = "en";
  try {
    language = localStorage.getItem(languageKey) === "vi" ? "vi" : "en";
  } catch (_) {}
  const t = (key, params = {}) => {
    let value = data.copy[language];
    for (const part of key.split(".")) value = value?.[part];
    value = typeof value === "string" ? value : key;
    return value.replace(/{{(\w+)}}/g, (_, key) => params[key] ?? "");
  };
  const localized = (value) => value?.[language] || value?.en || "";
  const icon = (name) => window.ONEQR_ACTION_APPEARANCE.image(name, 24);
  function hydrate(root = document) {
    root.querySelectorAll("[data-oneqr-icon]").forEach((node) => {
      node.innerHTML = icon(node.dataset.oneqrIcon);
    });
  }
  let toastTimer;
  function toast(message) {
    $("demo-feedback").textContent = message;
    $("demo-feedback").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      $("demo-feedback").hidden = true;
    }, 4500);
  }
  const dialog = $("promotion-dialog");
  function openDialog(title, body, footer = "") {
    dialog.classList.remove("phase-ai-dialog");
    $("dialog-title").textContent = title;
    $("dialog-body").innerHTML = body;
    $("dialog-footer").innerHTML = footer;
    hydrate(dialog);
    if (!dialog.open) dialog.showModal();
  }
  dialog
    .querySelector("[data-close-dialog]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        dialog.close();
    }
  });
  const themes = {
    purple: ["linear-gradient(135deg,#F5F3FF,#DDD6FE)", "#4C1D95"],
    gold: ["linear-gradient(135deg,#FFFBEB,#FDE68A)", "#78350F"],
    rose: ["linear-gradient(135deg,#FFF1F2,#FECDD3)", "#9F1239"],
    ocean: ["linear-gradient(135deg,#EFF6FF,#BFDBFE)", "#1E3A8A"],
    teal: ["linear-gradient(135deg,#F0FDFA,#99F6E4)", "#115E59"],
    sage: ["linear-gradient(135deg,#F7FEE7,#D9F99D)", "#3F6212"],
    peach: ["linear-gradient(135deg,#FFF7ED,#FED7AA)", "#9A3412"],
    slate: ["linear-gradient(135deg,#F8FAFC,#E2E8F0)", "#0F172A"],
  };
  const templates = [
    {
      id: "addon",
      name: "Add-On Upgrade · Sample",
      badge: "UPGRADE",
      description:
        "20% off nail art or a foot massage with a main service. Applies to the add-on only, not the whole ticket. Confirm eligible services before use.",
      discountValue: 20,
      discountType: "percent",
      theme: "purple",
      icon: "sparkles",
      goal: "push",
      industry: "nail",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      id: "weekday",
      name: "Weekday Glow · Sample",
      badge: "HAPPY HOURS",
      description:
        "15% off Classic Pedicure, Tuesday–Thursday, 10 AM–2 PM. Excludes tips and tax; cannot be combined with other offers. Review these sample terms before use.",
      discountValue: 15,
      discountType: "percent",
      theme: "gold",
      icon: "star",
      goal: "slow",
      industry: "nail",
      days: [2, 3, 4],
      startTime: "10:00",
      endTime: "14:00",
    },
    {
      id: "rebook",
      name: "Rebook & Save · Sample",
      badge: "COME BACK",
      description:
        "Save $5 on the next visit when the customer books before leaving. Confirm a qualifying appointment before applying this offer.",
      discountValue: 5,
      discountType: "amount",
      theme: "rose",
      icon: "calendar-days",
      goal: "retain",
      industry: "nail",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      id: "new-guest",
      name: "New Guest Offer · Sample",
      badge: "WELCOME",
      description:
        "10% off Classic Pedicure on the first visit. Cannot be combined; excludes tax and tips. Verify first-visit eligibility and adjust services and terms before use.",
      discountValue: 10,
      discountType: "percent",
      theme: "ocean",
      icon: "rocket",
      goal: "new",
      industry: "nail",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      id: "lunch",
      name: "Lunch Combo · Sample",
      badge: "LUNCH",
      description:
        "Save $3 on a main dish and drink combo, Monday–Friday, 11 AM–2 PM. Cannot be combined; excludes delivery fees. Choose the eligible combo before use.",
      discountValue: 3,
      discountType: "amount",
      theme: "teal",
      icon: "utensils",
      goal: "slow",
      industry: "nail",
      days: [1, 2, 3, 4, 5],
      startTime: "11:00",
      endTime: "14:00",
    },
    {
      id: "gift",
      name: "Gift Set Offer · Sample",
      badge: "GIFT",
      description:
        "15% off selected gift sets. Does not apply storewide; cannot be combined and excludes tax. Confirm eligible products and availability before use.",
      discountValue: 15,
      discountType: "percent",
      theme: "sage",
      icon: "gift",
      goal: "ticket",
      industry: "nail",
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "00:00",
      endTime: "23:59",
    },
  ];
  const recommended = {
    slow: ["pos", "oneqr", "sms", "gbp", "nearby"],
    back: ["pos", "receipt", "sms", "email", "community"],
    new: ["pos", "oneqr", "fb", "ig", "gbp", "nearby", "search", "community"],
    gift: ["pos", "receipt", "gift", "email", "sms", "oneqr"],
  };
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function basePromotion(template, overrides = {}) {
    return {
      ...structuredClone(template),
      kind: "deal",
      requirement: "none",
      goal: "slow",
      services: ["all"],
      channels: ["pos", "sms", "oneqr"],
      crossPromotion: true,
      checkinEnabled: true,
      checkinPlacements: ["idle", "after"],
      bookingEnabled: true,
      bookingPlacements: ["page", "slot", "ai", "hold"],
      postWhen: "auto",
      startDate: "",
      endDate: "",
      minimumSpend: "",
      monthlyCap: "",
      slots: 100,
      perClient: 1,
      holdDays: 7,
      couponCode: "",
      banners: [{ theme: template.theme || "purple" }],
      active: false,
      publicStatus: "off",
      paidEnabled: false,
      paidPlacements: data.placements.map((placement) => placement.id),
      targetArea: "all",
      targetAreas: ["all"],
      budget: 100,
      dailyLimit: null,
      used: 0,
      claimed: 0,
      discountTotal: 0,
      revenue: 0,
      ...overrides,
    };
  }
  function seed() {
    const names = [
      "Add-On Upgrade · Sample",
      "QA 2215 out-of-window",
      "Add-On Upgrade · Sample",
      "Add-On Upgrade · Sample",
      "Test coupon",
      "Test deal",
      "test",
      "QA Verify All-day Deal",
      "QA Verify 2265 Deal",
      "QA Verify 2214 Coupon no end",
      "Gift Set Offer · Sample",
      "Weekday Glow · Sample",
      "Add-On Upgrade · Sample",
      "Add-On Upgrade · Sample test",
      "1 weekly",
      "saving day 1saving day 1 saving day 1 saving day 1 saving day 1 saving day 1 saving day 1 saving day",
      "day saving day saving day saving day saving day saving day saving day saving day saving day saving d",
    ];
    return names.map((name, i) =>
      basePromotion(
        i === 10 ? templates[5] : i === 11 ? templates[1] : templates[0],
        {
          id: "source-" + i,
          name,
          active: [0, 2, 4].includes(i),
          kind: [4, 6, 9].includes(i) ? "coupon" : "deal",
          startTime:
            i === 1
              ? "18:00"
              : i === 4
                ? "01:00"
                : i === 2
                  ? "00:00"
                  : templates[0].startTime,
          endTime: i === 1 || i === 4 ? "20:00" : i === 2 ? "13:00" : "23:59",
          startDate: [3, 4, 6, 8, 9].includes(i)
            ? "2026-10-" + (i === 3 ? "20" : "21")
            : "",
          endDate:
            i === 3
              ? "2026-10-30"
              : i === 8
                ? "2026-12-31"
                : i === 9
                  ? "2026-10-31"
                  : "",
          used: i === 2 ? 3 : i === 3 ? 1 : 0,
          claimed: i === 4 ? 1 : 0,
          discountTotal: i === 2 ? 42 : i === 3 ? 9 : 0,
          revenue: i === 2 ? 168 : i === 3 ? 36 : 0,
          discountValue: i === 1 ? 5 : i === 4 ? 10 : 20,
          discountType: [1, 4].includes(i) ? "amount" : "percent",
          statusOverride: [6, 7, 8].includes(i) ? "rejected" : undefined,
        },
      ),
    );
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.version === 1 && Array.isArray(saved.promotions))
        return saved.promotions.map((promotion) => ({
          ...promotion,
          targetAreas: Array.isArray(promotion.targetAreas)
            ? promotion.targetAreas
            : Array.isArray(promotion.targetArea)
              ? promotion.targetArea
              : [promotion.targetArea || "all"],
          paidPlacements: (promotion.paidPlacements || [])
            .map((id) => (id === "explore" ? "nearby" : id))
            .filter((id) =>
              data.placements.some((placement) => placement.id === id),
            ),
        }));
    } catch (_) {}
    return seed();
  }
  let promotions = load();
  function persist(next = promotions) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, promotions: next }),
      );
      promotions = next;
      return true;
    } catch (_) {
      toast(
        language === "vi"
          ? "Không lưu được. Bộ nhớ trình duyệt không khả dụng hoặc đã đầy. Nội dung đang sửa vẫn được giữ nguyên."
          : "Could not save. Browser storage is unavailable or full. Your changes are still here.",
      );
      return false;
    }
  }
  function settleReviews() {
    let changed = false;
    promotions.forEach((p) => {
      if (p.publicStatus === "pending" && Date.now() >= p.reviewAt) {
        p.publicStatus = "approved";
        if (p.paidEnabled) p.paidStatus = p.active ? "running" : "paused";
        changed = true;
      }
    });
    if (changed) persist();
  }
  settleReviews();
  function status(p) {
    if (p.statusOverride) return p.statusOverride;
    if (p.draft) return "draft";
    if (p.endDate && p.endDate < today()) return "ended";
    if (p.kind === "coupon" && p.slots && p.claimed >= p.slots) return "sold";
    if (!p.active) return "pause";
    if (p.startDate && p.startDate > today()) return "sched";
    return "run";
  }
  const statusKey = {
    run: "statusRunning",
    sched: "statusScheduled",
    pause: "statusPaused",
    sold: "statusSoldOut",
    ended: "statusEnded",
    draft: "statusDraft",
    review: "statusPendingReview",
    rejected: "statusRejected",
  };
  const statusLabel = (p) =>
    t(statusKey[typeof p === "string" ? p : status(p)]);
  const rate = (p) =>
    p.discountType === "amount"
      ? money(p.discountValue)
      : number(p.discountValue) + "%";
  const schedule = (p) =>
    [
      (p.days || []).map((i) => weekdays[i]).join(" · "),
      [time(p.startTime), time(p.endTime)].filter(Boolean).join("–"),
    ]
      .filter(Boolean)
      .join(" · ");
  const dateRange = (p) =>
    !p.startDate && !p.endDate
      ? t("noEnd")
      : [date(p.startDate), p.endDate ? date(p.endDate) : t("noEnd")]
          .filter(Boolean)
          .join(" → ");
  const channelNames = (p) =>
    (p.channels || [])
      .map(
        (id) =>
          ({
            pos: t("chipCheckout"),
            sms: "SMS",
            oneqr: t("chipHero"),
            nearby: "Deals Nearby / Explore",
            search: "Search Deals",
          })[id] || localized(data.channels.find((c) => c.id === id)?.name),
      )
      .filter(Boolean)
      .join(" · ");
  function art(p, banner = p.banners?.[0] || { theme: "purple" }) {
    if (banner.image)
      return `<div class="demo-art image-art"><img src="${escape(banner.image)}" alt="${escape(p.name || t("previewUntitled"))}"></div>`;
    const [background, color] = banner.background
      ? [banner.background, banner.color || "#ffffff"]
      : themes[banner.theme] || themes.purple;
    return `<div class="promo-art demo-art theme-${escape(banner.theme)}" style="background:${background};color:${color}"><span class="art-badge">${p.kind === "coupon" ? "COUPON" : "DEAL"} &nbsp; ${escape(p.badge || t("specialOffer"))}</span><h3>${escape(p.name || t("previewUntitled"))}</h3><strong class="art-saving">${p.discountValue ? escape(rate(p) + " off") : escape(t("invalidPreview"))}</strong><p>${escape(schedule(p))}</p></div>`;
  }
  function download(name, rows) {
    const csv = rows
      .map((row) =>
        row
          .map(
            (v) =>
              '"' +
              String(v ?? "")
                .replace(/^[=+\-@]/, "'$&")
                .replace(/"/g, '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  let renderPage;
  function applyLanguage() {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-copy]").forEach((node) => {
      node.textContent = t(node.dataset.copy);
    });
    document.querySelectorAll("[data-placeholder]").forEach((node) => {
      node.placeholder = t(node.dataset.placeholder);
    });
    $("promotion-language").value = language;
    renderPage?.();
    hydrate();
  }
  $("promotion-language").addEventListener("change", (event) => {
    language = event.target.value;
    try {
      localStorage.setItem(languageKey, language);
    } catch (_) {}
    applyLanguage();
  });

  function initCreate() {
    const form = $("promotion-form"),
      field = (name) => form.elements.namedItem(name);
    const editingId = new URLSearchParams(location.search).get("edit");
    const existing = promotions.find((p) => p.id === editingId);
    let draft = existing
      ? structuredClone(existing)
      : basePromotion(
          {
            name: "",
            discountValue: "",
            discountType: "percent",
            theme: "purple",
            days: [],
            startTime: "10:00",
            endTime: "14:00",
          },
          { channels: recommended.slow.slice() },
        );
    let selectedTemplate = existing?.templateId || null,
      previewMode = "banner",
      showMore = false,
      selectedBanner = 0;
    let customServices = draft.services.filter((id) => id !== "all");
    const publicIds = new Set(data.placements.map((placement) => placement.id));
    if (draft.paidEnabled) {
      draft.channels = [
        ...new Set([...draft.channels, ...draft.paidPlacements]),
      ];
    }
    const targetAreaPicker =
      typeof window.TomSelect === "function"
        ? new window.TomSelect(field("targetArea"), {
            plugins: {
              checkbox_options: {},
            },
            create: false,
            maxItems: null,
            maxOptions: null,
            hideSelected: false,
            closeAfterSelect: false,
            clearAfterSelect: true,
            lockOptgroupOrder: true,
            placeholder: "Select or search",
            hidePlaceholder: false,
            render: { no_results: null },
            onItemAdd(value) {
              if (value === "all") {
                this.items
                  .filter((id) => id !== "all")
                  .forEach((id) => this.removeItem(id, true));
              } else if (this.items.includes("all")) {
                this.removeItem("all", true);
              }
            },
            onChange() {
              if (!this.items.length) this.addItem("all", true);
            },
          })
        : null;
    targetAreaPicker?.control_input.setAttribute(
      "aria-labelledby",
      "target-area-label",
    );
    function renderTargetAreas() {
      const labels = new Map(
        [...field("targetArea").options].map((option) => [
          option.value,
          option.textContent,
        ]),
      );
      $("target-area-selected").innerHTML = draft.targetAreas
        .filter((value) => labels.has(value))
        .map(
          (value) =>
            `<span class="demo-target-area-chip" role="listitem"><span>${escape(labels.get(value))}</span>${value === "all" ? "" : `<button type="button" data-remove-area="${escape(value)}" aria-label="${escape(t("removeTargetArea") + ": " + labels.get(value))}"><span aria-hidden="true">×</span></button>`}</span>`,
        )
        .join("");
    }
    $("target-area-selected").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-area]");
      if (!button) return;
      const buttons = [...$("target-area-selected").querySelectorAll("button")];
      const index = buttons.indexOf(button);
      if (targetAreaPicker) {
        targetAreaPicker.removeItem(button.dataset.removeArea);
      } else {
        for (const option of field("targetArea").options) {
          if (option.value === button.dataset.removeArea)
            option.selected = false;
        }
        if (!field("targetArea").selectedOptions.length)
          field("targetArea").value = "all";
        field("targetArea").dispatchEvent(
          new Event("change", { bubbles: true }),
        );
      }
      const remaining = $("target-area-selected").querySelectorAll("button");
      const focusTarget =
        remaining[Math.min(index, remaining.length - 1)] ||
        targetAreaPicker?.control_input ||
        field("targetArea");
      focusTarget.focus({ preventScroll: true });
    });
    function read() {
      for (const name of [
        "name",
        "badge",
        "description",
        "discountType",
        "requirement",
        "goal",
        "startTime",
        "endTime",
        "startDate",
        "endDate",
        "minimumSpend",
        "monthlyCap",
        "slots",
        "perClient",
        "holdDays",
        "couponCode",
        "budget",
      ])
        draft[name] = field(name).value;
      draft.discountValue = field("discountValue").value;
      draft.targetAreas = [...field("targetArea").selectedOptions].map(
        (option) => option.value,
      );
      draft.targetArea = draft.targetAreas[0] || "";
      draft.days = [...form.querySelectorAll("[name=days]:checked")].map((n) =>
        Number(n.value),
      );
      draft.paidEnabled = field("paidEnabled").checked;
      draft.crossPromotion = field("crossPromotion").checked;
      draft.paidPlacements = [
        ...form.querySelectorAll("[name=publicPlacement]:checked"),
      ].map((input) => input.value);
      draft.channels = [
        ...draft.channels.filter((id) => !publicIds.has(id)),
        ...draft.paidPlacements,
      ];
      draft.checkinEnabled = field("checkinEnabled").checked;
      draft.bookingEnabled = field("bookingEnabled").checked;
      draft.checkinPlacements = [
        ...form.querySelectorAll("[name=checkinPlacement]:checked"),
      ].map((n) => n.value);
      draft.bookingPlacements = [
        ...form.querySelectorAll("[name=bookingPlacement]:checked"),
      ].map((n) => n.value);
      draft.postWhen =
        form.querySelector("[name=postWhen]:checked")?.value || "auto";
      return draft;
    }
    function fill() {
      for (const name of [
        "name",
        "badge",
        "description",
        "discountValue",
        "discountType",
        "requirement",
        "goal",
        "startTime",
        "endTime",
        "startDate",
        "endDate",
        "minimumSpend",
        "monthlyCap",
        "slots",
        "perClient",
        "holdDays",
        "couponCode",
        "budget",
      ])
        field(name).value = draft[name] ?? "";
      for (const option of field("targetArea").options) {
        option.selected = draft.targetAreas.includes(option.value);
      }
      targetAreaPicker?.setValue(draft.targetAreas, true);
      field("paidEnabled").checked = draft.paidEnabled;
      field("crossPromotion").checked = draft.crossPromotion;
      form
        .querySelectorAll("[name=days]")
        .forEach(
          (input) => (input.checked = draft.days.includes(Number(input.value))),
        );
      renderChannels();
      renderServices();
      update();
    }
    function resetPicker(id, html, value) {
      const select = $(id);
      select.nextElementSibling?.matches(".promotion-industry-picker") &&
        select.nextElementSibling.remove();
      delete select.dataset.imagePicker;
      select.innerHTML = html;
      select.value = value;
      window.NEXORA_PROMOTION_ICONS.mountPicker(select);
    }
    function options() {
      const industryValue = $("template-industry").value || "nail",
        goalValue = $("template-goal").value || "all",
        serviceValue = $("template-service").value || "all";
      const option = (value, label, icon) =>
        `<option value="${escape(value)}" data-industry-icon="${icon}">${escape(label)}</option>`;
      resetPicker(
        "template-industry",
        option("all", t("studio.allIndustries"), "retail") +
          data.groups
            .map(
              (g) =>
                `<optgroup label="${escape(localized(g))}">${data.industries
                  .filter((i) => i.group === g.id)
                  .map((i) => option(i.id, localized(i), i.icon))
                  .join("")}</optgroup>`,
            )
            .join(""),
        industryValue,
      );
      const goalIcons = {
        all: "retail",
        new: "gift",
        slow: "calendar",
        push: "cosmetics",
        ticket: "lifestyle",
        retain: "spa",
        community: "lifestyle",
        seasonal: "flowers",
      };
      resetPicker(
        "template-goal",
        Object.keys(goalIcons)
          .map((k) => option(k, t("studio.goals." + k), goalIcons[k]))
          .join(""),
        goalValue,
      );
      const industry = data.industries.find((i) => i.id === industryValue),
        groups = industry
          ? data.industries.filter((i) => i.group === industry.group)
          : data.industries;
      resetPicker(
        "template-service",
        option("all", t("studio.goals.all"), "retail") +
          groups.map((i) => option(i.id, localized(i), i.icon)).join(""),
        groups.some((i) => i.id === serviceValue) ? serviceValue : "all",
      );
    }
    function filteredTemplates() {
      return templates.filter(
        (item) =>
          draft.kind === "deal" &&
          ($("template-industry").value === "all" ||
            item.industry === $("template-industry").value) &&
          ($("template-service").value === "all" ||
            item.industry === $("template-service").value) &&
          ($("template-goal").value === "all" ||
            item.goal === $("template-goal").value ||
            (item.id === "addon" && $("template-goal").value === "ticket")) &&
          [item.name, item.description]
            .join(" ")
            .toLowerCase()
            .includes($("template-search").value.toLowerCase()),
      );
    }
    function renderTemplates() {
      const items = filteredTemplates();
      $("template-count").textContent = t("studio.showing", {
        shown: items.length,
        total: 6,
      });
      $("template-cards").innerHTML = items.length
        ? items
            .map(
              (item) =>
                `<article class="demo-template-card ${selectedTemplate === item.id ? "is-selected" : ""}"><div class="demo-template-art" style="background:${themes[item.theme][0]};color:${themes[item.theme][1]}" role="button" tabindex="0" data-template-preview="${item.id}" aria-label="${escape(item.name)}">${icon(item.icon)}${escape(rate(item))} off</div><div class="demo-template-body"><span class="promo-kind is-deal">${t("dealLabel")}</span><strong>${escape(item.name)}</strong><p>${escape(item.description)}</p><div class="demo-template-actions"><button type="button" class="promo-button" data-template-preview="${item.id}">${t("studio.view")}</button><button type="button" class="promo-button" data-template-use="${item.id}">${t(selectedTemplate === item.id ? "studio.inUse" : "studio.useTemplate")}</button></div></div></article>`,
            )
            .join("")
        : `<div class="demo-template-empty"><strong>${t("studio.emptyTitle")}</strong><p class="promo-note">${t(draft.kind === "coupon" ? "studio.emptyNoType" : "studio.emptyNoIndustry")}</p><button type="button" class="promo-button" id="reset-templates">${t("studio.emptyReset")}</button></div>`;
    }
    function renderServices() {
      const isAll = draft.services.includes("all");
      $("service-scope").value = isAll ? "all" : "custom";
      $("eligible-services").hidden = isAll;
      const openGroups = new Set(
        [...$("eligible-services").querySelectorAll("details[open]")].map(
          (group) => group.dataset.serviceGroup,
        ),
      );
      $("eligible-services").innerHTML = data.services
        .map(
          (group, index) =>
            `<details class="demo-service-category" data-service-group="${index}" ${openGroups.has(String(index)) ? "open" : ""}><summary><input type="checkbox" data-service-category="${index}" aria-label="${escape(group.name)}" ${isAll || group.services.every((s) => draft.services.includes(s.id)) ? "checked" : ""}><span>${escape(group.name)}</span><small>${group.services.length}</small></summary><div class="demo-service-grid">${group.services.map((service) => `<label class="demo-service-choice"><input type="checkbox" data-service="${escape(service.id)}" ${isAll || draft.services.includes(service.id) ? "checked" : ""}><span>${escape(service.name)}</span></label>`).join("")}</div></details>`,
        )
        .join("");
      document.querySelectorAll("[data-service-category]").forEach((input) => {
        const g = data.services[Number(input.dataset.serviceCategory)];
        const count = g.services.filter((s) =>
          draft.services.includes(s.id),
        ).length;
        input.indeterminate = !isAll && count > 0 && count < g.services.length;
      });
    }
    function renderChannels() {
      const paidAdvertising = $("paid-advertising");
      paidAdvertising.remove();
      draft.paidPlacements = draft.channels.filter((id) => publicIds.has(id));
      const selected = new Set(draft.channels),
        rec = recommended[draft.goal] || recommended.slow;
      const channelCard = (c) =>
        `<button type="button" class="promo-launch-card ${selected.has(c.id) ? "active is-on" : ""}" data-channel="${c.id}" aria-pressed="${selected.has(c.id)}">${rec.includes(c.id) ? `<span class="promo-tag rec">${t("channelSuggested")}</span>` : ""}<strong>${escape(localized(c.name))}</strong><span>${escape(localized(c.description))}</span><span class="status">${escape(localized(c.status))}</span></button>`;
      const publicCard = (channel) =>
        `<label class="demo-paid-placement"><input type="checkbox" name="publicPlacement" value="${channel.id}" ${selected.has(channel.id) ? "checked" : ""}><span><strong>${escape(localized(channel.name))}</strong><small>${escape(localized(channel.description))}</small></span></label>`;
      const switchCard = (name, title, hint, items, selectedItems, preview) =>
        `<div class="promo-swcard"><div class="demo-toggle-head"><div><strong>${t(title)} <span class="promo-tag rec">NEW</span></strong><small class="promo-note">${t(hint)}</small></div><label class="demo-switch"><input type="checkbox" name="${name}Enabled" ${draft[name + "Enabled"] ? "checked" : ""} aria-label="${t(title)}">${draft[name + "Enabled"] ? t("channelSwitchOn") : t("channelSwitchOff")}</label></div><div class="demo-channel-subs" ${draft[name + "Enabled"] ? "" : "hidden"}>${items.map((item) => `<label><input type="checkbox" name="${name}Placement" value="${item.id}" ${selectedItems.includes(item.id) ? "checked" : ""}><span><b>${escape(localized(item.name))}</b>${item.hint ? `<small>${escape(localized(item.hint))}</small>` : ""}</span></label>`).join("")}</div><button type="button" class="promo-sw-preview" data-channel-preview="${preview}">${t(name === "checkin" ? "previewCheckIn" : "previewBooking")}</button></div>`;
      $("channels").innerHTML = ["int", "pub"]
        .map((tier) => {
          const all = data.channels.filter((c) => c.tier === tier),
            shown =
              tier === "pub" || showMore
                ? all
                : all.filter(
                    (c) =>
                      rec.includes(c.id) ||
                      selected.has(c.id) ||
                      ["email", "fb", "ig", "gbp"].includes(c.id),
                  );
          return `<div class="promo-channel-tier tier-${tier}"><div class="promo-channel-tier-head"><div class="demo-tier-heading"><strong>${t(tier === "int" ? "tierInternalTitle" : "tierPublicTitle")}</strong><span class="promo-tag ${tier === "int" ? "ok" : "warn"}">${tier === "int" ? t("tierInternalTag") : "Automatic review"}</span>${tier === "pub" ? `<span class="promo-tag ok">${t("tierPublicOrganic")}</span>` : ""}</div>${tier === "pub" ? `<div class="demo-ad-credit" id="public-ad-credit"><div class="demo-ad-credit-balance"><span>${t("adsCreditBalance")}</span><strong id="public-credit-balance"></strong><small id="public-credit-status" role="status" aria-live="polite" hidden></small></div><a class="demo-ad-credit-topup" id="public-credit-topup" href="nexora-packages.html?tab=ads-credit" target="_blank" rel="noopener" hidden><span data-oneqr-icon="wallet"></span>${t("addAdsCredit")}</a></div>` : ""}<p class="promo-channel-tier-note">${t(tier === "int" ? "tierInternalHint" : "tierPublicHint")}</p></div><div class="promo-launch-grid">${tier === "int" ? switchCard("checkin", "checkInCardTitle", "checkInCardHint", data.checkin, draft.checkinPlacements, "kiosk") + switchCard("booking", "bookingCardTitle", "bookingCardHint", data.booking, draft.bookingPlacements, "oneqr") : ""}${shown.map(tier === "pub" ? publicCard : channelCard).join("")}</div>${tier === "int" ? `<div class="demo-postline"><strong>${t("postToLabel")}</strong><label><input type="radio" name="postWhen" value="now" ${draft.postWhen === "now" ? "checked" : ""}>${t("postWhenNow")}</label><label><input type="radio" name="postWhen" value="auto" ${draft.postWhen !== "now" ? "checked" : ""}>${t("postWhenAuto")}</label><small>${t("postMilestones")}</small><button type="button" class="promo-text-button" id="edit-post-schedule">${t("postScheduleEdit")}</button></div><button type="button" class="promo-text-button" id="show-more-channels">${t(showMore ? "showLessChannels" : "showMoreChannels", { count: all.length - shown.length })}</button>` : ""}</div>`;
        })
        .join("");
      $("channels").querySelector(".tier-pub").append(paidAdvertising);
      hydrate($("public-ad-credit"));
    }
    function renderBanners() {
      $("banner-colors").innerHTML = Object.entries(themes)
        .map(
          ([key, theme]) =>
            `<button type="button" class="promo-live-swatch theme-${key} ${draft.banners[selectedBanner]?.theme === key ? "is-on" : ""}" role="option" aria-selected="${draft.banners[selectedBanner]?.theme === key}" aria-label="${escape(t("theme." + key))}" title="${escape(t("theme." + key))}" data-theme="${key}" style="background:${theme[0]}"></button>`,
        )
        .join("");
      $("banner-count").textContent = t("liveBannerMeta", {
        count: draft.banners.length,
        max: 8,
      });
      $("banner-list").innerHTML = draft.banners
        .map(
          (b, index) =>
            `<div class="demo-banner-row ${index === 0 ? "is-cover" : ""}" data-banner-select="${index}" role="button" tabindex="0"><i class="demo-banner-dot" style="background:${(themes[b.theme] || themes.purple)[0]}"></i><span>${index + 1}. ${escape(b.image ? t("uploadedTheme") : t("theme." + b.theme))}${index === 0 ? `<small>${t("cover")}</small>` : ""}</span><button type="button" data-banner-move="${index}" data-direction="-1" aria-label="${t("moveUp")}" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" data-banner-move="${index}" data-direction="1" aria-label="${t("moveDown")}" ${index === draft.banners.length - 1 ? "disabled" : ""}>↓</button><button type="button" data-banner-remove="${index}" aria-label="${t("removeBanner")}" ${draft.banners.length === 1 ? "disabled" : ""}>×</button></div>`,
        )
        .join("");
      $("add-banner").disabled = draft.banners.length >= 8;
    }
    function renderAdsCredit() {
      let availableCents = defaultAdsCreditCents;
      try {
        const saved = JSON.parse(localStorage.getItem(adsCreditKey));
        if (
          Number.isFinite(saved?.balanceCents) &&
          Number.isFinite(saved?.holdCents) &&
          saved.balanceCents >= 0 &&
          saved.holdCents >= 0
        ) {
          availableCents = Math.max(
            0,
            Math.floor(saved.balanceCents - saved.holdCents),
          );
        }
      } catch (_) {}
      const budgetCents = Math.round(Number(draft.budget) * 100);
      const state =
        availableCents === 0
          ? "empty"
          : draft.paidEnabled && budgetCents > availableCents
            ? "insufficient"
            : availableCents <= lowAdsCreditCents
              ? "low"
              : "ready";
      const warning = state !== "ready";
      $("public-ad-credit").dataset.creditState = state;
      $("public-credit-balance").textContent = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(availableCents / 100);
      const status = $("public-credit-status");
      status.hidden = !warning;
      status.textContent = warning
        ? t(
            {
              empty: "adsCreditEmpty",
              insufficient: "adsCreditInsufficient",
              low: "adsCreditLow",
            }[state],
          )
        : "";
      $("public-credit-topup").hidden = !warning;
    }
    window.addEventListener("storage", (event) => {
      if (event.key === adsCreditKey || event.key === null) renderAdsCredit();
    });
    window.addEventListener("focus", renderAdsCredit);
    function update() {
      const p = draft,
        services = p.services.includes("all")
          ? t("eligibleServicesAll")
          : data.services
              .flatMap((g) => g.services)
              .filter((s) => p.services.includes(s.id))
              .map((s) => s.name)
              .join(", ");
      const summary = [
        p.kind === "coupon"
          ? `${t("couponLabel")} · ${p.slots} ${t("slotsLabel").toLowerCase()}`
          : t("liveTypeDeal"),
        ...(p.discountValue
          ? [t("scheduleSummaryOffer", { offer: rate(p) })]
          : []),
        schedule(p),
        dateRange(p),
        t("customerReq." + p.requirement),
        t("scheduleSummaryServices", { services }),
      ].filter(Boolean);
      if (p.minimumSpend)
        summary.push(`${t("minSpendLabel")}: ${money(p.minimumSpend)}`);
      if (p.kind === "deal" && p.monthlyCap)
        summary.push(`${t("monthlyCapLabel")}: ${money(p.monthlyCap)}`);
      $("promotion-summary").innerHTML = summary
        .map(
          (line, i) =>
            `<li><span>${icon(["tag", "percent", "calendar-days", "clock", "user-round", "paintbrush"][i % 6])}</span><span>${escape(line)}</span></li>`,
        )
        .join("");
      $("date-display").textContent =
        p.startDate || p.endDate ? dateRange(p) : "";
      $("coupon-fields").hidden = p.kind !== "coupon";
      $("hold-days-field").hidden = p.kind !== "coupon";
      $("coupon-code-field").hidden = p.kind !== "coupon";
      $("monthlyCap-field").hidden = p.kind === "coupon";
      $("offer-kind-label").textContent = t(
        p.kind === "coupon" ? "couponLabel" : "dealLabel",
      );
      $("offer-kind-hint").textContent = t(
        p.kind === "coupon" ? "offerKindCouponHint" : "offerKindDealHint",
      );
      $("preview-kind").textContent = t(
        p.kind === "coupon" ? "liveTypeCoupon" : "liveTypeDeal",
      );
      document.querySelectorAll("[data-kind]").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.kind === p.kind);
        b.setAttribute("aria-pressed", String(b.dataset.kind === p.kind));
        b.disabled = Boolean(existing);
      });
      document
        .querySelectorAll("[name=days]")
        .forEach((input) =>
          input.closest("label").classList.toggle("is-on", input.checked),
        );
      $("goal-channel-hint").textContent = t("goalPill", {
        goal: t("goal." + p.goal),
      });
      $("paid-fields").hidden = !p.paidEnabled;
      renderTargetAreas();
      renderAdsCredit();
      const hasPublic = p.channels.some((id) =>
        data.channels.some((c) => c.id === id && c.tier === "pub"),
      );
      $("activate-promotion").textContent = hasPublic
        ? "Turn on · automatic Public review"
        : t("turnOn");
      $("publication-note").textContent = hasPublic
        ? "Your own channels run immediately without content review. NEXORA automatically reviews public advertising placements."
        : "";
      if (existing) {
        $("create-title").textContent = t("editTitle");
        $("save-note").textContent = t("editNote");
      }
      $("template-pill").textContent = t("studio.templatePill", {
        name:
          templates.find((item) => item.id === selectedTemplate)?.name ||
          t("quickCreatePill"),
      });
      const banner = art(p, p.banners[selectedBanner]);
      const small = `<p class="promo-note">${escape(schedule(p))}</p>`;
      const stages = {
        banner,
        oneqr: `<div class="demo-preview-oneqr"><div class="demo-preview-shop">${icon("store")}${t("liveShopName")}</div>${p.crossPromotion ? `<div class="demo-preview-hero">${banner}<div class="demo-partner"><small>${t("liveNearbyPartner")}</small><strong>${t("livePartnerOffer")}</strong><span>${t("livePartnerPlace")}</span></div></div><p class="promo-note">${t("liveOneQrCaption")}</p>` : banner}</div>`,
        app: `<div class="demo-preview-oneqr"><strong>${t("liveAppExplore")}</strong><div class="demo-preview-app">${banner}<div><strong>${escape(p.name || t("previewUntitled"))}</strong><small>${t("liveShopName")}</small>${small}<span class="promo-button">${t("liveView")}</span></div></div></div>`,
        kiosk: `<div class="demo-preview-oneqr"><p class="promo-note">${t("liveKioskIdle")}</p>${banner}<p class="promo-button">${t("liveKioskPhone")}</p></div>`,
        pos: `<div class="demo-preview-oneqr"><strong>${t("livePosCheckout")}</strong><div class="demo-pos-row"><span>${t("livePosService")}</span><span>—</span></div><div class="demo-pos-row"><span>${escape(p.name || t("previewUntitled"))}</span><strong>−${p.discountValue ? escape(rate(p)) : "0"}</strong></div><p class="promo-note">${t("livePosCaption")}</p>${small}</div>`,
      };
      $("live-stage").innerHTML = stages[previewMode];
      document.querySelectorAll("[data-preview]").forEach((b) => {
        b.setAttribute(
          "aria-selected",
          String(b.dataset.preview === previewMode),
        );
        b.classList.toggle("is-on", b.dataset.preview === previewMode);
      });
      renderBanners();
    }
    function applyTemplate(item) {
      read();
      const keep = { ...draft };
      Object.assign(draft, structuredClone(item), {
        kind: "deal",
        goal: { new: "new", retain: "back" }[item.goal] || "slow",
        templateId: item.id,
        services: ["all"],
        channels:
          recommended[
            { new: "new", retain: "back" }[item.goal] || "slow"
          ].slice(),
        banners: [{ theme: item.theme }],
        id: keep.id,
        active: keep.active,
        used: keep.used,
        claimed: keep.claimed,
        revenue: keep.revenue,
        discountTotal: keep.discountTotal,
      });
      selectedTemplate = item.id;
      selectedBanner = 0;
      fill();
      renderTemplates();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function previewTemplate(item) {
      const p = basePromotion(item);
      openDialog(
        t("studio.previewTitle"),
        art(p) +
          `<p>${escape(item.description)}</p><p class="promo-note">${escape(schedule(p))}</p>`,
        `<button type="button" class="promo-button primary" data-template-use="${item.id}">${t("studio.previewUse")}</button>`,
      );
    }
    function save(event) {
      event.preventDefault();
      read();
      let error = "",
        target;
      const fail = (key, name) => {
        if (!error) {
          error = t(key);
          target = field(name);
        }
      };
      if (!draft.name.trim()) fail("errorNameRequired", "name");
      if (!draft.discountValue) fail("errorValueRequired", "discountValue");
      else if (Number(draft.discountValue) <= 0)
        fail("errorValueInvalid", "discountValue");
      else if (
        draft.discountType === "percent" &&
        Number(draft.discountValue) > 100
      ) {
        error = t("errorValuePercentMax", { max: 100 });
        target = field("discountValue");
      }
      if (!draft.days.length) fail("errorDaysRequired", "days");
      for (const name of ["minimumSpend", "monthlyCap"]) {
        if (
          draft[name] !== "" &&
          (!Number.isFinite(Number(draft[name])) || Number(draft[name]) <= 0)
        ) {
          if (!error) {
            error = t("errorValueInvalid");
            target = field(name);
          }
        }
      }
      if (!draft.startTime || !draft.endTime)
        fail("errorWindowRequired", "startTime");
      else if (draft.endTime <= draft.startTime)
        fail("schWarnHours", "endTime");
      if (
        draft.endDate &&
        (!draft.startDate || draft.endDate < draft.startDate)
      )
        fail("errorEndDateBeforeStart", "endDate");
      if (!draft.services.length) fail("errorServicesRequired", "serviceScope");
      if (draft.kind === "coupon") {
        if (!draft.startDate) fail("errorStartDateRequired", "startDate");
        if (!Number.isInteger(Number(draft.slots)) || Number(draft.slots) < 1)
          fail("errorSlotsRequired", "slots");
        if (Number(draft.holdDays) < 1 || Number(draft.holdDays) > 365)
          fail("errorHoldDaysRange", "holdDays");
      }
      if (draft.kind === "deal" && !draft.channels.includes("pos"))
        fail("errorPosCheckoutRequired", "name");
      if (draft.paidEnabled) {
        if (!draft.targetAreas.length && !error) {
          const areaSelect = field("targetArea");
          areaSelect.required = true;
          error = areaSelect.validationMessage;
          target = targetAreaPicker?.control_input || areaSelect;
        }
        if (
          !draft.channels.some((id) =>
            data.channels.some((c) => c.id === id && c.tier === "pub"),
          )
        )
          fail("paidNeedsPublic", "paidEnabled");
        if (!draft.paidPlacements.length && !error) {
          error = "Choose at least one ad placement.";
          target = field("paidEnabled");
        }
        if (!(Number(draft.budget) > 0)) {
          if (!error) {
            error = "Enter a total campaign budget greater than zero.";
            target = field("budget");
          }
        }
      }
      $("promotion-error").textContent = error;
      if (error) {
        const input = target instanceof RadioNodeList ? target[0] : target;
        input?.setAttribute?.("aria-invalid", "true");
        input?.scrollIntoView?.({ behavior: "smooth", block: "center" });
        input?.focus?.();
        return;
      }
      const activated = event.submitter?.value === "activate";
      const hasPublic = draft.channels.some((id) =>
        data.channels.some((c) => c.id === id && c.tier === "pub"),
      );
      const saved = {
        ...structuredClone(draft),
        dailyLimit: null,
        id: existing?.id || crypto.randomUUID(),
        draft: !activated,
        active: activated,
        statusOverride: undefined,
        publicStatus: activated && hasPublic ? "pending" : "off",
        reviewAt: Date.now() + 1500,
        paidStatus: draft.paidEnabled
          ? activated
            ? "pending"
            : "draft"
          : "off",
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      const next = existing
        ? promotions.map((p) => (p.id === existing.id ? saved : p))
        : [saved, ...promotions];
      if (persist(next)) location.href = "pos-promotions.html";
    }
    form.addEventListener("submit", save);
    form.addEventListener("input", (event) => {
      event.target.removeAttribute("aria-invalid");
      $("promotion-error").textContent = "";
      read();
      update();
    });
    form.addEventListener("change", (event) => {
      const name = event.target.name;
      read();
      if (name === "serviceScope") {
        if (event.target.value === "all") {
          customServices = [...draft.services];
          draft.services = ["all"];
        } else {
          draft.services = [...customServices];
        }
        renderServices();
      }
      if (name === "paidEnabled" && draft.paidEnabled) {
        draft.channels = [...new Set([...draft.channels, ...publicIds])];
        renderChannels();
      }
      if (name === "goal") {
        draft.channels = recommended[draft.goal].slice();
        renderChannels();
      }
      if (name === "checkinEnabled" || name === "bookingEnabled")
        renderChannels();
      update();
    });
    $("eligible-services").addEventListener("click", (event) => {
      if (event.target.matches("[data-service-category]"))
        event.stopPropagation();
    });
    $("eligible-services").addEventListener("change", (event) => {
      const input = event.target;
      let selected = new Set(draft.services);
      const items = input.dataset.service
        ? [{ id: input.dataset.service }]
        : data.services[Number(input.dataset.serviceCategory)]?.services || [];
      items.forEach((s) =>
        input.checked ? selected.add(s.id) : selected.delete(s.id),
      );
      draft.services = [...selected];
      customServices = [...draft.services];
      renderServices();
      update();
    });
    ["template-goal", "template-service", "template-search"].forEach((id) =>
      $(id).addEventListener(
        id === "template-search" ? "input" : "change",
        renderTemplates,
      ),
    );
    $("template-industry").addEventListener("change", () => {
      options();
      renderTemplates();
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      const preview = event.target.closest("[data-template-preview]");
      if (preview) {
        previewTemplate(
          templates.find((t) => t.id === preview.dataset.templatePreview),
        );
        return;
      }
      if (!button) return;
      if (button.dataset.templateUse) {
        const item = templates.find((t) => t.id === button.dataset.templateUse);
        dialog.close();
        applyTemplate(item);
        return;
      }
      if (button.dataset.kind && !existing) {
        read();
        draft.kind = button.dataset.kind;
        if (draft.kind === "coupon" && !draft.startDate) {
          draft.startDate = today();
        }
        fill();
        renderTemplates();
      }
      if (button.id === "change-kind")
        document
          .querySelector(".pts-type-grid")
          .scrollIntoView({ behavior: "smooth", block: "center" });
      if (button.id === "reset-templates") {
        draft.kind = "deal";
        $("template-industry").value = "nail";
        $("template-goal").value = "all";
        $("template-service").value = "all";
        $("template-search").value = "";
        options();
        renderTemplates();
        update();
      }
      if (button.dataset.channel) {
        read();
        const id = button.dataset.channel;
        draft.channels = draft.channels.includes(id)
          ? draft.channels.filter((x) => x !== id)
          : [...draft.channels, id];
        renderChannels();
        update();
      }
      if (button.id === "show-more-channels") {
        read();
        showMore = !showMore;
        renderChannels();
      }
      if (button.dataset.preview) {
        previewMode = button.dataset.preview;
        update();
      }
      if (button.dataset.channelPreview) {
        previewMode = button.dataset.channelPreview;
        update();
        $("livePrev").scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (button.dataset.theme) {
        const theme = button.dataset.theme;
        if (
          draft.banners.some(
            (b, i) => i !== selectedBanner && b.theme === theme && !b.image,
          )
        ) {
          toast(t("themeAlreadyUsed"));
          return;
        }
        draft.banners[selectedBanner] = { theme };
        update();
      }
      if (button.id === "add-banner") {
        if (draft.banners.length < 8) {
          const theme = Object.keys(themes).find(
            (key) => !draft.banners.some((b) => b.theme === key && !b.image),
          );
          if (theme) {
            draft.banners.push({ theme });
            selectedBanner = draft.banners.length - 1;
            update();
          }
        }
      }
      if (button.hasAttribute("data-banner-move")) {
        const index = Number(button.dataset.bannerMove),
          next = index + Number(button.dataset.direction);
        [draft.banners[index], draft.banners[next]] = [
          draft.banners[next],
          draft.banners[index],
        ];
        selectedBanner = next;
        update();
        return;
      }
      if (
        button.hasAttribute("data-banner-remove") &&
        draft.banners.length > 1
      ) {
        draft.banners.splice(Number(button.dataset.bannerRemove), 1);
        selectedBanner = Math.min(selectedBanner, draft.banners.length - 1);
        update();
        return;
      }
      if (button.id === "poster-open") {
        read();
        openDialog(
          t("promotionPoster"),
          art(draft, draft.banners[selectedBanner]) +
            `<p>${escape(draft.description)}</p><p>${escape(dateRange(draft))}</p>`,
          `<button type="button" class="promo-button primary" id="print-poster">${t("print")}</button>`,
        );
      }
      if (button.id === "print-poster") window.print();
      if (button.id === "quick-create-ai") {
        openDialog(
          t("studio.aiQuick"),
          `<strong>${t("studio.aiShopName")}</strong><p class="promo-note">${t("studio.aiShopIndustry")}</p><h3>${t("studio.aiWantTitle")}</h3><div class="demo-ai-options">${Object.entries(
            data.copy[language].studio.aiIntent,
          )
            .map(
              ([key, label]) =>
                `<button type="button" class="promo-button" data-ai-intent="${key}">${escape(label)}</button>`,
            )
            .join(
              "",
            )}</div><label class="promo-field"><input id="ai-intent-query" placeholder="${escape(t("studio.aiQueryPlaceholder"))}"></label><button type="button" class="promo-button primary" id="suggest-templates">${t("studio.aiSuggest")}</button><div id="ai-suggestions"></div><p class="demo-ai-note">${t("studio.aiNote")}</p>`,
        );
      }
      if (button.dataset.aiIntent || button.id === "suggest-templates") {
        const intent = button.dataset.aiIntent || $("ai-intent-query").value;
        const choices = /back|retain|lapse/i.test(intent)
          ? [templates[2], templates[3], templates[1]]
          : /new/i.test(intent)
            ? [templates[3], templates[1], templates[0]]
            : /ticket|push/i.test(intent)
              ? [templates[0], templates[5], templates[2]]
              : [templates[1], templates[0], templates[2]];
        $("ai-suggestions").innerHTML =
          "<h3>" +
          t("studio.aiSuggestionsTitle") +
          "</h3>" +
          choices
            .map(
              (p) =>
                `<div class="demo-generated"><strong>${escape(p.name)}</strong><p class="promo-note">${escape(p.description)}</p><button type="button" class="promo-button primary" data-template-use="${p.id}">${t("studio.aiUse")}</button></div>`,
            )
            .join("");
      }
      if (button.id === "ai-banner-open") openBannerGenerator();
      if (button.id === "generate-banner") generateBanner();
      if (button.id === "use-generated-banner" && generatedBanner) {
        if (draft.banners.length >= 8) {
          toast(t("bannerError"));
          return;
        }
        draft.banners.push(generatedBanner);
        selectedBanner = draft.banners.length - 1;
        previewMode = "banner";
        dialog.close();
        update();
      }
      if (button.id === "edit-post-schedule") {
        const items = [
          [-3, "3 days before start"],
          [0, "Start day"],
          [7, "Every week"],
          [-2, "2 days before end"],
        ];
        openDialog(
          t("postScheduleEdit"),
          `<p class="promo-note">${t("postScheduleTip")}</p><div class="demo-generated">${items.map(([offset, label]) => `<div class="demo-pos-row"><strong>${label}</strong><span>${draft.startDate ? date(iso(new Date(new Date((offset === -2 && draft.endDate ? draft.endDate : draft.startDate) + "T12:00:00").getTime() + offset * 86400000))) : t("startDateLabel")}</span></div>`).join("")}</div>`,
        );
      }
    });
    document.addEventListener("click", (event) => {
      const row = event.target.closest("[data-banner-select]");
      if (row && !event.target.closest("button")) {
        const index = Number(row.dataset.bannerSelect);
        const banner = draft.banners.splice(index, 1)[0];
        draft.banners.unshift(banner);
        selectedBanner = 0;
        update();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const target = event.target.closest(
        "[data-template-preview],[data-banner-select]",
      );
      if (target && event.target === target) {
        event.preventDefault();
        target.click();
      }
    });
    $("banner-upload").addEventListener("change", (event) => {
      const files = Array.from(event.target.files || []);
      if (!files.length) return;
      if (draft.banners.length >= 8) {
        toast(t("bannerError"));
        return;
      }
      const file = files[0];
      if (
        file.size > 8 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      ) {
        toast(t("uploadHint"));
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        draft.banners.push({ theme: "purple", image: reader.result });
        selectedBanner = draft.banners.length - 1;
        update();
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });
    let generatedBanner = null,
      referenceImage = null,
      aiQuality = "medium",
      aiCredits = 50;
    function openBannerGenerator() {
      read();
      generatedBanner = null;
      referenceImage = null;
      openDialog("AI Banner Generator", $("ai-banner-template").innerHTML);
      dialog.classList.add("phase-ai-dialog");
      dialog.querySelectorAll("[data-icon]").forEach((node) => {
        const name =
          {
            gauge: "settings-2",
            history: "clock",
            play: "video",
            "loader-2": "clock",
          }[node.dataset.icon] || node.dataset.icon;
        node.innerHTML = icon(name);
      });
      $("ai-banner-prompt").value = [
        draft.name,
        draft.description,
        schedule(draft),
      ]
        .filter(Boolean)
        .join(". ");
      $("ai-brand-industry").innerHTML = data.groups
        .map(
          (group) =>
            `<optgroup label="${escape(localized(group))}">${data.industries
              .filter((i) => i.group === group.id)
              .map(
                (i) =>
                  `<option value="${escape(i.id)}" data-industry-icon="${escape(i.icon)}">${escape(localized(i))}</option>`,
              )
              .join("")}</optgroup>`,
        )
        .join("");
      $("ai-brand-industry").value =
        $("template-industry").value === "all"
          ? "nail"
          : $("template-industry").value;
      window.NEXORA_PROMOTION_ICONS.mountPicker($("ai-brand-industry"));
      const syncIndustry = () => {
        $("ai-brand-industry-summary").textContent =
          $("ai-brand-industry").selectedOptions[0].textContent;
      };
      $("ai-brand-industry").addEventListener("change", syncIndustry);
      syncIndustry();
      const syncQuality = () => {
        const cost = { low: 1, medium: 2, high: 4 }[aiQuality];
        $("ai-quality-label").textContent =
          aiQuality[0].toUpperCase() + aiQuality.slice(1);
        $("ai-generation-cost").textContent =
          cost + " " + (cost === 1 ? "credit" : "credits");
        $("ai-available-credits").textContent = aiCredits + " credits";
        dialog
          .querySelectorAll("[data-ai-quality]")
          .forEach((b) =>
            b.classList.toggle("selected", b.dataset.aiQuality === aiQuality),
          );
      };
      syncQuality();
      $("ai-quality-trigger").addEventListener("click", () => {
        $("ai-quality-menu").hidden = !$("ai-quality-menu").hidden;
      });
      dialog.querySelectorAll("[data-ai-quality]").forEach((button) =>
        button.addEventListener("click", () => {
          aiQuality = button.dataset.aiQuality;
          syncQuality();
          $("ai-quality-menu").hidden = true;
        }),
      );
      $("ai-reference-history").addEventListener("click", () => {
        $("ai-reference-history-list").hidden = !$("ai-reference-history-list")
          .hidden;
      });
      dialog.querySelectorAll("[data-ai-history]").forEach((button) =>
        button.addEventListener("click", () => {
          const theme =
            button.dataset.aiHistory === "blue"
              ? "ocean"
              : button.dataset.aiHistory;
          referenceImage =
            draft.banners.find((b) => b.theme === theme && b.image)?.image ||
            null;
          $("ai-reference-text").textContent =
            "Generated " + button.dataset.aiHistory + " banner selected";
          $("ai-reference-history-list").hidden = true;
        }),
      );
      for (const id of ["ai-content-types", "ai-tone-options"])
        $(id).addEventListener("click", (event) => {
          const button = event.target.closest("button");
          if (button)
            $(id)
              .querySelectorAll("button")
              .forEach((item) =>
                item.setAttribute("aria-pressed", String(item === button)),
              );
        });
      $("ai-reference-file").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (
          file.size > 5 * 1024 * 1024 ||
          !["image/png", "image/jpeg", "image/webp"].includes(file.type)
        ) {
          $("ai-generator-error").textContent =
            "Reference image must be a JPG, PNG, or WebP file, 5 MB or smaller.";
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          referenceImage = reader.result;
          $("ai-reference-preview-image").src = reader.result;
          $("ai-reference-name").textContent = file.name;
          $("ai-reference-preview").hidden = false;
          $("ai-reference-upload").hidden = true;
        };
        reader.readAsDataURL(file);
      });
      $("remove-ai-reference").addEventListener("click", () => {
        referenceImage = null;
        $("ai-reference-file").value = "";
        $("ai-reference-preview").hidden = true;
        $("ai-reference-upload").hidden = false;
      });
    }
    function generateBanner() {
      const prompt = $("ai-banner-prompt").value.trim(),
        cost = { low: 1, medium: 2, high: 4 }[aiQuality];
      if (!prompt) {
        $("ai-generator-error").textContent =
          "Describe your ad idea before generating a banner.";
        return;
      }
      if (aiCredits < cost) {
        $("ai-generator-error").textContent =
          "There are not enough AI credits for this generation.";
        return;
      }
      $("ai-generator-error").textContent = "";
      aiCredits -= cost;
      generatedBanner = {
        theme: { low: "rose", medium: "purple", high: "gold" }[aiQuality],
        ...(referenceImage ? { image: referenceImage } : {}),
        prompt,
      };
      if ($("ai-use-brand-colors").checked) {
        generatedBanner.background = `linear-gradient(135deg,${$("ai-brand-color-primary").value},${$("ai-brand-color-secondary").value})`;
        generatedBanner.color = "#ffffff";
      }
      $("ai-available-credits").textContent = aiCredits + " credits";
      $("generated-result").hidden = false;
      $("generated-result").innerHTML =
        `${art(draft, generatedBanner)}<div class="phase-ai-result-actions"><button type="button" class="promo-button primary" id="use-generated-banner">Use this banner</button></div>`;
    }
    renderPage = () => {
      options();
      renderTemplates();
      renderServices();
      renderChannels();
      update();
    };
    options();
    fill();
    renderTemplates();
  }
  function initList() {
    let page = 1,
      offerFilter = "all",
      historyDays = 30;
    const size = 5;
    const allStatusKeys = [
      "run",
      "sched",
      "pause",
      "sold",
      "ended",
      "draft",
      "review",
      "rejected",
    ];
    const trackingChannels = [
      {
        id: "search",
        name: "Search Deals",
        color: "#f59e0b",
        views: 2310,
        clicks: 322,
        redeems: 41,
        revenue: 1260,
        cost: 180,
        shares: { "source-0": 0.44, "source-2": 0.24, "source-11": 0.32 },
      },
      {
        id: "nearby",
        name: "Deals Nearby / Explore",
        color: "#a855f7",
        views: 0,
        clicks: 0,
        redeems: 0,
        revenue: 0,
        cost: 0,
        shares: {},
      },
      {
        id: "community",
        name: "Community",
        color: "#ec4899",
        views: 0,
        clicks: 0,
        redeems: 0,
        revenue: 0,
        cost: 0,
        shares: {},
      },
      {
        id: "xpromo",
        name: "Cross-promo partners",
        color: "#06b6d4",
        views: 0,
        clicks: 0,
        redeems: 0,
        revenue: 0,
        cost: 0,
        shares: {},
      },
    ];
    const history = [
      {
        date: "2026-10-27",
        time: "10:36 AM",
        client: "***-***-1231",
        id: "source-2",
        method: "Promotion",
        by: "Vlink 06",
        bill: 180,
        discount: 36,
        result: "Voided",
      },
      {
        date: "2026-10-26",
        time: "9:36 AM",
        client: "***-***-5555",
        id: "source-2",
        method: "Promotion",
        by: "Vlink 06",
        bill: 120,
        discount: 30,
        result: "Applied",
      },
      {
        date: "2026-10-23",
        time: "2:30 PM",
        client: "***-***-7221",
        id: "source-2",
        method: "Promotion",
        by: "Vlink 06",
        bill: 24,
        discount: 6,
        result: "Applied",
      },
      {
        date: "2026-10-23",
        time: "2:28 PM",
        client: "***-***-1231",
        id: "source-2",
        method: "Promotion",
        by: "Vlink 06",
        bill: 24,
        discount: 6,
        result: "Applied",
      },
      {
        date: "2026-10-23",
        time: "12:16 PM",
        client: "***-***-1111",
        id: "source-3",
        method: "Promotion",
        by: "Vlink 06",
        bill: 36,
        discount: 9,
        result: "Applied",
      },
    ];
    function filtered() {
      const q = $("program-search").value.toLowerCase().trim(),
        s = $("program-status").value;
      return promotions.filter(
        (p) =>
          (offerFilter === "all" || p.kind === offerFilter) &&
          (s === "all" ||
            (s === "review"
              ? p.publicStatus === "pending"
              : status(p) === s)) &&
          [p.name, p.badge].join(" ").toLowerCase().includes(q),
      );
    }
    function action(name, id, iconName, disabled = false) {
      return `<button type="button" data-action="${name}" data-id="${escape(id)}" aria-label="${escape(t(name === "toggle" ? "activate" : name))}" title="${escape(t(name === "toggle" ? "activate" : name))}" ${disabled ? "disabled" : ""}>${icon(iconName)}</button>`;
    }
    function renderList() {
      const rows = filtered(),
        pages = Math.max(1, Math.ceil(rows.length / size));
      page = Math.max(1, Math.min(page, pages));
      const counters = [
        ["kpiRunning", promotions.filter((p) => status(p) === "run").length],
        [
          "kpiClaimed",
          promotions.reduce((sum, p) => sum + Number(p.claimed || 0), 0),
        ],
        [
          "kpiUses",
          promotions.reduce((sum, p) => sum + Number(p.used || 0), 0),
        ],
        [
          "kpiDiscount",
          money(
            promotions.reduce(
              (sum, p) => sum + Number(p.discountTotal || 0),
              0,
            ),
          ),
        ],
        [
          "kpiRevenue",
          money(promotions.reduce((sum, p) => sum + Number(p.revenue || 0), 0)),
        ],
      ];
      $("list-kpis").innerHTML = counters
        .map(
          ([key, value]) =>
            `<div><b>${escape(value)}</b><span>${t(key)}</span></div>`,
        )
        .join("");
      $("program-status")
        .querySelectorAll("option")
        .forEach((option) => {
          if (option.value === "all") option.textContent = t("filterStatusAll");
          else
            option.textContent =
              statusLabel(option.value) +
              " · " +
              promotions.filter((p) =>
                option.value === "review"
                  ? p.publicStatus === "pending"
                  : status(p) === option.value,
              ).length;
        });
      $("program-rows").innerHTML = rows.length
        ? rows
            .slice((page - 1) * size, page * size)
            .map(
              (p) =>
                `<tr><td data-label="${t("colProgram")}"><b>${escape(p.name)}</b><small>${escape(channelNames(p))}</small>${p.publicStatus === "pending" ? '<span class="demo-public-tag">Public: automatic review</span>' : p.publicStatus === "approved" ? '<span class="demo-public-tag">Public: automatically approved</span>' : ""}</td><td data-label="${t("colType")}"><span class="promo-kind is-${p.kind}">${t(p.kind === "coupon" ? "couponLabel" : "dealLabel")} · ${escape(rate(p))}</span></td><td data-label="${t("colSchedule")}"><button type="button" class="demo-table-schedule" data-action="calTitle" data-id="${escape(p.id)}"><span>${escape(schedule(p))}</span><small class="${!p.startDate && !p.endDate ? "promo-schedule-open" : ""}">${escape(dateRange(p))}</small></button></td><td data-label="${t("colProgress")}">${p.kind === "coupon" ? `<div class="promo-progress-track"><i style="width:${Math.min(100, (Number(p.claimed || 0) / Math.max(1, Number(p.slots))) * 100)}%"></i></div><small>${t("progressCoupon", { claimed: p.claimed || 0, total: p.slots, used: p.used || 0 })}</small>` : `<small>${t("progressUses", { used: p.used || 0 })}</small>`}</td><td data-label="${t("colDiscount")}">${money(p.discountTotal)}</td><td data-label="${t("colRevenue")}"><b>${money(p.revenue)}</b></td><td data-label="${t("colStatus")}"><span class="promo-run-status is-${status(p)}">${statusLabel(p)}</span></td><td><div class="promo-row-actions">${action("editAction", p.id, "paintbrush")}${`<button type="button" data-action="toggle" data-id="${escape(p.id)}" aria-label="${t(p.active ? "deactivate" : "activate")}" title="${t(p.active ? "deactivate" : "activate")}">${p.active ? "Ⅱ" : "▷"}</button>`}${action("calTitle", p.id, "calendar-days")}${action("smsAction", p.id, "message-circle")}${action("duplicate", p.id, "package")}${action("historyAction", p.id, "clock")}${p.kind === "coupon" ? action("codesAction", p.id, "ticket") : action("delete", p.id, "square", Number(p.used) > 0 || Number(p.claimed) > 0)}</div></td></tr>`,
            )
            .join("")
        : `<tr><td colspan="8" class="promo-manage-empty">${t(promotions.length ? "noMatches" : "emptyTitle")}</td></tr>`;
      $("program-pagination").innerHTML =
        `<span>${rows.length ? `Showing ${(page - 1) * size + 1} to ${Math.min(page * size, rows.length)} of ${rows.length} results` : "0 results"}</span><div class="demo-pages"><button type="button" data-page="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="${t("historyPrev")}">‹</button>${Array.from({ length: pages }, (_, i) => `<button type="button" data-page="${i + 1}" ${page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("")}<button type="button" data-page="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="${t("historyNext")}">›</button></div>`;
      document
        .querySelectorAll("[data-offer-filter]")
        .forEach((button) =>
          button.classList.toggle(
            "is-on",
            button.dataset.offerFilter === offerFilter,
          ),
        );
    }
    function renderCalendar() {
      const now = new Date(),
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end = new Date(start.getFullYear(), start.getMonth() + 4, 1),
        span = end - start;
      const position = (value) =>
        Math.max(
          0,
          Math.min(100, ((new Date(value + "T12:00:00") - start) / span) * 100),
        );
      const months = Array.from(
        { length: 4 },
        (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1),
      );
      $("promotion-calendar").innerHTML = promotions.length
        ? `<div class="demo-cal-scroll"><div class="promo-cal"><div class="promo-cal-head"><div>${t("colProgram")}</div><div class="promo-cal-months">${months.map((m) => `<span>${m.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>`).join("")}</div></div>${promotions
            .map((p) => {
              const left = p.startDate ? position(p.startDate) : 0,
                right = p.endDate ? position(p.endDate) : 100;
              return `<div class="promo-cal-row" role="button" tabindex="0" data-action="calTitle" data-id="${escape(p.id)}"><div><span class="promo-kind is-${p.kind}">${t(p.kind === "coupon" ? "couponLabel" : "dealLabel")}</span> <b>${escape(p.name)}</b><small>${escape(schedule(p))}</small></div><div class="promo-cal-track">${months.map((m) => `<i class="promo-cal-grid" style="left:${position(iso(m))}%"></i>`).join("")}${right >= left ? `<span class="promo-cal-bar is-${status(p)}" style="left:${left}%;width:${Math.max(0, Math.min(100 - left, right - left))}%">${statusLabel(p)} · ${escape(dateRange(p))}</span>` : ""}<i class="promo-cal-today" style="left:${position(today())}%"></i></div></div>`;
            })
            .join("")}</div></div>`
        : `<p class="promo-manage-empty">${t("emptyTitle")}</p>`;
      const colors = [
        "#86efac",
        "#c4b5fd",
        "#fde68a",
        "#fda4af",
        "#cbd5e1",
        "#e2e8f0",
        "#fcd34d",
        "#fecaca",
      ];
      $("calendar-legend").innerHTML =
        allStatusKeys
          .map(
            (key, i) =>
              `<span><i style="background:${colors[i]}"></i>${statusLabel(key)}</span>`,
          )
          .join("") + `<span>${t("legendToday")}</span>`;
    }
    function syncProgramFilters() {
      for (const id of ["tracking-promotion", "history-promotion"]) {
        const select = $(id),
          value = select.value;
        select.innerHTML =
          `<option value="all">${id === "tracking-promotion" ? "All promotions" : t("historyAllPrograms")}</option>` +
          promotions
            .map(
              (p) =>
                `<option value="${escape(p.id)}">${escape(p.name)}</option>`,
            )
            .join("");
        select.value = promotions.some((p) => p.id === value) ? value : "all";
      }
    }
    function selectedTrackingChannels() {
      const program = $("tracking-promotion").value;
      const scope =
        program === "all"
          ? promotions
          : promotions.filter((promotion) => promotion.id === program);
      const selected = new Set(
        scope.flatMap(
          (promotion) => promotion.paidPlacements || promotion.channels || [],
        ),
      );
      return trackingChannels.filter((channel) => selected.has(channel.id));
    }
    function syncTrackingChannels() {
      const select = $("tracking-channel");
      const value = select.value;
      const channels = selectedTrackingChannels();
      select.innerHTML =
        '<option value="all">All channels</option>' +
        channels
          .map(
            (channel) =>
              `<option value="${channel.id}">${escape(channel.name)}</option>`,
          )
          .join("");
      select.value = channels.some((channel) => channel.id === value)
        ? value
        : "all";
    }
    function trackingRows() {
      const program = $("tracking-promotion").value,
        period = Number($("tracking-period").value),
        channel = $("tracking-channel").value;
      const factor = period === 7 ? 7 / 30 : period === 90 ? 3 : 1;
      return selectedTrackingChannels()
        .filter((c) => channel === "all" || c.id === channel)
        .map((c) => {
          const weight = program === "all" ? 1 : c.shares[program] || 0;
          const row = { ...c };
          for (const key of ["views", "clicks", "redeems", "revenue", "cost"])
            row[key] = Math.round(c[key] * factor * weight);
          return row;
        });
    }
    function renderTracking() {
      syncTrackingChannels();
      const rows = trackingRows(),
        totals = rows.reduce(
          (sum, row) => {
            for (const key of ["views", "clicks", "redeems", "revenue", "cost"])
              sum[key] += row[key];
            return sum;
          },
          { views: 0, clicks: 0, redeems: 0, revenue: 0, cost: 0 },
        );
      const metrics = [
        ["Total views", number(totals.views), "+12.4%"],
        ["Clicks", number(totals.clicks), "+9.8%"],
      ];
      const defaultReport =
        $("tracking-promotion").value === "all" &&
        $("tracking-period").value === "30" &&
        $("tracking-channel").value === "all";
      $("tracking-metrics").innerHTML = metrics
        .map(
          ([label, value, growth]) =>
            `<article><span>${label}</span><strong>${value}</strong><small>${defaultReport ? growth + " vs prior period" : "—"}</small></article>`,
        )
        .join("");
      $("tracking-rows").innerHTML = rows
        .map(
          (row) =>
            `<tr><td><span class="demo-channel-name" style="--channel-color:${row.color}"><i></i>${row.name}</span></td><td>${number(row.views)}</td><td>${number(row.clicks)}</td><td>${money(row.cost)}</td></tr>`,
        )
        .join("");
      $("tracking-summary").textContent = [
        "tracking-promotion",
        "tracking-period",
        "tracking-channel",
      ]
        .map((id) => $(id).selectedOptions[0].textContent)
        .join(" · ");
      const viewed = rows.filter((row) => row.views > 0),
        highest = [...viewed].sort(
          (a, b) => b.clicks / b.views - a.clicks / a.views,
        )[0],
        revenue = [...viewed].sort((a, b) => b.revenue - a.revenue)[0];
      $("tracking-insight").textContent =
        highest && revenue
          ? `${highest.name} · CTR ${((highest.clicks / highest.views) * 100).toFixed(1)}% · ${revenue.name} · ${money(revenue.revenue)}`
          : "—";
    }
    function historyRows() {
      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - historyDays + 1);
      return history.filter(
        (row) =>
          promotions.some((p) => p.id === row.id) &&
          new Date(row.date + "T12:00:00") >= cutoff &&
          ($("history-promotion").value === "all" ||
            row.id === $("history-promotion").value) &&
          ($("history-method").value === "all" ||
            row.method === $("history-method").value) &&
          ($("history-result").value === "all" ||
            row.result === $("history-result").value),
      );
    }
    function renderHistory() {
      const rows = historyRows();
      $("history-rows").innerHTML = rows.length
        ? rows
            .map(
              (row) =>
                `<tr><td>${date(row.date)}<small>${row.time}</small></td><td>${row.client}</td><td><b>${escape(promotions.find((p) => p.id === row.id)?.name || "")}</b></td><td>${escape(row.method)}</td><td>${escape(row.by)}</td><td>${money(row.bill)}</td><td>−${money(row.discount)}</td><td><span class="promo-run-status is-${row.result === "Applied" ? "run" : "pause"}">${escape(row.result)}</span></td></tr>`,
            )
            .join("")
        : `<tr><td colspan="8" class="promo-manage-empty">${t("historyEmpty")}</td></tr>`;
      document
        .querySelectorAll("[data-history-days]")
        .forEach((b) =>
          b.classList.toggle(
            "is-on",
            Number(b.dataset.historyDays) === historyDays,
          ),
        );
    }
    let scheduleId;
    function openSchedule(p) {
      scheduleId = p.id;
      openDialog(
        t("calTitle"),
        `<p class="promo-eyebrow">${escape(p.name)}</p><div class="promo-field-row"><label class="promo-field"><span>${t("startDateLabel")}</span><input id="schedule-start-date" type="date" value="${escape(p.startDate)}"></label><label class="promo-field"><span>${t("endDateLabel")}</span><input id="schedule-end-date" type="date" value="${escape(p.endDate)}"></label></div><fieldset class="promo-days"><legend>${t("schDays")}</legend><div>${weekdays.map((name, index) => `<label class="promo-day"><input name="schedule-day" type="checkbox" value="${index}" ${p.days.includes(index) ? "checked" : ""}><span>${name}</span></label>`).join("")}</div></fieldset><div class="promo-field-row"><label class="promo-field"><span>${t("startLabel")}</span><input type="time" id="schedule-start-time" value="${escape(p.startTime)}"></label><label class="promo-field"><span>${t("endLabel")}</span><input type="time" id="schedule-end-time" value="${escape(p.endTime)}"></label></div><p class="promo-note">${t("schAutoOffHint")}</p><p class="promo-error" id="schedule-error" role="alert"></p>`,
        `<button type="button" class="promo-button primary" id="save-schedule">${t("schSave")}</button>`,
      );
    }
    function renderAll() {
      settleReviews();
      renderList();
      renderCalendar();
      syncProgramFilters();
      renderTracking();
      renderHistory();
    }
    ["program-search", "program-status"].forEach((id) =>
      $(id).addEventListener(
        id === "program-search" ? "input" : "change",
        () => {
          page = 1;
          renderList();
        },
      ),
    );
    ["tracking-promotion", "tracking-period", "tracking-channel"].forEach(
      (id) => $(id).addEventListener("change", renderTracking),
    );
    ["history-promotion", "history-method", "history-result"].forEach((id) =>
      $(id).addEventListener("change", renderHistory),
    );
    document.addEventListener("click", (event) => {
      const pageButton = event.target.closest("[data-page]");
      if (pageButton) {
        page = Number(pageButton.dataset.page);
        renderList();
        return;
      }
      const filter = event.target.closest("[data-offer-filter]");
      if (filter) {
        offerFilter = filter.dataset.offerFilter;
        page = 1;
        renderList();
        return;
      }
      const historyFilter = event.target.closest("[data-history-days]");
      if (historyFilter) {
        historyDays = Number(historyFilter.dataset.historyDays);
        renderHistory();
        return;
      }
      const button = event.target.closest("[data-action]");
      if (button) {
        const p = promotions.find((p) => p.id === button.dataset.id);
        if (!p) return;
        switch (button.dataset.action) {
          case "editAction":
            location.href =
              "pos-promotions-new.html?edit=" + encodeURIComponent(p.id);
            return;
          case "toggle": {
            const next = structuredClone(p);
            next.active = !p.active;
            next.draft = false;
            next.statusOverride = undefined;
            if (
              next.active &&
              next.channels.some((id) =>
                data.channels.some((c) => c.id === id && c.tier === "pub"),
              ) &&
              next.publicStatus !== "approved"
            ) {
              next.publicStatus = "pending";
              next.reviewAt = Date.now() + 1500;
            }
            if (
              persist(promotions.map((row) => (row.id === p.id ? next : row)))
            ) {
              toast(
                t(next.active ? "enableSuccess" : "disableSuccess", {
                  name: p.name,
                }),
              );
              renderAll();
            }
            return;
          }
          case "duplicate": {
            const next = {
              ...structuredClone(p),
              id: crypto.randomUUID(),
              name: p.name + " · " + t("copySuffix"),
              active: false,
              draft: true,
              statusOverride: undefined,
              used: 0,
              claimed: 0,
              discountTotal: 0,
              revenue: 0,
              publicStatus: "off",
              paidStatus: p.paidEnabled ? "draft" : "off",
            };
            if (persist([next, ...promotions])) {
              page = 1;
              renderAll();
            }
            return;
          }
          case "calTitle":
            openSchedule(p);
            return;
          case "historyAction":
            $("history-promotion").value = p.id;
            historyDays = 30;
            renderHistory();
            $("promo-redeem-hist").scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            return;
          case "smsAction":
            toast(t("smsSoon"));
            return;
          case "codesAction":
            openDialog(
              t("codesTitle"),
              `<p>${escape(p.name)}</p><p class="promo-note">${t("codesEmpty")}</p>`,
            );
            return;
          case "delete":
            if (p.used || p.claimed) {
              toast(t("deleteBlocked"));
              return;
            }
            openDialog(
              t("deleteConfirmTitle"),
              `<p class="demo-confirm">${escape(t("deleteConfirmMessage", { name: p.name }))}</p>`,
              `<button type="button" class="promo-button" data-close-confirm>${t("cancel")}</button><button type="button" class="promo-button primary" data-confirm-delete="${escape(p.id)}">${t("delete")}</button>`,
            );
            return;
        }
      }
      const remove = event.target.closest("[data-confirm-delete]");
      if (remove) {
        const p = promotions.find((p) => p.id === remove.dataset.confirmDelete);
        if (p && (p.used || p.claimed)) {
          toast(t("deleteBlocked"));
          return;
        }
        if (
          persist(
            promotions.filter((p) => p.id !== remove.dataset.confirmDelete),
          )
        ) {
          dialog.close();
          renderAll();
        }
        return;
      }
      if (event.target.closest("[data-close-confirm]")) dialog.close();
      if (event.target.closest("#save-schedule")) {
        const p = promotions.find((p) => p.id === scheduleId);
        if (!p) return;
        const startDate = $("schedule-start-date").value,
          endDate = $("schedule-end-date").value,
          startTime = $("schedule-start-time").value,
          endTime = $("schedule-end-time").value,
          days = [
            ...dialog.querySelectorAll("[name=schedule-day]:checked"),
          ].map((input) => Number(input.value));
        let error = !days.length
          ? t("schWarnDays")
          : !startTime || !endTime || endTime <= startTime
            ? t("schWarnHours")
            : endDate && (!startDate || endDate < startDate)
              ? t("schWarnEnd")
              : p.kind === "coupon" && !startDate
                ? t("errorStartDateRequired")
                : "";
        $("schedule-error").textContent = error;
        if (error) return;
        const next = { ...p, startDate, endDate, startTime, endTime, days };
        if (persist(promotions.map((row) => (row.id === p.id ? next : row)))) {
          dialog.close();
          toast(t("schSaved"));
          renderAll();
        }
      }
    });
    $("promotion-calendar").addEventListener("keydown", (event) => {
      if (
        ["Enter", " "].includes(event.key) &&
        event.target.matches("[data-action]")
      ) {
        event.preventDefault();
        event.target.click();
      }
    });
    $("export-tracking").addEventListener("click", () => {
      const rows = trackingRows();
      download("promotion-performance-" + today() + ".csv", [
        ["Promotion", $("tracking-promotion").selectedOptions[0].textContent],
        [
          "Reporting period",
          $("tracking-period").selectedOptions[0].textContent,
        ],
        ["Channel", $("tracking-channel").selectedOptions[0].textContent],
        [],
        ["Channel", "Views", "Clicks", "Cost"],
        ...rows.map((row) => [row.name, row.views, row.clicks, row.cost]),
      ]);
    });
    $("export-history").addEventListener("click", () => {
      download("promotion-redemptions-" + today() + ".csv", [
        [
          "Time",
          "Client",
          "Program",
          "Method",
          "Applied by",
          "Bill",
          "Discount",
          "Result",
        ],
        ...historyRows().map((row) => [
          date(row.date) + " " + row.time,
          row.client,
          promotions.find((p) => p.id === row.id)?.name,
          row.method,
          row.by,
          row.bill,
          row.discount,
          row.result,
        ]),
      ]);
      toast(t("historyExported"));
    });
    // Own placements are already enabled; only public placements await the simulated automatic review.
    const reviewTimer = setInterval(() => {
      if (promotions.some((p) => p.publicStatus === "pending")) {
        settleReviews();
        renderList();
      }
    }, 1500);
    window.addEventListener("pagehide", () => clearInterval(reviewTimer), {
      once: true,
    });
    renderPage = renderAll;
    renderAll();
  }
  if (document.body.dataset.promotionPage === "create") initCreate();
  else initList();
  applyLanguage();
})();
