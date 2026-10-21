"""Build Spanish auto/home intakes from the existing English field and receipt contracts.

Run with Python + beautifulsoup4. Translations live in spanish-quote-copy.txt.
Generated pages keep names/enum values/endpoints, and load their own localized helpers.
This script writes only the two Spanish intake pages and localized helper assets.
"""
from pathlib import Path
import importlib.util
import json
import re
from bs4 import BeautifulSoup, Comment, NavigableString

ROOT = Path(__file__).resolve().parents[1]
COPY = dict(line.split('|', 1) for line in (ROOT/'tools/spanish-quote-copy.txt').read_text(encoding='utf-8').splitlines() if '|' in line)
for n in ['1,000 – 1,500','1,500 – 2,000','2,000 – 2,500','2,500 – 3,000','3,000 – 4,000']:
    COPY[n+' sq ft'] = n+' pies cuadrados'
spec = importlib.util.spec_from_file_location('menu', ROOT/'tools/build-universal-menu.py')
menu = importlib.util.module_from_spec(spec); spec.loader.exec_module(menu)
cfg = json.loads((ROOT/'tools/nav.json').read_text(encoding='utf-8'))

def tr(text):
    stripped = text.strip()
    return text.replace(stripped, COPY[stripped]) if stripped in COPY else text

def translate_js(src):
    # Only exact string literals and text within HTML templates are translated;
    # form identifiers, backend enums, query names and receipt validation stay intact.
    def literal(m):
        raw = m.group(0); q = raw[0]
        val = raw[1:-1].replace("\\'", "'").replace('\\"','"')
        return json.dumps(COPY[val], ensure_ascii=False) if val in COPY else raw
    src = re.sub(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"", literal, src)
    for old,new in sorted(COPY.items(), key=lambda x:-len(x[0])):
        # Text inside backtick HTML; labels may have a following required-star span.
        src = re.sub(r'(?<=>)(\s*)'+re.escape(old)+r'(\s*)(?=<|[\'"`])',lambda m:m[1]+new+m[2],src)
        for attr in ['title','placeholder']:
            src = src.replace(attr+'="'+old+'"',attr+'="'+new+'"')
    src = src.replace('Step ${currentStep} of ${totalSteps}', 'Paso ${currentStep} de ${totalSteps}')
    src = src.replace('Additional Driver ${driverCount}', 'Conductor adicional ${driverCount}').replace('Vehicle ${vehicleCount}', 'Vehículo ${vehicleCount}')
    # Short string fragments are intentionally scoped here, never dictionary-wide.
    for a,b in [("'Edit '","'Editar '"),("'Driver '","'Conductor '"),("'Vehicle '","'Vehículo '"),("' sq ft'","' pies cuadrados'"),("' heated sq ft'","' pies cuadrados climatizados'"),("'Parcel '","'Parcela '"),("' — Parcel '","' — Parcela '"),("' County'","' (condado)'"),("'From public records: '","'De registros públicos: '"),("' heated sq ft. Check this range; you can change it.'","' pies cuadrados climatizados. Revisa este rango; puedes cambiarlo.'"),("'Public record: '","'Registro público: '"),("'built in '","'construida en '")]:
        src=src.replace(a,b)
    return src

def schema(title, path, description):
    return {'@context':'https://schema.org','@graph':[
        {'@type':['InsuranceAgency','LocalBusiness'],'@id':'https://www.billlayneinsurance.com/#agency','name':'Bill Layne Insurance Agency','url':'https://www.billlayneinsurance.com/','telephone':'+1-336-835-1993','address':{'@type':'PostalAddress','streetAddress':'1283 N Bridge St','addressLocality':'Elkin','addressRegion':'NC','postalCode':'28621','addressCountry':'US'},'areaServed':{'@type':'State','name':'North Carolina'}},
        {'@type':'WebPage','@id':'https://www.billlayneinsurance.com'+path+'#webpage','url':'https://www.billlayneinsurance.com'+path,'name':title,'description':description,'inLanguage':'es','isPartOf':{'@id':'https://www.billlayneinsurance.com/#website'},'about':{'@id':'https://www.billlayneinsurance.com/#agency'}},
        {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Español','item':'https://www.billlayneinsurance.com/espanol/'},{'@type':'ListItem','position':2,'name':'Cotizar','item':'https://www.billlayneinsurance.com/espanol/cotizar/'}]+([] if path=='/espanol/cotizar/' else [{'@type':'ListItem','position':3,'name':title,'item':'https://www.billlayneinsurance.com'+path}])}]}

def build(kind, slug):
    src=(ROOT/(kind+'-quote.html')).read_text(encoding='utf-8')
    # Remove generated blocks first, then regenerate from the shared menu source.
    for start,end in [(menu.HEAD_START,menu.HEAD_END),(menu.START,menu.END)]:
        src=re.sub(re.escape(start)+'.*?'+re.escape(end),'',src,flags=re.S)
    s=BeautifulSoup(src,'html.parser'); s.html['lang']='es'; s.body['class']=s.body.get('class',[])+['es-quote']
    for el in s.select('#mobileDockPanel,#mobileDockOverlay'): el.decompose()
    for el in s.select('script[type="application/ld+json"]'):el.decompose()
    # Do not introduce excluded flood promotion from the legacy home form.
    flood=s.select_one('input[name="flood_interest"]')
    if flood: flood.find_parent('label').decompose()
    help_panel=s.select_one('#liability-help-panel')
    if help_panel:
        help_panel.clear()
        help_panel.append(BeautifulSoup('<strong>¿Qué significan estos límites?</strong><p>Los tres números indican límites de responsabilidad civil, en miles de dólares: lesiones por persona, lesiones por accidente y daños a la propiedad. Si no sabes qué elegir, nuestro equipo te ayudará a revisar las opciones. La cobertura depende de la póliza.</p>','html.parser'))
    # Replace the older auto recommendation copy with neutral explanatory guidance.
    for detail in s.select('details'):
        if "Here's the plain-English version" in detail.get_text():
            detail.clear()
            detail.append(BeautifulSoup('<summary>¿Qué significan estos límites?</summary><p>Los tres números indican límites de responsabilidad civil, en miles de dólares: lesiones por persona, lesiones por accidente y daños a la propiedad. Nuestro equipo puede ayudarte a revisar qué límites solicitar. La cobertura depende de la póliza.</p>','html.parser'))
    # Spanish contacts use the established Dobson office.
    for el in s.select('a[href]'):
        href=el['href']
        if href.startswith(('tel:','sms:')):el['href']='tel:3363562200'
        elif href.startswith('mailto:'):el['href']='mailto:jimenez.links@gmail.com'
        elif href=='/':el['href']='/espanol/'
        elif href.startswith('/get-quote'):el['href']='/espanol/cotizar/?src=espanol_'+kind+'_back'
        elif href.startswith('/auto-quote'):el['href']='/espanol/cotizar-auto/?src=espanol_home_bundle'
        elif href.startswith('/home-quote'):el['href']='/espanol/cotizar-casa/?src=espanol_auto_bundle'
        elif href.startswith('/renters-quote'):el['href']='/espanol/?src=espanol_home_renters&tipo=inquilino#cotizar'
        elif 'review' in href and href.startswith('https:'):el['href']='/espanol/#nosotros'
    for node in list(s.body.find_all(string=True)):
        if isinstance(node,Comment) or node.parent.name in ['script','style']:continue
        value=tr(str(node)).replace('336-835-1993','336-356-2200').replace('(336) 835-1993','336-356-2200').replace('Save@BillLayneInsurance.com','jimenez.links@gmail.com')
        if value!=str(node): node.replace_with(value)
    for el in s.select('*'):
        for attr in ['placeholder','aria-label','title','data-error']:
            if attr in el.attrs:el[attr]=tr(el[attr]).replace('Call Bill Layne Insurance at (336) 835-1993','Llamar al equipo en español: 336-356-2200').replace('Bill Layne Insurance home','Inicio en español')
        for attr in ['href','src']:
            if el.get(attr,'').startswith(('css/','js/','fonts/','img/','assets/')):el[attr]='/'+el[attr]
    for field in s.select('input[type=date]'):
        hint=s.new_tag('span',attrs={'class':'field-hint'});hint.string='Mes / día / año (según la configuración de tu dispositivo)';field.insert_after(hint)
    for script in list(s.select('script')):
        url=script.get('src','')
        if 'quote-context' in url or 'mobile-dock.js' in url or 'renters-handoff' in url:
            script.decompose();continue
        if 'quote-review.js' in url:script['src']='/js/espanol/quote-review.js?v=20261020-1'
        if 'home-property-lookup.js' in url:script['src']='/js/espanol/home-property-lookup.js?v=20261020-1'
        if not script.string:continue
        code=str(script.string)
        if len(code)<2000 and 'function toggleMobileDockMenu' in code:script.decompose();continue
        code=translate_js(code)
        code=code.replace('mailto:Save@BillLayneInsurance.com','mailto:jimenez.links@gmail.com')
        code=code.replace("const PRODUCT = 'Home'", "const PRODUCT = 'Casa'")
        if len(code)>10000:
            # Notes are already sent to staff by the established backend. Extra
            # language fields are additive and do not change the payload contract.
            code=code.replace('data.confirmation_number = confirmationNumber;',"""data.language = 'es';
            data.preferred_language = 'es';
            data.lead_source = window.esQuoteSource;
            data.additional_notes = ['Atención solicitada en ESPAÑOL — oficina de Dobson / Rosa Jimenez.', 'Origen: ' + window.esQuoteSource, data.additional_notes].filter(Boolean).join('\\n');
            data.confirmation_number = confirmationNumber;""")
            code=code.replace("method: 'backend_acknowledged'", "method: 'backend_acknowledged', language: 'es', cta_source: window.esQuoteSource")
            code=code.replace('encodeURIComponent(generateEmailBody(data))','encodeURIComponent(window.esQuoteEmailBody(data))')
            code=code.replace('Auto Insurance Quote Request','Solicitud de seguro de auto en español').replace('Home Insurance Quote Request','Solicitud de seguro de casa en español')
        script.string=code
    # A single canonical shared header is generated, not edited in page output.
    header=s.select_one('header'); header.replace_with(Comment('SPANISH_HEADER_SLOT'))
    dock=s.select_one('.dock-menu')
    if dock:
        dock.attrs.pop('onclick',None);dock['type']='button';dock['data-bli-menu-open']='';dock['aria-label']='Abrir menú'
    footer=s.select_one('footer')
    footer.replace_with(BeautifulSoup('<footer class="es-footer"><strong>Bill Layne Insurance · Aseguranza Comunidad Unida</strong><p>Atención en español · Dobson, Carolina del Norte</p><div class="es-actions"><a class="es-button es-button-light" href="tel:3363562200">Llamar: 336-356-2200</a><a class="es-button es-button-gold cta-gold" href="/espanol/cotizar/?src=espanol_quote_footer">Cotizar otro seguro</a><button class="es-button es-button-light" data-bli-menu-open type="button">Menú</button></div><a href="/privacy-policy/">Política de privacidad (en inglés)</a></footer>','html.parser'))
    path='/espanol/'+slug+'/'
    title='Cotiza tu seguro de '+('auto' if kind=='auto' else 'casa')+' en español | Bill Layne'
    description='Solicita tu cotización de seguro de '+('auto' if kind=='auto' else 'casa')+' en Carolina del Norte. Completa tus datos en español y recibe ayuda de nuestro equipo en Dobson.'
    s.title.string=title
    for tag in s.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):tag['content']=description
    for tag in s.select('meta[property="og:title"],meta[name="twitter:title"]'):tag['content']=title
    for tag in s.select('meta[property="og:url"]'):tag['content']='https://www.billlayneinsurance.com'+path
    for tag in s.select('meta[property="og:locale"]'):tag['content']='es_US'
    s.select_one('link[rel="canonical"]')['href']='https://www.billlayneinsurance.com'+path
    for tag in s.select('link[hreflang]'):tag.decompose()
    for lang,href in [('es',path),('en','/'+kind+'-quote')]:
        tag=s.new_tag('link',rel='alternate',hreflang=lang,href='https://www.billlayneinsurance.com'+href);s.head.append(tag)
    for tag in s.select('meta[name="keywords"]'):tag.decompose()
    for tag in s.select('meta[name="geo.position"],meta[name="ICBM"]'):tag.decompose()
    for tag in s.select('meta[name="geo.placename"]'):tag['content']='Dobson, North Carolina'
    s.head.append(s.new_tag('link',rel='stylesheet',href='/css/espanol-quote.css?v=20261020-1'))
    tag=s.new_tag('script',type='application/ld+json');tag.string=json.dumps(schema(title,path,description),ensure_ascii=False);s.head.append(tag)
    # Loaded before inline submit logic; no user data is placed in the URL.
    common=s.new_tag('script',src='/js/espanol/quote-common.js?v=20261020-1')
    s.body.insert(0,common)
    noscript=s.new_tag('noscript');noscript.append(BeautifulSoup('<p class="es-nojs">Para completar este formulario, activa JavaScript o llama al <a href="tel:3363562200">336-356-2200</a> para cotizar en español.</p>','html.parser'));s.body.insert(1,noscript)
    # Keep all state enum options for payload parity, but clearly identify territory.
    subtitle=s.select_one('.hero-sub')
    if subtitle:subtitle.append(' Atención en español para todo Carolina del Norte.')
    text=str(s).replace('<!--SPANISH_HEADER_SLOT-->',menu.render_header(cfg,'espanol/'+slug+'/index.html'))
    text=menu.transform(text,cfg,'espanol/'+slug+'/index.html')
    dest=ROOT/'espanol'/slug/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text,encoding='utf-8')
    print('Built',dest.relative_to(ROOT))

def main():
    dest=ROOT/'js/espanol';dest.mkdir(parents=True,exist_ok=True)
    for name in ['quote-review.js','home-property-lookup.js']:
        (dest/name).write_text(translate_js((ROOT/'js'/name).read_text(encoding='utf-8')),encoding='utf-8')
    build('auto','cotizar-auto');build('home','cotizar-casa')

if __name__=='__main__':main()
