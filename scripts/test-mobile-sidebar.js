const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

class ClassList {
  constructor(element) {
    this.element = element;
  }

  _set() {
    return new Set((this.element.getAttribute("class") || "").split(/\s+/).filter(Boolean));
  }

  _write(classes) {
    this.element.setAttribute("class", Array.from(classes).join(" "));
  }

  add(...names) {
    const classes = this._set();
    names.forEach((name) => classes.add(name));
    this._write(classes);
  }

  remove(...names) {
    const classes = this._set();
    names.forEach((name) => classes.delete(name));
    this._write(classes);
  }

  contains(name) {
    return this._set().has(name);
  }

  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.contains(name) : Boolean(force);
    if (shouldAdd) {
      this.add(name);
    } else {
      this.remove(name);
    }
    return shouldAdd;
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.listeners = new Map();
    this.classList = new ClassList(this);
    this.textContent = "";
  }

  set id(value) {
    this.setAttribute("id", value);
  }

  get id() {
    return this.getAttribute("id") || "";
  }

  set className(value) {
    this.setAttribute("class", value);
  }

  get className() {
    return this.getAttribute("class") || "";
  }

  get dataset() {
    const data = {};
    this.attributes.forEach((value, key) => {
      if (key.startsWith("data-")) {
        const prop = key
          .slice(5)
          .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        data[prop] = value;
      }
    });
    return data;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  append(...children) {
    children.forEach((child) => this.appendChild(child));
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  dispatchEvent(event) {
    const fullEvent = {
      target: this,
      currentTarget: this,
      preventDefault() {},
      stopPropagation() {},
      ...event,
    };
    (this.listeners.get(fullEvent.type) || []).forEach((handler) => handler(fullEvent));
  }

  closest(selector) {
    let node = this;
    while (node) {
      if (matchesSelector(node, selector)) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  scrollIntoView() {}

  querySelector(selector) {
    return querySelectorAll(this, selector)[0] || null;
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  set innerHTML(html) {
    this.children = [];
    parseHTML(html, this);
  }

  get innerHTML() {
    return "";
  }
}

class FakeDocument {
  constructor() {
    this.head = new FakeElement("head");
    this.body = new FakeElement("body");
    this.body.setAttribute("data-root", "..");
    this.body.setAttribute("data-page", "analytics");
    this.listeners = new Map();

    const app = new FakeElement("div");
    app.id = "app";
    this.body.appendChild(app);
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  getElementById(id) {
    return allElements(this).find((element) => element.id === id) || null;
  }

  querySelector(selector) {
    return querySelectorAll(this, selector)[0] || null;
  }

  querySelectorAll(selector) {
    return querySelectorAll(this, selector);
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  dispatchEvent(event) {
    const fullEvent = {
      target: this,
      currentTarget: this,
      preventDefault() {},
      stopPropagation() {},
      ...event,
    };
    (this.listeners.get(fullEvent.type) || []).forEach((handler) => handler(fullEvent));
  }
}

function allElements(root) {
  const seeds = root instanceof FakeDocument ? [root.head, root.body] : [root];
  const found = [];

  function walk(node) {
    found.push(node);
    node.children.forEach(walk);
  }

  seeds.forEach(walk);
  return found;
}

function parseHTML(html, parent) {
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
  const stack = [parent];
  const tagPattern = /<\/?[^>]+>/g;
  let match;

  while ((match = tagPattern.exec(html))) {
    const token = match[0];
    if (token.startsWith("</")) {
      if (stack.length > 1) {
        stack.pop();
      }
      continue;
    }

    const tagContent = token.slice(1, token.endsWith("/>") ? -2 : -1).trim();
    const tagMatch = tagContent.match(/^([^\s/>]+)/);
    if (!tagMatch) {
      continue;
    }

    const element = new FakeElement(tagMatch[1]);
    parseAttributes(tagContent.slice(tagMatch[0].length), element);
    stack[stack.length - 1].appendChild(element);

    if (!token.endsWith("/>") && !voidTags.has(element.tagName.toLowerCase())) {
      stack.push(element);
    }
  }
}

function parseAttributes(source, element) {
  const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>=]+)))?/g;
  let match;

  while ((match = attrPattern.exec(source))) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    element.setAttribute(name, doubleQuoted ?? singleQuoted ?? unquoted ?? "");
  }
}

function querySelectorAll(root, selector) {
  const parts = selector.trim().split(/\s+/);
  return allElements(root).filter((element) => matchesSelectorParts(element, parts));
}

function matchesSelector(element, selector) {
  return matchesSelectorParts(element, selector.trim().split(/\s+/));
}

function matchesSelectorParts(element, parts) {
  if (!matchesSimpleSelector(element, parts[parts.length - 1])) {
    return false;
  }

  let ancestor = element.parentElement;
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    while (ancestor && !matchesSimpleSelector(ancestor, parts[index])) {
      ancestor = ancestor.parentElement;
    }
    if (!ancestor) {
      return false;
    }
    ancestor = ancestor.parentElement;
  }
  return true;
}

function matchesSimpleSelector(element, selector) {
  let rest = selector;
  const tagMatch = rest.match(/^[a-zA-Z][a-zA-Z0-9-]*/);
  if (tagMatch) {
    if (element.tagName.toLowerCase() !== tagMatch[0].toLowerCase()) {
      return false;
    }
    rest = rest.slice(tagMatch[0].length);
  }

  const selectorPattern = /([.#])([a-zA-Z0-9_-]+)|\[([^\]=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/g;
  let match;
  while ((match = selectorPattern.exec(rest))) {
    if (match[1] === "#") {
      if (element.id !== match[2]) {
        return false;
      }
    } else if (match[1] === ".") {
      if (!element.classList.contains(match[2])) {
        return false;
      }
    } else if (match[3]) {
      const value = element.getAttribute(match[3]);
      const expected = match[4] ?? match[5] ?? match[6];
      if (value === null) {
        return false;
      }
      if (expected !== undefined && value !== expected) {
        return false;
      }
    }
  }

  return true;
}

const document = new FakeDocument();
const storage = new Map();
const window = {
  document,
  localStorage: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
  },
  matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {} }),
  requestAnimationFrame: (callback) => callback(),
  setTimeout: (callback) => callback(),
};

const context = {
  console,
  document,
  localStorage: window.localStorage,
  window,
};

vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, "../html/assets/layout.js"), "utf8"),
  context,
  { filename: "html/assets/layout.js" },
);

context.window.TaxIQLayout.renderShell(() => {});

const mobileButton = document.querySelector("[data-mobile-sidebar-open]");
const sidebar = document.getElementById("taxiq-sidebar");
const backdrop = document.querySelector("[data-mobile-sidebar-backdrop]");
const closeButton = document.querySelector("[data-mobile-sidebar-close]");
const navLink = sidebar?.querySelector(".sb-item");
const sidebarHrefs = sidebar ? sidebar.querySelectorAll(".sb-item").map((link) => link.getAttribute("href")) : [];
const aiAdvisorIcon = sidebar?.querySelector('a[href="ai-advisor.html"] i');

assert(mobileButton, "mobile hamburger button should render on shared html/pages shells");
assert(sidebar, "sidebar should render");
assert(backdrop, "mobile backdrop should render");
assert(closeButton, "mobile drawer close button should render");
assert(navLink, "sidebar nav link should render");
assert(!sidebarHrefs.includes("webhooks.html"), "Webhooks menu item should stay hidden from the sidebar");
assert(!sidebarHrefs.includes("audit-log.html"), "Audit Log menu item should stay hidden from the sidebar");
assert(aiAdvisorIcon, "AI Advisor nav icon should render");
assert(aiAdvisorIcon.classList.contains("fa-brain"), "AI Advisor should use a modern AI brain icon");
assert(!aiAdvisorIcon.classList.contains("fa-robot"), "AI Advisor should no longer use the generic robot icon");
assert(mobileButton.getAttribute("aria-expanded") === "false", "hamburger starts closed");
assert(!sidebar.classList.contains("mobile-drawer-open"), "sidebar starts closed on mobile");

mobileButton.dispatchEvent({ type: "click" });

assert(mobileButton.getAttribute("aria-expanded") === "true", "hamburger reports open after click");
assert(sidebar.classList.contains("mobile-drawer-open"), "sidebar opens after hamburger click");
assert(!backdrop.classList.contains("hidden"), "backdrop shows after hamburger click");

backdrop.dispatchEvent({ type: "click" });

assert(mobileButton.getAttribute("aria-expanded") === "false", "backdrop closes drawer");
assert(!sidebar.classList.contains("mobile-drawer-open"), "sidebar closes after backdrop click");
assert(backdrop.classList.contains("hidden"), "backdrop hides after close");

mobileButton.dispatchEvent({ type: "click" });
document.dispatchEvent({ type: "keydown", key: "Escape" });

assert(mobileButton.getAttribute("aria-expanded") === "false", "Escape closes drawer");
assert(!sidebar.classList.contains("mobile-drawer-open"), "sidebar closes after Escape");

mobileButton.dispatchEvent({ type: "click" });
closeButton.dispatchEvent({ type: "click" });

assert(mobileButton.getAttribute("aria-expanded") === "false", "close button closes drawer");
assert(!sidebar.classList.contains("mobile-drawer-open"), "sidebar closes after close button click");

mobileButton.dispatchEvent({ type: "click" });
navLink.dispatchEvent({ type: "click" });

assert(mobileButton.getAttribute("aria-expanded") === "false", "nav link closes drawer");
assert(!sidebar.classList.contains("mobile-drawer-open"), "sidebar closes after nav link click");

console.log("mobile sidebar regression passed");
