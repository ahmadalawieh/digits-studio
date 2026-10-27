import {useLayoutEffect} from 'react';
import {motion, useAnimationControls} from 'framer-motion';
import {EDITORIAL_SPRING} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

export function HeroHeading({ar = false}) {
  const controls = useAnimationControls();
  const reduced = useMotionPreference();
  const lines = ar ? ['اترك', 'بصمتك.'] : ['Make', 'your mark.'];

  // Static output is the finished, readable heading. Only the hydrated island
  // opts into a reveal; unavailable JavaScript never leaves the headline hidden.
  useLayoutEffect(() => {
    const hero = document.querySelector('.launch-hero');
    let active = true;
    hero.dataset.motionEngine = 'framer';
    if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      controls.set({y: '0%'});
      hero.dataset.motionState = 'reduced';
    } else {
      hero.dataset.motionState = 'opening';
      controls.set({y: '112%'});
      controls.start(index => ({
        y: '0%', transition: {...EDITORIAL_SPRING, delay: .12 + index * .14},
      })).then(() => {if (active) hero.dataset.motionState = 'ready';});
    }
    return () => {active = false; controls.stop();};
  }, [controls, reduced]);

  return <h1 className="impact-title">
    {lines.map((line, index) => <span key={line} className={`impact-line ${index ? 'impact-second' : 'impact-first'}`}>
      <span className="impact-mask">
        <motion.span className="impact-word" initial={false} animate={controls} custom={index}>{line}</motion.span>
      </span>
      {index === 0 ? ' ' : null}
    </span>)}
  </h1>;
}
