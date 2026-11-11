(function () {
    'use strict';
    var form = document.getElementById('area-search-form');
    var input = document.getElementById('locationSearch');
    var section = document.getElementById('areas-results');
    var list = document.getElementById('areas-search-results');
    var status = document.getElementById('areas-feedback');
    var clear = document.getElementById('areas-clear');
    var empty = document.getElementById('areas-no-results');
    var matchBox = document.getElementById('areas-local-match');
    var heading = document.getElementById('areas-results-title');
    if (!form || !input || !section || !list || !status || !clear || !empty || !heading) return;

    var rows = Array.from(list.querySelectorAll('[data-area-name]'));
    var timer;

    // Compact statewide NC lookup: [Place/County, County Label, Corridor, NCRB Territory, Optional Guide URL]
    var NC_PLACES = [
        ['Chapel Hill', 'Orange / Durham County', 'Triangle Corridor', '280 / 270', ''],
        ['Carrboro', 'Orange County', 'Triangle Corridor', '280', ''],
        ['Hillsborough', 'Orange County', 'Triangle Corridor', '280', ''],
        ['Mebane', 'Alamance / Orange County', 'Triangle & Piedmont Corridor', '280 / 310', ''],
        ['Durham', 'Durham County', 'Triangle Corridor', '270', ''],
        ['Raleigh', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Cary', 'Wake / Chatham County', 'Triangle Corridor', '270 / 280', ''],
        ['Apex', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Holly Springs', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Fuquay-Varina', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Wake Forest', 'Wake / Franklin County', 'Triangle Corridor', '270 / 260', ''],
        ['Garner', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Morrisville', 'Wake / Durham County', 'Triangle Corridor', '270', ''],
        ['Knightdale', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Wendell', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Zebulon', 'Wake County', 'Triangle Corridor', '270', ''],
        ['Pittsboro', 'Chatham County', 'Triangle Corridor', '280', ''],
        ['Siler City', 'Chatham County', 'Triangle Corridor', '280', ''],
        ['Charlotte', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Huntersville', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Cornelius', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Davidson', 'Mecklenburg / Iredell County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Matthews', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Mint Hill', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Pineville', 'Mecklenburg County', 'Charlotte Metro & Lake Norman', '340', '/insurance-charlotte-nc'],
        ['Concord', 'Cabarrus County', 'Charlotte Metro & Lake Norman', '340', '/insurance-concord-nc'],
        ['Kannapolis', 'Cabarrus / Rowan County', 'Charlotte Metro & I-85', '340', '/insurance-concord-nc'],
        ['Harrisburg', 'Cabarrus County', 'Charlotte Metro & I-85', '340', '/insurance-concord-nc'],
        ['Indian Trail', 'Union County', 'Charlotte Metro', '340', '/insurance-charlotte-nc'],
        ['Waxhaw', 'Union County', 'Charlotte Metro', '340', '/insurance-charlotte-nc'],
        ['Monroe', 'Union County', 'Charlotte Metro', '340', '/insurance-charlotte-nc'],
        ['Stallings', 'Union / Mecklenburg County', 'Charlotte Metro', '340', '/insurance-charlotte-nc'],
        ['Mooresville', 'Iredell County', 'Lake Norman & I-77', '340', '/insurance-charlotte-nc'],
        ['Statesville', 'Iredell County', 'Lake Norman & I-77', '340', ''],
        ['Troutman', 'Iredell County', 'Lake Norman & I-77', '340', ''],
        ['Union Grove', 'Iredell County', 'Yadkin Valley & Foothills', '340', ''],
        ['Gastonia', 'Gaston County', 'Charlotte Metro West', '340', ''],
        ['Belmont', 'Gaston County', 'Charlotte Metro West', '340', ''],
        ['Mount Holly', 'Gaston County', 'Charlotte Metro West', '340', ''],
        ['Denver', 'Lincoln County', 'Lake Norman West', '350', ''],
        ['Lincolnton', 'Lincoln County', 'Charlotte Metro West', '350', ''],
        ['Salisbury', 'Rowan County', 'I-85 Corridor', '340', ''],
        ['Albemarle', 'Stanly County', 'Charlotte Metro East', '320', ''],
        ['Shelby', 'Cleveland County', 'Foothills South', '350', ''],
        ['Winston-Salem', 'Forsyth County', 'Piedmont Triad', '310', ''],
        ['Greensboro', 'Guilford County', 'Piedmont Triad', '310', ''],
        ['High Point', 'Guilford / Forsyth / Randolph County', 'Piedmont Triad', '310', ''],
        ['Kernersville', 'Forsyth / Guilford County', 'Piedmont Triad', '310', ''],
        ['Clemmons', 'Forsyth County', 'Piedmont Triad', '310', ''],
        ['Lewisville', 'Forsyth County', 'Piedmont Triad', '310', ''],
        ['Burlington', 'Alamance County', 'Piedmont Triad & I-85/I-40', '310', ''],
        ['Graham', 'Alamance County', 'Piedmont Triad & I-85/I-40', '310', ''],
        ['Asheboro', 'Randolph County', 'Piedmont Triad South', '320', ''],
        ['Lexington', 'Davidson County', 'Piedmont Triad', '320', ''],
        ['Thomasville', 'Davidson County', 'Piedmont Triad', '320', ''],
        ['Mocksville', 'Davie County', 'Piedmont Triad West', '320', ''],
        ['Advance', 'Davie County', 'Piedmont Triad West', '320', ''],
        ['Reidsville', 'Rockingham County', 'Piedmont Triad North', '310', ''],
        ['Eden', 'Rockingham County', 'Piedmont Triad North', '310', ''],
        ['Elkin', 'Surry / Wilkes County', 'Yadkin Valley & Foothills (Home Office)', '360', '/insurance-elkin-nc'],
        ['Dobson', 'Surry County', 'Yadkin Valley & Foothills (Bilingual Office)', '360', '/insurance-dobson-nc'],
        ['Mount Airy', 'Surry County', 'Yadkin Valley & Foothills', '360', '/insurance-mount-airy-nc'],
        ['Pilot Mountain', 'Surry County', 'Yadkin Valley & Foothills', '360', '/insurance-pilot-mountain-nc'],
        ['Toast', 'Surry County', 'Yadkin Valley & Foothills', '360', '/insurance-mount-airy-nc'],
        ['White Plains', 'Surry County', 'Yadkin Valley & Foothills', '360', '/insurance-mount-airy-nc'],
        ['Jonesville', 'Yadkin County', 'Yadkin Valley & Foothills', '360', '/insurance-jonesville-nc'],
        ['Yadkinville', 'Yadkin County', 'Yadkin Valley & Foothills', '360', '/insurance-jonesville-nc'],
        ['Boonville', 'Yadkin County', 'Yadkin Valley & Foothills', '360', '/insurance-jonesville-nc'],
        ['East Bend', 'Yadkin County', 'Yadkin Valley & Foothills', '360', '/insurance-jonesville-nc'],
        ['Hamptonville', 'Yadkin County', 'Yadkin Valley & Foothills', '360', '/insurance-jonesville-nc'],
        ['King', 'Stokes / Forsyth County', 'Yadkin Valley & US-52 Corridor', '310', '/insurance-king-nc'],
        ['Danbury', 'Stokes County', 'Yadkin Valley & Foothills', '310', '/insurance-king-nc'],
        ['Walnut Cove', 'Stokes County', 'Yadkin Valley & Foothills', '310', '/insurance-king-nc'],
        ['Pinnacle', 'Stokes County', 'Yadkin Valley & Foothills', '310', '/insurance-pilot-mountain-nc'],
        ['Germanton', 'Stokes / Forsyth County', 'Yadkin Valley & Foothills', '310', '/insurance-king-nc'],
        ['Wilkesboro', 'Wilkes County', 'Yadkin Valley & Foothills', '360', ''],
        ['North Wilkesboro', 'Wilkes County', 'Yadkin Valley & Foothills', '360', ''],
        ['Ronda', 'Wilkes County', 'Yadkin Valley & Foothills', '360', ''],
        ['Traphill', 'Wilkes County', 'Yadkin Valley & Foothills', '360', ''],
        ['Millers Creek', 'Wilkes County', 'Yadkin Valley & Foothills', '360', ''],
        ['Sparta', 'Alleghany County', 'Blue Ridge Escarpment', '360', ''],
        ['Jefferson', 'Ashe County', 'High Country & Blue Ridge', '360', ''],
        ['West Jefferson', 'Ashe County', 'High Country & Blue Ridge', '360', ''],
        ['Hickory', 'Catawba / Burke / Caldwell County', 'Foothills & Catawba Valley', '350 / 360', ''],
        ['Newton', 'Catawba County', 'Foothills & Catawba Valley', '350', ''],
        ['Conover', 'Catawba County', 'Foothills & Catawba Valley', '350', ''],
        ['Lenoir', 'Caldwell County', 'Blue Ridge Foothills', '360', ''],
        ['Morganton', 'Burke County', 'Blue Ridge Foothills', '360', ''],
        ['Taylorsville', 'Alexander County', 'Blue Ridge Foothills', '360', ''],
        ['Boone', 'Watauga County', 'High Country & NC Mountains', '360', ''],
        ['Blowing Rock', 'Watauga / Caldwell County', 'High Country & NC Mountains', '360', ''],
        ['Banner Elk', 'Avery County', 'High Country & NC Mountains', '360', ''],
        ['Newland', 'Avery County', 'High Country & NC Mountains', '360', ''],
        ['Beech Mountain', 'Watauga / Avery County', 'High Country & NC Mountains', '360', ''],
        ['Asheville', 'Buncombe County', 'Western NC Mountains', '370', ''],
        ['Black Mountain', 'Buncombe County', 'Western NC Mountains', '370', ''],
        ['Weaverville', 'Buncombe County', 'Western NC Mountains', '370', ''],
        ['Arden', 'Buncombe / Henderson County', 'Western NC Mountains', '370 / 390', ''],
        ['Hendersonville', 'Henderson County', 'Western NC Mountains', '390', ''],
        ['Fletcher', 'Henderson County', 'Western NC Mountains', '390', ''],
        ['Brevard', 'Transylvania County', 'Western NC Mountains', '390', ''],
        ['Waynesville', 'Haywood County', 'Great Smoky Mountains', '380', ''],
        ['Maggie Valley', 'Haywood County', 'Great Smoky Mountains', '380', ''],
        ['Canton', 'Haywood County', 'Great Smoky Mountains', '380', ''],
        ['Sylva', 'Jackson County', 'Great Smoky Mountains', '380', ''],
        ['Cullowhee', 'Jackson County', 'Great Smoky Mountains', '380', ''],
        ['Cashiers', 'Jackson County', 'Blue Ridge & Plateau', '380', ''],
        ['Highlands', 'Macon / Jackson County', 'Blue Ridge & Plateau', '390', ''],
        ['Franklin', 'Macon County', 'Western NC Mountains', '390', ''],
        ['Bryson City', 'Swain County', 'Great Smoky Mountains', '380', ''],
        ['Cherokee', 'Swain / Jackson County', 'Great Smoky Mountains', '380', ''],
        ['Murphy', 'Cherokee County', 'Far Western NC Mountains', '390', ''],
        ['Andrews', 'Cherokee County', 'Far Western NC Mountains', '390', ''],
        ['Hayesville', 'Clay County', 'Far Western NC Mountains', '390', ''],
        ['Robbinsville', 'Graham County', 'Far Western NC Mountains', '390', ''],
        ['Burnsville', 'Yancey County', 'High Country & Black Mountains', '390', ''],
        ['Spruce Pine', 'Mitchell County', 'High Country & Toe River', '390', ''],
        ['Bakersville', 'Mitchell County', 'High Country & Toe River', '390', ''],
        ['Marshall', 'Madison County', 'Western NC Mountains', '390', ''],
        ['Mars Hill', 'Madison County', 'Western NC Mountains', '390', ''],
        ['Marion', 'McDowell County', 'Blue Ridge Foothills', '360', ''],
        ['Old Fort', 'McDowell County', 'Blue Ridge Foothills', '360', ''],
        ['Rutherfordton', 'Rutherford County', 'Foothills & Thermal Belt', '390', ''],
        ['Forest City', 'Rutherford County', 'Foothills & Thermal Belt', '390', ''],
        ['Lake Lure', 'Rutherford County', 'Foothills & Thermal Belt', '390', ''],
        ['Tryon', 'Polk County', 'Foothills & Thermal Belt', '390', ''],
        ['Columbus', 'Polk County', 'Foothills & Thermal Belt', '390', ''],
        ['Wilson', 'Wilson County', 'I-95 Corridor', '250', ''],
        ['Rocky Mount', 'Nash / Edgecombe County', 'I-95 Corridor', '250 / 210', ''],
        ['Nashville', 'Nash County', 'I-95 Corridor', '250', ''],
        ['Roanoke Rapids', 'Halifax County', 'I-95 Corridor North', '240', ''],
        ['Smithfield', 'Johnston County', 'I-95 & US-70 Corridor', '250', ''],
        ['Clayton', 'Johnston County', 'Triangle East & I-95 Corridor', '250', ''],
        ['Selma', 'Johnston County', 'I-95 Corridor', '250', ''],
        ['Benson', 'Johnston County', 'I-95 & I-40 Crossroads', '250', ''],
        ['Dunn', 'Harnett County', 'I-95 Corridor', '290', ''],
        ['Lillington', 'Harnett County', 'Sandhills & Cape Fear', '290', ''],
        ['Sanford', 'Lee County', 'Sandhills & US-1 Corridor', '290', ''],
        ['Southern Pines', 'Moore County', 'Sandhills Region', '290', ''],
        ['Pinehurst', 'Moore County', 'Sandhills Region', '290', ''],
        ['Aberdeen', 'Moore County', 'Sandhills Region', '290', ''],
        ['Fayetteville', 'Cumberland County', 'I-95 & Fort Liberty Corridor', '300', ''],
        ['Hope Mills', 'Cumberland County', 'I-95 & Fort Liberty Corridor', '300', ''],
        ['Spring Lake', 'Cumberland County', 'I-95 & Fort Liberty Corridor', '300', ''],
        ['Lumberton', 'Robeson County', 'I-95 Corridor South', '220', ''],
        ['Laurinburg', 'Scotland County', 'Sandhills South', '290', ''],
        ['Rockingham', 'Richmond County', 'Sandhills West', '290', ''],
        ['Goldsboro', 'Wayne County', 'Eastern Piedmont & US-70', '220', ''],
        ['Greenville', 'Pitt County', 'Eastern North Carolina', '190', ''],
        ['Wilmington', 'New Hanover County', 'Coastal North Carolina', '140', ''],
        ['Jacksonville', 'Onslow County', 'Coastal North Carolina', '130', ''],
        ['New Bern', 'Craven County', 'Coastal North Carolina', '150', ''],
        ['Morehead City', 'Carteret County', 'Crystal Coast', '120', ''],
        ['Elizabeth City', 'Pasquotank County', 'Northeast NC', '180', ''],
        ['Outer Banks', 'Dare / Currituck County', 'Barrier Islands', '110', '']
    ];

    var NC_COUNTIES = [
        'Alamance','Alexander','Alleghany','Anson','Ashe','Avery','Beaufort','Bertie','Bladen','Brunswick',
        'Buncombe','Burke','Cabarrus','Caldwell','Camden','Carteret','Caswell','Catawba','Chatham','Cherokee',
        'Chowan','Clay','Cleveland','Columbus','Craven','Cumberland','Currituck','Dare','Davidson','Davie',
        'Duplin','Durham','Edgecombe','Forsyth','Franklin','Gaston','Gates','Graham','Granville','Greene',
        'Guilford','Halifax','Harnett','Haywood','Henderson','Hertford','Hoke','Hyde','Iredell','Jackson',
        'Johnston','Jones','Lee','Lenoir','Lincoln','Macon','Madison','Martin','McDowell','Mecklenburg',
        'Mitchell','Montgomery','Moore','Nash','New Hanover','Northampton','Onslow','Orange','Pamlico','Pasquotank',
        'Pender','Perquimans','Person','Pitt','Polk','Randolph','Richmond','Robeson','Rockingham','Rowan',
        'Rutherford','Sampson','Scotland','Stanly','Stokes','Surry','Swain','Transylvania','Tyrrell','Union',
        'Vance','Wake','Warren','Washington','Watauga','Wayne','Wilkes','Wilson','Yadkin','Yancey'
    ];

    function normalize(text) {
        return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\bnc\b|\bnorth carolina\b|\bcounty\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function findNcMatch(query) {
        if (!query || query.length < 2) return null;
        var exact = null;
        var partial = null;
        for (var i = 0; i < NC_PLACES.length; i++) {
            var p = NC_PLACES[i];
            var normName = normalize(p[0]);
            var normCounty = normalize(p[1]);
            if (normName === query) { exact = p; break; }
            if (!partial && (normName.indexOf(query) === 0 || normName.indexOf(query) !== -1 || normCounty.indexOf(query) === 0)) {
                partial = p;
            }
        }
        if (exact || partial) return exact || partial;
        for (var j = 0; j < NC_COUNTIES.length; j++) {
            var c = NC_COUNTIES[j];
            var normC = normalize(c);
            if (normC === query || normC.indexOf(query) === 0) {
                return [c + ' County', c + ' County, NC', 'All 100 NC Counties Served', 'NC Rate Bureau', ''];
            }
        }
        return null;
    }

    function renderMatch(match, rawInput) {
        if (!matchBox) return false;
        if (!match) {
            matchBox.hidden = true;
            matchBox.innerHTML = '';
            return false;
        }
        var placeName = escapeHtml(match[0]);
        var countyLabel = escapeHtml(match[1]);
        var corridor = escapeHtml(match[2]);
        var territory = escapeHtml(match[3]);
        var guideUrl = match[4];
        var townParam = encodeURIComponent(match[0]);
        var guideBtn = guideUrl
            ? '<a class="as-button as-button-outline" href="' + escapeHtml(guideUrl) + '">Read ' + placeName + ' Guide <span aria-hidden="true">&rarr;</span></a>'
            : '';
        matchBox.innerHTML =
            '<div class="as-local-match-top">' +
                '<span class="as-local-match-badge">Confirmed NC Service Area &middot; NCRB Territory ' + territory + '</span>' +
                '<span class="as-small"><strong>' + corridor + '</strong></span>' +
            '</div>' +
            '<h3>Yes &mdash; We Serve ' + placeName + ' (' + countyLabel + ')</h3>' +
            '<p>Compare rates across <strong>8 NC home carriers &amp; 6 standard auto carriers</strong> by phone, text or online &mdash; backed by our licensed North Carolina team in Elkin &amp; Dobson. Rates and eligibility vary by carrier and underwriting.</p>' +
            '<div class="as-local-match-actions">' +
                '<a class="as-button" href="/auto-quote?src=areas_search_auto&amp;town=' + townParam + '">Start Auto Quote <span aria-hidden="true">&rarr;</span></a>' +
                '<a class="as-button" href="/home-quote?src=areas_search_home&amp;town=' + townParam + '">Start Home Quote <span aria-hidden="true">&rarr;</span></a>' +
                guideBtn +
                '<a class="as-text-link" href="tel:3368351993">Call (336) 835-1993</a>' +
            '</div>';
        matchBox.hidden = false;
        return true;
    }

    function filter(moveFocus) {
        var raw = input.value.trim();
        var query = normalize(raw);
        var count = 0;
        rows.forEach(function (row) {
            var matched = !query || normalize(row.getAttribute('data-area-name')).indexOf(query) !== -1;
            row.hidden = !matched;
            if (matched) count++;
        });
        var ncMatch = query ? findNcMatch(query) : null;
        var hasMatchCard = renderMatch(ncMatch, raw);

        section.classList.toggle('as-search-active', !!query || moveFocus);
        clear.hidden = !raw;
        list.hidden = count === 0;
        empty.hidden = !query || count !== 0 || hasMatchCard;

        if (!query) {
            status.textContent = '';
        } else if (hasMatchCard && count > 0) {
            status.textContent = 'Confirmed NC coverage + ' + count + ' local guide' + (count === 1 ? '' : 's') + ' found for "' + raw + '".';
        } else if (hasMatchCard) {
            status.textContent = 'Confirmed North Carolina service area for "' + ncMatch[0] + '". Start an online quote or call our team below.';
        } else if (count > 0) {
            status.textContent = count + ' community guide' + (count === 1 ? '' : 's') + ' found.';
        } else {
            status.textContent = 'We serve all 100 North Carolina counties — start an Auto or Home quote below for your NC address.';
        }

        if (moveFocus) {
            heading.focus({ preventScroll: true });
            section.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        window.clearTimeout(timer);
        filter(true);
    });
    input.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { filter(false); }, 160);
    });
    input.addEventListener('search', function () { filter(false); });
    clear.addEventListener('click', function () {
        window.clearTimeout(timer);
        input.value = '';
        filter(false);
        input.focus();
    });

    // Support ?town= query param prefill
    try {
        var params = new URLSearchParams(window.location.search);
        var initialTown = params.get('q') || params.get('town');
        if (initialTown) {
            input.value = initialTown;
            filter(false);
        }
    } catch (e) {}

    // The entire corridor & county directory is ordinary HTML and is never filtered away.
    document.body.classList.add('as-search-ready');
})();
