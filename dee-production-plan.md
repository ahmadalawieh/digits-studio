# DEE scroll opening / production integration

November 2, 2026. The user approved the four-scene design and revised DEE gestures, then explicitly requested integrating and publishing the completed website.

Retain #06070B ink, #FDFDFD paper, #FFDA46 yellow, #292A32 charcoal and #6A6E79 slate. Keep Inter/Playfair for English and Alexandria for Arabic. Adapt the approved full-screen composition to the existing bilingual pages and navigation, then flow directly into the seven-project portfolio and services. Opening and final scene offer same-page contact actions; the story always offers a direct route to projects.

Preserve the static generator, React islands, native filters with layoutId, Arabic routes, inquiries, archive films, DEE demonstration and social footer. The old hero is replaced, not layered behind the new one. Scope all journey CSS to avoid changing the existing sections. Remove study-only labels and external self-links from the public experience.

Use Framer Motion for the animation clock, shared 190/24/1 springs, masked headline reveal and story controls. Three.js only renders the approved native geometry and articulated rig. Build it as a separate deferred ES module, so the initial UI bundle does not include the renderer. Render stills of that same model for the first paint and static/WebGL fallback. Pause the renderer offscreen/in background; preserve live reduced-motion changes and full content without JavaScript. Reserve the complete story height before hydration to avoid moving following sections.

Verify EN/AR from short phones through tablets and desktop; inspect landscape, pointing direction, canvas/text separation, gesture liveness, filter counts/destinations, native menu, inquiry review, no-JS/blocked-bundle/reduced-motion/WebGL failure, console/network errors and accessibility. Build production, review the staged diff and publish only this website change. Preserve all unrelated local social-content folders.
## Completed validation

The production opening passed 20 browser checks: all four scenes at 320×568, 375×667, 390×844, 667×375, 768×950 and 1440×950 in both languages; real projected gestures, stationary-character frame changes, pause/navigation, orientation, live reduced-motion changes, header/text separation, filters, same-page conversion links, no-JavaScript, unavailable UI/renderer/WebGL and reduced-motion accessibility scans. Existing inquiry/dock/film checks passed all 14 scenarios; inquiry handler unit checks passed without a real delivery. Production npm run build passed. A DOM comparison confirmed the existing portfolio, services, studio, inquiry, footer, navigation and DEE demonstration are unchanged in both languages. Evidence is under qa/dee-production and qa/enhancements.

Twelve additional pixel/contrast checks passed for both light scenes in EN/AR on phone, tablet and desktop, including normal-motion WCAG A/AA scans.
