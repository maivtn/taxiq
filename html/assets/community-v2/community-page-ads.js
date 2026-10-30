/* Page advertising shares the POS Promotion Ads Credit source and launch rules. */
(() => {
  'use strict';
  const CREDIT_KEY='nexora:ads-credit:v1';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
  const iso=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const COPY={"en": {"adsCreditBalance": "Available Ads Credit", "addAdsCredit": "Add Ads Credit", "adsCreditEmpty": "Out of credit", "adsCreditInsufficient": "Insufficient credit", "adsCreditLow": "Low credit", "startDateLabel": "Start date", "endDateLabel": "End date", "errorEndDateBeforeStart": "The end date must be on or after the start date.", "saveDraft": "Save draft", "activate": "Enable promotion", "statusDraft": "Draft", "statusPendingReview": "Pending review", "statusRunning": "Running", "statusPaused": "Paused", "tierPaidHint": "No spend until the owner sets a budget and approves."}, "vi": {"adsCreditBalance": "Ads Credit khả dụng", "addAdsCredit": "Nạp credit", "adsCreditEmpty": "Hết credit", "adsCreditInsufficient": "Không đủ credit", "adsCreditLow": "Sắp hết credit", "startDateLabel": "Ngày bắt đầu", "endDateLabel": "Ngày kết thúc", "errorEndDateBeforeStart": "Ngày kết thúc phải từ ngày bắt đầu trở đi.", "saveDraft": "Lưu nháp", "activate": "Bật chương trình", "statusDraft": "Nháp", "statusPendingReview": "Chờ duyệt", "statusRunning": "Đang chạy", "statusPaused": "Tạm dừng", "tierPaidHint": "Không tốn tiền cho tới khi owner đặt ngân sách và duyệt."}};
  let currentForm=null;
  function readCredit(){
    // The same initial wallet and availability calculation as POS Promotions.
    let balanceCents=35000,holdCents=3000;
    try{const saved=JSON.parse(localStorage.getItem(CREDIT_KEY));if(Number.isFinite(saved?.balanceCents)&&Number.isFinite(saved?.holdCents)&&saved.balanceCents>=0&&saved.holdCents>=0){balanceCents=saved.balanceCents;holdCents=saved.holdCents;}}catch{}
    return {balanceCents,holdCents,availableCents:Math.max(0,Math.floor(balanceCents-holdCents))};
  }
  function open(page,promotion,onSave){
    const vi=localStorage.getItem('nexora-community-language')==='vi',t=COPY[vi?'vi':'en'];
    const root=document.getElementById('modalRoot');if(!root)return;
    const now=new Date(),end=new Date(now);end.setDate(end.getDate()+7);
    const initial=promotion||{},placements=initial.placements||['feed','pages'];
    const state={draft:t.statusDraft,pending:t.statusPendingReview,running:t.statusRunning,paused:t.statusPaused}[initial.status];
    root.innerHTML=`<div class="overlay" id="overlay"><section class="dialog page-ads-dialog" role="dialog" aria-modal="true" aria-labelledby="promotionTitle"><div class="dialog-head"><div><h2 id="promotionTitle">${vi?'Quảng bá Fanpage':'Promote Page'}</h2><p data-community-authored>${esc(page.title)}</p>${state?`<span class="kind want">${esc(state)}</span>`:''}</div><button type="button" class="icon-btn" id="closeModal" aria-label="${vi?'Đóng':'Close'}">×</button></div><form id="pagePromotionForm"><div class="dialog-body"><div class="page-ads-credit"><img src="../icon-oneqr/issue-2040-oneqr-wallet-3d.png" width="40" height="40" alt=""><div><span>${esc(t.adsCreditBalance)}</span><strong id="pageAdsAvailable"></strong><small id="pageAdsCreditStatus" role="status" hidden></small></div><a class="btn small soft" href="../../pages/nexora-packages.html?tab=ads-credit" target="_blank" rel="noopener">${esc(t.addAdsCredit)}</a></div><p class="tip">${esc(t.tierPaidHint)}</p><div class="form-grid"><div class="form-group wide"><label>${vi?'Vị trí':'Placement'}</label><div class="page-ads-placements">${[['feed',vi?'Bảng tin':'Feed'],['pages',vi?'Fanpage':'Pages']].map(([id,label])=>`<label><input type="checkbox" name="placement" value="${id}" ${placements.includes(id)?'checked':''}>${label}</label>`).join('')}</div></div><div class="form-group"><label for="pageAdsArea">${vi?'Khu vực':'Target area'}</label><input id="pageAdsArea" class="field" value="${esc(page.city)}" readonly></div><div class="form-group"><label for="pageAdsBudget">${vi?'Ngân sách (chỉ Paid)':'Total campaign budget (USD)'}</label><input id="pageAdsBudget" name="budget" class="field" type="number" min="0.01" step="0.01" required value="${esc(initial.budget??100)}"></div><div class="form-group"><label for="pageAdsStart">${esc(t.startDateLabel)}</label><input id="pageAdsStart" name="start" class="field" type="date" required value="${esc(initial.startsOn||iso(now))}"></div><div class="form-group"><label for="pageAdsEnd">${esc(t.endDateLabel)}</label><input id="pageAdsEnd" name="end" class="field" type="date" required value="${esc(initial.endsOn||iso(end))}"></div></div><p class="page-ads-note">${vi?'Đẩy trả phí cần chủ tiệm duyệt trước khi phát sinh chi phí quảng cáo.':'Saving is free. Ads Credit is charged only after approval, when your paid campaign starts running.'}</p><p id="pageAdsError" class="page-post-error" role="alert"></p></div><div class="dialog-footer"><button type="submit" class="btn" value="draft">${esc(t.saveDraft)}</button><button type="submit" class="btn primary" value="activate">${esc(t.activate)}</button></div></form></section></div>`;
    const form=root.querySelector('#pagePromotionForm'),budget=form.elements.budget,error=form.querySelector('#pageAdsError');
    function updateCredit(){
      const {availableCents}=readCredit(),requested=Math.round(Number(budget.value)*100);
      const warning=availableCents===0?t.adsCreditEmpty:requested>availableCents?t.adsCreditInsufficient:availableCents<=3000?t.adsCreditLow:'';
      form.querySelector('#pageAdsAvailable').textContent=money(availableCents);
      const status=form.querySelector('#pageAdsCreditStatus');status.hidden=!warning;status.textContent=warning;
      form.querySelector('.page-ads-credit').classList.toggle('is-warning',Boolean(warning));
    }
    currentForm={form,updateCredit};updateCredit();
    form.addEventListener('input',()=>{error.textContent='';updateCredit();});
    form.addEventListener('submit',event=>{
      event.preventDefault();error.textContent='';if(!form.reportValidity())return;
      const data=new FormData(form),selected=data.getAll('placement'),amount=Number(data.get('budget')),budgetCents=Math.round(amount*100),startsOn=String(data.get('start')),endsOn=String(data.get('end'));
      if(!selected.length){error.textContent=vi?'Paid Boost cần bật ít nhất một kênh Public trước.':'Choose at least one ad placement.';form.querySelector('[name="placement"]').focus();return;}
      if(endsOn<startsOn){error.textContent=t.errorEndDateBeforeStart;form.elements.end.focus();return;}
      const activate=event.submitter?.value==='activate';
      if(activate&&budgetCents>readCredit().availableCents){error.textContent=t.adsCreditInsufficient;budget.focus();return;}
      const record={status:activate?'pending':'draft',fundingSource:'ads-credit',paidEnabled:true,budget:amount,budgetCents,startsOn,endsOn,placements:selected,area:page.city};
      if(onSave(record)===false)error.textContent=vi?'Không lưu được. Bộ nhớ trình duyệt không khả dụng hoặc đã đầy. Nội dung đang sửa vẫn được giữ nguyên.':'Could not save. Browser storage is unavailable or full. Your changes are still here.';
    });
  }
  window.addEventListener('storage',event=>{if((event.key===CREDIT_KEY||event.key===null)&&currentForm?.form.isConnected)currentForm.updateCredit();});
  window.NEXORA_COMMUNITY_PAGE_ADS={open,readCredit};
})();
