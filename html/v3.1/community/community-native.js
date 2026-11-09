/* Initialize the copied Community markup in the current document. */
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
    const urls=[];
    const scoped=text.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (all, quote, value) => {
      urls.push(/^(?:data:|https?:|#)/.test(value)?all:'url("'+new URL(value,base).href+'")');
      return '__NEXORA_NATIVE_URL_'+(urls.length-1)+'__';
    });
    return scoped.replace(/:root\b/g, ':host')
      .replace(/(?<![\w.-])html(?![\w-])/g, '.native-html')
      .replace(/(?<![\w.-])body(?![\w-])/g, '.native-body')
      .replace(/@media\s*\(\s*(max|min)-width\s*:\s*(\d+)px\s*\)/g, '@container module ($1-width: $2px)')
      .replace(/__NEXORA_NATIVE_URL_(\d+)__/g, (all,index)=>urls[Number(index)]);
  }
  function regionRoot(host) {
    if(!host.dataset.communityRegion)host.dataset.communityRegion='region-'+crypto.randomUUID();
    const selector='[data-community-region="'+host.dataset.communityRegion+'"]';
    const owns=node=>node===host||node.closest('[data-community-region]')===host||node.parentElement?.closest('[data-community-region]')===host;
    const scopeStyle=node=>{if(node.tagName==='STYLE'&&!node.dataset.communityScoped){node.textContent='@scope ('+selector+') to (:scope [data-community-region] > *) {\n'+node.textContent.replace(/:host\b/g,':scope')+'\n}';node.dataset.communityScoped='';}};
    return {host,owns,scopeStyle,
      get activeElement(){return host.contains(browser.document.activeElement)?browser.document.activeElement:null;},
      querySelectorAll:selector=>[...host.querySelectorAll(selector)].filter(owns),
      querySelector(selector){return this.querySelectorAll(selector)[0]||null;},
      getElementById(id){return this.querySelector('#'+CSS.escape(id));},
      append(...nodes){nodes.forEach(scopeStyle);host.append(...nodes);},
      replaceChildren(...nodes){nodes.forEach(scopeStyle);host.replaceChildren(...nodes);},
      addEventListener:(...args)=>host.addEventListener(...args)
    };
  }
  async function mount(host, source, options = {}) {
    if (host.communityModule) return host.communityModule;
    const url = new URL(source, browser.location.href);
    const definition=browser.NEXORA_COMMUNITY_CODE?.[url.pathname];
    if(!definition)throw new Error('Missing copied Community code: '+url.pathname);
    const styles=definition.styles.map(item=>css(item.text,new URL(item.url,url)));
    // Apply the retained Community visual language after the PO's component styles.
    if (options.stylesheet) {
      const themeURL = new URL(options.stylesheet, url);
      styles.push(css(await read(themeURL.href), themeURL));
    }
    const sources=definition.scripts.map(item=>({url:new URL(item.url,url).href,code:item.code}));
    const root=regionRoot(host);
    let html=host.querySelector(':scope > .native-html');
    if(!html){
      html=browser.document.createElement('div');html.className='native-html';
      const head=browser.document.createElement('div'),body=browser.document.createElement('div');head.className='native-head';body.className='native-body';
      const template=browser.document.querySelector('template[data-community-template="'+url.pathname+'"]');
      if(!template)throw new Error('Missing copied Community markup: '+url.pathname);
      body.append(template.content.cloneNode(true));html.append(head,body);host.append(html);
    }
    const head=html.querySelector(':scope > .native-head'),body=html.querySelector(':scope > .native-body');
    html.lang=definition.lang;body.className='native-body '+(definition.attributes.class||'');
    for(const [name,value]of Object.entries(definition.attributes))if(name!=='class')body.setAttribute(name,value);
    const style = document.createElement('style');
    style.textContent = styles.join('\n') + '\n:host{display:block;min-width:0;height:100%;overflow:hidden;overscroll-behavior:contain;container:module / inline-size;contain:layout style;isolation:isolate}[hidden]{display:none!important}.native-head{display:none}.native-html,.native-body{min-height:100%;margin:0;box-sizing:border-box}.native-html{height:100%}.native-body{height:100%;overflow-x:clip;overflow-y:auto}*,*::before,*::after{box-sizing:border-box}img,video{max-width:100%}dialog{max-width:calc(100% - 24px)}@container module (max-width:600px){input,select,textarea{font-size:16px!important}}';
    root.append(style);
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
        const label=button.textContent.trim();
        const action=Object.values(button.dataset).join(' ')+' '+(button.getAttribute('aria-label')||'')+' '+label;
        const rules=[[/spin|quay/i,'RotateCw'],[/close|cancel|đóng|hủy|×|✕/i,'X'],[/mic|micro|voice|giọng/i,'Mic'],[/video|reel/i,'Video'],[/photo|image|ảnh|camera/i,'Camera'],[/delete|remove|xóa|xoá/i,'Trash2'],[/save|lưu/i,'Save'],[/search|find|tìm/i,'Search'],[/back|prev|quay lại|trước/i,'ArrowLeft'],[/next|tiếp/i,'ArrowRight'],[/send|gửi|reply|trả lời/i,'Send'],[/create|add|new|thêm|tạo/i,'Plus'],[/edit|sửa/i,'SquarePen'],[/share|chia sẻ/i,'Share2'],[/call|gọi/i,'Phone'],[/copy|sao chép/i,'Copy'],[/filter|lọc/i,'SlidersHorizontal'],[/download|tải về/i,'Download'],[/check|approve|accept|duyệt|chấp nhận/i,'Check'],[/service|dịch vụ/i,'Wrench']];
        const glyphIcon=/^[×✕]$/.test(label)?'X':label.startsWith('←')?'ArrowLeft':null;
        const name=glyphIcon||rules.find(([pattern])=>pattern.test(action))?.[1]||(button.type==='submit'&&button.closest('form')?'Send':null),definition=name&&browser.lucide?.icons[name];
        if(!definition)continue;
        if(name==='X'&&/^[×✕]$/.test(label)&&!button.hasAttribute('aria-label')&&!button.hasAttribute('aria-labelledby'))button.setAttribute('aria-label','Close');
        for(const node of [...button.childNodes])if(node.nodeType===3)node.nodeValue=node.nodeValue.replace(/^\s*[\p{Extended_Pictographic}\uFE0F\u200D＋✦✧▣▤✎⌕↻▶⏸★☆🗑×✕←]+\s*/u,'');
        const svg=browser.lucide.createElement(definition,{width:18,height:18,class:'community-action-icon','aria-hidden':'true',focusable:'false'});button.prepend(svg);button.style.display='inline-flex';button.style.alignItems='center';button.style.justifyContent='center';button.style.gap='6px';
      }
    }
    const rewrite = element => {
      for (const node of [element, ...element.querySelectorAll?.('[src],[href],[poster]') || []].filter(root.owns)) {
        for (const attribute of ['src','href','poster']) {
          const value = node.getAttribute?.(attribute);
          if (value && !/^(?:#|data:|blob:|javascript:|mailto:|tel:|sms:)/i.test(value)) node.setAttribute(attribute, new URL(value, url).href);
        }
      }
      for(const node of [element,...element.querySelectorAll?.('[style]')||[]].filter(root.owns)){const value=node.getAttribute?.('style');if(value&&value.includes('url('))node.setAttribute('style',value.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,quote,path)=>/^(?:data:|blob:|https?:|#)/.test(path)?all:'url("'+new URL(path,url).href+'")'));}
      for(const node of [element,...element.querySelectorAll?.('[onclick],[onchange],[oninput],[onsubmit]')||[]].filter(root.owns))for(const attribute of ['onclick','onchange','oninput','onsubmit']){
        const code=node.getAttribute?.(attribute);if(!code)continue;node.dataset.nativeAction=code;node.removeAttribute(attribute);node.addEventListener(attribute.slice(2),event=>{const result=scope.invoke?.(code,event,node);if(result===false){event.preventDefault();event.stopPropagation();}});
      }
    };
    rewrite(body);if(options.controls!==false)controls(body);
    const observer = new MutationObserver(records => { for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1&&root.owns(node)){root.scopeStyle(node);rewrite(node);if(options.controls!==false)controls(node);} });
    observer.observe(body, {childList:true,subtree:true});
    observer.observe(head, {childList:true,subtree:true});
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
          const handler=event=>{if(root.owns(event.target))callback(event);};body.addEventListener(type,handler,opts);listeners.push([body,type,handler,opts,callback]);
        };
        if (key === 'removeEventListener') return (type,callback,opts)=>{for(const [target,name,handler,options,original]of listeners)if(target===body&&name===type&&original===callback)body.removeEventListener(name,handler,options);};
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
      get scrollY(){return body.scrollTop;},get scrollX(){return body.scrollLeft;},
      get pageYOffset(){return body.scrollTop;},get pageXOffset(){return body.scrollLeft;},
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
    const api = {document:doc,window:facade,root,url,send(data){facade.postMessage(data);},destroy(){observer.disconnect();for(const [target,type,fn,opts] of listeners)target.removeEventListener(type,fn,opts);for(const id of timers){browser.clearTimeout(id);browser.clearInterval(id);}root.replaceChildren();host.communityModule=null;}};
    host.communityModule = api;
    try { new Function('window','document','location','parent','__scope','with(window){\n' + program + '\n__scope.invoke=(code,event,element)=>eval("(function(event){"+code+"\\n}).call(element,event)");\n}').call(facade,facade,doc,location,parent,scope); }
    catch(error){host.communityModule=null;api.destroy();throw error;}
    return api;
  }
  // Keep the existing controller contract while rendering every pane in this document.
  // Messages are local events; these sections never create a browsing context.
  function bind(host, options = {}) {
    const owner=options.owner||browser;
    let task,source;
    const parent=new Proxy(owner, {get(target,key){
      if(key==='postMessage')return data=>queueMicrotask(()=>{
        const event=new Event('message');
        Object.defineProperties(event,{data:{value:data},source:{value:host.contentWindow},origin:{value:browser.location.origin}});
        owner.dispatchEvent(event);
      });
      const value=target[key];return typeof value==='function'?value.bind(target):value;
    }});
    Object.defineProperties(host,{
      contentWindow:{get:()=>host.communityModule?.window},
      contentDocument:{get:()=>host.communityModule?.document},
      src:{get:()=>source,set(value){
        if(task)return;
        source=value;host.setAttribute('aria-busy','true');
        task=mount(host,source,{parent,controls:false,navigate:options.navigate||((url)=>owner.location.assign(url))}).then(api=>{
          host.removeAttribute('aria-busy');host.dispatchEvent(new Event('load'));return api;
        }).catch(error=>{
          task=null;host.removeAttribute('aria-busy');
          const target=host;
          const message=browser.document.createElement('p');message.setAttribute('role','alert');message.textContent='Something went wrong. Please try again.';
          const retry=browser.document.createElement('button');retry.type='button';retry.textContent='Try again';retry.onclick=()=>{host.src=source;};
          target.replaceChildren(message,retry);host.dispatchEvent(new Event('error'));console.error('Community pane',source,error);
        });
      }}
    });
    return host;
  }
  browser.NEXORA_NATIVE = {mount,read,css,bind,regionRoot};
})();
