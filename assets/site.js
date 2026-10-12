document.documentElement.classList.add('js-ready');
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#year').textContent=new Date().getFullYear();
let pause=false,visualProgress=reduceMotion?.92:0,explore=false;
const experience=$('#experience');const progressBar=$('.scene-rail');
const hero=$('.hero-identity');const exploreBox=$('#scene-explore');
const emit=(name,detail={})=>window.dispatchEvent(new CustomEvent(`majenta:${name}`,{detail}));
function updateScroll(){let pct=Math.max(0,Math.min(1,window.scrollY/Math.max(1,experience.offsetHeight-window.innerHeight)));if(!pause)visualProgress=reduceMotion?.92:pct; progressBar.firstElementChild.style.width=`${visualProgress*100}%`;progressBar.setAttribute('aria-valuenow',String(Math.round(visualProgress*100)));hero.classList.toggle('active',visualProgress>.08&&visualProgress<.18);if(!explore)exploreBox.hidden=visualProgress<.87;document.querySelector('.reading-progress').style.width=`${100*window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)}%`;$('.site-header').classList.toggle('scrolled',window.scrollY>70);emit('progress',{progress:visualProgress,explore});}
window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('resize',updateScroll,{passive:true});updateScroll();
const menu=$('.menu-toggle');menu.addEventListener('click',()=>{const v=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!v));$('#mobile-menu').hidden=v;menu.setAttribute('aria-label',v?'Open menu':'Close menu')}); $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');$('#mobile-menu').hidden=true;}));
$$('.capability-trigger').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';$$('.capability-trigger').forEach(b=>{b.setAttribute('aria-expanded','false');b.querySelector('.capability-expand').textContent='+';b.nextElementSibling.hidden=true;});if(!open){button.setAttribute('aria-expanded','true');button.querySelector('.capability-expand').textContent='−';button.nextElementSibling.hidden=false;}}));
const sectorData={construction:{kicker:'CONSTRUCTION & BIM',title:'Clarity across the build.',description:'From coordinated models and information delivery to construction planning, Majenta connects project information with the people who need it.',tags:['BIM','MODEL COORDINATION','4D PLANNING'],label:'STRUCTURAL INFORMATION MODEL',link:'https://www.majentasolutions.com/construction'},automotive:{kicker:'AUTOMOTIVE ENGINEERING',title:'Connected from design to production.',description:'Trusted CAD data, PLM workflows and OEM supplier integration for the most demanding automotive engineering programmes.',tags:['OEM INTEGRATION','CAD DATA','SUPPLY CHAIN'],label:'AUTOMOTIVE CAD ASSEMBLY',link:'https://www.majentasolutions.com/automotive'},aerospace:{kicker:'AEROSPACE & ADVANCED MANUFACTURING',title:'Precision at every interface.',description:'Complex assemblies and engineering information demand accurate exchange, traceable revisions and confidence across the supply chain.',tags:['ENGINEERING DATA','CAD','DIGITAL THREAD'],label:'AEROSPACE ENGINEERING ASSEMBLY',link:'https://www.majentasolutions.com/what-we-do/cad-services'},plm:{kicker:'PLM & CAD DATA',title:'One reliable source of truth.',description:'Model data, governance, translation and remastering, keeping product definitions aligned as systems and teams evolve.',tags:['PLM','CAD TRANSLATION','INFORMATION MANAGEMENT'],label:'PRODUCT LIFECYCLE NETWORK',link:'https://www.majentasolutions.com/what-we-do/cad-services'}};
$$('[data-sector]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.sector,data=sectorData[name];$$('[data-sector-art]').forEach(a=>a.classList.toggle('is-visible',a.dataset.sectorArt===name));$$('[data-sector]').forEach(b=>b.setAttribute('aria-selected',String(b===btn)));$('#industry-kicker').textContent=data.kicker;$('#industry-name').textContent=data.title;$('#industry-description').textContent=data.description;$('#industry-visual-label').textContent=data.label;$('#industry-link').href=data.link;$('#industry-tags').replaceChildren(...data.tags.map(t=>{const span=document.createElement('span');span.textContent=t;return span}));emit('sector',{sector:name});}));
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>{explore=true;$$('[data-view]').forEach(b=>b.classList.toggle('is-selected',b===button));emit('view',{id:button.dataset.view});}));
$('#exit-explore').addEventListener('click',()=>{explore=false;exploreBox.hidden=true;window.scrollTo({top:(experience.offsetHeight-window.innerHeight)*.68,behavior:reduceMotion?'instant':'smooth'});emit('exit');});
$('#pause-scene').addEventListener('click',()=>{pause=!pause;const b=$('#pause-scene');b.setAttribute('aria-label',pause?'Resume scene animation':'Pause scene animation');b.title=pause?'Resume animation':'Pause animation';b.querySelector('path').setAttribute('d',pause?'M8 5l12 7-12 7Z':'M8 5v14M16 5v14');emit('pause',{paused:pause});});
$('#restart-scene').addEventListener('click',()=>{pause=false;explore=false;exploreBox.hidden=true;window.scrollTo({top:0,behavior:reduceMotion?'instant':'smooth'});emit('replay');});
let lastPointer=0;window.addEventListener('pointermove',e=>{if(window.matchMedia('(pointer:fine)').matches){const halo=$('.cursor-halo');halo.style.left=`${e.clientX}px`;halo.style.top=`${e.clientY}px`;lastPointer=performance.now();}},{passive:true});
if('IntersectionObserver' in window){const ob=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');ob.unobserve(e.target)}})},{threshold:.10,rootMargin:'0px 0px 30px 0px'});$$('.reveal').forEach(e=>ob.observe(e));}else $$('.reveal').forEach(e=>e.classList.add('is-visible'));
$('#enquiry-form').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const subject=`Majenta enquiry: ${data.get('area')}`;const body=`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\nInterest: ${data.get('area')}\n\n${data.get('message')}`;$('#form-status').textContent='Opening your email application with the completed enquiry.';window.location.href=`mailto:info@majentasolutions.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;});
// Renderer is a locally bundled classic script; no module imports and no external dependencies.

// Engineering navigation: real source grammar from the i3 mega menu, Jeff systems and Chance kinetic reveal.
(()=>{
 const menu=document.querySelector('#service-mega'),trigger=document.querySelector('#services-menu-trigger');
 if(!menu||!trigger)return;
 const items=[...menu.querySelectorAll('.mega-service')],titles=[['Complexity,','connected.'],['Models,','in context.'],['Information,','without gaps.'],['Precision,','everywhere.']];
 const text=[
  ['SYSTEMS / PROCESSES / PEOPLE','Business and engineering transformation programmes built around the information that matters.','DIGITAL ENGINEERING STRATEGY'],
  ['DESIGN / BIM / CONSTRUCTION','Coordinated information and model assurance across every stage of a construction programme.','CONNECTED BUILDING MODELS'],
  ['GOVERNANCE / TRACEABILITY / PLM','Engineering information aligned and controlled across technology, organisations and the supply chain.','ENGINEERING INFORMATION THREAD'],
  ['CAD / OEM / AEROSPACE / AUTOMOTIVE','Complex CAD datasets prepared, translated and assured for design and manufacturing interoperability.','PRODUCT DESIGN DATA']
 ];
 let index=0;
 function setFeature(i){index=i;items.forEach((b,j)=>b.classList.toggle('is-active',i===j));menu.dataset.active=String(i);
  document.querySelector('#mega-feature-title').innerHTML=titles[i][0]+'<br/><em>'+titles[i][1]+'</em>';
  document.querySelector('#mega-feature-eyebrow').textContent=text[i][0];
  document.querySelector('#mega-feature-description').textContent=text[i][1];
  document.querySelector('#mega-art-caption').textContent=text[i][2];
  menu.querySelectorAll('.mega-drawing').forEach((shape,j)=>shape.classList.toggle('is-shown',i===j));
 }
 const close=()=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');document.body.classList.remove('mega-is-open');};
 const open=()=>{menu.hidden=false;trigger.setAttribute('aria-expanded','true');document.body.classList.add('mega-is-open');setFeature(index)};
 trigger.addEventListener('click',()=>menu.hidden?open():close());
 menu.querySelector('.mega-dismiss').addEventListener('click',()=>{close();trigger.focus()});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!trigger.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(menu.hidden)return;if(e.key==='Escape'){close();trigger.focus()}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();index=(index+(e.key==='ArrowDown'?1:items.length-1))%items.length;setFeature(index);items[index].focus()}});
 items.forEach((item,i)=>{item.addEventListener('pointerenter',()=>setFeature(i));item.addEventListener('focus',()=>setFeature(i));item.addEventListener('click',()=>{close();let b=document.querySelectorAll('.capability-trigger')[i];if(b&&b.getAttribute('aria-expanded')!=='true')b.click()})});
 menu.querySelectorAll('.mega-contact-link').forEach(a=>a.addEventListener('click',close));
 menu.querySelector('.mega-art-stage').addEventListener('pointermove',e=>{let r=e.currentTarget.getBoundingClientRect();menu.style.setProperty('--art-x',Math.round((e.clientX-r.left)/r.width*100)+'%');menu.style.setProperty('--art-y',Math.round((e.clientY-r.top)/r.height*100)+'%')},{passive:true});
 document.querySelectorAll('.mobile-service-shortcuts a[data-capability]').forEach(a=>a.addEventListener('click',()=>{const i=Number(a.dataset.capability),b=document.querySelectorAll('.capability-trigger')[i];if(b&&b.getAttribute('aria-expanded')!=='true')b.click()}));
 setFeature(0);window.majentaMega={open,close,setFeature,isOpen:()=>!menu.hidden,getActive:()=>index};
})();
// Verified reference implementation: Jeff's scale-stage + evolving multi-layer system SVG.
(()=>{
 const steps=Array.from(document.querySelectorAll('[data-life-step]')),layers=Array.from(document.querySelectorAll('.life-layer'));
 const stageNames=['DEFINE','COORDINATE','CONNECT','DELIVER'];
 const values=['Trusted information','Coordinated models','Connected engineering','Confident delivery'];
 const descriptions=['A sound foundation for every digital engineering programme.','BIM and CAD models aligned across disciplines.','Traceable product information that travels across organisations.','Engineering intelligence ready for production and construction.'];
 const set=(index,scroll=false)=>{steps.forEach((el,i)=>{const active=i===index;el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active))});layers.forEach((el,i)=>{el.classList.toggle('is-lit',i<=index);el.classList.toggle('is-current',i===index)});document.querySelector('#life-stage-label').textContent=stageNames[index];document.querySelector('#life-live-value').textContent=values[index];document.querySelector('#life-live-description').textContent=descriptions[index];if(scroll)steps[index].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'})};
 steps.forEach((el,i)=>{el.addEventListener('click',()=>set(i,true));el.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();set((i+1)%steps.length,true);steps[(i+1)%steps.length].focus()}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();set((i+steps.length-1)%steps.length,true);steps[(i+steps.length-1)%steps.length].focus()}})});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(document.activeElement.closest?.('.lifecycle-steps'))return;for(let e of entries)if(e.isIntersecting){set(Number(e.target.dataset.lifeStep),false)}},{threshold:.65,rootMargin:'-10% 0px -25% 0px'});steps.forEach(el=>observer.observe(el));}
 set(0);window.majentaLife={set,get:()=>steps.findIndex(el=>el.classList.contains('is-active'))};
})();
// Verified reference implementation: Chance's real data-proximity-text characters + hover system.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 document.querySelectorAll('[data-proximity-text]').forEach(el=>{const value=el.textContent;el.setAttribute('aria-label',value);el.replaceChildren(...[...value].map((ch,i)=>{const span=document.createElement('span');span.className='proximity-letter';span.textContent=ch;span.setAttribute('aria-hidden','true');span.dataset.letterIndex=i;return span}));});
 document.querySelectorAll('[data-kinetic-card]').forEach(card=>{
  card.addEventListener('pointermove',event=>{if(reduced||event.pointerType==='touch')return;const r=card.getBoundingClientRect(),x=(event.clientX-r.left)/r.width,y=(event.clientY-r.top)/r.height;card.style.setProperty('--tiltx',`${(0.5-y)*7}deg`);card.style.setProperty('--tilty',`${(x-.5)*7}deg`);card.style.setProperty('--workx',`${Math.round(x*100)}%`);card.style.setProperty('--worky',`${Math.round(y*100)}%`);card.querySelectorAll('.proximity-letter').forEach((el,i)=>{const proximity=Math.max(0,1-Math.abs(x-(i+.5)/(el.parentElement.children.length||1))*3.5);el.style.transform=`translateY(${-proximity*7}px)`;})},{passive:true});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--tiltx','0deg');card.style.setProperty('--tilty','0deg');card.style.setProperty('--workx','50%');card.style.setProperty('--worky','50%');card.querySelectorAll('.proximity-letter').forEach(el=>el.style.transform='')});
 });
 window.majentaReferences={i3Menu:!!document.querySelector('#service-mega'),jeffSystem:!!document.querySelector('.life-graphic'),chanceKinetic:document.querySelectorAll('[data-kinetic-card]').length};
})();
