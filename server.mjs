import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':['index.html','text/html'],'/game.js':['game.js','text/javascript'],'/engine.js':['engine.js','text/javascript'],'/campaign.js':['campaign.js','text/javascript'],'/scenery.js':['scenery.js','text/javascript'],'/audio.js':['audio.js','text/javascript'],'/routes.js':['routes.js','text/javascript'],'/style.css':['style.css','text/css']};
const host=process.env.HOST || '127.0.0.1';
http.createServer(async(req,res)=>{
  const file=files[new URL(req.url,'http://local').pathname];
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'");
  if(!file){res.writeHead(404);res.end('No encontrado');return;}
  try{res.setHeader('Content-Type',file[1]+'; charset=utf-8');res.end(await readFile(new URL('./public/'+file[0],import.meta.url)));}
  catch{res.writeHead(500);res.end('Error de servidor');}
}).listen(Number(process.env.PORT || 3000),host,()=>console.log(`Pulso iniciado en ${host}:${process.env.PORT || 3000}`));
