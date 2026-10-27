import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import inquiry from './api/inquiry.js';

const root=path.resolve('dist'),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf','.webm':'video/webm','.vtt':'text/vtt; charset=utf-8','.zip':'application/zip','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname==='/api/inquiry'){
      const buffers=[];let size=0;
      for await(const part of req){size+=part.length;if(size>12000){res.writeHead(413);res.end();return;}buffers.push(part);}
      req.body=Buffer.concat(buffers).toString();res.status=code=>{res.statusCode=code;return res;};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res;};
      return await inquiry(req,res);
    }
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    let stat=await fs.stat(file).catch(()=>null);
    if(stat?.isDirectory()){file=path.join(file,'index.html');stat=await fs.stat(file).catch(()=>null);}
    if(!stat&&!path.extname(file)){file+='.html';stat=await fs.stat(file).catch(()=>null);}
    if(!stat?.isFile()){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
    const data=await fs.readFile(file),range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);if(start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
    else{res.writeHead(200,{'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);}
  }catch{res.writeHead(500);res.end();}
}).listen(port,'127.0.0.1',()=>console.log(`Digits Studio: http://127.0.0.1:${port}`));
