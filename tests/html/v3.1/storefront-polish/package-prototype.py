"""Package the current personal storefront without changing the original PO files."""
from pathlib import Path
import base64
import mimetypes
import re

ROOT = Path(__file__).resolve().parents[4]
MODULE = ROOT / 'html/v3.1/community/modules/hub-tools'
COMMUNITY = ROOT / 'html/v3.1/community'
OUTPUT = ROOT / 'docs/prototypes/my-storefront/my-storefront-polished-v1.html'


def data_url(path):
    mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()


def inline_css(source, base):
    def replace(match):
        value = match.group(2)
        if value.startswith(('data:', 'http:', 'https:', '#', 'blob:')):
            return match.group(0)
        asset = (base / value.split('?')[0]).resolve()
        return 'url("' + data_url(asset) + '")' if asset.is_file() else match.group(0)
    return re.sub(r'url\(([\'\"]?)([^)\'\"\s]+)\1\)', replace, source)


source = (MODULE / 'index.html').read_text()


def stylesheet(match):
    file = (MODULE / match.group(1).split('?')[0]).resolve()
    return '<style>' + inline_css(file.read_text(), file.parent) + '</style>'


source = re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/?>', stylesheet, source)


def script(match):
    file = (MODULE / match.group(1).split('?')[0]).resolve()
    text = file.read_text()
    text = re.sub(r'document\.currentScript\.src(?!\s*\|\|)', '(document.currentScript.src||document.baseURI)', text)
    if file.name == 'community-storefront-polish.js':
        for asset in (ROOT / 'html/v3.1/icon-oneqr').glob('*.png'):
            if asset.name in text:
                text = text.replace("'" + asset.name + "'", "'" + data_url(asset) + "'")
    return '<script>' + text.replace('</script', '<\\/script') + '</script>'


source = re.sub(r'<script src="([^"]+)"\s*></script>', script, source)
for asset in (MODULE / 'media').iterdir():
    if asset.is_file() and 'media/' + asset.name in source:
        embedded = data_url(asset)
        source = source.replace('/html/v3.1/community/modules/hub-tools/media/' + asset.name, embedded)
        source = source.replace('media/' + asset.name, embedded)

# Match the real staff route and make cross-module destinations work from file://.
bootstrap = """<script>
window.NEXORA_SHELL={activePage:'staff',salonLinked:false};
window.addEventListener('message',event=>{
  if(event.source!==window||event.data?.type!=='nexora-community-route')return;
  const target=new URL('https://taxiq-nexora-touch.vercel.app/html/v3.1/staff-community.html');
  target.searchParams.set('tab',event.data.route);target.searchParams.set('account','personal');target.searchParams.set('role','tech');
  for(const [key,value] of Object.entries(event.data.context||{}))if(value!=null)target.searchParams.set(key,value);
  location.assign(target.href);
});
</script>"""
source = source.replace('<head>', '<head>' + bootstrap + '<script>' + (COMMUNITY / 'community-shared.js').read_text() + '</script>', 1)
source = source.replace(":'home',workMode='all'", ":'shop',workMode='all'", 1)
source = source.replace(',location.origin)', ",location.protocol==='file:'?'*':location.origin)")
theme = (COMMUNITY / 'community-po-theme.css').read_text().replace('.native-body', 'body').replace('.native-html', 'html').replace(':host', ':root')
source = source.replace('</head>', '<style>' + inline_css(theme, COMMUNITY) + '</style></head>', 1)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(source)
print(str(OUTPUT), OUTPUT.stat().st_size, 'bytes')
