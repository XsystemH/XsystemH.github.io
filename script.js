const dial = document.querySelector('.dial');
const handle = dial.querySelector('button');
const panel = document.getElementById('dial-links');
const links = Array.from(panel.querySelectorAll('a'));
const targets = links.map(link => document.querySelector(link.hash));
let selected = 0;
let current = 0;
let timer;
let lastWheel = 0;
let touchY = null;

function draw() {
  links.forEach((link, i) => {
    const count = links.length;
    const offset = (i - selected + count * 1.5) % count - count / 2;
    const angle = offset * Math.PI / 7;
    link.style.setProperty('--x', (8 + 94 * (1 - Math.cos(angle))) + 'px');
    link.style.setProperty('--y', (125 * Math.sin(angle)) + 'px');
    link.toggleAttribute('data-selected', i === selected);
    if (i === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function closeDial() {
  clearTimeout(timer);
  panel.hidden = true;
  dial.classList.remove('open');
  handle.setAttribute('aria-expanded', 'false');
  handle.textContent = '‹';
}

function delayClose(ms = 2600) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (!dial.querySelector(':focus-visible')) closeDial();
  }, ms);
}

function openDial() {
  if (panel.hidden) selected = current;
  panel.hidden = false;
  dial.classList.add('open');
  handle.setAttribute('aria-expanded', 'true');
  handle.textContent = '›';
  draw();
  delayClose();
}

function turn(step) {
  selected = (selected + step + links.length) % links.length;
  draw();
  delayClose();
}

function trackSection() {
  current = 0;
  targets.forEach((target, i) => {
    if (target.getBoundingClientRect().top <= innerHeight * .32) current = i;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = links.length - 1;
  selected = current;
  draw();
}
dial.hidden = false;
trackSection();
window.addEventListener('scroll', trackSection, {passive:true});
handle.addEventListener('click', () => panel.hidden ? openDial() : closeDial());
handle.addEventListener('focus', () => { if (handle.matches(':focus-visible')) openDial(); });
dial.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') openDial(); });
dial.addEventListener('pointerleave', () => delayClose(550));
dial.addEventListener('focusout', event => { if (!dial.contains(event.relatedTarget)) delayClose(300); });
document.addEventListener('pointerdown', event => { if (!dial.contains(event.target)) closeDial(); });
panel.addEventListener('wheel', event => {
  event.preventDefault();
  if (event.deltaY && performance.now() - lastWheel > 130) {
    turn(Math.sign(event.deltaY));
    lastWheel = performance.now();
  }
}, {passive:false});
panel.addEventListener('touchstart', event => { touchY = event.touches[0].clientY; }, {passive:true});
panel.addEventListener('touchmove', event => {
  const y = event.touches[0].clientY;
  if (touchY !== null && Math.abs(touchY - y) > 23) {
    event.preventDefault();
    turn(Math.sign(touchY - y));
    touchY = y;
  }
}, {passive:false});
dial.addEventListener('keydown', event => {
  if (event.key === 'Escape') { handle.focus(); closeDial(); }
  if (['ArrowDown','ArrowUp'].includes(event.key)) {
    event.preventDefault();
    openDial();
    turn(event.key === 'ArrowDown' ? 1 : -1);
    links[selected].focus({preventScroll:true});
  }
});
links.forEach((link,i) => link.addEventListener('click', () => {
  targets[i].tabIndex = -1;
  targets[i].focus({preventScroll:true});
  closeDial();
}));
