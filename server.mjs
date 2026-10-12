/* Local Majenta server. Only Node built-ins. No dependencies. */
import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.glb':'model/gltf-binary','.json':'application/json; charset=utf-8','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const server = createServer(async (req,res)=>{
  try {
    const path = new URL(req.url||'/',`http://${host}:${port}`).pathname;
    const requested = decodeURIComponent(path).replace(/\\/g,'/');
    if (requested.includes('\0')) throw new Error('Invalid path');
    const full = resolve(root,'.'+(requested==='/'?'/index.html':requested));
    if(full!==root && !full.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden')}
    const s=await stat(full).catch(()=>null);
    if(!s||!s.isFile()){res.writeHead(404);return res.end('Not found')}
    const size=s.size;
    const headers={'Content-Type':mime[extname(full).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
    const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start=0,end=size-1,status=200;
    if(range){start=Number(range[1]);end=range[2]?Math.min(size-1,Number(range[2])):size-1;if(start>=size||end<start){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end()}status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`}
    headers['Content-Length']=end-start+1;
    res.writeHead(status,headers);
    if(req.method==='HEAD')return res.end();
    createReadStream(full,{start,end}).on('error',error=>{console.error('Stream error:',error);res.destroy(error)}).pipe(res);
  } catch(error){res.writeHead(400);res.end('Invalid request')}
});
server.listen(port,host,()=>{console.log(`Majenta Solutions is running at http://${host}:${port}`);console.log('Press Ctrl+C to stop. No npm installation required.')});
