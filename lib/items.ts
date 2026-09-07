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
