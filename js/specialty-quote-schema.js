// Shared field contract; copied unchanged into the private Apps Script candidate.
var SpecialtySchema = {
  motorcycle: {
  "title": "Motorcycle / ATV",
  "receipt": "MOTORCYCLE",
  "assetTitle": "Vehicle",
  "operatorTitle": "Rider",
  "applicant": [
    {
      "key": "firstname",
      "label": "Legal first name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "autocomplete": "given-name"
    },
    {
      "key": "middlename",
      "label": "Middle name",
      "type": "text",
      "required": false,
      "maxLength": 60
    },
    {
      "key": "lastname",
      "label": "Legal last name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "autocomplete": "family-name"
    },
    {
      "key": "date_of_birth",
      "label": "Date of birth",
      "type": "date",
      "required": true,
      "dateRule": "birth",
      "autocomplete": "bday"
    },
    {
      "key": "phone",
      "label": "Phone number",
      "type": "tel",
      "required": true,
      "maxLength": 25,
      "autocomplete": "tel"
    },
    {
      "key": "email",
      "label": "Email address",
      "type": "email",
      "required": true,
      "maxLength": 180,
      "autocomplete": "email"
    },
    {
      "key": "address",
      "label": "Home street address",
      "type": "text",
      "required": true,
      "maxLength": 180,
      "autocomplete": "address-line1"
    },
    {
      "key": "unit",
      "label": "Apartment / unit",
      "type": "text",
      "required": false,
      "maxLength": 40,
      "autocomplete": "address-line2"
    },
    {
      "key": "city",
      "label": "City",
      "type": "text",
      "required": true,
      "maxLength": 80,
      "autocomplete": "address-level2"
    },
    {
      "key": "state",
      "label": "State",
      "type": "select",
      "required": true,
      "options": [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC"
      ],
      "default": "NC",
      "autocomplete": "address-level1"
    },
    {
      "key": "zip_code",
      "label": "ZIP code",
      "type": "text",
      "required": true,
      "pattern": "[0-9]{5}",
      "maxLength": 5,
      "inputmode": "numeric",
      "autocomplete": "postal-code"
    },
    {
      "key": "county",
      "label": "County",
      "type": "text",
      "required": false,
      "maxLength": 100
    },
    {
      "key": "marital_status",
      "label": "Marital status",
      "type": "select",
      "required": false,
      "options": [
        "Single",
        "Married",
        "Domestic partner",
        "Divorced",
        "Widowed",
        "Prefer to discuss"
      ]
    },
    {
      "key": "homeownership",
      "label": "Do you own or rent your home?",
      "type": "select",
      "required": false,
      "options": [
        "Own",
        "Rent",
        "Live with family / other"
      ]
    },
    {
      "key": "contact_preference",
      "label": "Preferred way to reach you",
      "type": "select",
      "required": false,
      "options": [
        "Phone call",
        "Email"
      ]
    },
    {
      "key": "effective_date",
      "label": "Requested coverage start date",
      "type": "date",
      "required": true,
      "dateRule": "future"
    }
  ],
  "assets": [
    {
      "key": "type",
      "label": "Vehicle type",
      "type": "select",
      "required": true,
      "options": [
        "Motorcycle / trike",
        "ATV",
        "Side-by-side / UTV",
        "Dirt bike",
        "Scooter / moped",
        "Other / discuss"
      ]
    },
    {
      "key": "year",
      "label": "Model year",
      "type": "number",
      "required": true,
      "min": 1900,
      "max": 2100,
      "step": "1"
    },
    {
      "key": "make",
      "label": "Make / manufacturer",
      "type": "text",
      "required": true,
      "maxLength": 100
    },
    {
      "key": "model",
      "label": "Model",
      "type": "text",
      "required": true,
      "maxLength": 100
    },
    {
      "key": "vin",
      "label": "VIN",
      "type": "text",
      "required": false,
      "maxLength": 17,
      "pattern": "[A-HJ-NPR-Za-hj-npr-z0-9]{5,17}",
      "hint": "Optional now. Usually 17 characters; older motorcycles may have a shorter VIN."
    },
    {
      "key": "engine_cc",
      "label": "Engine size (cc)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000,
      "step": "1"
    },
    {
      "key": "power",
      "label": "Power source",
      "type": "select",
      "required": true,
      "options": [
        "Gasoline",
        "Electric",
        "Other / not sure"
      ]
    },
    {
      "key": "value",
      "label": "Estimated current value ($)",
      "type": "number",
      "required": false,
      "min": 1,
      "max": 10000000,
      "step": "1"
    },
    {
      "key": "purchase_date",
      "label": "Purchase date (if known)",
      "type": "date",
      "required": false
    },
    {
      "key": "purchase_price",
      "label": "Purchase price ($)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000000,
      "step": "1"
    },
    {
      "key": "ownership",
      "label": "Ownership",
      "type": "select",
      "required": true,
      "options": [
        "Owned outright",
        "Financed",
        "Leased",
        "Shopping / not purchased"
      ]
    },
    {
      "key": "lender",
      "label": "Lender / leasing company",
      "type": "text",
      "required": true,
      "maxLength": 180,
      "when": [
        "ownership",
        [
          "Financed",
          "Leased"
        ]
      ]
    },
    {
      "key": "storage_same",
      "label": "Kept at your home address?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "storage_address",
      "label": "Storage / garaging address, city, state and ZIP",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "storage_same",
        "No"
      ]
    },
    {
      "key": "registered_owner",
      "label": "Registered owner, if different from applicant",
      "type": "text",
      "required": false,
      "maxLength": 100
    },
    {
      "key": "title_status",
      "label": "Title condition",
      "type": "select",
      "required": true,
      "options": [
        "Clean",
        "Salvage / rebuilt",
        "Other",
        "Not sure"
      ]
    },
    {
      "key": "use",
      "label": "Primary use",
      "type": "select",
      "required": true,
      "options": [
        "Pleasure / occasional rides",
        "Commuting under 10 miles",
        "Commuting 10 miles or more",
        "Off-road / farm",
        "Business / delivery",
        "Racing / track",
        "Other"
      ]
    },
    {
      "key": "annual_miles",
      "label": "Estimated annual miles",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 200000,
      "step": "1"
    },
    {
      "key": "storage_type",
      "label": "How is it stored?",
      "type": "select",
      "required": true,
      "options": [
        "Locked garage",
        "Carport",
        "Driveway / outside",
        "Storage facility",
        "Other"
      ]
    },
    {
      "key": "abs",
      "label": "Anti-lock brakes (ABS)?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "anti_theft",
      "label": "Anti-theft device?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "modified",
      "label": "Custom parts, modified frame, turbo, nitrous, snorkel or lift kit?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "modifications",
      "label": "Describe modifications / accessories",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "modified",
        "Yes"
      ]
    },
    {
      "key": "accessory_value",
      "label": "Value of custom parts / accessories ($)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000000,
      "step": "1",
      "when": [
        "modified",
        "Yes"
      ]
    },
    {
      "key": "primary_operator",
      "label": "Main rider for this vehicle",
      "type": "text",
      "required": false,
      "maxLength": 100,
      "hint": "Use the name of a rider listed in the next step."
    },
    {
      "key": "purchase_year",
      "label": "Year purchased",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 2100,
      "step": "1"
    },
    {
      "key": "garaging_zip",
      "label": "Garaging ZIP code (if different)",
      "type": "text",
      "required": false,
      "pattern": "[0-9]{5}",
      "maxLength": 5,
      "inputmode": "numeric"
    },
    {
      "key": "offroad_activity",
      "label": "Main off-road activity",
      "type": "select",
      "required": false,
      "options": [
        "Trail riding",
        "Hunting",
        "Camping / fishing",
        "Recreation",
        "Household / hobby farm",
        "Business use",
        "Other"
      ],
      "when": [
        "type",
        [
          "ATV",
          "Side-by-side / UTV",
          "Dirt bike"
        ]
      ]
    },
    {
      "key": "outside_ownership",
      "label": "Business ownership or owners outside your household?",
      "type": "select",
      "required": false,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    }
  ],
  "operators": [
    {
      "key": "same_as_applicant",
      "label": "Is this operator the applicant?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "key": "firstname",
      "label": "Operator legal first name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "when": [
        "same_as_applicant",
        "No"
      ]
    },
    {
      "key": "lastname",
      "label": "Operator legal last name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "when": [
        "same_as_applicant",
        "No"
      ]
    },
    {
      "key": "date_of_birth",
      "label": "Operator date of birth",
      "type": "date",
      "required": true,
      "when": [
        "same_as_applicant",
        "No"
      ],
      "dateRule": "birth"
    },
    {
      "key": "relationship",
      "label": "Relationship to applicant",
      "type": "select",
      "required": true,
      "options": [
        "Self",
        "Spouse / partner",
        "Child",
        "Other household member",
        "Other"
      ]
    },
    {
      "key": "gender",
      "label": "Gender on driver license / identification",
      "type": "select",
      "required": false,
      "options": [
        "Male",
        "Female",
        "X / another designation",
        "Prefer to discuss"
      ]
    },
    {
      "key": "marital_status",
      "label": "Operator marital status",
      "type": "select",
      "required": false,
      "options": [
        "Single",
        "Married",
        "Domestic partner",
        "Divorced",
        "Widowed",
        "Prefer to discuss"
      ]
    },
    {
      "key": "license_status",
      "label": "Driver license status",
      "type": "select",
      "required": true,
      "options": [
        "Valid",
        "Permit",
        "Suspended / revoked",
        "No license",
        "Other / discuss"
      ]
    },
    {
      "key": "license_state",
      "label": "Driver license state",
      "type": "select",
      "required": false,
      "options": [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC",
        "Other / international"
      ]
    },
    {
      "key": "license_number",
      "label": "Driver license number",
      "type": "text",
      "required": false,
      "maxLength": 30,
      "hint": "Optional now. You may provide this directly to the agency later."
    },
    {
      "key": "endorsement",
      "label": "Motorcycle license / endorsement",
      "type": "select",
      "required": true,
      "options": [
        "Full motorcycle license / endorsement",
        "Motorcycle permit",
        "Not yet",
        "Not sure",
        "Not applicable — off-road vehicle only"
      ]
    },
    {
      "key": "experience_years",
      "label": "Actual years riding this vehicle type",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 100,
      "step": "1",
      "hint": "Enter 0 if you are a new rider."
    },
    {
      "key": "training",
      "label": "Completed an approved rider safety course?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "training_details",
      "label": "Course name and completion year",
      "type": "text",
      "required": false,
      "maxLength": 100,
      "when": [
        "training",
        "Yes"
      ]
    },
    {
      "key": "violations",
      "label": "Moving violations in the past 3 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "violation_details",
      "label": "Violation details and approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "violations",
        "Yes"
      ]
    },
    {
      "key": "accidents",
      "label": "Accidents or insurance claims in the past 5 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "accident_details",
      "label": "Accident / claim details, dates and amounts if known",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "accidents",
        "Yes"
      ]
    },
    {
      "key": "suspensions",
      "label": "License suspension or revocation in the past 5 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "suspension_details",
      "label": "Suspension details and approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "suspensions",
        "Yes"
      ]
    },
    {
      "key": "years_licensed",
      "label": "Years licensed to drive",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 2100,
      "step": "1"
    },
    {
      "key": "education",
      "label": "Highest education level",
      "type": "select",
      "required": false,
      "options": [
        "No high school diploma / GED",
        "High school diploma / GED",
        "Trade school / military training",
        "Some college / currently in college",
        "College degree",
        "Graduate degree",
        "Prefer to discuss"
      ]
    }
  ],
  "coverage": [
    {
      "key": "currently_insured",
      "label": "Currently insured for this type of coverage?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "carrier",
      "label": "Current insurance company",
      "type": "text",
      "required": true,
      "maxLength": 100,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "expiration",
      "label": "Current policy expiration date",
      "type": "date",
      "required": false,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "current_limits",
      "label": "Current liability limits / deductibles",
      "type": "text",
      "required": false,
      "maxLength": 180,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "continuous",
      "label": "Continuous coverage for the past 12 months?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "lapse_details",
      "label": "Coverage gaps and approximate dates",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "when": [
        "continuous",
        "No"
      ]
    },
    {
      "key": "cancelled",
      "label": "Insurance declined, cancelled or nonrenewed in the past 3 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "cancellation_details",
      "label": "Please explain and give approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "cancelled",
        "Yes"
      ]
    },
    {
      "key": "coverage",
      "label": "Coverage preference",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Liability only",
        "Liability plus comprehensive and collision",
        "Match my current policy"
      ]
    },
    {
      "key": "liability_limits",
      "label": "Preferred liability limits or lender requirements",
      "type": "text",
      "required": false,
      "maxLength": 180,
      "hint": "Leave blank for personal guidance."
    },
    {
      "key": "deductible",
      "label": "Physical damage deductible preference",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "$250",
        "$500",
        "$1,000",
        "$2,500",
        "Not requested",
        "$100"
      ]
    },
    {
      "key": "medical",
      "label": "Discuss medical payments coverage?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "uninsured",
      "label": "Discuss uninsured / underinsured coverage?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "towing",
      "label": "Discuss roadside / towing assistance?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "bundle",
      "label": "Also compare another policy?",
      "type": "select",
      "required": true,
      "options": [
        "No thanks",
        "Auto",
        "Home",
        "Renters",
        "Several policies"
      ]
    },
    {
      "key": "notes",
      "label": "Additional details or questions",
      "type": "textarea",
      "required": false,
      "maxLength": 1200
    },
    {
      "key": "insured_last_12_months",
      "label": "Liability insurance for this vehicle type within the last 12 months?",
      "type": "select",
      "required": false,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "settlement",
      "label": "Interested in total loss / replacement options?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "riding_gear",
      "label": "Discuss riding apparel and carried belongings?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "transport_trailer",
      "label": "Discuss transport trailer coverage?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "disappearing_deductible",
      "label": "Discuss disappearing deductibles?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "payment_preference",
      "label": "Payment preference",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Pay in full",
        "Monthly payments"
      ]
    },
    {
      "key": "association",
      "label": "Association membership",
      "type": "select",
      "required": false,
      "options": [
        "None",
        "Harley Owners Group",
        "USAA",
        "Other",
        "Not sure"
      ]
    }
  ]
},
  boat: {
  "title": "Boat / PWC",
  "receipt": "BOAT",
  "assetTitle": "Watercraft",
  "operatorTitle": "Operator",
  "applicant": [
    {
      "key": "firstname",
      "label": "Legal first name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "autocomplete": "given-name"
    },
    {
      "key": "middlename",
      "label": "Middle name",
      "type": "text",
      "required": false,
      "maxLength": 60
    },
    {
      "key": "lastname",
      "label": "Legal last name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "autocomplete": "family-name"
    },
    {
      "key": "date_of_birth",
      "label": "Date of birth",
      "type": "date",
      "required": true,
      "dateRule": "birth",
      "autocomplete": "bday"
    },
    {
      "key": "phone",
      "label": "Phone number",
      "type": "tel",
      "required": true,
      "maxLength": 25,
      "autocomplete": "tel"
    },
    {
      "key": "email",
      "label": "Email address",
      "type": "email",
      "required": true,
      "maxLength": 180,
      "autocomplete": "email"
    },
    {
      "key": "address",
      "label": "Home street address",
      "type": "text",
      "required": true,
      "maxLength": 180,
      "autocomplete": "address-line1"
    },
    {
      "key": "unit",
      "label": "Apartment / unit",
      "type": "text",
      "required": false,
      "maxLength": 40,
      "autocomplete": "address-line2"
    },
    {
      "key": "city",
      "label": "City",
      "type": "text",
      "required": true,
      "maxLength": 80,
      "autocomplete": "address-level2"
    },
    {
      "key": "state",
      "label": "State",
      "type": "select",
      "required": true,
      "options": [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC"
      ],
      "default": "NC",
      "autocomplete": "address-level1"
    },
    {
      "key": "zip_code",
      "label": "ZIP code",
      "type": "text",
      "required": true,
      "pattern": "[0-9]{5}",
      "maxLength": 5,
      "inputmode": "numeric",
      "autocomplete": "postal-code"
    },
    {
      "key": "county",
      "label": "County",
      "type": "text",
      "required": false,
      "maxLength": 100
    },
    {
      "key": "marital_status",
      "label": "Marital status",
      "type": "select",
      "required": false,
      "options": [
        "Single",
        "Married",
        "Domestic partner",
        "Divorced",
        "Widowed",
        "Prefer to discuss"
      ]
    },
    {
      "key": "homeownership",
      "label": "Do you own or rent your home?",
      "type": "select",
      "required": false,
      "options": [
        "Own",
        "Rent",
        "Live with family / other"
      ]
    },
    {
      "key": "contact_preference",
      "label": "Preferred way to reach you",
      "type": "select",
      "required": false,
      "options": [
        "Phone call",
        "Email"
      ]
    },
    {
      "key": "effective_date",
      "label": "Requested coverage start date",
      "type": "date",
      "required": true,
      "dateRule": "future"
    }
  ],
  "assets": [
    {
      "key": "year",
      "label": "Model year",
      "type": "number",
      "required": true,
      "min": 1900,
      "max": 2100,
      "step": "1"
    },
    {
      "key": "make",
      "label": "Make / manufacturer",
      "type": "text",
      "required": true,
      "maxLength": 100
    },
    {
      "key": "model",
      "label": "Model",
      "type": "text",
      "required": true,
      "maxLength": 100
    },
    {
      "key": "type",
      "label": "Watercraft type",
      "type": "select",
      "required": true,
      "options": [
        "Pontoon / deck boat",
        "Fishing / bass boat",
        "Runabout / bowrider",
        "Cruiser / cabin boat",
        "Sailboat",
        "Personal watercraft / Jet Ski",
        "Other"
      ]
    },
    {
      "key": "hin",
      "label": "Hull identification number (HIN)",
      "type": "text",
      "required": false,
      "maxLength": 20,
      "pattern": "[A-Za-z0-9-]{5,20}",
      "hint": "Optional now. Usually 12 characters, on the hull or registration. Older/imported boats may differ."
    },
    {
      "key": "registration",
      "label": "Registration number / state",
      "type": "text",
      "required": false,
      "maxLength": 40
    },
    {
      "key": "length_feet",
      "label": "Length (feet)",
      "type": "number",
      "required": false,
      "min": 1,
      "max": 300,
      "step": "0.1",
      "hint": "If known. We can confirm specifications from the model."
    },
    {
      "key": "hull_material",
      "label": "Hull material",
      "type": "select",
      "required": false,
      "options": [
        "Fiberglass",
        "Aluminum",
        "Wood",
        "Steel",
        "Inflatable / composite",
        "Other",
        "Not sure"
      ]
    },
    {
      "key": "value",
      "label": "Estimated value of boat and motors ($)",
      "type": "number",
      "required": true,
      "min": 1,
      "max": 10000000,
      "step": "1"
    },
    {
      "key": "purchase_date",
      "label": "Purchase date (if known)",
      "type": "date",
      "required": false
    },
    {
      "key": "purchase_price",
      "label": "Purchase price ($)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000000,
      "step": "1"
    },
    {
      "key": "ownership",
      "label": "Ownership",
      "type": "select",
      "required": true,
      "options": [
        "Owned outright",
        "Financed",
        "Leased",
        "Shopping / not purchased"
      ]
    },
    {
      "key": "lender",
      "label": "Lender / leasing company",
      "type": "text",
      "required": true,
      "maxLength": 180,
      "when": [
        "ownership",
        [
          "Financed",
          "Leased"
        ]
      ]
    },
    {
      "key": "storage_same",
      "label": "Kept at your home address?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "storage_address",
      "label": "Storage / garaging address, city, state and ZIP",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "storage_same",
        "No"
      ]
    },
    {
      "key": "registered_owner",
      "label": "Registered owner, if different from applicant",
      "type": "text",
      "required": false,
      "maxLength": 100
    },
    {
      "key": "title_status",
      "label": "Title condition",
      "type": "select",
      "required": false,
      "options": [
        "Clean",
        "Salvage / rebuilt",
        "Other",
        "Not sure"
      ]
    },
    {
      "key": "engine_type",
      "label": "Engine / propulsion type",
      "type": "select",
      "required": true,
      "options": [
        "Outboard",
        "Inboard",
        "Stern drive / I-O",
        "Jet drive",
        "Sail with auxiliary motor",
        "Sail only / no motor",
        "Other"
      ]
    },
    {
      "key": "engine_count",
      "label": "Number of main engines",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 8,
      "step": "1",
      "hint": "Do not count a trolling motor. Enter 0 for no motor."
    },
    {
      "key": "horsepower",
      "label": "Total horsepower (all main engines)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000,
      "step": "1",
      "hint": "Total of all main engines. Leave blank if unsure; enter 0 for no motor."
    },
    {
      "key": "engine_details",
      "label": "Motor make / model and other details (if known)",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "hint": "For example: Yamaha 300 hp. Serial number is optional at this stage."
    },
    {
      "key": "fuel",
      "label": "Fuel type",
      "type": "select",
      "required": false,
      "options": [
        "Gasoline",
        "Diesel",
        "Electric",
        "No motor",
        "Other / not sure"
      ]
    },
    {
      "key": "max_speed",
      "label": "Maximum speed (mph)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 250,
      "step": "1"
    },
    {
      "key": "use",
      "label": "Watercraft use",
      "type": "select",
      "required": true,
      "options": [
        "Personal recreation",
        "Fishing for pleasure",
        "Charter / guide / business",
        "Rental to others",
        "Racing",
        "Live aboard",
        "Other"
      ]
    },
    {
      "key": "waters",
      "label": "Where will you operate?",
      "type": "select",
      "required": true,
      "options": [
        "Inland lakes / rivers",
        "Coastal / intracoastal",
        "Offshore / ocean",
        "Great Lakes",
        "Other / not sure"
      ]
    },
    {
      "key": "navigation",
      "label": "Lakes / waterways, states and farthest distance offshore",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "hint": "Example: Lake Norman, NC; inland only. Include trips outside the U.S., if any."
    },
    {
      "key": "storage_type",
      "label": "Storage / mooring type",
      "type": "select",
      "required": false,
      "options": [
        "Home on trailer",
        "Marina slip",
        "Dry stack",
        "Storage yard",
        "Mooring buoy",
        "Other"
      ]
    },
    {
      "key": "marina",
      "label": "Marina / storage facility name",
      "type": "text",
      "required": false,
      "maxLength": 180
    },
    {
      "key": "winter_storage",
      "label": "Winter storage location and months out of water",
      "type": "textarea",
      "required": false,
      "maxLength": 600
    },
    {
      "key": "trailer",
      "label": "Include a trailer?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "trailer_details",
      "label": "Trailer year, make, VIN and value ($)",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "when": [
        "trailer",
        "Yes"
      ],
      "hint": "Provide what you know; we can follow up for missing details."
    },
    {
      "key": "equipment_value",
      "label": "Fishing gear / portable equipment value ($)",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 10000000,
      "step": "1"
    },
    {
      "key": "modified",
      "label": "Performance modifications or prior damage?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "modifications",
      "label": "Modification / damage details and repairs",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "modified",
        "Yes"
      ]
    },
    {
      "key": "primary_operator",
      "label": "Main operator for this watercraft",
      "type": "text",
      "required": false,
      "maxLength": 100,
      "hint": "Use the name of an operator listed in the next step."
    },
    {
      "key": "safety_equipment",
      "label": "Safety / anti-theft equipment",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "hint": "For example: fire suppression, GPS tracking, alarms or navigation equipment."
    },
    {
      "key": "purchase_year",
      "label": "Year purchased",
      "type": "number",
      "required": false,
      "min": 1900,
      "max": 2100,
      "step": "1"
    },
    {
      "key": "original_owner",
      "label": "Are you the original owner?",
      "type": "select",
      "required": false,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "outside_owners",
      "label": "Any owners outside your household?",
      "type": "select",
      "required": false,
      "options": [
        "No",
        "One other owner",
        "Two or more other owners",
        "Not sure"
      ]
    },
    {
      "key": "storage_zip",
      "label": "Storage / mooring ZIP code",
      "type": "text",
      "required": false,
      "pattern": "[0-9]{5}",
      "maxLength": 5,
      "inputmode": "numeric"
    },
    {
      "key": "electric_motor",
      "label": "Is the primary motor electric?",
      "type": "select",
      "required": false,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    }
  ],
  "operators": [
    {
      "key": "same_as_applicant",
      "label": "Is this operator the applicant?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No"
      ]
    },
    {
      "key": "firstname",
      "label": "Operator legal first name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "when": [
        "same_as_applicant",
        "No"
      ]
    },
    {
      "key": "lastname",
      "label": "Operator legal last name",
      "type": "text",
      "required": true,
      "maxLength": 60,
      "when": [
        "same_as_applicant",
        "No"
      ]
    },
    {
      "key": "date_of_birth",
      "label": "Operator date of birth",
      "type": "date",
      "required": true,
      "when": [
        "same_as_applicant",
        "No"
      ],
      "dateRule": "birth"
    },
    {
      "key": "relationship",
      "label": "Relationship to applicant",
      "type": "select",
      "required": true,
      "options": [
        "Self",
        "Spouse / partner",
        "Child",
        "Other household member",
        "Other"
      ]
    },
    {
      "key": "gender",
      "label": "Gender on driver license / identification",
      "type": "select",
      "required": false,
      "options": [
        "Male",
        "Female",
        "X / another designation",
        "Prefer to discuss"
      ]
    },
    {
      "key": "marital_status",
      "label": "Operator marital status",
      "type": "select",
      "required": false,
      "options": [
        "Single",
        "Married",
        "Domestic partner",
        "Divorced",
        "Widowed",
        "Prefer to discuss"
      ]
    },
    {
      "key": "license_status",
      "label": "Driver license status",
      "type": "select",
      "required": true,
      "options": [
        "Valid",
        "Permit",
        "Suspended / revoked",
        "No license",
        "Other / discuss"
      ]
    },
    {
      "key": "license_state",
      "label": "Driver license state",
      "type": "select",
      "required": false,
      "options": [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC",
        "Other / international"
      ]
    },
    {
      "key": "license_number",
      "label": "Driver license number",
      "type": "text",
      "required": false,
      "maxLength": 30,
      "hint": "Optional now. You may provide this directly to the agency later."
    },
    {
      "key": "experience_years",
      "label": "Years of boating experience",
      "type": "number",
      "required": false,
      "min": 0,
      "max": 100,
      "step": "1",
      "hint": "Actual boating experience, if known. Leave blank if unsure; our team will confirm."
    },
    {
      "key": "ownership_years",
      "label": "Years of boat ownership",
      "type": "number",
      "required": true,
      "min": 0,
      "max": 100,
      "step": "1"
    },
    {
      "key": "training",
      "label": "Completed a boating safety course?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "training_details",
      "label": "Course name and completion year",
      "type": "text",
      "required": false,
      "maxLength": 100,
      "when": [
        "training",
        "Yes"
      ]
    },
    {
      "key": "similar_boats",
      "label": "Experience with similar boats (type, length and years)",
      "type": "textarea",
      "required": false,
      "maxLength": 600
    },
    {
      "key": "violations",
      "label": "Moving violations in the past 3 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "violation_details",
      "label": "Violation details and approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "violations",
        "Yes"
      ]
    },
    {
      "key": "accidents",
      "label": "Accidents or insurance claims in the past 5 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "accident_details",
      "label": "Accident / claim details, dates and amounts if known",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "accidents",
        "Yes"
      ]
    },
    {
      "key": "suspensions",
      "label": "License suspension or revocation in the past 5 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "suspension_details",
      "label": "Suspension details and approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "suspensions",
        "Yes"
      ]
    },
    {
      "key": "age_first_licensed",
      "label": "Age first licensed to drive (if known)",
      "type": "number",
      "required": false,
      "min": 14,
      "max": 100,
      "step": "1"
    }
  ],
  "coverage": [
    {
      "key": "currently_insured",
      "label": "Do you currently have boat / PWC liability insurance?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "carrier",
      "label": "Current insurance company",
      "type": "text",
      "required": true,
      "maxLength": 100,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "expiration",
      "label": "Current policy expiration date",
      "type": "date",
      "required": false,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "current_limits",
      "label": "Current liability limits / deductibles",
      "type": "text",
      "required": false,
      "maxLength": 180,
      "when": [
        "currently_insured",
        "Yes"
      ]
    },
    {
      "key": "continuous",
      "label": "Continuous coverage for the past 12 months?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "lapse_details",
      "label": "Coverage gaps and approximate dates",
      "type": "textarea",
      "required": false,
      "maxLength": 600,
      "when": [
        "continuous",
        "No"
      ]
    },
    {
      "key": "cancelled",
      "label": "Insurance declined, cancelled or nonrenewed in the past 3 years?",
      "type": "select",
      "required": true,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "cancellation_details",
      "label": "Please explain and give approximate dates",
      "type": "textarea",
      "required": true,
      "maxLength": 600,
      "when": [
        "cancelled",
        "Yes"
      ]
    },
    {
      "key": "coverage",
      "label": "Coverage preference",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Liability only",
        "Liability plus comprehensive and collision",
        "Match my current policy"
      ]
    },
    {
      "key": "liability_limits",
      "label": "Liability limits or lender / marina requirements",
      "type": "text",
      "required": false,
      "maxLength": 180,
      "hint": "For example 100/300/100 or $300,000 combined single limit. Leave blank for guidance."
    },
    {
      "key": "deductible",
      "label": "Physical damage deductible preference",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "$250",
        "$500",
        "$1,000",
        "$2,500",
        "Not requested",
        "$5,000",
        "$10,000"
      ],
      "hint": "A carrier may apply a separate named-storm deductible. Your agent will explain before you choose."
    },
    {
      "key": "medical",
      "label": "Discuss medical payments coverage?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "uninsured",
      "label": "Discuss uninsured boater coverage?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "towing",
      "label": "Discuss on-water towing / roadside assistance?",
      "type": "select",
      "required": true,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "bundle",
      "label": "Also compare another policy?",
      "type": "select",
      "required": true,
      "options": [
        "No thanks",
        "Auto",
        "Home",
        "Renters",
        "Several policies"
      ]
    },
    {
      "key": "notes",
      "label": "Additional details or questions",
      "type": "textarea",
      "required": false,
      "maxLength": 1200
    },
    {
      "key": "insured_last_12_months",
      "label": "Boat liability insurance within the last 12 months?",
      "type": "select",
      "required": false,
      "options": [
        "Yes",
        "No",
        "Not sure"
      ]
    },
    {
      "key": "settlement",
      "label": "Boat damage settlement preference",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Agreed value",
        "Actual cash value",
        "Liability only"
      ]
    },
    {
      "key": "propulsion_protection",
      "label": "Interested in optional mechanical / propulsion protection?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "hurricane_haulout",
      "label": "Interested in hurricane haul-out protection?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "personal_effects",
      "label": "Interested in personal belongings coverage?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "fishing_equipment",
      "label": "Interested in fishing equipment coverage?",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Yes",
        "No"
      ]
    },
    {
      "key": "payment_preference",
      "label": "Payment preference",
      "type": "select",
      "required": false,
      "options": [
        "Help me decide",
        "Pay in full",
        "Monthly payments"
      ]
    },
    {
      "key": "association",
      "label": "Boating association membership",
      "type": "select",
      "required": false,
      "options": [
        "None",
        "US Power Squadron",
        "USAA",
        "USCG Auxiliary",
        "Other",
        "Not sure"
      ]
    }
  ]
}
};
