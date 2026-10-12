/* Majenta locally hosted cinematic renderer. No npm, no CDN, no imports. */
(() => {
'use strict';
const $=s=>document.querySelector(s);
const mobile=matchMedia('(max-width:760px)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas=$('#experience-canvas');
const $failure=$('#no-webgl');const modelLoading=$('#model-load-status');
const fail=(why)=>{console.error('Majenta WebGL:',why);document.documentElement.classList.remove('world-ready','sector-ready');$failure.hidden=false;$failure.querySelector('p').textContent='Interactive visualisation unavailable. The engineering content below remains accessible.';window.majenta3D={ready:false,error:String(why)};};
let gl;
try {gl=canvas.getContext('webgl2',{alpha:false,antialias:!mobile,depth:true,powerPreference:'high-performance'});if(!gl)throw Error('WebGL2 is not available')}catch(e){fail(e);return}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,p)=>{const t=clamp((p-a)/(b-a),0,1);return t*t*(3-2*t)};
const M={identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),mul:(a,b)=>{let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o},trs:(x,y,z,sx=1,sy=1,sz=1)=>new Float32Array([sx,0,0,0,0,sy,0,0,0,0,sz,0,x,y,z,1]),persp:(fov,aspect,n,f)=>{let q=1/Math.tan(fov*Math.PI/360),o=M.identity();o[0]=q/aspect;o[5]=q;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);o[15]=0;return o},look:(eye,target)=>{let sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],norm=a=>{let l=Math.hypot(...a)||1;return a.map(n=>n/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),-(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]),1])},point:(m,v)=>{let x=v[0],y=v[1],z=v[2],w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/(w||1),(m[1]*x+m[5]*y+m[9]*z+m[13])/(w||1),(m[2]*x+m[6]*y+m[10]*z+m[14])/(w||1)]}};
const GL={};
function program(vs,fs){let make=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};let pr=gl.createProgram();gl.attachShader(pr,make(gl.VERTEX_SHADER,vs));gl.attachShader(pr,make(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(pr));return pr}
try{
 GL.mesh=program(`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNorm; layout(location=2) in vec2 aUV;
uniform mat4 uVP,uModel;out vec3 vNormal;out vec2 vUV;out vec3 vWorld;
void main(){vec4 w=uModel*vec4(aPos,1.);vWorld=w.xyz;vNormal=mat3(uModel)*aNorm;vUV=aUV;gl_Position=uVP*w;}`,`#version 300 es
precision highp float;in vec3 vNormal;in vec2 vUV;in vec3 vWorld;
uniform vec4 uColor;uniform sampler2D uTex,uNormalTex,uOrmTex;uniform int uHasTex,uHasNormal,uHasOrm;uniform vec3 uCam;out vec4 frag;
void main(){
 vec4 base=uColor;
 if(uHasTex==1)base*=texture(uTex,vUV);
 if(base.a<.02)discard;
 vec3 n=normalize(vNormal);
 if(uHasNormal==1){
   vec3 dp1=dFdx(vWorld),dp2=dFdy(vWorld);
   vec2 duv1=dFdx(vUV),duv2=dFdy(vUV);
   vec3 tangent=normalize(dp1*duv2.y-dp2*duv1.y);
   tangent=normalize(tangent-n*dot(tangent,n));
   vec3 bitangent=normalize(cross(n,tangent))*sign(dot(cross(dp1,dp2),n));
   vec3 mapped=texture(uNormalTex,vUV).xyz*2.-1.;
   n=normalize(mat3(tangent,bitangent,n)*mapped);
 }
 vec3 viewDir=normalize(uCam-vWorld);
 vec3 sun=normalize(vec3(.45,.90,.53));
 float ndl=max(0.,dot(n,sun));
 float halfLambert=max(.0,dot(n,normalize(sun+viewDir)));
 vec3 orm=uHasOrm==1?texture(uOrmTex,vUV).rgb:vec3(1.,.78,.15);
 float roughness=clamp(orm.g,.25,.97);
 float metalness=clamp(orm.b*.58,.02,.74);
 float occlusion=mix(1.,orm.r,.45);
 float sky=.35+.65*max(.0,n.y);
 vec3 albedo=pow(max(base.rgb,vec3(0.)),vec3(2.2));
 vec3 ambient=vec3(.34,.39,.48)*sky+vec3(.17,.14,.15);
 vec3 diffuse=albedo*(ambient*.66+vec3(1.18,1.08,.96)*ndl*.78)*occlusion;
 float shininess=mix(125.,8.,roughness);
 float spec=pow(halfLambert,shininess)*(1.-roughness*.62)*(.3+.4*metalness);
 vec3 color=diffuse+vec3(1.,.89,.74)*spec;
 float fresnel=pow(1.-max(.0,dot(n,viewDir)),3.);
 color+=vec3(.20,.23,.27)*fresnel*.09;
 color=color/(color+vec3(.74));
 frag=vec4(pow(max(color,vec3(0.)),vec3(1./2.2)),base.a);
}`);
 GL.holo=program(`#version 300 es
precision highp float;
layout(location=0) in vec3 aPos;
uniform mat4 uVP,uModel;
out vec3 vWorld;
void main(){vec4 p=uModel*vec4(aPos,1.);vWorld=p.xyz;gl_Position=uVP*p;}`,`#version 300 es
precision highp float;
in vec3 vWorld;
uniform vec3 uCam;
uniform float uTime,uFade;
out vec4 frag;
void main(){
 vec3 normal=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
 vec3 sight=normalize(uCam-vWorld);
 float rim=pow(1.0-abs(dot(normal,sight)),1.7);
 float lines=pow(max(.0,sin(vWorld.y*18.0-uTime*1.6)),22.0);
 float scan=exp(-pow(abs((fract(vWorld.y*.115-uTime*.045)-.5)*10.0),2.0));
 float variation=.5+.5*sin(vWorld.x*.53+vWorld.z*.47);
 vec3 blue=vec3(.03,.36,.62);
 vec3 magenta=vec3(1.,.055,.53);
 vec3 col=mix(blue,magenta,.50+.40*variation);
 col=col*(.54+.9*rim)+vec3(.65,.22,.60)*lines*.3+vec3(.35,.6,.98)*scan*.25;
 float alpha=(.22+.36*rim+.12*lines+.08*scan)*uFade;
 frag=vec4(col,alpha);
 }`);
 GL.line=program(`#version 300 es
precision highp float;layout(location=0) in vec3 aPos;uniform mat4 uVP,uModel;uniform float uRise;void main(){vec4 w=uModel*vec4(aPos,1.);w.y=mix(.10,w.y,uRise);gl_Position=uVP*w;}`,`#version 300 es
precision highp float;uniform vec4 uColor;out vec4 frag;void main(){frag=uColor;}`);
 GL.particles=program(`#version 300 es
precision highp float;layout(location=0) in vec3 aStart;layout(location=1) in vec3 aLogo;layout(location=2) in vec3 aPlan;layout(location=3) in float aAccent;
uniform mat4 uVP;uniform float uLogoT,uPlanT,uFade,uPointSize;out float vAccent;out float vFade;
void main(){vec3 pos=mix(aStart,aLogo,uLogoT);pos=mix(pos,aPlan,uPlanT);gl_Position=uVP*vec4(pos,1.);gl_PointSize=uPointSize*(.8+.4*aAccent);vAccent=aAccent;vFade=uFade;}`,`#version 300 es
precision highp float;in float vAccent,vFade;out vec4 frag;
void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.09,.5,d))*vFade;frag=vec4(mix(vec3(.64,.40,.71),vec3(1.,.10,.59),vAccent),a);}`);
}catch(e){fail(e);return}
const U={holo:{vp:gl.getUniformLocation(GL.holo,'uVP'),model:gl.getUniformLocation(GL.holo,'uModel'),cam:gl.getUniformLocation(GL.holo,'uCam'),time:gl.getUniformLocation(GL.holo,'uTime'),fade:gl.getUniformLocation(GL.holo,'uFade')},mesh:{vp:gl.getUniformLocation(GL.mesh,'uVP'),model:gl.getUniformLocation(GL.mesh,'uModel'),color:gl.getUniformLocation(GL.mesh,'uColor'),tex:gl.getUniformLocation(GL.mesh,'uTex'),hasTex:gl.getUniformLocation(GL.mesh,'uHasTex'),normalTex:gl.getUniformLocation(GL.mesh,'uNormalTex'),hasNormal:gl.getUniformLocation(GL.mesh,'uHasNormal'),ormTex:gl.getUniformLocation(GL.mesh,'uOrmTex'),hasOrm:gl.getUniformLocation(GL.mesh,'uHasOrm'),cam:gl.getUniformLocation(GL.mesh,'uCam')},line:{vp:gl.getUniformLocation(GL.line,'uVP'),model:gl.getUniformLocation(GL.line,'uModel'),color:gl.getUniformLocation(GL.line,'uColor'),rise:gl.getUniformLocation(GL.line,'uRise')},particles:{vp:gl.getUniformLocation(GL.particles,'uVP'),logo:gl.getUniformLocation(GL.particles,'uLogoT'),plan:gl.getUniformLocation(GL.particles,'uPlanT'),fade:gl.getUniformLocation(GL.particles,'uFade'),size:gl.getUniformLocation(GL.particles,'uPointSize')}};
const createBuffer=(arr,target=gl.ARRAY_BUFFER)=>{const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,arr,gl.STATIC_DRAW);return b};
function geo(positions,normals,uv,indices){let vao=gl.createVertexArray();gl.bindVertexArray(vao);let p=createBuffer(new Float32Array(positions));gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);let n=createBuffer(new Float32Array(normals||new Array(positions.length).fill(0)));gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);let u=createBuffer(new Float32Array(uv||new Array(positions.length/3*2).fill(0)));gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,0,0);let ib=null;if(indices){ib=createBuffer(new Uint16Array(indices),gl.ELEMENT_ARRAY_BUFFER)}gl.bindVertexArray(null);return {vao,count:indices?indices.length:positions.length/3,index:!!indices}}
function cubeGeometry(){// 6 faces, correctly oriented surface normals
let positions=[],normals=[],uv=[],indices=[];const faces=[[[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],[[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],[[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],[[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]];for(let f of faces){let st=positions.length/3;for(let [i,v] of f[1].entries()){positions.push(...v);normals.push(...f[0]);uv.push(...[[0,0],[1,0],[1,1],[0,1]][i])}indices.push(st,st+1,st+2,st,st+2,st+3)}return geo(positions,normals,uv,indices)}
const unitCube=cubeGeometry();let lineCubeBuf=createBuffer(new Float32Array([-.5,-.5,-.5,.5,-.5,-.5,.5,-.5,-.5,.5,.5,-.5,.5,.5,-.5,-.5,.5,-.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,-.5,.5,.5,-.5,.5,.5,-.5,.5,.5,.5,.5,.5,.5,.5,-.5,.5,.5,-.5,-.5,.5,-.5,.5,.5,.5,.5,.5,-.5,.5,-.5,-.5,.5,-.5,-.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,-.5,.5,-.5,-.5,-.5,.5,.5,-.5,-.5,.5,-.5,.5,.5,-.5,.5,.5,.5,.5,.5,.5,-.5,.5,.5,.5]),gl.ARRAY_BUFFER);
// Canonical 12 cube edges, generated to avoid any orientation assumptions.
const lineVAO=gl.createVertexArray();const edges=[];for(let axis=0;axis<3;axis++)for(let a of [-.5,.5])for(let b of [-.5,.5]){let start=[a,b,-.5],end=[a,b,.5];if(axis===0){start=[-.5,a,b];end=[.5,a,b]}if(axis===1){start=[a,-.5,b];end=[a,.5,b]}edges.push(...start,...end)}lineCubeBuf=createBuffer(new Float32Array(edges));
const plan=[[-5.5,-5.8,5.5,-5.8],[5.5,-5.8,5.5,5.8],[5.5,5.8,-5.5,5.8],[-5.5,5.8,-5.5,-5.8],[-2.0,-2.1,2.0,-2.1],[2.0,-2.1,2.0,1.7],[2.0,1.7,-2.0,1.7],[-2.0,1.7,-2.0,-2.1],[-4.6,-4.0,-2,-4.0],[2,-4,4.6,-4],[0,-2.1,0,1.7],[-2,0,2,0],[-4.8,3.6,4.8,3.6]];
const blueLines=[];for(let [x,z,xx,zz] of plan)blueLines.push(x,.02,z,xx,.02,zz);for(let x=-5;x<=5;x+=1)blueLines.push(x,.01,-7,x,.01,7);for(let z=-7;z<=7;z+=1)blueLines.push(-5,.01,z,5,.01,z);
const blueBuffer=createBuffer(new Float32Array(blueLines));
const struct=plan.map(([x,z,xx,zz],i)=>({x:(x+xx)*.5,z:(z+zz)*.5,w:Math.abs(xx-x)||.12,d:Math.abs(zz-z)||.12,major:i<5}));
const blocks=[];
const hex=h=>{h=h.replace('#','');let n=parseInt(h,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const particlesCount=mobile?3600:8000;let src=new Float32Array(particlesCount*3),logo=new Float32Array(particlesCount*3),target=new Float32Array(particlesCount*3),accent=new Float32Array(particlesCount);const pix=window.MAJENTA_LOGO_PIXELS||[];for(let i=0;i<particlesCount;i++){let a=i*2.399963229,r=5+((i*47)%367)/26,ty=(i*.7865)%1,ang=Math.acos(2*ty-1);src.set([r*Math.sin(ang)*Math.cos(a),r*Math.cos(ang),r*Math.sin(ang)*Math.sin(a)],i*3);let j=(i*4373)%(pix.length/3||1);let px=pix[j*3]||50,py=pix[j*3+1]||10,mag=pix[j*3+2]||0;logo.set([(px-50)*.095,(10.5-py)*.095,Math.sin(i*1.3)*.025],i*3);let seg=plan[i%plan.length],t=(i*.61803398875)%1;target.set([mix(seg[0],seg[2],t),.03,mix(seg[1],seg[3],t)],i*3);accent[i]=mag}
const particleVAO=gl.createVertexArray();let planGPUBuffer=null;gl.bindVertexArray(particleVAO);for(let [i,data,sz] of [[0,src,3],[1,logo,3],[2,target,3],[3,accent,1]]){let b=createBuffer(data);if(i===2)planGPUBuffer=b;gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,sz,gl.FLOAT,false,0,0)}gl.bindVertexArray(null);
let office=null, modelReady=false,modelError='', officeGroup=M.identity();
async function binaryBuffer(){
 const b64=window.MAJENTA_MODEL_BASE64;
 if(b64){const binary=atob(b64);const b=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)b[i]=binary.charCodeAt(i);window.MAJENTA_MODEL_BASE64=null;return b.buffer}
 const url=window.MAJENTA_MODEL_URL||'models/majenta-progressive.glb';
 const res=await fetch(url);
 if(!res.ok) throw Error('Could not fetch '+url);
 return await res.arrayBuffer();
}
function parseGLB(buffer){const d=new DataView(buffer);if(d.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB header');let at=12,json,binOffset=0;while(at<buffer.byteLength){let size=d.getUint32(at,true),type=d.getUint32(at+4,true);at+=8;if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,at,size)));if(type===0x004e4942)binOffset=at;at+=size}if(!json||!binOffset)throw Error('Missing glTF JSON or BIN chunk');return {json,buffer,binOffset}}
async function buildModel(){let {json:g,buffer,binOffset}=parseGLB(await binaryBuffer());let viewBuffers=g.bufferViews.map(bv=>{const data=new Uint8Array(buffer,binOffset+(bv.byteOffset||0),bv.byteLength);return data});let buffers=new Map();function gpuView(idx,targetType){let key=idx+':'+targetType;if(!buffers.has(key))buffers.set(key,createBuffer(viewBuffers[idx],targetType));return buffers.get(key)}
let texs=await Promise.all((g.images||[]).map(async image=>{let data=viewBuffers[image.bufferView];let bitmap=await createImageBitmap(new Blob([data],{type:image.mimeType}));try{const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,bitmap);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);bitmap.close();return tex}finally{}}));
let geom=[],low=[Infinity,Infinity,Infinity],high=[-Infinity,-Infinity,-Infinity],meshes=0;let accessor=g.accessors;
let sourcePlanPoints=[];
function nodeMatrix(n){if(n.matrix)return new Float32Array(n.matrix);const t=n.translation||[0,0,0],s=n.scale||[1,1,1],q=n.rotation||[0,0,0,1],x=q[0],y=q[1],z=q[2],w=q[3];let m=M.identity();m[0]=(1-2*y*y-2*z*z)*s[0];m[1]=(2*x*y+2*z*w)*s[0];m[2]=(2*x*z-2*y*w)*s[0];m[4]=(2*x*y-2*z*w)*s[1];m[5]=(1-2*x*x-2*z*z)*s[1];m[6]=(2*y*z+2*x*w)*s[1];m[8]=(2*x*z+2*y*w)*s[2];m[9]=(2*y*z-2*x*w)*s[2];m[10]=(1-2*x*x-2*y*y)*s[2];m[12]=t[0];m[13]=t[1];m[14]=t[2];return m}
function readPosBounds(a,m){let lo=a.min||[-.5,-.5,-.5],hi=a.max||[.5,.5,.5];for(let x of [lo[0],hi[0]])for(let y of [lo[1],hi[1]])for(let z of [lo[2],hi[2]]){let p=M.point(m,[x,y,z]);for(let i=0;i<3;i++){low[i]=Math.min(low[i],p[i]);high[i]=Math.max(high[i],p[i])}}}
function walk(id,parent){let n=g.nodes[id],matrix=M.mul(parent,nodeMatrix(n));if(n.mesh!==undefined){for(let prim of g.meshes[n.mesh].primitives){if(prim.mode!==undefined&&prim.mode!==4)continue;let va=gl.createVertexArray();gl.bindVertexArray(va);for(let [loc,key,sz] of [[0,'POSITION',3],[1,'NORMAL',3],[2,'TEXCOORD_0',2]]){let ai=prim.attributes[key];if(ai===undefined)continue;let acc=accessor[ai],bv=g.bufferViews[acc.bufferView];gl.bindBuffer(gl.ARRAY_BUFFER,gpuView(acc.bufferView,gl.ARRAY_BUFFER));gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,sz,acc.componentType,!!acc.normalized,bv.byteStride||0,acc.byteOffset||0)}let idAcc=accessor[prim.indices],idBV=g.bufferViews[idAcc.bufferView];gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gpuView(idAcc.bufferView,gl.ELEMENT_ARRAY_BUFFER));gl.bindVertexArray(null);let mat=g.materials[prim.material]||{},pbr=mat.pbrMetallicRoughness||{},color=pbr.baseColorFactor||[1,1,1,1];let tx=pbr.baseColorTexture, tex=tx?texs[g.textures[tx.index].source]:null;let nt=mat.normalTexture,ntx=nt?texs[g.textures[nt.index].source]:null;let mt=pbr.metallicRoughnessTexture,mtx=mt?texs[g.textures[mt.index].source]:null;// Use the actual scan triangles for an independent sparse architectural edge field.
let wireVAO=gl.createVertexArray(),wireCount=0;
if(prim.attributes.POSITION!==undefined){
 const pa=accessor[prim.attributes.POSITION],pv=g.bufferViews[pa.bufferView],iv=g.bufferViews[idAcc.bufferView];
 const posOffset=binOffset+(pv.byteOffset||0)+(pa.byteOffset||0);
 const pos=new Float32Array(buffer,posOffset,pa.count*3);
 const indexOffset=binOffset+(iv.byteOffset||0)+(idAcc.byteOffset||0);
 const ids=idAcc.componentType===5123?new Uint16Array(buffer,indexOffset,idAcc.count):new Uint32Array(buffer,indexOffset,idAcc.count);
 const edges=[];const triangleCount=Math.floor(ids.length/3),step=Math.max(1,Math.ceil(triangleCount/(mobile?28000:65000)));
 for(let face=0;face<triangleCount;face+=step){let i0=ids[face*3],i1=ids[face*3+1],i2=ids[face*3+2];for(let [u,v] of [[i0,i1],[i1,i2],[i2,i0]])edges.push(pos[u*3],pos[u*3+1],pos[u*3+2],pos[v*3],pos[v*3+1],pos[v*3+2]);
 sourcePlanPoints.push(pos[i0*3],pos[i0*3+1],pos[i0*3+2]);
}
 wireCount=edges.length/3;gl.bindVertexArray(wireVAO);const wireBuffer=createBuffer(new Float32Array(edges));gl.bindBuffer(gl.ARRAY_BUFFER,wireBuffer);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
}
geom.push({vao:va,wireVAO,wireCount,count:idAcc.count,indicesType:idAcc.componentType,indicesOffset:idAcc.byteOffset||0,matrix,color,texture:tex,normalTexture:ntx,ormTexture:mtx,doubleSided:mat.doubleSided||false,sourceNode:n.name||''});readPosBounds(accessor[prim.attributes.POSITION],matrix);meshes++}}for(let child of n.children||[])walk(child,matrix)}
for(let n of (g.scenes[g.scene||0].nodes))walk(n,M.identity());const size=high.map((h,i)=>h-low[i]);let factor=Math.min(11.1/size[0],5.4/size[1],12.0/size[2]),center=low.map((v,i)=>(v+high[i])*.5);officeGroup=M.mul(M.trs(-center[0]*factor,-low[1]*factor+.1,-center[2]*factor,factor,factor,factor),M.identity());office={geom,size,low,high,factor,meshes,textures:texs.length};
 if(sourcePlanPoints.length){
   for(let i=0;i<particlesCount;i++){
    let j=(i*7919)%Math.floor(sourcePlanPoints.length/3);
    target[i*3]=(sourcePlanPoints[j*3]-center[0])*factor;
    target[i*3+1]=.10;
    target[i*3+2]=(sourcePlanPoints[j*3+2]-center[2])*factor;
   }
   gl.bindBuffer(gl.ARRAY_BUFFER,planGPUBuffer);gl.bufferData(gl.ARRAY_BUFFER,target,gl.STATIC_DRAW);
 }
 modelReady=true;window.dispatchEvent(new CustomEvent('majenta:asset',{detail:{name:'majenta-model',loaded:true,meshes,textures:texs.length,shapeShared:true}}));}
// Browser decompression and bitmap decoding happen on the local model, not a remote CDN.
buildModel().catch(e=>{modelError=e.message;console.error('Construction scan:',e);if($failure){$failure.hidden=false;$failure.querySelector('p').textContent='The construction scan could not load. The engineering sections remain available.';}window.dispatchEvent(new CustomEvent('majenta:asset',{detail:{name:'majenta-model',loaded:false,error:e.message}}))});
function meshStart(vp,eye){gl.useProgram(GL.mesh);gl.uniformMatrix4fv(U.mesh.vp,false,vp);gl.uniform3fv(U.mesh.cam,eye);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(U.mesh.tex,0);gl.uniform1i(U.mesh.normalTex,1);gl.uniform1i(U.mesh.ormTex,2)}
function drawCube(vp,eye,x,y,z,w,h,d,color,alpha=1){let c=hex(color),mat=M.trs(x,y,z,w,h,d);gl.uniformMatrix4fv(U.mesh.model,false,mat);gl.uniform4f(U.mesh.color,c[0],c[1],c[2],alpha);gl.uniform1i(U.mesh.hasTex,0);gl.bindVertexArray(unitCube.vao);gl.drawElements(gl.TRIANGLES,unitCube.count,gl.UNSIGNED_SHORT,0)}
function wireCube(vp,x,y,z,w,h,d,color,alpha){gl.useProgram(GL.line);gl.uniformMatrix4fv(U.line.vp,false,vp);gl.uniformMatrix4fv(U.line.model,false,M.trs(x,y,z,w,h,d));let c=hex(color);gl.uniform4f(U.line.color,...c,alpha);gl.bindVertexArray(lineVAO);gl.bindBuffer(gl.ARRAY_BUFFER,lineCubeBuf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.LINES,0,24)}
function drawSite(vp,eye,wireFade,holoFade,realFade,time){
 if(!office)return;
 gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);
 const group=officeGroup;
 if(wireFade>.003){
  gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(GL.line);gl.uniformMatrix4fv(U.line.vp,false,vp);gl.uniform4f(U.line.color,1.,.28,.76,wireFade*.50);gl.uniform1f(U.line.rise,Math.min(1,Math.max(0,window.majentaWireRise??1)));
  for(let item of office.geom){gl.uniformMatrix4fv(U.line.model,false,M.mul(group,item.matrix));gl.bindVertexArray(item.wireVAO);gl.drawArrays(gl.LINES,0,item.wireCount);}
 }
 if(holoFade>.003){
  gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(GL.holo);gl.uniformMatrix4fv(U.holo.vp,false,vp);gl.uniform3fv(U.holo.cam,eye);gl.uniform1f(U.holo.time,time*.001);gl.uniform1f(U.holo.fade,holoFade);
  for(let item of office.geom){gl.uniformMatrix4fv(U.holo.model,false,M.mul(group,item.matrix));gl.bindVertexArray(item.vao);gl.drawElements(gl.TRIANGLES,item.count,item.indicesType,item.indicesOffset);}
 }
 if(realFade>.003){
  gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  meshStart(vp,eye);
  for(let item of office.geom){
   gl.uniformMatrix4fv(U.mesh.model,false,M.mul(group,item.matrix));
   const c=item.color||[1,1,1,1];
   gl.uniform4f(U.mesh.color,c[0],c[1],c[2],Math.max(.001,c[3]*realFade));
   gl.activeTexture(gl.TEXTURE0);gl.uniform1i(U.mesh.hasTex,item.texture?1:0);if(item.texture)gl.bindTexture(gl.TEXTURE_2D,item.texture);
   gl.activeTexture(gl.TEXTURE1);gl.uniform1i(U.mesh.hasNormal,item.normalTexture?1:0);if(item.normalTexture)gl.bindTexture(gl.TEXTURE_2D,item.normalTexture);
   gl.activeTexture(gl.TEXTURE2);gl.uniform1i(U.mesh.hasOrm,item.ormTexture?1:0);if(item.ormTexture)gl.bindTexture(gl.TEXTURE_2D,item.ormTexture);
   gl.bindVertexArray(item.vao);
   gl.drawElements(gl.TRIANGLES,item.count,item.indicesType,item.indicesOffset);
  }
 }
 gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
let progress=reduced?.93:0,exploring=false,currentView='collaboration',paused=false,visible=true;
// The supplied construction model drives three exact-shape stages: wireframe, hologram, then final real 3D.
// Camera poses orbit and approach the same geometry so each phase feels physically connected.
const path=[
 {p:0,pos:[0,1.0,17],look:[0,1.6,0]},
 {p:.16,pos:[0,1.0,17],look:[0,1.6,0]},
 {p:.29,pos:[0,14.5,9.0],look:[0,.4,0]},
 {p:.41,pos:[10.5,9.1,12.5],look:[0,2.5,0]},
 {p:.51,pos:[12.0,8.0,8.5],look:[0,2.6,0]},
 {p:.61,pos:[11,7.1,-3.8],look:[0,2.5,0]},
 {p:.72,pos:[1.5,8.0,-14.4],look:[0,2.8,0]},
 {p:.81,pos:[-11.5,6.7,-8.5],look:[0,2.4,0]},
 {p:.90,pos:[-7.8,5.5,10.1],look:[0,2.4,0]},
 {p:.948,pos:[.12,2.6,7.9],look:[.12,1.78,0]},
 {p:.978,pos:[.12,1.73,4.0],look:[.12,1.72,-1.8]},
 {p:1,pos:[.12,1.70,1.70],look:[.12,1.68,-2.45]}
];
const views={
 collaboration:{pos:[10.2,6.3,10.2],look:[0,2.75,0]},
 data:{pos:[.12,1.70,1.70],look:[.12,1.68,-2.45]},
 planning:{pos:[-9.0,5.9,-11.0],look:[0,2.75,0]},
 systems:{pos:[2.4,15.4,6.4],look:[0,2.75,0]},
 left:{pos:[-13.7,6.8,3.5],look:[0,2.75,0]},
 right:{pos:[13.7,6.8,3.5],look:[0,2.75,0]}
};
let cameraPos=[0,0,17],cameraLook=[0,0,0],pointer=[0,0],ctxLost=false;
const orbitFocus=[0,2.75,0];let orbitAzimuth=.67,orbitElevation=.38,orbitRadius=13.4;
const insideAnchor=[.12,1.70,1.70];let freeYaw=Math.PI,freePitch=0;
const orbitMin=6.0,orbitMax=24.0;
const cursorHint=document.getElementById('view-interaction-hint');let orbitAuto=false;

// Full 360 exterior orbit, touch drag, zoom, and constrained first-person interior look.
let orbitDrag=false,dragPoint=[0,0],orbitMove=0;
const getMode=()=>currentView==='data'?'inside':currentView==='collaboration'?'orbit':'preset';
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0||progress<.74)return;
 if(!exploring){exploring=true;currentView='collaboration';const ctrl=document.getElementById('scene-explore');if(ctrl){ctrl.hidden=false;ctrl.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('is-selected',b.dataset.view==='collaboration'));}}
 if(getMode()==='preset'){currentView='collaboration';const ctrl=document.getElementById('scene-explore');if(ctrl)ctrl.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('is-selected',b.dataset.view==='collaboration'));}
 orbitDrag=true;orbitAuto=false;dragPoint=[e.clientX,e.clientY];orbitMove=0;canvas.setPointerCapture(e.pointerId)
});
canvas.addEventListener('pointermove',e=>{if(!orbitDrag)return;
 const dx=e.clientX-dragPoint[0],dy=e.clientY-dragPoint[1],mode=getMode();
 if(mode==='orbit'){orbitAzimuth-=dx*.006;orbitElevation=clamp(orbitElevation+dy*.0045,-1.34,1.34)}
 if(mode==='inside'){freeYaw+=dx*.0055;freePitch=clamp(freePitch-dy*.004,-.85,.85)}
 orbitMove+=Math.abs(dx)+Math.abs(dy);dragPoint=[e.clientX,e.clientY]
});
canvas.addEventListener('pointerup',()=>orbitDrag=false);canvas.addEventListener('pointercancel',()=>orbitDrag=false);
canvas.addEventListener('wheel',e=>{if(!exploring||getMode()!=='orbit')return;e.preventDefault();orbitRadius=clamp(orbitRadius+Math.sign(e.deltaY)*.74,orbitMin,orbitMax)},{passive:false});
function zoomView(n){exploring=true;currentView='collaboration';orbitRadius=clamp(orbitRadius+n,orbitMin,orbitMax)}
document.getElementById('model-zoom-in')?.addEventListener('click',()=>zoomView(-.9));
document.getElementById('model-zoom-out')?.addEventListener('click',()=>zoomView(.9));
document.getElementById('model-auto-orbit')?.addEventListener('click',e=>{exploring=true;currentView='collaboration';orbitAuto=!orbitAuto;e.currentTarget.setAttribute('aria-pressed',String(orbitAuto));e.currentTarget.textContent=orbitAuto?'Stop rotation':'Auto rotate'});

window.addEventListener('keydown',e=>{if(!exploring||/input|textarea|select/i.test(document.activeElement.tagName))return;
 if(e.key==='Escape'){exploring=false;return;}
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){const d=e.key==='ArrowLeft'?.18:-.18;if(getMode()==='orbit')orbitAzimuth+=d;else freeYaw+=d}
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){const d=e.key==='ArrowUp'?-.12:.12;if(getMode()==='orbit')orbitElevation=clamp(orbitElevation+d,-1.34,1.34);else freePitch=clamp(freePitch-d,-.85,.85)}
 if(e.key==='+'||e.key==='=')orbitRadius=clamp(orbitRadius-.65,orbitMin,orbitMax);
 if(e.key==='-')orbitRadius=clamp(orbitRadius+.65,orbitMin,orbitMax)
});

function pose(p){let k=0;while(k<path.length-2&&p>path[k+1].p)k++;let a=path[k],b=path[k+1],t=smooth(a.p,b.p,p);return{pos:a.pos.map((v,i)=>mix(v,b.pos[i],t)),look:a.look.map((v,i)=>mix(v,b.look[i],t))}}
window.addEventListener('majenta:progress',e=>{progress=e.detail.progress;});window.addEventListener('majenta:pause',e=>{paused=e.detail.paused;});window.addEventListener('majenta:view',e=>{exploring=true;currentView=e.detail.id;orbitDrag=false;if(currentView==='data'){freeYaw=Math.PI;freePitch=0}});window.addEventListener('majenta:exit',()=>{exploring=false;orbitDrag=false});window.addEventListener('majenta:replay',()=>{exploring=false;paused=false});window.addEventListener('pointermove',e=>{pointer=[(e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2]},{passive:true});
new IntersectionObserver(es=>{visible=es[0].isIntersecting}).observe(canvas);
function renderHero(now,dt){if(!visible||ctxLost)return;const p=progress;if(modelLoading)modelLoading.hidden=modelReady||p<.26;const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,mobile?1.3:1.6);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h);gl.clearColor(.027,.023,.037,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
let target=exploring?views[currentView]||views.collaboration:pose(p);
if(exploring){if(orbitAuto&&getMode()==='orbit'&&!orbitDrag&&!reduced)orbitAzimuth+=dt*.16;
 if(getMode()==='orbit'){
   let c=Math.cos(orbitElevation);target={pos:[orbitFocus[0]+orbitRadius*c*Math.sin(orbitAzimuth),orbitFocus[1]+orbitRadius*Math.sin(orbitElevation),orbitFocus[2]+orbitRadius*c*Math.cos(orbitAzimuth)],look:orbitFocus};
 } else if(getMode()==='inside'){
   const cp=Math.cos(freePitch);target={pos:insideAnchor,look:[insideAnchor[0]+Math.sin(freeYaw)*cp,insideAnchor[1]+Math.sin(freePitch),insideAnchor[2]+Math.cos(freeYaw)*cp]};
 }
}
let t=1-Math.exp(-dt*(exploring?5.0:3.25));for(let i=0;i<3;i++){cameraPos[i]=mix(cameraPos[i],target.pos[i]+(i===0?pointer[0]*.08:i===1?pointer[1]*-.06:0),t);cameraLook[i]=mix(cameraLook[i],target.look[i],t)}const vp=M.mul(M.persp(mobile?53:45,w/h,.09,145),M.look(cameraPos,cameraLook));
if(p<.358){gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.useProgram(GL.particles);gl.uniformMatrix4fv(U.particles.vp,false,vp);gl.uniform1f(U.particles.logo,smooth(.01,.16,p));gl.uniform1f(U.particles.plan,smooth(.185,.315,p));gl.uniform1f(U.particles.fade,1-smooth(.29,.357,p));gl.uniform1f(U.particles.size,(mobile?2.0:2.5)*dpr);gl.bindVertexArray(particleVAO);gl.drawArrays(gl.POINTS,0,particlesCount);gl.enable(gl.DEPTH_TEST);}
// Direct mesh projection is the architectural drawing. The vertices rise into their
// original positions and retain exactly the same world transform through the final render.
if(modelReady&&(p>.27||exploring)){
 let bp = exploring?0:smooth(.275,.325,p)*(1-smooth(.37,.49,p));
 let rise = exploring?1:smooth(.37,.55,p);
 const wireFade=exploring?.08:smooth(.325,.43,p)*(1-smooth(.57,.73,p));
 const holoFade=exploring?0:smooth(.555,.675,p)*(1-smooth(.74,.875,p));
 const realFade=exploring?1:smooth(.735,.88,p);
 window.majentaWireRise=rise;
 // Plan and rising structural wire are one connected GL_LINES pass.
 drawSite(vp,cameraPos,Math.max(bp,wireFade),holoFade,realFade,now);
}
}
// Second offline engineering scene is actual WebGL, drag controlled and fully local.
const sCanvas=$('#sector-canvas');let sg=sCanvas.getContext('webgl2',{alpha:true,antialias:!mobile});let sgScene='construction',sRotation=0,userRotate=0,drag=false,dragX=0,sVisible=false;
if(sg){document.documentElement.classList.add('sector-ready');new IntersectionObserver(e=>{sVisible=e[0].isIntersecting}).observe(sCanvas);sCanvas.addEventListener('pointerdown',e=>{drag=true;dragX=e.clientX;sCanvas.setPointerCapture(e.pointerId)});sCanvas.addEventListener('pointerup',()=>drag=false);sCanvas.addEventListener('pointercancel',()=>drag=false);sCanvas.addEventListener('pointermove',e=>{if(drag){userRotate+=(e.clientX-dragX)*.008;dragX=e.clientX}});window.addEventListener('majenta:sector',e=>{sgScene=e.detail.sector});}
// Rendering second scene uses the main WebGL context on an intermediary canvas: each WebGL context owns its resources. Build a compact independent 3D line renderer.
let sectorProgram,sectorBuf,sectorLoc;
if(sg){const srcV=`#version 300 es\nlayout(location=0) in vec3 aPos;uniform mat4 uVP;void main(){gl_Position=uVP*vec4(aPos,1.);}`;const srcF=`#version 300 es\nprecision highp float;uniform vec4 uColor;out vec4 frag;void main(){frag=uColor;}`;const sh=(type,source)=>{let z=sg.createShader(type);sg.shaderSource(z,source);sg.compileShader(z);if(!sg.getShaderParameter(z,sg.COMPILE_STATUS))throw Error(sg.getShaderInfoLog(z));return z};sectorProgram=sg.createProgram();sg.attachShader(sectorProgram,sh(sg.VERTEX_SHADER,srcV));sg.attachShader(sectorProgram,sh(sg.FRAGMENT_SHADER,srcF));sg.linkProgram(sectorProgram);sectorBuf=sg.createBuffer();sectorLoc={vp:sg.getUniformLocation(sectorProgram,'uVP'),color:sg.getUniformLocation(sectorProgram,'uColor')}}
const wireFromBoxes=boxes=>{let lines=[];for(let [x,y,z,w,h,d] of boxes){for(let a=0;a<3;a++)for(let v of [-1,1])for(let q of [-1,1]){let one=[v,q,-1],two=[v,q,1];if(a===0){one=[-1,v,q];two=[1,v,q]}if(a===1){one=[v,-1,q];two=[v,1,q]}for(let p of [one,two])lines.push(x+p[0]*w/2,y+p[1]*h/2,z+p[2]*d/2)}}return lines};
const sectorShapes={construction:[[0,0,0,4,3,3],[0,-1.6,0,5,.13,4],[-2.1,0,0,.12,3.5,4],[2.1,0,0,.12,3.5,4],[0,1.6,0,5,.15,4],[0,.25,1.5,3.3,2.4,.12],[0,.4,-1.5,4,2,.12]],automotive:[[0,-.55,0,5,.75,2.1],[-.8,.35,0,2.4,.8,1.9],[-1.7,-1.05,-1.25,.85,.85,.25],[-1.7,-1.05,1.25,.85,.85,.25],[1.6,-1.05,-1.25,.85,.85,.25],[1.6,-1.05,1.25,.85,.85,.25],[2.2,-.4,0,.55,.32,2.25]],aerospace:[[0,0,0,4.7,1.4,1.4],[0,0,0,2.2,2.7,2.7],[-1.3,0,0,.35,3.5,3.5],[1.3,0,0,.35,3.5,3.5]],plm:[[-2,1,0,1,1,1],[2,1,0,1,1,1],[-2,-1,0,1,1,1],[2,-1,0,1,1,1],[0,0,0,1.3,1.3,1.3],[0,2.1,0,.4,.4,.4],[0,-2.1,0,.4,.4,.4]]};
const sectorWire=Object.fromEntries(Object.entries(sectorShapes).map(([k,v])=>[k,new Float32Array(wireFromBoxes(v))]));
function renderSector(dt){if(!sg||!sVisible)return;let r=sCanvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,mobile?1.1:1.5),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(sCanvas.width!==w||sCanvas.height!==h){sCanvas.width=w;sCanvas.height=h}sg.viewport(0,0,w,h);sg.clearColor(0,0,0,0);sg.clear(sg.COLOR_BUFFER_BIT);sg.enable(sg.BLEND);sg.blendFunc(sg.SRC_ALPHA,sg.ONE_MINUS_SRC_ALPHA);if(!drag&&!reduced)sRotation+=dt*.16;let rot=sRotation+userRotate,eye=[Math.sin(rot)*9,5.3,Math.cos(rot)*9],vp=M.mul(M.persp(43,w/h,.1,100),M.look(eye,[0,0,0]));sg.useProgram(sectorProgram);sg.uniformMatrix4fv(sectorLoc.vp,false,vp);sg.uniform4f(sectorLoc.color,1,.18,.62,.83);sg.bindBuffer(sg.ARRAY_BUFFER,sectorBuf);let shape=sectorWire[sgScene]||sectorWire.construction;sg.bufferData(sg.ARRAY_BUFFER,shape,sg.DYNAMIC_DRAW);sg.enableVertexAttribArray(0);sg.vertexAttribPointer(0,3,sg.FLOAT,false,0,0);sg.drawArrays(sg.LINES,0,shape.length/3)}
let prev=performance.now();function frame(now){requestAnimationFrame(frame);const dt=Math.min(.06,(now-prev)/1000);prev=now;try{renderHero(now,dt);renderSector(dt)}catch(e){if(!ctxLost){ctxLost=true;fail(e)}}}requestAnimationFrame(frame);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ctxLost=true;fail('GPU context lost')});
document.documentElement.classList.add('world-ready');
window.majenta3D={ready:true,offline:true,stageOrder:["logo","blueprint","wireframe","hologram","real3d","inside"],modelReady:()=>modelReady,modelError:()=>modelError,modelInfo:()=>office&&({meshes:office.meshes,textures:office.textures,bounds:office.size,sourceTriangles:3196046}),go:p=>{progress=clamp(p,0,1)},view:id=>{exploring=true;currentView=id},getProgress:()=>progress,rotate:(azimuth,elevation)=>{exploring=true;currentView='collaboration';orbitAzimuth=azimuth;orbitElevation=clamp(elevation,-1.34,1.34)},zoom:zoomView,camera:()=>({position:[...cameraPos],target:[...cameraLook],pose:pose(progress),siteScan:false,actualModel:true,orbit360:true,inside:true}),cameraPath:path,views:views};
})();
