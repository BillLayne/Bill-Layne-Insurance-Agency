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
  const emptyDriver = () => ({ name: '', dob: '', marital: '', gender: '' });

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
  let step11Completed = false;
  let partialLeadStubSent = false;
  let finalSubmitted = false;
  let partialTimer = null;
  let visibilityPartialTimer = null;
  let uploadErrorMsg = '';
  let lastConfirmationNumber = '';
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
    if (['step_1', 'step_2', 'step_2b', 'step_3', 'step_3b', 'step_4', 'step_4b'].includes(stepId)) return 'YOUR VEHICLE';
    if (['step_5', 'step_6', 'step_7', 'step_8'].includes(stepId)) return 'CURRENT COVERAGE';
    if (stepId === 'step_9') return 'DRIVING RECORD';
    if (['step_10', 'step_11', 'step_12', 'step_16'].includes(stepId)) return 'ABOUT YOU';
    if (['step_13', 'step_14', 'step_15'].includes(stepId)) return 'YOUR COVERAGE';
    if (stepId === 'step_17') return 'OTHER DRIVERS';
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

  function clearFullCoverageExtras() {
    state.liability_limits = '';
    state.comp_deductible = '';
    state.collision_deductible = '';
    state.rental_reimbursement = false;
    state.roadside_assistance = false;
    state.medical_payments = false;
  }

  function buildLivePayload() {
    const primaryName = (state.driver_1_name || `${state.firstname} ${state.lastname}`).trim();
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
            marital: d.marital || ''
          });
        }
      });
    }

    const fullCov = state.coverage_choice === 'Full coverage';
    let liabilityLimits = '';
    if (state.coverage_choice === 'State minimum (liability only)') {
      liabilityLimits = '50/100/50';
    } else if (state.coverage_choice === 'Not sure, advise me') {
      liabilityLimits = 'HELP ME DECIDE — customer wants coverage guidance';
    } else if (fullCov) {
      liabilityLimits = state.liability_limits || 'HELP ME DECIDE — customer wants coverage guidance';
    }

    const decFiles = uploadedFiles.filter(f => (f._category || 'declarations') !== 'registration_or_id');
    const regFiles = uploadedFiles.filter(f => f._category === 'registration_or_id');

    const noteParts = [
      state.additional_notes,
      (!state.coverage_expiration && state.renewal_window) ? `Renewal: ${state.renewal_window}` : '',
      state.homeowner ? `Homeowner: ${state.homeowner === 'yes' ? 'Yes' : 'No'}` : '',
      state.coverage_choice ? `Coverage preference: ${state.coverage_choice}` : '',
      fullCov ? `Deductibles: comprehensive ${state.comp_deductible || 'Not sure'}, collision ${state.collision_deductible || 'Not sure'}` : '',
      decFiles.length ? `[Declarations page: ${decFiles.map(f => f.name).join(', ')}]` : '',
      regFiles.length ? `[Registration or ID card: ${regFiles.map(f => f.name).join(', ')}]` : ''
    ].filter(Boolean);

    return {
      form_type: 'auto_insurance',
      confirmation_number: lastConfirmationNumber || makeConfirmationNumber(),
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
      contact_method: (state.contact_method || '').toLowerCase(),
      current_insurance: state.current_insurance || 'no',
      current_carrier: state.current_carrier || '',
      coverage_expiration: state.coverage_expiration || '',
      liability_limits: liabilityLimits,
      collision: fullCov,
      comprehensive: fullCov,
      uninsured_motorist: true,
      medical_payments: fullCov && !!state.medical_payments,
      rental_reimbursement: fullCov && !!state.rental_reimbursement,
      roadside_assistance: fullCov && !!state.roadside_assistance,
      comp_deductible: fullCov ? (state.comp_deductible || '') : '',
      collision_deductible: fullCov ? (state.collision_deductible || '') : '',
      previous_claims: state.previous_claims || 'no',
      violations: state.violations || 'no',
      homeowner: state.homeowner || '',
      coverage_preference: state.coverage_choice || '',
      additional_notes: `${TEST_PREFIX} ${noteParts.join(' | ').trim()}`.trim(),
      drivers,
      vehicles: state.vehicles.map(v => ({
        year: v.year || '',
        make: v.make || '',
        model: v.model || '',
        vin: v.vin || ''
      }))
    };
  }

  function resetPartialTimer() {
    if (partialTimer) clearTimeout(partialTimer);
    if (step11Completed && !finalSubmitted && !partialLeadStubSent) {
      partialTimer = setTimeout(() => sendPartialLeadStub('idle_120s'), 120000);
    }
  }

  function sendPartialLeadStub(triggerReason) {
    if (finalSubmitted || partialLeadStubSent || !step11Completed || currentStepId === 'step_20') return;
    const digits = state.phone.replace(/\D/g, '');
    if (!state.firstname.trim() || digits.length < 10) return;
    const dedupeKey = 'bli_partial_auto_v2_' + digits;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
      sessionStorage.setItem(dedupeKey, '1');
    } catch (_) {}
    partialLeadStubSent = true;

    const vehText = state.vehicles
      .filter(v => v.make)
      .map((v, i) => `Vehicle ${i + 1}: ${[v.year, v.make, v.model].filter(Boolean).join(' ')}`)
      .join(' | ');

    const fullName = `${state.firstname} ${state.lastname}`.trim();
    const summary = [
      `${TEST_PREFIX} [PARTIAL AUTO QUOTE — STOPPED AT ${currentStepId}]`,
      `Name: ${fullName}`,
      `Phone: ${state.phone}`,
      `Email: ${state.email || 'Not entered yet'}`,
      vehText || 'Vehicle: Not entered',
      `Current Insurance: ${state.current_insurance || 'N/A'} | Carrier: ${state.current_carrier || 'N/A'}`,
      `Files Selected: ${uploadedFiles.length}`
    ].join('\n');

    try {
      fetch('/api/homepage-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          formType: 'contact',
          name: `${TEST_PREFIX} [PARTIAL AUTO QUOTE - ${currentStepId}] ${fullName}`.slice(0, 150),
          phone: String(state.phone).slice(0, 50),
          email: String(state.email || 'test-partial@billlayneinsurance.com').slice(0, 254),
          message: summary.slice(0, 4900)
        })
      }).catch(() => {});
    } catch (_) {}
    trackEvent('auto_v2_test_partial', { trigger_reason: triggerReason, vehicle_count: state.vehicles.length });
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

  async function submitLiveQuote() {
    if (submittingLive) return false;
    submittingLive = true;
    submitErrorMsg = '';
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
        throw new Error('We could not confirm receipt of your quote request. Please try again or call us at 336-835-1993.');
      }
      lastConfirmationNumber = qJson.confirmationNumber;

      // 2. If declarations pages or registration photos were attached, send them via /api/policy-upload
      if (uploadedFiles.length > 0) {
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
            notes: `${TEST_PREFIX} Ref: ${lastConfirmationNumber} | ${fullPayload.additional_notes}`.slice(0, 6000),
            files: encodedFiles
          })
        });
        const uJson = await uResp.json().catch(() => ({}));
        if (!uResp.ok || uJson.ok !== true) {
          throw new Error(`Your quote (${lastConfirmationNumber}) was received, but your files could not be uploaded. Please text them to (336) 827-9065.`);
        }
      }

      window.__BLI_LAST_PAYLOAD__ = Object.assign({}, fullPayload, { confirmation_number: lastConfirmationNumber });
      trackEvent('auto_v2_test_submit', { confirmation_number: lastConfirmationNumber, used_dec_shortcut: state.usedDecShortcut });
      trackEvent('auto_v2_test_lead', { confirmation_number: lastConfirmationNumber, used_dec_shortcut: state.usedDecShortcut });
      clearSavedProgress();
      submittingLive = false;
      return true;
    } catch (err) {
      finalSubmitted = false;
      submittingLive = false;
      submitErrorMsg = err?.message || 'Something went wrong. Please try again or call us at 336-835-1993.';
      render();
      return false;
    }
  }

  // ─── DYNAMIC 20-STEP SEQUENCE ───
  function getSequence() {
    const seq = ['step_1', 'step_2', 'step_3'];
    if (!state.vehicles[0]?.isCustomMake) seq.push('step_4');

    if (state.vehicleCount >= 2) {
      seq.push('step_2b', 'step_3b');
      if (!state.vehicles[1]?.isCustomMake) seq.push('step_4b');
    }

    seq.push('step_5');
    if (state.current_insurance === 'yes') {
      seq.push('step_6', 'step_7', 'step_8');
    }
    if (state.usedDecShortcut) {
      seq.push('step_11', 'step_18', 'step_20');
      return seq;
    }

    seq.push('step_9', 'step_10', 'step_11', 'step_12', 'step_13');
    if (state.coverage_choice === 'Full coverage') {
      seq.push('step_14', 'step_15');
    }
    seq.push('step_16', 'step_17', 'step_18', 'step_19', 'step_20');
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

    if (stepId === 'step_4' || stepId === 'step_4b') {
      const vIdx = stepId === 'step_4' ? 0 : 1;
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
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('popstate', e => {
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
    if (editingFromReview && currentStepId !== 'step_19') {
      if (currentStepId === 'step_13' && state.coverage_choice === 'Full coverage' && (!state.liability_limits || !state.comp_deductible || !state.collision_deductible)) {
        historyStack.push('step_14');
        enterStep('step_14');
        return;
      }
      if (currentStepId === 'step_14' && (!state.comp_deductible || !state.collision_deductible)) {
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
          if (errEl) { errEl.textContent = 'Please enter a valid date (MM / DD / YYYY).'; errEl.hidden = false; }
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

  function showFieldError(inputId, msg) {
    const el = document.getElementById(inputId);
    const errEl = document.getElementById(`${inputId}-err`) || document.getElementById('v2-step-err');
    if (el) {
      el.classList.add('is-error');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
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
        ${uploadErrorMsg ? `<div class="v2-error" role="alert">${escapeHtml(uploadErrorMsg)}</div>` : ''}
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

  function renderChips() {
    const el = document.getElementById('v2-chips');
    if (currentStepId === 'step_20') { el.innerHTML = ''; return; }
    const chips = [];
    state.vehicles.forEach((v, idx) => {
      if (v.make) {
        const label = [v.year, v.make, v.model].filter(Boolean).join(' ');
        chips.push(`
          <span class="v2-chip">
            <span>${escapeHtml(label)}</span>
            <button type="button" class="v2-chip-btn" data-edit-veh="${idx}" aria-label="Edit ${escapeHtml(label)}">Edit</button>
            <button type="button" class="v2-chip-btn remove" data-remove-veh="${idx}" aria-label="Remove ${escapeHtml(label)}">&times;</button>
          </span>
        `);
      }
    });
    el.innerHTML = chips.join('');
    el.querySelectorAll('[data-edit-veh]').forEach(b => {
      b.addEventListener('click', () => {
        const target = Number(b.dataset.editVeh) === 0 ? 'step_2' : 'step_2b';
        historyStack.push(target);
        enterStep(target);
      });
    });
    el.querySelectorAll('[data-remove-veh]').forEach(b => {
      b.addEventListener('click', () => {
        const i = Number(b.dataset.removeVeh);
        if (state.vehicles.length > 1) {
          state.vehicles.splice(i, 1);
          state.vehicleCount = state.vehicles.length;
        } else {
          state.vehicles[0] = emptyVeh();
          currentStepId = 'step_2';
        }
        saveSessionState();
        render();
      });
    });
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
          <button type="button" class="v2-tile ${state.vehicleCount === 2 ? 'is-selected' : ''}" aria-pressed="${state.vehicleCount === 2 ? 'true' : 'false'}" data-veh-count="2">
            ${iconHtml('car2')}<span>2+ Vehicles</span>
          </button>
        </div>
      `;
    }

    // STEP 2 / 2b: Vehicle Make
    else if (currentStepId === 'step_2' || currentStepId === 'step_2b') {
      const vIdx = currentStepId === 'step_2' ? 0 : 1;
      const v = state.vehicles[vIdx] || (state.vehicles[vIdx] = emptyVeh());
      const label = state.vehicleCount >= 2 ? (vIdx === 0 ? 'first' : 'second') : '';
      const activeCarMakes = activeSorted(logoConfig.carMakes);
      const tileMakes = activeCarMakes.length ? activeCarMakes.map(m => m.name) : (makesConfig.tileMakes || FALLBACK_MAKES.tileMakes);
      const dropdownMakes = [...tileMakes, ...(makesConfig.dropdownOnlyMakes || FALLBACK_MAKES.dropdownOnlyMakes)];
      const customOpen = showOtherMakeBox || v.isCustomMake;

      body = `
        <h1 class="v2-heading">What is your ${label ? label + ' ' : ''}vehicle's make?</h1>
        <p class="v2-sub">${vIdx === 1 ? 'Need to insure more than two vehicles? You can add additional cars at the end.' : 'Tap a make below or choose from the dropdown.'}</p>
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
    else if (currentStepId === 'step_3' || currentStepId === 'step_3b') {
      const vIdx = currentStepId === 'step_3' ? 0 : 1;
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
    else if (currentStepId === 'step_4' || currentStepId === 'step_4b') {
      const vIdx = currentStepId === 'step_4' ? 0 : 1;
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
        <h1 class="v2-heading">Tell us about your driving record</h1>
        <p class="v2-sub">Include any drivers who will be on the policy.</p>
        <div class="v2-group-block">
          <div class="v2-group-title">Any claims in the past 5 years?</div>
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

    // STEP 11: Contact (Email REQUIRED on normal path; Email optional on declarations shortcut path)
    else if (currentStepId === 'step_11') {
      const emailOptional = state.usedDecShortcut;
      body = `
        <h1 class="v2-heading" tabindex="-1">Where should we send your quotes?</h1>
        <p class="v2-sub">Only our local North Carolina team sees your details. We never sell your information.</p>
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
            <label for="email">${emailOptional ? 'Email (optional)' : 'Email address'}</label>
            <input id="email" name="email" class="v2-input" type="email" inputmode="email" autocomplete="email" enterkeyhint="go" value="${escapeHtml(state.email)}">
            <div id="email-err" class="v2-field-err" role="alert" hidden></div>
          </div>
          <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
          <button type="button" class="v2-btn-gold" id="v2-step11-next">Continue &rarr;</button>
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

    // STEP 13: Coverage type
    else if (currentStepId === 'step_13') {
      const opts = [
        { label: 'State minimum (liability only)', icon: iconHtml('covMin') },
        { label: 'Full coverage', icon: iconHtml('covFull') },
        { label: 'Not sure, advise me', icon: iconHtml('covAdvise') }
      ];
      body = `
        <h1 class="v2-heading">What type of coverage do you want?</h1>
        <p class="v2-sub">Choose the option that fits best. Our team will walk through details with you.</p>
        <div class="v2-grid-3">
          ${opts.map(o => `
            <button type="button" class="v2-tile ${state.coverage_choice === o.label ? 'is-selected' : ''}" aria-pressed="${state.coverage_choice === o.label ? 'true' : 'false'}" data-cov="${escapeHtml(o.label)}">
              ${o.icon}<span>${escapeHtml(o.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
    }

    // STEP 14: Liability limits (ONLY if Full coverage)
    else if (currentStepId === 'step_14') {
      body = `
        <h1 class="v2-heading">Choose your liability limits</h1>
        <p class="v2-sub">Pick the limit you want quoted, or let our team walk through options with you.</p>
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

    // STEP 15: Deductibles & extras (ONLY if Full coverage, ONE screen; 3-across deductibles + full-row extras on phones)
    else if (currentStepId === 'step_15') {
      const ready = !!(state.comp_deductible && state.collision_deductible);
      const extras = [
        { key: 'rental_reimbursement', label: 'Rental car (loss of use)' },
        { key: 'roadside_assistance', label: 'Towing and roadside' },
        { key: 'medical_payments', label: 'Medical payments' }
      ];
      body = `
        <h1 class="v2-heading" tabindex="-1">Deductibles &amp; optional extras</h1>
        <p class="v2-sub">Not sure? Pick 'Not sure' and our team will show you the difference.</p>
        <div class="v2-group-block">
          <div class="v2-group-title">Comprehensive deductible</div>
          <div class="v2-chip-group v2-chip-grid-3">
            ${COMP_DED_OPTS.map(d => `
              <button type="button" class="v2-choice-chip ${state.comp_deductible === d ? 'is-selected' : ''}" aria-pressed="${state.comp_deductible === d ? 'true' : 'false'}" data-comp-ded="${escapeHtml(d)}">${escapeHtml(d)}</button>
            `).join('')}
          </div>
        </div>
        <div class="v2-group-block">
          <div class="v2-group-title">Collision deductible</div>
          <div class="v2-chip-group v2-chip-grid-3">
            ${COLL_DED_OPTS.map(d => `
              <button type="button" class="v2-choice-chip ${state.collision_deductible === d ? 'is-selected' : ''}" aria-pressed="${state.collision_deductible === d ? 'true' : 'false'}" data-coll-ded="${escapeHtml(d)}">${escapeHtml(d)}</button>
            `).join('')}
          </div>
        </div>
        <div class="v2-group-block">
          <div class="v2-group-title">Optional extras (tap to add)</div>
          <div class="v2-chip-group v2-chip-grid-1">
            ${extras.map(ex => `
              <button type="button" class="v2-choice-chip ${state[ex.key] ? 'is-selected' : ''}" aria-pressed="${state[ex.key] ? 'true' : 'false'}" data-extra-key="${ex.key}">${escapeHtml(ex.label)}</button>
            `).join('')}
          </div>
        </div>
        ${ready ? `
          <div class="v2-actions-stack">
            <button type="button" class="v2-btn-gold" id="v2-step15-next">Continue &rarr;</button>
          </div>
        ` : ''}
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
      const showList = state.has_other_drivers === 'yes';
      const allDriversValid = showList && state.other_drivers.length > 0 && state.other_drivers.every(d => d.name && d.dob && d.marital && d.gender);
      const cards = state.other_drivers.map((d, i) => `
        <div class="v2-driver-card">
          <div class="v2-driver-head">
            <span>Additional driver ${i + 1}</span>
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
        </div>
      `).join('');

      body = `
        <h1 class="v2-heading">Any other drivers in your household?</h1>
        <p class="v2-sub">Include licensed spouses, relatives, or teen drivers living at your address.</p>
        <div class="v2-grid-2">
          <button type="button" class="v2-tile ${state.has_other_drivers === 'yes' ? 'is-selected' : ''}" aria-pressed="${state.has_other_drivers === 'yes' ? 'true' : 'false'}" id="v2-od-yes">
            ${iconHtml('driverYes')}<span>Yes</span>
          </button>
          <button type="button" class="v2-tile ${state.has_other_drivers === 'no' ? 'is-selected' : ''}" aria-pressed="${state.has_other_drivers === 'no' ? 'true' : 'false'}" id="v2-od-no">
            ${iconHtml('driverNo')}<span>No</span>
          </button>
        </div>
        ${showList ? `
          <div class="v2-col">
            ${cards}
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
              <button type="button" class="v2-btn-outline" id="v2-add-driver">+ Add another driver</button>
            </div>
            <div id="v2-step-err" class="v2-error" role="alert" hidden></div>
            ${allDriversValid ? `<button type="button" class="v2-btn-gold" id="v2-step17-next">Continue &rarr;</button>` : ''}
          </div>
        ` : ''}
      `;
    }

    // STEP 18: VIN & Registration Photo (normal path) OR Notes only (declarations shortcut)
    else if (currentStepId === 'step_18') {
      const isDecPath = state.usedDecShortcut;
      const prefOpts = [
        { val: 'Text', icon: iconHtml('contactText') },
        { val: 'Call', icon: iconHtml('contactCall') },
        { val: 'Email', icon: iconHtml('contactEmail') }
      ];
      body = `
        <h1 class="v2-heading">${isDecPath ? 'Anything else we should know?' : 'Vehicle VINs &amp; final notes (optional)'}</h1>
        <p class="v2-sub">${isDecPath ? 'Optional — add any questions, extra vehicles, or how you prefer we reach you.' : 'No VIN handy? Skip it. Our team can usually look it up.'}</p>
        <div class="v2-col">
          ${!isDecPath ? state.vehicles.map((v, i) => `
            <div class="v2-field">
              <label for="vin-${i}">VIN for ${escapeHtml([v.year, v.make, v.model].filter(Boolean).join(' ') || `Vehicle ${i + 1}`)} (optional)</label>
              <input id="vin-${i}" name="vehicle_${i + 1}_vin" class="v2-input" type="text" maxlength="25" autocapitalize="characters" spellcheck="false" placeholder="17-character VIN (e.g. 1FTFW1E84MFA12345)" value="${escapeHtml(v.vin || '')}">
              <div id="vin-err-${i}" class="v2-field-err" role="alert" hidden></div>
            </div>
          `).join('') : ''}
          ${!isDecPath ? `
            <div class="v2-field">
              <label>Or snap a photo of your registration or insurance card</label>
              ${renderUploadWidget('step18', 'registration_or_id')}
            </div>
          ` : ''}
          <div class="v2-field">
            <label>How would you like us to reach you? (optional)</label>
            <div class="v2-grid-3" style="margin:8px 0 0">
              ${prefOpts.map(p => `
                <button type="button" class="v2-tile compact ${state.contact_method === p.val ? 'is-selected' : ''}" aria-pressed="${state.contact_method === p.val ? 'true' : 'false'}" data-contact-pref="${p.val}">
                  ${p.icon}<span>${p.val}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <div class="v2-field">
            <label for="additional_notes">Anything else we should know? (optional)</label>
            <textarea id="additional_notes" name="additional_notes" class="v2-textarea">${escapeHtml(state.additional_notes)}</textarea>
          </div>
          ${isDecPath ? '<div class="v2-turnstile-wrap" id="v2-turnstile-slot"></div>' : ''}
          ${submitErrorMsg && isDecPath ? `<div class="v2-error" role="alert">${escapeHtml(submitErrorMsg)}</div>` : ''}
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
        { label: 'Driving Record', val: `Claims (5 yrs): ${capitalize(state.previous_claims || 'no')} · Tickets/violations (3 yrs): ${capitalize(state.violations || 'no')}`, edit: 'step_9' },
        { label: 'Own Home', val: state.homeowner === 'yes' ? 'Yes' : 'No', edit: 'step_10' },
        { label: 'Contact', val: `${state.firstname} ${state.lastname} · ${state.phone} · ${state.email}`, edit: 'step_11' },
        { label: 'Primary Driver', val: `${state.driver_1_name || `${state.firstname} ${state.lastname}`.trim()} · DOB: ${state.driver_1_dob || 'N/A'} · ${capitalize(state.driver_1_marital)} · ${capitalize(state.driver_1_gender)}`, edit: 'step_12' },
        { label: 'Coverage Type', val: state.coverage_choice || 'Not selected', edit: 'step_13' }
      );
      if (state.coverage_choice === 'Full coverage') {
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
            val: `${d.name || 'Unnamed'} · DOB: ${d.dob || 'N/A'} · ${capitalize(d.marital)} · ${capitalize(d.gender)}`,
            edit: 'step_17'
          });
        });
      } else {
        rows.push({ label: 'Other Household Drivers', val: 'None', edit: 'step_17' });
      }
      rows.push({ label: 'Notes & Contact Preference', val: `${state.additional_notes || 'No notes'}${state.contact_method ? ` · Prefer: ${state.contact_method}` : ''}`, edit: 'step_18' });

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
        ${submitErrorMsg ? `<div class="v2-error" role="alert" style="max-width:580px;margin:10px auto">${escapeHtml(submitErrorMsg)}</div>` : ''}
        <div class="v2-actions-stack">
          <button type="button" class="v2-btn-gold" id="v2-send-btn" ${submittingLive ? 'disabled' : ''}>${submittingLive ? 'Sending...' : 'Send my quote request'}</button>
        </div>
      `;
    }

    // STEP 20: Final Screen
    else if (currentStepId === 'step_20') {
      const prefLine = state.contact_method
        ? ` We will reach you by ${escapeHtml(state.contact_method.toLowerCase())}.`
        : '';
      body = `
        <div class="v2-final-icon" aria-hidden="true">
          ${iconHtml('confirmCheck')}
        </div>
        <h1 class="v2-heading">A licensed North Carolina agent is comparing six carriers for you. We will send your prices by text or email.</h1>
        <p class="v2-sub">${prefLine ? prefLine.trim() + ' ' : ''}Request reference: <strong>${escapeHtml(lastConfirmationNumber)}</strong>. Have a question right now? Call us or text us below.</p>
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
      if (focusHeadingNextRender) {
        focusHeadingNextRender = false;
        headingEl.focus({ preventScroll: true });
      }
    }
    bindStepEvents();
    renderMobileBar();
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
        if (!state.usedDecShortcut && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          showFieldError('email', 'Please enter a valid email address.');
          return;
        }
        if (state.usedDecShortcut && em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          showFieldError('email', 'Please enter a valid email address, or leave Email blank.');
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

    // Step 15 (Deductibles & Extras)
    document.querySelectorAll('[data-comp-ded]').forEach(btn => {
      btn.addEventListener('click', () => { state.comp_deductible = btn.dataset.compDed; saveSessionState(); render(); });
    });
    document.querySelectorAll('[data-coll-ded]').forEach(btn => {
      btn.addEventListener('click', () => { state.collision_deductible = btn.dataset.collDed; saveSessionState(); render(); });
    });
    document.querySelectorAll('[data-extra-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.extraKey;
        state[k] = !state[k];
        saveSessionState();
        render();
      });
    });
    const s15 = document.getElementById('v2-step15-next');
    if (s15) s15.addEventListener('click', () => {
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
      if (state.other_drivers.length === 0) state.other_drivers.push(emptyDriver());
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
      saveSessionState();
      render();
    });
    document.querySelectorAll('[data-rem-driver]').forEach(btn => {
      btn.addEventListener('click', () => {
        syncOtherDriversInputs();
        state.other_drivers.splice(Number(btn.dataset.remDriver), 1);
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
    document.querySelectorAll('[data-contact-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.contact_method = state.contact_method === btn.dataset.contactPref ? '' : btn.dataset.contactPref;
        render();
      });
    });
    const s18 = document.getElementById('v2-step18-next');
    const s18Skip = document.getElementById('v2-step18-skip');
    const finishStep18 = async (skip) => {
      if (!skip && !state.usedDecShortcut) {
        let hasVinErr = false;
        state.vehicles.forEach((v, i) => {
          const el = document.getElementById(`vin-${i}`);
          const errEl = document.getElementById(`vin-err-${i}`);
          if (!el) return;
          const cleaned = cleanVin(el.value);
          el.value = cleaned;
          if (cleaned && !isValidVin(cleaned)) {
            hasVinErr = true;
            el.classList.add('is-error');
            if (errEl) {
              errEl.textContent = 'A VIN is 17 letters and numbers and never uses I, O or Q. Check it, or clear the box to skip.';
              errEl.hidden = false;
            }
          } else {
            el.classList.remove('is-error');
            if (errEl) errEl.hidden = true;
            v.vin = cleaned;
          }
        });
        if (hasVinErr) return;
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
