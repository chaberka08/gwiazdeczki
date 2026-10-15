import type {Action,Agent,Animal,Building,Cell,Civilization,Disaster,Job,Point,Snapshot,Structure,Tile,Trait,WorldState} from './types';
export const WIDTH=64,HEIGHT=40,CELL=24;
const names=['Anna','Jan','Maja','Piotr','Julia','Adam','Zofia','Filip','Lena','Marek','Ola','Kasia','Tomek','Ewa','Iga','Leon'];
const jobs:Job[]=['Farmer','Woodcutter','Miner','Builder','Trader','Soldier'];
const traits:Trait[]=['Hardworking','Careful','Social','Lazy','Brave'];
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
const colors=[0x65b9ed,0xe77969,0xc5a4ed,0xe8c26c,0x88cb99];
const namesC=['Błękitna Dolina','Żelazny Sojusz','Leśna Korona','Złote Wybrzeże','Górska Unia'];
const valid=(x:number,y:number)=>x>=0&&x<WIDTH&&y>=0&&y<HEIGHT;
const dist=(a:Point,b:Point)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const clamp=(v:number)=>Math.max(0,Math.min(100,v));
export type Brush=Tile|Structure|'city'|'civ'|'erase'|'fire';
export class SimulationEngine{
 state!:WorldState;onSelect:(id:number|null)=>void=()=>{};
 constructor(seed=Math.floor(Math.random()*999999)){this.reset(seed);}
 private random(){let x=this.state.rngState|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.state.rngState=x||1;return (x>>>0)/4294967296;}
 private int(a:number,b:number){return a+Math.floor(this.random()*(b-a+1));}
 private pick<T>(v:T[]){return v[this.int(0,v.length-1)];}
 private log(text:string,type:'info'|'good'|'bad'='info'){this.state.events.unshift({id:this.state.nextId++,day:this.state.day,text,type});this.state.events.length= Math.min(this.state.events.length,90);}
 reset(seed=Math.floor(Math.random()*999999)){this.state={seed,rngState:seed||1,day:1,ticks:0,nextId:1,width:WIDTH,height:HEIGHT,map:[],people:[],animals:[],buildings:[],civilizations:[],resources:{food:580,wood:320,stone:230},disasters:{fire:0,drought:0,epidemic:0,famine:0},weather:{season:'Wiosna',condition:'Słońce',temperature:17,wind:2},history:[],events:[],births:0,deaths:0};
  for(let y=0;y<HEIGHT;y++){const row:Cell[]=[];for(let x=0;x<WIDTH;x++){let type:Tile='grass';const r=this.random();const river=37+Math.floor(3*Math.sin(y*.23));if(Math.abs(x-river)<2)type='water';else if(r<.14)type='forest';else if(r<.21)type='field';else if(r<.25)type='stone';else if(r<.265)type='mountain';else if(r<.27)type='sand';row.push({type,amount:['forest','field','stone'].includes(type)?this.int(12,30):0});}this.state.map.push(row);}
  for(const [x,y] of [[13,13],[47,24]])this.placeCivilization(x,y);
  for(let k=0;k<18;k++)this.spawnAnimal(this.pick(['cat','dog','deer','wolf']));
  this.log('Świat utworzony. Edytuj teren i uruchom symulację.','good');this.record();this.onSelect(null);
 }
 placeCivilization(x:number,y:number){if(!valid(x,y)||this.state.map[y][x].type==='water'||this.state.civilizations.length>=5)return false;
  const s=this.state,id=s.civilizations.length+1;if(s.civilizations.some(c=>dist(c.capital,{x,y})<9))return false;
  const c:Civilization={id,name:namesC[id-1],color:colors[id-1],capital:{x,y},food:180,wood:120,stone:60,relations:{},atWar:[],territory:0,status:'peace'};
  for(const other of s.civilizations){c.relations[other.id]=0;other.relations[id]=0;}
  s.civilizations.push(c);
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(valid(x+dx,y+dy)&&s.map[y+dy][x+dx].type!=='water')s.map[y+dy][x+dx]={type:'grass',amount:0};}
  for(const [dx,dy,k] of [[-2,-1,'house'],[2,-1,'house'],[-2,2,'farm'],[2,2,'house'],[0,-2,'market']] as const)this.addBuilding(k,x+dx,y+dy,id,false);
  this.log(`Powstało państwo: ${c.name}.`,'good');return true;
 }
 private addBuilding(kind:Building['kind'],x:number,y:number,civId:number,pay=true){if(!valid(x,y)||['water','mountain'].includes(this.state.map[y][x].type)||this.state.buildings.some(b=>Math.max(Math.abs(b.x-x),Math.abs(b.y-y))<2)||this.state.map[y][x].overlay||this.state.map[y][x].burning)return false;
  const c=this.state.civilizations.find(c=>c.id===civId);if(pay&&c){if(c.wood<35||c.stone<8)return false;c.wood-=35;c.stone-=8;}
  this.state.buildings.push({id:this.state.nextId++,kind,x,y,civId,hp:100});return true;
 }
 paint(x:number,y:number,brush:Brush,size=1){if(!valid(x,y))return;const s=this.state;
  if(brush==='civ'){this.placeCivilization(x,y);return;}
  if(brush==='city'){this.placeCivilization(x,y);return;}
  if(['house','farm','market','barracks'].includes(brush)){this.addBuilding(brush as Building['kind'],x,y,this.nearestCiv({x,y})?.id||0,false);return;}
  for(let dy=-size+1;dy<size;dy++)for(let dx=-size+1;dx<size;dx++){if(dx*dx+dy*dy>size*size)continue;const px=x+dx,py=y+dy;if(!valid(px,py))continue;
   const tile=s.map[py][px];if(brush==='road'||brush==='bridge'){if(brush==='road'&&tile.type!=='water')tile.overlay='road';if(brush==='bridge'&&tile.type==='water')tile.overlay='bridge';continue;}
   if(brush==='fire'){tile.burning=25;continue;}
   const type:Tile=brush==='erase'?'grass':brush as Tile;
   s.map[py][px]={type,amount:type==='forest'||type==='field'||type==='stone'?24:0,overlay:null};s.buildings=s.buildings.filter(b=>b.x!==px||b.y!==py);
  }
  for(const p of s.people){p.path=[];p.target=null;}
 }
 clearWorld(){this.state.map=this.state.map.map(row=>row.map(()=>({type:'grass' as Tile,amount:0})));this.state.buildings=[];this.state.civilizations=[];this.state.people=[];this.state.animals=[];this.log('Wyczyszczono mapę.');}
 private nearestCiv(p:Point){return [...this.state.civilizations].sort((a,b)=>dist(a.capital,p)-dist(b.capital,p))[0];}
 start(){if(!this.state.civilizations.length)this.placeCivilization(12,12);
  if(this.state.people.length)return;
  for(const c of this.state.civilizations)for(let i=0;i<12;i++)this.spawnCitizen(c);
  for(let i=0;i<18;i++)this.spawnAnimal(this.pick(['cat','dog','deer','wolf']));
  this.log('Cywilizacje rozpoczęły rozwój.','good');}
 private spawnCitizen(c:Civilization){const spot=this.findWalkable(c.capital,5);if(!spot)return;
  const p:Agent={id:this.state.nextId++,name:this.pick(names),x:spot.x,y:spot.y,lastX:spot.x,lastY:spot.y,age:this.int(17,58),hunger:this.int(10,35),energy:this.int(60,100),health:100,job:this.pick(jobs),trait:this.pick(traits),action:'Wander',target:null,path:[],sick:false,immunity:0,color:c.color,civId:c.id,appearance:this.int(0,14),goal:this.pick(['Zbudować dom','Zdobyć bogactwo','Ochronić osadę','Założyć rodzinę','Zebrać zapasy'])};this.state.people.push(p);return p;
 }
 private findWalkable(center:Point,radius:number){for(let tries=0;tries<40;tries++){const x=center.x+this.int(-radius,radius),y=center.y+this.int(-radius,radius);if(this.passable(x,y))return{x,y};}return null;}
 private passable(x:number,y:number){return valid(x,y)&&(!['water','mountain'].includes(this.state.map[y][x].type)||this.state.map[y][x].overlay==='bridge');}
 private path(start:Point,goal:Point){if(!this.passable(goal.x,goal.y))return[];const sk=start.y*WIDTH+start.x,gk=goal.y*WIDTH+goal.x;const q=[sk],seen=new Set([sk]),prev=new Map<number,number>();let head=0;
  while(head<q.length&&head<WIDTH*HEIGHT){const k=q[head++];if(k===gk)break;const x=k%WIDTH,y=Math.floor(k/WIDTH);for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy,n=ny*WIDTH+nx;if(!this.passable(nx,ny)||seen.has(n))continue;seen.add(n);prev.set(n,k);q.push(n);}}
  if(!seen.has(gk))return[];const path:Point[]=[];let k=gk;while(k!==sk){path.push({x:k%WIDTH,y:Math.floor(k/WIDTH)});k=prev.get(k)!;}return path.reverse();
 }
 private move(a:Agent,target:Point){if(a.x===target.x&&a.y===target.y)return true;if(!a.target||dist(a.target,target)>0||!a.path.length){a.target=target;a.path=this.path(a,target);}const next=a.path.shift();if(next){a.x=next.x;a.y=next.y;}return a.x===target.x&&a.y===target.y;}
 private nearResource(a:Agent,type:Tile){let best:Point|null=null,d=1e9;const radius=13;for(let y=Math.max(0,a.y-radius);y<Math.min(HEIGHT,a.y+radius);y++)for(let x=Math.max(0,a.x-radius);x<Math.min(WIDTH,a.x+radius);x++){if(this.state.map[y][x].type!==type||this.state.map[y][x].amount<=0||!this.passable(x,y))continue;const n=dist(a,{x,y});if(n<d){d=n;best={x,y};}}return best;}
 private choose(a:Agent,c:Civilization):Action{if(a.hunger>65&&c.food>1)return'Eat';if(a.energy<25)return'Sleep';if(a.health<45)return'Heal';
  const options:{action:Action;score:number}[]=[{action:'Harvest',score:45+(c.food<140?90:0)+(a.job==='Farmer'?35:0)},{action:'Chop',score:39+(c.wood<90?90:0)+(a.job==='Woodcutter'?38:0)},{action:'Mine',score:29+(c.stone<45?70:0)+(a.job==='Miner'?35:0)},{action:'Build',score:25+(this.state.buildings.filter(b=>b.kind==='house'&&b.civId===c.id).length*6<this.state.people.filter(p=>p.civId===c.id).length?55:0)+(a.job==='Builder'?28:0)},{action:'Trade',score:18+(a.job==='Trader'?48:0)},{action:'Patrol',score:20+(a.job==='Soldier'?45:0)},{action:'Wander',score:6}];if(a.trait==='Hardworking')options[0].score+=10;if(a.trait==='Lazy'&&this.random()<.12)return'Sleep';return options.sort((x,y)=>y.score-x.score)[0].action;}
 private activeFiresNear(p:Point,r:number){const result:Point[]=[];for(let y=Math.max(0,p.y-r);y<=Math.min(HEIGHT-1,p.y+r);y++)for(let x=Math.max(0,p.x-r);x<=Math.min(WIDTH-1,p.x+r);x++)if(this.state.map[y][x].burning&&dist(p,{x,y})<=r)result.push({x,y});return result.sort((a,b)=>dist(a,p)-dist(b,p));}
 private safeFromFire(p:Point){let best:Point|null=null,score=-Infinity;for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const q={x:p.x+dx,y:p.y+dy};if(!this.passable(q.x,q.y)||this.state.map[q.y][q.x].burning)continue;const nearby=this.activeFiresNear(q,5);const nearest=nearby.length?dist(q,nearby[0]):9;const rating=nearest*3-dist(p,q)*.6;if(rating>score){score=rating;best=q;}}return best;}
 private nearestSafeNeighbor(f:Point,a:Point){return dirs.map(([dx,dy])=>({x:f.x+dx,y:f.y+dy})).filter(q=>this.passable(q.x,q.y)&&!this.state.map[q.y][q.x].burning).sort((p,q)=>dist(p,a)-dist(q,a))[0];}
 private processAgent(a:Agent){const c=this.state.civilizations.find(c=>c.id===a.civId);if(!c)return;a.lastX=a.x;a.lastY=a.y;a.immunity=Math.max(0,a.immunity-1);a.hunger=clamp(a.hunger+1.1);a.energy=clamp(a.energy-.8);if(a.sick){a.health-=1+this.random()*1.2;if(this.random()<.03)a.sick=false;}if(a.hunger>95)a.health-=2.5;if(a.health<=0){this.state.people=this.state.people.filter(p=>p!==a);this.state.deaths++;return;}
  const fires=this.activeFiresNear(a,8);
  if(fires.length){
   const close=fires.some(f=>dist(a,f)<=2);
   const responder=(a.job==='Soldier'||a.job==='Builder'||a.trait==='Brave')&&a.health>42&&a.energy>20;
   if(close&&!responder){a.action='Wander';const safe=this.safeFromFire(a);if(safe)this.move(a,safe);return;}
   if(responder){a.action='Patrol';const f=fires[0];const approach=this.nearestSafeNeighbor(f,a);
     if(approach&&this.move(a,approach)){const cell=this.state.map[f.y][f.x];if(cell.burning){cell.burning=Math.max(0,cell.burning-(a.trait==='Brave'?6:4));a.energy=clamp(a.energy-2);if(!cell.burning)this.log(`${a.name} ugasił pożar.`,'good');}}return;}
  }
  if(a.sick){a.action='Heal';a.energy=clamp(a.energy+6);if(this.random()<.045){a.sick=false;a.immunity=30;}return;}
  const action=this.choose(a,c);a.action=action;
  if(action==='Eat'){c.food-=2;a.hunger=clamp(a.hunger-48);return;}
  if(action==='Sleep'){a.energy=clamp(a.energy+32);return;}
  if(action==='Heal'){a.health=clamp(a.health+3);a.energy=clamp(a.energy+4);return;}
  if(action==='Trade'){if(c.food>110&&c.wood>35){c.food-=3;c.wood+=2;}this.move(a,c.capital);return;}
  if(action==='Patrol'||action==='Wander'){if(!a.target||a.x===a.target.x&&a.y===a.target.y){a.target=this.findWalkable(c.capital,7);a.path=[];}if(a.target)this.move(a,a.target);return;}
  if(action==='Build'){const bCount=this.state.buildings.filter(b=>b.civId===c.id&&b.kind==='house').length;if(this.state.day%12===0&&this.state.ticks%8===0&&c.wood>=60&&c.stone>=14&&this.state.buildings.filter(b=>b.civId===c.id).length<35){for(let i=0;i<25;i++){const pos=this.findWalkable(c.capital,9);if(pos&&this.addBuilding(bCount*7<this.state.people.filter(p=>p.civId===c.id).length?'house':'farm',pos.x,pos.y,c.id)){this.log(`${c.name}: powstał nowy budynek.`,'good');return;}}}a.action='Chop';}
  const tileType:Tile=a.action==='Harvest'?'field':a.action==='Mine'?'stone':'forest';const res=a.action==='Harvest'?'food':a.action==='Mine'?'stone':'wood';const target=this.nearResource(a,tileType);if(target){if(this.move(a,target)){const tile=this.state.map[target.y][target.x];const gain=res==='food'?(this.state.disasters.drought?2:8):res==='wood'?6:4;c[res]+=gain;tile.amount--;if(tile.amount<=0){tile.type='grass';a.target=null;a.path=[];}}}else if(this.random()<.14){const pos=this.findWalkable(c.capital,9);if(pos){this.state.map[pos.y][pos.x]={type:tileType,amount:25};}}
 }
 private spawnAnimal(kind:Animal['kind']){const loc=this.findWalkable({x:this.int(5,WIDTH-6),y:this.int(5,HEIGHT-6)},6);if(!loc)return;this.state.animals.push({id:this.state.nextId++,kind,x:loc.x,y:loc.y,lastX:loc.x,lastY:loc.y,age:0,hunger:0,energy:100});}
 private processAnimals(){for(const a of [...this.state.animals]){a.lastX=a.x;a.lastY=a.y;a.hunger+=1;a.energy=Math.max(0,a.energy-1);if(a.energy<15){a.energy=Math.min(100,a.energy+15);continue;}if(this.random()<.35){const [dx,dy]=this.pick(dirs),nx=a.x+dx,ny=a.y+dy;if(this.passable(nx,ny)){a.x=nx;a.y=ny;}}
   if(a.kind==='wolf'&&this.random()<.025){const prey=this.state.animals.find(p=>p.kind==='deer'&&dist(a,p)<3);if(prey){this.state.animals=this.state.animals.filter(p=>p!==prey);a.hunger=0;}}
  } }
 private climate(){const s=this.state;const seasons=['Wiosna','Lato','Jesień','Zima'] as const;const idx=Math.floor((s.day%120)/30);s.weather.season=seasons[idx];const base=[14,25,10,-4][idx];s.weather.temperature=base+this.int(-5,5);s.weather.wind=this.int(0,9);s.weather.condition=this.random()<.12?(idx===3?'Śnieg':'Burza'):this.random()<.3?(idx===3?'Śnieg':'Deszcz'):'Słońce';}
 private daily(){const s=this.state;s.day++;this.climate();for(const c of s.civilizations){const pop=s.people.filter(p=>p.civId===c.id).length;c.food=Math.max(0,c.food-Math.ceil(pop*.18));const farms=s.buildings.filter(b=>b.civId===c.id&&b.kind==='farm').length;c.food+=farms*(s.weather.season==='Zima'?1:s.disasters.drought?1:6);c.territory=s.buildings.filter(b=>b.civId===c.id).length*7;
   if(s.day%18===0&&pop<85&&c.food>pop*2&&s.buildings.filter(b=>b.civId===c.id&&b.kind==='house').length*7>pop){this.spawnCitizen(c);s.births++;}
  }
  if(s.day%7===0){for(let i=0;i<22;i++){const x=this.int(0,WIDTH-1),y=this.int(0,HEIGHT-1),cell=s.map[y][x];if(cell.type==='grass'&&!cell.overlay){cell.type=this.random()<.6?'forest':'field';cell.amount=20;}}}
  if(s.day%12===0&&s.animals.length<85)this.spawnAnimal(this.pick(['cat','dog','deer','deer','wolf']));
  if(s.day%20===0){for(const a of s.civilizations)for(const b of s.civilizations){if(a.id>=b.id)continue;const change=this.int(-9,9);a.relations[b.id]=Math.max(-100,Math.min(100,(a.relations[b.id]||0)+change));b.relations[a.id]=a.relations[b.id];if(a.relations[b.id]<-48&&!a.atWar.includes(b.id)){a.atWar.push(b.id);b.atWar.push(a.id);this.log(`Wojna: ${a.name} kontra ${b.name}!`,'bad');}if(a.relations[b.id]>-5&&a.atWar.includes(b.id)){a.atWar=a.atWar.filter(id=>id!==b.id);b.atWar=b.atWar.filter(id=>id!==a.id);this.log(`Pokój: ${a.name} i ${b.name}.`,'good');}}}
  if(s.day%5===0)for(const c of s.civilizations)for(const enemyId of c.atWar){const enemy=s.civilizations.find(e=>e.id===enemyId);if(!enemy)continue;if(c.wood>20&&this.random()<.24){const target=s.buildings.find(b=>b.civId===enemy.id&&dist(b,c.capital)<35);if(target){target.hp-=25;c.wood-=20;this.log(`${c.name} zaatakowało budynek państwa ${enemy.name}.`,'bad');if(target.hp<=0){target.civId=c.id;target.hp=70;this.log(`${c.name} zdobywa budynek!`,'bad');}}}}
  for(const key of Object.keys(s.disasters) as Disaster[])if(s.disasters[key]>0)s.disasters[key]--;
  // Two-pass fire simulation prevents cascade in a single tick.
  const ignitions:Point[]=[];
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
   const t=s.map[y][x];if(!t.burning)continue;
   t.burning=Math.max(0,t.burning-1);
   const b=s.buildings.find(b=>b.x===x&&b.y===y);
   if(b){b.hp-=8;if(b.hp<=0){s.buildings=s.buildings.filter(v=>v!==b);this.log('Spłonął budynek!','bad');}}
   if(t.burning===0){if(t.type==='forest'||t.type==='field')t.type='grass';t.amount=0;continue;}
   for(const [dx,dy] of dirs){const nx=x+dx,ny=y+dy;if(!valid(nx,ny))continue;
    const nt=s.map[ny][nx];if(nt.burning)continue;
    const structure=s.buildings.some(b=>b.x===nx&&b.y===ny);
    const flammable=nt.type==='forest'||nt.type==='field'||structure;
    const probability=(nt.type==='forest'?.22:nt.type==='field'?.17:.13)*(s.weather.condition==='Deszcz'?.4:1)*(s.disasters.drought?1.55:1)*(1+s.weather.wind*.04);
    if(flammable&&this.random()<probability)ignitions.push({x:nx,y:ny});
   }
  }
  for(const p of ignitions)s.map[p.y][p.x].burning=18+this.int(0,10);
  s.resources.food=s.civilizations.reduce((v,c)=>v+c.food,0);s.resources.wood=s.civilizations.reduce((v,c)=>v+c.wood,0);s.resources.stone=s.civilizations.reduce((v,c)=>v+c.stone,0);
  if(s.day%15===0)this.log(`Dzień ${s.day}: ${s.people.length} mieszkańców, ${s.animals.length} zwierząt.`);
  this.record();
 }
 step(){this.state.ticks++;for(const a of [...this.state.people])this.processAgent(a);if(this.state.ticks%2===0)this.processAnimals();if(this.state.disasters.epidemic>0){const infected=this.state.people.filter(p=>p.sick);for(const a of this.state.people)if(!a.sick&&a.immunity<=0&&infected.some(p=>dist(a,p)<3)&&this.random()<.075)a.sick=true;}if(this.state.ticks%8===0)this.daily();}
 disaster(type:Disaster){const s=this.state;s.disasters[type]=20;if(type==='fire'){const origin=this.pick(s.civilizations)?.capital||{x:WIDTH/2,y:HEIGHT/2};let started=0;for(let radius=1;radius<13&&started<4;radius++)for(let y=Math.max(0,origin.y-radius);y<Math.min(HEIGHT,origin.y+radius)&&started<4;y++)for(let x=Math.max(0,origin.x-radius);x<Math.min(WIDTH,origin.x+radius)&&started<4;x++){if((s.map[y][x].type==='forest'||s.map[y][x].type==='field'||s.buildings.some(b=>b.x===x&&b.y===y))&&this.random()<.13){s.map[y][x].burning=26;started++;}}if(!started){const b=s.buildings.find(b=>b.civId===s.civilizations[0]?.id);if(b)s.map[b.y][b.x].burning=26;}}if(type==='famine')for(const c of s.civilizations)c.food=Math.floor(c.food*.15);if(type==='epidemic')for(const a of s.people)if(this.random()<.2)a.sick=true;this.log('Katastrofa: '+type,'bad');}
 aid(){for(const c of this.state.civilizations)c.food+=120;this.log('Dostarczono żywność do wszystkich państw.','good');}
 declareWar(a:number,b:number){const ca=this.state.civilizations.find(c=>c.id===a),cb=this.state.civilizations.find(c=>c.id===b);if(!ca||!cb||a===b)return;ca.relations[b]=cb.relations[a]=-80;if(!ca.atWar.includes(b))ca.atWar.push(b);if(!cb.atWar.includes(a))cb.atWar.push(a);this.log(`${ca.name} wypowiada wojnę: ${cb.name}`,'bad');}
 makePeace(a:number,b:number){const ca=this.state.civilizations.find(c=>c.id===a),cb=this.state.civilizations.find(c=>c.id===b);if(!ca||!cb||a===b)return;ca.relations[b]=cb.relations[a]=25;ca.atWar=ca.atWar.filter(v=>v!==b);cb.atWar=cb.atWar.filter(v=>v!==a);this.log(`${ca.name} i ${cb.name} zawarły pokój.`,'good');}
 agent(id:number|null){return this.state.people.find(a=>a.id===id)||null;}
 snapshot():Snapshot{const s=this.state,people=s.people,p=people.length;return{day:s.day,population:p,food:s.resources.food,wood:s.resources.wood,stone:s.resources.stone,houses:s.buildings.filter(b=>b.kind==='house').length,farms:s.buildings.filter(b=>b.kind==='farm').length,capacity:s.buildings.filter(b=>b.kind==='house').length*7,averageHealth:p?Math.round(people.reduce((v,a)=>v+a.health,0)/p):0,happiness:p?Math.round(people.reduce((v,a)=>v+(100-a.hunger)*.4+a.energy*.3+a.health*.3,0)/p):0,births:s.births,deaths:s.deaths,disasters:{...s.disasters},history:[...s.history],events:[...s.events]};}
 private record(){const s=this.snapshot();this.state.history.push({day:s.day,population:s.population,food:s.food,wood:s.wood,happiness:s.happiness});if(this.state.history.length>130)this.state.history.shift();}
 save(){return JSON.stringify({version:3,world:this.state});}
 load(json:string){const data=JSON.parse(json);const s=data.world as WorldState;if(data.version!==3||!s||s.width!==WIDTH||s.height!==HEIGHT||!Array.isArray(s.map)||s.map.length!==HEIGHT||s.map.some(row=>!Array.isArray(row)||row.length!==WIDTH)||!Array.isArray(s.people)||!Array.isArray(s.civilizations)||!Array.isArray(s.animals)||!Array.isArray(s.buildings)||!s.weather||!s.resources||!s.disasters)throw new Error('Nieobsługiwany lub uszkodzony zapis');this.state=s;this.onSelect(null);}
}
