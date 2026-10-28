import {renderToString} from 'react-dom/server';
import {writeFileSync} from 'node:fs';
import {HeroHeading} from './components/HeroHeading.jsx';
import {Navigation} from './components/Navigation.jsx';
import {ProjectFilters} from './components/ProjectFilters.jsx';
import {MobileContactDock} from './components/MobileContactDock.jsx';
import {DeeHero} from './components/DeeHero.jsx';
import {DeeLab} from './components/DeeLab.jsx';

const fragments = {};
for (const [name, Component] of [['heading', HeroHeading], ['navigation', Navigation], ['filters', ProjectFilters], ['dock', MobileContactDock], ['deeHero', DeeHero], ['deeLab', DeeLab]]) {
  fragments[name] = {};
  for (const lang of ['en', 'ar']) fragments[name][lang] = renderToString(<Component ar={lang === 'ar'}/>);
}
writeFileSync('motion-fragments.json', JSON.stringify(fragments, null, 2) + '\n');
console.log('Bilingual editorial UI and DEE fragments rendered.');
