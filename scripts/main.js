document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.querySelector('.menu-toggle');
  const nav=document.querySelector('.main-nav');
  if(menu){menu.addEventListener('click',()=>{
    const expanded=menu.getAttribute('aria-expanded')==='true';
    menu.setAttribute('aria-expanded',!expanded);
    nav.style.display = expanded ? null : 'block';
  })}
  // Manage WhatsApp link for mobile nav (inject/remove on load and resize)
  const whatsappHTML = '<a class="btn outline whatsapp-link" href="https://whatsapp.com/channel/0029VbBdF4hLI8YZRabyWF0j" target="_blank" rel="noopener">Join WhatsApp Channel</a>';
  const navCtaContainer = document.querySelector('.main-nav .nav-cta');
  const navContainer = document.querySelector('.main-nav');
  function updateWhatsAppLink(){
    const container = navCtaContainer || navContainer;
    if(!container) return;
    const exists = !!document.querySelector('.main-nav .whatsapp-link');
    if(window.innerWidth < 720){
      if(!exists){ container.insertAdjacentHTML('beforeend', whatsappHTML); }
    } else {
      if(exists){ const el = document.querySelector('.main-nav .whatsapp-link'); el && el.remove(); }
    }
  }
  // Debounced resize handler
  let resizeTimer = null;
  window.addEventListener('resize', ()=>{
    if(resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{ updateWhatsAppLink(); }, 150);
  });
  updateWhatsAppLink();

  // Header transparent -> solid on scroll
  const header = document.querySelector('.site-header');
  const onScroll = ()=>{
    if(window.scrollY>20){ header.classList.add('solid'); header.classList.remove('transparent'); }
    else { header.classList.remove('solid'); header.classList.add('transparent'); }
  };
  onScroll();
  window.addEventListener('scroll', onScroll);
});
// Smooth scroll offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const href=this.getAttribute('href');
    if(href.length>1 && href.startsWith('#')){
      const el=document.querySelector(href);
      if(el){
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({top,behavior:'smooth'});
        // close mobile nav
        const menu=document.querySelector('.menu-toggle');
        const nav=document.querySelector('.main-nav');
        if(menu && window.getComputedStyle(menu).display!=='none'){
          menu.setAttribute('aria-expanded','false');
          nav.style.display='none';
        }
      }
    }
  })
});

// Accordion
document.addEventListener('click', (e)=>{
  if(e.target.classList && e.target.classList.contains('acc-toggle')){
    const panel=e.target.nextElementSibling;
    const open = panel.style.maxHeight && panel.style.maxHeight !== '0px';
    document.querySelectorAll('.acc-panel').forEach(p=>p.style.maxHeight=null);
    if(!open){
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  }
});

// Registration countdown removed (was initWebinarCountdown)

// Sticky register button visibility
function initStickyRegister(){
  const sticky = document.getElementById('sticky-register');
  const hero = document.getElementById('home');
  if(!sticky || !hero) return;

  function onScroll(){
    const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
    if(window.scrollY > heroBottom){
      sticky.setAttribute('aria-hidden','false');
      sticky.classList.add('visible');
    } else {
      sticky.setAttribute('aria-hidden','true');
      sticky.classList.remove('visible');
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll);
}

// Initialize optional features after DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  try{ initStickyRegister(); }catch(e){}
});

// Question submission countdown removed (was initQuestionCountdown)

function handleNewsletterSubmit(e){
  e.preventDefault();
  const form=document.getElementById('newsletter-form');
  const firstName=form.firstName.value.trim();
  const email=form.email.value.trim();
  const msg=document.getElementById('formMessage');
  const submitBtn=document.getElementById('submitBtn');

  if(!firstName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
    msg.textContent='Please provide a valid name and email.';
    msg.style.color='red';
    return false;
  }

  submitBtn.disabled=true; submitBtn.textContent='Sending...';

  // Post to Netlify forms endpoint
  const data=new FormData(form);

  fetch('/',{method:'POST',body:data}).then(()=>{
    // also call Netlify function to send welcome email via Resend
    fetch('/.netlify/functions/send-welcome-email',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({firstName, email})
    }).catch(()=>{/* non-blocking */});

    msg.textContent='Thanks for joining DAHI! Check your email.';
    msg.style.color='green';
    form.reset();
    submitBtn.disabled=false; submitBtn.textContent='Subscribe';
  }).catch(err=>{
    msg.textContent='Submission failed. Please try again.';
    msg.style.color='red';
    submitBtn.disabled=false; submitBtn.textContent='Subscribe';
  });

  return false;
}

// Keyboard support: close nav with Escape
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    const menu=document.querySelector('.menu-toggle');
    const nav=document.querySelector('.main-nav');
    if(menu && nav){ menu.setAttribute('aria-expanded','false'); nav.style.display='none'; }
  }
});
