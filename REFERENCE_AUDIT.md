# Actual Git source review and implemented components

The below repositories were inspected at their real `index.html` and available CSS/JS paths, not selected from marketing descriptions alone. Adaptations have original Majenta copy, vector artwork and code; no third-party branding or photography is imported.

## i3: m0veproperty/i3

Source: https://github.com/m0veproperty/i3/blob/main/index.html

Inspected source shows a `ph__mega-menu` / `w-icon-box__grid` nested Services navigation with linked child services. We used its expanded service discovery grammar but replaced the former static icon boxes with an authored two-column engineering showcase. The new menu includes a full height live SVG model panel, keyboard-and-pointer service selection, animated technical illustrations, and service-specific content and destinations.

Exact implementation: `index.html` `#service-mega`, `.mega-shell`, `.mega-service`, `[data-drawing]`; `assets/site.css` `.mega-art-stage`, `.mega-feature`, `.mega-index`, `.mega-drawing`; `assets/site.js` `window.majentaMega`, `setFeature`, `open`, `close`. Testable with `window.majentaMega.setFeature(3)` and reading `#mega-feature-title` or `.mega-drawing.is-shown`.

## Jeff: m0veproperty/jeff

Source: https://github.com/m0veproperty/jeff/blob/main/index.html

Inspected source contains changing `#scale-value`, `#scale-stage`, `#scale-copy` and an animated multi-layer `svg.evolve` scene, with a second craft-beats section. This narrative visual system informed the original Majenta information lifecycle section and the redesigned service navigation model switching. It is not just an explanatory label; it has four working states, live changing scene artwork and copy.

Exact implementation: `index.html` `#lifecycle`, `.life-layer`; `assets/site.css` `.life-layer.is-lit` and `.life-step.is-active`; `assets/site.js` `window.majentaLife.set` and its `set(index)` function. `window.majentaLife.set(2)` visibly highlights the connected-systems layer.

## Chance: m0veproperty/chance

Source: https://github.com/m0veproperty/chance/blob/main/index.html

Inspected source uses `data-proximity-text`, per-character viewport text pieces and `data-event` hover bindings. We built proximity type and project-card tilt with a pointer-responsive spotlight, along with hover-reactive engineering menu visuals instead of static thumbnails.

Exact implementation: `index.html` `#work`, `[data-kinetic-card]`, `[data-proximity-text]`; `assets/site.css` `.proximity-letter` and CSS 3D transform rules; `assets/site.js` per-character span construction, pointer tracking and reset handlers. Active pointer movement updates actual DOM transforms and card CSS rotation variables.

## Visual evidence

`verification/menu-desktop.png` demonstrates the new expanded capability directory with a context-specific engineering SVG. `verification/menu-mobile.png` demonstrates the separate mobile directory. `verification/interior-camera-model-only.png` shows the supplied GLB rendered independently from the website; it is camera-composition evidence rather than browser-level WebGL confirmation.
