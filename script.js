const products = [
 {id:1,name:"Noir Signature Smartphone",category:"Electronics",price:485000,icon:"📱",badge:"BESTSELLER",desc:"A sleek everyday essential with premium performance."},
 {id:2,name:"Crimson Evening Dress",category:"Fashion",price:89500,icon:"👗",badge:"NEW",desc:"A statement silhouette made for unforgettable nights."},
 {id:3,name:"Golden Hour Fragrance",category:"Beauty",price:42000,icon:"🧴",badge:"POPULAR",desc:"Warm amber notes with a bold, lasting finish."},
 {id:4,name:"Luxe Living Lamp",category:"Home",price:67500,icon:"🪔",badge:"",desc:"A warm glow that transforms your favourite corner."},
 {id:5,name:"Performance Training Set",category:"Sports",price:56000,icon:"🏋️",badge:"",desc:"Comfortable essentials for your next personal best."},
 {id:6,name:"Little Star Companion",category:"Kids",price:18500,icon:"🧸",badge:"GIFT PICK",desc:"A soft, gift-ready friend for little dreamers."},
 {id:7,name:"The Art of Becoming",category:"Books",price:12500,icon:"📚",badge:"",desc:"A thoughtful read for curious minds and big plans."},
 {id:8,name:"Golden Gift Box",category:"Gifts",price:22000,icon:"🎁",badge:"",desc:"A beautiful little surprise for someone special."},
 {id:9,name:"Studio Wireless Headphones",category:"Electronics",price:76000,icon:"🎧",badge:"TRENDING",desc:"Immersive sound for focus, travel, and downtime."},
 {id:10,name:"Everyday Luxe Tote",category:"Fashion",price:38000,icon:"👜",badge:"",desc:"A polished carry-all that goes everywhere."},
 {id:11,name:"Radiance Skin Ritual",category:"Beauty",price:31500,icon:"✨",badge:"",desc:"A simple self-care set for your daily reset."},
 {id:12,name:"Velvet Cushion Pair",category:"Home",price:24500,icon:"🛋️",badge:"",desc:"A rich texture to soften your favourite space."}
];
const API_BASE = "/api";
let apiAvailable = false;
const STORAGE = {cart:"zyvora_cart_v1",wishlist:"zyvora_wishlist_v1",currency:"zyvora_currency_v1"};
let cart = safeParse(localStorage.getItem(STORAGE.cart), []);
let wishlist = new Set(safeParse(localStorage.getItem(STORAGE.wishlist), []));
let activeFilter = "All";
let searchQuery = "";
const currencyRates = {NGN:{rate:1,locale:"en-NG",currency:"NGN"},USD:{rate:1/1500,locale:"en-US",currency:"USD"},GBP:{rate:1/1900,locale:"en-GB",currency:"GBP"},EUR:{rate:1/1650,locale:"de-DE",currency:"EUR"}};
const currencySelect = document.getElementById("currency");
currencySelect.value = localStorage.getItem(STORAGE.currency) || "NGN";
function safeParse(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch{return fallback}}
function money(n){const c=currencyRates[currencySelect.value]||currencyRates.NGN;return new Intl.NumberFormat(c.locale,{style:"currency",currency:c.currency,maximumFractionDigits:0}).format(n*c.rate)}
function saveState(){localStorage.setItem(STORAGE.cart,JSON.stringify(cart));localStorage.setItem(STORAGE.wishlist,JSON.stringify([...wishlist]));localStorage.setItem(STORAGE.currency,currencySelect.value)}
const grid=document.getElementById("product-grid");
function visibleProducts(){let list=products.filter(p=>(activeFilter==="All"||p.category===activeFilter)&&(!searchQuery||(p.name+" "+p.category+" "+p.desc).toLowerCase().includes(searchQuery)));const sort=document.getElementById("sort-products").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);return list}
function renderProducts(){const list=visibleProducts();grid.innerHTML=list.map(p=>`<article class="product-card"><button class="heart-button ${wishlist.has(p.id)?"liked":""}" data-wish="${p.id}" aria-label="${wishlist.has(p.id)?"Remove":"Add"} ${p.name} ${wishlist.has(p.id)?"from":"to"} wishlist">${wishlist.has(p.id)?"♥":"♡"}</button>${p.badge?`<span class="product-badge">${p.badge}</span>`:""}<div class="product-visual" aria-hidden="true">${p.icon}</div><div class="product-info"><span class="product-category">${p.category.toUpperCase()}</span><h3 class="product-name">${p.name}</h3><p class="product-description">${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`).join("")||'<p class="empty-cart">No items found. Try another category or search.</p>'}
function updateCart(){const count=cart.reduce((n,i)=>n+i.qty,0);["cart-count","cart-count-top"].forEach(id=>document.getElementById(id).textContent=count);document.getElementById("drawer-count").textContent=`(${count})`;document.getElementById("cart-subtotal").textContent=money(cart.reduce((n,i)=>n+i.price*i.qty,0));document.getElementById("checkout-total").textContent=money(cart.reduce((n,i)=>n+i.price*i.qty,0));document.getElementById("wishlist-count").textContent=wishlist.size;const box=document.getElementById("cart-items");if(!cart.length){box.innerHTML='<p class="empty-cart">Your bag is waiting for something extraordinary.</p>';saveState();return}box.innerHTML=cart.map(item=>`<div class="cart-row"><div><strong>${item.name}</strong><small>${money(item.price)} each</small><div class="qty-controls"><button data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button><button data-remove="${item.id}">Remove</button></div></div><strong>${money(item.price*item.qty)}</strong></div>`).join("");saveState()}
function toast(message){const t=document.getElementById("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
const panelIds=["cart-drawer","search-modal","checkout-modal","account-modal","info-modal"];
function openPanel(id){closePanels();document.getElementById("overlay").classList.add("open");document.getElementById(id).classList.add("open");document.body.classList.add("locked");if(id==="cart-drawer")document.getElementById(id).setAttribute("aria-hidden","false");if(id==="search-modal")setTimeout(()=>document.getElementById("search-input").focus(),100)}
function closePanels(){document.getElementById("overlay").classList.remove("open");panelIds.forEach(id=>{const el=document.getElementById(id);el.classList.remove("open");if(id==="cart-drawer")el.setAttribute("aria-hidden","true")});document.body.classList.remove("locked")}
function chooseFilter(category){activeFilter=category;searchQuery="";document.querySelectorAll(".pill").forEach(b=>b.classList.toggle("selected",b.dataset.filter===category));renderProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"});}
document.addEventListener("click",e=>{
 const add=e.target.closest("[data-add]");if(add){const p=products.find(x=>x.id===Number(add.dataset.add));const found=cart.find(x=>x.id===p.id);if(found)found.qty++;else cart.push({...p,qty:1});updateCart();toast(`${p.name} added to your bag`);return}
 const wish=e.target.closest("[data-wish]");if(wish){const id=Number(wish.dataset.wish);wishlist.has(id)?wishlist.delete(id):wishlist.add(id);renderProducts();updateCart();
loadStoreProducts();
async function loadStoreProducts(){try{const r=await fetch(`${API_BASE}/products`);if(!r.ok)return;const data=await r.json();if(Array.isArray(data.products)&&data.products.length){products.splice(0,products.length,...data.products);apiAvailable=true;renderProducts();updateCart();}}catch{ /* file:// preview still shows the local starter catalogue */ }}toast(wishlist.has(id)?"Added to your wishlist":"Removed from your wishlist");return}
 const qty=e.target.closest("[data-qty]");if(qty){const item=cart.find(x=>x.id===Number(qty.dataset.qty));if(item){item.qty+=Number(qty.dataset.delta);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id)}updateCart();return}
 const remove=e.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));updateCart();return}
 const cat=e.target.closest("[data-category]");if(cat){chooseFilter(cat.dataset.category);return}
 const filter=e.target.closest("[data-filter]");if(filter){activeFilter=filter.dataset.filter;searchQuery="";document.querySelectorAll(".pill").forEach(b=>b.classList.toggle("selected",b===filter));renderProducts();return}
 if(e.target.closest("[data-open-cart]")){openPanel("cart-drawer");return}
 if(e.target.closest("[data-open-search]")){openPanel("search-modal");return}
 if(e.target.closest("[data-open-account]")){openPanel("account-modal");return}
 if(e.target.closest("[data-close]")||e.target.id==="overlay"){closePanels();return}
 if(e.target.id==="checkout-button"){if(!cart.length){toast("Your bag is empty — add a find first.");return}openPanel("checkout-modal");return}
 if(e.target.id==="wishlist-nav"||e.target.id==="footer-wishlist"){const items=products.filter(p=>wishlist.has(p.id));if(!items.length){toast("Your wishlist is empty for now.");return}activeFilter="All";searchQuery="";renderProducts();closePanels();document.getElementById("products").scrollIntoView({behavior:"smooth"});toast(`${items.length} saved item${items.length===1?"":"s"} — look for the hearts in the collection.`);return}
 const help=e.target.closest("[data-help]");if(help){document.getElementById("info-title").textContent=help.dataset.help;const text={"Shipping information":"Delivery timing and fees depend on the final delivery address and service area. Shipping rates must be configured for the regions the store serves.","Returns and refunds":"A real returns policy should be added before launch, including eligibility, timelines, and refund method. Orders can be placed when the local store server is running.","Contact support":"Add your verified business email, phone number, and support hours here before publishing the store."};document.getElementById("info-content").innerHTML=`<p>${text[help.dataset.help]||"Support information will be added before launch."}</p>`;openPanel("info-modal");return}
 const sr=e.target.closest("[data-search-product]");if(sr){closePanels();document.getElementById("products").scrollIntoView({behavior:"smooth"});}
});
document.getElementById("sort-products").addEventListener("change",renderProducts);
document.getElementById("show-all").addEventListener("click",()=>{activeFilter="All";searchQuery="";document.querySelectorAll(".pill").forEach(b=>b.classList.toggle("selected",b.dataset.filter==="All"));renderProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"})});
document.getElementById("search-input").addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();const result=document.getElementById("search-results");if(!q){result.innerHTML="";return}const matches=products.filter(p=>(p.name+" "+p.category+" "+p.desc).toLowerCase().includes(q));result.innerHTML=matches.length?matches.map(p=>`<a href="#products" class="search-result" data-search-product="${p.id}"><span>${p.name}<br><small>${p.category}</small></span><strong>${money(p.price)}</strong></a>`).join(""):'<p class="demo-note">No matches yet — try another search.</p>';});
currencySelect.addEventListener("change",()=>{renderProducts();updateCart();document.getElementById("search-input").dispatchEvent(new Event("input"));});
document.getElementById("menu-toggle").addEventListener("click",()=>document.getElementById("main-nav").classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("main-nav").classList.remove("open")));
document.getElementById("newsletter-form").addEventListener("submit",async e=>{e.preventDefault();const email=document.getElementById("newsletter-email").value.trim();const msg=document.getElementById("newsletter-message");try{const r=await fetch(`${API_BASE}/newsletter`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});if(!r.ok)throw new Error("server unavailable");msg.textContent="Thank you — you are on the ZYVORA list.";}catch{msg.textContent="To save subscriptions, start the ZYVORA server using the README instructions.";}e.target.reset();});
document.getElementById("checkout-form").addEventListener("submit",async e=>{e.preventDefault();if(!cart.length){toast("Your bag is empty.");closePanels();return}const form=e.target;const data=new FormData(form);const payment=data.get("payment");const payload={customer:{name:data.get("name"),email:data.get("email"),phone:data.get("phone"),address:data.get("address")},delivery:data.get("delivery"),payment,items:cart.map(i=>({id:i.id,quantity:i.qty}))};const submit=form.querySelector('button[type="submit"]');submit.disabled=true;submit.textContent="PROCESSING…";try{const r=await fetch(`${API_BASE}/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await r.json();if(!r.ok)throw new Error(result.error||"Could not place order");if(result.paymentUrl){window.location.href=result.paymentUrl;return}document.getElementById("checkout-title").textContent="Order received";form.innerHTML=`<div class="order-success"><div class="story-symbol">✦</div><h3>Thank you, ${escapeHTML(payload.customer.name)}.</h3><p>Your order reference is <strong>${escapeHTML(result.order.reference)}</strong>.</p><p>Order total: <strong>${money(result.order.total)}</strong></p><p>Payment: ${escapeHTML(result.order.payment)}</p><p class="modal-intro">Your order has been saved by the ZYVORA server. Our team must confirm delivery and stock availability.</p><button type="button" class="gold-button full-button" id="finish-order">BACK TO SHOPPING →</button></div>`;cart=[];updateCart();document.getElementById("finish-order").addEventListener("click",()=>{closePanels();location.reload()});}catch(err){toast(err.message.includes("Failed to fetch")?"Start the ZYVORA server to place real orders.":err.message); }finally{if(document.body.contains(submit)){submit.disabled=false;submit.textContent="PLACE ORDER →"}}});
document.getElementById("account-form").addEventListener("submit",e=>{e.preventDefault();toast("Customer accounts are not enabled yet. You can still place Cash on Delivery orders.");});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanels()});

// Optional, locally generated ambient soundscape. Browsers require a user gesture before audio can play.
const ambienceButton = document.getElementById("ambience-toggle");
let ambienceContext = null;
let ambienceNodes = [];
let ambienceOn = false;
function startAmbience(){
 const AudioContextClass = window.AudioContext || window.webkitAudioContext;
 if(!AudioContextClass){toast("This browser does not support the ambience feature.");return;}
 ambienceContext = ambienceContext || new AudioContextClass();
 ambienceContext.resume();
 const master = ambienceContext.createGain(); master.gain.value = 0.0001; master.connect(ambienceContext.destination);
 const now = ambienceContext.currentTime; master.gain.setTargetAtTime(0.045, now, 1.8);
 // Soft, original drone made in-browser (no external music file or copyright track).
 [55,82.41,110,164.81].forEach((freq,i)=>{
   const osc=ambienceContext.createOscillator(); const gain=ambienceContext.createGain();
   osc.type=i===0?"sine":"triangle"; osc.frequency.value=freq; gain.gain.value=[.42,.12,.09,.035][i];
   const lfo=ambienceContext.createOscillator(); const lfoGain=ambienceContext.createGain(); lfo.frequency.value=.06+i*.025; lfoGain.gain.value=1.5+i*.5; lfo.connect(lfoGain); lfoGain.connect(osc.frequency); lfo.start();
   osc.connect(gain); gain.connect(master); osc.start(); ambienceNodes.push(osc,gain,lfo,lfoGain);
 });
 const shimmer=ambienceContext.createOscillator(); const shimmerGain=ambienceContext.createGain(); shimmer.type="sine"; shimmer.frequency.value=329.63; shimmerGain.gain.value=.012; shimmer.connect(shimmerGain); shimmerGain.connect(master); shimmer.start(); ambienceNodes.push(shimmer,shimmerGain,master);
}
function stopAmbience(){
 if(!ambienceContext)return;
 const master=ambienceNodes[ambienceNodes.length-1];
 if(master && master.gain) master.gain.setTargetAtTime(.0001,ambienceContext.currentTime,.35);
 setTimeout(()=>{ambienceNodes.forEach(n=>{try{if(typeof n.stop==="function")n.stop();if(typeof n.disconnect==="function")n.disconnect()}catch{}});ambienceNodes=[];},1500);
}
if(ambienceButton){ambienceButton.addEventListener("click",()=>{
 ambienceOn=!ambienceOn;
 if(ambienceOn){startAmbience();ambienceButton.setAttribute("aria-pressed","true");document.getElementById("ambience-label").textContent="AMBIENCE ON";document.getElementById("ambience-icon").textContent="♫";}
 else{stopAmbience();ambienceButton.setAttribute("aria-pressed","false");document.getElementById("ambience-label").textContent="ENABLE AMBIENCE";document.getElementById("ambience-icon").textContent="♪";}
});}

document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();updateCart();
