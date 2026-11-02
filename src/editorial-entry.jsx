import {hydrateRoot} from 'react-dom/client';
import {Navigation} from './components/Navigation.jsx';
import {ProjectFilters} from './components/ProjectFilters.jsx';
import {MobileContactDock} from './components/MobileContactDock.jsx';
import {DeeJourney} from './components/DeeJourney.jsx';
import {DeeLab} from './components/DeeLab.jsx';
import {initializeInquiryDelivery} from './inquiry-delivery.js';
import {initializeSiteMeasurement} from './site-measurement.js';
import {enhanceProjectStage, installMotionBridge} from './editorial-effects.js';

const ar = document.documentElement.lang === 'ar';
const islands = [
  ['[data-motion-navigation]', Navigation],
  ['[data-motion-filters]', ProjectFilters],
  ['[data-motion-dock]', MobileContactDock],
  ['[data-motion-dee-journey]', DeeJourney],
  ['[data-motion-dee-lab]', DeeLab],
];
for (const [selector, Component] of islands) {
  const root = document.querySelector(selector);
  if (root) hydrateRoot(root, <Component ar={ar}/>);
}
installMotionBridge();
enhanceProjectStage();
initializeInquiryDelivery();
initializeSiteMeasurement();
