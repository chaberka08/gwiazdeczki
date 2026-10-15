import Phaser from 'phaser';
import {CELL,HEIGHT,WIDTH,SimulationEngine} from '../simulation/engine';
import type {Brush} from '../simulation/engine';
import type {Tile} from '../simulation/types';
export type EditorSettings={mode:'editor'|'simulation';brush:Brush;size:number;onChange:()=>void};
const CHAR_COUNT=15;
export class GameScene extends Phaser.Scene{
 engine:SimulationEngine;settings:EditorSettings;private g!:Phaser.GameObjects.Graphics;private selected:number|null=null;private actors=new Map<number,Phaser.GameObjects.Sprite>();private beasts=new Map<number,Phaser.GameObjects.Sprite>();private scenery=new Map<string,Phaser.GameObjects.Image>();private dragging=false;private last='';private lastRender=-1;private structures=new Map<number,Phaser.GameObjects.Image>();
 constructor(engine:SimulationEngine,settings:EditorSettings){super('Game');this.engine=engine;this.settings=settings;}
 preload(){for(let i=0;i<CHAR_COUNT;i++)this.load.spritesheet('hero'+i,`/assets/characters/hero${i}.png`,{frameWidth:128,frameHeight:128});this.load.image('tree-real','/assets/terrain/tree.png');for(const kind of ['house','farm','market','barracks'])this.load.image('building-'+kind,'/assets/buildings/'+kind+'.png');for(const kind of ['cat','dog'])this.load.spritesheet(kind,`/assets/animals/${kind}.png`,{frameWidth:32,frameHeight:32});}
 create(){this.cameras.main.setBackgroundColor('#1b3328');this.cameras.main.setZoom(1);this.g=this.add.graphics();this.g.setDepth(0);
  for(let i=0;i<CHAR_COUNT;i++){const key='hero'+i;const tex=this.textures.get(key);if(!tex||tex.key==='__MISSING')continue;const count=tex.frameTotal-1;this.anims.create({key:key+'-walk',frames:this.anims.generateFrameNumbers(key,{start:0,end:Math.min(Math.max(count-1,0),7)}),frameRate:7,repeat:-1});}
  for(const kind of ['cat','dog'])this.anims.create({key:kind+'-walk',frames:this.anims.generateFrameNumbers(kind,{start:0,end:2}),frameRate:5,repeat:-1});
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{this.dragging=true;this.click(p);});this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(this.dragging&&p.isDown&&this.settings.mode==='editor')this.click(p);});this.input.on('pointerup',()=>{this.dragging=false;this.last='';});this.input.on('gameout',()=>{this.dragging=false;this.last='';});
  this.input.on('wheel',(_p:Phaser.Input.Pointer,_o:unknown,_dx:number,dy:number)=>{this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom+(dy>0?-.1:.1),.5,2.5));});
  this.input.keyboard?.on('keydown-LEFT',()=>this.cameras.main.scrollX-=48);this.input.keyboard?.on('keydown-RIGHT',()=>this.cameras.main.scrollX+=48);this.input.keyboard?.on('keydown-UP',()=>this.cameras.main.scrollY-=48);this.input.keyboard?.on('keydown-DOWN',()=>this.cameras.main.scrollY+=48);
 }
 private click(p:Phaser.Input.Pointer){const x=Math.floor(p.worldX/CELL),y=Math.floor(p.worldY/CELL);if(x<0||y<0||x>=WIDTH||y>=HEIGHT)return;if(this.settings.mode==='editor'){const k=`${x},${y}`;if(k===this.last)return;this.last=k;this.engine.paint(x,y,this.settings.brush,this.settings.size);this.settings.onChange();return;}let best:number|null=null,d=20;for(const a of this.engine.state.people){const n=Math.hypot(a.x*CELL+12-p.worldX,a.y*CELL+12-p.worldY);if(n<d){best=a.id;d=n;}}this.selected=best;this.engine.onSelect(best);}
 private backgrounds(time:number){const s=this.engine.state,g=this.g;g.clear();const palette:Record<Tile,number>={grass:0x78b565,forest:0x62965a,field:0xcdb16d,water:0x347db4,stone:0x89918b,mountain:0x6b7682,sand:0xd8c38e,snow:0xd9e7ec,swamp:0x4d7359};
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){const t=s.map[y][x],px=x*CELL,py=y*CELL,hash=(x*67+y*191)%19;
   g.fillStyle(palette[t.type]);g.fillRect(px,py,CELL,CELL);
   if(t.type==='grass'){g.fillStyle(0x9acd7f,.6);g.fillRect(px+5+hash%8,py+7,3,3);}
   if(t.type==='water'){const shift=Math.floor(time/380+hash)%8;g.fillStyle(0x7cc9e7,.7);g.fillRect(px+2+shift,py+5,11,2);g.fillStyle(0x91dcef,.55);g.fillRect(px+(hash+shift)%14,py+16,7,2);}
   if(t.type==='sand'){g.fillStyle(0xf4dfa8);g.fillRect(px+hash%15,py+8,2,2);}
   if(t.type==='field'){for(let i=0;i<4;i++){g.fillStyle(i%2?0xeece6a:0x8b9750);g.fillRect(px+i*6+2,py+4,2,16);}}
   if(t.type==='stone'){g.fillStyle(0x525d69);g.fillTriangle(px+1,py+20,px+12,py+3,px+23,py+20);g.fillStyle(0xb9c1bf);g.fillTriangle(px+8,py+9,px+12,py+3,px+16,py+9);}
   if(t.type==='mountain'){g.fillStyle(0x4f5c70);g.fillTriangle(px-2,py+24,px+12,py+1,px+26,py+24);g.fillStyle(0xdee9ed);g.fillTriangle(px+7,py+9,px+12,py+1,px+17,py+9);}
   if(t.type==='swamp'){g.fillStyle(0x385c49);g.fillRect(px+5,py+8,13,7);}
   if(t.type==='snow'){g.fillStyle(0xffffff,.65);g.fillRect(px+hash%16,py+6,5,3);}
   if(t.overlay){g.fillStyle(t.overlay==='bridge'?0xb99158:0xa18b6f);if(t.overlay==='bridge'){g.fillRect(px,py+7,24,11);g.fillStyle(0x725139);g.fillRect(px,py+6,24,2);g.fillRect(px,py+18,24,2);}else{g.fillRect(px,py+8,24,9);g.fillStyle(0xc7b390);g.fillRect(px,py+11,24,2);}}
   if(t.burning){const flicker=Math.sin(time*.014+x*3+y)*4;g.fillStyle(0xff4c12);g.fillTriangle(px+1,py+22,px+10+flicker,py-10,px+20,py+22);g.fillStyle(0xffc52b);g.fillTriangle(px+5,py+22,px+12-flicker*.5,py+3,px+18,py+22);}
  }
  for(const c of s.civilizations){g.lineStyle(2,c.color,.58);g.strokeCircle(c.capital.x*CELL+12,c.capital.y*CELL+12,7*CELL);}
  /* Buildings are rendered as separate sprites with correct draw depth. */
  for(const b of [] as typeof s.buildings){const px=b.x*CELL,py=b.y*CELL,c=s.civilizations.find(c=>c.id===b.civId)?.color||0xa9a7a0;
   g.fillStyle(0x1d2a21,.25);g.fillEllipse(px+12,py+23,28,8);g.fillStyle(b.kind==='farm'?0xd2b46d:0xe2cfaf);g.fillRect(px+2,py+5,20,18);g.fillStyle(c);g.fillTriangle(px-3,py+6,px+12,py-10,px+27,py+6);g.fillStyle(0x583e38);g.fillRect(px+10,py+14,6,9);if(b.kind==='market'||b.kind==='barracks'){g.fillStyle(0xffe2a5);g.fillRect(px+4,py+9,5,5);}}
  if(s.weather.season==='Zima'){g.fillStyle(0xdceafa,.12);g.fillRect(0,0,WIDTH*CELL,HEIGHT*CELL);}
  if(s.weather.condition==='Deszcz'||s.weather.condition==='Burza'){g.lineStyle(1,0xa4d9ee,.32);for(let i=0;i<100;i++){const px=(i*179+time*.13)%(WIDTH*CELL),py=(i*89+time*.37)%(HEIGHT*CELL);g.lineBetween(px,py,px-3,py+11);}}
  if(s.weather.condition==='Śnieg'){g.fillStyle(0xffffff,.8);for(let i=0;i<110;i++)g.fillCircle((i*83+time*.012)%(WIDTH*CELL),(i*173+time*.028)%(HEIGHT*CELL),1.4);}
 }
 private updateScenery(time:number){const s=this.engine.state,desired=new Set<string>();const camera=this.cameras.main.worldView;const left=Math.max(0,Math.floor(camera.x/CELL)-2),right=Math.min(WIDTH,Math.ceil(camera.right/CELL)+2),top=Math.max(0,Math.floor(camera.y/CELL)-2),bottom=Math.min(HEIGHT,Math.ceil(camera.bottom/CELL)+2);
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const t=s.map[y][x];if(t.type!=='forest')continue;const key=x+','+y;desired.add(key);let tree=this.scenery.get(key);if(!tree){tree=this.add.image(x*CELL+12,y*CELL+8,'tree-real').setDisplaySize(35,37).setOrigin(.5,.75).setDepth(3);this.scenery.set(key,tree);}tree.rotation=Math.sin(time*.0012+x*2.7+y)*.012*(1+s.weather.wind*.05);tree.setTint(t.burning?0xff824c:0xffffff);}
  for(const [key,tree] of this.scenery)if(!desired.has(key)){tree.destroy();this.scenery.delete(key);}
 }
 private updateBuildings(){const ids=new Set<number>();for(const b of this.engine.state.buildings){ids.add(b.id);let sp=this.structures.get(b.id);if(!sp){sp=this.add.image(0,0,'building-'+b.kind).setDepth(4).setOrigin(.5,.92).setDisplaySize(34,42);this.structures.set(b.id,sp);}sp.setPosition(b.x*CELL+12,b.y*CELL+17);sp.setTint(this.engine.state.map[b.y][b.x].burning?0xff9460:0xffffff);}for(const [id,sp] of this.structures)if(!ids.has(id)){sp.destroy();this.structures.delete(id);}}
 private updatePeople(_time: number, delta: number){const people=this.settings.mode==='editor'?[]:this.engine.state.people,ids=new Set<number>();for(const a of people){ids.add(a.id);let sp=this.actors.get(a.id);if(!sp){sp=this.add.sprite(0,0,'hero'+(a.appearance%CHAR_COUNT),0).setDepth(8).setScale(.34).setOrigin(.5,.8);this.actors.set(a.id,sp);}const moving=a.x!==a.lastX||a.y!==a.lastY;const key='hero'+(a.appearance%CHAR_COUNT)+'-walk';if(moving){if(sp.anims.currentAnim?.key!==key)sp.play(key,true);sp.setFlipX(a.x<a.lastX);}else{sp.stop();sp.setFrame(0);}const destX=a.x*CELL+12,destY=a.y*CELL+13;if(!sp.getData('initialized')){sp.x=destX;sp.y=destY;sp.setData('initialized',true);}const t=Math.min(.25,.105*(this.game.loop.delta/16.667));sp.x=Phaser.Math.Linear(sp.x,destX,t);sp.y=Phaser.Math.Linear(sp.y,destY,t);sp.setTint(a.sick?0xffaaaa:0xffffff);if(this.selected===a.id){/* selection circle rendered by graphics */}}
  for(const [id,sp] of this.actors)if(!ids.has(id)){sp.destroy();this.actors.delete(id);}
 }
 private updateAnimals(_time: number, delta: number){const animals=this.settings.mode==='editor'?[]:this.engine.state.animals,ids=new Set<number>();for(const a of animals){ids.add(a.id);let sp=this.beasts.get(a.id);const kind=a.kind==='cat'?'cat':'dog';if(!sp){sp=this.add.sprite(0,0,kind).setScale(.8).setDepth(7);this.beasts.set(a.id,sp);}if(a.x!==a.lastX||a.y!==a.lastY){sp.play(kind+'-walk',true);sp.setFlipX(a.x<a.lastX);}else{sp.stop();sp.setFrame(0);}const tx=a.x*CELL+12,ty=a.y*CELL+11;if(!sp.getData('initialized')){sp.setPosition(tx,ty);sp.setData('initialized',true);}sp.x=Phaser.Math.Linear(sp.x,tx,.13);sp.y=Phaser.Math.Linear(sp.y,ty,.13);sp.setTint(a.kind==='wolf'?0x777b8c:a.kind==='deer'?0xc2a475:0xffffff);}
  for(const [id,sp] of this.beasts)if(!ids.has(id)){sp.destroy();this.beasts.delete(id);}
 }
 update(time:number){if(time-this.lastRender<35)return;this.lastRender=time;this.backgrounds(time);this.updateScenery(time);this.updateBuildings();this.updatePeople(time);this.updateAnimals(time);if(this.selected!==null){const a=this.engine.agent(this.selected);if(a){this.g.lineStyle(2,0xffee96);this.g.strokeCircle(a.x*CELL+12,a.y*CELL+12,13);}}
  if(this.settings.mode==='editor'){const p=this.input.activePointer,x=Math.floor(p.worldX/CELL),y=Math.floor(p.worldY/CELL);if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT){this.g.lineStyle(2,0xffffff,.75);this.g.strokeCircle(x*CELL+12,y*CELL+12,this.settings.size*CELL);}}
 }
}
export function mountGame(host:HTMLElement,engine:SimulationEngine,settings:EditorSettings){return new Phaser.Game({type:Phaser.AUTO,parent:host,width:WIDTH*CELL,height:HEIGHT*CELL,backgroundColor:'#1b3328',render:{pixelArt:true,antialias:false},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[new GameScene(engine,settings)]});}
