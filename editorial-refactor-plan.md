# Editorial refactor / phase one

Source: `../DESIGN.md`, supplied by Ahmad, 27 October 2026.

Tokens: off-chalk #FDFDFD, ink canvas #06070B, primary #0E1015, secondary #6A6E79, structural #111111, inverse #FFFFFF. Inter handles navigation and interface text; Playfair Display gives the English hero its editorial voice. The connected Arabic headline retains locally hosted IBM Plex Sans Arabic, with independent metrics and no character splitting.

The opening is a dark, spacious editorial canvas. A restrained floating navigation sits above two oversized lines, with a project frame offset beside the type. Supporting copy and actions stay beside the statement rather than forming another uniform horizontal strip. Project filtering sits on off-chalk with a shared, sliding ink capsule. Existing copy, seven projects, categories, paths and inquiry composition stay intact.

```
          [logo     navigation     language / contact]
 studio / location
 Make                  [ selected project frame ]
 your mark.            [ caption / reel controls ]
 supporting copy
 contact / work
 ───────────────────── off-chalk work section
 [All] [Branding] [Websites] [Marketing]
```

Motion: Framer Motion, shared spring `{type: 'spring', stiffness: 190, damping: 24, mass: 1}`. A semantic heading contains two nested clipping layers per line; complete Arabic words rise together. Project pills use an actual `layoutId` rather than a manually positioned imitation. Native route/menu/filter/inquiry behavior is kept outside the motion layer. React islands are server rendered before hydration, so blocked JavaScript does not remove content or navigation.

Critique before implementation: the previous all-yellow poster and tilted fan competed with the work. Replace that fan with a single deep project frame; use type and negative space as the main expression. Avoid a dashboard-like card grid and decorative statistics. On small screens the frame follows the copy in normal flow. Reduced motion renders the finished composition and removes spring transitions. This phase targets hero, navigation and filter UI; existing project content and service/contact behavior remain authoritative.
