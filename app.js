
let serviceBalance=42.80;
let selectedTopup=25;

function toast(message){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t);}
  t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3500);
}
function toggleSidebar(){document.getElementById("sidebar")?.classList.toggle("open");}
function setCookieChoice(choice){
  localStorage.setItem("lf_cookie_choice",choice);
  document.getElementById("cookieBanner")?.classList.remove("show");
  toast(choice==="essential"?"Only essential cookies selected.":"Cookie preferences saved.");
}
document.addEventListener("DOMContentLoaded",()=>{
  const banner=document.getElementById("cookieBanner");
  if(banner && !localStorage.getItem("lf_cookie_choice")) banner.classList.add("show");
  document.querySelectorAll(".chip").forEach(x=>x.addEventListener("click",()=>x.classList.toggle("selected")));
  document.querySelectorAll(".amount").forEach(x=>x.addEventListener("click",()=>{
    document.querySelectorAll(".amount").forEach(y=>y.classList.remove("selected"));
    x.classList.add("selected");selectedTopup=Number(x.dataset.amount||25);
    const custom=document.getElementById("customAmount");if(custom)custom.value="";
  }));
  updateLogoPreview();estimateLogoCost();refreshBalance();
});

function updateLogoPreview(){
  const company=document.getElementById("companyName");if(!company)return;
  const name=company.value||"Your Brand",tag=document.getElementById("tagline")?.value||"Your tagline";
  document.getElementById("previewName").textContent=name;
  document.getElementById("previewTag").textContent=tag;
  document.getElementById("previewMark").textContent=(name.trim()[0]||"L").toUpperCase();
  const desc=document.getElementById("description")?.value||"";
  const symbol=document.getElementById("symbol")?.value||"a distinctive abstract symbol";
  const avoid=document.getElementById("avoid")?.value||"generic stock imagery";
  document.getElementById("promptPreview").textContent=`Create a professional, original logo concept for ${name}. Business context: ${desc}. Use ${symbol}, clean geometry and presentation on a plain transparent or white background. Avoid ${avoid}. Do not imitate an existing brand or protected character.`;
}
function estimateLogoCost(){
  const n=Number(document.getElementById("variations")?.value||4);
  const q=document.getElementById("quality")?.value||"standard";
  const provider={draft:.012,standard:.021,premium:.045}[q]*n;
  document.getElementById("providerCost")&&(document.getElementById("providerCost").textContent="$"+provider.toFixed(3));
  document.getElementById("platformCharge")&&(document.getElementById("platformCharge").textContent="$"+(provider*5).toFixed(2));
}
function refreshBalance(){
  document.querySelectorAll("[data-balance]").forEach(x=>x.textContent="$"+serviceBalance.toFixed(2));
}
function generateLogo(){
  const accepted=document.getElementById("generationConsent");
  if(accepted && !accepted.checked){toast("Accept the generation price and AI output notice first.");return;}
  const btn=document.getElementById("generateBtn"),wrap=document.getElementById("generationProgress"),bar=document.getElementById("generationBar"),text=document.getElementById("generationText");
  if(!btn)return;btn.disabled=true;wrap.style.display="block";bar.style.width="18%";text.textContent="Validating content and reserving the maximum estimated charge…";
  setTimeout(()=>{bar.style.width="46%";text.textContent="Generating concepts through the image API…";},500);
  setTimeout(()=>{bar.style.width="76%";text.textContent="Measuring provider usage and applying the 5× pricing rule…";},1150);
  setTimeout(()=>{
    const charge=parseFloat((document.getElementById("platformCharge")?.textContent||"$0.42").replace("$",""));
    serviceBalance=Math.max(0,serviceBalance-charge);refreshBalance();
    bar.style.width="100%";text.textContent="Concepts delivered. Receipt and usage record created.";btn.disabled=false;
    toast(`Generation complete. $${charge.toFixed(2)} deducted from service credits.`);
  },1900);
}
function openTopup(){
  const custom=Number(document.getElementById("customAmount")?.value||0);
  const amount=custom>=5?custom:selectedTopup;
  const q=new URLSearchParams({
    type:"service_credits",amount:String(amount),currency:"USD",
    product:"LogoForge prepaid service credits",merchant:"LogoForge AI",
    origin:location.origin,customer_id:"user_10018"
  });
  const popup=window.open("checkout.html?"+q.toString(),"LogoForgeCheckout","width=560,height=820,resizable=yes,scrollbars=yes");
  if(!popup)toast("Popup blocked. Allow popups for this prototype.");
}
window.addEventListener("message",event=>{
  const d=event.data||{};
  if(d.type!=="LOGOFORGE_PAYMENT_RESULT")return;
  if(d.purchase_type==="service_credits"&&d.status==="paid"){
    serviceBalance+=Number(d.amount||0)/100;refreshBalance();toast("Payment verified. Service credits added.");
  }else if(d.status!=="paid")toast("Payment was not completed. No credits or order status changed.");
});

function saveLegalConfig(){
  const keys=Object.keys(DEFAULT_LEGAL_CONFIG),out={};
  keys.forEach(k=>{const el=document.getElementById("cfg_"+k);if(el)out[k]=el.value.trim();});
  localStorage.setItem("lf_legal_config",JSON.stringify(out));
  populateLegal();toast("Business and legal configuration saved in this browser.");
  renderCompliance();
}
function loadLegalForm(){
  const c=getLegalConfig();Object.keys(c).forEach(k=>{const el=document.getElementById("cfg_"+k);if(el)el.value=c[k];});renderCompliance();
}
function renderCompliance(){
  const c=getLegalConfig();
  const missing=v=>!v||v.includes("REPLACE")||v.includes("example.com")||v.includes("+00");
  const checks=[
    ["Legal entity name",!missing(c.legalName),"Required in public business details and Stripe profile."],
    ["Registered business address",!missing(c.registeredAddress),"Must identify the real merchant."],
    ["Company registration / tax ID",!missing(c.registrationNumber)&&!missing(c.taxId),"Use the identifiers applicable to the entity."],
    ["Support contacts",!missing(c.supportEmail)&&!missing(c.supportPhone),"Display reachable email and phone."],
    ["Statement descriptor",!!c.statementDescriptor&&c.statementDescriptor.length>=5,"Should be recognizable to cardholders."],
    ["Terms, privacy and refund pages",true,"Included in the prototype; legal review is still required."],
    ["Stripe webhook signature verification",false,"Must be implemented server-side before live payments."],
    ["Tax registrations confirmed",false,"Confirm with a qualified tax adviser and configure Stripe Tax if used."],
    ["Single merchant model enforced",true,"All registered websites use the same legal entity, Stripe account and merchant policies."]
  ];
  const box=document.getElementById("complianceList");if(!box)return;
  box.innerHTML=checks.map(([name,ok,desc])=>`<div class="compliance-item"><span class="check-dot ${ok?"ok":"bad"}">${ok?"✓":"!"}</span><div><b>${name}</b><p>${desc}</p></div></div>`).join("");
  const passed=checks.filter(x=>x[1]).length;
  document.getElementById("complianceScore").textContent=`${passed}/${checks.length}`;
}
