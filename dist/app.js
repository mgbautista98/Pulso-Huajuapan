const demoBusinesses = [
  {name:'Café Nube Mixteca',category:'Alimentos',activity:'Cafetería y alimentos preparados',zone:'Centro',leader:'Pendiente de verificar',icon:'☕',lat:17.8077,lng:-97.7788,needs:['open','budget','digital']},
  {name:'Mercado La Estación',category:'Comercio',activity:'Comercio minorista de productos locales',zone:'Centro',leader:'Pendiente de verificar',icon:'◫',lat:17.8057,lng:-97.7767,needs:['open','budget','family']},
  {name:'Taller Ruta 190',category:'Servicios',activity:'Mantenimiento automotriz',zone:'Col. Reforma',leader:'Pendiente de verificar',icon:'⌁',lat:17.8121,lng:-97.7692,needs:['open','digital']},
  {name:'Salud Mixteca',category:'Salud',activity:'Consultorio de atención general',zone:'Alta Vista de Juárez',leader:'Pendiente de verificar',icon:'✚',lat:17.8158,lng:-97.7811,needs:['accessible','digital']},
  {name:'Aula Ñuu',category:'Educación',activity:'Capacitación y apoyo escolar',zone:'Centro',leader:'Pendiente de verificar',icon:'✎',lat:17.8088,lng:-97.7748,needs:['budget','family']},
  {name:'Posada del Sol',category:'Hospedaje',activity:'Hospedaje de corta estancia',zone:'Santa Rosa',leader:'Pendiente de verificar',icon:'⌂',lat:17.8007,lng:-97.7862,needs:['open','accessible','digital']},
  {name:'Casa del Barro',category:'Comercio',activity:'Artesanías y productos regionales',zone:'Centro',leader:'Pendiente de verificar',icon:'◇',lat:17.8064,lng:-97.7817,needs:['budget','digital']},
  {name:'Sabores de la Mixteca',category:'Alimentos',activity:'Cocina regional',zone:'Col. del Valle',leader:'Pendiente de verificar',icon:'◉',lat:17.8018,lng:-97.7735,needs:['delivery','budget','family']},
  {name:'La Carreta Restaurante',category:'Alimentos',activity:'Cocina regional de la Mixteca',zone:'Huajuapan · ubicación por verificar',leader:'Pendiente de verificar',icon:'🍽️',needs:['budget','family']},
  {name:'Café y Letras Huajuapan',category:'Alimentos',activity:'Desayunos, comidas, cenas, bebidas y postres',zone:'Huajuapan · ubicación por verificar',leader:'Pendiente de verificar',icon:'☕',needs:['family','digital']},
  {name:'Las Palmas',category:'Alimentos',activity:'Desayuno buffet, carnes, aves, mariscos y postres',zone:'Huajuapan · ubicación por verificar',leader:'Pendiente de verificar',icon:'🍴',needs:['family']},
  {name:'Mariscos Victor’s',category:'Alimentos',activity:'Restaurante de mariscos',zone:'Huajuapan · ubicación por verificar',leader:'Pendiente de verificar',icon:'🐟',needs:['family']},
  {name:'El Alebrije',category:'Alimentos',activity:'Tlayudas y cocina oaxaqueña',zone:'Huajuapan · ubicación por verificar',leader:'Pendiente de verificar',icon:'🌮',needs:['budget','family']},
  {name:'Super Plus',category:'Comercio',activity:'Tienda de conveniencia',zone:'Huajuapan · sucursal por verificar',leader:'Pendiente de verificar',icon:'🛒',needs:['open','budget']},
  {name:'Tiendas Neto',category:'Comercio',activity:'Tienda de abarrotes y productos de consumo diario',zone:'Huajuapan · sucursal por verificar',leader:'Pendiente de verificar',icon:'🛒',needs:['budget']},
  {name:'Tiendas 3B',category:'Comercio',activity:'Tienda de autoservicio y productos de consumo diario',zone:'Huajuapan · sucursal por verificar',leader:'Pendiente de verificar',icon:'🛒',needs:['budget']}
];

const stored = JSON.parse(localStorage.getItem('pulsoBusinesses') || '[]');
let businesses = [...demoBusinesses, ...stored];
let activeFilter = 'all';
const grid = document.querySelector('#business-grid');
const search = document.querySelector('#search');
const category = document.querySelector('#category');

const escapeHTML = value => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function renderCategoryOptions(){
  [...new Set(businesses.map(b=>b.category))].sort().forEach(item=>{
    const option=document.createElement('option'); option.value=item; option.textContent=item; category.append(option);
  });
}
function render(){
  const q=search.value.trim().toLocaleLowerCase('es');
  const selected=category.value;
  const items=businesses.filter(b=>(activeFilter==='all'||b.category===activeFilter)&&(selected==='all'||b.category===selected)&&[b.name,b.activity,b.zone].join(' ').toLocaleLowerCase('es').includes(q));
  grid.innerHTML=items.map(b=>`<article class="business-card"><div class="card-top"><span class="category-icon">${escapeHTML(b.icon||'•')}</span><span class="status">${b.userAdded?'Aportado':'Dato demo'}</span></div><h3>${escapeHTML(b.name)}</h3><p>${escapeHTML(b.activity)}</p><div class="card-meta"><div><small>${escapeHTML(b.zone)} · ${escapeHTML(b.category)}</small><strong>${escapeHTML(b.leader)}</strong></div><span class="card-arrow">↗</span></div></article>`).join('');
  document.querySelector('#result-count').textContent=items.length;
  document.querySelector('#empty').hidden=items.length>0;
  document.querySelector('#count-all').textContent=businesses.length;
  document.querySelector('#metric-businesses').textContent=businesses.length;
  document.querySelector('#metric-categories').textContent=new Set(businesses.map(b=>b.category)).size;
  document.querySelectorAll('.filter').forEach(button=>{const count=button.dataset.filter==='all'?businesses.length:businesses.filter(b=>b.category===button.dataset.filter).length;button.querySelector('span').textContent=count});
}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filter.active').classList.remove('active');button.classList.add('active');activeFilter=button.dataset.filter;category.value='all';render()}));
search.addEventListener('input',render); category.addEventListener('change',render);
document.querySelector('#toggle-view').addEventListener('click',()=>grid.classList.toggle('list'));

const modal=document.querySelector('#business-modal');
document.querySelectorAll('[data-open-modal]').forEach(button=>button.addEventListener('click',()=>modal.showModal()));
document.querySelector('[data-close-modal]').addEventListener('click',()=>modal.close());
modal.addEventListener('click',event=>{if(event.target===modal)modal.close()});
document.querySelector('#business-form').addEventListener('submit',event=>{
  event.preventDefault(); const data=new FormData(event.currentTarget);
  const item={name:data.get('name'),category:data.get('category'),activity:`Negocio de ${data.get('category').toLocaleLowerCase('es')}`,zone:data.get('zone'),leader:data.get('leader')||'No publicado',icon:'●',userAdded:true};
  const current=JSON.parse(localStorage.getItem('pulsoBusinesses')||'[]'); current.push(item); localStorage.setItem('pulsoBusinesses',JSON.stringify(current)); businesses.push(item);
  document.querySelector('#form-status').textContent='Registro guardado en este dispositivo.'; event.currentTarget.reset(); render(); setTimeout(()=>modal.close(),1100);
});
renderCategoryOptions(); render();

let mapNeed='all', mapMarkers=[];
const cityMap=window.L ? L.map('city-map',{zoomControl:false}).setView([17.8065,-97.7780],14) : null;
if(cityMap){L.control.zoom({position:'bottomright'}).addTo(cityMap);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(cityMap)}
function mapIcon(symbol){return L.divIcon({className:'custom-map-marker',html:`<span>${escapeHTML(symbol)}</span>`,iconSize:[28,28],iconAnchor:[14,28]})}
function renderMap(){
  if(!cityMap)return; mapMarkers.forEach(marker=>marker.remove()); mapMarkers=[];
  const q=document.querySelector('#map-search').value.trim().toLocaleLowerCase('es');
  const items=businesses.filter(b=>b.lat&&b.lng&&(mapNeed==='all'||(b.needs||[]).includes(mapNeed))&&[b.name,b.activity,b.zone,b.category].join(' ').toLocaleLowerCase('es').includes(q));
  const list=document.querySelector('#map-results');
  list.innerHTML=items.map((b,i)=>`<button class="map-result" data-map-index="${i}"><span class="map-result-icon">${escapeHTML(b.icon)}</span><span><strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.activity)} · ${escapeHTML(b.zone)}</small></span><span>→</span></button>`).join('');
  items.forEach((b,i)=>{const marker=L.marker([b.lat,b.lng],{icon:mapIcon(b.icon)}).addTo(cityMap).bindPopup(`<strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.activity)} · ${escapeHTML(b.zone)}</small>`);mapMarkers.push(marker);const button=list.querySelector(`[data-map-index="${i}"]`);button.addEventListener('click',()=>{list.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');cityMap.flyTo([b.lat,b.lng],16);marker.openPopup()})});
  document.querySelector('#map-result-count').textContent=`${items.length} ${items.length===1?'lugar':'lugares'}`;
}
document.querySelectorAll('.need-chip').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.need-chip.active').classList.remove('active');button.classList.add('active');mapNeed=button.dataset.need;renderMap()}));
document.querySelector('#map-search').addEventListener('input',renderMap); renderMap();
