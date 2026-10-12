import json,unicodedata,geonamescache,collections
gc=geonamescache.GeonamesCache();G=gc.get_cities();CTRY=gc.get_countries();D=json.load(open('csc_all.json'))
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn').lower().replace('-',' ').replace("'",'').strip()
def flag(cc):return ''.join(chr(0x1F1E6+ord(ch)-65) for ch in cc)
# tên tiếng Việt cho các nước hay gặp; còn lại dùng tên tiếng Anh của GeoNames
VI={'US':'Mỹ','VN':'Việt Nam','CA':'Canada','AU':'Úc','NZ':'New Zealand','GB':'Anh','FR':'Pháp','DE':'Đức','IT':'Ý','ES':'Tây Ban Nha','PT':'Bồ Đào Nha','NL':'Hà Lan','BE':'Bỉ','CH':'Thuỵ Sĩ','AT':'Áo','SE':'Thuỵ Điển','NO':'Na Uy','DK':'Đan Mạch','FI':'Phần Lan','PL':'Ba Lan','CZ':'Séc','SK':'Slovakia','HU':'Hungary','RO':'Romania','BG':'Bulgaria','GR':'Hy Lạp','RU':'Nga','UA':'Ukraine','IE':'Ireland','TR':'Thổ Nhĩ Kỳ',
'JP':'Nhật Bản','KR':'Hàn Quốc','CN':'Trung Quốc','TW':'Đài Loan','HK':'Hồng Kông','MO':'Ma Cao','IN':'Ấn Độ','TH':'Thái Lan','MY':'Malaysia','SG':'Singapore','ID':'Indonesia','PH':'Philippines','KH':'Campuchia','LA':'Lào','MM':'Myanmar','BN':'Brunei','TL':'Đông Timor','MN':'Mông Cổ','NP':'Nepal','LK':'Sri Lanka','BD':'Bangladesh','PK':'Pakistan',
'AE':'UAE (Dubai)','SA':'Ả Rập Xê Út','QA':'Qatar','KW':'Kuwait','BH':'Bahrain','OM':'Oman','IL':'Israel','JO':'Jordan','LB':'Liban','IQ':'Iraq','IR':'Iran','EG':'Ai Cập','YE':'Yemen','SY':'Syria',
'BR':'Brazil','AR':'Argentina','CO':'Colombia','CL':'Chile','PE':'Peru','VE':'Venezuela','EC':'Ecuador','BO':'Bolivia','UY':'Uruguay','PY':'Paraguay','MX':'Mexico','CU':'Cuba','DO':'Dominica (CH)','CR':'Costa Rica','PA':'Panama','GT':'Guatemala',
'ZA':'Nam Phi','NG':'Nigeria','KE':'Kenya','MA':'Ma-rốc','DZ':'Algeria','TN':'Tunisia','ET':'Ethiopia','GH':'Ghana','TZ':'Tanzania','SN':'Senegal','CI':'Bờ Biển Ngà','CM':'Cameroon','AO':'Angola','MZ':'Mozambique','MG':'Madagascar'}
SEA=['TH','MY','SG','ID','PH','KH','LA','MM','BN','TL'];ME=['AE','SA','QA','KW','BH','OM','TR','EG','IL','JO','LB','IQ','IR','YE','SY']
GROUPS=[('Chính','Main',['US','VN']),('Đông Nam Á','Southeast Asia',SEA),('Đông Á & Nam Á','East & South Asia','AS'),('Trung Đông','Middle East',ME),('Châu Âu','Europe','EU'),('Bắc & Trung Mỹ · Caribbean','North & Central America','NA'),('Nam Mỹ','South America','SA'),('Châu Đại Dương','Oceania','OC'),('Châu Phi','Africa','AF')]
out={};stats=[]
for cc,ci in CTRY.items():
    if cc not in D or not D[cc]['states']:continue
    gcs=sorted([c for c in G.values() if c['countrycode']==cc],key=lambda c:-c['population'])
    if not gcs:continue
    cn=flag(cc)+' '+VI.get(cc,ci['name'])
    d=D[cc];sn={s['code']:s['name'] for s in d['states']};allc=[x for x in d['cities'] if x['s'] in sn]
    idx=collections.defaultdict(list)
    for x in allc:idx[norm(x['n'])].append(x)
    if cc=='SG':
        out[cc]={'n':cn,'s':{'SG':{'n':'Singapore','c':{'Singapore':[c['name'] for c in gcs if c['name']!='Singapore']}}}};continue
    st={};m=0
    for c in gcs:
        cand=idx.get(norm(c['name'])) or [];best=None
        if cand:
            b=min(cand,key=lambda x:(x['lat']-c['latitude'])**2+(x['lng']-c['longitude'])**2)
            if (b['lat']-c['latitude'])**2+(b['lng']-c['longitude'])**2<=1.0:best=b
        if not best and allc:
            b=min(allc,key=lambda x:(x['lat']-c['latitude'])**2+(x['lng']-c['longitude'])**2)
            if (b['lat']-c['latitude'])**2+(b['lng']-c['longitude'])**2<=0.25:best=b
        if not best:continue
        sc=best['s'];st.setdefault(sc,{'n':sn[sc],'c':{}})
        if c['name'] not in st[sc]['c']:st[sc]['c'][c['name']]=[];m+=1
    if not st:continue
    st=dict(sorted(st.items(),key=lambda kv:kv[1]['n']))
    out[cc]={'n':cn,'s':st,'k':ci['continentcode']};stats.append((cc,len(gcs),m))
# nhóm quốc gia
used=set(['US','VN']+SEA+ME);groups=[]
for vi,en,ks in GROUPS:
    if isinstance(ks,list):lst=[k for k in ks if k in out or k in('US','VN')]
    else:lst=sorted([k for k,v in out.items() if v.get('k')==ks and k not in used],key=lambda k:norm(out[k]['n'][3:]))
    used.update(lst);groups.append([vi,en,lst])
for v in out.values():v.pop('k',None)
out.pop('US',None);out.pop('VN',None)
low=[s for s in stats if s[2]<s[1]*0.8];print('countries',len(out),'cities',sum(s[2] for s in stats),'low-match',low[:15])
# thành phố lớn toàn cầu (ưu tiên khi tên trùng): top 2500 theo dân số, kể cả US/VN
big={}
for c in sorted(G.values(),key=lambda c:-c['population'])[:2500]:
    n=norm(c['name']);cc=c['countrycode']
    if n in big:continue
    src=out.get(cc)
    if cc=='US':big[n]={'c':cc,'s':c['admin1code'],'city':c['name']};continue
    if cc=='VN' or not src:big[n]={'c':cc,'city':c['name']};continue
    for sk,st in src['s'].items():
        if c['name'] in st['c']:big[n]={'c':cc,'s':sk,'city':c['name']};break
js='const GEO_BIG='+json.dumps(big,ensure_ascii=False,separators=(',',':'))+';\nconst GEO_WORLD='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\nconst GEO_GROUPS='+json.dumps(groups,ensure_ascii=False)+';'
open('geo_world.js','w',encoding='utf-8').write(js);print('bytes',len(js.encode()))
