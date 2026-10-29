const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const DATA = path.join(ROOT, 'data');
const MIME = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.ico':'image/x-icon'};
function readJSON(name, fallback){try{return JSON.parse(fs.readFileSync(path.join(DATA,name),'utf8'))}catch{return fallback}}
function writeJSON(name, value){fs.writeFileSync(path.join(DATA,name),JSON.stringify(value,null,2),'utf8')}
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj))}
function body(req){return new Promise((resolve,reject)=>{let raw='';req.on('data',chunk=>{raw+=chunk;if(raw.length>1_000_000){reject(new Error('Request too large'));req.destroy()}});req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
function safeEqual(a,b){const aa=Buffer.from(String(a||'')),bb=Buffer.from(String(b||''));return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb)}
async function handler(req,res){
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/api/health')return send(res,200,{ok:true,service:'ZYVORA store API'});
  if(req.method==='GET'&&url.pathname==='/api/products')return send(res,200,readJSON('products.json',{products:[]}));
  if(req.method==='POST'&&url.pathname==='/api/newsletter'){
    let b;try{b=await body(req)}catch(e){return send(res,400,{error:e.message})}
    const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return send(res,400,{error:'Enter a valid email address.'});
    const list=readJSON('subscribers.json',[]);if(!list.some(x=>x.email===email)){list.push({email,createdAt:new Date().toISOString()});writeJSON('subscribers.json',list)}return send(res,201,{ok:true});
  }
  if(req.method==='POST'&&url.pathname==='/api/orders'){
    let b;try{b=await body(req)}catch(e){return send(res,400,{error:e.message})}
    const c=b.customer||{};for(const k of ['name','email','phone','address'])if(!String(c[k]||'').trim())return send(res,400,{error:`Please provide your ${k}.`});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))return send(res,400,{error:'Enter a valid email address.'});
    if(!Array.isArray(b.items)||!b.items.length)return send(res,400,{error:'Your cart is empty.'});
    const catalog=readJSON('products.json',{products:[]}).products;const lines=[];let total=0;
    for(const item of b.items){const p=catalog.find(x=>Number(x.id)===Number(item.id));const qty=Math.max(1,Math.min(50,Number(item.quantity)||1));if(!p)return send(res,400,{error:'A product in your cart is no longer available.'});lines.push({id:p.id,name:p.name,unitPrice:Number(p.price),quantity:qty,lineTotal:Number(p.price)*qty});total+=Number(p.price)*qty;}
    const reference='ZYV-'+Date.now().toString(36).toUpperCase()+'-'+crypto.randomBytes(3).toString('hex').toUpperCase();
    const order={reference,createdAt:new Date().toISOString(),status:'pending',payment:String(b.payment||'Cash on Delivery'),currency:'NGN',customer:{name:String(c.name).trim(),email:String(c.email).trim().toLowerCase(),phone:String(c.phone).trim(),address:String(c.address).trim()},delivery:String(b.delivery||'Standard delivery'),items:lines,total};
    if(order.payment==='Pay online (Paystack)'||order.payment==='Online payment'){
      if(!process.env.PAYSTACK_SECRET_KEY)return send(res,503,{error:'Online payment is not configured yet. Please choose Cash on Delivery or ask the store owner to configure Paystack.'});
      const callback=process.env.PAYSTACK_CALLBACK_URL||`http://localhost:${PORT}/payment-callback.html`;
      try{const pr=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({email:order.customer.email,amount:Math.round(total*100),currency:'NGN',reference,callback_url:callback,metadata:{order_reference:reference,customer_name:order.customer.name}})});const pd=await pr.json();if(!pr.ok||!pd.status)throw new Error(pd.message||'Payment provider error');order.paymentReference=reference;const orders=readJSON('orders.json',[]);orders.push(order);writeJSON('orders.json',orders);return send(res,201,{paymentUrl:pd.data.authorization_url,order:{reference,total,payment:order.payment}})}catch(e){return send(res,502,{error:'Could not initialize online payment. Please try Cash on Delivery or try again later.'})}
    }
    const orders=readJSON('orders.json',[]);orders.push(order);writeJSON('orders.json',orders);return send(res,201,{order:{reference,total,payment:order.payment,status:order.status}});
  }
  if((req.method==='GET'||req.method==='POST')&&url.pathname==='/api/admin/orders'){
    if(!process.env.ADMIN_API_KEY)return send(res,503,{error:'Set ADMIN_API_KEY in your environment before using admin API.'});
    if(!safeEqual(req.headers['x-admin-key'],process.env.ADMIN_API_KEY))return send(res,401,{error:'Unauthorized'});
    if(req.method==='GET')return send(res,200,{orders:readJSON('orders.json',[])});
    let b;try{b=await body(req)}catch(e){return send(res,400,{error:e.message})}
    const orders=readJSON('orders.json',[]);const order=orders.find(o=>o.reference===String(b.reference||''));if(!order)return send(res,404,{error:'Order not found'});
    if(!['pending','confirmed','packed','shipped','delivered','cancelled','paid'].includes(String(b.status)))return send(res,400,{error:'Invalid order status'});order.status=String(b.status);order.updatedAt=new Date().toISOString();writeJSON('orders.json',orders);return send(res,200,{ok:true,order});
  }
  if(req.method==='POST'&&url.pathname==='/api/admin/products'){
    if(!process.env.ADMIN_API_KEY)return send(res,503,{error:'Set ADMIN_API_KEY in your environment before using admin API.'});
    if(!safeEqual(req.headers['x-admin-key'],process.env.ADMIN_API_KEY))return send(res,401,{error:'Unauthorized'});
    let b;try{b=await body(req)}catch(e){return send(res,400,{error:e.message})}
    if(!Array.isArray(b.products))return send(res,400,{error:'Body must contain a products array.'});
    for(const p of b.products){if(!p.name||!p.category||!Number.isFinite(Number(p.price))||Number(p.price)<0)return send(res,400,{error:'Every product needs a name, category, and non-negative price.'})}
    writeJSON('products.json',{products:b.products.map((p,i)=>({...p,id:Number(p.id)||i+1,price:Number(p.price)}))});return send(res,200,{ok:true,count:b.products.length});
  }
  // Serve only files within the project folder; API routes above are handled separately.
  let target=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);target=path.normalize(target).replace(/^([.][.][/\\])+/, '');const full=path.resolve(ROOT,'.'+target);
  if(!full.startsWith(path.resolve(ROOT)+path.sep)&&full!==path.resolve(ROOT))return send(res,403,{error:'Forbidden'});
  fs.readFile(full,(err,content)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Not found')};res.writeHead(200,{'Content-Type':MIME[path.extname(full)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(content)});
}
http.createServer((req,res)=>{handler(req,res).catch(()=>{if(!res.headersSent)send(res,500,{error:'Unexpected server error'})})}).listen(PORT,()=>console.log(`ZYVORA is running at http://localhost:${PORT}`));
