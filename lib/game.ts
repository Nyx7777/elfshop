export type Faction = 'guild' | 'guard' | 'night';
export type Item = {id:string;name:string;symbol:string;category:string;value:number;description:string;clue:string;magic:string;illegal?:boolean;fake?:boolean;memory?:boolean;raw?:boolean};
export const items:Record<string,Item> = {
 pendant:{id:'pendant',name:'月见草吊坠',symbol:'✧',category:'饰品 · 精灵遗物',value:160,description:'银链已经失去光泽，琥珀里封着一朵不会凋谢的小花。',clue:'银质纯正。链扣内刻着勇者雷恩的名字，年代与讨伐战争相符。',magic:'保存魔法里有一段记忆：年轻的剑士站在花田中，说「明年一起再来吧」。',memory:true},
 sword:{id:'sword',name:'断刃骑士剑',symbol:'⚔',category:'武器 · 待修复',value:125,description:'刃口有一处缺损，剑格上依稀可见旧王国的纹章。',clue:'精钢锻造，确为军用剑。修复后价值会提高 70 金币。',magic:'残留的是守护魔法，没有诅咒。',raw:true},
 core:{id:'core',name:'绯红魔核',symbol:'◈',category:'魔材 · 来源不明',value:220,description:'握在手心会感到一阵不属于自己的心跳。',clue:'外壳有新鲜切痕，来自王国禁止流通的魔族遗体。',magic:'检测到侵蚀性魔力。这是违禁品，可在仓库藏匿以避开巡查。',illegal:true},
 water:{id:'water',name:'月泉原液',symbol:'◒',category:'炼金 · 待净化',value:28,description:'林间收集的泉水带着淡淡蓝光，也混入了些许杂质。',clue:'真正的月泉水。工坊中可净化成价值 85 金币的月露。',magic:'月相魔力稳定，没有诅咒。',raw:true},
 potion:{id:'potion',name:'净化月露',symbol:'♜',category:'炼金 · 恢复药剂',value:85,description:'清澈的液体映着一轮小小的月亮，是旅途上可靠的补给。',clue:'纯净度合格。冒险者公会的常备药品。',magic:'温和的恢复魔法，无危险成分。'},
 crown:{id:'crown',name:'「圣王」金冠',symbol:'♛',category:'饰品 · 王室旧藏',value:24,description:'金色表面闪闪发亮，卖家保证是百年前的圣王遗物。',clue:'镀层下露出了铜色，宝石内部有气泡。这只是廉价仿品。',magic:'没有任何王室加护。仿品，实际价值只有 24 金币。',fake:true},
 grimoire:{id:'grimoire',name:'逆时禁书',symbol:'▤',category:'古书 · 禁忌魔法',value:310,description:'书页倒着翻动，墨迹似乎比写下它的人更加年轻。',clue:'封底是王国禁书名录上的第十三号符文。',magic:'它只能倒转物品的时间，却以读者的记忆为代价。违禁品。',illegal:true},
 seed:{id:'seed',name:'长梦树种',symbol:'❦',category:'植物 · 古代种',value:105,description:'据说种下它的人，要等一百年才看得到第一次开花。',clue:'果壳来自旧精灵森林，如今已很少有人认得它。',magic:'浓厚但安定的生命魔力，可以合法交易。'},
 ring:{id:'ring',name:'归途戒指',symbol:'◎',category:'饰品 · 旅人遗物',value:190,description:'一枚磨损严重的戒指，总是朝着北方微微发热。',clue:'戒指内部刻着「别忘了回家」。材料是星银。',magic:'它保存着一个家的坐标，那个地方现在只剩下野花。',memory:true},
 scale:{id:'scale',name:'古龙鳞片',symbol:'◇',category:'魔材 · 龙类素材',value:250,description:'黑金色鳞片在灯下投出一片巨大的翅影。',clue:'纹理完整，是古龙自然脱落的鳞片，王国准许买卖。',magic:'龙炎魔力纯净，适合附魔，价值不菲。'},
 bell:{id:'bell',name:'无声银铃',symbol:'♧',category:'饰品 · 纪念物',value:130,description:'怎么摇晃都没有声音，系铃的蓝绳却一直像新的一样。',clue:'铃舌是完整的。它被人为施加了沉默魔法。',magic:'解开魔法，听见勇者小队围着篝火的笑声。',memory:true},
 blood:{id:'blood',name:'赤月精粹',symbol:'♦',category:'炼金 · 禁售药剂',value:280,description:'深红液体似乎在寻找瓶塞上最细小的缝隙。',clue:'无商会封印，疑似地下炼金产物。',magic:'强效魔力伴随精神侵蚀。王国明令禁止交易。',illegal:true},
 compass:{id:'compass',name:'星轨罗盘',symbol:'✵',category:'工具 · 探索装备',value:145,description:'指针不指向北方，只会指向主人最想去的地方。',clue:'齿轮精密，星银指针，产自矮人山城。',magic:'寻路符文完好，可放心收购。'},
 charm:{id:'charm',name:'纸制护身符',symbol:'✥',category:'魔具 · 手作物',value:55,description:'针脚有些歪扭，但缝制的人显然很用心。',clue:'廉价材料，却用上了正统的缝符技法。',magic:'小小的守护魔法是真的。能挡住一次轻微伤害。'},
 repaired:{id:'repaired',name:'修复的骑士剑',symbol:'⚔',category:'武器 · 精钢',value:195,description:'被细心修好的老剑又能陪伴一位新的旅人。',clue:'刃口已修复，状态良好。',magic:'守护魔法运转正常。'}
};
export type Visitor={name:string;title:string;faction:Faction;item:string;ask:number;min:number;portrait:number;line:string;story:string;observation:string;demon?:boolean;poor?:boolean};
const v=(name:string,title:string,faction:Faction,item:string,ask:number,min:number,portrait:number,line:string,story:string,observation:string,extra:Partial<Visitor>={}):Visitor=>({name,title,faction,item,ask,min,portrait,line,story,observation,...extra});
export const visitors:Visitor[]=[
 v('艾琳','远行的精灵','guild','pendant',100,75,-1,'这个吊坠……是一个已经不在的人送的。我想换一点路费，去看看他曾经说过的那片花海。','八十年前，有个人答应陪我看花。对我来说，仿佛只是上个星期。若你愿意保留吊坠，七天后我会回来。','她的指尖反复摩挲银链。说起八十年前的约定，她的眼神依然很温柔。'),
 v('布隆','矮人锻造师','guild','sword',80,55,0,'好钢不会说谎。这把剑修一修，还能用上一百年！','这把剑陪老兵走过北境。他用不动了，让我给它找个新主人。','厚厚的茧子和铁屑粘在掌心，是长年锻造留下的痕迹。'),
 v('薇斯','灰鸦的信使','night','core',130,90,1,'掌柜的，来点能赚大钱的？不用问它是从哪儿来的。','卫队把所有魔核都归为禁品。可城外那些用不起暖炉的人，也需要熬过冬天。','她的袖口藏着一枚灰鸦徽章。说话时总在留意门口。'),
 v('米拉','林间采药人','guild','water',22,15,3,'今早刚从月泉取的。再不净化，里面的魔力就要散掉了。','公会的伤员还在等药。净化后的月露，寄售给公会总不会愁销路。','她身上有青草味，手指染着采药留下的绿色汁液。'),
 v('奥斯','没落贵族','guard','crown',180,100,2,'圣王戴过的金冠！这个价格，只是因为我赶时间。','家族传了很多代。鉴定证书？嗯……我忘在另一座宅邸了。','他避开你的目光，指甲缝里有新鲜的金色颜料。'),
 v('诺伊','迷路的学徒','guild','charm',40,25,5,'这是我做的第一个护身符。够不够换一顿晚饭？','老师说，好的魔法是让人安心。虽然我现在只会这一种。','他掏出护身符时，肚子轻轻叫了一声。', {poor:true}),
 v('赫克','退役的王国骑士','guard','scale',170,125,2,'从北境带回来的。不是偷猎，古龙每一百年会换一次鳞。','那头龙比王国还要年长。它只让我帮忙挠一下够不到的后背。','盔甲上的伤痕很旧。他出示了盖着王国钢印的采集许可。'),
 v('无名旅人','披着人皮的影子','night','blood',100,65,4,'一瓶好药。我的……朋友，都很喜欢。请把门关上。','我记不清家在哪里。人类一般把那些共同居住的人叫作什么来着？','烛火里没有他的影子。他说「母亲」时，像在复述一个没学会的词。',{demon:true}),
 v('米拉','林间采药人','guild','seed',70,45,3,'森林深处捡到的。也许有人愿意等它开花。','种子长大要一百年。我们看不到，但也许我们的孩子可以。','她小心把种子包了三层，外面还放着一小块湿润的苔藓。'),
 v('薇斯','灰鸦的信使','night','grimoire',190,140,1,'今晚卫队会查货。买这本书之前，先想好藏在哪里。','有人愿意用所有积蓄，换亡者留在杯沿的一次温度。','书封上有明显的禁术印记，她没有试图掩饰。'),
 v('布隆','矮人锻造师','guild','compass',95,65,0,'它不指北，只指向你心里的方向。比大多数人的脑袋靠谱。','我年轻时它一直指向矿山。这几年，却总指向老伴的墓。','他用指节敲了敲罗盘，指针依旧稳稳朝向镇外。'),
 v('塞恩','守夜的年轻骑士','guard','ring',125,90,2,'父亲留下的。现在我得买一匹能跑到边境的马。','他总说下次休假就回家，最后只寄回了戒指。我不想再等了。','他握着戒指，眼睛却始终望向敞开的店门。'),
 v('米拉','林间采药人','guild','water',25,15,3,'北境起雾了，药剂价格在涨。今天的月泉水很清。','公会说，魔王倒下不代表所有伤口都愈合了。','水瓶贴着今日的采集日期，瓶口封条完好。'),
 v('诺伊','努力的学徒','guild','bell',85,55,5,'老师说这铃铛坏了。但我总觉得……它在等什么。','我在旧勇者纪念馆的废物箱里找到的。有个字，像是「再见」。','他在认真聆听一只不会响的铃铛，并不着急催你。'),
 v('薇斯','灰鸦的信使','night','core',145,95,1,'你已经知道规矩了。好货，好价，没有名字。','今晚夜市开张。愿意冒险的人，总会找到自己的位置。','她带来一张灰鸦夜市的请柬。背面写着：不问来处。'),
 v('赫克','退役的王国骑士','guard','sword',90,55,2,'明天有最后一次巡查。别让那些乱七八糟的东西毁了你的店。','王国需要法律。但我当年拿起剑，不是为了为难卖家当的孩子。','他把佩剑留在门外，独自走到柜台前。'),
 v('无名商人','过分完美的微笑','night','scale',120,90,4,'我可以提供很多这样的东西。只要你让我……进到里面。','大家都喜欢金币。喜欢，是交换利益的意思，对吧？','他呼吸得很规律，但窗上的薄霜没有被呼吸融化。影子慢了半拍。',{demon:true}),
 v('米拉','林间采药人','guild','water',22,15,3,'最后一批泉水啦。等忙完，去看看街上的灯会吧。','艾琳去了山坡上的墓园。她说，原来人类已经学会把花种在那里。','她的篮子里除药草外，还装着几朵月见草。'),
 v('布隆','矮人锻造师','guild','scale',175,130,0,'给你的最后一笔好生意。听说今天你要买下这间店？','开店和打铁一样。别只看锤下是什么，还得知道它最后会到谁手里。','他拎来一壶热茶，放在柜台边。没有收钱。'),
 v('诺伊','即将出发的学徒','guild','compass',90,60,5,'我找到冒险队了。卖掉这个，刚好够大家坐车去北境。','等我成为了不起的魔法师，也想开一家这样的店，让人能歇歇脚。','他的旅包鼓鼓的，护身符牢牢挂在胸前。'),
 v('艾琳','看过花海的精灵','guild','seed',60,35,-1,'花开了。原来他没有忘记……那片山坡，全都是月见草。','我见到了他的孙女。她笑起来很像他。七天很短，但我想，我会记住这七天。','她这次终于笑了。目光扫过货架，像在寻找一个熟悉的小小光点。')
];
export const news=[
 '王都通告：魔王讨伐八十周年，旧时代遗物交易增多。',
 '月泉商路恢复：公会药剂需求上涨，月露今天溢价 25%。',
 '王国通告：今夜巡查违禁魔材。藏匿的货物不会上架出售。',
 '王都通告：今夜再查禁书；请在打烊前整理仓库。',
 '灰鸦传闻：今夜夜市收货，违禁品售价额外提高 35%。',
 '卫队通告：最后一次巡查将于今夜进行。谨防拟态魔族。',
 '霜叶灯会开始了。所有合法商品今天溢价 20%。'
];
export type Stock={uid:number;itemId:string;paid:number;hidden:boolean;listed:boolean;multiplier:number};
export type Log={day:number;text:string;delta:number};
export type Game={version:2;day:number;visitorIndex:number;gold:number;energy:number;reputation:Record<Faction,number>;heat:number;stock:Stock[];log:Log[];examined:boolean;scanned:boolean;asked:boolean;observed:boolean;patience:number;resolved:boolean;dialogue:string;outcome:string;upgrades:string[];notes:string[];memories:string[];sold:number;profit:number;serial:number;ended:boolean;ending:string;summary:string[];kindness:number;returned:boolean;seed:number};
export const freshGame=():Game=>({version:2,day:1,visitorIndex:0,gold:600,energy:8,reputation:{guild:0,guard:0,night:0},heat:0,stock:[{uid:1,itemId:'water',paid:18,hidden:false,listed:false,multiplier:1},{uid:2,itemId:'charm',paid:25,hidden:false,listed:false,multiplier:1}],log:[{day:1,text:'开店资金',delta:600},{day:1,text:'房东：每天打烊收租，第七天可用 1000 金币买下店铺。',delta:0}],examined:false,scanned:false,asked:false,observed:false,patience:3,resolved:false,dialogue:'',outcome:'',upgrades:[],notes:[],memories:[],sold:0,profit:0,serial:3,ended:false,ending:'',summary:[],kindness:0,returned:false,seed:Math.floor(Math.random()*2**32)});
export type Action={type:string;amount?:number;uid?:number;key?:string;multiplier?:number};
export function currentVisitor(s:Game){return visitors[Math.min((s.day-1)*3+s.visitorIndex,visitors.length-1)]}
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
