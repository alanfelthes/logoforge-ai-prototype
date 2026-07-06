
const DEFAULT_LEGAL_CONFIG = {
  brandName: "LogoForge AI",
  legalName: "REPLACE WITH LEGAL ENTITY NAME",
  registrationNumber: "REPLACE WITH COMPANY REGISTRATION NUMBER",
  taxId: "REPLACE WITH TAX / VAT ID",
  registeredAddress: "REPLACE WITH REGISTERED BUSINESS ADDRESS",
  country: "REPLACE WITH COUNTRY OF INCORPORATION",
  supportEmail: "support@example.com",
  supportPhone: "+00 000 000 000",
  website: "https://example.com",
  statementDescriptor: "LOGOFORGE",
  governingLaw: "REPLACE WITH GOVERNING LAW AND VENUE",
  privacyAuthority: "REPLACE WITH APPLICABLE DATA PROTECTION AUTHORITY",
  dataController: "REPLACE WITH DATA CONTROLLER LEGAL NAME",
  lastUpdated: "July 6, 2026"
};

function getLegalConfig(){
  try{return {...DEFAULT_LEGAL_CONFIG,...JSON.parse(localStorage.getItem("lf_legal_config")||"{}")};}
  catch(e){return DEFAULT_LEGAL_CONFIG;}
}
function populateLegal(){
  const c=getLegalConfig();
  document.querySelectorAll("[data-legal]").forEach(el=>{
    const key=el.dataset.legal;
    if(c[key]) el.textContent=c[key];
  });
  document.querySelectorAll("[data-legal-href]").forEach(el=>{
    const key=el.dataset.legalHref;
    if(key==="supportEmail") el.href="mailto:"+c.supportEmail;
    if(key==="supportPhone") el.href="tel:"+c.supportPhone.replace(/\s/g,"");
    if(key==="website") el.href=c.website;
  });
}
document.addEventListener("DOMContentLoaded",populateLegal);
