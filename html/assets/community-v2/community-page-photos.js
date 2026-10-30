/* Page photo gallery; uploads keep their existing hydrated blob URLs. */
(() => {
  'use strict';
  const swal=window.Swal;
  if(!swal)return;
  let active=null;
  const labels=()=>localStorage.getItem('nexora-community-language')==='vi'
    ?{back:'Quay lại',next:'Tiếp theo',close:'Đóng'}
    :{back:'Back',next:'Next',close:'Close'};
  function notifyHost(){
    if(window.parent!==window)window.parent.postMessage({type:'nexora-modal-state',open:Boolean(active||document.getElementById('modalRoot')?.firstElementChild)},location.protocol==='file:'?'*':location.origin);
  }
  function move(direction){
    if(!active?.popup)return;
    active.index=(active.index+direction+active.photos.length)%active.photos.length;
    const photo=active.photos[active.index];
    active.image.src=photo.src;active.image.alt=photo.alt;
    active.count.textContent=(active.index+1)+' / '+active.photos.length;
  }
  function open(trigger){
    if(active)return;
    const grid=trigger.closest('.page-photo-grid');
    const thumbnails=[...grid.querySelectorAll('.page-photo-trigger img')].filter(image=>image.getAttribute('src'));
    const index=thumbnails.indexOf(trigger.querySelector('img'));
    if(index<0)return;
    const copy=labels(),content=document.createElement('div'),stage=document.createElement('div'),image=document.createElement('img'),count=document.createElement('div');
    content.className='page-photo-viewer-layout';stage.className='page-photo-viewer-stage';image.className='page-photo-viewer-image';image.draggable=false;
    count.className='page-photo-viewer-count';count.setAttribute('aria-live','polite');count.setAttribute('aria-atomic','true');
    stage.append(image);
    for(const [direction,label,path] of [[-1,copy.back,'m15 18-6-6 6-6'],[1,copy.next,'m9 18 6-6-6-6']]){
      const button=document.createElement('button');button.type='button';button.className='page-photo-viewer-nav '+(direction<0?'is-previous':'is-next');button.setAttribute('aria-label',label);button.hidden=thumbnails.length<2;
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'"/></svg>';
      button.addEventListener('click',()=>move(direction));stage.append(button);
    }
    let touch=null;
    stage.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    stage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
    stage.addEventListener('touchend',event=>{
      const start=touch,end=event.changedTouches[0];touch=null;if(!start||!end)return;
      const dx=end.clientX-start.x,dy=end.clientY-start.y;
      if(Math.abs(dx)>=44&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);
    },{passive:true});
    content.append(stage,count);
    const state={trigger,index,photos:thumbnails.map(photo=>({src:photo.src,alt:photo.alt})),image,count,popup:null};
    active=state;trigger.focus({preventScroll:true});
    swal.fire({
      titleText:trigger.closest('[data-page-detail-id]')?.querySelector('#pageDetailTitle')?.textContent||'',
      html:content,showConfirmButton:false,showCloseButton:true,closeButtonAriaLabel:copy.close,
      width:'min(960px, calc(100vw - 24px))',padding:0,background:'#111827',color:'#fff',backdrop:'rgba(9,15,30,.9)',
      heightAuto:false,returnFocus:false,keydownListenerCapture:true,
      customClass:{container:'page-photo-viewer-container',popup:'page-photo-viewer',htmlContainer:'page-photo-viewer-content',title:'page-photo-viewer-title',closeButton:'page-photo-viewer-close'},
      didOpen:popup=>{state.popup=popup;move(0);notifyHost();},
      didDestroy:()=>{if(active===state)active=null;notifyHost();if(trigger.isConnected)trigger.focus({preventScroll:true});}
    });
  }
  document.addEventListener('click',event=>{
    const trigger=event.target.closest('.page-photo-grid .page-photo-trigger');
    if(trigger){event.preventDefault();open(trigger);}
  });
  // Capture before SweetAlert's handler and the prototype's legacy Escape handler.
  window.addEventListener('keydown',event=>{
    if(!active?.popup||event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight','Escape'].includes(event.key))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.key==='Escape')swal.close();else move(event.key==='ArrowLeft'?-1:1);
  },true);
  window.addEventListener('message',event=>{
    if(!active||event.source!==window.parent||(location.protocol!=='file:'&&event.origin!==location.origin))return;
    if(event.data?.type==='nexora-close-modal'||event.data?.type==='nexora-open-view')swal.close();
  });
})();
