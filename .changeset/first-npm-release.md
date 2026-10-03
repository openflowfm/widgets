---
"@openflow/widgets": patch
---

First release on npm as `@openflow/widgets`. The package now ships compiled
JavaScript, `.d.ts` declarations and the stylesheets in `dist/`, so consumers no
longer compile the library's TSX. Every existing import specifier still resolves,
with its `.ts` / `.tsx` extension, to the compiled module: `@openflow/widgets`,
`@openflow/widgets/controls/Knob.tsx`, `@openflow/widgets/palette.css` and so on.
`@openflow/widgets/notation/*` (moved to `music/`) resolves to `music/`.
`controls/pointing.ts` is renamed `controls/pointingEngine.ts` (compiled, it would
clash with `Pointing.js` on case-insensitive disks); the old specifier still resolves.
