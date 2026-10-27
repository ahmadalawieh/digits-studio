import {useEffect, useState} from 'react';
import {LayoutGroup, motion} from 'framer-motion';
import {EDITORIAL_SPRING, FILTERS} from '../motion-system.js';
import {useMotionPreference} from '../use-motion-preference.js';

export function ProjectFilters({ar = false}) {
  const [active, setActive] = useState('all');
  const reduced = useMotionPreference();
  useEffect(() => {
    const root = document.querySelector('[data-motion-filters]');
    // Subscribe to the existing filtering controller, including synthetic clicks.
    const synchronize = event => setActive(event.detail.category);
    root.addEventListener('digits:filter-change', synchronize);
    const selected = root.querySelector('[aria-pressed="true"]');
    if (selected) setActive(selected.dataset.projectFilter);
    root.dataset.motionReady = 'true';
    return () => {root.removeEventListener('digits:filter-change', synchronize); delete root.dataset.motionReady;};
  }, []);

  return <LayoutGroup id="digits-project-filters">
    {FILTERS.map(filter => <motion.button key={filter.key} type="button"
      data-project-filter={filter.key} aria-pressed={active === filter.key}
      onClick={() => setActive(filter.key)} initial={false}
      whileTap={reduced ? undefined : {scale: .97}} transition={EDITORIAL_SPRING}>
      {active === filter.key ? <motion.span className="filter-track" data-filter-background=""
        aria-hidden="true" layoutId="active-project-filter" initial={false}
        transition={reduced ? {duration: 0} : EDITORIAL_SPRING}/> : null}
      <span className="filter-label">{ar ? filter.ar : filter.en}</span>{' '}
      <span className="filter-count" aria-hidden="true">{filter.count}</span>
    </motion.button>)}
  </LayoutGroup>;
}
