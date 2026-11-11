const dial = document.querySelector('.dial');
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
  const x = 1 + 98 * bend;
  const y = peak * 100;
  // Both quadratic segments meet with a vertical tangent at the pointer height.
  line.setAttribute('d', `M 1 0 Q ${x} ${y / 2} ${x} ${y} Q ${x} ${(100 + y) / 2} 1 100`);
  links.forEach((link, i) => {
    const t = positions[i];
    const distance = t < peak ? (peak - t) / peak : (t - peak) / (1 - peak);
    link.style.setProperty('--offset', .01 + .98 * bend * (1 - distance ** 2));
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
  const width = dial.getBoundingClientRect().width;
  const t = Math.max(0, Math.min(1, (width + 96 - event.clientX) / 96));
  setProximity(t * t * (3 - 2 * t), event.clientY / dial.clientHeight);
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
  if (event.pointerType === 'touch') setProximity(1, event.clientY / dial.clientHeight);
});
dial.addEventListener('pointercancel', relax);
window.addEventListener('scroll', trackSection, {passive:true});
trackSection();
paint();
