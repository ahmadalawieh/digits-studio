import {animate} from 'framer-motion';
import {EDITORIAL_SPRING} from './motion-system.js';

const transitions = new WeakMap();
const activeElements = new Set();
function springElement(element, keyframes) {
  transitions.get(element)?.stop();
  const controls = animate(element, keyframes, EDITORIAL_SPRING);
  transitions.set(element, controls);
  activeElements.add(element);
  controls.finished.then(() => {
    if (transitions.get(element) !== controls) return;
    element.style.removeProperty('transform'); element.style.removeProperty('opacity');
    transitions.delete(element);
    activeElements.delete(element);
  });
}

export function installMotionBridge() {
  const resetElement = element => {
    transitions.get(element)?.stop(); transitions.delete(element); activeElements.delete(element);
    animate(element, {x: 0, y: 0, scale: 1, opacity: 1}, {duration: 0});
  };
  window.digitsMotion = {
    projectImage: image => springElement(image, {x: [16, 0], scale: [1.025, 1], opacity: [.5, 1]}),
    // A filtered-out row can be several screens away. Keep the response local
    // to the work canvas instead of flying those old positions across the page.
    projectCard: (card, offset) => springElement(card, {
      x: [Math.max(-80, Math.min(80, offset.x)), 0],
      y: [Math.max(-100, Math.min(100, offset.y)), 0], opacity: [.65, 1],
    }),
    resetImage: resetElement,
  };
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
    if(event.matches)for(const element of activeElements)resetElement(element);
  });
}

export function enhanceProjectStage() {
  const hero = document.querySelector('.launch-hero'), stack = hero.querySelector('.impact-stack');
  const frame = stack.querySelector('.reel-link'), cta = hero.querySelector('.impact-cta');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let arrival, tilt, frameMotion, ctaMotion, frameRequest;
  function reset() {
    arrival?.stop(); tilt?.stop(); frameMotion?.stop(); ctaMotion?.stop(); cancelAnimationFrame(frameRequest);
    for (const element of [stack, frame, cta]) {
      element.style.removeProperty('transform'); element.style.removeProperty('opacity');
    }
    for (const corner of ['border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius']) frame.style.removeProperty(corner);
    // Reset Motion's cached values too: a queued render must not restore a tilt
    // after the user's reduced-motion setting has already stopped the spring.
    animate(stack, {x: 0, y: 0, rotateX: 0, rotateY: 0, opacity: 1}, {duration: 0});
    animate(frame, {scale: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24}, {duration: 0});
    animate(cta, {x: 0, y: 0}, {duration: 0});
  }
  function arrivalMotion() {
    reset();
    if (!preference.matches) arrival = animate(stack, {y: [28, 0], opacity: [0, 1]}, {...EDITORIAL_SPRING, delay: .3});
  }
  function move(event) {
    if (preference.matches || !pointer.matches || hero.dataset.motionState !== 'ready') return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(() => {tilt = animate(stack, {x: x * 12, y: y * 10, rotateX: -y * 3, rotateY: x * 4}, EDITORIAL_SPRING);});
  }
  function leave() {
    cancelAnimationFrame(frameRequest);
    if (!preference.matches) tilt = animate(stack, {x: 0, y: 0, rotateX: 0, rotateY: 0}, EDITORIAL_SPRING);
  }
  function frameEnter() {
    if (preference.matches) return;
    frameMotion = animate(frame, {scale: 1.015, borderTopLeftRadius: 38, borderTopRightRadius: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 38}, EDITORIAL_SPRING);
  }
  function frameLeave() {
    if (preference.matches) return;
    frameMotion = animate(frame, {scale: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24}, EDITORIAL_SPRING);
  }
  function ctaMove(event) {
    if (preference.matches || !pointer.matches) return;
    const rect = cta.getBoundingClientRect();
    ctaMotion = animate(cta, {x: (event.clientX - rect.left - rect.width / 2) * .12, y: (event.clientY - rect.top - rect.height / 2) * .15}, EDITORIAL_SPRING);
  }
  function ctaLeave() {if (!preference.matches) ctaMotion = animate(cta, {x: 0, y: 0}, EDITORIAL_SPRING);}
  hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
  frame.addEventListener('pointerenter', frameEnter); frame.addEventListener('pointerleave', frameLeave);
  frame.addEventListener('focus', frameEnter); frame.addEventListener('blur', frameLeave);
  cta.addEventListener('pointermove', ctaMove); cta.addEventListener('pointerleave', ctaLeave);
  preference.addEventListener('change', arrivalMotion); pointer.addEventListener('change', reset);
  arrivalMotion();
}
