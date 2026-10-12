# Majenta Solutions progressive 3D experience

## Launch

Extract this folder, then run `START_WINDOWS.bat` or `START_MAC_LINUX.sh`. Open http://127.0.0.1:4173. No npm installation is required.

The large model is loaded from a local GLB; direct double click `file://` mode is not supported because browsers restrict binary model fetching. Use the launchers.

## Experience

Actual supplied mesh drives logo to projected footprint to ascending wireframe, then hologram and realistic 3D. The wireframe, hologram and real geometry share exactly the same position and scale. The camera moves around multiple sides and through the open ground bay. Select `360° orbit` to rotate freely with mouse or touch and zoom with the mouse wheel. `Enter the building` uses a level interior camera with drag to look around. `Reverse view` and `Aerial view` provide additional camera poses.

## Model processing

The original model had 3,196,046 triangles and three embedded JPEG textures. A web copy keeps every original triangle while resizing the colour and normal maps to 2048px and the metal/roughness map to 1024px. This reduces file size but is not lossless texture compression. The original user supplied model was not modified.

## Compatibility

Requires a browser supporting WebGL2 and enough graphics memory for the detailed construction mesh. The three Git inspired Majenta sections and original logo are preserved. The form prepares a mailto enquiry. Browser GPU signoff requires hardware testing; see VERIFICATION.md.
