"""Generate all community sub-pages with consistent Tailwind template."""
import os

BASE = r'C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE\community'

# Page definitions
pages = [
    {
        'file': 'pilot-mountain.html',
        'title': 'Pilot Mountain State Park | Surry County Hiking & Views | Bill Layne Insurance',
        'meta_desc': 'Discover Pilot Mountain State Park in Surry County, NC. Panoramic views, hiking trails, rock climbing, and camping at this iconic geological marvel. Community guide by Bill Layne Insurance.',
        'canonical': 'https://www.billlayneinsurance.com/community/pilot-mountain.html',
        'og_title': 'Pilot Mountain State Park - Surry County Guide',
        'og_desc': 'Experience breathtaking panoramic views, hiking trails, and rock climbing at this iconic natural wonder.',
        'og_image': 'https://i.imgur.com/WLc4zHf.jpeg',
        'breadcrumb_name': 'Pilot Mountain',
        'badge': 'Nature & Outdoors',
        'h1': 'Pilot Mountain State Park',
        'hero_image': 'https://i.imgur.com/WLc4zHf.jpeg',
        'hero_alt': 'Sweeping views of the Yadkin Valley from the summit of Pilot Mountain',
        'h2': 'A Natural Marvel',
        'content_paragraphs': [
            'Rising more than 2,000 feet, Pilot Mountain is one of the most distinctive natural features in North Carolina. The park is characterized by its iconic quartzite pinnacle, which has guided travelers and indigenous peoples for centuries.',
            'Today, Pilot Mountain State Park offers endless opportunities for outdoor adventure. Whether you are driving safely to the summit overlook or challenging yourself on a rugged hiking trail from the river section, the views of the Yadkin Valley and the Blue Ridge Mountains are spectacular year-round.',
        ],
        'list_title': 'Popular Activities',
        'list_items': [
            'Hiking the Jomeokee Trail (around the base of the pinnacle)',
            'Permitted rock climbing on the mountain\'s steep cliffs',
            'Canoeing and fishing in the Yadkin River section',
            'Family camping (42 tent and trailer campsites)',
        ],
        'sidebar_items': [
            ('<strong>Address:</strong>', '1792 Pilot Knob Park Rd<br>Pinnacle, NC 27043'),
            ('<strong>Hours:</strong>', 'Varies by season (Usually 7:00 AM - Sunset)'),
            ('<strong>Amenities:</strong>', 'Visitor Center, Restrooms, Picnic Areas, Campgrounds, Paved Overlook Access'),
        ],
        'sidebar_link': ('https://www.ncparks.gov/state-parks/pilot-mountain-state-park', 'Official Park Site'),
        'schema': '{"@context":"https://schema.org","@type":"TouristAttraction","name":"Pilot Mountain State Park","image":"https://i.imgur.com/WLc4zHf.jpeg","description":"An iconic geological formation offering spectacular hiking, rock climbing, and panoramic views of the Yadkin Valley.","address":{"@type":"PostalAddress","streetAddress":"1792 Pilot Knob Park Rd","addressLocality":"Pinnacle","addressRegion":"NC","postalCode":"27043","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":36.3396,"longitude":-80.4639},"url":"https://www.ncparks.gov/state-parks/pilot-mountain-state-park"}',
    },
    {
        'file': 'mount-airy.html',
        'title': 'Historic Mount Airy | The Real Mayberry | Bill Layne Insurance',
        'meta_desc': 'Explore historic Mount Airy in Surry County, NC. Known as the real-life inspiration for Andy Griffith\'s Mayberry, with authentic Americana and rich musical heritage.',
        'canonical': 'https://www.billlayneinsurance.com/community/mount-airy.html',
        'og_title': 'Historic Mount Airy - The Real Mayberry',
        'og_desc': 'Step back in time in the idyllic hometown of Andy Griffith. Enjoy authentic charm, local shops, and rich musical heritage.',
        'og_image': 'https://i.imgur.com/OlIoQco.jpeg',
        'breadcrumb_name': 'Mount Airy',
        'badge': 'Culture & History',
        'h1': 'Historic Mount Airy',
        'hero_image': 'https://i.imgur.com/OlIoQco.jpeg',
        'hero_alt': 'Historic storefronts on Main Street in Mount Airy, North Carolina',
        'h2': 'Welcome to Mayberry',
        'content_paragraphs': [
            'Step back into a simpler time. Mount Airy is famous as the childhood home of actor Andy Griffith, and the town served as the primary inspiration for the idyllic, fictional town of Mayberry in The Andy Griffith Show.',
            'Walking down Main Street, visitors can grab a famous pork chop sandwich at Snappy Lunch, get a trim at Floyd\'s City Barber Shop, or take a vintage squad car tour around the city. But the town is more than just television nostalgia; it\'s a vibrant hub for traditional Old-Time and Bluegrass music native to the Blue Ridge mountains.',
        ],
        'list_title': 'Don\'t Miss',
        'list_items': [
            'The Andy Griffith Museum',
            'Mayberry Squad Car Tours',
            'Wally\'s Service Station',
            'The Earle Theatre (Old-Time music jams)',
        ],
        'sidebar_items': [
            ('<strong>Location:</strong>', 'Surry County, NC<br>Foothills of the Blue Ridge'),
            ('<strong>Vibe:</strong>', 'Nostalgic, Friendly, Musical, Historic'),
            ('<strong>Best Time to Visit:</strong>', 'September (Mayberry Days Festival) or Spring'),
        ],
        'sidebar_link': ('https://www.visitmayberry.com/', 'Visit Official Site'),
        'schema': '{"@context":"https://schema.org","@type":"City","name":"Mount Airy","alternateName":"Mayberry","image":"https://i.imgur.com/OlIoQco.jpeg","description":"Historic municipality in North Carolina, famous as the birthplace of actor Andy Griffith and the inspiration for the fictional town of Mayberry.","containedInPlace":{"@type":"AdministrativeArea","name":"Surry County"},"url":"https://www.visitmayberry.com/"}',
    },
    {
        'file': 'elkin.html',
        'title': 'Explore Elkin | NC\'s Premier Trail Town | Bill Layne Insurance',
        'meta_desc': 'Discover vibrant Elkin in Surry County, NC. NC\'s premier Trail Town featuring the historic Reeves Theater, craft breweries, and access to the Yadkin Valley Wine Region.',
        'canonical': 'https://www.billlayneinsurance.com/community/elkin.html',
        'og_title': 'Explore Elkin - NC\'s Premier Trail Town',
        'og_desc': 'Discover vibrant downtown Elkin, featuring historic theaters, robust trails, and local breweries.',
        'og_image': 'https://i.imgur.com/TQr5p6X.jpeg',
        'breadcrumb_name': 'Elkin',
        'badge': 'Culture & Trails',
        'h1': 'Explore Elkin',
        'hero_image': 'https://i.imgur.com/TQr5p6X.jpeg',
        'hero_alt': 'The glowing neon marquee of the historic Reeves Theater in downtown Elkin at dusk',
        'h2': 'The Ultimate Trail Town',
        'content_paragraphs': [
            'Nestled in the foothills of the Blue Ridge Mountains and situated along the banks of the Yadkin River, Elkin effortlessly combines outdoor adventure with small-town charm. It is officially recognized as a North Carolina Trail Town, serving as the rare crossroads where three major trails converge.',
            'Downtown Elkin has seen an incredible revitalization. The centerpiece is the beautifully restored 1941 Art Deco Reeves Theater, which hosts a variety of live music events. Around the corner, you\'ll find craft breweries like Angry Troll Brewing, local art galleries, coffee shops, and the Yadkin Valley Fiber School.',
        ],
        'list_title': 'Downtown Highlights',
        'list_items': [
            'Live music at the historic Reeves Theater',
            'Craft beer and outdoor seating at Elkin Railyard',
            'Heritage & Trails Center (Visitor info)',
            'Downtown Mural Hike',
        ],
        'sidebar_items': [
            ('<strong>Location:</strong>', 'Surry County, NC<br>Gateway to the Yadkin Valley'),
            ('<strong>Vibe:</strong>', 'Outdoorsy, Artistic, Vibrant, Historic'),
        ],
        'sidebar_extra': '<a href="elkin-parks.html" class="block w-full py-3 text-center rounded-xl bg-amber-50 text-amber-700 font-bold text-sm mb-4 hover:bg-amber-100 transition-colors"><i class="fas fa-tree mr-2"></i>Explore Elkin Parks</a>',
        'sidebar_link': ('https://www.exploreelkin.com/', 'Visit Official Site'),
        'schema': '{"@context":"https://schema.org","@type":"City","name":"Elkin","image":"https://i.imgur.com/TQr5p6X.jpeg","description":"Known as North Carolina\'s best-kept secret, Elkin is a prominent Trail Town featuring the Reeves Theater and serving as the gateway to the Yadkin Valley AVA.","containedInPlace":{"@type":"AdministrativeArea","name":"Surry County"},"url":"https://www.exploreelkin.com/"}',
    },
    {
        'file': 'elkin-parks.html',
        'title': 'Elkin Parks & Trails | Mountains-to-Sea & More | Bill Layne Insurance',
        'meta_desc': 'Explore the renowned parks and trails of Elkin, NC. Discover Crater Park, the Mountains-to-Sea Trail, and the convergence of three major trail systems.',
        'canonical': 'https://www.billlayneinsurance.com/community/elkin-parks.html',
        'og_title': 'Elkin Parks & Trails Directory',
        'og_desc': 'Discover why Elkin is NC\'s premier Trail Town with miles of hiking, paddling, and recreation.',
        'og_image': 'https://i.imgur.com/grv6KbM.jpeg',
        'breadcrumb_name': 'Elkin Parks',
        'badge': 'Nature & Outdoors',
        'h1': 'Elkin Parks & Trails',
        'hero_image': 'https://i.imgur.com/grv6KbM.jpeg',
        'hero_alt': 'Kayakers paddling down the Yadkin River alongside the Mountains-to-Sea Trail in Elkin',
        'h2': 'The Convergence of Three Trails',
        'content_paragraphs': [
            'Elkin is one of the few places in America where a land trail, a water trail, and a historic trail all successfully converge. This makes it a truly unique destination for outdoor enthusiasts.',
        ],
        'list_title': None,
        'list_items': [],
        'sidebar_items': [],
        'sidebar_link': ('https://elkinvalleytrails.org/', 'Elkin Valley Trails Association'),
        'is_parks_page': True,
        'parks_cards': [
            ('fa-water', 'Crater Park', 'Situated directly adjacent to the Yadkin River, Crater Park is the ultimate hub for paddlers. It features a boat ramp, river access, and serves as the primary gateway for the Yadkin River Blue Water Trail. It also offers a splash pad, baseball fields, and primitive camping for Mountains-to-Sea Trail hikers.'),
            ('fa-tree', 'Municipal Park', 'A sprawling 25-acre multi-functional recreation space featuring the trailhead for the Elkin & Alleghany Rail Trail. Amenities include a community pool, walking trails, lighted tennis courts, a fishing pier on Big Elkin Creek, and a band shell for events.'),
            ('fa-person-hiking', 'The Major Trails', 'Elkin serves as an official stopping point for the cross-state Mountains-to-Sea Trail (MST). Additionally, the eastern terminus of the federally sanctioned Overmountain Victory National Historic Trail (OVT) begins right in downtown Elkin.'),
        ],
        'schema': '{"@context":"https://schema.org","@type":"CollectionPage","name":"Elkin Parks & Trails","image":"https://i.imgur.com/grv6KbM.jpeg","description":"Directory of parks and major trail systems located in and around the town of Elkin, North Carolina.","url":"https://www.billlayneinsurance.com/community/elkin-parks.html"}',
    },
    {
        'file': 'wineries.html',
        'title': 'Yadkin Valley Wineries | Surry County, NC | Bill Layne Insurance',
        'meta_desc': 'Explore the premier wineries of the Yadkin Valley in Surry County, NC. Discover Shelton Vineyards, JOLO Winery, Round Peak, and more award-winning vineyards.',
        'canonical': 'https://www.billlayneinsurance.com/community/wineries.html',
        'og_title': 'Yadkin Valley Wineries - Surry County, NC',
        'og_desc': 'Experience award-winning wines and stunning vineyard views in the heart of the Yadkin Valley.',
        'og_image': 'https://i.imgur.com/tlf11n6.jpeg',
        'breadcrumb_name': 'Wineries',
        'badge': 'Food & Drink',
        'h1': 'Yadkin Valley Wineries',
        'hero_image': None,
        'hero_alt': None,
        'h2': None,
        'content_paragraphs': [],
        'list_title': None,
        'list_items': [],
        'sidebar_items': [],
        'sidebar_link': None,
        'is_winery_hub': True,
        'winery_cards': [
            ('https://i.imgur.com/fr91pU1.jpeg', 'Shelton Vineyards', 'shelton-vineyards.html', 'Large Estate', 'One of the largest vineyards on the East Coast. Experience elegant tastings, walking trails, and the renowned Harvest Grill restaurant.'),
            ('https://i.imgur.com/kEr9yjL.jpeg', 'JOLO Winery & Vineyards', 'jolo-winery.html', 'Premium Experience', 'An award-winning boutique winery offering a luxurious tasting experience with breathtaking, direct views of Pilot Mountain.'),
            ('https://i.imgur.com/ZO4nNCe.jpeg', 'Round Peak Vineyards', 'round-peak-vineyards.html', 'Dog Friendly', 'Nestled in the foothills, specializing in French and Italian varietals. Famous for spectacular sunset views and a welcoming atmosphere.'),
        ],
        'schema': '{"@context":"https://schema.org","@type":"CollectionPage","name":"Yadkin Valley Wineries","description":"A curated directory of the premium wineries located in Surry County\'s Yadkin Valley AVA.","url":"https://www.billlayneinsurance.com/community/wineries.html"}',
    },
    {
        'file': 'shelton-vineyards.html',
        'title': 'Shelton Vineyards | Yadkin Valley, NC | Bill Layne Insurance',
        'meta_desc': 'Visit Shelton Vineyards in NC\'s Yadkin Valley. One of the largest vineyards on the East Coast with award-winning wines, the Harvest Grill, and scenic trails.',
        'canonical': 'https://www.billlayneinsurance.com/community/shelton-vineyards.html',
        'og_title': 'Shelton Vineyards - Yadkin Valley, NC',
        'og_desc': 'Experience one of the largest and most elegant vineyards on the East Coast.',
        'og_image': 'https://i.imgur.com/fr91pU1.jpeg',
        'breadcrumb_name': 'Shelton Vineyards',
        'breadcrumb_parent': ('wineries.html', 'Wineries'),
        'badge': 'Dobson, NC',
        'h1': 'Shelton Vineyards',
        'hero_image': 'https://i.imgur.com/fr91pU1.jpeg',
        'hero_alt': 'Rows of grapevines leading to Shelton Vineyards Estate',
        'h2': 'A Legacy of Winemaking',
        'content_paragraphs': [
            'Founded in 1999 by brothers Charlie and Ed Shelton, Shelton Vineyards was envisioned as a new agricultural resource for an area once dependent on tobacco farming. Today, it stands as one of the largest vineyards on the East Coast.',
            'The estate features beautifully manicured grounds, picturesque walking trails, and the highly acclaimed Harvest Grill restaurant. The climate and soil of the Yadkin Valley AVA are similar to that of the best winegrowing regions in Europe, allowing Shelton Vineyards to produce exceptional vintages.',
        ],
        'list_title': 'Award-Winning Varietals',
        'list_items': ['Cabernet Franc', 'Chardonnay', 'Merlot', 'Riesling', 'Tannat'],
        'sidebar_items': [
            ('<strong>Address:</strong>', '286 Cabernet Ln<br>Dobson, NC 27017'),
            ('<strong>Phone:</strong>', '<a href="tel:+13363664724" class="text-amber-600 hover:text-amber-700">(336) 366-4724</a>'),
            ('<strong>Features:</strong>', 'Tasting Room, Guided Tours, Fine Dining, Walking Trails, Event Space'),
        ],
        'sidebar_link': ('https://www.sheltonvineyards.com/', 'Visit Official Site'),
        'schema': '{"@context":"https://schema.org","@type":"Winery","name":"Shelton Vineyards","image":"https://i.imgur.com/fr91pU1.jpeg","description":"One of the largest vineyards on the East Coast, offering award-winning wines, dining at the Harvest Grill, and walking trails.","address":{"@type":"PostalAddress","streetAddress":"286 Cabernet Ln","addressLocality":"Dobson","addressRegion":"NC","postalCode":"27017","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":36.3683,"longitude":-80.7506},"url":"https://www.sheltonvineyards.com/","telephone":"+13363664724"}',
    },
    {
        'file': 'jolo-winery.html',
        'title': 'JOLO Winery & Vineyards | Premium Surry County Wine | Bill Layne Insurance',
        'meta_desc': 'Experience luxury at JOLO Winery & Vineyards in Surry County, NC. Award-winning wines, fine dining at End Posts Restaurant, and spectacular views of Pilot Mountain.',
        'canonical': 'https://www.billlayneinsurance.com/community/jolo-winery.html',
        'og_title': 'JOLO Winery & Vineyards - Yadkin Valley, NC',
        'og_desc': 'An award-winning boutique winery offering a luxurious tasting experience.',
        'og_image': 'https://i.imgur.com/kEr9yjL.jpeg',
        'breadcrumb_name': 'JOLO Winery',
        'breadcrumb_parent': ('wineries.html', 'Wineries'),
        'badge': 'Pilot Mountain, NC',
        'h1': 'JOLO Winery & Vineyards',
        'hero_image': 'https://i.imgur.com/kEr9yjL.jpeg',
        'hero_alt': 'Elegant outdoor dining setup at JOLO Winery with Pilot Mountain in the distance',
        'h2': 'An Unforgettable Experience',
        'content_paragraphs': [
            'Consistently ranked as one of the top wineries in the country outside of California, JOLO Winery & Vineyards sets the standard for elegance and quality in the Yadkin Valley. The estate offers an unparalleled atmosphere that pairs seamlessly with their meticulously crafted wines.',
            'Guests can enjoy luxurious outdoor seating that provides dramatic, unobstructed views of Pilot Mountain. The property is also home to End Posts Restaurant, where culinary excellence meets local ingredients to create perfect wine pairings.',
        ],
        'list_title': 'The JOLO Standard',
        'list_items': ['Award-winning Pilot Fog (Norton grape)', 'JOLOTAGE (Premium Red Blend)', 'Golden Hallows (Crisp White)', 'Exquisite Tapas and Fine Dining'],
        'sidebar_items': [
            ('<strong>Address:</strong>', '219 Jolo Winery Ln<br>Pilot Mountain, NC 27041'),
            ('<strong>Phone:</strong>', '<a href="tel:+13366140030" class="text-amber-600 hover:text-amber-700">(336) 614-0030</a>'),
            ('<strong>Features:</strong>', 'End Posts Restaurant, Pilot Mountain Views, Premium Tastings, Reservations Required'),
        ],
        'sidebar_link': ('https://www.jolovineyards.com/', 'Visit Official Site'),
        'schema': '{"@context":"https://schema.org","@type":"Winery","name":"JOLO Winery & Vineyards","image":"https://i.imgur.com/kEr9yjL.jpeg","description":"An award-winning boutique winery offering a luxurious tasting experience with breathtaking views of Pilot Mountain.","address":{"@type":"PostalAddress","streetAddress":"219 Jolo Winery Ln","addressLocality":"Pilot Mountain","addressRegion":"NC","postalCode":"27041","addressCountry":"US"},"url":"https://www.jolovineyards.com/","telephone":"+13366140030"}',
    },
    {
        'file': 'round-peak-vineyards.html',
        'title': 'Round Peak Vineyards | Yadkin Valley Wine Tasting | Bill Layne Insurance',
        'meta_desc': 'Visit Round Peak Vineyards in Mount Airy, NC. Enjoy sunset views, dog-friendly spaces, and premium French and Italian wine varietals in the Yadkin Valley.',
        'canonical': 'https://www.billlayneinsurance.com/community/round-peak-vineyards.html',
        'og_title': 'Round Peak Vineyards - Mount Airy, NC',
        'og_desc': 'Spectacular sunset views and a welcoming, dog-friendly atmosphere at this beautiful vineyard.',
        'og_image': 'https://i.imgur.com/ZO4nNCe.jpeg',
        'breadcrumb_name': 'Round Peak Vineyards',
        'breadcrumb_parent': ('wineries.html', 'Wineries'),
        'badge': 'Mount Airy, NC',
        'h1': 'Round Peak Vineyards',
        'hero_image': 'https://i.imgur.com/ZO4nNCe.jpeg',
        'hero_alt': 'Dog-friendly vineyard landscape with rolling hills at sunset',
        'h2': 'Sunset Views & Fine Wine',
        'content_paragraphs': [
            'Located near Mount Airy at an elevation of 1,300 feet, Round Peak Vineyards is known as the northernmost vineyard in the Yadkin Valley. The property offers a relaxed, unpretentious atmosphere featuring panoramic views of the Blue Ridge Mountains that are absolutely stunning at sunset.',
            'Round Peak is uniquely dog-friendly, featuring a large, fenced-in dog space where pets can run freely while their owners relax with a glass of wine. The winery focuses heavily on classic French and Italian varietals.',
        ],
        'list_title': 'At the Vineyard',
        'list_items': ['Award-winning Nebbiolo and Sangiovese', 'Skull Camp craft beers on tap', 'Dedicated off-leash dog park', 'On-site disc golf course'],
        'sidebar_items': [
            ('<strong>Address:</strong>', '765 Round Peak Church Rd<br>Mount Airy, NC 27030'),
            ('<strong>Phone:</strong>', '<a href="tel:+13363525595" class="text-amber-600 hover:text-amber-700">(336) 352-5595</a>'),
            ('<strong>Features:</strong>', 'Pet Friendly, Picnics Welcome, Disc Golf, Craft Beer, Vineyard Cabins'),
        ],
        'sidebar_link': ('https://www.roundpeak.com/', 'Visit Official Site'),
        'schema': '{"@context":"https://schema.org","@type":"Winery","name":"Round Peak Vineyards","image":"https://i.imgur.com/ZO4nNCe.jpeg","description":"Nestled in the foothills, specializing in French and Italian varietals. Famous for spectacular sunset views and a dog-friendly atmosphere.","address":{"@type":"PostalAddress","streetAddress":"765 Round Peak Church Rd","addressLocality":"Mount Airy","addressRegion":"NC","postalCode":"27030","addressCountry":"US"},"url":"https://www.roundpeak.com/","telephone":"+13363525595"}',
    },
]


def build_breadcrumb(page):
    crumbs = '<li><a href="../index.html" class="hover:text-white transition-colors">Home</a></li>\n'
    crumbs += '                        <li><i class="fas fa-chevron-right text-[10px] opacity-50"></i></li>\n'
    crumbs += '                        <li><a href="index.html" class="hover:text-white transition-colors">Community</a></li>\n'
    if page.get('breadcrumb_parent'):
        crumbs += '                        <li><i class="fas fa-chevron-right text-[10px] opacity-50"></i></li>\n'
        crumbs += f'                        <li><a href="{page["breadcrumb_parent"][0]}" class="hover:text-white transition-colors">{page["breadcrumb_parent"][1]}</a></li>\n'
    crumbs += '                        <li><i class="fas fa-chevron-right text-[10px] opacity-50"></i></li>\n'
    crumbs += f'                        <li class="text-white font-medium">{page["breadcrumb_name"]}</li>'
    return crumbs


def build_article_content(page):
    """Build the main content for a standard article page."""
    content = ''

    if page.get('is_winery_hub'):
        return build_winery_hub(page)
    if page.get('is_parks_page'):
        return build_parks_page(page)

    # Hero image
    content += f'''
        <article class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <img src="{page['hero_image']}" alt="{page['hero_alt']}" class="w-full aspect-video sm:aspect-[16/9] object-cover rounded-xl sm:rounded-2xl shadow-md mb-6 sm:mb-8 reveal" loading="lazy">

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                <div class="lg:col-span-2 reveal">
                    <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mb-4">{page['h2']}</h2>
'''
    for p in page['content_paragraphs']:
        content += f'                    <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">{p}</p>\n'

    if page['list_title']:
        content += f'''
                    <h3 class="text-lg sm:text-xl font-display font-bold text-slate-900 mt-6 mb-3">{page['list_title']}</h3>
                    <ul class="space-y-2 text-slate-500 text-sm sm:text-base">
'''
        for item in page['list_items']:
            content += f'                        <li class="flex items-start gap-2"><i class="fas fa-check text-amber-500 mt-1 text-xs"></i> {item}</li>\n'
        content += '                    </ul>\n'

    content += '                </div>\n'

    # Sidebar
    content += '''
                <aside class="reveal">
                    <div class="bg-slate-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-100 sticky top-24">
                        <h3 class="font-display font-bold text-slate-900 text-lg mb-4">Plan Your Visit</h3>
'''
    for label, value in page['sidebar_items']:
        content += f'                        <p class="text-sm text-slate-600 mb-3">{label}<br><span class="text-slate-500">{value}</span></p>\n'

    if page.get('sidebar_extra'):
        content += f'                        {page["sidebar_extra"]}\n'

    if page['sidebar_link']:
        content += f'                        <a href="{page["sidebar_link"][0]}" target="_blank" rel="noopener" class="block w-full py-3 text-center rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all">{page["sidebar_link"][1]}</a>\n'

    content += '''                    </div>
                </aside>
            </div>
        </article>'''

    return content


def build_winery_hub(page):
    content = '''
        <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <p class="text-center text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-8 sm:mb-12 reveal">Discover North Carolina\'s premier wine destination. With over 40 vineyards, the Yadkin Valley AVA offers award-winning varieties set against the stunning backdrop of the Blue Ridge Mountains.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
'''
    for img, name, link, badge_text, desc in page['winery_cards']:
        content += f'''
                <a href="{link}" class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover reveal block">
                    <div class="aspect-square overflow-hidden">
                        <img src="{img}" alt="{name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                    </div>
                    <div class="p-4 sm:p-5">
                        <span class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 mb-1 block">{badge_text}</span>
                        <h3 class="font-display font-bold text-slate-900 text-base sm:text-lg mb-1 sm:mb-2">{name}</h3>
                        <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
                        <span class="inline-flex items-center gap-1 text-amber-600 font-bold text-xs sm:text-sm mt-2 sm:mt-3 group-hover:gap-2 transition-all">View Details <i class="fas fa-arrow-right text-[10px]"></i></span>
                    </div>
                </a>
'''
    content += '''            </div>
        </section>'''
    return content


def build_parks_page(page):
    content = f'''
        <section class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <img src="{page['hero_image']}" alt="{page['hero_alt']}" class="w-full aspect-video sm:aspect-[16/9] object-cover rounded-xl sm:rounded-2xl shadow-md mb-6 sm:mb-8 reveal" loading="lazy">

            <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mb-6 sm:mb-8 text-center reveal">{page['h2']}</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
'''
    for icon, title, desc in page['parks_cards']:
        content += f'''
                <div class="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 reveal">
                    <h3 class="font-display font-bold text-slate-900 text-base sm:text-lg mb-2"><i class="fas {icon} text-amber-500 mr-2"></i>{title}</h3>
                    <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
                </div>
'''
    content += f'''            </div>

            <div class="text-center reveal">
                <a href="elkin.html" class="inline-flex items-center gap-2 text-amber-600 font-bold text-sm hover:text-amber-700 transition-colors mr-6"><i class="fas fa-arrow-left text-xs"></i> Back to Elkin</a>
                <a href="{page['sidebar_link'][0]}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md shadow-amber-500/20 transition-all">{page['sidebar_link'][1]} <i class="fas fa-external-link-alt text-xs"></i></a>
            </div>
        </section>'''
    return content


TEMPLATE = '''<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{meta_desc}">
    <meta name="author" content="Bill Layne Insurance Agency">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <link rel="canonical" href="{canonical}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Bill Layne Insurance Agency">
    <meta property="og:url" content="{canonical}">
    <meta property="og:title" content="{og_title}">
    <meta property="og:description" content="{og_desc}">
    <meta property="og:image" content="{og_image}">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{og_title}">
    <meta name="twitter:description" content="{og_desc}">
    <meta name="twitter:image" content="{og_image}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap&family=DM+Sans:wght@400;500;600;700" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="../css/tailwind-output.css">
    <link rel="stylesheet" href="../css/mobile-dock.css">

    <style>
        body {{ -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }}
        .glass-nav {{ background: rgba(255,255,255,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.5); }}
        .reveal {{ opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }}
        .reveal.active {{ opacity: 1; transform: translateY(0); }}
        .card-hover {{ transition: transform 0.3s, box-shadow 0.3s; }}
        .card-hover:hover {{ transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }}
        @media (max-width: 767px) {{ .card-hover:hover {{ transform: none; box-shadow: none; }} }}
    </style>

    <script type="application/ld+json">{schema}</script>

    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{"@type": "ListItem", "position": 1, "name": "Bill Layne Insurance", "item": "https://www.billlayneinsurance.com/"}},
        {{"@type": "ListItem", "position": 2, "name": "Community Guide", "item": "https://www.billlayneinsurance.com/community/"}},
        {{"@type": "ListItem", "position": 3, "name": "{breadcrumb_name}", "item": "{canonical}"}}
      ]
    }}
    </script>
</head>

<body class="bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">

    <!-- Navigation -->
    <nav id="navbar" class="fixed w-full z-50 transition-all duration-300 top-0 glass-nav shadow-sm" style="height:72px">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div class="flex justify-between items-center h-full">
                <a href="../index.html" class="flex flex-col leading-none group relative z-50">
                    <span class="text-2xl font-display font-extrabold tracking-tight text-slate-900">
                        Bill Layne <span class="text-amber-600">Insurance</span>
                    </span>
                    <span class="text-[10px] font-bold uppercase tracking-widest mt-1 text-slate-500">Community Guide</span>
                </a>
                <div class="flex items-center gap-4">
                    <a href="tel:3368351993" class="hidden md:flex items-center font-bold text-slate-700 hover:text-amber-600 transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 text-sm">
                        <i class="fas fa-phone-alt mr-2 text-amber-500"></i>(336) 835-1993
                    </a>
                    <a href="../get-quote.html" class="hidden md:block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-7 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95">
                        Get Free Quote
                    </a>
                    <button id="menu-toggle" class="hidden md:block p-3 rounded-full transition-colors focus:outline-none hover:bg-slate-100 text-slate-700" aria-label="Open Menu">
                        <div class="w-6 h-5 flex flex-col justify-between relative">
                            <span class="nav-hamburger-line w-full h-0.5 rounded-full bg-slate-700"></span>
                            <span class="nav-hamburger-line w-full h-0.5 rounded-full bg-slate-700"></span>
                            <span class="nav-hamburger-line w-full h-0.5 rounded-full bg-slate-700"></span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Desktop Drawer -->
    <div id="menu-overlay" class="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm transition-opacity duration-300 opacity-0 pointer-events-none"></div>
    <div id="menu-drawer" class="fixed top-0 right-0 w-80 max-w-full h-full bg-white z-[70] shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-6 flex justify-between items-center border-b border-slate-100">
            <h3 class="text-lg font-display font-bold text-slate-900">Menu</h3>
            <button id="menu-close" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"><i class="fas fa-times"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-1">
            <a href="../index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-home w-6 text-indigo-500"></i> Home</a>
            <a href="../areas-we-serve.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-map-marked-alt w-6 text-purple-500"></i> Areas We Serve</a>
            <a href="../auto-center/index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-car w-6 text-blue-500"></i> Auto Insurance</a>
            <a href="../home-insurance/index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-home w-6 text-green-500"></i> Home Insurance</a>
            <a href="../claims-center/index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-file-medical-alt w-6 text-red-500"></i> Claims Center</a>
            <a href="../resources/index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-book w-6 text-orange-500"></i> Resources</a>
            <a href="../blog/index.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-blog w-6 text-indigo-500"></i> Blog</a>
            <a href="../community/" class="block p-3 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center gap-3"><i class="fas fa-mountain w-6"></i> Community</a>
            <a href="../contact-us.html" class="block p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-3"><i class="fas fa-envelope w-6 text-slate-400"></i> Contact Us</a>
            <a href="../espanol/" class="block p-3 rounded-xl hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-3"><i class="fas fa-globe-americas w-6 text-emerald-500"></i> Espa&ntilde;ol &#127474;&#127485;</a>
        </div>
        <div class="p-6 border-t border-slate-100 bg-slate-50">
            <a href="tel:3368351993" class="block w-full py-4 bg-slate-900 text-white text-center rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">Call Now</a>
        </div>
    </div>

    <!-- Page Header -->
    <section class="pt-24 sm:pt-28 pb-8 sm:pb-12 bg-gradient-to-b from-amber-50 to-slate-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <nav aria-label="Breadcrumb" class="mb-4">
                <ol class="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400 flex-wrap">
                    {breadcrumbs}
                </ol>
            </nav>
            <span class="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">{badge}</span>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900">{h1}</h1>
        </div>
    </section>

    <main>
        {article_content}

        <!-- Insurance CTA -->
        <section class="py-10 sm:py-14 bg-gradient-to-r from-slate-900 to-slate-800 text-white mt-8 sm:mt-12">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center reveal">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <i class="fas fa-shield-alt text-amber-400 text-xl"></i>
                    <h2 class="text-lg sm:text-xl lg:text-2xl font-display font-extrabold">Love Living in Surry County?</h2>
                </div>
                <p class="text-slate-300 mb-6 text-sm sm:text-base max-w-xl mx-auto">We protect Surry County families with the best auto and home insurance rates from multiple carriers.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="../get-quote.html" class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all text-sm"><i class="fas fa-bolt"></i> Get a Free Quote</a>
                    <a href="../contact-us.html" class="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-all text-sm"><i class="fas fa-envelope"></i> Contact Us</a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 border-t border-slate-800 text-slate-400 py-16 pb-32 md:pb-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-4 gap-6 md:gap-12 mb-12">
            <div>
                <h4 class="text-white font-display font-bold text-xl mb-6">Bill Layne Insurance</h4>
                <p class="text-sm leading-relaxed mb-6">Protecting families in North Carolina since 2005.</p>
                <div class="flex gap-4">
                    <a href="https://www.facebook.com/dollarbillagency/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all"><i class="fab fa-facebook-f"></i></a>
                    <a href="https://www.instagram.com/ncautoandhome/" class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-500 transition-all"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
            <div>
                <h5 class="text-white font-bold mb-6 tracking-wide">Contact</h5>
                <ul class="space-y-4 text-sm">
                    <li><a href="tel:3368351993" class="hover:text-white transition-colors flex items-center gap-2"><i class="fas fa-phone-alt text-blue-500"></i> (336) 835-1993</a></li>
                    <li class="flex items-start gap-2"><i class="fas fa-map-marker-alt text-blue-500 mt-1"></i> <span>1283 N Bridge St<br>Elkin, NC 28621</span></li>
                </ul>
            </div>
            <div>
                <h5 class="text-white font-bold mb-6 tracking-wide">Explore</h5>
                <ul class="space-y-3 text-sm">
                    <li><a href="pilot-mountain.html" class="hover:text-amber-400 transition-colors">Pilot Mountain</a></li>
                    <li><a href="mount-airy.html" class="hover:text-amber-400 transition-colors">Mount Airy</a></li>
                    <li><a href="wineries.html" class="hover:text-amber-400 transition-colors">Yadkin Valley Wineries</a></li>
                    <li><a href="elkin.html" class="hover:text-amber-400 transition-colors">Elkin</a></li>
                </ul>
            </div>
            <div>
                <h5 class="text-white font-bold mb-4 sm:mb-6 tracking-wide">Dobson Office <span class="text-xs normal-case">&#127474;&#127485;</span></h5>
                <ul class="space-y-3 text-sm">
                    <li><a href="../espanol/" class="hover:text-emerald-400 transition-colors font-bold">Se Habla Espa&ntilde;ol</a></li>
                    <li><a href="tel:3363562200" class="hover:text-white transition-colors flex items-center gap-2"><i class="fas fa-phone-alt text-emerald-500"></i> (336) 356-2200</a></li>
                    <li class="flex items-start gap-2"><i class="fas fa-map-marker-alt text-emerald-500 mt-1"></i> <span>209 S Main St<br>Dobson, NC 27017</span></li>
                </ul>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 border-t border-slate-800 pt-8">
            <p>&copy; 2026 Bill Layne Insurance Agency. All Rights Reserved. Licensed in North Carolina.</p>
        </div>
    </footer>

    <!-- Mobile Dock -->
    <div class="mobile-dock">
        <a href="tel:3368351993" class="dock-btn dock-call"><i class="fas fa-phone-alt"></i> Call</a>
        <a href="https://billlayneinsurance.com/get-quote" class="dock-btn dock-quote"><i class="fas fa-bolt"></i> Compare Rates</a>
        <button class="dock-btn dock-menu" onclick="toggleMobileDockMenu()"><i class="fas fa-bars"></i> Menu</button>
    </div>
    <div class="menu-overlay" id="mobileDockOverlay" onclick="toggleMobileDockMenu()"></div>
    <div class="menu-panel" id="mobileDockPanel">
        <div class="menu-handle"></div>
        <div class="menu-panel-header">
            <span class="menu-panel-title">Bill Layne Insurance</span>
            <button class="menu-close" onclick="toggleMobileDockMenu()"><i class="fas fa-times"></i></button>
        </div>
        <ul class="menu-links">
            <li><a href="https://www.billlayneinsurance.com"><span class="menu-icon blue"><i class="fas fa-home"></i></span> Home <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/areas-we-serve.html"><span class="menu-icon purple"><i class="fas fa-map-marked-alt"></i></span> Areas We Serve <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/auto-center/"><span class="menu-icon blue"><i class="fas fa-car"></i></span> Auto Insurance <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/home-insurance/"><span class="menu-icon green"><i class="fas fa-house"></i></span> Home Insurance <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/claims-center/"><span class="menu-icon red"><i class="fas fa-file-medical-alt"></i></span> Claims Center <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/resources/"><span class="menu-icon amber"><i class="fas fa-book"></i></span> Resources <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/blog/"><span class="menu-icon purple"><i class="fas fa-blog"></i></span> Blog <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/community/"><span class="menu-icon amber"><i class="fas fa-mountain"></i></span> Community <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/contact-us.html"><span class="menu-icon blue"><i class="fas fa-envelope"></i></span> Contact Us <i class="fas fa-chevron-right menu-arrow"></i></a></li>
            <li><a href="https://www.billlayneinsurance.com/espanol/"><span class="menu-icon green"><i class="fas fa-globe-americas"></i></span> Espa&ntilde;ol &#127474;&#127485; <i class="fas fa-chevron-right menu-arrow"></i></a></li>
        </ul>
    </div>

    <script>
    const menuToggle = document.getElementById('menu-toggle');
    const menuDrawer = document.getElementById('menu-drawer');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuClose = document.getElementById('menu-close');
    function openDrawer() {{ menuDrawer.classList.remove('translate-x-full'); menuOverlay.classList.remove('opacity-0','pointer-events-none'); }}
    function closeDrawer() {{ menuDrawer.classList.add('translate-x-full'); menuOverlay.classList.add('opacity-0','pointer-events-none'); }}
    if(menuToggle) menuToggle.addEventListener('click', openDrawer);
    if(menuClose) menuClose.addEventListener('click', closeDrawer);
    if(menuOverlay) menuOverlay.addEventListener('click', closeDrawer);
    const observer = new IntersectionObserver((entries) => {{
        entries.forEach(entry => {{ if (entry.isIntersecting) {{ entry.target.classList.add('active'); observer.unobserve(entry.target); }} }});
    }}, {{ threshold: 0.1 }});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    </script>
    <script defer src="../js/mobile-dock.js"></script>
</body>
</html>'''

for page in pages:
    breadcrumbs = build_breadcrumb(page)
    article_content = build_article_content(page)

    html = TEMPLATE.format(
        title=page['title'],
        meta_desc=page['meta_desc'],
        canonical=page['canonical'],
        og_title=page['og_title'],
        og_desc=page['og_desc'],
        og_image=page['og_image'],
        breadcrumb_name=page['breadcrumb_name'],
        badge=page['badge'],
        h1=page['h1'],
        schema=page['schema'],
        breadcrumbs=breadcrumbs,
        article_content=article_content,
    )

    filepath = os.path.join(BASE, page['file'])
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Created: {page['file']}")

print(f"\nDone! {len(pages)} pages created in {BASE}")
