/* Nexora shared store — một nguồn dữ liệu chung cho POS, Kiosk, Staff App và Customer App.
   Lưu trong localStorage (giữ lại sau khi đóng mở), đồng bộ trực tiếp giữa các tab qua storage event.
   POS là chủ dữ liệu: seed lần đầu, hydrate khi mở lại; các app còn lại đọc/ghi qua update(). */
window.NexoraStore = (function(){
  const KEY = 'nexora-touch-salon-v1';

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw) return JSON.parse(raw);
    }catch(err){ /* dữ liệu hỏng → coi như chưa có, POS sẽ seed lại */ }
    return null;
  }

  function save(state){
    if(!state) return null;
    state.rev = (state.rev || 0) + 1;
    state.savedAt = new Date().toISOString();
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }
    catch(err){ /* storage đầy/không khả dụng → app vẫn chạy trong phiên hiện tại */ }
    return state;
  }

  /* Đọc → sửa → ghi trong một bước; trả về state sau khi ghi (null nếu chưa có dữ liệu POS) */
  function update(fn){
    const state = load();
    if(!state) return null;
    fn(state);
    return save(state);
  }

  /* Nhận thay đổi từ tab khác (storage event không bắn trong chính tab ghi) */
  function subscribe(cb){
    window.addEventListener('storage', e => {
      if(e.key !== KEY || !e.newValue) return;
      try{ cb(JSON.parse(e.newValue)); }catch(err){ /* bỏ qua payload hỏng */ }
    });
  }

  function reset(){
    try{
      localStorage.removeItem(KEY);
      return localStorage.getItem(KEY) === null;
    }catch(err){ return false; }
  }

  return { KEY, load, save, update, subscribe, reset };
})();
