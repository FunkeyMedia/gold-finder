"""Crawl rendered pages, not source templates. Run after a build against a local or live URL."""
import concurrent.futures,json,sys,urllib.request,urllib.error,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from collections import Counter
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3127'
ORIGIN='https://www.gold-finder.com'
class Page(HTMLParser):
 def __init__(self):
  super().__init__();self.canon=[];self.alts={};self.h1=0;self.lang=None;self.robots='';self.description='';self.title='';self.in_title=False;self.in_json=False;self.json=[];self.text='';self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
  if tag=='link' and a.get('rel')=='alternate' and a.get('hreflang'):self.alts[a['hreflang']]=a.get('href')
  if tag=='h1':self.h1+=1
  if tag=='main':self.lang=a.get('lang')
  if tag=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
  if tag=='meta' and a.get('name')=='description':self.description=a.get('content','')
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.text=''
  if tag=='a' and a.get('href','').startswith('/'):self.links.append(a['href'].split('#')[0].split('?')[0] or '/')
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.in_json:self.json.append(json.loads(self.text));self.in_json=False
 def handle_data(self,d):
  if self.in_title:self.title+=d
  if self.in_json:self.text+=d

def get(path):
 with urllib.request.urlopen(BASE+path,timeout=40) as r:return r.status,r.read().decode(),dict(r.headers)
xml=get('/sitemap.xml')[1];root=ET.fromstring(xml);ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','x':'http://www.w3.org/1999/xhtml'}
entries={u.find('s:loc',ns).text:u for u in root.findall('s:url',ns)}
assert len(entries)==len(root.findall('s:url',ns)),'Duplicate sitemap URLs'
errors=[];pages={}
def crawl(url):
 try:
  status,html,headers=get(url.removeprefix(ORIGIN) or '/');p=Page();p.feed(html)
  assert status==200,(url,status)
  assert p.canon==[url],(url,'canonical',p.canon)
  assert p.h1==1,(url,'h1',p.h1)
  assert 'noindex' not in p.robots and 'noindex' not in headers.get('X-Robots-Tag',''),(url,'noindex')
  assert p.title and p.description,(url,'missing metadata')
  if p.alts and '/buy-gold' not in url and '/gold-kaufen' not in url:
   assert set(p.alts)=={'en','en-US','en-GB','de-DE','fr-FR','x-default'},(url,'alternates',p.alts)
   assert p.lang in p.alts and p.alts[p.lang]==url,(url,'self hreflang',p.lang)
   sx={a.attrib['hreflang']:a.attrib['href'] for a in entries[url].findall('x:link',ns)}
   assert sx==p.alts,(url,'sitemap hreflang mismatch')
   assert p.json,(url,'missing structured data')
  return url,p,None
 except Exception as e:return url,None,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for url,p,error in pool.map(crawl,entries):
  if error:errors.append(error)
  else:pages[url]=p
for url,p in pages.items():
 for lang,alt in p.alts.items():
  if alt not in pages:errors.append(f'{url}: missing alternate {alt}')
  elif any(pages[alt].alts.get(k)!=v for k,v in p.alts.items()):errors.append(f'{url}: nonreciprocal alternate {alt}')
 for path in p.links:
  if ORIGIN+path not in entries and path!='/':errors.append(f'{url}: internal link absent from sitemap {path}')
for field in ['title','description']:
 for text,count in Counter(getattr(p,field) for p in pages.values()).items():
  # Market hubs may share their introductory description, but product metadata must be unique.
  if count>1 and not (field=='description' and 'Compare gold bars by weight' in text):errors.append(f'Duplicate {field} ({count}): {text}')
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):return None
try:
 urllib.request.build_opener(NoRedirect).open(BASE+'/de/goldbarren-10-gramm')
 errors.append('Expected permanent redirect for historical 10 g URL')
except urllib.error.HTTPError as e:
 if e.code not in [301,308] or not e.headers['Location'].endswith('/de/goldbarren/10-g'):errors.append('Wrong historical redirect')
try:get('/fr/produit/does-not-exist');errors.append('Unknown product did not return 404')
except urllib.error.HTTPError as e:
 if e.code!=404:errors.append(f'Wrong unknown-product status {e.code}')
assert 'Sitemap: '+ORIGIN+'/sitemap.xml' in get('/robots.txt')[1]
report={'base':BASE,'sitemap_urls':len(entries),'pages_checked':len(pages),'localized_pages':sum(bool(p.lang and p.alts) for p in pages.values()),'errors':sorted(set(errors))}
print(json.dumps(report,ensure_ascii=False,indent=2))
sys.exit(bool(errors))
