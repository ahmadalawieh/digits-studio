# A bolder opening — 26 October 2026

Brief: the previous quiet split hero was rejected. The user explicitly wants a catchy opening and motion libraries. Use the original Digits yellow and wordmark, but make the opening a memorable studio composition.

Palette: signature yellow #FFDA46, ink #292A32, paper #F8F8F4, white #FFFFFF. Project colours remain within their own artwork. Type: oversized Archivo, with Instrument Sans for utility and connected IBM Plex Sans Arabic for RTL. Whole lines animate; Arabic letters are never split.

Composition: an almost full-screen yellow canvas; large “Make” at the left, a layered project stack at the upper right, then “your mark.” spanning the width beneath it. A compact offer and clear project CTA sit along the lower edge. On phones, type and stack enter the document flow and remain comfortably readable. The project stage remains an actual link with previous, next and pause controls.

Opening storyboard: a short ink line sweeps across the top, headline lines rise through their masks, and three tilted project cards fly into a stacked arrangement. The lower offer and controls settle last. Total opening is about 1.7 seconds, with no blocking loader. Fine-pointer motion gently tilts the stack; GSAP ScrollTrigger gives the headline and stack a small independent movement as the visitor scrolls onward. No scroll hijacking or pinned section.

Library: pinned GSAP 3.15.0 core and ScrollTrigger, served locally with licence files. Source: https://gsap.com/docs/v3/Installation/, https://gsap.com/docs/v3/Plugins/ScrollTrigger/, https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/.

Review: this is deliberately more expressive than the previous neutral hero. Keep the rest of the page quiet so the opening earns its emphasis. All content is visible without JavaScript or if the library fails; reduced motion skips the entrance, pointer and scroll effects. Existing project controls, service filters and inquiry flow remain usable. Test normal/reduced modes, RTL, touch, resize, rapid project switching and library failure before release.
