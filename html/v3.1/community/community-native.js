/* Mount the existing PO documents as isolated DOM regions, without iframe navigation. */
(() => {
  'use strict';
  const browser = window;
  const fetched = new Map();
  function read(url) {
    if (!fetched.has(url)) fetched.set(url, fetch(url, {cache:'no-cache'}).then(response => {
      if (!response.ok) throw new Error('Unable to load Community: ' + response.status);
      return response.text();
    }).catch(error => { fetched.delete(url); throw error; }));
    return fetched.get(url);
  }
  function css(text, base) {
    return text.replace(/:root\b/g, ':host')
      .replace(/(?<![\w.-])html(?![\w-])/g, '.native-html')
      .replace(/(?<![\w.-])body(?![\w-])/g, '.native-body')
      .replace(/@media\s*\(\s*(max|min)-width\s*:\s*(\d+)px\s*\)/g, '@container module ($1-width: $2px)')
      .replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (all, quote, value) => /^(?:data:|https?:|#)/.test(value) ? all : 'url("' + new URL(value, base).href + '")');
  }
  async function mount(host, source, options = {}) {
    if (host.communityModule) return host.communityModule;
    const url = new URL(source, browser.location.href);
    const parsed = new DOMParser().parseFromString(await read(url.href), 'text/html');
    // The outer page already owns Live Server reloads; injected dev scripts are not PO module code.
    const scripts = [...parsed.querySelectorAll('script')].filter(node => (!node.type || /javascript|module/.test(node.type)) && !node.textContent.includes('Live reload enabled.'));
    const styles = await Promise.all([...parsed.querySelectorAll('style,link[rel="stylesheet"]')].filter(node=>!node.href||!/^https:\/\/fonts\./.test(node.href)).map(async node => {
      const base = node.tagName === 'STYLE' ? url : new URL(node.getAttribute('href'), url);
      return css(node.tagName === 'STYLE' ? node.textContent : await read(base.href), base);
    }));
    const sources = await Promise.all(scripts.map(async node => {
      const scriptURL = node.src ? new URL(node.getAttribute('src'), url) : url;
      return {url: scriptURL.href, code: node.src ? await read(scriptURL.href) : node.textContent};
    }));
    parsed.querySelectorAll('script,style,link[rel="stylesheet"]').forEach(node => node.remove());
    const root = host.attachShadow({mode:'open'});
    const html = document.createElement('div'), head = document.createElement('div'), body = document.createElement('div');
    html.className = 'native-html'; html.lang = parsed.documentElement.lang || 'en';
    head.className = 'native-head'; body.className = 'native-body ' + parsed.body.className;
    for (const attribute of parsed.body.attributes) if (attribute.name !== 'class') body.setAttribute(attribute.name, attribute.value);
    body.append(...parsed.body.childNodes); html.append(head, body);
    const style = document.createElement('style');
    style.textContent = styles.join('\n') + '\n:host{display:block;min-width:0;height:100%;overflow:hidden;overscroll-behavior:contain;container:module / inline-size;contain:layout style;isolation:isolate}[hidden]{display:none!important}.native-head{display:none}.native-html,.native-body{min-height:100%;margin:0;box-sizing:border-box}.native-html{height:100%}.native-body{height:100%;overflow-x:clip;overflow-y:auto}*,*::before,*::after{box-sizing:border-box}img,video{max-width:100%}dialog{max-width:calc(100% - 24px)}@container module (max-width:600px){input,select,textarea{font-size:16px!important}}';
    root.append(style, html);
    const events = new EventTarget(), variables = Object.create(null), regionID=crypto.randomUUID();
    const listeners = [], timers = new Set();
    let currentScript = null, facade;
    const location = new URL(url);
    location.assign = next => options.navigate ? options.navigate(new URL(next, location).href) : browser.location.assign(new URL(next, location));
    location.replace = location.assign;
    const parent = options.parent || {
      postMessage(data) { options.onMessage?.(data, facade); },
      location: browser.location,
      document: browser.document
    };
    const scope = {setScript(src){currentScript=browser.document.createElement('script');currentScript.src=src;}};
    function controls(element){
      const candidates=[...(element.tagName==='BUTTON'?[element]:[]),...element.querySelectorAll?.('button')||[]];
      for(const button of candidates){
        if(button.querySelector('svg')||button.closest('[data-user-text],[data-community-authored],.chat-message-body'))continue;
        const action=Object.values(button.dataset).join(' ')+' '+(button.getAttribute('aria-label')||'')+' '+button.textContent;
        const rules=[[/spin|quay/i,'RotateCw'],[/close|cancel|đóng|hủy|×|✕/i,'X'],[/mic|micro|voice|giọng/i,'Mic'],[/video|reel/i,'Video'],[/photo|image|ảnh|camera/i,'Camera'],[/delete|remove|xóa|xoá/i,'Trash2'],[/save|lưu/i,'Save'],[/search|find|tìm/i,'Search'],[/back|prev|quay lại|trước/i,'ArrowLeft'],[/next|tiếp/i,'ArrowRight'],[/send|gửi|reply|trả lời/i,'Send'],[/create|add|new|thêm|tạo/i,'Plus'],[/edit|sửa/i,'SquarePen'],[/share|chia sẻ/i,'Share2'],[/call|gọi/i,'Phone'],[/copy|sao chép/i,'Copy'],[/filter|lọc/i,'SlidersHorizontal'],[/download|tải về/i,'Download'],[/check|approve|accept|duyệt|chấp nhận/i,'Check'],[/service|dịch vụ/i,'Wrench']];
        const name=rules.find(([pattern])=>pattern.test(action))?.[1]||(button.type==='submit'&&button.closest('form')?'Send':null),definition=name&&browser.lucide?.icons[name];
        if(!definition)continue;
        for(const node of [...button.childNodes])if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/^\s*[\p{Extended_Pictographic}\uFE0F\u200D＋✦✧▣▤✎⌕↻▶⏸★☆🗑]+\s*/u,'');
        const svg=browser.lucide.createElement(definition,{width:18,height:18,class:'community-action-icon','aria-hidden':'true',focusable:'false'});button.prepend(svg);button.style.display='inline-flex';button.style.alignItems='center';button.style.justifyContent='center';button.style.gap='6px';
      }
    }
    const rewrite = element => {
      for (const node of [element, ...element.querySelectorAll?.('[src],[href],[poster]') || []]) {
        for (const attribute of ['src','href','poster']) {
          const value = node.getAttribute?.(attribute);
          if (value && !/^(?:#|data:|blob:|javascript:|mailto:|tel:|sms:)/i.test(value)) node.setAttribute(attribute, new URL(value, url).href);
        }
      }
      for(const node of [element,...element.querySelectorAll?.('[style]')||[]]){const value=node.getAttribute?.('style');if(value&&value.includes('url('))node.setAttribute('style',value.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,quote,path)=>/^(?:data:|blob:|https?:|#)/.test(path)?all:'url("'+new URL(path,url).href+'")'));}
      for(const node of [element,...element.querySelectorAll?.('[onclick],[onchange],[oninput],[onsubmit]')||[]])for(const attribute of ['onclick','onchange','oninput','onsubmit']){
        const code=node.getAttribute?.(attribute);if(!code)continue;node.dataset.nativeAction=code;node.removeAttribute(attribute);node.addEventListener(attribute.slice(2),event=>{const result=scope.invoke?.(code,event,node);if(result===false){event.preventDefault();event.stopPropagation();}});
      }
    };
    rewrite(body);controls(body);
    const observer = new MutationObserver(records => { for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1){rewrite(node);controls(node);} });
    observer.observe(body, {childList:true,subtree:true});
    const doc = new Proxy(browser.document, {
      get(target, key) {
        if (key === 'body') return body;
        if (key === 'head') return head;
        if (key === 'documentElement') return html;
        if (key === 'defaultView') return facade;
        if (key === 'location') return location;
        if (key === 'URL' || key === 'baseURI') return url.href;
        if (key === 'currentScript') return currentScript;
        if (key === 'readyState') return 'complete';
        if (key === 'activeElement') return root.activeElement;
        if (key === 'getElementById') return id => root.getElementById(id);
        if (key === 'querySelector') return selector => root.querySelector(selector.replace(/(^|[\s>+~,])(body|html|head)(?=[\s.#[:>+~,]|$)/g,'$1.native-$2'));
        if (key === 'querySelectorAll') return selector => root.querySelectorAll(selector.replace(/(^|[\s>+~,])(body|html|head)(?=[\s.#[:>+~,]|$)/g,'$1.native-$2'));
        if (key === 'getElementsByClassName') return name => root.querySelectorAll('.' + CSS.escape(name));
        if (key === 'getElementsByTagName') return name => ['head','body','html'].includes(name.toLowerCase())?[{head,body,html}[name.toLowerCase()]]:root.querySelectorAll(name);
        if (key === 'addEventListener') return (type, callback, opts) => {
          if (type === 'DOMContentLoaded') { queueMicrotask(() => callback(new Event(type))); return; }
          body.addEventListener(type, callback, opts);
        };
        if (key === 'removeEventListener') return body.removeEventListener.bind(body);
        if (key === 'dispatchEvent') return body.dispatchEvent.bind(body);
        if (key === 'createTreeWalker') return (node, ...args) => target.createTreeWalker(node === doc ? body : node, ...args);
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target, key, value) { if (key === 'title') return true; return Reflect.set(target, key, value, target); }
    });
    const storage=new Proxy(browser.localStorage,{get(target,key){
      if(['setItem','removeItem','clear'].includes(key))return (...args)=>{const oldValue=key==='clear'?null:target.getItem(args[0]);target[key](...args);const event=new StorageEvent('storage',{key:key==='clear'?null:String(args[0]),oldValue,newValue:key==='setItem'?String(args[1]):null,url:browser.location.href,storageArea:target});Object.defineProperty(event,'communityRegion',{value:regionID});browser.dispatchEvent(event);};
      const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
    }});
    const windowAPI = {
      document:doc, location, parent, top:parent, self:null,
      localStorage:storage,
      history:{state:null,length:1,pushState(state, title, next){this.state=state;if(next)location.href=new URL(next,location).href;},replaceState(state,title,next){this.state=state;if(next)location.href=new URL(next,location).href;},back(){parent.postMessage({type:'nexora-community-history-back'},browser.location.origin);}},
      get innerWidth(){return host.clientWidth || browser.innerWidth;},get innerHeight(){return host.clientHeight || browser.innerHeight;},
      addEventListener(type, callback, opts) { const target = ['resize','storage','pagehide','beforeunload','nexora-community-shared-changed'].includes(type) ? browser : type==='message'||type.startsWith('nexora-')?events:body;const handler=type==='storage'?event=>{if(event.communityRegion!==regionID)callback(event);}:callback;target.addEventListener(type,handler,opts);listeners.push([target,type,handler,opts,callback]); },
      removeEventListener(type, callback, opts) { for(const [target,name,handler,options,original] of listeners)if(name===type&&(original===callback||handler===callback))target.removeEventListener(name,handler,options); },
      dispatchEvent(event){return events.dispatchEvent(event);},
      receiveMessage(data,source=parent){const event=new Event('message');Object.defineProperties(event,{data:{value:data},source:{value:source},origin:{value:browser.location.origin}});events.dispatchEvent(event);},
      postMessage(data){windowAPI.receiveMessage(data,parent);},
      scrollTo(...args){body.scrollTo(...args);},
      setInterval(fn, delay, ...args){const id=browser.setInterval(fn,delay,...args);timers.add(id);return id;},
      setTimeout(fn, delay, ...args){const id=browser.setTimeout(fn,delay,...args);timers.add(id);return id;},
      NEXORA_NATIVE:browser.NEXORA_NATIVE,
      NEXORA_COMMUNITY_SHARED:browser.NEXORA_COMMUNITY_SHARED
    };
    facade = new Proxy(variables, {
      has(target,key){return key !== '__scope' && key !== Symbol.unscopables && (key in windowAPI || key in target || key in browser);},
      get(target,key){if(key===Symbol.unscopables)return undefined;if(['window','self','globalThis'].includes(key))return facade;if(key in windowAPI)return windowAPI[key];if(key in target)return target[key];const value=browser[key];return ['fetch','atob','btoa','queueMicrotask','structuredClone','clearTimeout','clearInterval','matchMedia','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','open','alert','confirm','prompt'].includes(key)?value.bind(browser):value;},
      set(target,key,value){if(key in windowAPI)windowAPI[key]=value;else target[key]=value;return true;}
    });
    const program = sources.map(script => '__scope.setScript(' + JSON.stringify(script.url) + ');\n' + script.code + '\n;' + (/\/qrcode\.min\.js(?:\?|$)/.test(script.url)?'window.QRCode=QRCode;':'')).join('\n');
    const api = {document:doc,window:facade,root,url,send(data){facade.postMessage(data);},destroy(){observer.disconnect();for(const [target,type,fn,opts] of listeners)target.removeEventListener(type,fn,opts);for(const id of timers){browser.clearTimeout(id);browser.clearInterval(id);}host.replaceChildren();}};
    host.communityModule = api;
    try { new Function('window','document','location','parent','__scope','with(window){\n' + program + '\n__scope.invoke=(code,event,element)=>eval("(function(event){"+code+"\\n}).call(element,event)");\n}').call(facade,facade,doc,location,parent,scope); }
    catch(error){host.communityModule=null;api.destroy();throw error;}
    return api;
  }
  browser.NEXORA_NATIVE = {mount,read,css};
})();
