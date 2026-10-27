import {hydrateRoot} from 'react-dom/client';
import {HeroHeading} from './components/HeroHeading.jsx';
import {Navigation} from './components/Navigation.jsx';
import {ProjectFilters} from './components/ProjectFilters.jsx';
import {MobileContactDock} from './components/MobileContactDock.jsx';
import {initializeInquiryDelivery} from './inquiry-delivery.js';
import {initializeSiteMeasurement} from './site-measurement.js';
import {enhanceProjectStage, installMotionBridge} from './editorial-effects.js';

const ar = document.documentElement.lang === 'ar';
const islands = [
  ['[data-motion-heading]', HeroHeading],
  ['[data-motion-navigation]', Navigation],
  ['[data-motion-filters]', ProjectFilters],
  ['[data-motion-dock]', MobileContactDock],
];
for (const [selector, Component] of islands) {
  const root = document.querySelector(selector);
  if (root) hydrateRoot(root, <Component ar={ar}/>);
}
installMotionBridge();
enhanceProjectStage();
initializeInquiryDelivery();
initializeSiteMeasurement();
