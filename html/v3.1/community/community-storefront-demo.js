/* Fictional storefront content for the existing salon demo account. */
(() => {
  'use strict';
  const asset='/html/v3.1/';
  const media={salon:asset+'community-staging/b01d42a22a326284.jpg',blue:asset+'community-staging/a063fabd5fc4a64e.jpg',design:asset+'community-staging/3bd5b46971b0c903.png',blush:asset+'community-staging/0ceedf379b114cef.jpg',team:asset+'nexora-welcome/industry-nail.jpg',logo:asset+'community/nexora-bitcoin-nailbar.png'};
  const profile={
    category:['Dịch vụ nail & dụng cụ tiệm','Nail services & salon supplies'],
    hours:['Thứ 2–Thứ 7, 9:00–19:00 · Chủ Nhật, 10:00–17:00','Mon–Sat, 9am–7pm · Sun, 10am–5pm'],
    about:['Gian hàng mẫu của BITCOIN NAIL BAR tại Houston: xem dịch vụ nail, dụng cụ tiệm và các bài giới thiệu. Thông tin, giá và hình ảnh dùng để trải nghiệm prototype.','Sample BITCOIN NAIL BAR storefront in Houston: explore nail services, salon supplies and store updates. Details, prices and images illustrate the prototype.']
  };
  const listings=[
    {id:'sample-store-lamp',kind:'product',price:'45',availability:'available',image:asset+'community/market-photos/gel-lamp.jpg',title:['Đèn UV/LED làm nail (mẫu)','UV/LED nail lamp (sample)'],category:['Dụng cụ nail','Nail supplies'],description:['Đèn hơ gel để bàn. Dữ liệu mẫu cho luồng xem, sửa và gỡ sản phẩm.','Tabletop gel-curing lamp. Sample listing for viewing, editing and removing a product.']},
    {id:'sample-store-chair',kind:'product',price:'100',availability:'available',image:asset+'community/market-photos/waiting-chair.jpg',title:['Ghế phòng chờ màu trắng (mẫu)','White waiting chair (sample)'],category:['Nội thất tiệm','Salon furniture'],description:['Ghế dùng cho khu tiếp khách; nhận tại tiệm ở Houston. Hình và giá là dữ liệu mẫu.','Reception seating with pickup in Houston. Photo and price are sample data.']},
    {id:'sample-store-trolley',kind:'product',price:'65',availability:'preorder',image:asset+'community/market-photos/salon-trolley.jpg',title:['Xe đẩy dụng cụ nail (mẫu)','Salon tool trolley (sample)'],category:['Dụng cụ nail','Nail supplies'],description:['Xe đẩy nhiều ngăn để sắp xếp dụng cụ. Mục mẫu ở trạng thái đặt trước.','Multi-tier trolley for organizing tools. Sample listing with preorder availability.']},
    {id:'sample-store-manicure',kind:'service',price:'35',availability:'available',image:media.blush,title:['Sơn gel manicure (mẫu)','Gel manicure (sample)'],category:['Dịch vụ nail','Nail services'],description:['Dịch vụ mẫu gồm sửa dáng móng, chăm sóc da và sơn gel một màu. Trao đổi với tiệm về thời gian phù hợp.','Sample service including nail shaping, cuticle care and a single gel color. Contact the salon to discuss availability.']},
    {id:'sample-store-pedicure',kind:'service',price:'45',availability:'available',image:media.salon,title:['Chăm sóc chân cơ bản (mẫu)','Classic pedicure (sample)'],category:['Dịch vụ nail','Nail services'],description:['Dịch vụ chăm sóc chân và sơn màu minh họa. Giá hiển thị chỉ phục vụ xem prototype.','Illustrative foot-care and polish service. The displayed price is for previewing the prototype.']},
    {id:'sample-store-gelx',kind:'service',price:'65',availability:'available',image:media.blue,title:['Nối móng Gel-X (mẫu)','Gel-X extensions (sample)'],category:['Dịch vụ nail','Nail services'],description:['Mẫu dịch vụ nối móng Gel-X; kiểu dáng và thiết kế được trao đổi trước khi làm.','Sample Gel-X extension service; discuss shape and design before the appointment.']},
    {id:'sample-store-team',kind:'post',price:'',availability:'available',image:media.team,title:['Gặp gỡ đội ngũ của tiệm (mẫu)','Meet the salon team (sample)'],category:['Giới thiệu tiệm','Salon introduction'],description:['Bài giới thiệu mẫu về không gian, đội ngũ và các dịch vụ của tiệm tại Houston.','Sample introduction to the salon space, team and services in Houston.']}
  ];
  const posts=[
    {id:'sample-store-update',kind:'post',title:['Thông tin lịch làm cuối tuần (mẫu)','Weekend appointment update (sample)'],body:['Khách có thể nhắn tin cho tiệm để trao đổi dịch vụ và thời gian phù hợp. Đây là bài giới thiệu mẫu của gian hàng.','Message the salon to discuss a service and a suitable time. This is a sample storefront update.'],image:media.salon},
    {id:'sample-store-design',kind:'photos',title:['Bộ móng xanh trong tuần (mẫu)','This week’s blue nail design (sample)'],body:['Một mẫu móng xanh được dùng để minh họa bài đăng từ gian hàng lên Bảng tin Community.','A blue nail design illustrating a storefront post shared to the Community Feed.'],image:media.design}
  ];
  const text=(values,language)=>values[language==='vi'?0:1];
  function translateFields(target,source,language){
    for(const [key,values]of Object.entries(source))if(Array.isArray(values)&&values.includes(target[key]))target[key]=text(values,language);
  }
  function localize(state,language=state.lang){
    if(state.storefrontDemoSeeded!==1)return;
    translateFields(state.shop,profile,language);
    for(const template of listings){const row=state.shop.items.find(item=>item.id===template.id);if(row)translateFields(row,template,language);}
    for(const template of posts){const row=state.feedPosts.find(post=>post.id===template.id);if(row)translateFields(row,template,language);}
  }
  function seed(state,shared){
    if(shared?.role!=='owner'||shared.member!=='BITCOIN NAIL BAR')return false;
    if(state.storefrontDemoSeeded===1){
      const post=state.feedPosts.find(row=>row.id==='sample-store-design'&&row.shopOrigin&&row.author===shared.member);
      if(!post||post.image!==media.blue||post.images?.some(image=>image!==media.blue))return false;
      post.image=media.design;
      if(post.images?.length)post.images=[media.design];
      return true;
    }
    const shop=state.shop;
    const customized=Object.entries(shop).some(([key,value])=>{
      if(key==='type')return value&&value!=='personal';
      if(key==='city')return value&&value!=='Houston, TX';
      return Array.isArray(value)?value.length>0:!!value;
    });
    state.storefrontDemoSeeded=1;
    if(customized)return true;
    const language=state.lang;
    Object.assign(shop,{name:'BITCOIN NAIL BAR',type:'salon',city:'Houston, TX',phone:'713-555-0142',email:'storefront@example.com',logo:media.logo,cover:media.salon,fulfillment:['pickup'],fanpageId:state.fanpages.find(page=>page.bridgeOwner===shared.member)?.id||'',...Object.fromEntries(Object.entries(profile).map(([key,values])=>[key,text(values,language)])),items:listings.map(template=>Object.fromEntries(Object.entries(template).map(([key,value])=>[key,Array.isArray(value)?text(value,language):value])))});
    const date=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    for(const template of posts)if(!state.feedPosts.some(post=>post.id===template.id))state.feedPosts.push({...template,title:text(template.title,language),body:text(template.body,language),author:shared.member,initials:'BN',area:shop.city,date,shopOrigin:true,visibility:'public',demo:false});
    return true;
  }
  window.NEXORA_STOREFRONT_DEMO={seed,localize};
})();
