(function(){
  // Neue Seite immer oben beginnen (außer bei Sprungmarken)
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
  function top(){ if(location.hash) return; window.scrollTo(0,0); }
  top(); window.addEventListener('pageshow',top);
})();
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav=document.getElementById('nav'), btn=document.getElementById('menuBtn');
  if(btn&&nav){
    btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));btn.textContent=o?'Schließen':'Menü';});
    nav.addEventListener('click',function(e){ if(e.target.closest('a')){nav.classList.remove('open');btn.textContent='Menü';btn.setAttribute('aria-expanded','false');} });
  }
  // Einblenden beim Scrollen (nur Elemente unterhalb des ersten Bildschirms)
  var els=[].slice.call(document.querySelectorAll('.svc,.why-i,.steps li,.note,.value,.detail,.timeline li,.c-row,form.quote,.partner-box,.sec-head,.stat,.tr-item'));
  if(!reduce&&'IntersectionObserver' in window){
    var vh=window.innerHeight, groups=new Map();
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){
      if(el.getBoundingClientRect().top<vh) return;
      var p=el.parentElement,i=groups.get(p)||0;groups.set(p,i+1);
      el.style.transitionDelay=Math.min(i,5)*80+'ms'; el.classList.add('rv'); io.observe(el);
    });
    setTimeout(function(){els.forEach(function(el){el.classList.add('in')})},8000);
  }
  // Zähler
  function run(el){
    var end=+el.getAttribute('data-count'),suf=el.textContent.replace(/^[\d.]+/,''),t0=null,dur=1300;
    function f(t){t0=t0||t;var k=Math.min((t-t0)/dur,1),v=Math.round(end*(1-Math.pow(1-k,3)));el.textContent=v+suf;if(k<1)requestAnimationFrame(f);}
    requestAnimationFrame(f);
  }
  var cs=[].slice.call(document.querySelectorAll('[data-count]'));
  if(!reduce&&'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){co.unobserve(x.target);run(x.target);}})});
    cs.forEach(function(c){co.observe(c)});
  }
  // Kopieren
  document.querySelectorAll('button.copy').forEach(function(b){
    b.addEventListener('click',function(){var t=b.getAttribute('data-copy'),l=b.textContent;
      try{navigator.clipboard.writeText(t).then(function(){b.textContent='Kopiert';setTimeout(function(){b.textContent=l},1600)},function(){b.textContent=t})}catch(e){b.textContent=t}});
  });
  // Vorauswahl der Leistung über #anfrage-<leistung>
  (function(){
    var m=/^#anfrage-([a-z]+)$/.exec(location.hash); if(!m) return;
    var box=document.querySelector('input[data-service="'+m[1]+'"]');
    if(box){ box.checked=true; var f=document.getElementById('quote'); if(f&&f.scrollIntoView) setTimeout(function(){f.scrollIntoView({block:'start'})},60); }
  })();
  // Formular (Web3Forms: öffentlicher Access Key für info@kosaco.de)
  var WEB3FORMS_KEY='84f40315-cc17-478b-b3b4-3a95e2a5d430';
  var form=document.getElementById('quote'), msg=document.getElementById('formMsg');
  if(form){form.addEventListener('submit',function(e){
    e.preventDefault();msg.hidden=false;
    var n=document.getElementById('f-name').value.trim(),m=document.getElementById('f-mail').value.trim(),ok=document.getElementById('f-dsgvo').checked;
    if(!n||!/.+@.+\..+/.test(m)){msg.style.color='#B7791F';msg.textContent='Bitte Name und eine gültige E-Mail-Adresse eintragen.';return;}
    if(!ok){msg.style.color='#B7791F';msg.textContent='Bitte stimmen Sie der Datenverarbeitung zu.';return;}
    var sv=[].map.call(form.querySelectorAll('[data-service]:checked'),function(c){return c.parentNode.textContent.trim();});
    var b=form.querySelector('button[type=submit]');
    var data={access_key:WEB3FORMS_KEY,subject:'Neue Anfrage über kosaco.de',from_name:'Kosaco Website',name:n,email:m,
      telefon:document.getElementById('f-phone').value.trim(),ort:document.getElementById('f-plz').value.trim(),
      leistungen:sv.join(', ')||'keine Auswahl',nachricht:document.getElementById('f-msg').value.trim(),botcheck:''};
    b.disabled=true;msg.style.color='';msg.textContent='Wird gesendet …';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json();})
      .then(function(r){ if(r.success){msg.style.color='';msg.textContent='Danke, '+n+'! Ihre Anfrage ist bei uns angekommen. Wir melden uns schnellstmöglich.';form.reset();} else throw new Error(r.message); })
      .catch(function(){msg.style.color='#B7791F';msg.textContent='Das Senden hat leider nicht geklappt. Bitte rufen Sie uns an (+49 1578 0608138) oder schreiben Sie an info@kosaco.de.';})
      .then(function(){b.disabled=false;});
  });}
})();

// Foto-Lightbox
(function(){
  var list=[].slice.call(document.querySelectorAll('a.ph')); if(!list.length) return;
  var lb,img,idx=0,grp=[];
  function show(i){idx=(i+grp.length)%grp.length; img.src=grp[idx].getAttribute('href');}
  function close(){if(lb){document.body.removeChild(lb);lb=null;document.onkeydown=null;}}
  list.forEach(function(a){a.addEventListener('click',function(e){
    e.preventDefault();
    grp=[].slice.call((a.closest('.body')||a.closest('.mosaic')).querySelectorAll('a.ph'));
    lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');
    lb.innerHTML='<img alt=""><button class="x" aria-label="Schließen">×</button><button class="p" aria-label="Zurück">‹</button><button class="n" aria-label="Weiter">›</button>';
    document.body.appendChild(lb);img=lb.querySelector('img');
    lb.onclick=function(ev){if(ev.target===lb||ev.target.className==='x')close();};
    lb.querySelector('.p').onclick=function(){show(idx-1)};lb.querySelector('.n').onclick=function(){show(idx+1)};
    document.onkeydown=function(ev){if(ev.key==='Escape')close();if(ev.key==='ArrowLeft')show(idx-1);if(ev.key==='ArrowRight')show(idx+1);};
    show(grp.indexOf(a));
  });});
})();
