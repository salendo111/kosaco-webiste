(function(){
  // Neue Seite immer oben beginnen (außer bei Sprungmarken wie #hochbau)
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
  function top(){
    if(location.hash) return;
    window.scrollTo(0,0);
    // scrollt auch übergeordnete Rahmen (z. B. eingebettete Vorschau) nach oben
    try{ (document.body||document.documentElement).scrollIntoView({block:'start',behavior:'auto'}); }catch(e){}
  }
  top();
  document.addEventListener('DOMContentLoaded',top);
  window.addEventListener('load',function(){ top(); setTimeout(top,120); });
  window.addEventListener('pageshow',top);
})();
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav=document.getElementById('nav'), btn=document.getElementById('menuBtn');
  if(btn&&nav){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));btn.textContent=o?'Schließen':'Menü';});}

  // Seitenwechsel: Paneel schließt sich, dann Navigation
  var pt=document.querySelector('.pt');
  if(pt){ pt.addEventListener('animationend',function(e){ if(e.target===pt&&!pt.classList.contains('leaving')) pt.style.visibility='hidden'; }); 
    setTimeout(function(){ if(!pt.classList.contains('leaving')) pt.style.visibility='hidden'; },2000); }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a||reduce||!pt) return;
    var h=a.getAttribute('href')||'';
    if(!/\.html(#.*)?$/.test(h)||a.target||e.metaKey||e.ctrlKey||e.shiftKey) return;
    var here=location.pathname.split('/').pop()||'index.html';
    if(h.split('#')[0]===here) return;
    e.preventDefault(); pt.style.visibility='visible'; pt.classList.add('leaving');
    setTimeout(function(){ location.href=h; },340);
  });
  window.addEventListener('pageshow',function(e){ if(e.persisted&&pt){pt.classList.remove('leaving');pt.style.visibility='hidden';} });

  // Scroll-Reveal nur für Elemente unterhalb des ersten Bildschirms
  var sel='.svc,.stat,.value,.process,.tile,.detail,.timeline li,.tasks li,form.quote,.c-row,.band h2,.regions,.sec-head,.split > .stack';
  var els=[].slice.call(document.querySelectorAll(sel));
  if(!reduce&&'IntersectionObserver' in window){
    var vh=window.innerHeight;
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}})},{rootMargin:'0px 0px -8% 0px'});
    var groups=new Map();
    els.forEach(function(el){
      if(el.getBoundingClientRect().top<vh) return;
      var p=el.parentElement, i=groups.get(p)||0; groups.set(p,i+1);
      el.style.transitionDelay=Math.min(i,5)*90+'ms';
      if(el.matches('.timeline li,.tasks li')) el.classList.add('rv-l');
      el.classList.add('rv'); io.observe(el);
    });
    setTimeout(function(){els.forEach(function(el){el.classList.add('in')})},9000);
  }

  // Zähler
  var counters=[].slice.call(document.querySelectorAll('[data-count]'));
  function run(el){
    var end=+el.getAttribute('data-count'), suf=el.textContent.replace(/^[\d.]+/,''), t0=null, dur=1400;
    function f(t){t0=t0||t;var k=Math.min((t-t0)/dur,1),v=Math.round(end*(1-Math.pow(1-k,3)));el.textContent=v+suf;if(k<1)requestAnimationFrame(f);}
    requestAnimationFrame(f);
  }
  if(!reduce&&'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){co.unobserve(x.target);setTimeout(function(){run(x.target)},x.target.closest('.badge')?2300:200);}})});
    counters.forEach(function(c){co.observe(c)});
  }

  // Lichtkegel folgt der Maus über die ganze Startseite
  var glow=document.querySelector('.glow');
  if(glow&&!reduce&&window.matchMedia('(hover:hover)').matches){
    window.addEventListener('mousemove',function(e){
      glow.style.setProperty('--mx',e.clientX+'px');glow.style.setProperty('--my',e.clientY+'px');},{passive:true});
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

  // Formular (Web3Forms: Access Key von web3forms.com, öffentlich und für info@kosaco.de angelegt)
  var WEB3FORMS_KEY='84f40315-cc17-478b-b3b4-3a95e2a5d430';
  var form=document.getElementById('quote'), msg=document.getElementById('formMsg');
  if(form){form.addEventListener('submit',function(e){
    e.preventDefault();msg.hidden=false;
    var n=document.getElementById('f-name').value.trim(),m=document.getElementById('f-mail').value.trim(),ok=document.getElementById('f-dsgvo').checked;
    if(!n||!/.+@.+\..+/.test(m)){msg.style.color='#B7791F';msg.textContent='Bitte Name und eine gültige E-Mail-Adresse eintragen.';return;}
    if(!ok){msg.style.color='#B7791F';msg.textContent='Bitte stimmen Sie der Datenverarbeitung zu.';return;}
    var sv=[].map.call(form.querySelectorAll('[data-service]:checked'),function(c){return c.parentNode.textContent.trim();});
    var btn=form.querySelector('button[type=submit]');
    var data={access_key:WEB3FORMS_KEY,subject:'Neue Anfrage über kosaco.de',from_name:'Kosaco Website',
      name:n,email:m,telefon:document.getElementById('f-phone').value.trim(),ort:document.getElementById('f-plz').value.trim(),
      leistungen:sv.join(', ')||'keine Auswahl',nachricht:document.getElementById('f-msg').value.trim(),botcheck:''};
    if(!WEB3FORMS_KEY||WEB3FORMS_KEY.indexOf('HIER')===0){msg.style.color='#B7791F';msg.textContent='Das Formular ist noch nicht freigeschaltet. Bitte rufen Sie uns an oder schreiben Sie an info@kosaco.de.';return;}
    btn.disabled=true;msg.style.color='';msg.textContent='Wird gesendet …';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json();})
      .then(function(r){
        if(r.success){msg.style.color='';msg.textContent='Danke, '+n+'! Ihre Anfrage ist bei uns angekommen. Wir melden uns schnellstmöglich.';form.reset();}
        else{throw new Error(r.message);}
      })
      .catch(function(){msg.style.color='#B7791F';msg.textContent='Das Senden hat leider nicht geklappt. Bitte rufen Sie uns an (+49 1578 0608138) oder schreiben Sie an info@kosaco.de.';})
      .then(function(){btn.disabled=false;});
  });}
})();

// ===== Durchgehende Trasse im Hintergrund + Höhenlinien-Parallaxe =====
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS='http://www.w3.org/2000/svg', svg=null, run=null, nodes=[], y0=0, y1=0, len=1;
  var file=(location.pathname.split('/').pop()||'').replace('.html',''); 
  var page={'ueber-uns':'about','leistungen':'services','kontakt':'contact','impressum':'imprint','datenschutz':'privacy'}[file]||'home';
  document.documentElement.setAttribute('data-page',page);
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e;}
  function build(){
    if(svg&&svg.parentNode) svg.parentNode.removeChild(svg);
    svg=null; run=null; nodes=[]; rul=null;
        if(page!=='home') return;
    var main=document.querySelector('main'), foot=document.querySelector('footer.site'); if(!main||!foot) return;
    var sy=window.pageYOffset, W=document.documentElement.clientWidth, H=document.documentElement.scrollHeight;
    var wrap=main.querySelector('section .wrap')||document.querySelector('.wrap');
    var left=wrap.getBoundingClientRect().left;
    var x=Math.max(12,Math.min(left-30,left-14)); if(left<40) x=(W<=700?6:9);
    var pts=[]; 
    [].forEach.call(main.querySelectorAll('section .eyebrow, .band h2'),function(e){
      var r=e.getBoundingClientRect(); pts.push(r.top+sy+r.height/2);
    });
    var first=main.querySelector('section'); var topY=(first.getBoundingClientRect().top+sy)+10;
    var endY=foot.getBoundingClientRect().top+sy;
    pts=pts.filter(function(y){return y>topY+30&&y<endY-30;});
    y0=topY; y1=endY;
    // Pfad mit sanften Versätzen zwischen den Knoten
    var d='M'+x+' '+y0, cx=x, prev=y0, off=(W<=700?[0]:[0,12,0,-6]);
    pts.forEach(function(y,i){
      var nx=x+off[i%off.length], m=(prev+y)/2;
      d+=' C'+cx+' '+m+' '+nx+' '+m+' '+nx+' '+y; cx=nx; prev=y;
    });
    var ex=x; d+=' C'+cx+' '+((prev+y1)/2)+' '+ex+' '+((prev+y1)/2)+' '+ex+' '+y1;
    svg=el('svg',{id:'trasse-bg',width:W,height:H,viewBox:'0 0 '+W+' '+H,'aria-hidden':'true'});
    var base=el('path',{d:d,'class':'tb-base'}), r=el('path',{d:d,'class':'tb-run'});
    svg.appendChild(base); svg.appendChild(r); run=r; len=r.getTotalLength?0:1;
    nodes=[]; cx=x;
    pts.forEach(function(y,i){
      var nx=x+off[i%off.length];
      svg.appendChild(el('path',{d:'M'+nx+' '+y+'H'+(nx+16),'class':'tb-stub'}));
      var ns=(W<=700?9:12); var n=el('rect',{x:nx-ns/2,y:y-ns/2,width:ns,height:ns,'class':'tb-node'}); svg.appendChild(n); nodes.push({el:n,y:y});
    });
    svg.appendChild(el('rect',{x:x-9,y:y1-9,width:18,height:18,'class':'tb-end'}));
    document.body.appendChild(svg);
    len=run.getTotalLength(); run.style.strokeDasharray=len; 
    update();
  }

  function buildBundle(){
    var main=document.querySelector('main'), foot=document.querySelector('footer.site'); if(!main||!foot) return;
    var sy=window.pageYOffset, W=document.documentElement.clientWidth, H=document.documentElement.scrollHeight;
    var wrap=main.querySelector('section .wrap'); var right=wrap.getBoundingClientRect().right;
    var x=(W-right<44)?W-14:Math.min(W-22,right+34), sp=(W-right<44)?5:8;
    var heads=[].slice.call(main.querySelectorAll('.detail h2')).map(function(e){var r=e.getBoundingClientRect();return r.top+sy+r.height/2;});
    var first=main.querySelector('section'); y0=first.getBoundingClientRect().top+sy+10; y1=foot.getBoundingClientRect().top+sy;
    svg=el('svg',{id:'trasse-bg',width:W,height:H,viewBox:'0 0 '+W+' '+H,'aria-hidden':'true'});
    [-sp,sp].forEach(function(o,i){ svg.appendChild(el('path',{d:'M'+(x+o)+' '+y0+'V'+y1,'class':i?'tb-pipe2':'tb-pipe1'})); });
    var d='M'+x+' '+y0+'V'+y1;
    svg.appendChild(el('path',{d:d,'class':'tb-base'})); run=el('path',{d:d,'class':'tb-run'}); svg.appendChild(run);
    heads.forEach(function(y){
      svg.appendChild(el('path',{d:'M'+(x-sp-2)+' '+y+'H'+(x-sp-20),'class':'tb-stub'}));
      var n=el('rect',{x:x-6,y:y-6,width:12,height:12,'class':'tb-node'}); svg.appendChild(n); nodes.push({el:n,y:y});
    });
    svg.appendChild(el('rect',{x:x-9,y:y1-9,width:18,height:18,'class':'tb-end'}));
    document.body.appendChild(svg); len=run.getTotalLength(); run.style.strokeDasharray=len; update();
  }

  var rul=null;
  function buildRuler(){
    var foot=document.querySelector('footer.site'); if(!foot) return;
    var W=document.documentElement.clientWidth, H=document.documentElement.scrollHeight, sy=window.pageYOffset;
    var wrap=document.querySelector('main section .wrap'), left=wrap.getBoundingClientRect().left;
    var rw=Math.max(10,Math.min(28,left-14)), small=rw<20, end=foot.getBoundingClientRect().top+sy; y1=end; y0=0;
    svg=el('svg',{id:'trasse-bg',width:W,height:H,viewBox:'0 0 '+W+' '+H,'aria-hidden':'true'});
    svg.appendChild(el('rect',{x:0,y:0,width:rw,height:end,'class':'rl-band'}));
    var prog=el('rect',{x:0,y:0,width:rw,height:0,'class':'rl-prog'}); svg.appendChild(prog);
    var d='';
    for(var y=0;y<=end;y+=10){ var m=(y%100===0), h=m?rw*0.9:(y%50===0?rw*0.6:rw*0.35); d+='M'+rw+' '+y+'H'+(rw-h); }
    svg.appendChild(el('path',{d:d,'class':'rl-ticks'}));
    svg.appendChild(el('path',{d:'M'+rw+' 0V'+end,'class':'rl-edge'}));
    if(!small){ for(var yy=100;yy<=end;yy+=100){ var t=el('text',{x:rw+6,y:yy+3,'class':'rl-num'}); t.textContent=(yy/100); svg.appendChild(t); } }
    var mark=el('g',{'class':'rl-mark'}); mark.appendChild(el('path',{d:'M'+(rw+1)+' 0l9 -6v12z','class':'rl-tri'}));
    var lbl=el('text',{x:rw+14,y:4,'class':'rl-lbl'}); mark.appendChild(lbl); svg.appendChild(mark);
    document.body.appendChild(svg); rul={prog:prog,mark:mark,lbl:lbl,small:small}; update();
  }
  function update(){
    var sy=window.pageYOffset, vh=window.innerHeight;
    document.documentElement.style.setProperty('--py',(-(sy*0.12))+'px');
    if(rul){ var c=Math.min(y1,sy+vh*0.5); rul.prog.setAttribute('height',c); rul.mark.setAttribute('transform','translate(0 '+c+')'); if(!rul.small) rul.lbl.textContent=Math.round(c/100)+' m'; return; }
    if(!run) return;
    var cur=sy+vh*0.62, p=reduce?1:Math.max(0,Math.min(1,(cur-y0)/(y1-y0)));
    run.style.strokeDashoffset=len*(1-p);
    nodes.forEach(function(n){ n.el.classList.toggle('on',reduce||cur>=n.y); });
  }
  var tk=false; window.addEventListener('scroll',function(){ if(!tk){tk=true;requestAnimationFrame(function(){tk=false;update();});} },{passive:true});
  var t; function rebuild(){clearTimeout(t);t=setTimeout(build,150);}
  window.addEventListener('resize',rebuild); window.addEventListener('load',function(){build();setTimeout(build,700);});
  if(document.readyState==='complete') build();
  if('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
})();
