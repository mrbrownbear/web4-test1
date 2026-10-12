# Production checks

* Same exact source geometry drives wireframe, hologram and final real 3D. Line sampling is a performance adaptation: visible lines use actual mesh vertex positions, though not every triangle edge is drawn.
* The blueprint flattens the same structural lines and then raises them via the same mesh world transform.
* Camera supports unrestricted horizontal rotation, bounded vertical rotation, wheel zoom, inside camera and multiple authored exterior viewpoints.
* Original three textures preserved in resized copies. All 3,196,046 source triangles retained.
* Scripts must pass syntax checks. Local server must serve HTML and GLB successfully. Browser WebGL visual testing to be recorded separately.
* Final online publication requires confirmation of commercial usage rights for the uploaded model.
