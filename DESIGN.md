# DESIGN.md

## Aesthetic DNA: High-End Digits Studio Revamp
- **Core Philosophy:** Minimalist premium editorial layout. We are replacing the baseline grid architecture with deep, structural canvas depth, massive negative breathing room, and dynamic layout scaling inspired by elite design lookbooks.
- **Color System:** Rich, luxury organic shadows and deep high-end contrast tones.

## Design System Tokens
```yaml
brand:
  canvas_bg: "#FDFDFD"          # Soft, high-end fine paper white
  canvas_dark: "#06070B"        # Ink obsidian deep background
  ink_primary: "#0E1015"        # Premium high-chroma charcoal
  ink_secondary: "#6A6E79"      # Muted slate secondary text
  accent: "#111111"             # Deep monolithic structural elements
  accent_dark: "#FFFFFF"        # Stark glowing text variants

typography:
  font_sans: "SF Pro Display, Inter, system-ui"
  font_serif: "Playfair Display, New York, serif" # For striking editorial headlines
  tracking_tight: "-0.03em"
  leading_compressed: "1.05"
```

## Anti-AI & Anti-Template Rules
- **No Uniform Project Grids:** Never display client cards in a generic, uniform multi-column box grid. Use unexpected scaling—such as a huge, breathtaking widescreen project cover (75% width) overlapping an off-axis typographic description panel (25% width).
- **No Simple Hover Opacities:** Avoid basic link opacity transitions. Interactive items must utilize directional magnetic pulls or custom clip-path slide animations.

## Interactive Micro-Motion Systems (Framer Motion)
- **The "Editorial Fluid" Spring:** `type: "spring", stiffness: 190, damping: 24, mass: 1.0`
- **Text Reveal Physics:** Split key text strings line-by-line using overflow-hidden container layers. Translate text elements smoothly up from `-100%` on scroll boundary hits to look like live ink pressing into heavy paper.
- **Project Image Hover:** Hovering over project frames must morph the clip-path borders gracefully (e.g., from `rounded-xl` to an elegant asymmetrical curve or structural scale shift).
