function showSidebar(){
    const sideBar = document.getElementById("sidebar");
    sideBar.style.display = 'flex'
}

function hideSidebar() {
    const sideBar = document.getElementById("sidebar");
    sideBar.style.display = 'none'
}

const navBar = document.getElementById('navbar');
let lastScroll = window.scrollY;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if(currentScroll > lastScroll && currentScroll > 80){
        navBar.classList.add('-translate-y-full');
    }else{
        navBar.classList.remove('-translate-y-full');
    }

    if(currentScroll > 80){
        navBar.classList.add('nav-bar-scrolled', 'shadow-md', 'color-dark')
    }else{
        navBar.classList.remove('nav-bar-scrolled', 'shadow-md', 'color-dark')
    }

    lastScroll = currentScroll
})
const section = document.querySelector('.projects-container');
const strip = document.querySelector('.projects');
const tracker = document.querySelector('.tracker');

for (let i = 1; i <= 9; i++) {
  const img = document.createElement('img');
  img.src = `./assets/project${i}.webp`;
  img.alt = `Dot International project ${i}`;
  img.decoding = 'async';
  tracker.append(img);
}

let pos = 0;
let lastY = window.scrollY;
let factor = 0;
let ticking = false;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const maxScroll = () => Math.max(0, strip.scrollWidth - strip.clientWidth);

const SPEED = 1;
const ENTER = 5;
const EXIT  = 0;

function measure() {
  const vh = window.innerHeight;
  const travel = vh * ENTER - vh * EXIT + section.offsetHeight;
  factor = (maxScroll() / travel) * SPEED;
}

function onFrame() {
  ticking = false;
  const y = window.scrollY;
  const dy = y - lastY;
  lastY = y;

  const vh = window.innerHeight;
  const r = section.getBoundingClientRect();
  const active = r.top < vh * ENTER && r.bottom > vh * EXIT;
  if (!active || dy === 0) return;

  pos = clamp(pos + dy * factor, 0, maxScroll());
  strip.scrollLeft = pos;
}

strip.addEventListener('scroll', () => {
  if (Math.abs(strip.scrollLeft - pos) > 1.5) pos = strip.scrollLeft;
}, { passive: true });


const ro = new ResizeObserver(measure);
ro.observe(strip);
ro.observe(tracker);
ro.observe(section);
window.addEventListener('resize', measure);

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }, { passive: true });
}