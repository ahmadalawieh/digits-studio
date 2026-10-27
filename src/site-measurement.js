import {inject} from '@vercel/analytics';
import {injectSpeedInsights} from '@vercel/speed-insights';

export function initializeSiteMeasurement(){
  if(navigator.webdriver||!['digitsstudio.online','www.digitsstudio.online'].includes(location.hostname))return;
  const beforeSend=event=>{
    if(event.url){const url=new URL(event.url);event.url=url.origin+url.pathname;}
    return event;
  };
  inject({mode:'production',beforeSend});
  injectSpeedInsights({beforeSend});
}
