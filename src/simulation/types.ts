export type Tile='grass'|'forest'|'field'|'water'|'stone'|'mountain'|'sand'|'snow'|'swamp';
export type Structure='house'|'farm'|'market'|'barracks'|'road'|'bridge';
export type Job='Farmer'|'Woodcutter'|'Miner'|'Builder'|'Soldier'|'Trader';
export type Trait='Hardworking'|'Careful'|'Social'|'Lazy'|'Brave';
export type Action='Eat'|'Sleep'|'Harvest'|'Chop'|'Mine'|'Build'|'Wander'|'Heal'|'Trade'|'Patrol';
export type Disaster='drought'|'epidemic'|'fire'|'famine';
export interface Point {x:number;y:number}
export interface Cell {type:Tile;amount:number;overlay?:'road'|'bridge'|null;burning?:number}
export interface Agent {id:number;name:string;x:number;y:number;age:number;hunger:number;energy:number;health:number;job:Job;trait:Trait;action:Action;target:Point|null;path:Point[];sick:boolean;immunity:number;color:number;civId:number;appearance:number;goal:string;lastX:number;lastY:number}
export interface Building {id:number;x:number;y:number;kind:Exclude<Structure,'road'|'bridge'>;hp:number;civId:number}
export interface HistoryPoint {day:number;population:number;food:number;wood:number;happiness:number}
export interface EventRecord {id:number;day:number;text:string;type:'info'|'good'|'bad'}
export interface Civilization {id:number;name:string;color:number;capital:Point;food:number;wood:number;stone:number;relations:Record<number,number>;atWar:number[];territory:number;status:'peace'|'war'}
export interface Animal {id:number;kind:'cat'|'dog'|'deer'|'wolf';x:number;y:number;age:number;energy:number;hunger:number;lastX:number;lastY:number}
export interface Weather {season:'Wiosna'|'Lato'|'Jesień'|'Zima';condition:'Słońce'|'Deszcz'|'Śnieg'|'Burza';temperature:number;wind:number}
export interface WorldState {seed:number;rngState:number;day:number;ticks:number;nextId:number;map:Cell[][];people:Agent[];animals:Animal[];buildings:Building[];civilizations:Civilization[];resources:{food:number;wood:number;stone:number};disasters:Record<Disaster,number>;weather:Weather;history:HistoryPoint[];events:EventRecord[];deaths:number;births:number;width:number;height:number}
export interface Snapshot {day:number;population:number;food:number;wood:number;stone:number;houses:number;farms:number;capacity:number;averageHealth:number;happiness:number;births:number;deaths:number;disasters:Record<Disaster,number>;history:HistoryPoint[];events:EventRecord[]}
