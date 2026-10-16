/* Shared browser/Apps Script intake rules. This file contains no customer data. */
var MobileHomeQuote = (function () {
  'use strict';
  var sizes = {firstname:60,lastname:60,date_of_birth:10,phone:25,email:120,is_owner:20,property_address:160,city:80,zip_code:5,home_style:30,year_built:4,occupancy:20,land_ownership:20,square_footage:5,roof_year:4,current_insurance:20,current_carrier:100,coverage_expiration:10,previous_claims:20,claims_details:800,effective_date:10,desired_dwelling_amount:8,deductible:20,additional_notes:1500,cta_source:80};
  var required = ['firstname','lastname','date_of_birth','phone','email','is_owner','property_address','city','zip_code','home_style','occupancy'];
  var choices = {is_owner:['yes','buying'],home_style:['single_wide','double_wide','multi_section','not_sure'],occupancy:['primary','seasonal','rental','not_sure'],land_ownership:['','owned','rented_lot','other'],current_insurance:['not_sure','yes','no'],previous_claims:['not_sure','yes','no'],deductible:['not_sure','500','1000','2500']};
  var labels = {firstname:'First name',lastname:'Last name',date_of_birth:'Date of birth',phone:'Phone',email:'Email',is_owner:'Ownership',property_address:'Street address',city:'City',zip_code:'NC ZIP code',home_style:'Mobile home type',year_built:'Year built',occupancy:'Home use',land_ownership:'Land / lot',square_footage:'Square feet',roof_year:'Roof year',current_insurance:'Insured now',current_carrier:'Current company',coverage_expiration:'Policy ends',previous_claims:'Claims in past 5 years',claims_details:'Claim details',effective_date:'Requested start date',desired_dwelling_amount:'Home coverage preference',deductible:'Deductible preference',bundle_auto:'Also compare auto',additional_notes:'Additional notes',cta_source:'Website source',confirm_accuracy:'Review confirmed'};
  var names = {yes:'Yes',no:'No',buying:'Buying soon',single_wide:'Single-wide',double_wide:'Double-wide',multi_section:'Multi-section / triple-wide',not_sure:'Not sure',primary:'Primary home',seasonal:'Seasonal / second home',rental:'Rented to someone else',owned:'Own / buying the land',rented_lot:'Renting the lot',other:'Other arrangement'};
  var sections = [
    ['About you',['firstname','lastname','date_of_birth','phone','email','is_owner']],
    ['Your mobile home',['property_address','city','zip_code','home_style','year_built','occupancy','land_ownership','square_footage','roof_year']],
    ['Current insurance',['current_insurance','current_carrier','coverage_expiration','previous_claims','claims_details']],
    ['Coverage preferences',['effective_date','desired_dwelling_amount','deductible','bundle_auto','additional_notes']]
  ];
  function dateValid(value) { var d = new Date(value+'T12:00:00Z'); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(d.getTime()) && d.toISOString().slice(0,10) === value; }
  function validate(input, today, reviewRequired) {
    var data = {form_type:'mobile_home_insurance',state:'NC',property_type:'mobile_home'}, errors = {};
    if (!input || typeof input !== 'object' || input.form_type !== data.form_type) return {data:data,errors:{form_type:'Invalid quote request.'}};
    Object.keys(sizes).forEach(function(key) {
      var value = input[key] === undefined || input[key] === null ? '' : input[key];
      if (typeof value !== 'string' || value.length > sizes[key] || /[\x00]/.test(value)) { errors[key] = 'Please check this answer.'; data[key]=''; }
      else data[key] = value.trim();
    });
    required.forEach(function(key) { if (!data[key]) errors[key]='Please complete this answer.'; });
    Object.keys(choices).forEach(function(key) { if (choices[key].indexOf(data[key]) < 0) errors[key]='Please choose an available option.'; });
    ['firstname','lastname','email','phone','property_address','city','zip_code','cta_source'].forEach(function(key) { if (/[\r\n]/.test(data[key])) errors[key]='Please use one line for this answer.'; });
    if (data.phone && !/^(1)?\d{10}$/.test(data.phone.replace(/\D/g,''))) errors.phone='Enter a 10-digit phone number, with area code.';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email='Enter a complete email address, like you@example.com.';
    if (data.zip_code && !/^(27|28)\d{3}$/.test(data.zip_code)) errors.zip_code='Enter a 5-digit North Carolina ZIP code.';
    if (data.date_of_birth && (!dateValid(data.date_of_birth) || data.date_of_birth >= today || data.date_of_birth < '1900-01-01')) errors.date_of_birth='Enter a valid date of birth before today.';
    ['effective_date','coverage_expiration'].forEach(function(key) { if (data[key] && !dateValid(data[key])) errors[key]='Enter a valid calendar date.'; });
    if (data.effective_date && data.effective_date < today) errors.effective_date='Choose today or a future date, or leave blank for help.';
    var maxYear = Number(today.slice(0,4))+1;
    [['year_built',1900,maxYear],['roof_year',1900,maxYear],['square_footage',100,10000],['desired_dwelling_amount',1,5000000]].forEach(function(rule) {
      var v=data[rule[0]]; if (v && (!/^\d+$/.test(v) || Number(v)<rule[1] || Number(v)>rule[2])) errors[rule[0]]='Enter a reasonable whole number, or leave blank if unsure.';
    });
    if (data.cta_source && !/^[a-z0-9_-]{1,80}$/i.test(data.cta_source)) errors.cta_source='Invalid source label.';
    if (input.bundle_auto !== true && input.bundle_auto !== false) errors.bundle_auto='Please check the auto preference.';
    data.bundle_auto = input.bundle_auto === true;
    data.confirm_accuracy = input.confirm_accuracy === true;
    if (reviewRequired && !data.confirm_accuracy) errors.confirm_accuracy='Please confirm that you have reviewed your answers.';
    if (data.current_insurance !== 'yes') { data.current_carrier=''; data.coverage_expiration=''; delete errors.current_carrier; delete errors.coverage_expiration; }
    if (data.previous_claims !== 'yes') { data.claims_details=''; delete errors.claims_details; }
    return {data:data,errors:errors};
  }
  function display(key, value) {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (!value) return key==='desired_dwelling_amount' ? 'Help me decide' : key==='effective_date' ? 'Discuss with the team' : 'Not provided';
    if (key==='deductible') return value==='not_sure' ? 'Help me decide' : '$'+Number(value).toLocaleString('en-US');
    if (key==='desired_dwelling_amount') return '$'+Number(value).toLocaleString('en-US');
    return names[value] || value;
  }
  return {sizes:sizes,labels:labels,sections:sections,validate:validate,display:display};
})();
