(function(){const tools=document.querySelector('.nav-tools');const trigger=document.querySelector('.nav-tools-trigger');if(!tools||!trigger)return;function close(){tools.classList.remove('is-open');trigger.setAttribute('aria-expanded','false')}trigger.addEventListener('click',function(event){event.stopPropagation();const open=tools.classList.toggle('is-open');trigger.setAttribute('aria-expanded',String(open))});document.addEventListener('click',function(event){if(!tools.contains(event.target))close()});document.addEventListener('keydown',function(event){if(event.key==='Escape'){close();trigger.focus()}})})();
const navigation=document.querySelector(".nav"),menu=document.querySelector(".nav-links");
const floatingLine = document.querySelector('.line-float');
    const hero = document.querySelector('.hero');
    const mobileFloat = matchMedia('(max-width:640px)');
    let heroVisible = true;
    let floatFrame = 0;
    function overlaps(a,b) { return a.left < b.right + 8 && a.right > b.left - 8 && a.top < b.bottom + 8 && a.bottom > b.top - 8; }
    function placeFloat() {
      floatFrame = 0;
      if ((mobileFloat.matches && heroVisible) || menu.classList.contains('is-open')) { floatingLine.classList.remove('is-visible'); return; }
      const box = floatingLine.getBoundingClientRect();
      const previousOffset = parseFloat(floatingLine.style.getPropertyValue('--float-offset')) || (mobileFloat.matches ? 14 : 28);
      const safeBottom = Math.max(0, innerHeight - box.bottom - previousOffset);
      const obstacles = [];
      document.querySelectorAll('main h1, main h2, main h3, main p, main a, main li, main th, main td, .hero-portrait, footer p, footer a').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight || rect.right < box.left - 8) return;
        if (element.matches('a, .hero-portrait')) { obstacles.push(rect); return; }
        const range = document.createRange(); range.selectNodeContents(element);
        for (const line of range.getClientRects()) if (line.bottom > 0 && line.top < innerHeight) obstacles.push(line);
      });
      const base = mobileFloat.matches ? 14 : 28;
      const maxOffset = innerHeight - navigation.getBoundingClientRect().bottom - box.height - 20;
      for (let offset = base; offset <= maxOffset; offset += 8) {
        const candidate = {left:box.left,right:box.right,bottom:innerHeight-safeBottom-offset,top:innerHeight-safeBottom-offset-box.height};
        if (candidate.top < navigation.getBoundingClientRect().bottom + 12 || obstacles.some(rect => overlaps(candidate,rect))) continue;
        floatingLine.style.setProperty('--float-offset',offset+'px');
        floatingLine.classList.add('is-visible'); return;
      }
      floatingLine.classList.remove('is-visible');
    }
    function scheduleFloat() { if (!floatFrame) floatFrame = requestAnimationFrame(placeFloat); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; scheduleFloat(); }, {threshold:.05}).observe(hero);
    } else {
      window.addEventListener('scroll', () => { const rect = hero.getBoundingClientRect(); heroVisible = rect.bottom > 0 && rect.top < innerHeight; }, {passive:true});
    }
    window.addEventListener('scroll',scheduleFloat,{passive:true});
    window.addEventListener('resize',scheduleFloat);
    window.addEventListener('load',scheduleFloat);
    document.fonts.ready.then(scheduleFloat);
    scheduleFloat();
  
document.querySelectorAll('[data-icon-fallback], .line-float img').forEach(image => {
  function failed() {
    if (image.dataset.iconFallback && !image.dataset.fallbackUsed) {
      image.dataset.fallbackUsed='true'; image.src=image.dataset.iconFallback; return;
    }
    const label=document.createElement('span'); label.className='icon-fallback';
    const name=image.closest('a').getAttribute('aria-label');
    label.textContent=({Instagram:'IG',Facebook:'FB',Threads:'TH'})[name] || 'LINE';
    image.replaceWith(label);
  }
  image.addEventListener('error',failed);
  if(image.complete && !image.naturalWidth)failed();
});