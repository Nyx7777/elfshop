export { type Faction, type Item, items } from './items.ts';
export { type Visitor, visitors } from './visitors.ts';
export { news } from './events.ts';
import { type Faction, items } from './items.ts';
import { type Visitor, visitors } from './visitors.ts';

export type Stock={uid:number;itemId:string;paid:number;hidden:boolean;listed:boolean;multiplier:number};
export type Log={day:number;text:string;delta:number};
export type Game={version:2;day:number;visitorIndex:number;gold:number;energy:number;reputation:Record<Faction,number>;heat:number;stock:Stock[];log:Log[];examined:boolean;scanned:boolean;asked:boolean;observed:boolean;patience:number;resolved:boolean;dialogue:string;outcome:string;upgrades:string[];notes:string[];memories:string[];sold:number;profit:number;serial:number;ended:boolean;ending:string;summary:string[];kindness:number;returned:boolean;seed:number};
export const freshGame=():Game=>({version:2,day:1,visitorIndex:0,gold:600,energy:8,reputation:{guild:0,guard:0,night:0},heat:0,stock:[{uid:1,itemId:'water',paid:18,hidden:false,listed:false,multiplier:1},{uid:2,itemId:'charm',paid:25,hidden:false,listed:false,multiplier:1}],log:[{day:1,text:'开店资金',delta:600},{day:1,text:'房东：每天打烊收租，第七天可用 1000 金币买下店铺。',delta:0}],examined:false,scanned:false,asked:false,observed:false,patience:3,resolved:false,dialogue:'',outcome:'',upgrades:[],notes:[],memories:[],sold:0,profit:0,serial:3,ended:false,ending:'',summary:[],kindness:0,returned:false,seed:Math.floor(Math.random()*2**32)});
export type Action={type:string;amount?:number;uid?:number;key?:string;multiplier?:number};
export function currentVisitor(s:Game):Visitor{return visitors[Math.min((s.day-1)*3+s.visitorIndex,visitors.length-1)]}
export const rent=(day:number)=>30+10*day;
export const capacity=(s:Game)=>s.upgrades.includes('shelves')?16:8;
export function marketPrice(s:Game,stock:Stock){const item=items[stock.itemId];let m=s.day===7&&!item.illegal?1.2:1;if(s.day===2&&item.id==='potion')m=1.25;if(item.illegal&&s.day===5)m=1.35;return Math.round(item.value*m*stock.multiplier)}
const entry=(s:Game,text:string,delta=0)=>{s.log.unshift({day:s.day,text,delta});s.gold+=delta};
const note=(s:Game,text:string)=>{if(!s.notes.includes(text))s.notes.push(text)};
const done=(s:Game,text:string)=>{s.resolved=true;s.outcome=text;s.dialogue=text};
export function act(state:Game,a:Action):Game{
 let s=structuredClone(state); if(s.ended&&a.type!=='continue')return s;
 const v=currentVisitor(s), item=items[v.item];
 const fail=(text:string)=>{s.outcome=text;return s};
 if(['inspect','scan','ask','observe','offer','refuse','report','ward'].includes(a.type)&&(s.resolved||s.visitorIndex>=3))return s;
 switch(a.type){
 case 'inspect':if(s.examined)return s;if(s.energy<1)return fail('精力不足，明日开门后恢复。');s.energy--;s.examined=true;s.dialogue=item.clue;if(item.fake)note(s,`${item.name}：镀金仿品，不要按古董收购。`);break;
 case 'scan':if(s.scanned)return s;{const cost=s.upgrades.includes('lens')?1:2;if(s.energy<cost)return fail('精力不足，无法使用鉴魔镜。');s.energy-=cost;s.scanned=true;s.dialogue=item.magic;if(item.memory&&!s.memories.includes(item.id)){s.memories.push(item.id);note(s,`${item.name}：${item.magic}`)}}break;
 case 'ask':s.asked=true;s.dialogue=v.story;note(s,`${v.name}：${v.story}`);break;
 case 'observe':s.observed=true;s.dialogue=v.observation;break;
 case 'offer':{if(!Number.isFinite(a.amount)||!Number.isInteger(a.amount)||a.amount!<1||a.amount!>9999)return fail('请输入 1 至 9999 的整数报价。');const amount=a.amount!;if(s.stock.length>=capacity(s))return fail('货架已满，先出售物品或扩建。');if(amount>s.gold)return fail('金币不足，请降低报价或变卖库存。');if(amount<v.min){s.patience--;s.dialogue=s.patience===2?'这个价格太低了。至少拿出一点诚意吧。':'这是我能接受的底价附近了，别再浪费彼此的时间。';if(s.patience<=0)done(s,'客人摇摇头，收起物品离开了。');else s.outcome='报价未被接受，耐心 −1。';break;}entry(s,`向${v.name}收购${item.name}`,-amount);s.stock.push({uid:s.serial++,itemId:item.id,paid:amount,hidden:false,listed:false,multiplier:1});s.reputation[v.faction]+=2;if(item.illegal)s.heat+=18;if(v.demon){entry(s,'未识破的拟态魔族偷走了柜台里的金币',-Math.min(90,s.gold));s.heat+=12;done(s,'成交的瞬间，他的影子裂开又合拢。柜台里的 90 金币也不见了。下次记得观察来客。');}else{if(v.poor&&amount>=v.ask){s.kindness++;s.reputation.guild+=5;}done(s,`成交。${item.name}已放入仓库，支付 ${amount} 金币。${item.fake?'钱货两清后，指尖蹭掉了一层金漆……':''}`)}break;}
 case 'refuse':done(s,'你婉拒了这笔买卖。客人收好物品，推门离开。');break;
 case 'report':if(item.illegal){entry(s,'检举违禁品奖励',25);s.reputation.guard+=5;s.reputation.night-=4;s.heat=Math.max(0,s.heat-10);done(s,'卫队收走了违禁品，奖励 25 金币。灰鸦不会喜欢这件事。')}else{s.reputation.guard-=4;s.reputation[v.faction]-=3;entry(s,'错误检举的赔偿',-Math.min(30,s.gold));done(s,'卫队没有发现违禁品。你支付了赔偿，客人失望地离开。')}break;
 case 'ward':if(v.demon){entry(s,'识破拟态魔族的赏金',55);s.reputation.guard+=4;s.heat=Math.max(0,s.heat-12);done(s,'驱魔符燃起蓝火。伪装剥落，魔族逃进暮色。卫队支付了 55 金币赏金。')}else{s.reputation.guild-=6;entry(s,'误伤旅人的补偿',-Math.min(45,s.gold));done(s,'驱魔符没有反应。你误伤了一位普通旅人，支付 45 金币补偿。')}break;
 case 'next':if(!s.resolved||s.visitorIndex>=3)return s;s.visitorIndex++;s.examined=false;s.scanned=false;s.asked=false;s.observed=false;s.patience=3;s.resolved=false;s.dialogue='';s.outcome='';break;
 case 'hide':{const st=s.stock.find(x=>x.uid===a.uid);if(!st)return s;if(!st.hidden&&s.stock.filter(x=>x.hidden).length>=(s.upgrades.includes('cellar')?5:2))return fail('暗格已满。扩建地窖后可藏匿 5 件物品。');st.hidden=!st.hidden;if(st.hidden)st.listed=false;s.outcome=st.hidden?'物品已放入暗格，不会被巡查发现，也不会售出。':'物品已取出暗格。';break;}
 case 'list':{const st=s.stock.find(x=>x.uid===a.uid);if(!st||st.hidden)return fail('先从暗格取出，才能上架。');if(a.multiplier!==undefined&&![.85,1,1.25].includes(a.multiplier))return s;st.listed=!st.listed;st.multiplier=a.multiplier??1;s.outcome=st.listed?'已上架，将在打烊时按当天需求结算。':'已从货架撤下。';break;}
 case 'sell':{const st=s.stock.find(x=>x.uid===a.uid);if(!st)return s;const it=items[st.itemId];const price=Math.round(marketPrice(s,{...st,multiplier:1})*.65);entry(s,`批发出售${it.name}`,price);s.sold++;s.profit+=price-st.paid;s.stock=s.stock.filter(x=>x.uid!==st.uid);if(it.illegal){s.heat+=10;s.reputation.night++}s.outcome=`批发商付了 ${price} 金币。`;break;}
 case 'craft':{const st=s.stock.find(x=>x.uid===a.uid);if(!st)return s;if(st.itemId!=='water'&&st.itemId!=='sword')return fail('这件物品不能加工。');const cost=st.itemId==='water'?10:25;if(s.gold<cost||s.energy<1)return fail('加工需要足够金币和 1 点精力。');s.energy--;entry(s,`加工${items[st.itemId].name}`,-cost);st.itemId=st.itemId==='water'?'potion':'repaired';st.paid+=cost;st.listed=false;s.outcome=`加工完成：${items[st.itemId].name}，记得上架。`;break;}
 case 'supplies':if(s.gold<20)return fail('购买月泉原液需要 20 金币。');if(s.stock.length>=capacity(s))return fail('仓库已满。');entry(s,'向商会购入月泉原液',-20);s.stock.push({uid:s.serial++,itemId:'water',paid:20,hidden:false,listed:false,multiplier:1});s.outcome='月泉原液已放入仓库，可前往工坊净化。';break;
 case 'upgrade':{const prices:Record<string,number>={lens:120,shelves:150,cellar:130,sign:100};const key=a.key??'';if(!(key in prices)||s.upgrades.includes(key))return s;if(s.gold<prices[key])return fail('金币不足。');entry(s,`店铺升级：${{lens:'鉴魔镜',shelves:'扩建货架',cellar:'隐秘地窖',sign:'公会招牌'}[key]}`,-prices[key]);s.upgrades.push(key);s.outcome='升级完成，即刻生效。';break;}
 case 'return':{if(s.day!==7||s.visitorIndex!==2||s.returned)return s;const st=s.stock.find(x=>x.itemId==='pendant');if(!st)return fail('吊坠已经不在仓库里了。');s.stock=s.stock.filter(x=>x.uid!==st.uid);s.returned=true;s.kindness+=3;s.reputation.guild+=12;s.dialogue='艾琳把吊坠贴在胸口。「人类的时间那么短，你却愿意替一个陌生人保存回忆。谢谢。」';entry(s,'艾琳赠予的星银叶，可兑换 180 金币',180);note(s,'你把月见草吊坠还给了艾琳。她答应，每十年都来看看这间当铺。');s.outcome='吊坠已归还。获得星银叶 180 金币，公会声望 +12。';break;}
 case 'endDay':{const summary:string[]=[];if(s.day===3||s.day===4||s.day===6){const seized=s.stock.filter(x=>items[x.itemId].illegal&&!x.hidden);if(seized.length){s.stock=s.stock.filter(x=>!seized.includes(x));const fine=seized.length*60;entry(s,`巡查没收 ${seized.length} 件违禁品并处罚金`,-fine);s.reputation.guard-=5;s.heat+=15;summary.push(`巡查没收了 ${seized.length} 件未藏匿的违禁品，罚款 ${fine} 金币。`)}else{summary.push('王国巡查平安通过。');s.heat=Math.max(0,s.heat-8)}}
 const sold:number[]=[];for(const st of s.stock){if(!st.listed||st.hidden)continue;const it=items[st.itemId];const demand=((s.day+st.uid)%3!==0)||s.upgrades.includes('sign')||s.reputation.guild>=8;if(st.multiplier>1&&!demand){summary.push(`${it.name}标价较高，今日无人购买。`);continue;}const price=marketPrice(s,st);entry(s,`零售${it.name}`,price);s.sold++;s.profit+=price-st.paid;sold.push(st.uid);if(it.illegal){s.heat+=6;s.reputation.night+=2;}summary.push(`${it.name}售出，收入 ${price} 金币。`)}s.stock=s.stock.filter(x=>!sold.includes(x.uid));const fee=rent(s.day);entry(s,'支付当日租金',-fee);summary.push(`支付租金 ${fee} 金币。`);s.summary=summary;
 if(s.gold<0){s.ended=true;s.ending='熄灭的暮灯';s.summary.push('你没能付清租金，房东收回了钥匙。但那些相遇，并不会消失。');break;}
 if(s.day===7){s.ended=true;if(s.gold>=1000){entry(s,'买下暮灯当铺',-1000);s.ending=s.returned?'为你留一盏灯':'这间店终于属于你';s.summary.push(s.returned?'你买下了店铺，也为艾琳留下了一盏每十年都会亮起的灯。':'你付清 1000 金币，拿到了地契。明天起，这间当铺再也不用交租了。')}else{s.ending=s.returned?'长路上的约定':'暮色中的小店';s.summary.push(s.returned?'虽然还没有买下店铺，艾琳已经答应把这里当作下一段旅途的起点。':'你平安经营了七天。还差 '+(1000-s.gold)+' 金币才能买下店铺，故事仍有下一页。')}break;}s.day++;s.visitorIndex=0;s.energy=8;s.examined=false;s.scanned=false;s.asked=false;s.observed=false;s.patience=3;s.resolved=false;s.dialogue='';s.outcome='新的一天，门铃又响了。';break;}
 case 'clearSummary':s.summary=[];break;
 default:return state;
 }
 return s;
}
export function validateSave(data:unknown):data is Game {
 if(!data||typeof data!=='object')return false;
 const d=data as Game;
 const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.length<=500&&v.every(x=>typeof x==='string');
 const ver=(d as {version:unknown}).version;if(ver!==1&&ver!==2)return false;
 return Number.isInteger(d.day)&&d.day>=1&&d.day<=7&&Number.isInteger(d.visitorIndex)&&d.visitorIndex>=0&&d.visitorIndex<=3
 &&['gold','energy','heat','patience','sold','profit','serial','kindness'].every(k=>Number.isFinite(d[k as keyof Game]))
 &&d.energy>=0&&d.energy<=8&&Number.isInteger(d.patience)&&d.patience>=0&&d.patience<=3
 &&['examined','scanned','asked','observed','resolved','ended','returned'].every(k=>typeof d[k as keyof Game]==='boolean')
 &&['dialogue','outcome','ending'].every(k=>typeof d[k as keyof Game]==='string')
 &&Array.isArray(d.stock)&&d.stock.length<=16&&d.stock.every(x=>x&&Object.hasOwn(items,x.itemId)&&Number.isInteger(x.uid)&&Number.isFinite(x.paid)&&typeof x.hidden==='boolean'&&typeof x.listed==='boolean'&&[.85,1,1.25].includes(x.multiplier))
 &&new Set(d.stock.map(x=>x.uid)).size===d.stock.length&&d.stock.every(x=>x.uid<d.serial)
 &&Array.isArray(d.log)&&d.log.length<10000&&d.log.every(x=>x&&Number.isInteger(x.day)&&typeof x.text==='string'&&Number.isFinite(x.delta))
 &&strings(d.upgrades)&&d.upgrades.every(x=>['lens','shelves','cellar','sign'].includes(x))&&strings(d.notes)&&strings(d.memories)&&strings(d.summary)
 &&!!d.reputation&&['guard','guild','night'].every(k=>Number.isFinite(d.reputation[k as Faction]));
}
