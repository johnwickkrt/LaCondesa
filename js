'use strict';
/* EDITA ESTA CONFIGURACIÓN AL PERSONALIZAR EL RESTAURANTE.
   La demo nunca envía ni almacena solicitudes por sí sola.
   Para activar registros, implementa un endpoint HTTPS que acepte JSON y responde 2xx.
*/
const CONFIG = {
  address: '',              // Ej.: 'Calle ... 123, Toluca, Estado de México'
  openingHours: '',         // Ej.: 'Mar–Dom: 13:00–22:00'
  contact: '',              // Ej.: '+52 722 ... · hola@restaurante.mx'
  mapsUrl: '',              // URL de Google Maps del negocio real
  instagram: '',            // URL completa de perfil
  facebook: '',
  tiktok: '',
  reservationEndpoint: '',  // URL HTTPS de un backend para reservaciones
  eventEndpoint: ''         // URL HTTPS de un backend para registros de eventos
};

const dishes = {
  entradas: {
    heading: 'Para comenzar', photoLabel: 'El comienzo de una obra maestra',
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    items: [
      ['Burrata del jardín', 'Tomates rostizados, albahaca fresca y aceite de oliva.', '$245'],
      ['Carpaccio Fiorentino', 'Láminas de res, arúgula, lascas de parmesano y limón.', '$275'],
      ['Bruschetta de la huerta', 'Pan artesanal, setas salteadas y ricotta de hierbas.', '$185'],
      ['Sopa de estación', 'Vegetales de temporada, hierbas y crocante de pan.', '$170']
    ]
  },
  fuertes: {
    heading: 'La obra principal', photoLabel: 'La esencia está en el detalle',
    photo: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
    items: [
      ['Ravioli della Casa', 'Pasta fresca rellena de ricotta, espinaca y mantequilla de salvia.', '$325'],
      ['Risotto dei Medici', 'Arroz cremoso con hongos, parmesano y perfume de trufa.', '$365'],
      ['Filetto al Rosmarino', 'Filete con reducción de vino tinto y puré de papa rústico.', '$490'],
      ['Pesce del Giorno', 'Pesca del día, cítricos, vegetales asados y aceite verde.', '$420']
    ]
  },
  postres: {
    heading: 'El gran final', photoLabel: 'La dulzura también inspira',
    photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    items: [
      ['Tiramisú Aurea', 'Mascarpone aireado, espresso y cacao.', '$190'],
      ['Panna cotta', 'Vainilla, frutos rojos y crumble de almendras.', '$175'],
      ['Torta de chocolate', 'Chocolate oscuro, helado de vainilla y sal de mar.', '$210'],
      ['Gelato artesanal', 'Dos sabores a elegir, acompañados de galleta fina.', '$150']
    ]
  },
  bebidas: {
    heading: 'Un brindis al momento', photoLabel: 'El arte de brindar',
    photo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80',
    items: [
      ['Limonata Fiorentina', 'Limón amarillo, hierbas frescas y agua mineral.', '$110'],
      ['Spritz sin alcohol', 'Cítricos, notas botánicas y burbujas.', '$155'],
      ['Espresso italiano', 'Extracción corta de café de especialidad.', '$75'],
      ['Chocolate de la casa', 'Cacao artesanal y especias suaves.', '$110']
    ]
  }
};
const reviews = [
  {name:'María G. — ejemplo', initials:'M',quote:'Cada detalle transforma una cena cotidiana en un momento verdaderamente especial.'},
  {name:'Daniel R. — ejemplo',initials:'D',quote:'Una atmósfera de otra época con sabores que se sienten completamente actuales.'},
  {name:'Sofía L. — ejemplo',initials:'S',quote:'De esos lugares que invitan a quedarse, conversar y disfrutar sin mirar el reloj.'}
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let toastTimeout;
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3800)}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function renderMenu(category){const c=dishes[category];if(!c)return;$('#menuContent').innerHTML=`<div class="menu-list"><div class="menu-category-heading">${escapeHTML(c.heading)}</div>${c.items.map(item=>`<article class="menu-item"><div class="menu-item-top"><h3>${escapeHTML(item[0])}</h3><strong>${escapeHTML(item[2])}</strong></div><p>${escapeHTML(item[1])}</p></article>`).join('')}</div><div class="menu-photo" role="img" aria-label="Platillo ilustrativo de la categoría ${escapeHTML(category)}" style="background-image:linear-gradient(0deg,#18251ea0,transparent 58%),url('${c.photo}')"><div class="menu-photo-label">${escapeHTML(c.photoLabel)}</div></div>`;
  $$('.menu-tab').forEach(tab=>{const active=tab.dataset.category===category;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
}
$$('.menu-tab').forEach(tab=>tab.addEventListener('click',()=>renderMenu(tab.dataset.category)));
$('.menu-tabs').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const tabs=$$('.menu-tab');const i=tabs.findIndex(t=>t.classList.contains('active'));const next=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];renderMenu(next.dataset.category);next.focus()}});
renderMenu('entradas');
let activeReview=0;
function renderReview(){const r=reviews[activeReview];$('#reviewQuote').textContent=r.quote;$('#reviewName').textContent=r.name;$('#reviewAvatar').textContent=r.initials;$('#reviewCount').textContent=String(activeReview+1).padStart(2,'0')+' / '+String(reviews.length).padStart(2,'0')}
$('#reviewPrev').addEventListener('click',()=>{activeReview=(activeReview+reviews.length-1)%reviews.length;renderReview()});
$('#reviewNext').addEventListener('click',()=>{activeReview=(activeReview+1)%reviews.length;renderReview()});
renderReview();
const mobileNav=$('#mobileNav'),menuToggle=$('#menuToggle');
function closeNav(){mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menú')}
menuToggle.addEventListener('click',()=>{mobileNav.hidden=!mobileNav.hidden;const on=!mobileNav.hidden;menuToggle.setAttribute('aria-expanded',String(on));menuToggle.setAttribute('aria-label',on?'Cerrar menú':'Abrir menú')});
$$('#mobileNav a,#mobileNav button').forEach(el=>el.addEventListener('click',closeNav));
let rafPending=false;
function updateScroll(){const total=document.documentElement.scrollHeight-window.innerHeight;$('#scrollMeter').style.width=(total>0?Math.min(100,scrollY/total*100):0)+'%';$('#header').classList.toggle('scrolled',scrollY>35);const art=$('.hero-art');if(art&&innerWidth>700&&scrollY<850){art.style.transform=`translate3d(0,${Math.min(95,scrollY*.12)}px,0)`}rafPending=false}
window.addEventListener('scroll',()=>{if(!rafPending){requestAnimationFrame(updateScroll);rafPending=true}},{passive:true});updateScroll();
if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.1,rootMargin:'0px 0px -30px 0px'});$$('.reveal').forEach(el=>observer.observe(el))}else{$$('.reveal').forEach(el=>el.classList.add('visible'))}
const now=new Date();const localISO=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);$('#reservationDate').min=localISO;$('#eventDate').min=localISO;$('#year').textContent=String(now.getFullYear());
if(CONFIG.address)$('#addressText').textContent=CONFIG.address;if(CONFIG.openingHours)$('#hoursText').textContent=CONFIG.openingHours;if(CONFIG.contact)$('#contactText').textContent=CONFIG.contact;
function configureAnchor(id,url){const link=$('#'+id);if(url){link.href=url;link.target='_blank';link.rel='noopener noreferrer'}else{link.addEventListener('click',e=>{e.preventDefault();toast('Este enlace estará disponible al agregar los datos reales del restaurante.')})}}
configureAnchor('directionsLink',CONFIG.mapsUrl);configureAnchor('instagramLink',CONFIG.instagram);configureAnchor('facebookLink',CONFIG.facebook);configureAnchor('tiktokLink',CONFIG.tiktok);
const reservationDialog=$('#reservationDialog'),receiptDialog=$('#receiptDialog');
$$('[data-open-reservation]').forEach(btn=>btn.addEventListener('click',()=>{closeNav();reservationDialog.showModal()}));
$('#closeReservation').addEventListener('click',()=>reservationDialog.close());$('#closeReceipt').addEventListener('click',()=>receiptDialog.close());
[reservationDialog,receiptDialog].forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()}));
let preparedRequest='';
function requestText(kind,data){const lines=Object.entries(data).map(([key,value])=>`${key.replace(/^./,c=>c.toUpperCase())}: ${value || 'No especificado'}`);return `AUREA FIRENZE · ${kind}\n\n${lines.join('\n')}\n\nSolicitud preparada desde el sitio web.`;}
function showReceipt(kind,data,sent=false){preparedRequest=requestText(kind,data);$('#receiptIntro').textContent=sent?'El servidor recibió tu solicitud. El restaurante debe confirmar los detalles.':'Aquí tienes los datos de tu solicitud. Cópialos para compartirlos directamente con el restaurante cuando esté disponible su contacto.';$('#receiptText').textContent=preparedRequest;$('#receiptFoot').textContent=sent?'Solicitud recibida por el sistema configurado; no implica confirmación del servicio.':'Modo demostración: la información no se ha enviado, guardado ni confirmado.';receiptDialog.showModal()}
async function submitRequest(kind,form,endpoint){const data=Object.fromEntries(new FormData(form).entries());const submitButton=form.querySelector('button[type=submit]');if(endpoint){if(!/^https:\/\//i.test(endpoint)){toast('Configura un endpoint HTTPS válido.');return}submitButton.disabled=true;const previous=submitButton.textContent;submitButton.textContent='Enviando…';try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,...data})});if(!res.ok)throw new Error('HTTP '+res.status);form.closest('dialog')?.close();showReceipt(kind,data,true);form.reset()}catch(err){console.error(err);toast('No se pudo enviar. Verifica el servicio y vuelve a intentar.')}finally{submitButton.disabled=false;submitButton.textContent=previous}}else{form.closest('dialog')?.close();showReceipt(kind,data,false)}}
$('#reservationForm').addEventListener('submit',async e=>{e.preventDefault();await submitRequest('Solicitud de reservación',e.currentTarget,CONFIG.reservationEndpoint)});
$('#eventForm').addEventListener('submit',async e=>{e.preventDefault();await submitRequest('Solicitud de evento especial',e.currentTarget,CONFIG.eventEndpoint)});
$('#copyRequest').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preparedRequest);toast('Solicitud copiada.')}catch{const field=document.createElement('textarea');field.value=preparedRequest;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();try{document.execCommand('copy');toast('Solicitud copiada.')}catch{toast('Selecciona y copia el texto de la solicitud.')}field.remove()}});
