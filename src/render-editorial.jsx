import {renderToString} from 'react-dom/server';
import {writeFileSync} from 'node:fs';
import {HeroHeading} from './components/HeroHeading.jsx';
import {Navigation} from './components/Navigation.jsx';
import {ProjectFilters} from './components/ProjectFilters.jsx';
import {MobileContactDock} from './components/MobileContactDock.jsx';

const fragments = {};
for (const [name, Component] of [['heading', HeroHeading], ['navigation', Navigation], ['filters', ProjectFilters], ['dock', MobileContactDock]]) {
  fragments[name] = {};
  for (const lang of ['en', 'ar']) fragments[name][lang] = renderToString(<Component ar={lang === 'ar'}/>);
}
writeFileSync('motion-fragments.json', JSON.stringify(fragments, null, 2) + '\n');
console.log('Bilingual hero, navigation and filter fragments rendered.');
