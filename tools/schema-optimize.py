import json
import sys

INDEX_PATH = r"C:\Users\bill\OneDrive\Documents\Bill-Layne-Insurance-Agency-LIVE\index.html"

schema = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "InsuranceAgency",
            "@id": "https://www.billlayneinsurance.com/#agency",
            "name": "Bill Layne Insurance Agency",
            "alternateName": "Bill Layne Insurance",
            "legalName": "Bill Layne Insurance Agency LLC",
            "url": "https://www.billlayneinsurance.com",
            "logo": "https://i.imgur.com/Z5MxmKE.png",
            "image": "https://i.imgur.com/ayxaUyZ.jpeg",
            "description": "Independent insurance agency in Elkin, NC comparing quotes from Progressive, Travelers, Nationwide, National General and more. Licensed in all 100 North Carolina counties since 2005.",
            "telephone": "+1-336-835-1993",
            "email": "Save@BillLayneInsurance.com",
            "slogan": "One Call. 7 Carriers Compete.",
            "naics": "524210",
            "knowsLanguage": ["en", "es"],
            "paymentAccepted": ["Credit Card", "Debit Card", "Check", "Bank Draft", "EFT"],
            "currenciesAccepted": "USD",
            "priceRange": "$$",
            "foundingDate": "2005",
            "numberOfEmployees": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 10
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "1283 N Bridge St",
                "addressLocality": "Elkin",
                "addressRegion": "NC",
                "postalCode": "28621",
                "addressCountry": "US"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 36.2440,
                "longitude": -80.8487
            },
            "openingHoursSpecification": [{
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "17:00"
            }],
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "telephone": "+1-336-835-1993",
                    "contactType": "customer service",
                    "availableLanguage": ["English"],
                    "areaServed": "NC"
                },
                {
                    "@type": "ContactPoint",
                    "telephone": "+1-336-356-2200",
                    "contactType": "customer service",
                    "availableLanguage": ["English", "Spanish"],
                    "areaServed": "NC"
                },
                {
                    "@type": "ContactPoint",
                    "telephone": "+1-336-835-1993",
                    "contactType": "claims"
                }
            ],
            "department": {
                "@type": "InsuranceAgency",
                "name": "Aseguranza Comunidad Unida",
                "telephone": "+1-336-356-2200",
                "email": "jimenez.links@gmail.com",
                "availableLanguage": ["es", "en"],
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "209 S Main St",
                    "addressLocality": "Dobson",
                    "addressRegion": "NC",
                    "postalCode": "27017",
                    "addressCountry": "US"
                },
                "openingHoursSpecification": [{
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "09:00",
                    "closes": "17:00"
                }],
                "employee": {
                    "@type": "Person",
                    "name": "Rosa Jimenez"
                }
            },
            "founder": {
                "@type": "Person",
                "@id": "https://www.billlayneinsurance.com/#founder",
                "name": "Bill Layne",
                "jobTitle": "Owner & Licensed Insurance Agent",
                "hasCredential": {
                    "@type": "EducationalOccupationalCredential",
                    "credentialCategory": "license",
                    "name": "North Carolina Department of Insurance License"
                },
                "knowsAbout": ["Auto Insurance", "Home Insurance", "Renters Insurance", "Motorcycle Insurance", "NC SDIP", "Independent Insurance Agency"],
                "worksFor": {"@id": "https://www.billlayneinsurance.com/#agency"}
            },
            "areaServed": [
                {"@type": "AdministrativeArea", "name": "North Carolina"},
                {"@type": "City", "name": "Elkin", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Mount Airy", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Jonesville", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Dobson", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Pilot Mountain", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Yadkinville", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "City", "name": "Wilkesboro", "containedInPlace": {"@type": "AdministrativeArea", "name": "North Carolina"}},
                {"@type": "AdministrativeArea", "name": "Surry County, NC"},
                {"@type": "AdministrativeArea", "name": "Yadkin County, NC"},
                {"@type": "AdministrativeArea", "name": "Wilkes County, NC"},
                {"@type": "AdministrativeArea", "name": "Stokes County, NC"}
            ],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Insurance Products",
                "itemListElement": [
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Auto Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Homeowners Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Renters Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Motorcycle & ATV Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Mobile & Manufactured Home Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Landlord & Rental Property Insurance"}},
                    {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Personal Umbrella Insurance"}}
                ]
            },
            "sameAs": [
                "https://www.facebook.com/dollarbillagency/",
                "https://www.instagram.com/ncautoandhome/",
                "https://www.youtube.com/@ncautoandhome",
                "https://www.tiktok.com/@ncautoandhome",
                "https://x.com/shopsavecompare",
                "https://maps.google.com/?cid=13492628883969206897"
            ]
        },
        {
            "@type": "Service",
            "@id": "https://www.billlayneinsurance.com/#insurance-service",
            "name": "Independent Insurance Comparison",
            "serviceType": "Insurance Brokerage",
            "provider": {"@id": "https://www.billlayneinsurance.com/#agency"},
            "areaServed": {"@type": "AdministrativeArea", "name": "North Carolina"},
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "127",
                "bestRating": "5"
            }
        },
        {
            "@type": "WebSite",
            "@id": "https://www.billlayneinsurance.com/#website",
            "name": "Bill Layne Insurance Agency",
            "url": "https://www.billlayneinsurance.com/",
            "description": "Independent insurance agency in Elkin, NC comparing multiple carriers for auto, home, and business insurance.",
            "inLanguage": ["en-US", "es-US"],
            "copyrightYear": "2026",
            "copyrightHolder": {"@id": "https://www.billlayneinsurance.com/#agency"},
            "publisher": {"@id": "https://www.billlayneinsurance.com/#agency"}
        },
        {
            "@type": "WebPage",
            "@id": "https://www.billlayneinsurance.com/#webpage",
            "name": "Bill Layne Insurance Agency - Independent Insurance in Elkin, NC",
            "url": "https://www.billlayneinsurance.com/",
            "isPartOf": {"@id": "https://www.billlayneinsurance.com/#website"},
            "about": {"@id": "https://www.billlayneinsurance.com/#agency"},
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": ["#home h2", ".accordion-btn", ".accordion-content"]
            }
        },
        {
            "@type": "FAQPage",
            "@id": "https://www.billlayneinsurance.com/#faq",
            "mainEntity": [
                {"@type": "Question", "name": "How do you help North Carolina drivers compare auto insurance rates?", "acceptedAnswer": {"@type": "Answer", "text": "As an independent agency, Bill Layne Insurance compares rates from top NC carriers including Travelers, Progressive, Nationwide, and NC Grange to find your best available rate. Rates vary by carrier and underwriting."}},
                {"@type": "Question", "name": "What carriers does Bill Layne Insurance Agency represent?", "acceptedAnswer": {"@type": "Answer", "text": "We represent 10 appointed insurance carriers across North Carolina, including Nationwide, Progressive, Travelers, National General, Alamance Farmers Mutual, NC Grange Mutual, Foremost, The General, Hagerty, and Universal Property."}},
                {"@type": "Question", "name": "What is the best way to bundle auto and home insurance in NC?", "acceptedAnswer": {"@type": "Answer", "text": "Bundling auto and home insurance is a common way to coordinate coverage. Many carriers offer multi-policy discounts when you combine auto and home policies. We compare bundle rates across top carriers to find your best combination."}},
                {"@type": "Question", "name": "What should I do if I have an insurance claim in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "Call us first at (336) 835-1993. As your advocate, we advise on the claims process, help file the claim with the carrier, and ensure it is handled fairly and promptly. That is the advantage of a local agent."}},
                {"@type": "Question", "name": "Do you offer business insurance in Surry County NC?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, we provide commercial insurance for Elkin and Surry County businesses, including General Liability, Workers Compensation, Commercial Auto, and Business Owners Policies (BOP)."}},
                {"@type": "Question", "name": "What is the cheapest car insurance in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "The most affordable car insurance in NC depends on your driving record, vehicle, and coverage needs. Bill Layne Insurance compares options from Progressive, Travelers, National General, and more to find competitive pricing. NC minimum liability is 50/100/50."}},
                {"@type": "Question", "name": "How much does home insurance cost in Surry County NC?", "acceptedAnswer": {"@type": "Answer", "text": "Home insurance costs in Surry County vary based on your home value, age, construction type, claims history, and coverage level. We shop multiple carriers to find a competitive rate and ensure your home is insured for full replacement cost."}},
                {"@type": "Question", "name": "What is an FS-1 form in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "An FS-1 is North Carolina's official Certificate of Insurance used by the NC DMV to verify continuous liability coverage when registering a vehicle or addressing a lapse notice. Your insurance company or local agent can issue an FS-1 directly."}},
                {"@type": "Question", "name": "What is the difference between an independent agent and a captive agent?", "acceptedAnswer": {"@type": "Answer", "text": "A captive agent like State Farm or Allstate can only sell one company's policies. An independent agent like Bill Layne Insurance represents multiple carriers, comparing rates and coverage across companies to find the best fit for your needs and budget."}},
                {"@type": "Question", "name": "Do I need renters insurance in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "While not required by NC state law, renters insurance is highly recommended. Your landlord's policy does not cover your personal belongings in a fire, theft, or pipe burst. Renters policies are typically very affordable and can be bundled with auto coverage."}},
                {"@type": "Question", "name": "How often should I review my NC insurance policy?", "acceptedAnswer": {"@type": "Answer", "text": "Review your insurance at least once a year or after major life changes like buying a home, adding a teen driver, getting married, or starting a business. Rate changes and new discounts happen regularly across carriers."}},
                {"@type": "Question", "name": "Can I get insurance after an accident or moving violation in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. We work with carriers that write policies for drivers with at-fault accidents, speeding violations, or points under the NC Safe Driver Incentive Plan. We compare multiple carriers to find you an affordable policy."}},
                {"@type": "Question", "name": "What happens if I let my NC car insurance lapse?", "acceptedAnswer": {"@type": "Answer", "text": "In North Carolina, driving without insurance is a Class 1 misdemeanor. If coverage lapses, the NC DMV can revoke your registration and plates. You may also face higher premiums when reinstating because carriers view a lapse as a risk factor."}},
                {"@type": "Question", "name": "Does my credit score affect my insurance rate in North Carolina?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, most NC carriers use a credit-based insurance score to help determine your premium. This differs from your lending credit score. Because each carrier weighs credit differently, shopping through an independent agent can help find a better rate."}},
                {"@type": "Question", "name": "What is the NC Safe Driver Incentive Plan (SDIP)?", "acceptedAnswer": {"@type": "Answer", "text": "The SDIP is North Carolina's unique points system that directly affects your insurance premiums. Points are assigned for at-fault accidents and moving violations and remain on your record for 3 years. Even one speeding ticket can increase your rate."}}
            ]
        },
        {
            "@type": "HowTo",
            "@id": "https://www.billlayneinsurance.com/#howto",
            "name": "How to Compare Auto Insurance Rates in North Carolina",
            "description": "Save time by letting an independent agent shop multiple NC insurance carriers for you in 3 simple steps.",
            "step": [
                {"@type": "HowToStep", "name": "Start Your Savings Analysis", "text": "Enter your zip code or share your current policy details with Bill Layne Insurance Agency in Elkin, NC. A licensed professional reviews your information personally.", "position": 1},
                {"@type": "HowToStep", "name": "We Shop Multiple Carriers", "text": "As an independent agency, we compare rates from carriers like Progressive, Travelers, Nationwide, and more to find you a competitive rate.", "position": 2},
                {"@type": "HowToStep", "name": "Review and Sign Digitally", "text": "Review your personalized quote, e-sign from your phone, and we handle the rest including canceling your old policy and notifying your mortgage lender.", "position": 3}
            ],
            "totalTime": "PT5M"
        },
        {
            "@type": "BreadcrumbList",
            "@id": "https://www.billlayneinsurance.com/#breadcrumb",
            "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.billlayneinsurance.com/"}]
        },
        {
            "@type": "VideoObject",
            "@id": "https://www.billlayneinsurance.com/#video",
            "name": "1-800 Number vs Independent Agent - There is a Clear Winner",
            "description": "See the real difference between calling a faceless 1-800 number and working with a local independent insurance agent who fights for you.",
            "thumbnailUrl": "https://img.youtube.com/vi/XySGoor0oxI/maxresdefault.jpg",
            "uploadDate": "2025-01-01T00:00:00-05:00",
            "duration": "PT2M4S",
            "contentUrl": "https://www.youtube.com/watch?v=XySGoor0oxI",
            "embedUrl": "https://www.youtube.com/embed/XySGoor0oxI",
            "publisher": {"@id": "https://www.billlayneinsurance.com/#agency"},
            "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": {"@type": "WatchAction"}
            }
        }
    ]
}

schema_json = json.dumps(schema, indent=4, ensure_ascii=False)

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "    <!-- Structured Data: LocalBusiness / InsuranceAgency -->"
end_marker = "    <!-- Fonts & Icons -->"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print("ERROR: Start marker not found")
    sys.exit(1)
if end_idx == -1:
    print("ERROR: End marker not found")
    sys.exit(1)

new_block = '    <!-- Structured Data: Unified @graph (InsuranceAgency, Service, WebSite, WebPage, FAQPage, HowTo, BreadcrumbList, VideoObject) -->\n'
new_block += '    <script type="application/ld+json">\n'
new_block += schema_json + '\n'
new_block += '    </script>\n\n'

content = content[:start_idx] + new_block + content[end_idx:]

# Phase 11: Meta tags
robots_meta = '<meta name="robots" content="index, follow">'
new_meta = '<meta name="robots" content="index, follow">\n'
new_meta += '    <meta name="theme-color" content="#1e40af">\n'
new_meta += '    <meta name="apple-mobile-web-app-title" content="Bill Layne Insurance">\n'
new_meta += '    <meta name="application-name" content="Bill Layne Insurance">\n'
new_meta += '    <meta name="format-detection" content="telephone=no">'
content = content.replace(robots_meta, new_meta, 1)

# Phase 12: Resource hints
fonts_comment = "    <!-- Fonts & Icons -->"
hints = '    <!-- Resource Hints (Performance/LCP) -->\n'
hints += '    <link rel="dns-prefetch" href="https://i.imgur.com">\n'
hints += '    <link rel="preconnect" href="https://i.imgur.com" crossorigin>\n'
hints += '    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">\n'
hints += '    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>\n'
hints += '    <link rel="preload" href="css/tailwind-output.css" as="style">\n\n'
hints += '    <!-- Fonts & Icons -->'
content = content.replace(fonts_comment, hints, 1)

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(content)

count = content.count('<script type="application/ld+json">')
print(f"SUCCESS: All 13 phases applied")
print(f"  JSON-LD blocks: {count} (should be 1)")
