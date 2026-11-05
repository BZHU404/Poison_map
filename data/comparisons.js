/* 毒物谱 · 相似植物对照资料
 * 对照种（可食／常见）只用于形态区分，不是采食、药用或加工指南。
 * 每一条主植物至少配一组对照；targetId 对应本文件的参考条目。
 */

window.POISON_COMPARE_REFERENCES = [
  { id: "water-dropwort", name: "水芹", en: "Water Dropwort", latin: "Oenanthe javanica", family: "伞形科 Apiaceae", status: "可食 / 常见", summary: "水田、沟渠与湿地常见的伞形科香草，嫩茎叶在部分地区作蔬菜；与毒芹同科，但气味、茎部斑纹与花序细节不同。" },
  { id: "honeysuckle", name: "金银花", en: "Japanese Honeysuckle", latin: "Lonicera japonica", family: "忍冬科 Caprifoliaceae", status: "常见 / 药用", summary: "常见攀援灌木，花成对腋生，初白后黄，有香气；花蕾在传统药用中使用，但不能与钩吻的亮黄色漏斗花混为一谈。" },
  { id: "okra", name: "秋葵", en: "Okra", latin: "Abelmoschus esculentus", family: "锦葵科 Malvaceae", status: "可食 / 常见", summary: "常见蔬菜，果实为长角果，具纵棱，切面有黏液；与曼陀罗的带刺蒴果、蓖麻的带刺果序形态不同。" },
  { id: "almond", name: "甜杏仁", en: "Sweet Almond", latin: "Prunus dulcis", family: "蔷薇科 Rosaceae", status: "可食 / 常见", summary: "通常来自甜扁桃，种子较大、味甜，是常见坚果与烘焙原料；与杏的苦味种子不是同一来源，也不能凭外形互换。" },
  { id: "sweet-potato", name: "红薯", en: "Sweet Potato", latin: "Ipomoea batatas", family: "旋花科 Convolvulaceae", status: "可食 / 常见", summary: "常见块根作物，叶心形或裂叶，块根甜软；与木薯的掌状深裂叶、含氰苷块根不同。" },
  { id: "taro", name: "芋头", en: "Taro", latin: "Colocasia esculenta", family: "天南星科 Araceae", status: "常见食材；不可生食", summary: "天南星科常见块茎作物，叶盾形、宽大；与半夏、天南星的野生块茎不能混采，生芋头也有刺激性。" },
  { id: "konjac", name: "魔芋", en: "Konjac", latin: "Amorphophallus konjac", family: "天南星科 Araceae", status: "常见食材；须专门加工", summary: "天南星科块茎作物，花序大、佛焰苞明显；块茎必须经过专门加工才能食用，不能把野生天南星当魔芋。" },
  { id: "chives", name: "韭菜", en: "Chinese Chives", latin: "Allium tuberosum", family: "石蒜科 Amaryllidaceae", status: "可食 / 常见", summary: "常见葱属蔬菜，叶片扁平、有葱蒜气味；与铃兰、水仙、石蒜的带状叶和鳞茎不同。" },
  { id: "garlic", name: "大蒜", en: "Garlic", latin: "Allium sativum", family: "石蒜科 Amaryllidaceae", status: "可食 / 常见", summary: "常见葱属作物，鳞茎分瓣、气味强烈；与秋水仙的球茎、花形不同。" },
  { id: "guava", name: "番石榴", en: "Guava", latin: "Psidium guajava", family: "桃金娘科 Myrtaceae", status: "可食 / 常见", summary: "热带常见果树，果实有香气，果肉白、粉或黄；与毒番石榴的小苹果状果实和乳白树液不同。" },
  { id: "adzuki", name: "红豆", en: "Adzuki Bean", latin: "Vigna angularis", family: "豆科 Fabaceae", status: "可食 / 常见", summary: "常见豆类，种子暗红、有白色种脐；与相思子的红黑双色种子不同。" },
  { id: "perilla", name: "紫苏", en: "Perilla", latin: "Perilla frutescens", family: "唇形科 Lamiaceae", status: "可食 / 常见", summary: "常见香草，叶对生、有香气，茎方形；与荨麻的粗糙叶面和蜇毛不同。" },
  { id: "peach", name: "桃", en: "Peach", latin: "Prunus persica", family: "蔷薇科 Rosaceae", status: "可食 / 常见", summary: "常见果树，叶卵状披针形，果实有纵沟；与夹竹桃的革质狭长叶、强心苷毒性不同。" },
  { id: "tomato", name: "番茄", en: "Tomato", latin: "Solanum lycopersicum", family: "茄科 Solanaceae", status: "可食 / 常见", summary: "常见茄科蔬菜，果实多汁、成熟红或黄；与颠茄的亮黑色小浆果和托烷生物碱不同。" },
  { id: "eggplant", name: "茄子", en: "Eggplant", latin: "Solanum melongena", family: "茄科 Solanaceae", status: "可食 / 常见", summary: "常见茄科蔬菜，果实大、紫或白；与天仙子的蒴果、钟状花和托烷生物碱不同。" },
  { id: "spinach", name: "菠菜", en: "Spinach", latin: "Spinacia oleracea", family: "苋科 Amaranthaceae", status: "可食 / 常见", summary: "常见叶菜，叶基生、柔嫩；与商陆幼株、洋地黄的粗糙叶面与毒性不同。" },
  { id: "soybean", name: "黄豆", en: "Soybean", latin: "Glycine max", family: "豆科 Fabaceae", status: "可食 / 常见", summary: "常见豆类，种子圆润、淡黄；与巴豆的有花纹种子、巴豆油毒性不同。" },
  { id: "mango", name: "芒果", en: "Mango", latin: "Mangifera indica", family: "漆树科 Anacardiaceae", status: "可食 / 常见", summary: "热带常见果树，果实大、有果香；与海檬树的小芒果状果实和强心苷毒性不同。" },
  { id: "cashew", name: "腰果", en: "Cashew", latin: "Anacardium occidentale", family: "漆树科 Anacardiaceae", status: "可食 / 常见", summary: "常见坚果，原产于热带美洲；与毒漆藤同科，但毒漆藤的汁液含漆酚，接触可致严重皮炎。" },
  { id: "fig", name: "无花果", en: "Fig", latin: "Ficus carica", family: "桑科 Moraceae", status: "可食 / 常见", summary: "常见果树，隐头花序，果实内部中空；与见血封喉的白色乳汁和剧毒不同。" },
  { id: "anthurium", name: "红掌", en: "Flamingo Flower", latin: "Anthurium andraeanum", family: "天南星科 Araceae", status: "常见观赏；不作食用", summary: "常见观赏植物，佛焰苞红、粉或白，肉穗花序明显；与一品红的杯状花序和白色乳汁不同。" },
  { id: "dandelion", name: "蒲公英", en: "Dandelion", latin: "Taraxacum mongolicum", family: "菊科 Asteraceae", status: "可食 / 常见", summary: "常见野草，基生叶莲座状、黄色头状花序；与乌头的盔状花、块根和乌头碱毒性不同。" },
  { id: "nutmeg", name: "肉豆蔻", en: "Nutmeg", latin: "Myristica fragrans", family: "肉豆蔻科 Myristicaceae", status: "常见香料", summary: "常见香料种子，表面有网状纹理，气味浓；与马钱子的纽扣状种子和士的宁毒性不同。" },
  { id: "rapeseed", name: "油菜", en: "Rapeseed", latin: "Brassica napus", family: "十字花科 Brassicaceae", status: "可食 / 常见", summary: "常见油料与蔬菜作物，花黄色、四瓣，果实为角果；与博落回的黄绿色花、毒性不同。" }
  ,{ id: "cinnamon", name: "肉桂", en: "Cinnamon", latin: "Cinnamomum verum", family: "樟科 Lauraceae", status: "常见香料", summary: "常见香料，使用树皮卷成桂皮筒，甜辛香明显；与肉豆蔻的种子、育亨宾的苦味树皮不同。" }
  ,{ id: "mugwort", name: "艾草", en: "Mugwort", latin: "Artemisia vulgaris", family: "菊科 Asteraceae", status: "可食 / 常见", summary: "常见蒿属植物，叶形与苦艾相近，但苦艾叶更银灰、味更苦，精油风险更高；不要用外形判断采食。" }

  ,{ id: "corn-poppy", name: "虞美人", en: "Corn Poppy", latin: "Papaver rhoeas", family: "罂粟科 Papaveraceae", status: "常见观赏", summary: "常见观赏罂粟，茎叶有毛、花较小；与鸦片罂粟的蒴果、乳汁和生物碱不同。" }
  ,{ id: "azalea", name: "杜鹃花", en: "Azalea", latin: "Rhododendron simsii", family: "杜鹃花科 Ericaceae", status: "常见观赏", summary: "常见观赏杜鹃，花色丰富；杜鹃花属多种含木藜芦毒素，不要采食花蜜或花瓣。" }

];

window.POISON_PLANT_COMPARISONS = {
  datura: { targetId: "okra", diff: "曼陀罗果实是带刺蒴果，秋葵是长角果、有纵棱；曼陀罗全株含托烷生物碱，秋葵是常见蔬菜。" },
  belladonna: { targetId: "tomato", diff: "颠茄浆果亮黑、单生，番茄果实较大、成熟红或黄；颠茄全株含托烷生物碱，不能以“茄科果实”判断可食。" },
  aconitum: { targetId: "dandelion", diff: "乌头有盔状蓝紫花与肥厚块根，蒲公英是基生叶和黄色头状花序；乌头全株含乌头碱，不能当野菜。" },
  gelsemium: { targetId: "honeysuckle", diff: "钩吻花亮黄色、漏斗状，金银花成对腋生、白转黄、花冠二唇形；钩吻全株剧毒，不能以“黄花”判断。" },
  nerium: { targetId: "peach", diff: "夹竹桃叶革质、狭长、轮生，桃叶卵状披针形；夹竹桃全株含强心苷，桃是果树。" },
  ricinus: { targetId: "okra", diff: "蓖麻果实为带刺蒴果、种子有花纹，秋葵果实长角状、有纵棱；蓖麻种子含蓖麻毒素，不可食用。" },
  conium: { targetId: "water-dropwort", diff: "毒芹茎常带紫斑、复伞形花序，水芹是湿地香草、茎叶有清香；毒芹全株含毒芹碱，不能以“芹菜叶”判断。" },
  hyoscyamus: { targetId: "eggplant", diff: "天仙子花钟状、黄绿带紫脉，果实为蒴果；茄子果实大、紫或白，是常见蔬菜；天仙子含托烷生物碱。" },
  strychnos: { targetId: "nutmeg", diff: "马钱子种子扁圆、灰黄、纽扣状，肉豆蔻种子有网状纹理、是香料；马钱子含士的宁，不可食用。" },
  abrus: { targetId: "adzuki", diff: "相思子种子红黑分明、有光泽，红豆暗红、有白色种脐；相思子含相思子毒素，不能煮食。" },
  digitalis: { targetId: "spinach", diff: "洋地黄叶基生、叶面皱、花穗高，菠菜叶柔嫩可食；洋地黄含强心苷，不能当野菜。" },
  manchineel: { targetId: "guava", diff: "毒番石榴果实似小苹果、树液乳白，番石榴果实有香气、果肉白或粉；毒番石榴全株有毒。" },
  convallaria: { targetId: "chives", diff: "铃兰叶宽、椭圆形、基生，韭菜叶扁平、有葱蒜味；铃兰全株含强心苷，不能当韭菜。" },
  colchicum: { targetId: "garlic", diff: "秋水仙球茎与花像小型百合/番红花，大蒜鳞茎分瓣、有蒜味；秋水仙含秋水仙碱，不能食用。" },
  narcissus: { targetId: "chives", diff: "水仙叶带状、花有副花冠，韭菜叶扁平有香味；水仙鳞茎含石蒜碱，不能当韭菜。" },
  lycoris: { targetId: "chives", diff: "石蒜叶带状、花辐射状，韭菜有葱蒜味；石蒜全株含石蒜碱，不能采食。" },
  phytolacca: { targetId: "spinach", diff: "商陆幼株叶形似菠菜，但商陆有紫红色茎和浆果、根肥大；商陆全株有毒，不能当野菜。" },
  croton: { targetId: "soybean", diff: "巴豆种子椭圆形、表面有花纹，黄豆圆润、淡黄；巴豆含巴豆油与毒性蛋白，不可食用。" },
  tripterygium: { targetId: "honeysuckle", diff: "雷公藤是木质藤本、叶互生、花小，金银花是藤本、花成对、白转黄；雷公藤全株有毒。" },
  cerbera: { targetId: "mango", diff: "海檬树果实似小芒果、树液乳白，芒果果实大、有果香；海檬树全株含强心苷。" },
  toxicodendron: { targetId: "cashew", diff: "毒漆藤是三出复叶、接触可致皮炎，腰果是漆树科坚果；毒漆藤汁液含漆酚，不能接触。" },
  antiaris: { targetId: "fig", diff: "见血封喉有白色乳汁、果实似小无花果，无花果是常见果树；见血封喉乳汁剧毒，不能接触。" },
  macleaya: { targetId: "rapeseed", diff: "博落回有黄色花、叶大，油菜花黄色但果实为角果；博落回全株有毒，不能当野菜。" },
  euphorbia: { targetId: "anthurium", diff: "一品红有红色苞片和白色乳汁，红掌有佛焰苞但同样不作食用；两者都只能观赏，不能入口。" },
  "prunus-armeniaca": { targetId: "almond", diff: "苦杏仁味苦、来自杏，甜杏仁来自甜扁桃、味甜；两者种子外形相近，不能凭“杏仁”混用。" },
  "manihot-esculenta": { targetId: "sweet-potato", diff: "木薯叶掌状深裂、块根含氰苷，红薯叶心形、块根甜软；木薯不可生食。" },
  "urtica-dioica": { targetId: "perilla", diff: "荨麻叶有蜇毛、粗糙，紫苏叶对生、有香气、无蜇毛；不要徒手采。" },
  "pinellia-ternata": { targetId: "taro", diff: "半夏三小叶、植株小，芋头叶盾形、块茎可食；生半夏刺激性强，不能混采。" },
  "arisaema-erubescens": { targetId: "konjac", diff: "天南星掌状叶、佛焰苞更长，魔芋块茎需专门加工；两者同科，不能把野生块茎当魔芋。" }
  ,"mandragora-officinarum": { targetId: "tomato", diff: "曼德拉草浆果小、橙红，番茄果实大、多汁；曼德拉草全株含托烷生物碱，不能以“像小番茄”判断。" }
  ,"myristica-fragrans": { targetId: "cinnamon", diff: "肉豆蔻是圆形种子、表面有网状纹理，肉桂是卷曲树皮、甜辛香；两者都是香料，但部位和毒性不同。" }
  ,"pausinystalia-johimbe": { targetId: "cinnamon", diff: "育亨宾是茜草科苦味树皮，肉桂是樟科甜辛香树皮；育亨宾含育亨宾生物碱，不能当香料使用。" }
  ,"artemisia-absinthium": { targetId: "mugwort", diff: "苦艾叶更银灰、味更苦，艾草是常见食用/药用蒿属；苦艾精油不可内服，不能与艾草混用。" }

  ,"papaver-somniferum": { targetId: "corn-poppy", diff: "鸦片罂粟蒴果大、茎叶较光滑，虞美人茎叶有毛、花较小；鸦片罂粟的乳汁含吗啡类生物碱，不能以“罂粟花”观赏或采制。" }
  ,"cannabis-sativa": { targetId: "perilla", diff: "大麻为掌状复叶、小叶披针形；紫苏叶对生、卵形、有香气。两者外形不同，且大麻的使用受法律管制。" }
  ,"physostigma-venenosum": { targetId: "adzuki", diff: "毒扁豆种子较大、褐色，含胆碱酯酶抑制剂；红豆暗红、有白色种脐，是常见豆类。不能把毒扁豆当豆类煮食。" }
  ,"rhododendron-molle": { targetId: "azalea", diff: "闹羊花为黄色漏斗状花，杜鹃花常为红/粉/白；两者都属杜鹃花属，花蜜与花瓣都可能含木藜芦毒素。" }
  ,"strophanthus-kombe": { targetId: "honeysuckle", diff: "毒毛旋花为夹竹桃科藤本、种子含强心苷；金银花为忍冬科、花成对、白转黄。不能把毒毛旋花当金银花。" }

};
