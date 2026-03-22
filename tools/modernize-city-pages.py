#!/usr/bin/env python3
"""
modernize-city-pages.py — Generate modernized save-in-* city pages
using the Elkin page as a template, injecting city-specific content.
"""
import json
import os
import re

BASE_DIR = os.path.join(os.path.dirname(__file__), '..')

# Read the Elkin page as template
with open(os.path.join(BASE_DIR, 'save-in-elkin-nc', 'index.html'), 'r', encoding='utf-8') as f:
    TEMPLATE = f.read()

CITIES = {
    'save-in-dobson-nc': {
        'name': 'Dobson',
        'county': 'Surry County',
        'tagline': 'Save in Dobson NC',
        'lat': 36.3957,
        'lng': -80.7228,
        'zip': '27017',
        'description': 'Find the best deals, grocery savings, cheap gas, and money-saving resources in Dobson, North Carolina. Your complete Surry County seat guide from Bill Layne Insurance.',
        'og_desc': 'Your complete guide to saving money in Dobson NC, Surry County seat. Find grocery deals, cheap gas, and local resources.',
        'hero_subtitle': 'Grocery deals, county services, restaurant specials, and community resources in the Surry County seat. Plus, save on insurance with your local agent.',
        'trust_year': '2005',
        'stores': [
            {'name': 'Food Lion', 'address': '261 CC Camp Rd', 'hours': '7:00 AM - 10:00 PM', 'phone': '336-386-2787', 'color': 'green', 'badge': 'Open', 'deals': ['MVP Card savings on hundreds of items', 'Digital coupons in the Food Lion app', 'Weekly specials every Wednesday'], 'url': 'https://stores.foodlion.com/nc/dobson', 'btn_text': 'View Store'},
            {'name': 'Dollar General', 'address': '8493 W Main St', 'hours': '8:00 AM - 10:00 PM', 'phone': '336-356-8420', 'color': 'amber', 'badge': 'Open', 'deals': ['$5 off $25 Saturdays', 'Digital coupons in the DG app', 'DG Pickup available'], 'url': '', 'btn_text': ''},
            {'name': 'Family Dollar', 'address': '245 CC Camp Rd', 'hours': '8:00 AM - 9:00 PM', 'phone': '336-356-2090', 'color': 'purple', 'badge': 'Open', 'deals': ['Smart Coupons app savings', 'Weekly deals circular', '$1 items section'], 'url': '', 'btn_text': ''},
            {'name': 'Walmart (Elkin)', 'address': '548 CC Camp Rd, Elkin (8 mi)', 'hours': '6:00 AM - 11:00 PM', 'phone': '336-526-2636', 'color': 'blue', 'badge': '8 Miles', 'deals': ['Rollback prices daily', '$4 generic prescriptions', 'Free grocery pickup'], 'url': 'https://www.walmart.com/store/1337/elkin-nc', 'btn_text': 'Check Prices'},
        ],
        'restaurants': {
            'specials': [
                ('Tuesday', 'Kids Eat Free at multiple locations'),
                ('Weekdays', 'Lunch specials 11 AM - 2 PM'),
                ('Friday', 'Fish fry specials at local spots'),
            ],
            'favorites': [
                ('Harvest Grill', 'American cuisine'),
                ('Mi Pueblo', 'Mexican restaurant'),
                ('Pizza Plus', 'Local pizza favorite'),
            ]
        },
        'community': [
            {'name': 'Surry County Library', 'color': 'indigo', 'icon': 'book', 'address': 'Dobson Branch', 'items': [('wifi', 'Free WiFi &amp; computers'), ('child', 'Children\'s programs'), ('door-open', 'Meeting rooms')]},
            {'name': 'Fisher River Park', 'color': 'green', 'icon': 'tree', 'address': 'Dobson, NC', 'items': [('person-hiking', 'Walking trails'), ('fish', 'Fishing spots'), ('child-reaching', 'Playground')]},
            {'name': 'County Services', 'color': 'orange', 'icon': 'landmark', 'address': 'Multiple locations', 'items': [('building-columns', 'Courthouse - 201 E Kapp St'), ('id-card', 'DMV - 115 E Atkins St'), ('hand-holding-heart', 'Social Services - 118 Hamby Rd')]},
        ],
        'events': [
            {'name': 'Farmers Market', 'date': 'Saturdays May-Oct', 'location': 'Downtown &bull; 7AM-Noon', 'color': 'green', 'icon': 'carrot'},
            {'name': 'Surry County Fair', 'date': 'Sept 8-13, 2025', 'location': 'Farm Museum &bull; Tickets', 'color': 'orange', 'icon': 'ticket'},
            {'name': 'Christmas in Dobson', 'date': 'Dec 6, 2025', 'location': 'Town Square &bull; Free', 'color': 'red', 'icon': 'tree'},
        ],
        'gas_note': 'Marathon, Shell, and independent stations on Hwy 601.',
    },
    'save-in-mount-airy-nc': {
        'name': 'Mount Airy',
        'county': 'Surry County',
        'tagline': 'Save in Mount Airy NC',
        'lat': 36.4993,
        'lng': -80.6073,
        'zip': '27030',
        'description': 'Find the best deals, grocery savings, cheap gas, and money-saving resources in Mount Airy, North Carolina. Your complete Mayberry guide from Bill Layne Insurance.',
        'og_desc': 'Your complete guide to saving money in Mount Airy NC. Find grocery deals, cheap gas, Mayberry attractions, and local resources.',
        'hero_subtitle': 'Grocery deals, cheapest gas, Mayberry attractions, restaurant specials, and community resources. Plus, save on insurance with your local agent.',
        'trust_year': '2005',
        'stores': [
            {'name': 'Food Lion', 'address': '830 N Andy Griffith Pkwy', 'hours': '7:00 AM - 11:00 PM', 'phone': '336-786-2585', 'color': 'green', 'badge': 'Open', 'deals': ['MVP Card extra savings', 'Shop &amp; Earn gas rewards', 'Digital coupons in app'], 'url': '', 'btn_text': ''},
            {'name': 'Lowes Foods', 'address': '1795 N Andy Griffith Pkwy', 'hours': '6:00 AM - 11:00 PM', 'phone': '336-719-1700', 'color': 'blue', 'badge': 'Open', 'deals': ['Fresh Rewards Card', 'Gas Rewards program', 'Beer Den &amp; Wine Loft'], 'url': '', 'btn_text': ''},
            {'name': 'Harris Teeter', 'address': '2186 Rockford St', 'hours': '6:00 AM - 10:00 PM', 'phone': '336-789-9053', 'color': 'red', 'badge': 'Open', 'deals': ['e-VIC digital coupons', 'Fuel points program', 'Express Lane pickup'], 'url': '', 'btn_text': ''},
            {'name': 'Walmart Supercenter', 'address': '2241 Rockford St', 'hours': '24 Hours', 'phone': '336-719-2900', 'color': 'amber', 'badge': '24hr', 'deals': ['Rollback prices daily', '$4 generic prescriptions', 'Free grocery pickup'], 'url': 'https://www.walmart.com/store/1339/mount-airy-nc', 'btn_text': 'Check Prices'},
        ],
        'restaurants': {
            'specials': [
                ('Monday', 'Half price wings at 13 Bones'),
                ('Tuesday', 'Kids Eat Free at multiple locations'),
                ('Wednesday', 'Trivia night specials at The Loaded Goat'),
            ],
            'favorites': [
                ('Snappy Lunch', 'Famous pork chop sandwich'),
                ('13 Bones', 'BBQ &amp; live music'),
                ('The Loaded Goat', 'Gastropub &amp; brewery'),
            ]
        },
        'community': [
            {'name': 'Public Library', 'color': 'indigo', 'icon': 'book', 'address': '218 Rockford Street', 'items': [('wifi', 'Free WiFi &amp; computers'), ('child', 'Children\'s programs'), ('ticket', 'Free museum passes')]},
            {'name': 'Riverside Park', 'color': 'green', 'icon': 'tree', 'address': 'Ararat River Greenway', 'items': [('bicycle', 'Biking &amp; walking trails'), ('child-reaching', 'Playgrounds'), ('music', 'Free summer concerts')]},
            {'name': 'Mayberry Attractions', 'color': 'orange', 'icon': 'camera', 'address': 'Downtown Mount Airy', 'items': [('landmark', 'Andy Griffith Museum'), ('route', 'Historic walking tour'), ('car-side', 'Squad car tours')]},
        ],
        'events': [
            {'name': 'Mayberry Days', 'date': 'Sept 26-29, 2025', 'location': 'Downtown &bull; Festival', 'color': 'orange', 'icon': 'star'},
            {'name': 'Autumn Leaves', 'date': 'Oct 10-12, 2025', 'location': 'Downtown &bull; Arts &amp; Crafts', 'color': 'amber', 'icon': 'leaf'},
            {'name': 'Farmers Market', 'date': 'Every Saturday', 'location': 'Downtown &bull; 7AM-Noon', 'color': 'green', 'icon': 'carrot'},
        ],
        'gas_note': 'Sheetz and Circle K often have lowest prices. Use Harris Teeter &amp; Lowes Foods fuel points.',
    },
    'save-in-jonesville-nc': {
        'name': 'Jonesville',
        'county': 'Yadkin County',
        'tagline': 'Save in Jonesville NC',
        'lat': 36.2387,
        'lng': -80.8445,
        'zip': '28642',
        'description': 'Find the best deals, grocery savings, cheap gas, and money-saving resources in Jonesville, North Carolina. Your complete I-77 corridor guide from Bill Layne Insurance.',
        'og_desc': 'Your complete guide to saving money in Jonesville NC. Find grocery deals, I-77 services, and local resources.',
        'hero_subtitle': 'Grocery deals, I-77 traveler services, restaurant specials, and community resources. Plus, save on insurance with your local agent.',
        'trust_year': '2005',
        'stores': [
            {'name': 'Food Lion', 'address': '1550 NC-67', 'hours': '7:00 AM - 10:00 PM', 'phone': '336-526-0707', 'color': 'green', 'badge': 'Open', 'deals': ['MVP Card savings', 'Digital coupons in app', 'Weekly specials'], 'url': '', 'btn_text': ''},
            {'name': 'Dollar General', 'address': '902 Winston Rd', 'hours': '8:00 AM - 10:00 PM', 'phone': '336-674-0025', 'color': 'amber', 'badge': 'Open', 'deals': ['$5 off $25 Saturdays', 'Digital coupons', 'DG Pickup'], 'url': '', 'btn_text': ''},
            {'name': 'Family Dollar', 'address': '714 Winston Rd', 'hours': '8:00 AM - 9:00 PM', 'phone': '336-526-1446', 'color': 'purple', 'badge': 'Open', 'deals': ['Smart Coupons program', 'Weekly deals', 'Household essentials'], 'url': '', 'btn_text': ''},
            {'name': 'Rite Aid', 'address': '1525 NC-67', 'hours': '8:00 AM - 9:00 PM', 'phone': '336-526-8255', 'color': 'blue', 'badge': 'Pharmacy', 'deals': ['Wellness+ rewards', 'Pharmacy services', 'Weekly ad deals'], 'url': '', 'btn_text': ''},
        ],
        'restaurants': {
            'specials': [
                ('Monday', 'Pizza Hut buffet lunch'),
                ('Tuesday', 'Bojangles 2-piece special'),
                ('Friday', "Speedy's fish special"),
            ],
            'favorites': [
                ("Speedy's Restaurant", 'Family dining'),
                ('Bojangles', 'Southern chicken'),
                ('The Depot', 'Local favorite'),
            ]
        },
        'community': [
            {'name': 'Jonesville Library', 'color': 'indigo', 'icon': 'book', 'address': 'Jonesville, NC', 'items': [('wifi', 'Free WiFi &amp; computers'), ('child', 'Children\'s programs'), ('book-open', 'Book clubs')]},
            {'name': 'Jonesville Park', 'color': 'green', 'icon': 'tree', 'address': 'Town Park', 'items': [('person-hiking', 'Walking trails'), ('baseball', 'Baseball fields'), ('child-reaching', 'Playground')]},
            {'name': 'Food Assistance', 'color': 'orange', 'icon': 'hands-helping', 'address': 'Multiple locations', 'items': [('heart', 'Food pantry'), ('church', 'Church food banks'), ('truck', 'Meals on Wheels')]},
        ],
        'events': [
            {'name': 'Summer Concerts', 'date': 'June-August', 'location': 'Town Park &bull; Fridays', 'color': 'purple', 'icon': 'music'},
            {'name': 'Fall Festival', 'date': 'Oct 18, 2025', 'location': 'Town Park &bull; Crafts', 'color': 'orange', 'icon': 'leaf'},
            {'name': 'Christmas Parade', 'date': 'Dec 7, 2025', 'location': 'Downtown &bull; Free', 'color': 'red', 'icon': 'tree'},
        ],
        'gas_note': 'Shell, Speedway, BP at I-77 Exit 82. Convenient for travelers.',
    },
    'save-in-wilkesboro-nc': {
        'name': 'Wilkesboro',
        'county': 'Wilkes County',
        'tagline': 'Save in Wilkesboro NC',
        'lat': 36.1460,
        'lng': -81.1607,
        'zip': '28697',
        'description': 'Find the best deals, grocery savings, cheap gas, and money-saving resources in Wilkesboro, North Carolina. Your complete Wilkes County guide from Bill Layne Insurance.',
        'og_desc': 'Your complete guide to saving money in Wilkesboro NC. Find grocery deals, MerleFest info, and local resources.',
        'hero_subtitle': 'Grocery deals, cheapest gas, MerleFest info, restaurant specials, and community resources. Plus, save on insurance with your local agent.',
        'trust_year': '2005',
        'stores': [
            {'name': 'Lowes Foods', 'address': '259 River St', 'hours': '6:00 AM - 10:00 PM', 'phone': '336-667-9622', 'color': 'blue', 'badge': 'Open', 'deals': ['Gas rewards program', 'Digital coupons', 'Beer Den &amp; Wine Shop'], 'url': '', 'btn_text': ''},
            {'name': 'Harris Teeter', 'address': '1838 US-421', 'hours': '6:00 AM - 10:00 PM', 'phone': '336-838-2000', 'color': 'red', 'badge': 'Open', 'deals': ['Double coupons', 'Fuel points program', 'e-VIC digital deals'], 'url': '', 'btn_text': ''},
            {'name': 'Walmart Supercenter', 'address': '1801 US-421', 'hours': '6:00 AM - 11:00 PM', 'phone': '336-667-1885', 'color': 'amber', 'badge': 'Open', 'deals': ['Rollback prices daily', '$4 generic prescriptions', 'Free grocery pickup'], 'url': 'https://www.walmart.com/store/1425/north-wilkesboro-nc', 'btn_text': 'Check Prices'},
            {'name': 'Food Lion', 'address': 'Multiple Locations', 'hours': '7:00 AM - 10:00 PM', 'phone': '', 'color': 'green', 'badge': 'Multiple', 'deals': ['MVP Card savings', 'Digital coupons', 'Weekly specials'], 'url': '', 'btn_text': ''},
        ],
        'restaurants': {
            'specials': [
                ('Thursday', 'BBQ plate specials'),
                ('Tuesday', 'Kids Eat Free at multiple locations'),
                ('Friday', 'Fish fry specials'),
            ],
            'favorites': [
                ('Brushy Mountain Smokehouse', 'BBQ'),
                ('Havana Caf&eacute;', 'Cuban food'),
                ("Dooley's Grill &amp; Tavern", 'Steaks'),
            ]
        },
        'community': [
            {'name': 'Public Library', 'color': 'indigo', 'icon': 'book', 'address': '215 10th St', 'items': [('wifi', 'Free WiFi &amp; computers'), ('child', 'Children\'s programs'), ('door-open', 'Meeting rooms')]},
            {'name': 'Parks &amp; YMCA', 'color': 'green', 'icon': 'dumbbell', 'address': 'Multiple locations', 'items': [('person-hiking', 'Walking trails'), ('person-swimming', 'YMCA pool - 602 S College'), ('child-reaching', 'Youth sports')]},
            {'name': 'Health &amp; Senior', 'color': 'orange', 'icon': 'hospital', 'address': 'Wilkes Medical Center', 'items': [('kit-medical', '24/7 Emergency - 1370 West D St'), ('truck', 'Meals on Wheels'), ('hand-holding-heart', 'Crisis Ministry')]},
        ],
        'events': [
            {'name': 'MerleFest', 'date': 'Apr 24-27, 2025', 'location': 'WCC Campus &bull; Tickets', 'color': 'purple', 'icon': 'guitar'},
            {'name': 'Carolina in Fall', 'date': 'Sept 20-21, 2025', 'location': 'Downtown &bull; Festival', 'color': 'orange', 'icon': 'leaf'},
            {'name': 'Farmers Market', 'date': 'Saturdays May-Oct', 'location': 'Downtown &bull; 7AM-Noon', 'color': 'green', 'icon': 'carrot'},
        ],
        'gas_note': 'Shell, BP, Speedway, Sheetz on US-421.',
    },
    'save-in-yadkinville-nc': {
        'name': 'Yadkinville',
        'county': 'Yadkin County',
        'tagline': 'Save in Yadkinville NC',
        'lat': 36.1335,
        'lng': -80.6595,
        'zip': '27055',
        'description': 'Find the best deals, grocery savings, cheap gas, and money-saving resources in Yadkinville, North Carolina. Your complete Yadkin County seat guide from Bill Layne Insurance.',
        'og_desc': 'Your complete guide to saving money in Yadkinville NC, Yadkin County seat. Find grocery deals, cheap gas, and local resources.',
        'hero_subtitle': 'Grocery deals, county services, restaurant specials, and wine country resources in the Yadkin County seat. Plus, save on insurance.',
        'trust_year': '2005',
        'stores': [
            {'name': 'Food Lion', 'address': '1804 US Hwy 601', 'hours': '7:00 AM - 10:00 PM', 'phone': '336-679-8488', 'color': 'green', 'badge': 'Open', 'deals': ['MVP Card savings', 'Digital coupons in app', 'Weekly specials'], 'url': '', 'btn_text': ''},
            {'name': 'Piggly Wiggly', 'address': '601 E Main St', 'hours': '7:00 AM - 9:00 PM', 'phone': '336-679-3222', 'color': 'red', 'badge': 'Local', 'deals': ['Weekly specials', 'Fresh meat &amp; produce', 'Local products'], 'url': '', 'btn_text': ''},
            {'name': 'Dollar General', 'address': '1205 E Main St', 'hours': '8:00 AM - 10:00 PM', 'phone': '336-677-0070', 'color': 'amber', 'badge': 'Open', 'deals': ['$5 off $25 Saturdays', 'Digital coupons', 'DG Pickup'], 'url': '', 'btn_text': ''},
            {'name': 'CVS Pharmacy', 'address': '713 E Main St', 'hours': '8:00 AM - 9:00 PM', 'phone': '', 'color': 'blue', 'badge': 'Pharmacy', 'deals': ['ExtraCare rewards', '$4 generics', 'Digital coupons'], 'url': '', 'btn_text': ''},
        ],
        'restaurants': {
            'specials': [
                ('Thursday', 'BBQ plate specials at George\'s'),
                ('Tuesday', 'Kids Eat Free at multiple locations'),
                ('Sunday', 'Family meal deals'),
            ],
            'favorites': [
                ('George\'s BBQ', 'Local barbecue legend'),
                ('El Mariachi', 'Mexican cuisine'),
                ('Village Pizza', 'Pizza &amp; Italian'),
            ]
        },
        'community': [
            {'name': 'Yadkin County Library', 'color': 'indigo', 'icon': 'book', 'address': 'Yadkinville Branch', 'items': [('wifi', 'Free WiFi &amp; computers'), ('child', 'Children\'s programs'), ('door-open', 'Meeting rooms')]},
            {'name': 'Memorial Park', 'color': 'green', 'icon': 'tree', 'address': 'Yadkinville, NC', 'items': [('person-hiking', 'Walking trails'), ('table-tennis-paddle-ball', 'Tennis courts'), ('child-reaching', 'Playground')]},
            {'name': 'County Services', 'color': 'orange', 'icon': 'landmark', 'address': 'Multiple locations', 'items': [('building-columns', 'Courthouse - 150 E Elm St'), ('id-card', 'DMV - 217 E Willow St'), ('hand-holding-heart', 'Social Services - 1045 E Main')]},
        ],
        'events': [
            {'name': 'Wine Festival', 'date': 'May 17-18, 2025', 'location': 'Local Wineries &bull; Tasting', 'color': 'purple', 'icon': 'wine-glass'},
            {'name': 'Harvest Festival', 'date': 'Oct 11, 2025', 'location': 'Downtown &bull; Vendors', 'color': 'orange', 'icon': 'leaf'},
            {'name': 'Farmers Market', 'date': 'Saturdays May-Oct', 'location': 'Downtown &bull; 8AM-Noon', 'color': 'green', 'icon': 'carrot'},
        ],
        'gas_note': 'Shell, BP, Speedway on US-601 and US-421.',
    },
}


def build_store_cards(stores):
    cards = []
    for s in stores:
        c = s['color']
        phone_line = f'<p><i class="fas fa-phone text-{c}-600 mr-2 w-4"></i>{s["phone"]}</p>' if s['phone'] else ''
        deals = '\n'.join(f'                                        <li><i class="fas fa-check text-{c}-500 mr-1"></i> {d}</li>' for d in s['deals'])
        btn = ''
        if s.get('url') and s.get('btn_text'):
            btn = f'\n                                <a href="{s["url"]}" target="_blank" class="block w-full bg-{c}-600 text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-{c}-700 transition-colors">{s["btn_text"]} <i class="fas fa-external-link-alt ml-1 text-xs"></i></a>'

        card = f'''                            <div class="bg-{c}-50 p-4 md:p-6 rounded-2xl border border-{c}-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div class="flex justify-between items-start mb-3">
                                    <h3 class="text-lg font-bold text-{c}-900">{s['name']}</h3>
                                    <span class="bg-{c}-200 text-{c}-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{s['badge']}</span>
                                </div>
                                <div class="space-y-1.5 text-sm text-{c}-800 mb-4">
                                    <p><i class="fas fa-map-marker-alt text-{c}-600 mr-2 w-4"></i>{s['address']}</p>
                                    <p><i class="fas fa-clock text-{c}-600 mr-2 w-4"></i>{s['hours']}</p>
                                    {phone_line}
                                </div>
                                <div class="bg-white rounded-xl p-3 mb-4 border border-{c}-100">
                                    <h4 class="font-bold text-{c}-800 text-sm mb-2"><i class="fas fa-tag mr-1"></i> Deals &amp; Programs</h4>
                                    <ul class="text-xs text-{c}-700 space-y-1">
{deals}
                                    </ul>
                                </div>{btn}
                            </div>'''
        cards.append(card)
    return '\n\n'.join(cards)


def build_restaurant_section(data):
    specials = '\n'.join(f'                                    <li class="flex items-start gap-2"><i class="fas fa-check text-purple-400 mt-0.5"></i><span><strong>{day}:</strong> {desc}</span></li>' for day, desc in data['specials'])
    favs = '\n'.join(f'                                    <li class="flex items-start gap-2"><i class="fas fa-star text-amber-400 mt-0.5"></i><span>{name} &mdash; {desc}</span></li>' for name, desc in data['favorites'])
    return f'''                        <div class="grid md:grid-cols-2 gap-4 md:gap-6">
                            <div class="bg-purple-50 p-4 md:p-6 rounded-2xl border border-purple-100">
                                <h3 class="font-bold text-purple-900 mb-3 flex items-center gap-2"><i class="fas fa-calendar-day text-purple-500"></i> Daily Specials</h3>
                                <ul class="space-y-2 text-sm text-purple-800">
{specials}
                                </ul>
                            </div>
                            <div class="bg-amber-50 p-4 md:p-6 rounded-2xl border border-amber-100">
                                <h3 class="font-bold text-amber-900 mb-3 flex items-center gap-2"><i class="fas fa-star text-amber-500"></i> Local Favorites</h3>
                                <ul class="space-y-2 text-sm text-amber-800">
{favs}
                                </ul>
                            </div>
                        </div>'''


def build_community_section(items):
    cards = []
    for item in items:
        c = item['color']
        sub_items = '\n'.join(f'                                    <li><i class="fas fa-{icon} text-{c}-400 mr-1"></i> {text}</li>' for icon, text in item['items'])
        card = f'''                            <div class="bg-{c}-50 p-4 md:p-6 rounded-2xl border border-{c}-100">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="w-9 h-9 rounded-full bg-{c}-100 flex items-center justify-center text-{c}-600"><i class="fas fa-{item['icon']}"></i></div>
                                    <h3 class="font-bold text-{c}-900">{item['name']}</h3>
                                </div>
                                <p class="text-sm text-{c}-800 mb-2">{item['address']}</p>
                                <ul class="text-xs text-{c}-700 space-y-1">
{sub_items}
                                </ul>
                            </div>'''
        cards.append(card)
    return '\n'.join(cards)


def build_events_section(events):
    cards = []
    for ev in events:
        c = ev['color']
        card = f'''                            <div class="bg-{c}-50 p-3 md:p-6 rounded-2xl border border-{c}-100 text-center">
                                <div class="w-10 h-10 md:w-14 md:h-14 bg-{c}-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4"><i class="fas fa-{ev['icon']} text-{c}-600 text-lg md:text-2xl"></i></div>
                                <h3 class="font-bold text-{c}-900 text-sm md:text-base mb-1">{ev['name']}</h3>
                                <p class="text-{c}-600 font-bold text-xs mb-1">{ev['date']}</p>
                                <p class="text-[10px] md:text-xs text-{c}-700">{ev['location']}</p>
                            </div>'''
        cards.append(card)
    return '\n'.join(cards)


def build_sidebar_stores(stores):
    items = []
    for s in stores[:3]:
        c = s['color']
        label = s['deals'][0].split(' ')[0] if s['deals'] else 'Deals'
        items.append(f'''                            <a href="#{s['name'].lower().replace(' ', '-').replace('(', '').replace(')', '')}" class="flex items-center justify-between p-2.5 bg-{c}-50 rounded-xl hover:bg-{c}-100 transition-colors border border-{c}-100">
                                <span class="font-bold text-{c}-800 text-sm">{s['name']}</span>
                                <span class="text-[10px] bg-{c}-100 text-{c}-700 px-2 py-0.5 rounded-full font-bold">{s['badge']}</span>
                            </a>''')
    return '\n'.join(items)


def build_schema(slug, city):
    name = city['name']
    store_items = []
    for i, s in enumerate(city['stores']):
        item = {"@type": "ListItem", "position": i+1, "name": f"{s['name']} - {s['address']}, {name} NC"}
        if s.get('url'):
            item['url'] = s['url']
        store_items.append(item)

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "name": f"Save Money in {name} NC - Local Deals & Resources",
                "description": city['description'][:160],
                "url": f"https://www.billlayneinsurance.com/{slug}/",
                "isPartOf": {"@type": "WebSite", "name": "Bill Layne Insurance Agency", "url": "https://www.billlayneinsurance.com/"},
                "about": {
                    "@type": "City",
                    "name": name,
                    "containedInPlace": {"@type": "AdministrativeArea", "name": f"{city['county']}, North Carolina"}
                },
                "publisher": {
                    "@type": "InsuranceAgency",
                    "name": "Bill Layne Insurance Agency",
                    "telephone": "(336) 835-1993",
                    "url": "https://www.billlayneinsurance.com/",
                    "address": {"@type": "PostalAddress", "streetAddress": "1283 N Bridge St", "addressLocality": "Elkin", "addressRegion": "NC", "postalCode": "28621", "addressCountry": "US"},
                    "geo": {"@type": "GeoCoordinates", "latitude": city['lat'], "longitude": city['lng']}
                }
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.billlayneinsurance.com/"},
                    {"@type": "ListItem", "position": 2, "name": "Areas We Serve", "item": "https://www.billlayneinsurance.com/areas-we-serve"},
                    {"@type": "ListItem", "position": 3, "name": f"{name} NC", "item": f"https://www.billlayneinsurance.com/{slug}/"}
                ]
            },
            {
                "@type": "ItemList",
                "name": f"Stores in {name} NC",
                "itemListElement": store_items
            }
        ]
    }
    return json.dumps(schema, indent=4, ensure_ascii=False)


def generate_page(slug, city):
    """Generate a modernized city page based on the Elkin template."""
    name = city['name']

    # Build all the dynamic sections
    store_cards = build_store_cards(city['stores'])
    restaurant_html = build_restaurant_section(city['restaurants'])
    community_html = build_community_section(city['community'])
    events_html = build_events_section(city['events'])
    sidebar_stores = build_sidebar_stores(city['stores'])
    schema_json = build_schema(slug, city)

    # Start with the Elkin template and replace city-specific content
    page = TEMPLATE

    # Title and meta
    page = page.replace('Save Money in Elkin NC | Bill Layne Insurance - Local Deals & Resources',
                         f'Save Money in {name} NC | Bill Layne Insurance - Local Deals & Resources')
    page = page.replace('Find the best deals, grocery savings, cheap gas, and money-saving resources in Elkin, North Carolina. Your complete guide from Bill Layne Insurance.',
                         city['description'])
    page = page.replace('Elkin NC deals, save money Elkin, Bill Layne Insurance, cheap gas Elkin NC, grocery deals Elkin, Surry County savings',
                         f'{name} NC deals, save money {name}, Bill Layne Insurance, cheap gas {name} NC, grocery deals {name}, {city["county"]} savings')

    # Geo tags
    page = page.replace('Elkin, North Carolina', f'{name}, North Carolina')
    page = page.replace('36.2459;-80.8492', f'{city["lat"]};{city["lng"]}')

    # OG tags
    page = page.replace('Save Money in Elkin NC - Bill Layne Insurance', f'Save Money in {name} NC - Bill Layne Insurance')
    page = page.replace('Your complete guide to saving money in Elkin NC. Find grocery deals, cheap gas, and local resources.', city['og_desc'])
    page = page.replace('/save-in-elkin-nc/', f'/{slug}/')
    page = page.replace('Find the best deals, grocery savings, cheap gas, and money-saving resources in Elkin, North Carolina.', city['description'][:160])

    # Nav tagline
    page = page.replace('Save in Elkin NC', city['tagline'])

    # Hero
    page = page.replace('Elkin, NC</span>', f'{name}, NC</span>')
    page = page.replace('Save Money in<br>', 'Save Money in<br>')
    page = page.replace(
        'Grocery deals, cheapest gas, restaurant specials, and community resources. Plus, save on insurance with your local independent agent.',
        city['hero_subtitle']
    )
    page = page.replace('Serving Elkin Since 2005', f'Serving {name} Since {city["trust_year"]}')

    # Breadcrumb visible
    page = page.replace('<li class="text-white font-medium">Elkin NC</li>', f'<li class="text-white font-medium">{name} NC</li>')

    # Section headers
    page = page.replace("Grocery Stores &amp; Deals", f"Grocery Stores &amp; Deals")
    page = page.replace("Weekly savings at Elkin's top stores.", f"Weekly savings at {name}'s top stores.")
    page = page.replace("Find Cheapest Gas", "Find Cheapest Gas")
    page = page.replace("Compare real-time prices in Elkin.", f"Compare real-time prices in {name}.")
    page = page.replace("Free Community Resources", "Free Community Resources")
    page = page.replace("Services available to Elkin residents.", f"Services available to {name} residents.")
    page = page.replace(f"Upcoming Elkin Events", f"Upcoming {name} Events")

    # Replace store cards section
    store_section_start = '                            <!-- Food Lion -->'
    store_section_end = '                        </div>\n                    </div>'
    # Find the grocery section store cards and replace
    grocery_start = page.find('<div id="food-lion"')
    if grocery_start == -1:
        grocery_start = page.find('<!-- Food Lion -->')
    grocery_grid_start = page.rfind('<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">', 0, grocery_start)
    grocery_grid_end = page.find('</div>\n                    </div>\n\n                    <!-- Gas Section -->')
    if grocery_grid_start > 0 and grocery_grid_end > 0:
        page = page[:grocery_grid_start] + f'<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">\n{store_cards}\n                        </div>\n                    </div>\n\n                    <!-- Gas Section -->' + page[grocery_grid_end + len('</div>\n                    </div>\n\n                    <!-- Gas Section -->'):]

    # Replace gas section note
    page = page.replace('Monday mornings typically have the lowest prices in Elkin.',
                         f'Monday mornings typically have the lowest prices in {name}.')
    page = page.replace('Use Ingles fuel points or Food Lion Shop &amp; Earn for extra savings.',
                         city['gas_note'])

    # Replace restaurant section
    rest_start = page.find('<div class="grid md:grid-cols-2 gap-4 md:gap-6">\n                            <div class="bg-purple-50')
    rest_end = page.find('</div>\n                    </div>\n\n                    <!-- Community Resources -->')
    if rest_start > 0 and rest_end > 0:
        page = page[:rest_start] + restaurant_html + '\n                    </div>\n\n                    <!-- Community Resources -->' + page[rest_end + len('</div>\n                    </div>\n\n                    <!-- Community Resources -->'):]

    # Replace community section
    comm_start = page.find('<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">')
    comm_end = page.find('</div>\n                    </div>\n\n                    <!-- Events -->')
    if comm_start > 0 and comm_end > 0:
        page = page[:comm_start] + f'<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">\n{community_html}\n                        </div>\n                    </div>\n\n                    <!-- Events -->' + page[comm_end + len('</div>\n                    </div>\n\n                    <!-- Events -->'):]

    # Replace events section
    events_start = page.find('<div class="grid grid-cols-3 gap-3 md:gap-6">')
    events_end = page.find('</div>\n                    </div>\n\n                    <!-- Insurance CTA -->')
    if events_start > 0 and events_end > 0:
        page = page[:events_start] + f'<div class="grid grid-cols-3 gap-3 md:gap-6">\n{events_html}\n                        </div>\n                    </div>\n\n                    <!-- Insurance CTA -->' + page[events_end + len('</div>\n                    </div>\n\n                    <!-- Insurance CTA -->'):]

    # Replace insurance CTA text
    page = page.replace('The average Elkin family saves', f'The average {name} family saves')

    # Replace sidebar stores
    sidebar_start = page.find('<a href="#food-lion"')
    if sidebar_start == -1:
        # Try alternate pattern
        sidebar_start = page.find('class="flex items-center justify-between p-2.5 bg-green-50')
    sidebar_end_marker = '<!-- Important Numbers -->'
    sidebar_end = page.find(sidebar_end_marker)
    if sidebar_start > 0 and sidebar_end > 0:
        # Find the start of the store links container
        container_start = page.rfind('<div class="space-y-2 mb-6">', 0, sidebar_start)
        if container_start > 0:
            page = page[:container_start] + f'<div class="space-y-2 mb-6">\n{sidebar_stores}\n                        </div>\n\n                        {sidebar_end_marker}' + page[sidebar_end + len(sidebar_end_marker):]

    # Replace schema
    schema_start = page.find('<!-- Schema -->\n    <script type="application/ld+json">')
    schema_end = page.find('</script>\n\n    <!-- DOCK SPACER -->')
    if schema_start > 0 and schema_end > 0:
        page = page[:schema_start] + f'<!-- Schema -->\n    <script type="application/ld+json">\n{schema_json}\n    </script>\n\n    <!-- DOCK SPACER -->' + page[schema_end + len('</script>\n\n    <!-- DOCK SPACER -->'):]

    return page


def main():
    for slug, city in CITIES.items():
        filepath = os.path.join(BASE_DIR, slug, 'index.html')
        page = generate_page(slug, city)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(page)
        print(f'Generated: {slug}/index.html ({len(page)} chars)')

    print(f'\nAll {len(CITIES)} city pages modernized.')


if __name__ == '__main__':
    main()
