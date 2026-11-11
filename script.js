const dial = document.querySelector('.dial');
const header = document.querySelector('.profile-page > header');
function updateBarHeight() {
  document.body.style.setProperty('--bar-height', header.getBoundingClientRect().height + 'px');
}
updateBarHeight();
new ResizeObserver(updateBarHeight).observe(header);
const line = dial.querySelector('path');
const links = Array.from(dial.querySelectorAll('a'));
const targets = links.map(link => document.querySelector(link.hash));
const positions = links.map((_, i) => .08 + .84 * i / (links.length - 1));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let bend = 0;
let goal = 0;
let frame = 0;
let current = 0;
let peak = .5;
let targetPeak = .5;

function paint() {
  bend = reducedMotion.matches ? goal : bend + (goal - bend) * .24;
  if (Math.abs(goal - bend) < .002) bend = goal;
  peak = reducedMotion.matches ? targetPeak : peak + (targetPeak - peak) * .3;
  if (Math.abs(targetPeak - peak) < .001) peak = targetPeak;
  dial.style.setProperty('--bend', bend);
  const y = peak * 100;
  // Limit lateral travel near either endpoint so a short segment cannot form a hook.
  const clearance = Math.min(peak, 1 - peak) * dial.clientHeight;
  const reach = line.ownerSVGElement.getBoundingClientRect().width || 1;
  const amplitude = .98 * bend * Math.tanh(clearance / (1.5 * reach));
  const x = 1 + 100 * amplitude;
  line.setAttribute('d', `M 1 0 C 1 ${y / 3} ${x} ${2 * y / 3} ${x} ${y}
    C ${x} ${y + (100 - y) / 3} 1 ${y + 2 * (100 - y) / 3} 1 100`);
  links.forEach((link, i) => {
    const t = positions[i];
    const u = t < peak ? t / peak : (1 - t) / (1 - peak);
    link.style.setProperty('--offset', .01 + amplitude * u * u * (3 - 2 * u));
  });
  frame = bend === goal && peak === targetPeak ? 0 : requestAnimationFrame(paint);
}

function setProximity(value, height = targetPeak) {
  targetPeak = Math.max(.01, Math.min(.99, height));
  goal = value;
  if (!frame && (goal !== bend || targetPeak !== peak)) frame = requestAnimationFrame(paint);
}

function relax() {
  setProximity(dial.querySelector(':focus-visible') ? 1 : 0);
}

window.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || dial.querySelector(':focus-visible')) return;
  const {top, width, height} = dial.getBoundingClientRect();
  if (event.clientY < top) { relax(); return; }
  const t = Math.max(0, Math.min(1, (width + 96 - event.clientX) / 96));
  setProximity(t * t * (3 - 2 * t), (event.clientY - top) / height);
}, {passive:true});
document.documentElement.addEventListener('pointerleave', relax);
window.addEventListener('blur', relax);
dial.addEventListener('focusin', event => {
  const i = links.indexOf(event.target);
  if (i >= 0) setProximity(1, positions[i]);
});
dial.addEventListener('focusout', event => {
  if (!dial.contains(event.relatedTarget)) relax();
});

function trackSection() {
  current = 0;
  targets.forEach((target, i) => {
    if (target.getBoundingClientRect().top <= innerHeight * .32) current = i;
  });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = links.length - 1;
  links.forEach((link, i) => {
    if (i === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

links.forEach((link, i) => {
  link.style.setProperty('--position', positions[i] * 100 + '%');
  link.addEventListener('click', () => {
    targets[i].tabIndex = -1;
    targets[i].focus({preventScroll:true});
    relax();
  });
});

dial.addEventListener('keydown', event => {
  if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const step = event.key === 'ArrowDown' ? 1 : -1;
  const next = (links.indexOf(event.target) + links.length + step) % links.length;
  links[next].focus({preventScroll:true});
});
dial.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') setProximity(1, (event.clientY - dial.getBoundingClientRect().top) / dial.clientHeight);
});
dial.addEventListener('pointercancel', relax);
window.addEventListener('scroll', trackSection, {passive:true});
trackSection();
paint();
