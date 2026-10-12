const demoBusinesses = [
  {name:'Café Nube Mixteca',category:'Alimentos',activity:'Cafetería y alimentos preparados',zone:'Centro',leader:'Pendiente de verificar',icon:'☕'},
  {name:'Mercado La Estación',category:'Comercio',activity:'Comercio minorista de productos locales',zone:'Centro',leader:'Pendiente de verificar',icon:'◫'},
  {name:'Taller Ruta 190',category:'Servicios',activity:'Mantenimiento automotriz',zone:'Col. Reforma',leader:'Pendiente de verificar',icon:'⌁'},
  {name:'Salud Mixteca',category:'Salud',activity:'Consultorio de atención general',zone:'Alta Vista de Juárez',leader:'Pendiente de verificar',icon:'✚'},
  {name:'Aula Ñuu',category:'Educación',activity:'Capacitación y apoyo escolar',zone:'Centro',leader:'Pendiente de verificar',icon:'✎'},
  {name:'Posada del Sol',category:'Hospedaje',activity:'Hospedaje de corta estancia',zone:'Santa Rosa',leader:'Pendiente de verificar',icon:'⌂'},
  {name:'Casa del Barro',category:'Comercio',activity:'Artesanías y productos regionales',zone:'Centro',leader:'Pendiente de verificar',icon:'◇'},
  {name:'Sabores de la Mixteca',category:'Alimentos',activity:'Cocina regional',zone:'Col. del Valle',leader:'Pendiente de verificar',icon:'◉'}
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
