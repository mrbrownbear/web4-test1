# Majenta Solutions 3D polish and QA

## Current experience

The logo particle field transitions into a footprint projected from the supplied model vertex positions. The same vertex positions then rise into the structural wireframe, which passes through a translucent hologram and settles into the actual textured 3D model. All three model stages use the same GLB geometry, bounds and world transform. The wireframe displays a sampled subset of actual triangle edges for performance rather than every triangle edge.

The scroll camera visits front, side, rear and elevated poses before passing into the furnished open lower bay. Mouse drag activates a complete horizontal orbit after the realistic model appears. The visitor can zoom, automatically rotate, select multiple fixed viewpoints or enter the lower floor with a first person look camera. Touch drag, zoom controls and keyboard arrows are supported.

## Verified

* JavaScript syntax checks passed for site.js, world-offline.js and server.mjs.
* Actual provided GLB and resized texture copy parse in an independent glTF renderer.
* Original and web GLB both have 1,851,820 vertices and 3,196,046 triangles. Scene bounds match exactly.
* The locally served model responds with HTTP 200 and streams successfully; HTTP Range requests return 206.
* Desktop UI (1440 x 900): engineering mega menu, industry selection and lifecycle controls pass.
* Mobile UI (390 x 844): mobile navigation, industry selection and lifecycle controls pass.
* Site controls expose all six camera presets, full orbit controls and zoom buttons.
* Front, diagonal exterior, reverse and interior camera images were rendered from the optimized GLB independently; see verification/camera-angles-independent-render.png.
* The source logo and Git adapted content sections remain in the website.

## Not certified

The available Chromium runtime blocks WebGL2, so live shader compilation, WebGL frame screenshots, smoothness and device FPS are not independently certified here. The independent glTF render proves the underlying model and selected camera areas exist, but not that the browser WebGL experience is defect free.

The real GLB has all source triangles but its embedded textures were resized, so texture quality is not lossless. Expect a substantial initial download: the web GLB is around 100 MB. The site works from the bundled local Node or Python server and requires no npm dependencies. A local file URL is not supported for the large GLB.

Commercial rights for the latest user supplied GLB were not supplied and should be confirmed before public deployment. The contact form still prepares an email rather than submitting to a configured backend.
