(function () {
  'use strict';

  // ─── FALLBACK DATA (mirrors logos.json & makes.json so file:// double-click works with zero fetch errors) ───
  const FALLBACK_LOGOS = {
    representedAutoCarriers: [
      { name: 'Progressive', logo: 'https://img.billlayneinsurance.com/i/2026/08/progressive-logo-rpu5dp.png', enabled: true, order: 1 },
      { name: 'Nationwide', logo: 'https://img.billlayneinsurance.com/i/2026/08/nationwide-logo-z3gbr8.png', enabled: true, order: 2 },
      { name: 'Travelers', logo: 'https://img.billlayneinsurance.com/i/2026/08/travelers-logo-asd9r4.png', enabled: true, order: 3 },
      { name: 'National General', logo: 'https://img.billlayneinsurance.com/i/2026/08/national-general-logo-dpjsf3.png', enabled: true, order: 4 },
      { name: 'The General', logo: 'https://img.billlayneinsurance.com/i/2026/10/the-general-insurance-logo-ttf8fj.png', enabled: true, order: 5 },
      { name: 'Foremost', logo: 'https://img.billlayneinsurance.com/i/2026/08/foremost-logo-eh5sta.jpg', enabled: true, order: 6 }
    ],
    carMakes: [
      { name: 'Chevrolet', logo: 'https://img.billlayneinsurance.com/i/2026/11/chevrolet-car-logo-128-nfp8qy.jpg', enabled: true, order: 1, wide: true, showLabel: false },
      { name: 'Ford', logo: 'https://img.billlayneinsurance.com/i/2026/11/ford-car-logo-128-8wmhgn.png', enabled: true, order: 2, showLabel: false },
      { name: 'GMC', logo: 'https://img.billlayneinsurance.com/i/2026/11/gmc-car-logo-128-fhe396.png', enabled: true, order: 3, showLabel: false },
      { name: 'Honda', logo: 'https://img.billlayneinsurance.com/i/2026/11/honda-car-logo-128-squ5ke.png', enabled: true, order: 4, showLabel: false },
      { name: 'Hyundai', logo: 'https://img.billlayneinsurance.com/i/2026/11/hyundai-car-logo-128-yrcwkj.png', enabled: true, order: 5, showLabel: false },
      { name: 'Jeep', logo: 'https://img.billlayneinsurance.com/i/2026/11/jeep-car-logo-128-mhd8hs.png', enabled: true, order: 6, showLabel: false },
      { name: 'Kia', logo: 'https://img.billlayneinsurance.com/i/2026/11/kia-car-logo-128-83wd3z.png', enabled: true, order: 7, showLabel: false },
      { name: 'Nissan', logo: 'https://img.billlayneinsurance.com/i/2026/11/nissan-car-logo-128-zchbpg.png', enabled: true, order: 8, showLabel: false },
      { name: 'Subaru', logo: 'https://img.billlayneinsurance.com/i/2026/11/subaru-car-logo-128-y9vu5e.png', enabled: true, order: 9, showLabel: false },
      { name: 'Tesla', logo: 'https://img.billlayneinsurance.com/i/2026/11/tesla-car-logo-128-cd2g6y.png', enabled: true, order: 10, showLabel: false },
      { name: 'Toyota', logo: 'https://img.billlayneinsurance.com/i/2026/11/toyota-car-logo-tight-ywdk47.png', enabled: true, order: 11, showLabel: false },
      { name: 'Mazda', logo: 'https://img.billlayneinsurance.com/i/2026/11/mazda-car-logo-128-8ju2yd.png', enabled: true, order: 12, showLabel: false },
      { name: 'Ram', logo: '', enabled: true, order: 13, showLabel: true }
    ],
    currentInsurers: [
      { name: 'State Farm', logo: 'https://img.billlayneinsurance.com/i/2026/11/state-farm-insurance-logo-c4hm2m.png', enabled: true, order: 1, showLabel: false },
      { name: 'NC Farm Bureau', logo: 'https://img.billlayneinsurance.com/i/2026/11/nc-farm-bureau-insurance-logo-128-d5dmug.png', enabled: true, order: 2, showLabel: false },
      { name: 'GEICO', logo: 'https://img.billlayneinsurance.com/i/2026/11/geico-insurance-logo-s92zrs.png', enabled: true, order: 3, showLabel: false },
      { name: 'Allstate', logo: 'https://img.billlayneinsurance.com/i/2026/11/allstate-insurance-logo-nq7c5z.png', enabled: true, order: 4, showLabel: false },
      { name: 'Progressive', logo: 'https://img.billlayneinsurance.com/i/2026/11/progressive-insurance-logo-2kcvze.png', enabled: true, order: 5, showLabel: false },
      { name: 'Nationwide', logo: 'https://img.billlayneinsurance.com/i/2026/11/nationwide-insurance-logo-j5zp2s.png', enabled: true, order: 6, showLabel: false },
      { name: 'National General', logo: 'https://img.billlayneinsurance.com/i/2026/11/national-general-insurance-logo-tight-ukj525.png', enabled: true, order: 7, showLabel: false },
      { name: 'Liberty Mutual', logo: 'https://img.billlayneinsurance.com/i/2026/11/liberty-mutual-insurance-logo-ffrtts.png', enabled: true, order: 8, showLabel: false },
      { name: 'USAA', logo: 'https://img.billlayneinsurance.com/i/2026/11/usaa-insurance-logo-w3dpue.png', enabled: true, order: 9, showLabel: false },
      { name: 'Travelers', logo: 'https://img.billlayneinsurance.com/i/2026/11/travelers-insurance-logo-g5kjgw.png', enabled: true, order: 10, showLabel: false },
      { name: 'Erie', logo: 'https://img.billlayneinsurance.com/i/2026/11/erie-insurance-logo-c4hn3n.png', enabled: true, order: 11, showLabel: false },
      { name: 'The General', logo: 'https://img.billlayneinsurance.com/i/2026/11/the-general-insurance-logo-tight-7ytc4y.png', enabled: true, order: 12, showLabel: false },
      { name: 'Direct Auto', logo: 'https://img.billlayneinsurance.com/i/2026/11/direct-auto-insurance-logo-tight-5fp9ym.png', enabled: true, order: 13, showLabel: false },
      { name: 'Farmers', logo: 'https://img.billlayneinsurance.com/i/2026/11/farmers-insurance-logo-k2nas7.png', enabled: true, order: 14, showLabel: false },
      { name: 'AAA', logo: 'https://img.billlayneinsurance.com/i/2026/11/aaa-insurance-logo-z936g6.png', enabled: true, order: 15, showLabel: false },
      { name: 'The Hartford', logo: 'https://img.billlayneinsurance.com/cdn-cgi/image/width=400,format=auto,quality=85/i/2026/11/the-hartford-insurance-logo-6e5p5m.png', enabled: true, order: 16, showLabel: true },
      { name: 'American Family', logo: 'https://img.billlayneinsurance.com/i/2026/11/american-family-insurance-logo-rxuamg.png', enabled: true, order: 17, showLabel: false },
      { name: 'Other', logo: '', enabled: true, order: 18, showLabel: true },
      { name: 'Mercury', logo: 'https://img.billlayneinsurance.com/i/2026/11/mercury-insurance-logo-5xth28.png', enabled: false, order: 19, showLabel: false },
      { name: 'Esurance', logo: 'https://img.billlayneinsurance.com/cdn-cgi/image/width=400,format=auto,quality=85/i/2026/11/esurance-insurance-logo-d7gegj.png', enabled: false, order: 20, showLabel: false }
    ],
    icons: [
      { name: 'car1', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-vehicle-1-fpucjx.svg', enabled: true, order: 1 },
      { name: 'car2', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-vehicle-2plus-ech95u.svg', enabled: true, order: 2 },
      { name: 'insuredYes', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-insured-yes-8pg2wf.svg', enabled: true, order: 3 },
      { name: 'insuredNo', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-insured-no-mk4ws4.svg', enabled: true, order: 4 },
      { name: 'uploadDoc', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-decpage-upload-jskmdu.svg', enabled: true, order: 5 },
      { name: 'listDoc', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-decpage-skip-fw8c24.svg', enabled: true, order: 6 },
      { name: 'recordYesAlert', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-incidents-yes-5fcxmr.svg', enabled: true, order: 7 },
      { name: 'recordNoCheck', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-incidents-no-5atrce.svg', enabled: true, order: 8 },
      { name: 'homeYes', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-home-yes-45j7s3.svg', enabled: true, order: 9 },
      { name: 'homeNo', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-home-no-dsrf2a.svg', enabled: true, order: 10 },
      { name: 'covMin', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-coverage-minimum-n47hjp.svg', enabled: true, order: 11 },
      { name: 'covFull', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-coverage-full-g66cfp.svg', enabled: true, order: 12 },
      { name: 'covAdvise', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-coverage-not-sure-jmye8d.svg', enabled: true, order: 13 },
      { name: 'driverYes', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-drivers-yes-akmbka.svg', enabled: true, order: 14 },
      { name: 'driverNo', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-drivers-no-zezrfu.svg', enabled: true, order: 15 },
      { name: 'contactText', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-text-95dsvh.svg', enabled: true, order: 16 },
      { name: 'contactCall', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-call-qnebb3.svg', enabled: true, order: 17 },
      { name: 'contactEmail', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-email-x3kdef.svg', enabled: true, order: 18 },
      { name: 'confirmCheck', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-confirm-dbnygk.svg', enabled: true, order: 19 },
      { name: 'licenseYes', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-license-yes-7p9f4u.svg', enabled: false, order: 20 },
      { name: 'licenseNo', link: 'https://img.billlayneinsurance.com/i/2026/11/quote-icon-license-no-pvcx2p.svg', enabled: false, order: 21 }
    ]
  };

  const FALLBACK_MAKES = {
    tileMakes: ['Chevrolet', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Jeep', 'Kia', 'Nissan', 'Subaru', 'Tesla', 'Toyota', 'Mazda', 'Ram'],
    dropdownOnlyMakes: [
      'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chrysler', 'Dodge',
      'Ferrari', 'FIAT', 'Genesis', 'HUMMER', 'Ineos', 'Infiniti', 'Isuzu', 'Jaguar', 'Lamborghini',
      'Land Rover', 'Lexus', 'Lincoln', 'Lotus', 'Lucid', 'Maserati', 'Mercedes-Benz', 'Mercury',
      'MINI', 'Mitsubishi', 'Oldsmobile', 'Plymouth', 'Polestar', 'Pontiac', 'Porsche', 'Rivian',
      'Saab', 'Saturn', 'Scion', 'Smart', 'Suzuki', 'Volkswagen', 'Volvo', 'Other'
    ],
    curatedModels: {
      Chevrolet: [
        { name: 'Silverado 1500' }, { name: 'Equinox', minYear: 2005 }, { name: 'Tahoe', minYear: 1995 },
        { name: 'Traverse', minYear: 2009 }, { name: 'Malibu' }, { name: 'Colorado', minYear: 2004 },
        { name: 'Trailblazer', minYear: 2002 }, { name: 'Trax', minYear: 2015 }, { name: 'Suburban' },
        { name: 'Blazer' }, { name: 'Camaro' }, { name: 'Silverado 2500HD', minYear: 2001 },
        { name: 'Cruze', minYear: 2011, maxYear: 2019 }, { name: 'Impala', maxYear: 2020 },
        { name: 'Corvette' }, { name: 'Bolt EV', minYear: 2017 }, { name: 'Spark', minYear: 2013, maxYear: 2022 },
        { name: 'Express', minYear: 1996 }
      ],
      Ford: [
        { name: 'F-150' }, { name: 'Escape', minYear: 2001 }, { name: 'Explorer', minYear: 1991 },
        { name: 'Mustang' }, { name: 'Edge', minYear: 2007, maxYear: 2024 }, { name: 'Bronco' },
        { name: 'Bronco Sport', minYear: 2021 }, { name: 'Ranger' }, { name: 'Expedition', minYear: 1997 },
        { name: 'F-250' }, { name: 'Maverick', minYear: 2022 }, { name: 'Fusion', minYear: 2006, maxYear: 2020 },
        { name: 'Focus', minYear: 2000, maxYear: 2018 }, { name: 'Taurus', maxYear: 2019 },
        { name: 'EcoSport', minYear: 2018, maxYear: 2022 }, { name: 'Transit Connect', minYear: 2010, maxYear: 2023 },
        { name: 'Mustang Mach-E', minYear: 2021 }, { name: 'Flex', minYear: 2009, maxYear: 2019 }
      ],
      GMC: [
        { name: 'Sierra 1500' }, { name: 'Terrain', minYear: 2010 }, { name: 'Acadia', minYear: 2007 },
        { name: 'Yukon', minYear: 1992 }, { name: 'Canyon', minYear: 2004 }, { name: 'Sierra 2500HD', minYear: 2001 },
        { name: 'Yukon XL', minYear: 2000 }, { name: 'Savana', minYear: 1996 },
        { name: 'Hummer EV', minYear: 2022 }, { name: 'Envoy', minYear: 1998, maxYear: 2009 }
      ],
      Honda: [
        { name: 'CR-V', minYear: 1997 }, { name: 'Civic' }, { name: 'Accord' }, { name: 'Pilot', minYear: 2003 },
        { name: 'HR-V', minYear: 2016 }, { name: 'Odyssey', minYear: 1995 }, { name: 'Passport', minYear: 1994 },
        { name: 'Ridgeline', minYear: 2006 }, { name: 'Fit', minYear: 2007, maxYear: 2020 },
        { name: 'Insight', minYear: 2000, maxYear: 2022 }, { name: 'Clarity', minYear: 2017, maxYear: 2021 },
        { name: 'Prologue', minYear: 2024 }, { name: 'Element', minYear: 2003, maxYear: 2011 },
        { name: 'CR-Z', minYear: 2011, maxYear: 2016 }
      ],
      Hyundai: [
        { name: 'Tucson', minYear: 2005 }, { name: 'Elantra', minYear: 1992 }, { name: 'Santa Fe', minYear: 2001 },
        { name: 'Sonata', minYear: 1989 }, { name: 'Palisade', minYear: 2020 }, { name: 'Kona', minYear: 2018 },
        { name: 'Venue', minYear: 2020 }, { name: 'Accent', minYear: 1995, maxYear: 2022 },
        { name: 'IONIQ 5', minYear: 2022 }, { name: 'IONIQ 6', minYear: 2023 }, { name: 'Santa Cruz', minYear: 2022 },
        { name: 'Veloster', minYear: 2012, maxYear: 2022 }, { name: 'Ioniq', minYear: 2017, maxYear: 2022 },
        { name: 'Azera', minYear: 2006, maxYear: 2017 }
      ],
      Jeep: [
        { name: 'Wrangler', minYear: 1987 }, { name: 'Grand Cherokee', minYear: 1993 }, { name: 'Cherokee' },
        { name: 'Compass', minYear: 2007 }, { name: 'Gladiator', minYear: 2020 },
        { name: 'Renegade', minYear: 2015, maxYear: 2023 }, { name: 'Wagoneer', minYear: 2022 },
        { name: 'Grand Wagoneer', minYear: 2022 }, { name: 'Patriot', minYear: 2007, maxYear: 2017 },
        { name: 'Liberty', minYear: 2002, maxYear: 2012 }
      ],
      Kia: [
        { name: 'Sportage', minYear: 1995 }, { name: 'Forte', minYear: 2010, maxYear: 2024 },
        { name: 'Sorento', minYear: 2003 }, { name: 'Telluride', minYear: 2020 }, { name: 'Soul', minYear: 2010 },
        { name: 'Seltos', minYear: 2021 }, { name: 'K5', minYear: 2021 }, { name: 'Optima', minYear: 2001, maxYear: 2020 },
        { name: 'Carnival', minYear: 2022 }, { name: 'Niro', minYear: 2017 }, { name: 'Rio', minYear: 2001, maxYear: 2023 },
        { name: 'EV6', minYear: 2022 }, { name: 'EV9', minYear: 2024 }, { name: 'Stinger', minYear: 2018, maxYear: 2023 },
        { name: 'Sedona', minYear: 2002, maxYear: 2021 }
      ],
      Nissan: [
        { name: 'Rogue', minYear: 2008 }, { name: 'Altima', minYear: 1993 }, { name: 'Sentra' },
        { name: 'Frontier', minYear: 1998 }, { name: 'Pathfinder', minYear: 1987 }, { name: 'Murano', minYear: 2003 },
        { name: 'Kicks', minYear: 2018 }, { name: 'Versa', minYear: 2007 }, { name: 'Maxima', maxYear: 2023 },
        { name: 'Titan', minYear: 2004, maxYear: 2024 }, { name: 'Armada', minYear: 2004 },
        { name: 'LEAF', minYear: 2011 }, { name: 'Ariya', minYear: 2023 }, { name: 'Z', minYear: 2023 },
        { name: 'Juke', minYear: 2011, maxYear: 2017 }
      ],
      Subaru: [
        { name: 'Outback', minYear: 1995 }, { name: 'Forester', minYear: 1998 }, { name: 'Crosstrek', minYear: 2013 },
        { name: 'Impreza', minYear: 1993 }, { name: 'Ascent', minYear: 2019 }, { name: 'Legacy', minYear: 1990 },
        { name: 'WRX', minYear: 2002 }, { name: 'BRZ', minYear: 2013 }, { name: 'Solterra', minYear: 2023 },
        { name: 'Baja', minYear: 2003, maxYear: 2006 }
      ],
      Tesla: [
        { name: 'Model 3', minYear: 2017 }, { name: 'Model Y', minYear: 2020 },
        { name: 'Model S', minYear: 2012 }, { name: 'Model X', minYear: 2016 }, { name: 'Cybertruck', minYear: 2024 }
      ],
      Toyota: [
        { name: 'RAV4', minYear: 1996 }, { name: 'Camry' }, { name: 'Corolla' }, { name: 'Tacoma', minYear: 1995 },
        { name: 'Highlander', minYear: 2001 }, { name: '4Runner', minYear: 1984 }, { name: 'Tundra', minYear: 2000 },
        { name: 'Prius', minYear: 2001 }, { name: 'Sienna', minYear: 1998 }, { name: 'Corolla Cross', minYear: 2022 },
        { name: 'Venza', minYear: 2009 }, { name: 'Sequoia', minYear: 2001 }, { name: 'Avalon', minYear: 1995, maxYear: 2022 },
        { name: 'C-HR', minYear: 2018, maxYear: 2022 }, { name: 'Crown', minYear: 2023 },
        { name: 'GR86', minYear: 2022 }, { name: 'bZ4X', minYear: 2023 }, { name: 'Land Cruiser' }
      ],
      Mazda: [
        { name: 'CX-5', minYear: 2013 }, { name: 'CX-30', minYear: 2020 }, { name: 'Mazda3', minYear: 2004 },
        { name: 'CX-50', minYear: 2023 }, { name: 'CX-9', minYear: 2007, maxYear: 2023 },
        { name: 'CX-90', minYear: 2024 }, { name: 'CX-70', minYear: 2025 }, { name: 'MX-5 Miata', minYear: 1990 },
        { name: 'Mazda6', minYear: 2003, maxYear: 2021 }, { name: 'CX-3', minYear: 2016, maxYear: 2021 }
      ],
      Ram: [
        { name: '1500' }, { name: '2500' }, { name: '3500' },
        { name: 'ProMaster', minYear: 2014 }, { name: 'ProMaster City', minYear: 2015, maxYear: 2022 },
        { name: '1500 Classic', minYear: 2019, maxYear: 2024 }
      ]
    }
  };

  const TOP_YEARS = Array.from({ length: 18 }, (_, i) => String(2026 - i));
  const DROPDOWN_YEARS = Array.from({ length: 2026 - 1981 + 1 }, (_, i) => String(2026 - i));
  const EXCLUDE_HEAVY_RE = /\b(bus|trailer|chassis|cutaway|incomplete|cab\s*over|cab\s*behind|conventional|tractor|low\s*cab|medium\s*duty|heavy\s*duty|stripped|glider|motorhome|replica|classic\s+sedan|cordova|malibu\s+sedan|f-?450|f-?550|f-?600|f-?650|f-?750|4500|5500|6500|7500|8500|e-?450|lcf|autocar|acl|vnl|vnr|vhd|vnx|vnm|vnh|vt|wg|wx|wca|wia|fe\d|fl\d|fm\d|fh\d|nh\d|9700|9800|step\s*van|walk-?in|commercial|school)\b/i;

  const MAX_BYTES_PER_FILE = 8 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 12 * 1024 * 1024;
  const MAX_FILES = 6;
  const MAX_PHOTO_DIM = 2000;
  const PHOTO_JPEG_QUALITY = 0.8;
  const ALLOWED_EXT = /\.(pdf|jpg|jpeg|png|heic|heif)$/i;
  const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];

  const MARITAL_OPTS = [
    { val: 'single', label: 'Single' },
    { val: 'married', label: 'Married' },
    { val: 'divorced', label: 'Divorced' },
    { val: 'widowed', label: 'Widowed' }
  ];
  const GENDER_OPTS = [
    { val: 'male', label: 'Male' },
    { val: 'female', label: 'Female' }
  ];
  const RENEWAL_OPTS = [
    { val: 'within 30 days', label: 'Within 30 days' },
    { val: '1 to 3 months', label: '1 to 3 months' },
    { val: 'later than 3 months', label: 'Later than 3 months' },
    { val: 'not sure', label: 'Not sure' }
  ];
  const LIABILITY_OPTS = [
    { val: '50/100/50', label: 'State Minimum (50/100/50)', badge: '' },
    { val: '100/300/50', label: '100/300/50', badge: '' },
    { val: '100/300/100', label: '100/300/100', badge: 'Most Popular' },
    { val: '250/500/250', label: '250/500/250', badge: 'Best Protection' },
    { val: 'HELP ME DECIDE — customer wants coverage guidance', label: 'Not sure, help me decide', badge: '' }
  ];
  const COMP_DED_OPTS = ['$100', '$250', '$500', '$1,000', 'Not sure'];
  const COLL_DED_OPTS = ['$250', '$500', '$1,000', 'Not sure'];

  const STORAGE_KEY = 'bli_auto_v2_test_session';
  const SAVED_7DAY_KEY = 'bli_auto_v2_test_saved_7d';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const TURNSTILE_SITE_KEY = '0x4AAAAAADs4upS36xby4dVi';
  const TEST_PREFIX = '[TEST AUTO V2]';
  const params = new URLSearchParams(window.location.search);
  const ctaSource = 'auto_v2_test';
  const forceEmptyLogos = params.get('test_empty_logos') === '1';

  let turnstileToken = '';
  let submittingLive = false;
  let submitErrorMsg = '';
  window.onV2TurnstileSuccess = function (token) { turnstileToken = token || ''; };
  window.onV2TurnstileExpired = function () { turnstileToken = ''; };

  let logoConfig = FALLBACK_LOGOS;
  let makesConfig = FALLBACK_MAKES;
  const modelCache = {};

  const emptyVeh = () => ({ make: '', year: '', model: '', vin: '', isCustomMake: false });
  // Vehicle steps: step_2 / step_3 / step_4 for the first car, then the same with b, c, d for cars 2, 3, 4.
  const MAX_VEHICLES = 4;
  const VEH_SUFFIX = ['', 'b', 'c', 'd'];
  const VEH_ORDINAL = ['first', 'second', 'third', 'fourth'];
  const vehStep = (n, idx) => `step_${n}${VEH_SUFFIX[idx] || ''}`;
  const isVehStep = (stepId, n) => new RegExp(`^step_${n}[bcd]?$`).test(stepId);
  const vehStepIdx = stepId => Math.max(0, VEH_SUFFIX.indexOf(stepId.replace(/^step_\d/, '')));
  const emptyDriver = () => ({ name: '', dob: '', marital: '', gender: '', claims: '', violations: '' });

  const defaultState = () => ({
    vehicleCount: 0,
    vehicles: [emptyVeh()],
    current_insurance: '',
    current_carrier: '',
    renewal_window: '',
    coverage_expiration: '',
    decShortcutChoice: '',
    usedDecShortcut: false,
    previous_claims: '',
    violations: '',
    homeowner: '',
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    driver_1_name: '',
    driver_1_dob: '',
    driver_1_marital: '',
    driver_1_gender: '',
    coverage_choice: '',
    coverage_scope: '',        // 2+ vehicles only: 'same' or 'different'
    cov_open: 0,               // which vehicle's coverage panel is open (-1 = none)
    liability_limits: '',
    comp_deductible: '',
    collision_deductible: '',
    rental_reimbursement: false,
    roadside_assistance: false,
    medical_payments: false,
    street_address: '',
    city: '',
    state: 'NC',
    zip_code: params.get('zip') && /^\d{5}$/.test(params.get('zip')) ? params.get('zip') : '',
    has_other_drivers: '',
    spouse_prompted: false,    // true once a married primary driver has been given a spouse card (never re-added after Remove)
    od_open: -1,               // which additional driver's details are open (-1 = none; the rest show as a short list)
    other_drivers: [],
    additional_notes: '',
    contact_method: '',
    form_type: 'auto_insurance',
    cta_source: ctaSource
  });

  let state = defaultState();
  let uploadedFiles = [];
  let currentStepId = 'step_1';
  let historyStack = ['step_1'];
  let editingFromReview = false;
  let editReturnTo = null;    // set when a screen sends the customer to edit an earlier answer and should get them back
  let step11Completed = false;
  let partialLeadStubSent = false;
  let finalSubmitted = false;
  let partialTimer = null;
  let visibilityPartialTimer = null;
  let uploadErrorMsg = '';
  let lastConfirmationNumber = '';
  let uploadFailedAfterQuote = false;
  let retryingUpload = false;
  let uploadRetrySuccess = false;
  let lastUploadNotes = '';
  let showOtherMakeBox = false;
  let showOlderYearBox = false;
  let showOtherModelBox = false;
  let showOtherInsurerBox = false;
  let currentCuratedTiles = [];
  let currentDropdownModels = [];
  let loadingModels = false;
  let isAdvancing = false;
  let pendingResumeData = null;
  let animateNextRender = false;
  let focusHeadingNextRender = false;
  let focusAlertIdNextRender = '';

  function activeSorted(list) {
    return (list || [])
      .filter(item => item.enabled !== false)
      .slice()
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  const preloadedUrls = new Set();
  function preloadUrls(urls) {
    if (forceEmptyLogos) return;
    (urls || []).forEach(u => {
      if (!u || preloadedUrls.has(u)) return;
      preloadedUrls.add(u);
      const img = new Image();
      img.decoding = 'async';
      img.src = u;
    });
  }

  function iconHtml(name) {
    const entry = (logoConfig.icons || []).find(i => i.name === name && i.enabled !== false);
    if (!forceEmptyLogos && entry && entry.link && entry.link.trim() !== '') {
      return `<img src="${escapeHtml(entry.link)}" alt="" class="v2-tile-icon" width="48" height="48" onerror="this.remove()">`;
    }
    return '';
  }

  function getEyebrow(stepId) {
    if (stepId === 'step_1' || stepId === 'step_more' || /^step_[234][bcd]?$/.test(stepId)) return 'YOUR VEHICLE';
    if (['step_5', 'step_6', 'step_7', 'step_8'].includes(stepId)) return 'CURRENT COVERAGE';
    if (stepId === 'step_9') return 'DRIVING RECORD';
    if (['step_10', 'step_11', 'step_12', 'step_16'].includes(stepId)) return 'ABOUT YOU';
    if (['step_13', 'step_14', 'step_15'].includes(stepId)) return 'YOUR COVERAGE';
    if (stepId === 'step_17') return 'YOUR DRIVERS';
    if (stepId === 'step_18') return 'ALMOST DONE';
    if (stepId === 'step_19') return 'REVIEW';
    return 'QUOTE RECEIVED';
  }

  function getCuratedModels(make, year) {
    const map = makesConfig.curatedModels || FALLBACK_MAKES.curatedModels || {};
    const list = map[make];
    if (!Array.isArray(list)) return [];
    const yrNum = /^\d{4}$/.test(String(year)) ? Number(year) : 0;
    return list
      .filter(item => {
        if (!yrNum) return true;
        if (item.minYear && yrNum < item.minYear) return false;
        if (item.maxYear && yrNum > item.maxYear) return false;
        return true;
      })
      .map(item => item.name);
  }

  function isValidConsumerModel(name, make) {
    const clean = (name || '').trim();
    if (!clean || clean.length < 2) return false;
    if (/^['"`]/.test(clean)) return false;
    if (/^\d+$/.test(clean) && make.toLowerCase() !== 'ram') return false;
    if (EXCLUDE_HEAVY_RE.test(clean)) return false;
    if (make.toLowerCase() === 'volvo' && !/^(S\d|V\d|XC\d|C\d|EX\d|EM\d|240|740|760|780|850|940|960)/i.test(clean)) {
      return false;
    }
    return true;
  }

  function saveSessionState() {
    const snap = { state, currentStepId, historyStack, step11Completed, updatedAt: Date.now() };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snap)); } catch (_) {}
    if (currentStepId !== 'step_20' && !finalSubmitted) {
      try { localStorage.setItem(SAVED_7DAY_KEY, JSON.stringify(snap)); } catch (_) {}
    }
  }

  function clearSavedProgress() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    try { localStorage.removeItem(SAVED_7DAY_KEY); } catch (_) {}
    pendingResumeData = null;
  }

  function loadSessionState() {
    // 1. Mid-session refresh: restore exact step silently from sessionStorage
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.state) {
          state = Object.assign(defaultState(), parsed.state);
          if (parsed.currentStepId && parsed.currentStepId !== 'step_20') {
            currentStepId = parsed.currentStepId;
            historyStack = Array.isArray(parsed.historyStack) && parsed.historyStack.length ? parsed.historyStack : [currentStepId];
          }
          step11Completed = !!parsed.step11Completed;
          return;
        }
      }
    } catch (_) {}

    // 2. Reopened within 7 days (new tab / browser): offer "Pick up where you left off" or "Start over"
    try {
      const savedRaw = localStorage.getItem(SAVED_7DAY_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.updatedAt && (Date.now() - parsed.updatedAt) <= SEVEN_DAYS_MS &&
            parsed.currentStepId && parsed.currentStepId !== 'step_1' && parsed.currentStepId !== 'step_20') {
          pendingResumeData = parsed;
        } else {
          localStorage.removeItem(SAVED_7DAY_KEY);
        }
      }
    } catch (_) {}
  }

  function trackEvent(eventName, detail) {
    const payload = Object.assign({
      traffic_type: 'internal',
      cta_source: 'auto_v2_test',
      form_name: 'auto_quote_v2_test',
      step_id: currentStepId
    }, detail || {});
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }

  async function fetchDropdownModelsForMakeYear(make, year) {
    const key = `${make}|${year}`;
    if (modelCache[key]) return modelCache[key];

    const curated = getCuratedModels(make, year);
    if (!make || !/^\d{4}$/.test(String(year)) || Number(year) < 1981) {
      modelCache[key] = curated.slice();
      return modelCache[key];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    try {
      const encMake = encodeURIComponent(make);
      const encYear = encodeURIComponent(year);
      const responses = await Promise.all(['car', 'truck', 'mpv'].map(vt =>
        fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encMake}/modelyear/${encYear}/vehicletype/${vt}?format=json`,
          { signal: controller.signal }
        ).then(r => (r.ok ? r.json() : { Results: [] })).catch(() => ({ Results: [] }))
      ));
      clearTimeout(timer);

      const seen = new Set();
      const merged = [];
      curated.forEach(m => {
        const norm = m.toLowerCase();
        if (!seen.has(norm)) { seen.add(norm); merged.push(m); }
      });

      const extras = [];
      responses.forEach(data => {
        (data.Results || []).forEach(row => {
          const name = (row.Model_Name || '').trim();
          if (!isValidConsumerModel(name, make)) return;
          const norm = name.toLowerCase();
          if (!seen.has(norm)) { seen.add(norm); extras.push(name); }
        });
      });

      extras.sort((a, b) => a.localeCompare(b));
      modelCache[key] = [...merged, ...extras];
      return modelCache[key];
    } catch (_) {
      clearTimeout(timer);
      modelCache[key] = curated.slice();
      return modelCache[key];
    }
  }

  function makeConfirmationNumber() {
    const d = new Date();
    const ymd = String(d.getFullYear()).slice(-2) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AUTO-${ymd}-${rand}`;
  }

  // ─── PER-VEHICLE COVERAGE (2+ vehicles) ───
  // Liability limits and medical payments are policy-wide. Coverage type, deductibles, rental and towing can differ per vehicle.
  const COV_LIAB = 'Liability only';
  const COV_FULL = 'Full coverage';
  const COV_UNSURE = 'Not sure, advise me';
  const HELP_LIMITS = 'HELP ME DECIDE — customer wants coverage guidance';
  function vehLabel(v, i) { return [v.year, v.make, v.model].filter(Boolean).join(' ') || `Vehicle ${i + 1}`; }
  function householdRecord(key) {   // key: 'claims' | 'violations'
    const primary = key === 'claims' ? state.previous_claims : state.violations;
    const others = state.has_other_drivers === 'yes' ? state.other_drivers : [];
    if (primary === 'yes' || others.some(d => d && d[key] === 'yes')) return 'yes';
    return primary || 'no';
  }
  function recordText(claims, violations) {
    return `Accidents/claims (5 yrs): ${capitalize(claims || 'not answered')} · Tickets/violations (3 yrs): ${capitalize(violations || 'not answered')}`;
  }
  function isMultiCar() { return state.vehicles.filter(v => v && v.make).length >= 2; }
  function perVehicle() { return isMultiCar() && state.coverage_scope === 'different'; }
  function vehCov(v) {
    if (!v.cov) v.cov = { choice: '', comp: '', coll: '', rental: false, roadside: false };
    return v.cov;
  }
  function anyFullCoverage() {
    return perVehicle() ? state.vehicles.some(v => vehCov(v).choice === COV_FULL) : state.coverage_choice === 'Full coverage';
  }
  function needsLimits() {
    if (!perVehicle()) return state.coverage_choice === 'Full coverage';
    return state.vehicles.some(v => { const c = vehCov(v).choice; return c === COV_FULL || c === COV_LIAB; });
  }
  function coverageChosen() {
    if (isMultiCar() && !state.coverage_scope) return false;
    return perVehicle() ? state.vehicles.every(v => !!vehCov(v).choice) : !!state.coverage_choice;
  }
  function deductiblesComplete() {
    if (!perVehicle()) return !!(state.comp_deductible && state.collision_deductible);
    return state.vehicles.every(v => { const c = vehCov(v); return c.choice !== COV_FULL || (c.comp && c.coll); });
  }
  function vehCovText(v) {
    const c = vehCov(v);
    if (c.choice !== COV_FULL) return c.choice || 'Not selected';
    const bits = [`comprehensive ${c.comp || 'Not sure'}`, `collision ${c.coll || 'Not sure'}`];
    if (c.rental) bits.push('rental car');
    if (c.roadside) bits.push('towing and roadside');
    return `Full coverage, ${bits.join(', ')}`;
  }
  function perVehicleLines() {
    return state.vehicles.map((v, i) => `Vehicle ${i + 1} (${vehLabel(v, i)}): ${vehCovText(v)}`);
  }

  function vehComplete(v) { const c = vehCov(v); return !!c.choice && (c.choice !== COV_FULL || !!(c.comp && c.coll)); }
  function firstIncompleteVehicle() { return state.vehicles.findIndex(v => !vehComplete(v)); }
  function vehCovShort(v) {
    const c = vehCov(v);
    if (!c.choice) return '';
    if (c.choice !== COV_FULL) return c.choice;
    return `Full coverage \u00b7 ${c.comp || '?'} / ${c.coll || '?'}`;
  }
  // Shared builders for the radio-style amounts and the checkbox rows.
  function covOptGrid(kind, idx, list, current, label) {
    return `
      <div class="v2-opt-grid" role="radiogroup" aria-label="${escapeHtml(label)}">
        ${list.map(d => `
          <button type="button" class="v2-opt ${current === d ? 'is-selected' : ''}" role="radio" aria-checked="${current === d ? 'true' : 'false'}" data-ded-kind="${kind}" data-ded-idx="${idx}" data-ded-val="${escapeHtml(d)}">
            <span class="v2-opt-dot" aria-hidden="true"></span><span>${escapeHtml(d)}</span>
          </button>
        `).join('')}
      </div>`;
  }
  function covCheckRow(key, label, on, idx, helpKey) {
    return `
      <div class="v2-check-row">
        <button type="button" class="v2-check ${on ? 'is-on' : ''}" role="checkbox" aria-checked="${on ? 'true' : 'false'}" data-extra-key="${key}" data-extra-idx="${idx}">
          <span class="v2-check-box" aria-hidden="true"></span><span>${escapeHtml(label)}</span>
        </button>
        ${helpBtn(helpKey)}
      </div>`;
  }
  // Opens one vehicle's coverage panel and brings it into view.
  function openVehiclePanel(idx) {
    state.cov_open = idx;
    saveSessionState();
    render();
    const el = document.querySelector('.v2-veh-item.is-open');
    if (el) {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); } catch (_) { el.scrollIntoView(); }
    }
  }

  function clearFullCoverageExtras() {
    state.liability_limits = '';
    state.comp_deductible = '';
    state.collision_deductible = '';
    state.rental_reimbursement = false;
    state.roadside_assistance = false;
    state.medical_payments = false;
  }

  function normalizeContactMethod(val) {
    const raw = String(val || '').trim().toLowerCase();
    if (raw === 'text') return 'text';
    if (raw === 'call' || raw === 'phone') return 'phone';
    if (raw === 'email') return 'email';
    return '';
  }

  function contactMethodLabel(val) {
    const norm = normalizeContactMethod(val);
    if (norm === 'text') return 'Text';
    if (norm === 'phone') return 'Call';
    if (norm === 'email') return 'Email';
    return '';
  }

  function buildLivePayload() {
    const confNum = lastConfirmationNumber || makeConfirmationNumber();
    lastConfirmationNumber = confNum;
    const contactMethod = normalizeContactMethod(state.contact_method);
    const primaryName = (state.driver_1_name || `${state.firstname} ${state.lastname}`).trim();
    const decFiles = uploadedFiles.filter(f => (f._category || 'declarations') !== 'registration_or_id');
    const regFiles = uploadedFiles.filter(f => f._category === 'registration_or_id');

    if (state.usedDecShortcut) {
      const decLead = `DECLARATIONS PAGE UPLOADED. Drivers, address and coverage are on the uploaded document. See the [POLICY UPLOAD] email for Ref ${confNum}.`;
      const extraParts = [
        state.additional_notes ? state.additional_notes.trim() : '',
        (!state.coverage_expiration && state.renewal_window) ? `Renewal: ${state.renewal_window}` : '',
        decFiles.length ? `[Declarations page: ${decFiles.map(f => f.name).join(', ')}]` : '',
        TEST_PREFIX
      ].filter(Boolean);

      return {
        form_type: 'auto_insurance',
        confirmation_number: confNum,
        turnstile_token: turnstileToken || '',
        cta_source: 'auto_v2_test',
        firstname: `${TEST_PREFIX} ${state.firstname}`.trim(),
        lastname: state.lastname,
        email: state.email,
        phone: state.phone,
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        contact_method: contactMethod,
        current_insurance: state.current_insurance || '',
        current_carrier: state.current_carrier || '',
        coverage_expiration: state.coverage_expiration || '',
        liability_limits: '',
        collision: false,
        comprehensive: false,
        uninsured_motorist: false,
        medical_payments: false,
        rental_reimbursement: false,
        roadside_assistance: false,
        comp_deductible: '',
        collision_deductible: '',
        previous_claims: '',
        violations: '',
        homeowner: '',
        coverage_preference: '',
        additional_notes: `${decLead} ${extraParts.join(' | ')}`.trim(),
        drivers: [{
          name: primaryName,
          dob: '',
          gender: '',
          marital: ''
        }],
        vehicles: state.vehicles.map(v => ({
          year: v.year || '',
          make: v.make || '',
          model: v.model || '',
          vin: v.vin || ''
        }))
      };
    }

    const drivers = [{
      name: primaryName,
      dob: state.driver_1_dob || '',
      gender: state.driver_1_gender || '',
      marital: state.driver_1_marital || ''
    }];
    if (state.has_other_drivers === 'yes') {
      state.other_drivers.forEach(d => {
        if (d.name || d.dob || d.gender || d.marital) {
          drivers.push({
            name: d.name || '',
            dob: d.dob || '',
            gender: d.gender || '',
            marital: d.marital || '',
            claims: d.claims || '',
            violations: d.violations || ''
          });
        }
      });
    }

    const pv = perVehicle();
    const fullCov = anyFullCoverage();
    let liabilityLimits = '';
    if (pv) {
      liabilityLimits = needsLimits() ? (state.liability_limits || HELP_LIMITS) : HELP_LIMITS;
    } else if (state.coverage_choice === 'State minimum (liability only)') {
      liabilityLimits = '50/100/50';
    } else if (state.coverage_choice === 'Not sure, advise me') {
      liabilityLimits = HELP_LIMITS;
    } else if (fullCov) {
      liabilityLimits = state.liability_limits || HELP_LIMITS;
    }
    const fullVeh = pv ? state.vehicles.filter(v => vehCov(v).choice === COV_FULL) : [];
    const sameOrVaries = (vals) => (vals.length && vals.every(x => x === vals[0])) ? (vals[0] || '') : 'Varies by vehicle (see notes)';
    const compDed = pv ? sameOrVaries(fullVeh.map(v => vehCov(v).comp)) : (fullCov ? (state.comp_deductible || '') : '');
    const collDed = pv ? sameOrVaries(fullVeh.map(v => vehCov(v).coll)) : (fullCov ? (state.collision_deductible || '') : '');
    const wantsRental = pv ? fullVeh.some(v => vehCov(v).rental) : (fullCov && !!state.rental_reimbursement);
    const wantsRoadside = pv ? fullVeh.some(v => vehCov(v).roadside) : (fullCov && !!state.roadside_assistance);
    const coveragePref = pv ? 'Different per vehicle' : (state.coverage_choice || '');
    const sameForAll = (!pv && isMultiCar() && state.coverage_choice) ? ' (same on every vehicle)' : '';

    const noteParts = [
      state.additional_notes,
      (!state.coverage_expiration && state.renewal_window) ? `Renewal: ${state.renewal_window}` : '',
      state.homeowner ? `Homeowner: ${state.homeowner === 'yes' ? 'Yes' : 'No'}` : '',
      (state.previous_claims || state.violations) ? `DRIVING RECORD BY DRIVER | Driver 1 (${primaryName || 'Primary driver'}): ${recordText(state.previous_claims, state.violations)}` : '',
      ...(state.has_other_drivers === 'yes' ? state.other_drivers.filter(d => d && (d.name || d.claims || d.violations)).map((d, i) => `Driver ${i + 2} (${d.name || 'Unnamed'}): ${recordText(d.claims, d.violations)}`) : []),
      (!pv && state.coverage_choice) ? `Coverage preference: ${state.coverage_choice}${sameForAll}` : '',
      (!pv && fullCov) ? `Deductibles: comprehensive ${state.comp_deductible || 'Not sure'}, collision ${state.collision_deductible || 'Not sure'}` : '',
      pv ? 'COVERAGE DIFFERS BY VEHICLE' : '',
      ...(pv ? perVehicleLines() : []),
      decFiles.length ? `[Declarations page: ${decFiles.map(f => f.name).join(', ')}]` : '',
      regFiles.length ? `[Registration or ID card: ${regFiles.map(f => f.name).join(', ')}]` : ''
    ].filter(Boolean);

    return {
      form_type: 'auto_insurance',
      confirmation_number: confNum,
      turnstile_token: turnstileToken || '',
      cta_source: 'auto_v2_test',
      firstname: `${TEST_PREFIX} ${state.firstname}`.trim(),
      lastname: state.lastname,
      email: state.email,
      phone: state.phone,
      street_address: state.street_address,
      city: state.city,
      state: state.state || 'NC',
      zip_code: state.zip_code,
      contact_method: contactMethod,
      current_insurance: state.current_insurance || 'no',
      current_carrier: state.current_carrier || '',
      coverage_expiration: state.coverage_expiration || '',
      liability_limits: liabilityLimits,
      collision: fullCov,
      comprehensive: fullCov,
      uninsured_motorist: true,
      medical_payments: (pv ? needsLimits() : fullCov) && !!state.medical_payments,
      rental_reimbursement: wantsRental,
      roadside_assistance: wantsRoadside,
      comp_deductible: compDed,
      collision_deductible: collDed,
      previous_claims: householdRecord('claims'),
      violations: householdRecord('violations'),
      homeowner: state.homeowner || '',
      coverage_preference: coveragePref,
      additional_notes: `${TEST_PREFIX} ${noteParts.join(' | ').trim()}`.trim(),
      drivers,
      vehicles: state.vehicles.map(v => ({
        year: v.year || '',
        make: v.make || '',
        model: v.model || '',
        vin: v.vin || '',
        coverage: pv ? vehCovText(v) : (state.coverage_choice || '')
      }))
    };
  }

  function resetPartialTimer() {
    if (partialTimer) clearTimeout(partialTimer);
    if (step11Completed && !finalSubmitted && !partialLeadStubSent) {
      partialTimer = setTimeout(() => sendPartialLeadStub('idle_120s'), 120000);
    }
  }

  const STEP_PLAIN_NAMES = {
    step_1: 'Vehicle count',
    step_2: 'Vehicle 1 make',
    step_2b: 'Vehicle 2 make',
    step_3: 'Vehicle 1 year',
    step_3b: 'Vehicle 2 year',
    step_4: 'Vehicle 1 model',
    step_4b: 'Vehicle 2 model',
    step_2c: 'Vehicle 3 make', step_3c: 'Vehicle 3 year', step_4c: 'Vehicle 3 model',
    step_2d: 'Vehicle 4 make', step_3d: 'Vehicle 4 year', step_4d: 'Vehicle 4 model',
    step_more: 'Add another vehicle',
    step_5: 'Current insurance status',
    step_6: 'Current insurance company',
    step_7: 'Policy renewal timing',
    step_8: 'Declarations page option',
    step_9: 'Driving record',
    step_10: 'Homeowner status',
    step_11: 'Contact information',
    step_12: 'Primary driver details',
    step_13: 'Coverage type',
    step_14: 'Liability limits',
    step_15: 'Deductibles and optional extras',
    step_16: 'Home address',
    step_17: 'Other household drivers',
    step_18: 'VINs, contact preference, and final notes',
    step_19: 'Review screen',
    step_20: 'Confirmation screen'
  };

  function buildPartialLeadLines(stoppedAt) {
    const fullName = `${state.firstname} ${state.lastname}`.trim();
    const lines = [
      `${TEST_PREFIX} Partial Auto Quote`,
      `Stopped At: ${stoppedAt}`,
      `Name: ${fullName}`,
      `Phone: ${state.phone}`,
      `Email: ${state.email}`
    ];

    if (state.vehicleCount) {
      lines.push(`Vehicles Selected: ${state.vehicleCount >= 2 ? '2+ Vehicles' : '1 Vehicle'}`);
    }
    state.vehicles.forEach((v, i) => {
      const desc = [v.year, v.make, v.model].filter(Boolean).join(' ').trim();
      if (desc || v.vin) {
        lines.push(`Vehicle ${i + 1}: ${desc || 'Not entered'}${v.vin ? ` (VIN: ${v.vin})` : ''}`);
      }
    });

    if (state.current_insurance) {
      lines.push(`Currently Insured: ${capitalize(state.current_insurance)}`);
    }
    if (state.current_carrier) {
      lines.push(`Current Insurer: ${state.current_carrier}`);
    }
    if (state.coverage_expiration) {
      lines.push(`Policy Renewal Date: ${state.coverage_expiration}`);
    } else if (state.renewal_window) {
      lines.push(`Policy Renewal Window: ${capitalize(state.renewal_window)}`);
    }
    if (state.usedDecShortcut) {
      lines.push('Declarations Page Shortcut: Yes');
    }
    if (state.previous_claims) {
      lines.push(`Primary Driver Accidents/Claims (Past 5 Years): ${capitalize(state.previous_claims)}`);
    }
    if (state.violations) {
      lines.push(`Primary Driver Tickets or Violations (Past 3 Years): ${capitalize(state.violations)}`);
    }
    if (state.homeowner) {
      lines.push(`Homeowner: ${capitalize(state.homeowner)}`);
    }

    if (state.driver_1_name) lines.push(`Primary Driver Name: ${state.driver_1_name}`);
    if (state.driver_1_dob) lines.push(`Primary Driver DOB: ${state.driver_1_dob}`);
    if (state.driver_1_marital) lines.push(`Primary Driver Marital Status: ${capitalize(state.driver_1_marital)}`);
    if (state.driver_1_gender) lines.push(`Primary Driver Gender: ${capitalize(state.driver_1_gender)}`);

    if (perVehicle()) {
      lines.push('Coverage Type: Different per vehicle');
      state.vehicles.forEach((v, i) => { if (vehCov(v).choice) lines.push(`Vehicle ${i + 1} (${vehLabel(v, i)}): ${vehCovText(v)}`); });
      if (state.liability_limits) lines.push(`Liability Limits (whole policy): ${state.liability_limits}`);
    } else {
      if (state.coverage_choice) lines.push(`Coverage Type: ${state.coverage_choice}${isMultiCar() ? ' (same on every vehicle)' : ''}`);
      if (state.liability_limits) lines.push(`Liability Limits: ${state.liability_limits}`);
      if (state.comp_deductible) lines.push(`Comprehensive Deductible: ${state.comp_deductible}`);
      if (state.collision_deductible) lines.push(`Collision Deductible: ${state.collision_deductible}`);
    }
    const extras = perVehicle() ? [state.medical_payments ? 'Medical payments' : ''].filter(Boolean) : [
      state.rental_reimbursement ? 'Rental car (loss of use)' : '',
      state.roadside_assistance ? 'Towing and roadside' : '',
      state.medical_payments ? 'Medical payments' : ''
    ].filter(Boolean);
    if (extras.length) lines.push(`Optional Extras: ${extras.join(', ')}`);

    if (state.street_address || state.city || state.zip_code) {
      const addr = [state.street_address, state.city, `${state.state || 'NC'} ${state.zip_code}`.trim()].filter(Boolean).join(', ');
      lines.push(`Home Address: ${addr}`);
    }

    if (state.has_other_drivers === 'no') {
      lines.push('Other Household Drivers: None');
    } else if (state.has_other_drivers === 'yes') {
      if (state.other_drivers.length === 0) {
        lines.push('Other Household Drivers: Yes (not yet entered)');
      } else {
        state.other_drivers.forEach((d, i) => {
          const parts = [
            d.name || 'Unnamed',
            d.dob ? `DOB: ${d.dob}` : '',
            d.marital ? capitalize(d.marital) : '',
            d.gender ? capitalize(d.gender) : '',
            d.claims ? `Accidents/claims (5 yrs): ${capitalize(d.claims)}` : '',
            d.violations ? `Tickets/violations (3 yrs): ${capitalize(d.violations)}` : ''
          ].filter(Boolean);
          lines.push(`Additional Driver ${i + 1}: ${parts.join(' · ')}`);
        });
      }
    }

    const cm = normalizeContactMethod(state.contact_method);
    if (cm) lines.push(`Preferred Contact Method: ${cm}`);
    if (state.additional_notes && state.additional_notes.trim()) {
      lines.push(`Additional Notes: ${state.additional_notes.trim()}`);
    }
    if (uploadedFiles.length > 0) {
      lines.push(`Files Selected (${uploadedFiles.length}): ${uploadedFiles.map(f => f.name).join(', ')}`);
    }

    return lines;
  }

  function sendPartialLeadStub(triggerReason) {
    if (finalSubmitted || partialLeadStubSent || !step11Completed || currentStepId === 'step_20') return;
    const digits = state.phone.replace(/\D/g, '');
    const email = (state.email || '').trim();
    if (!state.firstname.trim() || digits.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const dedupeKey = 'bli_partial_auto_v2_' + digits;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, '1');
    } catch (_) {}
    partialLeadStubSent = true;

    const stoppedAt = STEP_PLAIN_NAMES[currentStepId] || 'Auto quote form';
    const fullName = `${state.firstname} ${state.lastname}`.trim();
    const summary = buildPartialLeadLines(stoppedAt).join('\n');

    try {
      fetch('/api/homepage-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          formType: 'contact',
          name: `${TEST_PREFIX} [PARTIAL AUTO QUOTE - Stopped at: ${stoppedAt}] ${fullName}`.slice(0, 150),
          phone: String(state.phone).slice(0, 50),
          email: email.slice(0, 254),
          message: summary.slice(0, 4900)
        })
      }).catch(() => {});
    } catch (_) {}
    trackEvent('auto_v2_test_partial', { trigger_reason: triggerReason, stopped_at: stoppedAt, vehicle_count: state.vehicles.length });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (visibilityPartialTimer) clearTimeout(visibilityPartialTimer);
      visibilityPartialTimer = setTimeout(() => {
        if (document.visibilityState === 'hidden') sendPartialLeadStub('visibilitychange_hidden');
      }, 3000);
    } else if (visibilityPartialTimer) {
      clearTimeout(visibilityPartialTimer);
      visibilityPartialTimer = null;
    }
  });
  window.addEventListener('pagehide', () => {
    if (visibilityPartialTimer) clearTimeout(visibilityPartialTimer);
    sendPartialLeadStub('pagehide');
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        resolve(res.includes(',') ? res.split(',')[1] : res);
      };
      reader.onerror = () => reject(new Error('read-failed'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadAttachedFiles(notesText) {
    if (uploadedFiles.length === 0) return true;
    const encodedFiles = await Promise.all(uploadedFiles.map(async f => ({
      name: f.name,
      type: f.type || 'application/octet-stream',
      base64: await fileToBase64(f)
    })));
    const uResp = await fetch('/api/policy-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formType: 'policy-upload',
        policyType: 'auto',
        name: `${TEST_PREFIX} ${state.firstname} ${state.lastname}`.trim().slice(0, 150),
        phone: String(state.phone).slice(0, 50),
        email: String(state.email || '').slice(0, 254),
        currentCarrier: String(state.current_carrier || '').slice(0, 150),
        renewalDate: String(state.coverage_expiration || state.renewal_window || '').slice(0, 80),
        notes: `${TEST_PREFIX} Ref: ${lastConfirmationNumber} | ${notesText || ''}`.slice(0, 6000),
        files: encodedFiles
      })
    });
    const uJson = await uResp.json().catch(() => ({}));
    return !!(uResp.ok && uJson.ok === true);
  }

  async function retryUploadFiles() {
    if (retryingUpload || uploadedFiles.length === 0) return;
    retryingUpload = true;
    render();
    try {
      const ok = await uploadAttachedFiles(lastUploadNotes);
      if (ok) {
        uploadFailedAfterQuote = false;
        uploadRetrySuccess = true;
        uploadedFiles = [];
      } else {
        uploadFailedAfterQuote = true;
        focusAlertIdNextRender = 'v2-upload-warn';
      }
    } catch (_) {
      uploadFailedAfterQuote = true;
      focusAlertIdNextRender = 'v2-upload-warn';
    }
    retryingUpload = false;
    render();
  }

  async function submitLiveQuote() {
    if (submittingLive) return false;
    submittingLive = true;
    submitErrorMsg = '';
    uploadFailedAfterQuote = false;
    uploadRetrySuccess = false;
    finalSubmitted = true;
    if (partialTimer) clearTimeout(partialTimer);
    if (visibilityPartialTimer) clearTimeout(visibilityPartialTimer);
    render();

    const fullPayload = buildLivePayload();
    try {
      // 1. Submit primary quote to /api/quote-submit
      const qResp = await fetch('/api/quote-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      const qJson = await qResp.json().catch(() => ({}));
      if (!qResp.ok || qJson.ok !== true || !qJson.confirmationNumber) {
        throw new Error('We could not confirm receipt of your quote request. Your answers and files are still saved below — please try again or call us at 336-835-1993.');
      }
      lastConfirmationNumber = qJson.confirmationNumber;
      lastUploadNotes = fullPayload.additional_notes;

      window.__BLI_LAST_PAYLOAD__ = Object.assign({}, fullPayload, { confirmation_number: lastConfirmationNumber });
      trackEvent('auto_v2_test_submit', { confirmation_number: lastConfirmationNumber, used_dec_shortcut: state.usedDecShortcut });
      trackEvent('auto_v2_test_lead', { confirmation_number: lastConfirmationNumber, used_dec_shortcut: state.usedDecShortcut });
      clearSavedProgress();

      // 2. If declarations pages or registration photos were attached, send them via /api/policy-upload.
      //    If upload fails after quote succeeds, keep uploadedFiles and proceed to final screen with Retry option.
      if (uploadedFiles.length > 0) {
        try {
          const uploadOk = await uploadAttachedFiles(lastUploadNotes);
          if (!uploadOk) {
            uploadFailedAfterQuote = true;
            focusAlertIdNextRender = 'v2-upload-warn';
          }
        } catch (_) {
          uploadFailedAfterQuote = true;
          focusAlertIdNextRender = 'v2-upload-warn';
        }
      }

      submittingLive = false;
      return true;
    } catch (err) {
      // Quote submit failed: keep all answers and files intact so the user can retry.
      finalSubmitted = false;
      submittingLive = false;
      submitErrorMsg = err?.message || 'Something went wrong. Your answers and files are still saved — please try again or call us at 336-835-1993.';
      focusAlertIdNextRender = 'v2-submit-err';
      render();
      return false;
    }
  }

  // ─── DYNAMIC 20-STEP SEQUENCE ───
  function getSequence() {
    const seq = ['step_1', 'step_2', 'step_3'];
    if (!state.vehicles[0]?.isCustomMake) seq.push('step_4');

    if (state.vehicleCount >= 2) {
      const n = Math.min(Math.max(state.vehicles.length, 2), MAX_VEHICLES);
      for (let i = 1; i < n; i++) {
        seq.push(vehStep(2, i), vehStep(3, i));
        if (!state.vehicles[i]?.isCustomMake) seq.push(vehStep(4, i));
      }
      if (n < MAX_VEHICLES) seq.push('step_more');
    }

    seq.push('step_5');
    if (state.current_insurance === 'yes') {
      seq.push('step_6', 'step_7', 'step_8');
    }
    if (state.usedDecShortcut) {
      seq.push('step_11', 'step_18', 'step_20');
      return seq;
    }

    seq.push('step_10', 'step_11', 'step_12', 'step_9', 'step_17', 'step_13');   // all drivers together, before coverage
    if (needsLimits()) seq.push('step_14');
    if (anyFullCoverage() && !perVehicle()) seq.push('step_15');
    seq.push('step_16', 'step_18', 'step_19', 'step_20');
    return seq;
  }

  function tapAndAdvance(btn, onSelect) {
    if (isAdvancing) return;
    isAdvancing = true;
    // Show gold selected state + check badge immediately for 250ms before advancing
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('.v2-tile').forEach(sib => {
          sib.classList.remove('is-selected');
          sib.setAttribute('aria-pressed', 'false');
        });
      }
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
    }
    if (typeof onSelect === 'function') onSelect();
    saveSessionState();
    setTimeout(() => {
      isAdvancing = false;
      advanceToNext();
    }, 250);
  }

  async function enterStep(stepId, opts) {
    const pushHistory = !(opts && opts.fromPopstate) && !(opts && opts.isInit);
    showOtherMakeBox = false;
    showOlderYearBox = false;
    showOtherModelBox = false;
    showOtherInsurerBox = false;
    currentStepId = stepId;

    if (stepId === 'step_12' && !state.driver_1_name && (state.firstname || state.lastname)) {
      state.driver_1_name = `${state.firstname} ${state.lastname}`.trim();
    }

    if (pushHistory && window.history && typeof window.history.pushState === 'function') {
      try {
        window.history.pushState({ stepId, stack: historyStack.slice() }, '');
      } catch (_) {}
    }

    saveSessionState();
    trackEvent('auto_v2_step_view');

    if (stepId === 'step_1') {
      preloadUrls(activeSorted(logoConfig.carMakes).map(m => m.logo));
    } else if (stepId === 'step_5') {
      preloadUrls(activeSorted(logoConfig.currentInsurers).map(c => c.logo));
    }

    animateNextRender = !(opts && opts.isInit);
    focusHeadingNextRender = !(opts && opts.isInit);

    if (isVehStep(stepId, 4)) {
      const vIdx = vehStepIdx(stepId);
      const v = state.vehicles[vIdx];
      currentCuratedTiles = getCuratedModels(v.make, v.year).slice(0, 18);
      currentDropdownModels = currentCuratedTiles.slice();
      loadingModels = true;
      render();
      animateNextRender = false;
      focusHeadingNextRender = false;
      currentDropdownModels = await fetchDropdownModelsForMakeYear(v.make, v.year);
      loadingModels = false;
      if (currentCuratedTiles.length === 0 && currentDropdownModels.length === 0) showOtherModelBox = true;
    }
    const hadPendingAlert = !!focusAlertIdNextRender;
    render();
    if (!hadPendingAlert) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  window.addEventListener('popstate', e => {
    // A coverage help panel owns the first Back press: it closes the panel and the form stays on this question.
    if (window.BLICoverageHelp && window.BLICoverageHelp.handlePopstate()) return;
    if (vehSheetHandlePopstate()) return;
    isAdvancing = false;
    if (e.state && e.state.stepId) {
      if (Array.isArray(e.state.stack) && e.state.stack.length) {
        historyStack = e.state.stack.slice();
      } else {
        historyStack = [e.state.stepId];
      }
      editingFromReview = false;
      enterStep(e.state.stepId, { fromPopstate: true });
    }
  });

  function advanceToNext() {
    if (editReturnTo) {
      const t = editReturnTo;
      editReturnTo = null;
      if (t !== currentStepId && getSequence().includes(t)) { historyStack.push(t); enterStep(t); return; }
    }
    if (editingFromReview && currentStepId !== 'step_19') {
      if (currentStepId === 'step_13' && needsLimits() && !state.liability_limits) {
        historyStack.push('step_14');
        enterStep('step_14');
        return;
      }
      if ((currentStepId === 'step_13' || currentStepId === 'step_14') && !perVehicle() && anyFullCoverage() && !deductiblesComplete()) {
        historyStack.push('step_15');
        enterStep('step_15');
        return;
      }
      editingFromReview = false;
      historyStack.push('step_19');
      enterStep('step_19');
      return;
    }
    const seq = getSequence();
    const idx = seq.indexOf(currentStepId);
    const nextId = seq[idx + 1];
    if (!nextId) return;
    if (historyStack[historyStack.length - 1] !== nextId) historyStack.push(nextId);
    enterStep(nextId);
  }

  function goBack() {
    if (isAdvancing) return;
    editingFromReview = false;
    if (historyStack.length <= 1) return;
    if (window.history && window.history.state && window.history.state.stepId === currentStepId && historyStack.length > 1) {
      window.history.back();
      return;
    }
    historyStack.pop();
    enterStep(historyStack[historyStack.length - 1], { fromPopstate: true });
  }

  // ─── 3-BOX NUMERIC DATE CONTROL (MM / DD / YYYY -> YYYY-MM-DD) ───
  function parseIsoDateParts(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? { mm: m[2], dd: m[3], yyyy: m[1] } : { mm: '', dd: '', yyyy: '' };
  }

  function buildIsoFromParts(mm, dd, yyyy, allowFuture) {
    if (!/^\d{2}$/.test(mm) || !/^\d{2}$/.test(dd) || !/^\d{4}$/.test(yyyy)) return '';
    const mNum = Number(mm), dNum = Number(dd), yNum = Number(yyyy);
    if (mNum < 1 || mNum > 12 || dNum < 1 || dNum > 31) return '';
    if (allowFuture ? (yNum < 2020 || yNum > 2040) : (yNum < 1900 || yNum > 2026)) return '';
    const dt = new Date(yNum, mNum - 1, dNum);
    if (dt.getFullYear() !== yNum || dt.getMonth() !== mNum - 1 || dt.getDate() !== dNum) return '';
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderDateBoxes(prefix, isoValue, ariaPrefix) {
    const { mm, dd, yyyy } = parseIsoDateParts(isoValue);
    return `
      <div class="v2-date-group" data-date-group="${prefix}">
        <input id="${prefix}-mm" class="v2-input v2-date-part" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="10" enterkeyhint="next" autocomplete="bday-month" aria-label="${escapeHtml(ariaPrefix)} month (MM)" placeholder="MM" value="${escapeHtml(mm)}">
        <span class="v2-date-sep" aria-hidden="true">/</span>
        <input id="${prefix}-dd" class="v2-input v2-date-part" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" enterkeyhint="next" autocomplete="bday-day" aria-label="${escapeHtml(ariaPrefix)} day (DD)" placeholder="DD" value="${escapeHtml(dd)}">
        <span class="v2-date-sep" aria-hidden="true">/</span>
        <input id="${prefix}-yyyy" class="v2-input v2-date-part" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" enterkeyhint="next" autocomplete="bday-year" aria-label="${escapeHtml(ariaPrefix)} year (YYYY)" placeholder="YYYY" value="${escapeHtml(yyyy)}">
      </div>
      <div id="${prefix}-err" class="v2-field-err" role="alert" hidden></div>
    `;
  }

  function bindDateBoxes(prefix, allowFuture, onValidOrClear) {
    const mmEl = document.getElementById(`${prefix}-mm`);
    const ddEl = document.getElementById(`${prefix}-dd`);
    const yyEl = document.getElementById(`${prefix}-yyyy`);
    const errEl = document.getElementById(`${prefix}-err`);
    if (!mmEl || !ddEl || !yyEl) return;

    const clearErr = () => {
      [mmEl, ddEl, yyEl].forEach(el => el.classList.remove('is-error'));
      if (errEl) errEl.hidden = true;
    };

    const trySplitFullDate = (raw) => {
      const s = String(raw || '').trim();
      let m = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(s);
      if (m) {
        yyEl.value = m[1]; mmEl.value = m[2].padStart(2, '0'); ddEl.value = m[3].padStart(2, '0');
        return true;
      }
      m = /^(\d{1,2})[-\/\s](\d{1,2})[-\/\s](\d{4})$/.exec(s);
      if (m) {
        mmEl.value = m[1].padStart(2, '0'); ddEl.value = m[2].padStart(2, '0'); yyEl.value = m[3];
        return true;
      }
      const digits = s.replace(/\D/g, '');
      if (digits.length === 8) {
        mmEl.value = digits.slice(0, 2); ddEl.value = digits.slice(2, 4); yyEl.value = digits.slice(4, 8);
        return true;
      }
      return false;
    };

    const sync = (autoAdvanceFrom) => {
      clearErr();
      const mm = mmEl.value.replace(/\D/g, '');
      const dd = ddEl.value.replace(/\D/g, '');
      const yy = yyEl.value.replace(/\D/g, '');
      if (autoAdvanceFrom === 'mm' && mm.length >= 2) {
        mmEl.value = mm.slice(0, 2);
        ddEl.focus();
      } else {
        mmEl.value = mm.slice(0, 2);
      }
      if (autoAdvanceFrom === 'dd' && dd.length >= 2) {
        ddEl.value = dd.slice(0, 2);
        yyEl.focus();
      } else {
        ddEl.value = dd.slice(0, 2);
      }
      yyEl.value = yy.slice(0, 4);

      if (!mmEl.value && !ddEl.value && !yyEl.value) {
        onValidOrClear('');
        return;
      }
      if (mmEl.value.length === 2 && ddEl.value.length === 2 && yyEl.value.length === 4) {
        const iso = buildIsoFromParts(mmEl.value, ddEl.value, yyEl.value, allowFuture);
        if (iso) {
          onValidOrClear(iso);
        } else {
          [mmEl, ddEl, yyEl].forEach(el => el.classList.add('is-error'));
          if (errEl) {
            errEl.textContent = 'Please enter a valid date (MM / DD / YYYY).';
            errEl.hidden = false;
            focusAlertElement(errEl);
          }
          onValidOrClear('');
        }
      } else {
        onValidOrClear('');
      }
    };

    mmEl.addEventListener('paste', e => {
      const txt = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      if (trySplitFullDate(txt)) { e.preventDefault(); sync(); }
    });
    mmEl.addEventListener('input', () => {
      if (mmEl.value.length > 2 && trySplitFullDate(mmEl.value)) { sync(); return; }
      sync('mm');
    });
    ddEl.addEventListener('input', () => sync('dd'));
    yyEl.addEventListener('input', () => sync('yy'));

    ddEl.addEventListener('keydown', e => { if (e.key === 'Backspace' && !ddEl.value) mmEl.focus(); });
    yyEl.addEventListener('keydown', e => { if (e.key === 'Backspace' && !yyEl.value) ddEl.focus(); });
  }

  function focusAlertElement(el) {
    if (!el || el.hidden) return;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'alert');
    el.setAttribute('tabindex', '-1');
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
    try { el.focus({ preventScroll: true }); } catch (_) {}
  }

  function showFieldError(inputId, msg) {
    const el = document.getElementById(inputId);
    const errEl = document.getElementById(`${inputId}-err`) || document.getElementById('v2-step-err');
    if (el) {
      el.classList.add('is-error');
    }
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
      focusAlertElement(errEl);
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }

  function renderMobileBar() {
    const bar = document.getElementById('v2-mobile-bar');
    if (!bar) return;
    const showBack = historyStack.length > 1 && currentStepId !== 'step_20';
    // Find primary action button on current screen (if any)
    const primaryBtn = document.querySelector('#stage .v2-btn-gold');
    if (!showBack && !primaryBtn) {
      bar.hidden = true;
      bar.innerHTML = '';
      document.body.classList.remove('has-mobile-bar');
      return;
    }
    document.body.classList.add('has-mobile-bar');
    bar.hidden = false;
    bar.innerHTML = `
      ${showBack ? '<button type="button" class="v2-mobile-back" id="v2-m-back">&larr; Back</button>' : ''}
      ${primaryBtn ? `<button type="button" class="v2-btn-gold v2-mobile-next" id="v2-m-next">${primaryBtn.innerHTML}</button>` : ''}
    `;
    const mBack = document.getElementById('v2-m-back');
    if (mBack) mBack.addEventListener('click', goBack);
    const mNext = document.getElementById('v2-m-next');
    if (mNext && primaryBtn) {
      mNext.addEventListener('click', () => primaryBtn.click());
    }
  }

  function formatPhone(val) {
    const d = (val || '').replace(/\D/g, '').slice(0, 10);
    if (d.length >= 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length >= 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return d;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function cleanVin(raw) {
    return String(raw || '').toUpperCase().replace(/[\s-]+/g, '');
  }

  function isValidVin(cleaned) {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned);
  }

  function shrinkImageIfNeeded(file) {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
    if (isPdf) return Promise.resolve(file);
    const isImage = /^image\//i.test(file.type || '') || /\.(jpg|jpeg|png|heic|heif|webp)$/i.test(file.name || '');
    if (!isImage) return Promise.resolve(file);

    return new Promise(resolve => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          URL.revokeObjectURL(url);
          if (!w || !h) { resolve(file); return; }
          const longest = Math.max(w, h);
          const scale = longest > MAX_PHOTO_DIM ? (MAX_PHOTO_DIM / longest) : 1;
          const tw = Math.max(1, Math.round(w * scale));
          const th = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, tw, th);
          ctx.drawImage(img, 0, 0, tw, th);
          canvas.toBlob(blob => {
            if (!blob) { resolve(file); return; }
            const baseName = (file.name || 'photo.jpg').replace(/\.[^.]+$/, '');
            const shrunk = new File([blob], `${baseName}.jpg`, {
              type: 'image/jpeg',
              lastModified: file.lastModified || Date.now()
            });
            resolve(shrunk.size < file.size || scale < 1 ? shrunk : file);
          }, 'image/jpeg', PHOTO_JPEG_QUALITY);
        } catch (_) {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  async function handleIncomingFiles(fileList, category) {
    uploadErrorMsg = '';
    const files = Array.from(fileList || []);
    let runningTotal = uploadedFiles.reduce((s, f) => s + f.size, 0);
    for (const rawFile of files) {
      if (uploadedFiles.length >= MAX_FILES) {
        uploadErrorMsg = `You can attach up to ${MAX_FILES} files here. You can text any extra pages to (336) 827-9065.`;
        break;
      }
      const validType = ALLOWED_MIME.includes(rawFile.type) || ALLOWED_EXT.test(rawFile.name || '');
      if (!validType) {
        uploadErrorMsg = `"${rawFile.name}" is not a supported file type. Please choose a PDF, JPG, PNG, or HEIC file.`;
        continue;
      }
      const processed = await shrinkImageIfNeeded(rawFile);
      if (processed.size > MAX_BYTES_PER_FILE) {
        uploadErrorMsg = `"${processed.name}" is too large (${formatFileSize(processed.size)}). Each file must be 8 MB or smaller.`;
        continue;
      }
      if (runningTotal + processed.size > MAX_TOTAL_BYTES) {
        uploadErrorMsg = 'Total attachments cannot exceed 12 MB. Remove a file or use a smaller photo.';
        break;
      }
      processed._category = category || 'declarations';
      uploadedFiles.push(processed);
      runningTotal += processed.size;
    }
    if (uploadErrorMsg) focusAlertIdNextRender = 'v2-upload-err';
    render();
  }

  function removeUploadedFile(idx) {
    uploadedFiles.splice(idx, 1);
    uploadErrorMsg = '';
    if (uploadedFiles.length === 0) state.usedDecShortcut = false;
    render();
  }

  function renderUploadWidget(context, categoryFilter) {
    const visibleFiles = uploadedFiles
      .map((f, i) => ({ f, i }))
      .filter(({ f }) => !categoryFilter || (f._category || 'declarations') === categoryFilter);
    const listHtml = visibleFiles.length ? `
      <ul class="v2-file-list" aria-label="Selected files">
        ${visibleFiles.map(({ f, i }) => `
          <li class="v2-file-item">
            <span><span class="v2-file-name">${escapeHtml(f.name)}</span><span class="v2-file-size">(${formatFileSize(f.size)})</span></span>
            <button type="button" class="v2-edit-btn" data-remove-file="${i}" aria-label="Remove ${escapeHtml(f.name)}">Remove</button>
          </li>
        `).join('')}
      </ul>
    ` : '';
    return `
      <div class="v2-upload-box">
        <input id="v2-file-input-${context}" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,application/pdf,image/jpeg,image/png,image/heic" multiple hidden>
        <input id="v2-camera-input-${context}" type="file" accept="image/*" capture="environment" multiple hidden>
        <div class="v2-upload-btns">
          <button type="button" class="v2-btn-navy" id="v2-btn-choose-${context}">Choose files (PDF or photo)</button>
          <button type="button" class="v2-btn-outline" id="v2-btn-camera-${context}">Take a photo</button>
        </div>
        <p class="v2-upload-meta">PDF, JPG, PNG, or HEIC &middot; Up to 8 MB per file &middot; Up to 6 files (12 MB total; photos resized automatically)</p>
        ${uploadErrorMsg ? `<div id="v2-upload-err" class="v2-error" role="alert" tabindex="-1">${escapeHtml(uploadErrorMsg)}</div>` : ''}
        ${listHtml}
      </div>
    `;
  }

  function bindUploadWidget(context, category) {
    const fInput = document.getElementById(`v2-file-input-${context}`);
    const cInput = document.getElementById(`v2-camera-input-${context}`);
    const btnChoose = document.getElementById(`v2-btn-choose-${context}`);
    const btnCam = document.getElementById(`v2-btn-camera-${context}`);
    if (btnChoose && fInput) btnChoose.addEventListener('click', () => fInput.click());
    if (btnCam && cInput) btnCam.addEventListener('click', () => cInput.click());
    if (fInput) fInput.addEventListener('change', e => { handleIncomingFiles(e.target.files, category); e.target.value = ''; });
    if (cInput) cInput.addEventListener('change', e => { handleIncomingFiles(e.target.files, category); e.target.value = ''; });
    document.querySelectorAll('[data-remove-file]').forEach(btn => {
      btn.addEventListener('click', () => removeUploadedFile(Number(btn.dataset.removeFile)));
    });
  }

  // ─── VEHICLES: one compact button at the top, a slide-up list to edit or remove ───
  // Replaces the row of vehicle pills, which pushed the question down the screen on phones.
  let vinBoxesOpen = false;   // step 18: the typed-VIN boxes stay folded away until asked for
  let vehSheetEl = null, vehSheetOpen = false, vehSheetPushed = false, vehSheetSkipPop = false, vehSheetAfterPop = null, vehSheetTrigger = null;

  function enteredVehicles() {
    return state.vehicles.map((v, idx) => ({ v, idx })).filter(x => x.v && x.v.make);
  }

  function renderChips() {
    const el = document.getElementById('v2-chips');
    const list = enteredVehicles();
    if (['step_20', 'step_13', 'step_14', 'step_15'].includes(currentStepId) || !list.length) { el.innerHTML = ''; return; }
    const names = list.map(x => [x.v.year, x.v.make, x.v.model].filter(Boolean).join(' '));
    const count = list.length === 1 ? '1 vehicle' : `${list.length} vehicles`;
    el.innerHTML = `
      <button type="button" class="v2-veh-summary" id="v2-veh-open" aria-haspopup="dialog" aria-label="${escapeHtml(count)}: ${escapeHtml(names.join(', '))}. Edit vehicles">
        <span class="v2-veh-summary-count">${escapeHtml(count)}</span>
        <span class="v2-veh-summary-names">${list.length === 1 ? escapeHtml(names[0]) : ''}</span>
        <span class="v2-veh-summary-edit">Edit</span>
      </button>`;
    const openBtn = document.getElementById('v2-veh-open');
    if (openBtn) openBtn.addEventListener('click', () => openVehSheet(openBtn));
  }

  function buildVehSheet() {
    if (vehSheetEl) return;
    vehSheetEl = document.createElement('div');
    vehSheetEl.className = 'v2-help-overlay v2-veh-overlay';
    vehSheetEl.hidden = true;
    vehSheetEl.innerHTML = `
      <div class="v2-help-sheet" role="dialog" aria-modal="true" aria-labelledby="v2-vehsheet-title" tabindex="-1">
        <div class="v2-help-grip" aria-hidden="true"></div>
        <div class="v2-help-head">
          <h2 class="v2-help-title" id="v2-vehsheet-title">Your vehicles</h2>
          <button type="button" class="v2-help-x" data-vehsheet-close aria-label="Close">&times;</button>
        </div>
        <div class="v2-vehsheet-list" id="v2-vehsheet-list"></div>
        <button type="button" class="v2-btn-outline v2-vehsheet-add" id="v2-vehsheet-add" data-vehsheet-add>+ Add another vehicle</button>
        <button type="button" class="v2-btn-gold v2-help-ok" data-vehsheet-close>Done</button>
      </div>`;
    document.body.appendChild(vehSheetEl);
    vehSheetEl.addEventListener('click', e => {
      if (e.target === vehSheetEl || e.target.closest('[data-vehsheet-close]')) { closeVehSheet(); return; }
      const editBtn = e.target.closest('[data-vehsheet-edit]');
      if (editBtn) {
        const target = vehStep(2, Number(editBtn.dataset.vehsheetEdit));
        closeVehSheet(() => { historyStack.push(target); enterStep(target); });
        return;
      }
      if (e.target.closest('[data-vehsheet-add]')) {
        closeVehSheet(() => addAnotherVehicle());
        return;
      }
      const remBtn = e.target.closest('[data-vehsheet-remove]');
      if (remBtn) {
        const i = Number(remBtn.dataset.vehsheetRemove);
        if (remBtn.dataset.armed !== '1') {           // two taps to remove, so a slip of the thumb does not delete a car
          vehSheetEl.querySelectorAll('[data-vehsheet-remove]').forEach(b => { b.dataset.armed = ''; b.textContent = 'Remove'; b.classList.remove('is-armed'); });
          remBtn.dataset.armed = '1';
          remBtn.textContent = 'Tap again to remove';
          remBtn.classList.add('is-armed');
          return;
        }
        if (state.vehicles.length > 1) {
          state.vehicles.splice(i, 1);
          state.vehicleCount = state.vehicles.length;
          if (typeof state.cov_open === 'number' && state.cov_open >= state.vehicles.length) state.cov_open = 0;
          saveSessionState();
          render();
          fillVehSheet();
        } else {
          state.vehicles[0] = emptyVeh();
          saveSessionState();
          closeVehSheet(() => { historyStack.push('step_2'); enterStep('step_2'); });
        }
      }
    });
    document.addEventListener('keydown', e => {
      if (vehSheetOpen && e.key === 'Escape') { e.preventDefault(); closeVehSheet(); }
    });
  }

  // Adds an empty vehicle (up to four) and goes to its make question.
  function addAnotherVehicle() {
    state.vehicles = state.vehicles.filter((v, i) => i === 0 || (v && v.make));
    if (state.vehicles.length >= MAX_VEHICLES) return;
    state.vehicles.push(emptyVeh());
    state.vehicleCount = Math.max(2, state.vehicles.length);
    saveSessionState();
    const target = vehStep(2, state.vehicles.length - 1);
    historyStack.push(target);
    enterStep(target);
  }

  function fillVehSheet() {
    const box = document.getElementById('v2-vehsheet-list');
    if (!box) return;
    const addBtn = document.getElementById('v2-vehsheet-add');
    if (addBtn) addBtn.hidden = enteredVehicles().length >= MAX_VEHICLES;
    box.innerHTML = enteredVehicles().map(x => {
      const label = [x.v.year, x.v.make, x.v.model].filter(Boolean).join(' ');
      return `
        <div class="v2-vehsheet-row">
          <span class="v2-vehsheet-name">${escapeHtml(label)}</span>
          <span class="v2-vehsheet-actions">
            <button type="button" class="v2-vehsheet-btn" data-vehsheet-edit="${x.idx}" aria-label="Edit ${escapeHtml(label)}">Edit</button>
            <button type="button" class="v2-vehsheet-btn is-remove" data-vehsheet-remove="${x.idx}" aria-label="Remove ${escapeHtml(label)}">Remove</button>
          </span>
        </div>`;
    }).join('');
  }

  function openVehSheet(trigger) {
    buildVehSheet();
    vehSheetTrigger = trigger || null;
    fillVehSheet();
    vehSheetEl.hidden = false;
    document.body.classList.add('v2-help-open');
    vehSheetOpen = true;
    // One extra history entry so the phone's Back button closes the list instead of leaving the question.
    try {
      window.history.pushState(Object.assign({}, window.history.state || {}, { v2vehsheet: true }), '');
      vehSheetPushed = true;
    } catch (_) { vehSheetPushed = false; }
    requestAnimationFrame(() => {
      vehSheetEl.classList.add('is-in');
      const sheet = vehSheetEl.querySelector('.v2-help-sheet');
      try { sheet.focus({ preventScroll: true }); } catch (_) {}
    });
  }

  function hideVehSheet() {
    if (!vehSheetEl || !vehSheetOpen) return;
    vehSheetOpen = false;
    vehSheetEl.classList.remove('is-in');
    vehSheetEl.hidden = true;
    document.body.classList.remove('v2-help-open');
  }

  // after: optional action to run once the list is closed (for example, go and edit a vehicle).
  function closeVehSheet(after) {
    if (!vehSheetOpen) { if (after) after(); return; }
    hideVehSheet();
    if (vehSheetPushed) {
      vehSheetPushed = false;
      vehSheetSkipPop = true;
      vehSheetAfterPop = after || null;
      try { window.history.back(); } catch (_) { vehSheetSkipPop = false; vehSheetAfterPop = null; if (after) after(); }
    } else if (after) {
      after();
    }
    if (!after) {
      const t = document.getElementById('v2-veh-open');
      if (t) { try { t.focus({ preventScroll: true }); } catch (_) {} }
    }
  }

  // Called first by the popstate handler. True when the event belonged to the vehicle list.
  function vehSheetHandlePopstate() {
    if (vehSheetSkipPop) {
      vehSheetSkipPop = false;
      const f = vehSheetAfterPop; vehSheetAfterPop = null;
      if (f) f();
      return true;
    }
    if (vehSheetOpen) { vehSheetPushed = false; hideVehSheet(); return true; }
    return false;
  }

  function renderTrustStrip() {
    const el = document.getElementById('v2-trust-logos');
    el.innerHTML = activeSorted(logoConfig.representedAutoCarriers).map(c => {
      if (!forceEmptyLogos && c.logo) {
        return `<img src="${escapeHtml(c.logo)}" alt="${escapeHtml(c.name)}" width="100" height="26">`;
      }
      return `<span class="v2-trust-text">${escapeHtml(c.name)}</span>`;
    }).join('');
  }

  function updateProgress() {
    const seq = getSequence();
    const idx = Math.max(0, seq.indexOf(currentStepId));
    const pct = currentStepId === 'step_20'
      ? 100
      : Math.min(96, Math.round(12 + (idx / Math.max(1, seq.length - 1)) * 86));
    document.getElementById('v2-progress-fill').style.width = pct + '%';
    document.getElementById('v2-progressbar').setAttribute('aria-valuenow', String(pct));
    document.getElementById('v2-progress-label').textContent = `${pct}%`;
  }

  // Coverage help: a round "?" beside a label, or a text link under a heading. Wording lives in coverage-help.js.
  function helpBtn(key) {
    const H = window.BLICoverageHelp;
    if (!H || !H.has(key)) return '';
    return `<button type="button" class="v2-help-btn" data-help="${key}" aria-label="What is this? ${escapeHtml(H.title(key))}"><span aria-hidden="true">?</span></button>`;
  }
  function helpLink(key, text) {
    const H = window.BLICoverageHelp;
    if (!H || !H.has(key)) return '';
    return `<p class="v2-help-link-row"><button type="button" class="v2-help-link" data-help="${key}"><span class="v2-help-dot" aria-hidden="true">?</span>${escapeHtml(text)}</button></p>`;
  }

  function whyNote(text) {
    return `
      <div class="v2-why">
        <span class="v2-why-badge" aria-hidden="true">i</span>
        <div><strong>Why we ask</strong><p>${escapeHtml(text)}</p></div>
      </div>
    `;
  }

  function logoTileHtml(name, logoUrl, isSelected, dataAttr, opts) {
    const hasLogo = !forceEmptyLogos && logoUrl && logoUrl.trim() !== '';
    const isCarrier = !!(opts && opts.carrier);
    const isWide = !!(opts && opts.wide);
    const showLabel = !hasLogo || !!(opts && opts.showLabel);
    const imgCls = isWide ? 'is-wide-logo' : (isCarrier ? 'is-carrier-logo' : '');
    const dims = isCarrier ? 'width="132" height="60"' : 'width="84" height="60"';
    const safeName = escapeHtml(name);
    const labelCls = hasLogo && showLabel ? 'has-label' : '';
    const inner = hasLogo
      ? `<span class="v2-logo-frame"><img src="${escapeHtml(logoUrl)}" alt="${safeName}" ${dims} class="${imgCls}" onerror="this.parentElement.innerHTML='<span class=\\'v2-logo-text\\'>${safeName}</span>'"></span>${showLabel ? `<span class="v2-logo-caption">${safeName}</span>` : ''}`
      : `<span class="v2-logo-frame"><span class="v2-logo-text">${safeName}</span></span>`;
    return `<button type="button" class="v2-tile logo-tile ${labelCls} ${isSelected ? 'is-selected' : ''}" aria-label="${safeName}" aria-pressed="${isSelected ? 'true' : 'false'}" ${dataAttr}>${inner}</button>`;
  }

  function findMakeMeta(name) {
    const found = (logoConfig.carMakes || []).find(m => m.name.toLowerCase() === name.toLowerCase());
    return found || { name, logo: '', wide: false, showLabel: true };
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function render() {
    updateProgress();
    renderChips();

    const stage = document.getElementById('stage');
    const showBack = historyStack.length > 1 && currentStepId !== 'step_20';
    const backBar = `<div class="v2-back-row"><button type="button" class="v2-back-link" id="v2-back" ${showBack ? '' : 'hidden'}>&larr; Back</button></div>`;
    let body = '';

    // STEP 1: How many vehicles?
    if (currentStepId === 'step_1') {
      const resumeBanner = pendingResumeData ? `
        <div class="v2-resume-card" role="region" aria-label="Resume saved quote">
          <div class="v2-resume-title">Welcome back! Pick up where you left off?</div>
          <p class="v2-resume-sub">We saved your answers on this device so you don't have to start from scratch.</p>
          <div class="v2-resume-actions">
            <button type="button" class="v2-btn-gold" id="v2-resume-btn">Pick up where you left off</button>
            <button type="button" class="v2-btn-outline" id="v2-startover-btn">Start over</button>
          </div>
        </div>
      ` : '';
      body = `
        ${resumeBanner}
        <h1 class="v2-heading" tabindex="-1">How many vehicles are you insuring?</h1>
        <p class="v2-sub">Tap an option to start. A licensed North Carolina team compares six carriers for you.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${state.vehicleCount === 1 ? 'is-selected' : ''}" aria-pressed="${state.vehicleCount === 1 ? 'true' : 'false'}" data-veh-count="1">
            ${iconHtml('car1')}<span>1 Vehicle</span>
          </button>
          <button type="button" class="v2-tile ${state.vehicleCount >= 2 ? 'is-selected' : ''}" aria-pressed="${state.vehicleCount >= 2 ? 'true' : 'false'}" data-veh-count="2">
            ${iconHtml('car2')}<span>2+ Vehicles</span>
          </button>
        </div>
      `;
    }

    // STEP 2 / 2b: Vehicle Make
    else if (currentStepId === 'step_more') {
      const have = enteredVehicles().length;
      body = `
        <h1 class="v2-heading" tabindex="-1">Any more vehicles to add?</h1>
        <p class="v2-sub">You have added ${have} vehicles. You can add up to ${MAX_VEHICLES}.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile" aria-pressed="false" id="v2-more-yes">
            ${iconHtml('car2')}<span>Add another vehicle</span>
          </button>
          <button type="button" class="v2-tile" aria-pressed="false" id="v2-more-no">
            ${iconHtml('car1')}<span>No, that&rsquo;s all</span>
          </button>
        </div>
      `;
    }

    else if (isVehStep(currentStepId, 2)) {
      const vIdx = vehStepIdx(currentStepId);
      const v = state.vehicles[vIdx] || (state.vehicles[vIdx] = emptyVeh());
      const label = state.vehicleCount >= 2 ? VEH_ORDINAL[vIdx] : '';
      const activeCarMakes = activeSorted(logoConfig.carMakes);
      const tileMakes = activeCarMakes.length ? activeCarMakes.map(m => m.name) : (makesConfig.tileMakes || FALLBACK_MAKES.tileMakes);
      const dropdownMakes = [...tileMakes, ...(makesConfig.dropdownOnlyMakes || FALLBACK_MAKES.dropdownOnlyMakes)];
      const customOpen = showOtherMakeBox || v.isCustomMake;

      body = `
        <h1 class="v2-heading">What is your ${label ? label + ' ' : ''}vehicle's make?</h1>
        <p class="v2-sub">${vIdx === 1 ? 'Have more than two vehicles? You can add more after this one.' : 'Tap a make below or choose from the dropdown.'}</p>
        <div class="v2-grid-3">
          ${tileMakes.map(name => {
            const meta = findMakeMeta(name);
            return logoTileHtml(name, meta.logo, !v.isCustomMake && v.make === name, `data-pick-make="${escapeHtml(name)}" data-vidx="${vIdx}"`, { wide: !!meta.wide, showLabel: !!meta.showLabel });
          }).join('')}
        </div>
        <div class="v2-col">
          <div class="v2-field">
            <label for="v2-make-dd">Select make</label>
            <select id="v2-make-dd" class="v2-select" data-vidx="${vIdx}">
              <option value="">Select make...</option>
              ${dropdownMakes.map(m => `<option value="${escapeHtml(m)}" ${(!v.isCustomMake && v.make === m) || (v.isCustomMake && m === 'Other') ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
            </select>
          </div>
          ${customOpen ? `
            <div class="v2-driver-card">
              <div class="v2-row-2">
                <div class="v2-field">
                  <label for="v2-custom-make">Vehicle make</label>
                  <input id="v2-custom-make" class="v2-input" type="text" value="${escapeHtml(v.isCustomMake ? v.make : '')}">
                </div>
                <div class="v2-field">
                  <label for="v2-custom-model">Vehicle model</label>
                  <input id="v2-custom-model" class="v2-input" type="text" value="${escapeHtml(v.isCustomMake ? v.model : '')}">
                </div>
              </div>
              <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
              <button type="button" class="v2-btn-gold" id="v2-custom-make-next" data-vidx="${vIdx}">Continue &rarr;</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    // STEP 3 / 3b: Vehicle Year
    else if (isVehStep(currentStepId, 3)) {
      const vIdx = vehStepIdx(currentStepId);
      const v = state.vehicles[vIdx];
      const olderOpen = showOlderYearBox || (v.year && Number(v.year) < 1981);

      body = `
        <h1 class="v2-heading">What year is your ${escapeHtml(v.make)}${v.isCustomMake && v.model ? ' ' + escapeHtml(v.model) : ''}?</h1>
        <p class="v2-sub">Tap a model year below or choose an older year from the dropdown.</p>
        <div class="v2-grid-3">
          ${TOP_YEARS.map(yr => `
            <button type="button" class="v2-tile compact ${v.year === yr ? 'is-selected' : ''}" aria-pressed="${v.year === yr ? 'true' : 'false'}" data-pick-year="${yr}" data-vidx="${vIdx}">${yr}</button>
          `).join('')}
        </div>
        <div class="v2-col">
          <div class="v2-field">
            <label for="v2-year-dd">Older model year</label>
            <select id="v2-year-dd" class="v2-select" data-vidx="${vIdx}">
              <option value="">Select year (1981–2026)...</option>
              ${DROPDOWN_YEARS.map(yr => `<option value="${yr}" ${v.year === yr ? 'selected' : ''}>${yr}</option>`).join('')}
              <option value="OLDER" ${olderOpen ? 'selected' : ''}>Older than 1981</option>
            </select>
          </div>
          ${olderOpen ? `
            <div class="v2-driver-card">
              <div class="v2-field">
                <label for="v2-older-year">Enter vehicle year (before 1981)</label>
                <input id="v2-older-year" class="v2-input" type="text" inputmode="numeric" maxlength="4" placeholder="1978" value="${escapeHtml(v.year && Number(v.year) < 1981 ? v.year : '')}">
              </div>
              <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
              <button type="button" class="v2-btn-gold" id="v2-older-year-next" data-vidx="${vIdx}">Continue &rarr;</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    // STEP 4 / 4b: Vehicle Model
    else if (isVehStep(currentStepId, 4)) {
      const vIdx = vehStepIdx(currentStepId);
      const v = state.vehicles[vIdx];
      const hasTiles = currentCuratedTiles.length > 0;
      const hasDropdown = currentDropdownModels.length > 0;
      const customOpen = showOtherModelBox || (!loadingModels && !hasTiles && !hasDropdown);

      body = `
        <h1 class="v2-heading">What is your ${escapeHtml(v.year)} ${escapeHtml(v.make)} model?</h1>
        <p class="v2-sub">${
          hasTiles
            ? 'Tap your model below or choose from the full list.'
            : (loadingModels
                ? 'Loading models for ' + escapeHtml(v.year) + ' ' + escapeHtml(v.make) + '...'
                : (hasDropdown ? 'Choose your model from the dropdown below, or type it if it is not listed.' : 'Type your vehicle model below.'))
        }</p>
        ${hasTiles ? `
          <div class="v2-grid-3">
            ${currentCuratedTiles.map(mod => `
              <button type="button" class="v2-tile compact ${v.model === mod ? 'is-selected' : ''}" aria-pressed="${v.model === mod ? 'true' : 'false'}" data-pick-model="${escapeHtml(mod)}" data-vidx="${vIdx}">${escapeHtml(mod)}</button>
            `).join('')}
          </div>
        ` : ''}
        ${(!loadingModels || hasTiles) && (hasDropdown || hasTiles) ? `
          <div class="v2-col">
            <div class="v2-field">
              <label for="v2-model-dd">All ${escapeHtml(v.year)} ${escapeHtml(v.make)} models</label>
              <select id="v2-model-dd" class="v2-select" data-vidx="${vIdx}">
                <option value="">Select model...</option>
                ${currentDropdownModels.map(mod => `<option value="${escapeHtml(mod)}" ${v.model === mod ? 'selected' : ''}>${escapeHtml(mod)}</option>`).join('')}
                <option value="__NOT_LISTED__" ${customOpen ? 'selected' : ''}>My model is not listed</option>
              </select>
            </div>
          </div>
        ` : ''}
        ${!loadingModels && customOpen ? `
          <div class="v2-col">
            <div class="v2-driver-card">
              <div class="v2-field">
                <label for="v2-custom-model-input">Enter your ${escapeHtml(v.year)} ${escapeHtml(v.make)} model</label>
                <input id="v2-custom-model-input" class="v2-input" type="text" value="${escapeHtml(v.model)}">
              </div>
              <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
              <button type="button" class="v2-btn-gold" id="v2-custom-model-next" data-vidx="${vIdx}">Continue &rarr;</button>
            </div>
          </div>
        ` : ''}
      `;
    }

    // STEP 5: Currently insured?
    else if (currentStepId === 'step_5') {
      body = `
        <h1 class="v2-heading">Are you currently insured?</h1>
        <p class="v2-sub">Whether you have active coverage or are starting a new policy, our team can help.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${state.current_insurance === 'yes' ? 'is-selected' : ''}" aria-pressed="${state.current_insurance === 'yes' ? 'true' : 'false'}" data-insured="yes">
            ${iconHtml('insuredYes')}<span>Yes</span>
          </button>
          <button type="button" class="v2-tile ${state.current_insurance === 'no' ? 'is-selected' : ''}" aria-pressed="${state.current_insurance === 'no' ? 'true' : 'false'}" data-insured="no">
            ${iconHtml('insuredNo')}<span>No</span>
          </button>
        </div>
      `;
    }

    // STEP 6: Current insurer
    else if (currentStepId === 'step_6') {
      const insurers = activeSorted(logoConfig.currentInsurers);
      body = `
        <h1 class="v2-heading">Who is your current insurer?</h1>
        <p class="v2-sub">Tap your current company so our team knows what to compare against.</p>
        <div class="v2-grid-3">
          ${insurers.map(c => logoTileHtml(c.name, c.logo, state.current_carrier === c.name || (c.name === 'Other' && showOtherInsurerBox), `data-pick-carrier="${escapeHtml(c.name)}"`, { carrier: true, showLabel: !!c.showLabel })).join('')}
        </div>
        ${showOtherInsurerBox ? `
          <div class="v2-col">
            <div class="v2-driver-card">
              <div class="v2-field">
                <label for="v2-other-insurer">Enter your current insurance company</label>
                <input id="v2-other-insurer" class="v2-input" type="text" value="${escapeHtml(state.current_carrier && state.current_carrier !== 'Other' ? state.current_carrier : '')}">
              </div>
              <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
              <button type="button" class="v2-btn-gold" id="v2-other-insurer-next">Continue &rarr;</button>
            </div>
          </div>
        ` : ''}
      `;
    }

    // STEP 7: Policy renewal timing (tiles + optional 3-box exact date)
    else if (currentStepId === 'step_7') {
      body = `
        <h1 class="v2-heading" tabindex="-1">When does your policy renew?</h1>
        <p class="v2-sub">Tap a timeframe below, or enter your exact renewal date if you know it.</p>
        <div class="v2-grid-2">
          ${RENEWAL_OPTS.map(o => `
            <button type="button" class="v2-tile compact ${state.renewal_window === o.val && !state.coverage_expiration ? 'is-selected' : ''}" aria-pressed="${state.renewal_window === o.val && !state.coverage_expiration ? 'true' : 'false'}" data-renewal="${escapeHtml(o.val)}">${escapeHtml(o.label)}</button>
          `).join('')}
        </div>
        <div class="v2-col">
          <div class="v2-field">
            <label for="renewal-date-mm">Know the exact date? (optional)</label>
            ${renderDateBoxes('renewal-date', state.coverage_expiration, 'Policy renewal date')}
          </div>
          ${state.coverage_expiration ? `<button type="button" class="v2-btn-gold" id="v2-step7-date-next">Continue with ${escapeHtml(state.coverage_expiration)} &rarr;</button>` : ''}
        </div>
      `;
    }

    // STEP 8: Declarations Page Shortcut
    else if (currentStepId === 'step_8') {
      const showUploader = state.decShortcutChoice === 'upload' || uploadedFiles.some(f => (f._category || 'declarations') === 'declarations');
      body = `
        <h1 class="v2-heading">Have your policy handy?</h1>
        <p class="v2-sub">Upload your declarations page and skip most of the questions.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${showUploader ? 'is-selected' : ''}" aria-pressed="${showUploader ? 'true' : 'false'}" id="v2-dec-upload-tile">
            ${iconHtml('uploadDoc')}<span>Upload my declarations page</span>
          </button>
          <button type="button" class="v2-tile ${state.decShortcutChoice === 'questions' ? 'is-selected' : ''}" aria-pressed="${state.decShortcutChoice === 'questions' ? 'true' : 'false'}" id="v2-dec-skip-tile">
            ${iconHtml('listDoc')}<span>Keep answering questions</span>
          </button>
        </div>
        ${showUploader ? renderUploadWidget('step8', 'declarations') : ''}
        ${showUploader && uploadedFiles.length > 0 ? `
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="v2-dec-continue">Continue with ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} &rarr;</button>
          </div>
        ` : ''}
      `;
    }

    // STEP 9: Driving Record (ONE screen, two Yes/No rows; Continue appears when both answered)
    else if (currentStepId === 'step_9') {
      const bothAnswered = !!(state.previous_claims && state.violations);
      body = `
        <h1 class="v2-heading">Driving record for ${escapeHtml(state.driver_1_name || `${state.firstname} ${state.lastname}`.trim() || 'the primary driver')}</h1>
        <p class="v2-sub">Just this driver. We&rsquo;ll ask about each other driver when you add them.</p>
        <div class="v2-group-block">
          <div class="v2-group-title">Any accidents or claims in the past 5 years?</div>
          <div class="v2-grid-2" style="margin-bottom:0">
            <button type="button" class="v2-tile ${state.previous_claims === 'yes' ? 'is-selected' : ''}" aria-pressed="${state.previous_claims === 'yes' ? 'true' : 'false'}" data-claims="yes">
              ${iconHtml('recordYesAlert')}<span>Yes</span>
            </button>
            <button type="button" class="v2-tile ${state.previous_claims === 'no' ? 'is-selected' : ''}" aria-pressed="${state.previous_claims === 'no' ? 'true' : 'false'}" data-claims="no">
              ${iconHtml('recordNoCheck')}<span>No</span>
            </button>
          </div>
        </div>
        <div class="v2-group-block">
          <div class="v2-group-title">Any tickets or violations in the past 3 years?</div>
          <div class="v2-grid-2" style="margin-bottom:0">
            <button type="button" class="v2-tile ${state.violations === 'yes' ? 'is-selected' : ''}" aria-pressed="${state.violations === 'yes' ? 'true' : 'false'}" data-violations="yes">
              ${iconHtml('recordYesAlert')}<span>Yes</span>
            </button>
            <button type="button" class="v2-tile ${state.violations === 'no' ? 'is-selected' : ''}" aria-pressed="${state.violations === 'no' ? 'true' : 'false'}" data-violations="no">
              ${iconHtml('recordNoCheck')}<span>No</span>
            </button>
          </div>
        </div>
        ${bothAnswered ? `
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="v2-step9-next">Continue &rarr;</button>
          </div>
        ` : ''}
        ${whyNote('North Carolina insurers rate claims and tickets differently. Knowing both up front helps our team match you with the right carriers.')}
      `;
    }

    // STEP 10: Own home?
    else if (currentStepId === 'step_10') {
      body = `
        <h1 class="v2-heading">Do you own your home?</h1>
        <p class="v2-sub">Tap Yes or No.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${state.homeowner === 'yes' ? 'is-selected' : ''}" aria-pressed="${state.homeowner === 'yes' ? 'true' : 'false'}" data-home="yes">
            ${iconHtml('homeYes')}<span>Yes</span>
          </button>
          <button type="button" class="v2-tile ${state.homeowner === 'no' ? 'is-selected' : ''}" aria-pressed="${state.homeowner === 'no' ? 'true' : 'false'}" data-home="no">
            ${iconHtml('homeNo')}<span>No</span>
          </button>
        </div>
        ${whyNote('You may qualify for a discount when home and auto are together.')}
      `;
    }

    // STEP 11: Contact (Email REQUIRED on every path, including declarations shortcut)
    else if (currentStepId === 'step_11') {
      // On the normal path this screen sits in the middle of the form, so it must not read like the last step.
      const isDecContact = state.usedDecShortcut;
      const contactHeading = isDecContact ? 'Almost done. Who is this quote for?' : 'You&rsquo;re halfway there. Who is this quote for?';
      const contactNext = isDecContact ? '' : '<strong>Next: driver details and the coverage you&rsquo;d like.</strong> ';
      const contactBtn = isDecContact ? 'Continue &rarr;' : 'Next: driver details &rarr;';
      body = `
        <h1 class="v2-heading" tabindex="-1">${contactHeading}</h1>
        <p class="v2-sub">${contactNext}Only our local North Carolina team sees your details. We never sell your information.</p>
        <div class="v2-col">
          <div class="v2-row-2">
            <div class="v2-field">
              <label for="firstname">First name</label>
              <input id="firstname" name="firstname" class="v2-input" type="text" autocomplete="given-name" autocapitalize="words" enterkeyhint="next" value="${escapeHtml(state.firstname)}">
              <div id="firstname-err" class="v2-field-err" role="alert" hidden></div>
            </div>
            <div class="v2-field">
              <label for="lastname">Last name</label>
              <input id="lastname" name="lastname" class="v2-input" type="text" autocomplete="family-name" autocapitalize="words" enterkeyhint="next" value="${escapeHtml(state.lastname)}">
              <div id="lastname-err" class="v2-field-err" role="alert" hidden></div>
            </div>
          </div>
          <div class="v2-field">
            <label for="phone">Mobile number</label>
            <input id="phone" name="phone" class="v2-input" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" placeholder="(336) 555-0123" value="${escapeHtml(state.phone)}">
            <div id="phone-err" class="v2-field-err" role="alert" hidden></div>
          </div>
          <div class="v2-field">
            <label for="email">Email address</label>
            <input id="email" name="email" class="v2-input" type="email" inputmode="email" autocomplete="email" enterkeyhint="go" value="${escapeHtml(state.email)}">
            <div id="email-err" class="v2-field-err" role="alert" hidden></div>
          </div>
          <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
          <button type="button" class="v2-btn-gold" id="v2-step11-next">${contactBtn}</button>
        </div>
        ${whyNote('Our licensed North Carolina team sends your comparison by text or email. We never share your details with marketers or call centers.')}
      `;
    }

    // STEP 12: About the primary driver (ONE screen: editable name, 3-box DOB, marital status, gender)
    else if (currentStepId === 'step_12') {
      const driverName = state.driver_1_name || `${state.firstname} ${state.lastname}`.trim();
      const ready = !!(driverName && state.driver_1_dob && state.driver_1_marital && state.driver_1_gender);
      body = `
        <h1 class="v2-heading" tabindex="-1">About the primary driver</h1>
        <p class="v2-sub">Confirm the primary driver details below.</p>
        <div class="v2-col">
          <div class="v2-field">
            <label for="driver_1_name">Full name</label>
            <input id="driver_1_name" name="driver_1_name" class="v2-input" type="text" autocomplete="name" autocapitalize="words" enterkeyhint="next" value="${escapeHtml(driverName)}">
            <div id="driver_1_name-err" class="v2-field-err" role="alert" hidden></div>
          </div>
          <div class="v2-field">
            <label for="d1-dob-mm">Date of birth</label>
            ${renderDateBoxes('d1-dob', state.driver_1_dob, 'Date of birth')}
          </div>
          <div class="v2-field">
            <label>Marital status</label>
            <div class="v2-grid-4">
              ${MARITAL_OPTS.map(o => `
                <button type="button" class="v2-tile compact ${state.driver_1_marital === o.val ? 'is-selected' : ''}" aria-pressed="${state.driver_1_marital === o.val ? 'true' : 'false'}" data-d1-marital="${o.val}">${o.label}</button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field">
            <label>Gender</label>
            <div class="v2-grid-2" style="margin-bottom:0;grid-template-columns:repeat(2,minmax(0,1fr))">
              ${GENDER_OPTS.map(o => `
                <button type="button" class="v2-tile compact ${state.driver_1_gender === o.val ? 'is-selected' : ''}" aria-pressed="${state.driver_1_gender === o.val ? 'true' : 'false'}" data-d1-gender="${o.val}">${o.label}</button>
              `).join('')}
            </div>
          </div>
          <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
          ${ready ? `<button type="button" class="v2-btn-gold" id="v2-step12-next" style="margin-top:14px">Continue &rarr;</button>` : ''}
        </div>
        ${whyNote('Carriers use these to rate your policy. Our team only uses them to quote.')}
      `;
    }

    // STEP 13: Coverage type. One vehicle: three tiles. Two or more: "same on every vehicle" or "different for each".
    else if (currentStepId === 'step_13') {
      const opts = [
        { label: 'State minimum (liability only)', icon: iconHtml('covMin') },
        { label: 'Full coverage', icon: iconHtml('covFull') },
        { label: 'Not sure, advise me', icon: iconHtml('covAdvise') }
      ];
      const multi = isMultiCar();
      const nVeh = state.vehicles.filter(v => v && v.make).length;
      const sameLabel = nVeh === 2 ? 'Same on both vehicles' : 'Same on every vehicle';
      const scopeTiles = multi ? `
        <div class="v2-grid-2 v2-scope-grid">
          <button type="button" class="v2-tile compact ${state.coverage_scope === 'same' ? 'is-selected' : ''}" aria-pressed="${state.coverage_scope === 'same' ? 'true' : 'false'}" data-scope="same">${sameLabel}</button>
          <button type="button" class="v2-tile compact ${state.coverage_scope === 'different' ? 'is-selected' : ''}" aria-pressed="${state.coverage_scope === 'different' ? 'true' : 'false'}" data-scope="different">Different for each vehicle</button>
        </div>` : '';
      const sameTiles = `
        ${multi ? `<p class="v2-scope-note">Coverage for ${nVeh === 2 ? 'both' : 'all'} vehicles</p>` : ''}
        <div class="v2-grid-3">
          ${opts.map(o => `
            <button type="button" class="v2-tile ${state.coverage_choice === o.label ? 'is-selected' : ''}" aria-pressed="${state.coverage_choice === o.label ? 'true' : 'false'}" data-cov="${escapeHtml(o.label)}">
              ${o.icon}<span>${escapeHtml(o.label)}</span>
            </button>
          `).join('')}
        </div>`;
      const pvMode = multi && state.coverage_scope === 'different';
      const openIdx = (pvMode && typeof state.cov_open === 'number' && state.vehicles[state.cov_open]) ? state.cov_open : -1;
      const vehPanel = (v, i) => {
        const c = vehCov(v);
        const name = vehLabel(v, i);
        const full = c.choice === COV_FULL;
        const othersDone = state.vehicles.every((x, j) => j === i || vehComplete(x));
        return `
          <div class="v2-veh-panel" id="v2-veh-panel-${i}">
            <div class="v2-card-sec">
              <div class="v2-card-title">Type of coverage</div>
              <div class="v2-opt-grid v2-opt-grid-stack" role="radiogroup" aria-label="Type of coverage for ${escapeHtml(name)}">
                ${[COV_LIAB, COV_FULL, COV_UNSURE].map(o => `
                  <button type="button" class="v2-opt ${c.choice === o ? 'is-selected' : ''}" role="radio" aria-checked="${c.choice === o ? 'true' : 'false'}" data-vcov="${escapeHtml(o)}" data-vidx="${i}">
                    <span class="v2-opt-dot" aria-hidden="true"></span><span>${escapeHtml(o)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            ${full ? `
              <div class="v2-card-sec">
                <div class="v2-card-title">Comprehensive deductible ${helpBtn('comprehensive')}</div>
                <p class="v2-card-desc">For damage such as theft or hail. <button type="button" class="v2-help-inline" data-help="deductible">What is a deductible?</button></p>
                ${covOptGrid('comp', i, COMP_DED_OPTS, c.comp, name + ' comprehensive deductible')}
              </div>
              <div class="v2-card-sec">
                <div class="v2-card-title">Collision deductible ${helpBtn('collision')}</div>
                <p class="v2-card-desc">For damage from a crash.</p>
                ${covOptGrid('coll', i, COLL_DED_OPTS, c.coll, name + ' collision deductible')}
              </div>
              <div class="v2-card-sec">
                <div class="v2-card-title">Extras for this vehicle</div>
                <div class="v2-check-list">
                  ${covCheckRow('rental', 'Rental car (loss of use)', c.rental, i, 'rental_reimbursement')}
                  ${covCheckRow('roadside', 'Towing and roadside', c.roadside, i, 'roadside_assistance')}
                </div>
              </div>
              <div class="v2-card-sec v2-veh-done">
                <button type="button" class="v2-btn-navy" data-vdone="${i}">${othersDone ? 'Done with this vehicle' : 'Save and go to the next vehicle &rarr;'}</button>
              </div>
            ` : ''}
          </div>`;
      };
      const perVehCards = `
        <div class="v2-veh-list">
          <div class="v2-veh-list-title">Your vehicles (${state.vehicles.length})</div>
          ${state.vehicles.map((v, i) => {
            const open = i === openIdx;
            const done = vehComplete(v);
            const status = open ? 'Editing coverage' : (done ? vehCovShort(v) : 'Choose coverage');
            return `
              <div class="v2-veh-item ${open ? 'is-open' : ''} ${done ? 'is-done' : ''}">
                <button type="button" class="v2-veh-row" data-vopen="${i}" aria-expanded="${open ? 'true' : 'false'}" aria-controls="v2-veh-panel-${i}">
                  <span class="v2-veh-row-main">
                    <span class="v2-veh-row-name">${escapeHtml(vehLabel(v, i))}</span>
                    <span class="v2-veh-row-status">${(done && !open) ? '<span class="v2-veh-tick" aria-hidden="true"></span>' : ''}${escapeHtml(status)}</span>
                  </span>
                  <span class="v2-veh-row-chev" aria-hidden="true"></span>
                </button>
                ${open ? vehPanel(v, i) : ''}
              </div>`;
          }).join('')}
        </div>
        <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
        <div class="v2-actions-stack">
          <button type="button" class="v2-btn-gold" id="v2-step13-next">Continue &rarr;</button>
        </div>
        <p class="v2-scope-switch"><button type="button" class="v2-help-inline" data-scope="same">Use the same coverage on ${nVeh === 2 ? 'both' : 'all'} vehicles instead</button></p>`;
      body = `
        <h1 class="v2-heading">${pvMode ? 'Choose coverage for each vehicle' : (multi ? 'What coverage do you want on your vehicles?' : 'What type of coverage do you want?')}</h1>
        <p class="v2-sub">${pvMode ? 'Tap a vehicle to set its coverage.' : (multi ? 'Each vehicle can have its own coverage.' : 'Choose the option that fits best. Our team will walk through details with you.')}</p>
        ${helpLink('coverage_type', pvMode ? 'Liability only or full coverage?' : 'What is the difference?')}
        ${pvMode ? '' : scopeTiles}
        ${!multi || state.coverage_scope === 'same' ? sameTiles : ''}
        ${multi && state.coverage_scope === 'different' ? perVehCards : ''}
      `;
    }

    // STEP 14: Liability limits (ONLY if Full coverage)
    else if (currentStepId === 'step_14' && perVehicle()) {
      body = `
        <h1 class="v2-heading" tabindex="-1">For the whole policy</h1>
        <p class="v2-sub">These apply to every vehicle.</p>
        <div class="v2-card-stack">
          <div class="v2-card">
            <div class="v2-card-sec">
              <div class="v2-card-title">Liability limits ${helpBtn('liability_limits')}</div>
              <p class="v2-card-desc">The most the policy may pay when you cause a crash.</p>
              <div class="v2-opt-grid v2-opt-grid-stack" role="radiogroup" aria-label="Liability limits">
                ${LIABILITY_OPTS.map(o => `
                  <button type="button" class="v2-opt ${state.liability_limits === o.val ? 'is-selected' : ''}" role="radio" aria-checked="${state.liability_limits === o.val ? 'true' : 'false'}" data-limit-pick="${escapeHtml(o.val)}">
                    <span class="v2-opt-dot" aria-hidden="true"></span><span>${escapeHtml(o.label)}</span>${o.badge ? `<span class="v2-opt-tag">${escapeHtml(o.badge)}</span>` : ''}
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="v2-card-sec">
              <div class="v2-card-title">Extras for the whole policy</div>
              <div class="v2-check-list">
                ${covCheckRow('medical_payments', 'Medical payments', !!state.medical_payments, -1, 'medical_payments')}
              </div>
            </div>
          </div>
        </div>
        <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
        <div class="v2-actions-stack">
          <button type="button" class="v2-btn-gold" id="v2-step14-next">Continue &rarr;</button>
        </div>
      `;
    }

    else if (currentStepId === 'step_14') {
      body = `
        <h1 class="v2-heading">Choose your liability limits</h1>
        <p class="v2-sub">Pick the limit you want quoted, or let our team walk through options with you.${isMultiCar() ? ' Liability limits cover the whole policy, so they are the same for every vehicle.' : ''}</p>
        ${helpLink('liability_limits', 'What do these numbers mean?')}
        <div class="v2-grid-2" style="max-width:620px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
          ${LIABILITY_OPTS.map(o => `
            <button type="button" class="v2-tile compact ${state.liability_limits === o.val ? 'is-selected' : ''}" aria-pressed="${state.liability_limits === o.val ? 'true' : 'false'}" data-limit="${escapeHtml(o.val)}">
              ${o.badge ? `<span class="v2-tile-badge">${escapeHtml(o.badge)}</span>` : ''}
              <span>${escapeHtml(o.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // STEP 15: Deductibles & extras. Card layout: radio-style amounts in two columns, checkbox list for extras.
    // One card for the policy, or one card per full-coverage vehicle when coverage differs by vehicle.
    else if (currentStepId === 'step_15') {
      const pv = perVehicle();
      const optGrid = (kind, idx, list, current, label) => `
        <div class="v2-opt-grid" role="radiogroup" aria-label="${escapeHtml(label)}">
          ${list.map(d => `
            <button type="button" class="v2-opt ${current === d ? 'is-selected' : ''}" role="radio" aria-checked="${current === d ? 'true' : 'false'}" data-ded-kind="${kind}" data-ded-idx="${idx}" data-ded-val="${escapeHtml(d)}">
              <span class="v2-opt-dot" aria-hidden="true"></span><span>${escapeHtml(d)}</span>
            </button>
          `).join('')}
        </div>`;
      const checkRow = (key, label, on, idx, helpKey) => `
        <div class="v2-check-row">
          <button type="button" class="v2-check ${on ? 'is-on' : ''}" role="checkbox" aria-checked="${on ? 'true' : 'false'}" data-extra-key="${key}" data-extra-idx="${idx}">
            <span class="v2-check-box" aria-hidden="true"></span><span>${escapeHtml(label)}</span>
          </button>
          ${helpBtn(helpKey)}
        </div>`;
      const dedCard = (title, idx, comp, coll, extrasHtml) => `
        <div class="v2-card">
          ${title ? `<div class="v2-card-veh">${escapeHtml(title)}</div>` : ''}
          <div class="v2-card-sec">
            <div class="v2-card-title">Comprehensive deductible ${helpBtn('comprehensive')}</div>
            <p class="v2-card-desc">For damage such as theft or hail. <button type="button" class="v2-help-inline" data-help="deductible">What is a deductible?</button></p>
            ${optGrid('comp', idx, COMP_DED_OPTS, comp, (title ? title + ' ' : '') + 'comprehensive deductible')}
          </div>
          <div class="v2-card-sec">
            <div class="v2-card-title">Collision deductible ${helpBtn('collision')}</div>
            <p class="v2-card-desc">For damage from a crash.</p>
            ${optGrid('coll', idx, COLL_DED_OPTS, coll, (title ? title + ' ' : '') + 'collision deductible')}
          </div>
          ${extrasHtml || ''}
        </div>`;
      let cards = '';
      let extrasBlock = '';
      if (pv) {
        cards = state.vehicles.map((v, i) => ({ v, i })).filter(x => vehCov(x.v).choice === COV_FULL).map(x => {
          const c = vehCov(x.v);
          const ex = `
            <div class="v2-card-sec">
              <div class="v2-card-title">Extras for this vehicle</div>
              <div class="v2-check-list">
                ${checkRow('rental', 'Rental car (loss of use)', c.rental, x.i, 'rental_reimbursement')}
                ${checkRow('roadside', 'Towing and roadside', c.roadside, x.i, 'roadside_assistance')}
              </div>
            </div>`;
          return dedCard(vehLabel(x.v, x.i), x.i, c.comp, c.coll, ex);
        }).join('');
        extrasBlock = `
          <div class="v2-extras-head"><div class="v2-card-title">For the whole policy</div><p class="v2-card-desc">Applies to every vehicle.</p></div>
          <div class="v2-check-list v2-check-list-boxed">
            ${checkRow('medical_payments', 'Medical payments', !!state.medical_payments, -1, 'medical_payments')}
          </div>`;
      } else {
        cards = dedCard(isMultiCar() ? (state.vehicles.filter(v => v && v.make).length === 2 ? 'Both vehicles' : 'All vehicles') : '', -1, state.comp_deductible, state.collision_deductible, '');
        extrasBlock = `
          <div class="v2-extras-head"><div class="v2-card-title">Extras to include in my quote</div><p class="v2-card-desc">Choose any that apply.</p></div>
          <div class="v2-check-list v2-check-list-boxed">
            ${checkRow('rental_reimbursement', 'Rental car (loss of use)', !!state.rental_reimbursement, -1, 'rental_reimbursement')}
            ${checkRow('roadside_assistance', 'Towing and roadside', !!state.roadside_assistance, -1, 'roadside_assistance')}
            ${checkRow('medical_payments', 'Medical payments', !!state.medical_payments, -1, 'medical_payments')}
          </div>`;
      }
      body = `
        <h1 class="v2-heading" tabindex="-1">Choose your deductibles</h1>
        <p class="v2-sub">Pick an amount for each, or choose &lsquo;Not sure&rsquo;.</p>
        <div class="v2-card-stack">${cards}</div>
        ${extrasBlock}
        <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
        <div class="v2-actions-stack">
          <button type="button" class="v2-btn-gold" id="v2-step15-next">Continue &rarr;</button>
        </div>
      `;
    }

    // STEP 16: Home Address
    else if (currentStepId === 'step_16') {
      body = `
        <h1 class="v2-heading" tabindex="-1">What is your home address?</h1>
        <p class="v2-sub">Auto rates in North Carolina depend on where your vehicle is garaged.</p>
        <div class="v2-col">
          <div class="v2-field">
            <label for="street_address">Street address</label>
            <input id="street_address" name="street_address" class="v2-input" type="text" autocomplete="street-address" enterkeyhint="next" value="${escapeHtml(state.street_address)}">
            <div id="street_address-err" class="v2-field-err" role="alert" hidden></div>
          </div>
          <div class="v2-row-3">
            <div class="v2-field">
              <label for="city">City</label>
              <input id="city" name="city" class="v2-input" type="text" autocomplete="address-level2" autocapitalize="words" enterkeyhint="next" value="${escapeHtml(state.city)}">
              <div id="city-err" class="v2-field-err" role="alert" hidden></div>
            </div>
            <div class="v2-field">
              <label for="state">State</label>
              <input id="state" name="state" class="v2-input" type="text" autocomplete="address-level1" autocapitalize="characters" maxlength="2" enterkeyhint="next" value="${escapeHtml(state.state || 'NC')}">
            </div>
            <div class="v2-field">
              <label for="zip_code">ZIP code</label>
              <input id="zip_code" name="zip_code" class="v2-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="5" autocomplete="postal-code" enterkeyhint="go" placeholder="28621" value="${escapeHtml(state.zip_code)}">
              <div id="zip_code-err" class="v2-field-err" role="alert" hidden></div>
            </div>
          </div>
          <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
          <button type="button" class="v2-btn-gold" id="v2-step16-next">Continue &rarr;</button>
        </div>
        ${whyNote('Garaging address sets your North Carolina rating territory so our quotes match real carrier pricing.')}
      `;
    }

    // STEP 17: Other Drivers in Household (Yes/No; each added driver has name, 3-box DOB, marital tiles, gender tiles, Remove)
    else if (currentStepId === 'step_17') {
      // Married primary driver: start the spouse's card straight away instead of asking "how many drivers".
      if (state.driver_1_marital === 'married' && !state.spouse_prompted) {
        state.spouse_prompted = true;
        if (!state.other_drivers.some(d => d && d.spouse)) {
          if (state.has_other_drivers !== 'yes') state.other_drivers = [];
          state.has_other_drivers = 'yes';
          state.other_drivers.unshift(Object.assign(emptyDriver(), { marital: 'married', spouse: true }));
          state.od_open = 0;
        }
        saveSessionState();
      }
      const showList = state.has_other_drivers === 'yes';
      const allDriversValid = showList && state.other_drivers.length > 0 && state.other_drivers.every(d => d.name && d.dob && d.marital && d.gender && d.claims && d.violations);
      const odDone = d => !!(d.name && d.dob && d.marital && d.gender && d.claims && d.violations);
      let odOpen = typeof state.od_open === 'number' ? state.od_open : state.other_drivers.findIndex(d => !odDone(d));
      if (odOpen >= state.other_drivers.length) odOpen = -1;
      state.od_open = odOpen;
      const cards = state.other_drivers.map((d, i) => i !== odOpen ? `
        <div class="v2-vehsheet-row v2-od-row">
          <span class="v2-vehsheet-name">${escapeHtml(d.name || `Additional driver ${i + 1}`)}<small class="v2-od-status ${odDone(d) ? '' : 'is-missing'}">${odDone(d) ? `${escapeHtml(capitalize(d.marital))} &middot; ${escapeHtml(capitalize(d.gender))}` : 'Details needed'}</small></span>
          <span class="v2-vehsheet-actions">
            <button type="button" class="v2-vehsheet-btn" data-od-edit="${i}" aria-label="Edit ${escapeHtml(d.name || `additional driver ${i + 1}`)}">Edit</button>
            <button type="button" class="v2-vehsheet-btn is-remove" data-rem-driver="${i}" data-two-tap="1" aria-label="Remove ${escapeHtml(d.name || `additional driver ${i + 1}`)}">Remove</button>
          </span>
        </div>` : `
        <div class="v2-driver-card">
          <div class="v2-driver-head">
            <span>${d.spouse ? 'Your spouse' : `Additional driver ${i + 1}`}</span>
            <button type="button" class="v2-edit-btn" data-rem-driver="${i}">Remove</button>
          </div>
          <div class="v2-field">
            <label for="od-name-${i}">Full name</label>
            <input id="od-name-${i}" class="v2-input" type="text" autocapitalize="words" enterkeyhint="next" data-od-name="${i}" value="${escapeHtml(d.name)}">
          </div>
          <div class="v2-field">
            <label for="od-dob-${i}-mm">Date of birth</label>
            ${renderDateBoxes(`od-dob-${i}`, d.dob, `Additional driver ${i + 1} date of birth`)}
          </div>
          <div class="v2-field">
            <label>Marital status</label>
            <div class="v2-grid-4">
              ${MARITAL_OPTS.map(o => `
                <button type="button" class="v2-tile compact ${d.marital === o.val ? 'is-selected' : ''}" aria-pressed="${d.marital === o.val ? 'true' : 'false'}" data-od-marital="${o.val}" data-od-idx="${i}">${o.label}</button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field" style="margin-bottom:0">
            <label>Gender</label>
            <div class="v2-grid-2" style="margin-bottom:0;grid-template-columns:repeat(2,minmax(0,1fr))">
              ${GENDER_OPTS.map(o => `
                <button type="button" class="v2-tile compact ${d.gender === o.val ? 'is-selected' : ''}" aria-pressed="${d.gender === o.val ? 'true' : 'false'}" data-od-gender="${o.val}" data-od-idx="${i}">${o.label}</button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field" style="margin-top:16px">
            <label>Any accidents or claims in the past 5 years?</label>
            <div class="v2-grid-2" style="margin-bottom:0;grid-template-columns:repeat(2,minmax(0,1fr))">
              ${['yes', 'no'].map(val => `
                <button type="button" class="v2-tile compact ${d.claims === val ? 'is-selected' : ''}" aria-pressed="${d.claims === val ? 'true' : 'false'}" data-od-record="claims" data-od-val="${val}" data-od-idx="${i}">${val === 'yes' ? 'Yes' : 'No'}</button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field" style="margin-bottom:0">
            <label>Any tickets or violations in the past 3 years?</label>
            <div class="v2-grid-2" style="margin-bottom:0;grid-template-columns:repeat(2,minmax(0,1fr))">
              ${['yes', 'no'].map(val => `
                <button type="button" class="v2-tile compact ${d.violations === val ? 'is-selected' : ''}" aria-pressed="${d.violations === val ? 'true' : 'false'}" data-od-record="violations" data-od-val="${val}" data-od-idx="${i}">${val === 'yes' ? 'Yes' : 'No'}</button>
              `).join('')}
            </div>
          </div>
          <button type="button" class="v2-btn-gold v2-od-save" id="v2-od-save" data-od-save="${i}">Save driver &rarr;</button>
        </div>
      `).join('');

      body = `
        ${!showList ? `
        <h1 class="v2-heading">How many drivers are in your household?</h1>
        <p class="v2-sub">Count yourself and every licensed driver living at your address: spouses, relatives and teen drivers.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${state.has_other_drivers === 'no' ? 'is-selected' : ''}" aria-pressed="${state.has_other_drivers === 'no' ? 'true' : 'false'}" id="v2-od-no">
            ${iconHtml('driverNo')}<span>1 Driver</span>
          </button>
          <button type="button" class="v2-tile" aria-pressed="false" id="v2-od-yes">
            ${iconHtml('driverYes')}<span>2+ Drivers</span>
          </button>
        </div>` : (odOpen !== -1 ? (state.other_drivers[odOpen] && state.other_drivers[odOpen].spouse ? `
        <h1 class="v2-heading">Add your spouse</h1>
        <p class="v2-sub">Since you&rsquo;re married, we&rsquo;ve started a driver for your spouse. If your spouse will not be on the policy, tap Remove.</p>` : `
        <h1 class="v2-heading">Add this driver&rsquo;s details</h1>
        <p class="v2-sub">Every licensed driver living at your address: relatives and teen drivers too.</p>`) : `
        <h1 class="v2-heading">Any more drivers to add?</h1>
        <p class="v2-sub">Include every licensed driver living at your address: relatives and teen drivers too.</p>`)}
        ${showList ? `
          <div class="v2-col">
            <div class="v2-od-list">
              <div class="v2-vehsheet-row v2-od-row">
                <span class="v2-vehsheet-name">${escapeHtml(state.driver_1_name || `${state.firstname} ${state.lastname}`.trim() || 'You')}<small class="v2-od-status"><b class="v2-od-tag">Primary driver</b>${state.driver_1_marital ? ` &middot; ${escapeHtml(capitalize(state.driver_1_marital))}` : ''}${state.driver_1_gender ? ` &middot; ${escapeHtml(capitalize(state.driver_1_gender))}` : ''}</small></span>
                <span class="v2-vehsheet-actions">
                  <button type="button" class="v2-vehsheet-btn" id="v2-od-primary-edit" aria-label="Edit the primary driver">Edit</button>
                </span>
              </div>
              ${cards}
            </div>
            <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
            ${odOpen === -1 ? `<div class="v2-grid-2">
              <button type="button" class="v2-tile" aria-pressed="false" id="v2-add-driver">
                ${iconHtml('driverYes')}<span>Add another driver</span>
              </button>
              ${allDriversValid ? `<button type="button" class="v2-tile" aria-pressed="false" id="v2-step17-next">
                ${iconHtml('driverNo')}<span>No, that&rsquo;s all</span>
              </button>` : ''}
            </div>` : ''}
          </div>
        ` : ''}
      `;
    }

    // STEP 18: VIN & Registration Photo (normal path) OR Notes only (declarations shortcut)
    else if (currentStepId === 'step_18') {
      const isDecPath = state.usedDecShortcut;
      const selectedContactMethod = normalizeContactMethod(state.contact_method);
      const prefOpts = [
        { val: 'text', label: 'Text', icon: iconHtml('contactText') },
        { val: 'phone', label: 'Call', icon: iconHtml('contactCall') },
        { val: 'email', label: 'Email', icon: iconHtml('contactEmail') }
      ];
      const vinCount = state.vehicles.filter(v => v && v.vin).length;
      const vinOpen = vinBoxesOpen || vinCount > 0;
      const manyCars = state.vehicles.length > 1;
      body = `
        <h1 class="v2-heading">${isDecPath ? 'Anything else we should know?' : 'Add a photo or VIN (optional)'}</h1>
        <p class="v2-sub">${isDecPath ? 'Optional — add any questions, extra vehicles, or how you prefer we reach you.' : 'Nothing handy? Skip it. Our team can usually look it up.'}</p>
        <div class="v2-col">
          ${!isDecPath ? `
            <div class="v2-field">
              <label>Snap a photo of your registration or insurance card</label>
              ${renderUploadWidget('step18', 'registration_or_id')}
            </div>
            <div class="v2-vin-fold">
              <button type="button" class="v2-vin-toggle" id="v2-vin-toggle" aria-expanded="${vinOpen ? 'true' : 'false'}" aria-controls="v2-vin-boxes">
                <span>${manyCars ? 'Or type the VINs instead' : 'Or type the VIN instead'}</span>
                <span class="v2-vin-chev" aria-hidden="true">${vinOpen ? '&minus;' : '+'}</span>
              </button>
              ${vinOpen ? `<div class="v2-vin-boxes" id="v2-vin-boxes">
                ${state.vehicles.map((v, i) => `
                  <div class="v2-field">
                    <label for="vin-${i}">${escapeHtml([v.year, v.make, v.model].filter(Boolean).join(' ') || `Vehicle ${i + 1}`)}</label>
                    <input id="vin-${i}" name="vehicle_${i + 1}_vin" class="v2-input" type="text" maxlength="25" autocapitalize="characters" spellcheck="false" placeholder="17-character VIN" value="${escapeHtml(v.vin || '')}">
                    <div id="vin-err-${i}" class="v2-field-err" role="alert" hidden></div>
                  </div>
                `).join('')}
              </div>` : ''}
            </div>
          ` : ''}
          <div class="v2-field">
            <label>How would you like us to reach you? (optional)</label>
            <div class="v2-grid-3" style="margin:8px 0 0">
              ${prefOpts.map(p => `
                <button type="button" class="v2-tile compact ${selectedContactMethod === p.val ? 'is-selected' : ''}" aria-pressed="${selectedContactMethod === p.val ? 'true' : 'false'}" data-contact-pref="${p.val}">
                  ${p.icon}<span>${p.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field">
            <label for="additional_notes">Anything else we should know? (optional)</label>
            <textarea id="additional_notes" name="additional_notes" class="v2-textarea">${escapeHtml(state.additional_notes)}</textarea>
          </div>
          ${isDecPath ? '<div class="v2-turnstile-wrap" id="v2-turnstile-slot"></div>' : ''}
          ${submitErrorMsg && isDecPath ? `<div id="v2-submit-err" class="v2-error" role="alert" tabindex="-1">${escapeHtml(submitErrorMsg)}</div>` : ''}
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="v2-step18-next" ${submittingLive ? 'disabled' : ''}>${submittingLive ? 'Sending...' : (isDecPath ? 'Send my quote request' : 'Continue to review &rarr;')}</button>
            <button type="button" class="v2-btn-outline" style="width:100%" id="v2-step18-skip" ${submittingLive ? 'disabled' : ''}>${isDecPath ? 'Skip note &amp; send my quote request' : 'Skip for now'}</button>
          </div>
        </div>
      `;
    }

    // STEP 19: Review Screen (every answer editable, including each driver and each coverage choice)
    else if (currentStepId === 'step_19') {
      const vehSummary = state.vehicles.map((v, i) => {
        const desc = [v.year, v.make, v.model].filter(Boolean).join(' ') || `Vehicle ${i + 1}`;
        const vinStatus = v.vin ? 'VIN: provided' : 'VIN: not provided';
        return `${i + 1}. ${escapeHtml(desc)} &middot; <strong>${vinStatus}</strong>`;
      }).join('<br>');
      const regPhotos = uploadedFiles
        .map((f, idx) => ({ f, idx }))
        .filter(x => x.f._category === 'registration_or_id');
      const extrasPicked = [
        state.rental_reimbursement ? 'Rental car (loss of use)' : '',
        state.roadside_assistance ? 'Towing and roadside' : '',
        state.medical_payments ? 'Medical payments' : ''
      ].filter(Boolean);

      const rows = [
        { label: 'Vehicles & VINs', val: vehSummary || 'Not entered', edit: 'step_18', rawHtml: true },
        { label: 'Current Insurance', val: state.current_insurance === 'yes' ? `Yes (${state.current_carrier || 'Not selected'})` : 'No', edit: 'step_5' }
      ];
      if (state.current_insurance === 'yes') {
        rows.push({
          label: 'Policy Renewal',
          val: state.coverage_expiration ? `Exact date: ${state.coverage_expiration}` : (state.renewal_window ? capitalize(state.renewal_window) : 'Not selected'),
          edit: 'step_7'
        });
      }
      rows.push(
        { label: 'Primary Driver Record', val: recordText(state.previous_claims, state.violations), edit: 'step_9' },
        { label: 'Own Home', val: state.homeowner === 'yes' ? 'Yes' : 'No', edit: 'step_10' },
        { label: 'Contact', val: `${state.firstname} ${state.lastname} · ${state.phone} · ${state.email}`, edit: 'step_11' },
        { label: 'Primary Driver', val: `${state.driver_1_name || `${state.firstname} ${state.lastname}`.trim()} · DOB: ${state.driver_1_dob || 'N/A'} · ${capitalize(state.driver_1_marital)} · ${capitalize(state.driver_1_gender)}`, edit: 'step_12' },
        perVehicle()
          ? { label: 'Coverage By Vehicle', val: state.vehicles.map((v, i) => `${i + 1}. ${escapeHtml(vehLabel(v, i))}: <strong>${escapeHtml(vehCovText(v))}</strong>`).join('<br>'), edit: 'step_13', rawHtml: true }
          : { label: 'Coverage Type', val: (state.coverage_choice || 'Not selected') + (isMultiCar() && state.coverage_choice ? ' (same on every vehicle)' : ''), edit: 'step_13' }
      );
      if (perVehicle()) {
        if (needsLimits()) rows.push({ label: 'Whole Policy', val: `Liability limits: ${state.liability_limits || 'Not selected'} · Medical payments: ${state.medical_payments ? 'Yes' : 'No'}`, edit: 'step_14' });
      } else if (state.coverage_choice === 'Full coverage') {
        rows.push(
          { label: 'Liability Limits', val: state.liability_limits || 'Not selected', edit: 'step_14' },
          { label: 'Deductibles & Extras', val: `Comp: ${state.comp_deductible || 'Not sure'} · Collision: ${state.collision_deductible || 'Not sure'}${extrasPicked.length ? ` · Extras: ${extrasPicked.join(', ')}` : ''}`, edit: 'step_15' }
        );
      }
      rows.push({ label: 'Home Address', val: `${state.street_address}, ${state.city}, ${state.state} ${state.zip_code}`, edit: 'step_16' });

      if (state.has_other_drivers === 'yes' && state.other_drivers.length) {
        state.other_drivers.forEach((d, idx) => {
          rows.push({
            label: `Additional Driver ${idx + 1}`,
            val: `${d.name || 'Unnamed'} · DOB: ${d.dob || 'N/A'} · ${capitalize(d.marital)} · ${capitalize(d.gender)} · ${recordText(d.claims, d.violations)}`,
            edit: 'step_17'
          });
        });
      } else {
        rows.push({ label: 'Other Household Drivers', val: 'None', edit: 'step_17' });
      }
      rows.push({ label: 'Notes & Contact Preference', val: `${state.additional_notes || 'No notes'}${contactMethodLabel(state.contact_method) ? ` · Prefer: ${contactMethodLabel(state.contact_method)}` : ''}`, edit: 'step_18' });

      body = `
        <h1 class="v2-heading">Review your quote request</h1>
        <p class="v2-sub">Check your answers below. Tap Edit on any line to make a quick change.</p>
        <div class="v2-review-list">
          ${rows.map(r => `
            <div class="v2-review-row">
              <div>
                <div class="v2-review-label">${r.label}</div>
                <div class="v2-review-val">${r.rawHtml ? r.val : escapeHtml(r.val)}</div>
              </div>
              <button type="button" class="v2-edit-btn" data-review-edit="${r.edit}">Edit</button>
            </div>
          `).join('')}
          ${regPhotos.length ? `
            <div class="v2-review-row" style="flex-direction:column;align-items:stretch">
              <div class="v2-review-label">Registration or ID card photos</div>
              <ul class="v2-file-list" style="margin-top:8px">
                ${regPhotos.map(({ f, idx }) => `
                  <li class="v2-file-item">
                    <span><span class="v2-file-name">${escapeHtml(f.name)}</span><span class="v2-file-size">(${formatFileSize(f.size)})</span></span>
                    <button type="button" class="v2-edit-btn" data-remove-file="${idx}" aria-label="Remove ${escapeHtml(f.name)}">Remove</button>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        ${!state.usedDecShortcut ? `
          <div style="max-width:640px;margin:0 auto 22px;text-align:left">
            <strong style="display:block;color:var(--ink);font-size:15px;margin-bottom:4px">Optional: Attach your declarations page</strong>
            <span class="v2-help" style="display:block">Have your current policy handy? Attach it so our team can match your coverages line by line.</span>
            ${renderUploadWidget('step19', 'declarations')}
          </div>
        ` : ''}
        <div class="v2-turnstile-wrap" id="v2-turnstile-slot"></div>
        ${submitErrorMsg ? `<div id="v2-submit-err" class="v2-error" role="alert" tabindex="-1" style="max-width:580px;margin:10px auto">${escapeHtml(submitErrorMsg)}</div>` : ''}
        <div class="v2-actions-stack">
          <button type="button" class="v2-btn-gold" id="v2-send-btn" ${submittingLive ? 'disabled' : ''}>${submittingLive ? 'Sending...' : 'Send my quote request'}</button>
        </div>
      `;
    }

    // STEP 20: Final Screen
    else if (currentStepId === 'step_20') {
      const normPref = normalizeContactMethod(state.contact_method);
      const prefLine = normPref
        ? ` We will reach you by ${escapeHtml(normPref)}.`
        : '';
      const uploadWarnHtml = uploadFailedAfterQuote ? `
        <div id="v2-upload-warn" class="v2-upload-warn" role="alert" tabindex="-1">
          <p class="v2-upload-warn-title">We got your request, but your files did not upload. Text them to (336) 827-9065 or try again</p>
          ${uploadedFiles.length ? `
            <ul class="v2-file-list" aria-label="Files waiting to upload">
              ${uploadedFiles.map(f => `
                <li class="v2-file-item">
                  <span><span class="v2-file-name">${escapeHtml(f.name)}</span><span class="v2-file-size">(${formatFileSize(f.size)})</span></span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="v2-retry-upload-btn" ${retryingUpload ? 'disabled' : ''}>${retryingUpload ? 'Retrying upload...' : 'Retry upload'}</button>
          </div>
        </div>
      ` : (uploadRetrySuccess ? `
        <div class="v2-upload-ok" role="status">Your files uploaded successfully.</div>
      ` : '');
      body = `
        <div class="v2-final-icon" aria-hidden="true">
          ${iconHtml('confirmCheck')}
        </div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing six carriers for you. We will send your prices by text or email within one business day.</h1>
        ${state.email ? `<p class="v2-final-confirm-email">A confirmation email is on its way to <strong>${escapeHtml(state.email)}</strong>.</p>` : ''}
        <p class="v2-sub">${prefLine ? prefLine.trim() + ' ' : ''}Request reference: <strong>${escapeHtml(lastConfirmationNumber)}</strong>. Have a question right now? Call us or text us below.</p>
        ${uploadWarnHtml}
        <div class="v2-final-actions">
          <a class="v2-btn-gold" href="tel:3368351993" data-source="auto_v2_final_call">Call 336-835-1993</a>
          <a class="v2-btn-navy" href="sms:+13368279065" data-source="auto_v2_final_text">Text (336) 827-9065</a>
        </div>
      `;
    }

    const eyebrowHtml = `<div class="v2-eyebrow">${getEyebrow(currentStepId)}</div>`;
    const animCls = animateNextRender ? 'v2-step-enter' : '';
    animateNextRender = false;
    stage.innerHTML = `<div class="${animCls}">${backBar}${eyebrowHtml}${body}</div>`;
    const headingEl = stage.querySelector('.v2-heading');
    if (headingEl) {
      headingEl.setAttribute('tabindex', '-1');
      if (focusHeadingNextRender && !focusAlertIdNextRender) {
        focusHeadingNextRender = false;
        headingEl.focus({ preventScroll: true });
      } else if (focusHeadingNextRender && focusAlertIdNextRender) {
        focusHeadingNextRender = false;
      }
    }
    bindStepEvents();
    renderMobileBar();
    if (focusAlertIdNextRender) {
      const alertId = focusAlertIdNextRender;
      focusAlertIdNextRender = '';
      const alertEl = document.getElementById(alertId);
      if (alertEl) focusAlertElement(alertEl);
    }
  }

  function bindStepEvents() {
    const backBtn = document.getElementById('v2-back');
    if (backBtn) backBtn.addEventListener('click', goBack);

    // 7-day Resume / Start over prompt on Step 1
    const resumeBtn = document.getElementById('v2-resume-btn');
    const startOverBtn = document.getElementById('v2-startover-btn');
    if (resumeBtn && pendingResumeData) {
      resumeBtn.addEventListener('click', () => {
        const saved = pendingResumeData;
        pendingResumeData = null;
        state = Object.assign(defaultState(), saved.state);
        historyStack = Array.isArray(saved.historyStack) && saved.historyStack.length ? saved.historyStack : [saved.currentStepId];
        step11Completed = !!saved.step11Completed;
        enterStep(saved.currentStepId);
      });
    }
    if (startOverBtn) {
      startOverBtn.addEventListener('click', () => {
        clearSavedProgress();
        state = defaultState();
        render();
      });
    }

    // Mobile keyboard helpers: scroll active input into view + Enter key moves to next field or Continue
    const stageInputs = Array.from(document.querySelectorAll('#stage .v2-input, #stage .v2-select, #stage .v2-textarea'));
    stageInputs.forEach((inp, idx) => {
      inp.addEventListener('focus', () => {
        setTimeout(() => {
          try { inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
        }, 120);
      });
      if (inp.tagName === 'INPUT') {
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const nextInp = stageInputs[idx + 1];
            if (nextInp && nextInp.tagName === 'INPUT') {
              nextInp.focus();
            } else {
              const primaryBtn = document.querySelector('#stage .v2-btn-gold');
              if (primaryBtn) primaryBtn.click();
            }
          }
        });
      }
    });

    // Any more vehicles?
    const moreYes = document.getElementById('v2-more-yes');
    if (moreYes) moreYes.addEventListener('click', () => {
      if (isAdvancing) return;
      moreYes.classList.add('is-selected');
      setTimeout(() => addAnotherVehicle(), 200);
    });
    const moreNo = document.getElementById('v2-more-no');
    if (moreNo) moreNo.addEventListener('click', () => {
      tapAndAdvance(moreNo, () => {
        state.vehicles = state.vehicles.filter((v, i) => i === 0 || (v && v.make));
      });
    });

    // Step 1
    document.querySelectorAll('[data-veh-count]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          const n = Number(btn.dataset.vehCount);
          state.vehicleCount = n;
          if (n === 1) state.vehicles = [state.vehicles[0] || emptyVeh()];
          else if (state.vehicles.length < 2) state.vehicles.push(emptyVeh());
          trackEvent('auto_v2_step_complete', { vehicles_selected: n });
        });
      });
    });

    // Step 2 / 2b (Make — changing make clears year AND model for that car)
    document.querySelectorAll('[data-pick-make]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          const idx = Number(btn.dataset.vidx);
          const make = btn.dataset.pickMake;
          state.vehicles[idx].isCustomMake = false;
          if (state.vehicles[idx].make !== make) {
            state.vehicles[idx].make = make;
            state.vehicles[idx].year = '';
            state.vehicles[idx].model = '';
          }
          trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        });
      });
    });
    const makeDd = document.getElementById('v2-make-dd');
    if (makeDd) {
      makeDd.addEventListener('change', () => {
        const val = makeDd.value;
        const idx = Number(makeDd.dataset.vidx);
        if (!val) return;
        if (val === 'Other') { showOtherMakeBox = true; render(); return; }
        state.vehicles[idx].isCustomMake = false;
        if (state.vehicles[idx].make !== val) {
          state.vehicles[idx].make = val;
          state.vehicles[idx].year = '';
          state.vehicles[idx].model = '';
        }
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        advanceToNext();
      });
    }
    const customMakeNext = document.getElementById('v2-custom-make-next');
    if (customMakeNext) {
      customMakeNext.addEventListener('click', () => {
        const idx = Number(customMakeNext.dataset.vidx);
        const mk = document.getElementById('v2-custom-make').value.trim();
        const md = document.getElementById('v2-custom-model').value.trim();
        if (!mk) { showFieldError('v2-custom-make', 'Please enter your vehicle make.'); return; }
        if (!md) { showFieldError('v2-custom-model', 'Please enter your vehicle model.'); return; }
        state.vehicles[idx].make = mk;
        state.vehicles[idx].model = md;
        state.vehicles[idx].isCustomMake = true;
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1, custom_make: true });
        advanceToNext();
      });
    }

    // Step 3 / 3b (Year)
    document.querySelectorAll('[data-pick-year]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          const idx = Number(btn.dataset.vidx);
          state.vehicles[idx].year = btn.dataset.pickYear;
          trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        });
      });
    });
    const yearDd = document.getElementById('v2-year-dd');
    if (yearDd) {
      yearDd.addEventListener('change', () => {
        const val = yearDd.value;
        const idx = Number(yearDd.dataset.vidx);
        if (!val) return;
        if (val === 'OLDER') { showOlderYearBox = true; render(); return; }
        state.vehicles[idx].year = val;
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        advanceToNext();
      });
    }
    const olderYearNext = document.getElementById('v2-older-year-next');
    if (olderYearNext) {
      olderYearNext.addEventListener('click', () => {
        const idx = Number(olderYearNext.dataset.vidx);
        const yr = document.getElementById('v2-older-year').value.trim();
        if (!/^\d{4}$/.test(yr) || Number(yr) < 1900 || Number(yr) > 1980) {
          showFieldError('v2-older-year', 'Please enter a valid 4-digit model year before 1981 (for example, 1978).');
          return;
        }
        state.vehicles[idx].year = yr;
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        advanceToNext();
      });
    }

    // Step 4 / 4b (Model)
    document.querySelectorAll('[data-pick-model]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          const idx = Number(btn.dataset.vidx);
          state.vehicles[idx].model = btn.dataset.pickModel;
          trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        });
      });
    });
    const modelDd = document.getElementById('v2-model-dd');
    if (modelDd) {
      modelDd.addEventListener('change', () => {
        const val = modelDd.value;
        const idx = Number(modelDd.dataset.vidx);
        if (!val) return;
        if (val === '__NOT_LISTED__') { showOtherModelBox = true; render(); return; }
        state.vehicles[idx].model = val;
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        advanceToNext();
      });
    }
    const customModelNext = document.getElementById('v2-custom-model-next');
    if (customModelNext) {
      customModelNext.addEventListener('click', () => {
        const idx = Number(customModelNext.dataset.vidx);
        const md = document.getElementById('v2-custom-model-input').value.trim();
        if (!md) { showFieldError('v2-custom-model-input', 'Please enter your vehicle model.'); return; }
        state.vehicles[idx].model = md;
        trackEvent('auto_v2_step_complete', { vehicle_index: idx + 1 });
        advanceToNext();
      });
    }

    // Step 5 (Currently insured?)
    document.querySelectorAll('[data-insured]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          state.current_insurance = btn.dataset.insured;
          if (state.current_insurance === 'no') {
            state.current_carrier = '';
            state.renewal_window = '';
            state.coverage_expiration = '';
            state.usedDecShortcut = false;
          }
          trackEvent('auto_v2_step_complete');
        });
      });
    });

    // Step 6 (Current insurer)
    document.querySelectorAll('[data-pick-carrier]').forEach(btn => {
      btn.addEventListener('click', () => {
        const picked = btn.dataset.pickCarrier;
        if (picked === 'Other') { showOtherInsurerBox = true; render(); return; }
        tapAndAdvance(btn, () => {
          showOtherInsurerBox = false;
          state.current_carrier = picked;
          trackEvent('auto_v2_step_complete');
        });
      });
    });
    const otherInsNext = document.getElementById('v2-other-insurer-next');
    if (otherInsNext) {
      otherInsNext.addEventListener('click', () => {
        const val = document.getElementById('v2-other-insurer').value.trim();
        if (!val) { showFieldError('v2-other-insurer', 'Please enter your current insurance company name.'); return; }
        state.current_carrier = val;
        showOtherInsurerBox = false;
        trackEvent('auto_v2_step_complete');
        advanceToNext();
      });
    }

    // Step 7 (Policy renewal — tiles + 3-box exact date)
    document.querySelectorAll('[data-renewal]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          state.renewal_window = btn.dataset.renewal;
          state.coverage_expiration = '';
          trackEvent('auto_v2_step_complete');
        });
      });
    });
    if (currentStepId === 'step_7') {
      bindDateBoxes('renewal-date', true, iso => {
        const changed = state.coverage_expiration !== iso;
        state.coverage_expiration = iso;
        if (iso) state.renewal_window = '';
        if (changed) { saveSessionState(); render(); }
      });
    }
    const s7DateNext = document.getElementById('v2-step7-date-next');
    if (s7DateNext) {
      s7DateNext.addEventListener('click', () => {
        trackEvent('auto_v2_step_complete');
        advanceToNext();
      });
    }

    // Step 8 (Declarations shortcut)
    const decUp = document.getElementById('v2-dec-upload-tile');
    const decSkip = document.getElementById('v2-dec-skip-tile');
    const decCont = document.getElementById('v2-dec-continue');
    if (decUp) decUp.addEventListener('click', () => { state.decShortcutChoice = 'upload'; render(); });
    if (decSkip) decSkip.addEventListener('click', () => {
      tapAndAdvance(decSkip, () => {
        state.decShortcutChoice = 'questions';
        state.usedDecShortcut = false;
        trackEvent('auto_v2_step_complete', { dec_shortcut: false });
      });
    });
    if (decCont) decCont.addEventListener('click', () => {
      state.usedDecShortcut = true;
      trackEvent('auto_v2_step_complete', { dec_shortcut: true, files: uploadedFiles.length });
      advanceToNext();
    });
    if (currentStepId === 'step_8') bindUploadWidget('step8', 'declarations');

    // Step 9 (Driving Record — two rows)
    document.querySelectorAll('[data-claims]').forEach(btn => {
      btn.addEventListener('click', () => { state.previous_claims = btn.dataset.claims; saveSessionState(); render(); });
    });
    document.querySelectorAll('[data-violations]').forEach(btn => {
      btn.addEventListener('click', () => { state.violations = btn.dataset.violations; saveSessionState(); render(); });
    });
    const s9 = document.getElementById('v2-step9-next');
    if (s9) s9.addEventListener('click', () => {
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 10 (Homeowner)
    document.querySelectorAll('[data-home]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          state.homeowner = btn.dataset.home;
          trackEvent('auto_v2_step_complete');
        });
      });
    });

    // Step 11 (Contact — field-level validation with scroll & focus)
    const phoneInput = document.getElementById('phone');
    if (phoneInput) phoneInput.addEventListener('input', e => {
      e.target.value = formatPhone(e.target.value);
      e.target.classList.remove('is-error');
      const pe = document.getElementById('phone-err'); if (pe) pe.hidden = true;
    });
    ['firstname', 'lastname', 'email'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        el.classList.remove('is-error');
        const ee = document.getElementById(`${id}-err`); if (ee) ee.hidden = true;
      });
    });
    const s11 = document.getElementById('v2-step11-next');
    if (s11) {
      s11.addEventListener('click', () => {
        const fn = document.getElementById('firstname').value.trim();
        const ln = document.getElementById('lastname').value.trim();
        const ph = document.getElementById('phone').value.trim();
        const em = document.getElementById('email').value.trim();
        if (!fn) { showFieldError('firstname', 'Please enter your first name.'); return; }
        if (!ln) { showFieldError('lastname', 'Please enter your last name.'); return; }
        if (ph.replace(/\D/g, '').length < 10) { showFieldError('phone', 'Please enter a valid 10-digit mobile number.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          showFieldError('email', 'Please enter a valid email address.');
          return;
        }
        state.firstname = fn;
        state.lastname = ln;
        state.phone = ph;
        state.email = em;
        if (!state.driver_1_name) state.driver_1_name = `${fn} ${ln}`.trim();
        step11Completed = true;
        saveSessionState();
        resetPartialTimer();
        trackEvent('auto_v2_step_complete');
        advanceToNext();
      });
    }

    // Step 12 (About Primary Driver — 3-box numeric DOB)
    const d1Name = document.getElementById('driver_1_name');
    if (d1Name) d1Name.addEventListener('input', () => { state.driver_1_name = d1Name.value; saveSessionState(); });
    if (currentStepId === 'step_12') {
      bindDateBoxes('d1-dob', false, iso => {
        const changed = state.driver_1_dob !== iso;
        state.driver_1_dob = iso;
        if (changed) { saveSessionState(); render(); }
      });
    }
    document.querySelectorAll('[data-d1-marital]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (d1Name) state.driver_1_name = d1Name.value.trim();
        state.driver_1_marital = btn.dataset.d1Marital;
        saveSessionState();
        render();
      });
    });
    document.querySelectorAll('[data-d1-gender]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (d1Name) state.driver_1_name = d1Name.value.trim();
        state.driver_1_gender = btn.dataset.d1Gender;
        saveSessionState();
        render();
      });
    });
    const s12 = document.getElementById('v2-step12-next');
    if (s12) s12.addEventListener('click', () => {
      if (d1Name) state.driver_1_name = d1Name.value.trim();
      resetPartialTimer();
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 13 (Coverage Type — 250ms flash; clearing Full coverage clears deductibles & extras)
    document.querySelectorAll('[data-cov]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          const picked = btn.dataset.cov;
          state.coverage_choice = picked;
          if (picked !== 'Full coverage') clearFullCoverageExtras();
          trackEvent('auto_v2_step_complete');
        });
      });
    });

    // Step 14 (Liability Limits — 250ms flash)
    document.querySelectorAll('[data-limit]').forEach(btn => {
      btn.addEventListener('click', () => {
        tapAndAdvance(btn, () => {
          state.liability_limits = btn.dataset.limit;
          trackEvent('auto_v2_step_complete');
        });
      });
    });

    // Step 13, two or more vehicles: scope choice, per-vehicle choices, Continue
    document.querySelectorAll('[data-scope]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.coverage_scope = btn.dataset.scope;
        if (state.coverage_scope === 'different') {
          const first = firstIncompleteVehicle();
          state.cov_open = first >= 0 ? first : 0;
        }
        saveSessionState();
        render();
        window.scrollTo(0, 0);
      });
    });
    document.querySelectorAll('[data-vopen]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.vopen);
        if (state.cov_open === i) { state.cov_open = -1; saveSessionState(); render(); }
        else openVehiclePanel(i);
      });
    });
    document.querySelectorAll('[data-vdone]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.vdone);
        if (!vehComplete(state.vehicles[i])) {
          const errEl = document.getElementById('v2-step-err');
          if (errEl) { errEl.textContent = `Choose a comprehensive and a collision deductible for your ${vehLabel(state.vehicles[i], i)}, or pick \u2018Not sure\u2019.`; errEl.hidden = false; focusAlertElement(errEl); }
          return;
        }
        const next = firstIncompleteVehicle();
        if (next >= 0) { openVehiclePanel(next); }
        else { state.cov_open = -1; saveSessionState(); render(); const c = document.getElementById('v2-step13-next'); if (c) { try { c.scrollIntoView({ block: 'center' }); } catch (_) {} } }
      });
    });
    document.querySelectorAll('[data-vcov]').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = vehCov(state.vehicles[Number(btn.dataset.vidx)]);
        c.choice = btn.dataset.vcov;
        if (c.choice !== COV_FULL) {
          c.comp = ''; c.coll = ''; c.rental = false; c.roadside = false;
          // Nothing more to ask for this vehicle: move on to the next unfinished one.
          const next = firstIncompleteVehicle();
          if (next >= 0) { openVehiclePanel(next); return; }
          state.cov_open = -1;
          saveSessionState();
          render();
          const cont = document.getElementById('v2-step13-next');
          if (cont) { try { cont.scrollIntoView({ block: 'center' }); } catch (_) {} }
          return;
        }
        saveSessionState();
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
      });
    });
    const s13 = document.getElementById('v2-step13-next');
    if (s13) s13.addEventListener('click', () => {
      const bad = firstIncompleteVehicle();
      if (bad >= 0) {
        const v = state.vehicles[bad];
        const msg = vehCov(v).choice
          ? `Choose the deductibles for your ${vehLabel(v, bad)}, or pick \u2018Not sure\u2019.`
          : `Choose a coverage for your ${vehLabel(v, bad)}.`;
        if (state.cov_open !== bad) { state.cov_open = bad; saveSessionState(); render(); }
        const errEl = document.getElementById('v2-step-err');
        if (errEl) { errEl.textContent = msg; errEl.hidden = false; focusAlertElement(errEl); }
        return;
      }
      if (!needsLimits()) { state.liability_limits = ''; state.medical_payments = false; }
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 14, coverage differs by vehicle: limits as radio rows, then Continue
    document.querySelectorAll('[data-limit-pick]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.liability_limits = btn.dataset.limitPick;
        saveSessionState();
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
      });
    });
    const s14 = document.getElementById('v2-step14-next');
    if (s14) s14.addEventListener('click', () => {
      if (!state.liability_limits) {
        const errEl = document.getElementById('v2-step-err');
        if (errEl) { errEl.textContent = 'Choose your liability limits, or pick \u2018Not sure, help me decide\u2019.'; errEl.hidden = false; focusAlertElement(errEl); }
        return;
      }
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 15 (Deductibles & Extras). idx -1 = whole policy, otherwise the vehicle index.
    document.querySelectorAll('[data-ded-kind]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.dedIdx), kind = btn.dataset.dedKind, val = btn.dataset.dedVal;
        if (idx >= 0) {
          const c = vehCov(state.vehicles[idx]);
          if (kind === 'comp') c.comp = val; else c.coll = val;
        } else if (kind === 'comp') {
          state.comp_deductible = val;
        } else {
          state.collision_deductible = val;
        }
        saveSessionState();
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
      });
    });
    document.querySelectorAll('[data-extra-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.extraKey, idx = Number(btn.dataset.extraIdx);
        if (idx >= 0) {
          const c = vehCov(state.vehicles[idx]);
          c[k] = !c[k];
        } else {
          state[k] = !state[k];
        }
        saveSessionState();
        const y = window.scrollY;
        render();
        window.scrollTo(0, y);
      });
    });
    const s15 = document.getElementById('v2-step15-next');
    if (s15) s15.addEventListener('click', () => {
      if (!deductiblesComplete()) {
        const errEl = document.getElementById('v2-step-err');
        if (errEl) { errEl.textContent = 'Choose a comprehensive and a collision deductible' + (perVehicle() ? ' for each vehicle' : '') + ', or pick \u2018Not sure\u2019.'; errEl.hidden = false; focusAlertElement(errEl); }
        return;
      }
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 16 (Home Address — ZIP 5 digits only, field-level errors)
    const zipEl = document.getElementById('zip_code');
    if (zipEl) zipEl.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
      e.target.classList.remove('is-error');
      const ze = document.getElementById('zip_code-err'); if (ze) ze.hidden = true;
    });
    ['street_address', 'city'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => {
        el.classList.remove('is-error');
        const ee = document.getElementById(`${id}-err`); if (ee) ee.hidden = true;
      });
    });
    const s16 = document.getElementById('v2-step16-next');
    if (s16) {
      s16.addEventListener('click', () => {
        const st = document.getElementById('street_address').value.trim();
        const ci = document.getElementById('city').value.trim();
        const sc = document.getElementById('state').value.trim().toUpperCase() || 'NC';
        const zp = document.getElementById('zip_code').value.trim();
        if (!st) { showFieldError('street_address', 'Please enter your street address.'); return; }
        if (!ci) { showFieldError('city', 'Please enter your city.'); return; }
        if (!/^\d{5}$/.test(zp)) { showFieldError('zip_code', 'Please enter a 5-digit ZIP code.'); return; }
        state.street_address = st; state.city = ci; state.state = sc; state.zip_code = zp;
        saveSessionState();
        resetPartialTimer();
        trackEvent('auto_v2_step_complete');
        advanceToNext();
      });
    }

    // Step 17 (Other Drivers — 3-box numeric DOB on each card)
    const odYes = document.getElementById('v2-od-yes');
    const odNo = document.getElementById('v2-od-no');
    if (odYes) odYes.addEventListener('click', () => {
      state.has_other_drivers = 'yes';
      if (state.other_drivers.length === 0) { state.other_drivers.push(emptyDriver()); state.od_open = 0; }
      saveSessionState();
      render();
    });
    const odPrimaryEdit = document.getElementById('v2-od-primary-edit');
    if (odPrimaryEdit) odPrimaryEdit.addEventListener('click', () => {
      syncOtherDriversInputs();
      saveSessionState();
      editReturnTo = 'step_17';
      historyStack.push('step_12');
      enterStep('step_12');
    });
    document.querySelectorAll('[data-od-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncOtherDriversInputs();
        state.od_open = Number(btn.dataset.odEdit);
        saveSessionState();
        render();
      });
    });
    const odSave = document.getElementById('v2-od-save');
    if (odSave) odSave.addEventListener('click', () => {
      syncOtherDriversInputs();
      const d = state.other_drivers[Number(odSave.dataset.odSave)];
      if (!d || !(d.name && d.dob && d.marital && d.gender && d.claims && d.violations)) {
        const err = document.getElementById('v2-step-err');
        if (err) { err.textContent = 'Please add this driver\u2019s full name, date of birth, marital status and gender, and answer both driving record questions.'; err.hidden = false; err.scrollIntoView({ block: 'center' }); }
        return;
      }
      state.od_open = -1;
      saveSessionState();
      render();
    });
    if (odNo) odNo.addEventListener('click', () => {
      tapAndAdvance(odNo, () => {
        state.has_other_drivers = 'no';
        state.other_drivers = [];
        trackEvent('auto_v2_step_complete');
      });
    });
    document.querySelectorAll('[data-od-name]').forEach(el => {
      el.addEventListener('input', () => {
        const i = Number(el.dataset.odName);
        if (state.other_drivers[i]) state.other_drivers[i].name = el.value;
        saveSessionState();
      });
    });
    if (currentStepId === 'step_17' && state.has_other_drivers === 'yes') {
      state.other_drivers.forEach((d, i) => {
        bindDateBoxes(`od-dob-${i}`, false, iso => {
          const changed = d.dob !== iso;
          d.dob = iso;
          if (changed) { saveSessionState(); render(); }
        });
      });
    }
    document.querySelectorAll('[data-od-marital]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncOtherDriversInputs();
        const i = Number(btn.dataset.odIdx);
        if (state.other_drivers[i]) state.other_drivers[i].marital = btn.dataset.odMarital;
        saveSessionState();
        render();
      });
    });
    document.querySelectorAll('[data-od-record]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncOtherDriversInputs();
        const d = state.other_drivers[Number(btn.dataset.odIdx)];
        if (d) d[btn.dataset.odRecord] = btn.dataset.odVal;
        saveSessionState();
        render();
      });
    });
    document.querySelectorAll('[data-od-gender]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncOtherDriversInputs();
        const i = Number(btn.dataset.odIdx);
        if (state.other_drivers[i]) state.other_drivers[i].gender = btn.dataset.odGender;
        saveSessionState();
        render();
      });
    });
    const addDrv = document.getElementById('v2-add-driver');
    if (addDrv) addDrv.addEventListener('click', () => {
      syncOtherDriversInputs();
      state.other_drivers.push(emptyDriver());
      state.od_open = state.other_drivers.length - 1;
      saveSessionState();
      render();
    });
    document.querySelectorAll('[data-rem-driver]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.twoTap === '1' && btn.dataset.armed !== '1') {   // two taps to remove a saved driver
          btn.dataset.armed = '1';
          btn.textContent = 'Tap again to remove';
          btn.classList.add('is-armed');
          return;
        }
        syncOtherDriversInputs();
        const ri = Number(btn.dataset.remDriver);
        state.other_drivers.splice(ri, 1);
        if (state.od_open === ri) state.od_open = -1;
        else if (state.od_open > ri) state.od_open -= 1;
        if (state.other_drivers.length === 0) state.has_other_drivers = '';
        saveSessionState();
        render();
      });
    });
    const s17 = document.getElementById('v2-step17-next');
    if (s17) s17.addEventListener('click', () => {
      syncOtherDriversInputs();
      trackEvent('auto_v2_step_complete');
      advanceToNext();
    });

    // Step 18 (VIN + Registration Photo + Notes + Contact Pref)
    if (currentStepId === 'step_18' && !state.usedDecShortcut) {
      bindUploadWidget('step18', 'registration_or_id');
      state.vehicles.forEach((v, i) => {
        const el = document.getElementById(`vin-${i}`);
        if (el) {
          el.addEventListener('input', () => {
            el.value = cleanVin(el.value).slice(0, 17);
            v.vin = el.value;
            el.classList.remove('is-error');
            const errEl = document.getElementById(`vin-err-${i}`);
            if (errEl) errEl.hidden = true;
          });
        }
      });
    }
    const vinToggle = document.getElementById('v2-vin-toggle');
    if (vinToggle) vinToggle.addEventListener('click', () => {
      const anyVin = state.vehicles.some(v => v && v.vin);
      if (anyVin && vinBoxesOpen) return;          // VINs already typed: keep them in view
      vinBoxesOpen = anyVin ? true : !vinBoxesOpen;
      render();
      if (vinBoxesOpen) { const first = document.getElementById('vin-0'); if (first) { try { first.focus(); } catch (_) {} } }
    });
    const notesInput = document.getElementById('additional_notes');
    if (notesInput) {
      notesInput.addEventListener('input', () => {
        state.additional_notes = notesInput.value;
        saveSessionState();
      });
    }
    document.querySelectorAll('[data-contact-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const picked = normalizeContactMethod(btn.dataset.contactPref);
        state.contact_method = normalizeContactMethod(state.contact_method) === picked ? '' : picked;
        saveSessionState();
        render();
      });
    });
    const s18 = document.getElementById('v2-step18-next');
    const s18Skip = document.getElementById('v2-step18-skip');
    const finishStep18 = async (skip) => {
      if (!skip && !state.usedDecShortcut) {
        let firstVinErrEl = null;
        state.vehicles.forEach((v, i) => {
          const el = document.getElementById(`vin-${i}`);
          const errEl = document.getElementById(`vin-err-${i}`);
          if (!el) return;
          const cleaned = cleanVin(el.value);
          el.value = cleaned;
          if (cleaned && !isValidVin(cleaned)) {
            el.classList.add('is-error');
            if (errEl) {
              errEl.textContent = 'A VIN is 17 letters and numbers and never uses I, O or Q. Check it, or clear the box to skip.';
              errEl.hidden = false;
              if (!firstVinErrEl) firstVinErrEl = errEl;
            }
          } else {
            el.classList.remove('is-error');
            if (errEl) errEl.hidden = true;
            v.vin = cleaned;
          }
        });
        if (firstVinErrEl) {
          focusAlertElement(firstVinErrEl);
          return;
        }
      }
      if (!skip) {
        const notesEl = document.getElementById('additional_notes');
        if (notesEl) state.additional_notes = notesEl.value.trim();
      } else {
        state.vehicles.forEach(v => { if (v.vin && !isValidVin(v.vin)) v.vin = ''; });
      }
      trackEvent('auto_v2_step_complete');
      if (state.usedDecShortcut) {
        const ok = await submitLiveQuote();
        if (!ok) return;
      }
      advanceToNext();
    };
    if (s18) s18.addEventListener('click', () => finishStep18(false));
    if (s18Skip) s18Skip.addEventListener('click', () => finishStep18(true));

    // Step 19 (Review)
    if (currentStepId === 'step_19') {
      bindUploadWidget('step19', 'declarations');
      document.querySelectorAll('[data-review-edit]').forEach(btn => {
        btn.addEventListener('click', () => {
          editingFromReview = true;
          historyStack.push(btn.dataset.reviewEdit);
          enterStep(btn.dataset.reviewEdit);
        });
      });
      const sendBtn = document.getElementById('v2-send-btn');
      if (sendBtn) sendBtn.addEventListener('click', async () => {
        trackEvent('auto_v2_step_complete');
        const ok = await submitLiveQuote();
        if (ok) advanceToNext();
      });
    }

    // Step 20 (Retry upload if files failed after quote succeeded)
    if (currentStepId === 'step_20') {
      const retryBtn = document.getElementById('v2-retry-upload-btn');
      if (retryBtn) retryBtn.addEventListener('click', retryUploadFiles);
    }

    // Mount Cloudflare Turnstile when slot is present (Step 19 or Step 18 Dec Shortcut)
    const tsSlot = document.getElementById('v2-turnstile-slot');
    if (tsSlot && window.turnstile && typeof window.turnstile.render === 'function' && !tsSlot.dataset.mounted) {
      tsSlot.dataset.mounted = '1';
      try {
        window.turnstile.render(tsSlot, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: window.onV2TurnstileSuccess,
          'expired-callback': window.onV2TurnstileExpired
        });
      } catch (_) {}
    }
  }

  function syncOtherDriversInputs() {
    document.querySelectorAll('[data-od-name]').forEach(el => {
      const i = Number(el.dataset.odName);
      if (state.other_drivers[i]) state.other_drivers[i].name = el.value.trim();
    });
    document.querySelectorAll('[data-od-dob]').forEach(el => {
      const i = Number(el.dataset.odDob);
      if (state.other_drivers[i]) state.other_drivers[i].dob = el.value.trim();
    });
  }

  const menuDialog = document.getElementById('v2-menu-dialog');
  document.getElementById('v2-menu-open').addEventListener('click', () => menuDialog.showModal());
  document.getElementById('v2-menu-close').addEventListener('click', () => menuDialog.close());

  async function init() {
    if (window.location.protocol !== 'file:') {
      try {
        const [lr, mr] = await Promise.all([
          fetch('./logos.json', { cache: 'no-store' }),
          fetch('./makes.json', { cache: 'no-store' })
        ]);
        if (lr.ok) logoConfig = await lr.json();
        if (mr.ok) makesConfig = await mr.json();
      } catch (_) {
        logoConfig = FALLBACK_LOGOS;
        makesConfig = FALLBACK_MAKES;
      }
    } else {
      logoConfig = FALLBACK_LOGOS;
      makesConfig = FALLBACK_MAKES;
    }
    loadSessionState();
    if (window.history && typeof window.history.replaceState === 'function') {
      try { window.history.replaceState({ stepId: currentStepId, stack: historyStack.slice() }, ''); } catch (_) {}
    }
    renderTrustStrip();
    enterStep(currentStepId, { isInit: true });
  }

  init();
})();
