# Full studio revamp / November 3, 2026

The approved DEE opening stays. Extend its visual language through the entire homepage, preserving all bilingual copy, seven projects, category destinations, inquiries, demo controls and social links.

Tokens: ink #06070B, paper #FDFDFD, yellow #FFDA46, charcoal #292A32, slate #6A6E79. Inter supplies functional text; Playfair supplies oversized English statements; Alexandria supplies readable Arabic at a separate line-height/scale. No new photos or fabricated client evidence.

Composition: paper portfolio with widescreen features alternating with an unequal two-project pairing; ink services with oversized native accordion headings and spring-driven draggable example reels; yellow studio statement with the actual brand symbol; paper process with a stepped three-part sequence; ink DEE demonstration; paper FAQ; yellow contact invitation beside a clearly separated paper inquiry form; ink footer ending in a full-width studio wordmark.

[ work statement                 supporting copy ]
[             wide project                      ]
[        large project      ]   [ small project  ]
[ ink: Branding / Websites / Marketing + reels   ]
[ yellow: direct studio statement / brand symbol ]
[ process: 01       02       03                  ]
[ DEE demonstration ] [ FAQ ] [ inquiry ] [ logo ]

Critique: a fresh coat on the old rows would repeat the previous mistake. Change the silhouette, scale and image/caption arrangement of every section. Reserve expressive motion for masked section statements, direct-manipulation service reels, project image interactions and the process line. Keep paragraphs and form controls stable. Reduced motion and unavailable JavaScript must retain readable content and usable links. Use Framer Motion's 190/24/1 spring exclusively. Verify the whole page visually in both languages before deploying through the existing Git/Vercel integration.
## Completed validation

All 18 full-page scenarios passed: 320/390/768/1440 px, EN/AR, normal/reduced motion, native no-JavaScript fallback, unequal project composition, category destinations, reversible accordions, directional reel buttons, real pointer dragging, keyboard access to the last reel item, inquiry review and WCAG A/AA scans. Existing inquiry/dock/film UI checks passed all 14 scenarios; handler unit checks passed with mocked delivery. The approved hero, form, navigation and filter islands compare identically to the previous release. Normal-motion DEE and studio scroll checks also passed on desktop and phone. Production build passes; no real message was sent.

## Phone hero refinement / November 3, 2026
Retain ink #06070B, paper #FDFDFD, yellow #FFDA46, Inter/Playfair and Alexandria. Phone layout: [navigation] [two-line statement + readable copy] [larger unobstructed DEE] [four named chapters] [yellow inquiry / pause / projects]. Remove duplicate in-copy actions from the enhanced portrait layout; use a single accessible contact action throughout the story. Reserve a fixed, safe-area-aware bottom control area. Short phones use a compact type scale. Fit the camera to both available height and width. Decorative miniature cards are omitted from portrait so they cannot cover the character. Desktop composition and the 190/24 spring remain. Validate real text ranges, character/control separation, every chapter, orientation/viewport changes, static fallback and reduced motion.
