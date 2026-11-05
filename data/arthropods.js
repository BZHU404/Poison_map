/* 毒物谱 · 有毒节肢动物数据（4 条）
 * 仅用于创作与形态示意，不构成捕捉、饲养、医疗或急救指南。
 * 不提供采集、保活、取毒或任何咬伤/蜇伤处理方法。
 */

window.POISON_ARTHROPODS = [
  {
    id: "latrodectus-mactans",
    kind: "arthropod",
    name: "黑寡妇蜘蛛",
    en: "Southern Black Widow",
    latin: "Latrodectus mactans",
    family: "球蛛科 Theridiidae",
    genus: "寇蛛属 Latrodectus",
    aliases: ["黑寡妇", "Black widow", "Hourglass spider"],
    summary: "北美常见的寇蛛，雌蛛腹面有红色沙漏斑。毒液为神经毒素，咬伤后疼痛可向胸腹扩散，伴肌肉痉挛与自主神经症状；重症少见但需就医。",
    hazard: {
      level: 4,
      source: "雌蛛的螯肢与毒腺；雄蛛体型小，咬伤风险较低",
      mechanism: "α-蛛毒蛋白作用于神经末梢，引起疼痛、肌肉痉挛与自主神经兴奋",
      symptoms: ["局部肿痛", "肌肉疼痛", "心悸", "恶心呕吐", "呼吸困难", "抽搐"],
      onset: "咬伤后 30 分钟–2 小时；疼痛可向胸部、腹部或全身扩散（参考）",
      lethal: "少数重症可致死（儿童、老人、基础病患者风险更高）",
      note: "黑寡妇通常不主动攻击，咬伤多发生在清理杂物、搬动木堆或触碰蛛网时。"
    },
    length: "雌蛛体长 8–15 毫米；含腿展约 3–4 厘米",
    venom: "神经毒素，主要引起疼痛、肌肉痉挛与自主神经症状",
    activity: "结不规则网，喜隐蔽角落；夜间活动",
    habitat: "北美南部的木堆、石缝、棚屋、厕所与杂物堆。",
    habitatTypes: ["人居", "旷野"],
    routeTags: ["咬伤"],
    distribution: "北美，尤其美国南部与西部；近缘种分布于全球温暖地区。",
    profile: [
      { label: "体长", value: "雌蛛 8–15 毫米，腿展约 3–4 厘米。" },
      { label: "毒性", value: "神经毒素，可致疼痛、痉挛与自主神经症状。" },
      { label: "毒器", value: "雌蛛螯肢；雄蛛较小。" },
      { label: "活动", value: "夜间结网，喜隐蔽处。" },
      { label: "辨识", value: "体黑亮，雌蛛腹面常有红色沙漏斑；雄蛛体小、斑纹不同。" },
      { label: "生境", value: "木堆、石缝、棚屋与杂物堆。" }
    ],
    lookalikes: [
      { name: "其他寇蛛属", diff: "红背蛛等近缘种也有神经毒；沙漏斑颜色与形状因种而异。" },
      { name: "普通家蛛", diff: "体型、网型与腹部斑纹不同；不要用手辨认活蛛。" }
    ],
    protection: "清理木堆、石缝与久置杂物时戴厚手套；先检查鞋子、工具与储物箱；不要徒手翻动蛛网。",
    firstAid: "立即联系急救或毒物中心。保持安静，清洗咬伤处周围，保留蜘蛛照片或样本供鉴定；不要切开、吸吮或自行用药。",
    legend: "“黑寡妇”这个名字来自雌蛛在交配后有时会吃掉雄蛛的观察，也被流行文化放大成危险的女性隐喻。真正的咬伤风险更像一次被打扰的防御。",
    creative: "适合写一间久无人住的木屋：角色在床底拖出旧箱子，指尖被什么轻轻刺了一下。疼痛从手背爬向胸口，像一根越拉越紧的线。",
    misuse: "徒手清理木堆；把黑亮蜘蛛都当黑寡妇；用“没看到沙漏”判断安全；切开或吸吮伤口。",
    trivia: "黑寡妇的红色沙漏斑位于腹面，很多照片只拍背面，因此容易被误认。",
    art: {
      type: "arthropod",
      form: "spider",
      palette: { body: "#2F2B28", accent: "#A0432B", shadow: "#6C5D4D" }
    }
  },
  {
    id: "phoneutria-nigriventer",
    kind: "arthropod",
    name: "巴西流浪蜘蛛",
    en: "Brazilian Wandering Spider",
    latin: "Phoneutria nigriventer",
    family: "栉蛛科 Ctenidae",
    genus: "Phoneutria",
    aliases: ["香蕉蜘蛛", "Armed spider", "Wandering spider"],
    summary: "南美洲的大型游猎蜘蛛，不结网伏击，毒液含强效神经毒素。咬伤可致剧烈疼痛、出汗、心悸、呼吸困难和异常勃起，重症需紧急就医。",
    hazard: {
      level: 4,
      source: "螯肢与毒腺；受威胁时可能站立示威",
      mechanism: "神经毒素影响离子通道与神经递质释放，可致疼痛、自主神经风暴与呼吸循环症状",
      symptoms: ["局部肿痛", "肌肉疼痛", "心悸", "呼吸困难", "抽搐", "恶心呕吐"],
      onset: "咬伤后数分钟–1 小时；疼痛与全身症状可迅速出现（参考）",
      lethal: "可能（重症可致死，儿童与体弱者风险更高）",
      note: "它常被误称为“香蕉蜘蛛”，但并非所有个体都藏在香蕉串里；不要徒手翻动水果箱、柴堆或鞋物。"
    },
    length: "体长 17–48 毫米；含腿展可达 15 厘米",
    venom: "神经毒素，可致疼痛、自主神经兴奋与呼吸循环症状",
    activity: "游猎，不结固定网；夜间活动，白天藏于阴暗处",
    habitat: "南美热带与亚热带森林、香蕉种植园、人居附近。",
    habitatTypes: ["热带", "人居", "林地"],
    routeTags: ["咬伤"],
    distribution: "南美洲，尤其巴西、阿根廷与乌拉圭；偶随农产品进入其他地区。",
    profile: [
      { label: "体长", value: "17–48 毫米，腿展可达 15 厘米。" },
      { label: "毒性", value: "强效神经毒素，可致全身症状。" },
      { label: "毒器", value: "螯肢与毒腺；受威胁时可能站立。" },
      { label: "活动", value: "游猎，夜间活动。" },
      { label: "辨识", value: "体形较大，腿粗壮，背部有纵向浅纹；不能靠“像香蕉”判断。" },
      { label: "生境", value: "南美热带林地、种植园与人居附近。" }
    ],
    lookalikes: [
      { name: "其他栉蛛科", diff: "游猎蜘蛛种类多，外形相近；不要徒手捕捉。" },
      { name: "狼蛛", diff: "狼蛛多在地面活动，体型与眼列不同；非专业鉴定不可靠。" }
    ],
    protection: "检查鞋物、衣物与水果箱；翻动木堆时戴手套；不要徒手捕捉或挑逗游猎蜘蛛。",
    firstAid: "立即联系急救或毒物中心。保持安静，记录时间与症状；不要切开、吸吮或自行用药。",
    legend: "它因偶尔藏在香蕉货物中而被媒体称为“香蕉蜘蛛”，但真正的栖息地远比水果箱复杂。它不结网等待，而是主动游走，这让相遇更难预测。",
    creative: "适合写港口仓库的夜班：工人打开一箱香蕉，一只大蜘蛛从纸箱缝里站起来。它并不追击，只是被逼到墙角；真正的危机是有人伸手去拍。",
    misuse: "把“香蕉蜘蛛”当成只在香蕉里出现；徒手翻箱；把大型游猎蛛都当同一物种；用杀虫剂近距离喷赶。",
    trivia: "巴西流浪蜘蛛的毒液曾被发现可致异常勃起，相关毒素因此成为药理研究对象；这不意味着咬伤是安全的。",
    art: {
      type: "arthropod",
      form: "spider",
      palette: { body: "#6E5A43", accent: "#A0432B", shadow: "#3E352B" }
    }
  },
  {
    id: "leiurus-quinquestriatus",
    kind: "arthropod",
    name: "以色列金蝎",
    en: "Deathstalker Scorpion",
    latin: "Leiurus quinquestriatus",
    family: "钳蝎科 Buthidae",
    genus: "Leiurus",
    aliases: ["死亡追踪者", "Yellow scorpion", "Deathstalker"],
    summary: "中东与北非沙漠的黄色蝎子，毒液含多种神经毒素。蜇伤可致剧痛、心悸、呼吸困难、抽搐与昏迷，儿童与老人尤其危险。",
    hazard: {
      level: 4,
      source: "尾节毒针与毒腺",
      mechanism: "神经毒素作用于钠、钾与氯通道，可致自主神经风暴、肌肉痉挛与呼吸循环衰竭",
      symptoms: ["局部肿痛", "心悸", "肌肉疼痛", "呼吸困难", "抽搐", "昏迷"],
      onset: "蜇伤后数分钟–1 小时；儿童可在短时间内迅速恶化（参考）",
      lethal: "可能（儿童、老人与基础病患者风险更高）",
      note: "它常藏在石头、鞋子和睡袋下；不要徒手翻动沙漠中的石块与杂物。"
    },
    length: "体长 3–8 厘米",
    venom: "多种神经毒素，可致自主神经与呼吸循环症状",
    activity: "夜行，白天藏于石缝、沙洞与杂物下",
    habitat: "中东与北非的沙漠、半沙漠、岩石地带。",
    habitatTypes: ["旷野", "山地"],
    routeTags: ["蜇伤 / 刺伤"],
    distribution: "中东、北非与部分东地中海地区。",
    profile: [
      { label: "体长", value: "3–8 厘米。" },
      { label: "毒性", value: "神经毒素，可致严重全身症状。" },
      { label: "毒器", value: "尾节毒针与毒腺。" },
      { label: "活动", value: "夜行，白天藏于石缝与沙洞。" },
      { label: "辨识", value: "体色黄褐至淡黄，尾部较粗；钳子相对细长。" },
      { label: "生境", value: "中东与北非沙漠、岩石地带。" }
    ],
    lookalikes: [
      { name: "其他钳蝎科", diff: "蝎类外形相近，毒性差异大；不能靠颜色或体型判断。" },
      { name: "无毒蝎", diff: "尾针与体形结构不同，但非专业鉴定不可靠；不要徒手接触任何蝎子。" }
    ],
    protection: "在沙漠与岩区穿封闭鞋袜；抖开鞋子、睡袋与衣物；不要徒手翻石块或木柴。",
    firstAid: "立即联系急救或毒物中心。保持安静并尽快就医；不要切开、吸吮、冰敷或自行用药。",
    legend: "它被称为“死亡追踪者”，名字比体型更有压迫感。真实的蝎子并不追踪人，它只是把身体藏在石头下，等待被惊扰。",
    creative: "适合写沙漠考古营地：队员在夜里把靴子倒过来，一只淡黄色蝎子从鞋口滑出。它没有追击，只是在沙地上竖起尾巴；真正的危险是有人下意识去踩。",
    misuse: "徒手翻石块；把浅色小蝎当“无毒”；用酒精或民间方法处理蜇伤；忽视儿童症状。",
    trivia: "蝎子在紫外线下会发出荧光，这是外骨骼中的某些化合物造成的；但紫光灯不能替代专业鉴定。",
    art: {
      type: "arthropod",
      form: "scorpion",
      palette: { body: "#B49A62", accent: "#7A4A34", shadow: "#6C5B3E" }
    }
  },
  {
    id: "atrax-robustus",
    kind: "arthropod",
    name: "悉尼漏斗网蛛",
    en: "Sydney Funnel-web Spider",
    latin: "Atrax robustus",
    family: "漏斗网蛛科 Atracidae",
    genus: "Atrax",
    aliases: ["漏斗网蛛", "Funnel-web spider", "Sydney funnel-web"],
    summary: "澳大利亚悉尼盆地的黑色大型蜘蛛，雄性在交配季会四处游走。毒液可致快速神经毒性，历史上曾造成死亡；现代抗毒血清与急救显著改善预后。",
    hazard: {
      level: 5,
      source: "螯肢与毒腺；雄性在交配季更常进入人居",
      mechanism: "δ-六毒素等神经毒素可致神经肌肉兴奋、自主神经风暴与肺水肿",
      symptoms: ["口舌麻木", "肌肉无力", "呼吸困难", "昏迷", "心悸", "恶心呕吐"],
      onset: "咬伤后 15 分钟–3 小时；严重者症状可迅速进展（参考）",
      lethal: "是（历史上有致死记录；现代救治可显著改善预后）",
      note: "雄性在潮湿季节会进入车库、花园与泳池边。不要徒手处理，也不要依赖“黑色大蜘蛛”的民间判断。"
    },
    length: "体长 1–5 厘米；腿展可达 6–8 厘米",
    venom: "神经毒素，可致快速神经肌肉与自主神经症状",
    activity: "地面筑漏斗状网；雄性交配季外出游走",
    habitat: "澳大利亚悉尼盆地湿润林地、花园、车库与岩石缝。",
    habitatTypes: ["林地", "人居", "海岸"],
    routeTags: ["咬伤"],
    distribution: "澳大利亚新南威尔士州悉尼盆地及周边。",
    profile: [
      { label: "体长", value: "1–5 厘米，腿展可达 6–8 厘米。" },
      { label: "毒性", value: "神经毒素，可致快速全身症状。" },
      { label: "毒器", value: "螯肢与毒腺；雄性更具攻击性。" },
      { label: "活动", value: "地面筑漏斗网；雄性交配季游走。" },
      { label: "辨识", value: "体黑亮，头胸部有光泽，螯肢粗壮；网呈漏斗状。" },
      { label: "生境", value: "悉尼盆地湿润林地、花园与车库。" }
    ],
    lookalikes: [
      { name: "其他漏斗网蛛科", diff: "多个近缘种都有毒，外形相近；不要用手鉴定。" },
      { name: "狼蛛与地蛛", diff: "体型与眼列不同，但非专业鉴定不可靠；所有大型黑色蜘蛛都应保持距离。" }
    ],
    protection: "在分布区穿封闭鞋袜；检查泳池、车库与花园角落；不要徒手翻动石块、木柴与落叶堆。",
    firstAid: "立即呼叫急救，保持安静并尽快就医。不要切开、吸吮或使用紧束带；如可能，记录蜘蛛外观供鉴定。",
    legend: "悉尼漏斗网蛛是澳大利亚最著名的毒蜘蛛之一。它的危险不只来自毒液，也来自雄性在雨季离开洞穴、进入人类生活空间的行为。",
    creative: "适合写暴雨后的郊区泳池：水面上漂着一只黑色大蜘蛛，角色用网兜去捞。它顺着网杆爬上来，螯肢在灯下像两枚黑色短钩。",
    misuse: "用手或拖鞋拍打；把黑色大蜘蛛都当漏斗网蛛；用“它没追我”判断安全；忽视雄性在交配季的游走。",
    trivia: "悉尼漏斗网蛛的雄性毒液对灵长类毒性更强，这也是它与其他蜘蛛不同的医学特点。",
    art: {
      type: "arthropod",
      form: "funnelweb",
      palette: { body: "#2D2926", accent: "#8A5A3B", shadow: "#5B4B3D" }
    }
  },
  {
    id: "lytta-vesicatoria",
    kind: "arthropod",
    name: "斑蝥",
    en: "Spanish Fly",
    latin: "Lytta vesicatoria",
    family: "芫菁科 Meloidae",
    genus: "斑蝥属 Lytta",
    aliases: ["西班牙苍蝇", "Blister beetle", "Cantharides"],
    summary: "一种金属绿至铜色的芫菁，体液含斑蝥素（cantharidin）。它被错误地当作“春药”，实际会造成皮肤水疱、消化道与泌尿生殖道损伤，甚至死亡。",
    topics: ["催情传说", "春药", "斑蝥素"],
    hazard: {
      level: 4,
      source: "成虫体液与斑蝥素；压碎或接触皮肤即可释放",
      mechanism: "斑蝥素抑制磷酸酶，造成皮肤与黏膜水疱、消化道腐蚀、肾损伤与出血",
      symptoms: ["局部肿痛", "皮肤灼伤", "恶心呕吐", "腹泻", "出血", "昏迷"],
      onset: "接触或食入后数十分钟–数小时；黏膜与消化道症状可迅速出现（参考）",
      lethal: "可能（可致消化道腐蚀、肾衰竭与出血）",
      note: "斑蝥素不会制造真正的性欲，只会造成组织损伤与中毒。任何把斑蝥当春药或“情趣”用法的叙事，都应把它写成暴力与伤害，而不是浪漫。"
    },
    length: "1.5–2.5 厘米",
    venom: "斑蝥素（cantharidin）",
    activity: "成虫取食寄主植物，受惊时从关节分泌含斑蝥素的液体",
    habitat: "欧洲、亚洲与北非的草地、灌丛与寄主植物附近。",
    habitatTypes: ["旷野", "林地"],
    routeTags: ["皮肤接触", "食入"],
    distribution: "欧洲、西亚、中亚与北非；北美有近缘斑蝥。",
    profile: [
      { label: "体长", value: "1.5–2.5 厘米。" },
      { label: "毒性", value: "斑蝥素，可致水疱、腐蚀与肾损伤。" },
      { label: "毒器", value: "体液与关节分泌；压碎时释放。" },
      { label: "活动", value: "白天活动，取食寄主植物。" },
      { label: "辨识", value: "体呈金属绿、铜绿或金绿色，鞘翅有光泽；触角较长。" },
      { label: "生境", value: "欧洲、亚洲与北非的草地与灌丛。" }
    ],
    lookalikes: [
      { name: "金龟子", diff: "金龟子体形较圆、鞘翅坚硬，通常不分泌斑蝥素；不要用手压碎任何金属色甲虫。" },
      { name: "芫菁科其他种", diff: "多种芫菁都含斑蝥素，外形与金属光泽相近；不能靠颜色区分。" }
    ],
    protection: "不要徒手捕捉或压碎金属色甲虫；若接触体液，立即用大量清水冲洗并就医；不要将其用于皮肤或黏膜。",
    firstAid: "立即用清水冲洗接触部位，并联系急救或毒物中心。不要自行催吐、使用油膏或挑破水疱；保留虫体照片或样本。",
    legend: "“西班牙苍蝇”这个名字来自它被磨成粉末后造成的灼热与水疱，被误当成催情效果。历史上它多次造成中毒与死亡，却仍在民间传说里被包装成春药。",
    creative: "适合写一场被美化的宴会：有人把金属绿色甲虫磨成粉，声称能让人“失控”。真正发生的是口腔灼痛、呕吐、血尿与恐惧。把这场戏写成下药与暴力，而不是欲望的胜利。",
    misuse: "把斑蝥磨粉加入酒或食物；涂在皮肤上制造“刺激”；相信水疱代表药效；给不知情的人使用。",
    trivia: "斑蝥素是芫菁科甲虫的防御性萜类，不是性激素；它造成的水疱与刺激常被误读为“催情”。",
    art: {
      type: "arthropod",
      form: "beetle",
      palette: { body: "#4E6E5A", accent: "#B08A45", shadow: "#2E3C32" }
    }
  },
  {
    id: "loxosceles-reclusa",
    kind: "arthropod",
    name: "褐隐遁蛛",
    en: "Brown Recluse",
    latin: "Loxosceles reclusa",
    family: "丝蛛科 Sicariidae",
    genus: "隐遁蛛属 Loxosceles",
    aliases: ["提琴蜘蛛", "Brown recluse", "Violin spider"],
    summary: "美国中南部常见的隐遁蛛，头胸部有提琴状斑。咬伤可致局部坏死、疼痛与罕见全身溶血反应；它通常躲避人类。",
    hazard: {
      level: 3,
      source: "螯肢与毒腺；咬伤多发生在衣物/床铺被压住时",
      mechanism: "鞘磷脂酶 D 等毒素可致局部组织坏死、溶血与凝血异常",
      symptoms: ["局部肿痛", "皮肤溃疡", "皮疹", "恶心呕吐", "心悸", "昏迷"],
      onset: "咬伤后数小时–数日；局部坏死可在数天内逐渐出现（参考）",
      lethal: "可能（罕见全身溶血、肾损伤或儿童重症）",
      note: "多数褐隐遁蛛咬伤只有局部反应，但坏死性伤口容易继发感染；不要自行切开或挤压。"
    },
    length: "体长 6–12 毫米；腿展约 2–3 厘米",
    venom: "组织坏死性毒液，可致局部溃疡与罕见溶血",
    activity: "夜行，喜干燥隐蔽处；不结规整网",
    habitat: "美国中南部室内衣柜、阁楼、床下与室外木堆。",
    habitatTypes: ["人居", "旷野"],
    routeTags: ["咬伤"],
    colorTags: ["褐"],
    distribution: "美国中南部与中西部，从德克萨斯到田纳西、密苏里等地。",
    profile: [
      { label: "体长", value: "6–12 毫米，腿展 2–3 厘米。" },
      { label: "毒性", value: "组织坏死性毒液，罕见全身溶血。" },
      { label: "毒器", value: "螯肢与毒腺。" },
      { label: "活动", value: "夜行，喜干燥隐蔽处。" },
      { label: "辨识", value: "体褐色，头胸部有提琴状斑，眼六枚。" },
      { label: "生境", value: "室内衣柜、阁楼与室外木堆。" }
    ],
    lookalikes: [
      { name: "其他隐遁蛛", diff: "隐遁蛛属多种外形相近，部分毒性较弱；不能靠“提琴斑”单独鉴定。" },
      { name: "普通家蛛", diff: "家蛛眼列、体形与斑纹不同；不要徒手辨认活蛛。" }
    ],
    protection: "抖开衣物、鞋子与床品；清理木堆和纸箱时戴手套；不要徒手翻动久置杂物。",
    firstAid: "清洗咬伤周围并尽快就医；不要切开、挤压或吸吮伤口。保留蜘蛛照片或样本；出现发热、血尿、黄疸等全身症状时立即急救。",
    legend: "“隐遁蛛”这个名字来自它躲避人类的习性。它不主动攻击，咬伤多发生在被衣物或床铺压住时；真正的危险常是继发感染与延误就医。",
    creative: "适合写一间久未打扫的出租屋：角色从床底拖出旧箱子，手腕被什么轻轻刺了一下。几天后伤口中央发黑、边缘红肿，医生却说“只是虫咬”。",
    misuse: "把皮肤溃烂都归咎于隐遁蛛；切开或挤压伤口；徒手清理旧衣物；忽视全身症状。",
    trivia: "褐隐遁蛛有六只眼，而非大多数蜘蛛的八只；眼列是鉴定特征之一。",
    art: { type: "arthropod", form: "spider", mark: "fiddle", palette: { body: "#6E5A43", accent: "#8A5A3B", shadow: "#3E352B" } }
  },
  {
    id: "latrodectus-hasselti",
    kind: "arthropod",
    name: "红背蜘蛛",
    en: "Redback Spider",
    latin: "Latrodectus hasselti",
    family: "球蛛科 Theridiidae",
    genus: "寇蛛属 Latrodectus",
    aliases: ["红背黑寡妇", "Redback spider"],
    summary: "澳大利亚常见的寇蛛，雌蛛背部有红色纵带。毒液为神经毒素，咬伤可致局部疼痛、出汗、肌肉痉挛与全身疼痛。",
    hazard: {
      level: 4,
      source: "雌蛛螯肢与毒腺；雄蛛较小",
      mechanism: "神经毒素作用于神经末梢，引起疼痛、肌痉挛与自主神经兴奋",
      symptoms: ["局部肿痛", "肌肉疼痛", "心悸", "恶心呕吐", "呼吸困难", "抽搐"],
      onset: "咬伤后数十分钟–数小时；疼痛可向胸腹或全身扩散（参考）",
      lethal: "少数重症可致死（儿童、老人与基础病患者风险更高）",
      note: "红背蜘蛛常藏在户外家具、棚屋与厕所角落；它不主动攻击，但被触碰时会咬人。"
    },
    length: "雌蛛体长 8–12 毫米；腿展约 2–3 厘米",
    venom: "神经毒素，可致疼痛、肌痉挛与自主神经症状",
    activity: "结不规则网，喜隐蔽角落；夜间活动",
    habitat: "澳大利亚的棚屋、户外家具、石缝与厕所。",
    habitatTypes: ["人居", "旷野"],
    routeTags: ["咬伤"],
    colorTags: ["黑", "红"],
    distribution: "澳大利亚全境，尤其城市与半干旱地区；新西兰等地有引入。",
    profile: [
      { label: "体长", value: "雌蛛 8–12 毫米，腿展 2–3 厘米。" },
      { label: "毒性", value: "神经毒素，可致疼痛与肌痉挛。" },
      { label: "毒器", value: "雌蛛螯肢；雄蛛较小。" },
      { label: "活动", value: "夜行，结不规则网。" },
      { label: "辨识", value: "体黑亮，雌蛛背部有红色纵带，腹面有沙漏斑。" },
      { label: "生境", value: "棚屋、户外家具、石缝与厕所。" }
    ],
    lookalikes: [
      { name: "黑寡妇蜘蛛 Latrodectus mactans", diff: "黑寡妇腹面有红色沙漏斑；红背蜘蛛背部有红色纵带，分布地不同。" },
      { name: "普通家蛛", diff: "体形与斑纹不同；不要徒手辨认活蛛。" }
    ],
    protection: "检查户外家具、玩具与鞋子；清理棚屋戴手套；不要徒手翻动蛛网。",
    firstAid: "立即联系急救或毒物中心。保持安静，清洗咬伤周围，保留蜘蛛照片或样本；不要切开、吸吮或自行用药。",
    legend: "红背蜘蛛在澳大利亚的城市里与人共处，常藏在厕所座圈下或儿童玩具里。它不追击，但“伸手不见五指”的角落是它的领地。",
    creative: "适合写澳洲夏季的烧烤夜：客人从棚屋搬出旧椅子，手指被椅底的红背蜘蛛咬到。疼痛从手臂爬向胸口，主人却笑着说“澳洲人都被咬过”。",
    misuse: "徒手搬旧家具；把红背当普通家蛛；切开或吸吮伤口；忽视儿童症状。",
    trivia: "红背蜘蛛的雄蛛会被雌蛛吃掉，这也是“黑寡妇”类名字的来源之一。",
    art: { type: "arthropod", form: "spider", mark: "hourglass", palette: { body: "#2F2B28", accent: "#A0432B", shadow: "#6C5D4D" } }
  },
  {
    id: "androctonus-australis",
    kind: "arthropod",
    name: "黄肥尾蝎",
    en: "Yellow Fat-tailed Scorpion",
    latin: "Androctonus australis",
    family: "钳蝎科 Buthidae",
    genus: "肥尾蝎属 Androctonus",
    aliases: ["北非肥尾蝎", "Yellow fat-tailed scorpion", "Aatz"],
    summary: "北非与中东的粗尾蝎，体色黄褐，尾部粗壮。毒液含强效神经毒素，蜇伤可致剧痛、心悸、呼吸困难、抽搐与昏迷。",
    hazard: {
      level: 4,
      source: "尾节毒针与毒腺",
      mechanism: "神经毒素作用于钠、钾与氯通道，可致自主神经风暴、肌肉痉挛与呼吸循环衰竭",
      symptoms: ["局部肿痛", "心悸", "肌肉疼痛", "呼吸困难", "抽搐", "昏迷"],
      onset: "蜇伤后数分钟–1 小时；儿童可迅速恶化（参考）",
      lethal: "可能（儿童、老人与基础病患者风险更高）",
      note: "它常藏在石头、鞋子与睡袋下；不要徒手翻动沙漠中的石块和杂物。"
    },
    length: "体长 4–9 厘米",
    venom: "多种神经毒素，可致严重全身症状",
    activity: "夜行，白天藏于石缝、沙洞与杂物下",
    habitat: "北非与中东的沙漠、半沙漠与岩石地带。",
    habitatTypes: ["旷野", "山地"],
    routeTags: ["蜇伤 / 刺伤"],
    colorTags: ["黄", "褐"],
    distribution: "北非、中东与部分东地中海地区。",
    profile: [
      { label: "体长", value: "4–9 厘米。" },
      { label: "毒性", value: "神经毒素，可致严重全身症状。" },
      { label: "毒器", value: "尾节毒针与毒腺。" },
      { label: "活动", value: "夜行，藏于石缝与沙洞。" },
      { label: "辨识", value: "体黄褐，尾部粗壮；钳子相对细长。" },
      { label: "生境", value: "北非与中东沙漠、岩石地带。" }
    ],
    lookalikes: [
      { name: "以色列金蝎 Leiurus quinquestriatus", diff: "以色列金蝎体色更淡、尾较细；两者都是高毒蝎，不能靠颜色区分。" },
      { name: "其他肥尾蝎", diff: "肥尾蝎属多种毒性强，外形相近；不要徒手接触任何蝎子。" }
    ],
    protection: "在沙漠与岩区穿封闭鞋袜；抖开鞋子、睡袋与衣物；不要徒手翻石块或木柴。",
    firstAid: "立即联系急救或毒物中心。保持安静并尽快就医；不要切开、吸吮、冰敷或自行用药。",
    legend: "“肥尾”指的是它粗壮的尾节与毒腺。它不需要追人，只要有人把手伸进它藏身的石块。",
    creative: "适合写沙漠营地：夜里队员倒出靴子里的沙，一只黄褐色蝎子从鞋口滑出。它没有追击，只是竖起尾巴；真正的危险是有人下意识去拍。",
    misuse: "徒手翻石块；把浅色小蝎当“无毒”；用酒精或民间方法处理蜇伤；忽视儿童症状。",
    trivia: "肥尾蝎属的毒性在蝎目中名列前茅；但大多数蜇伤仍发生在被动的防御场景。",
    art: { type: "arthropod", form: "scorpion", palette: { body: "#B49A62", accent: "#7A4A34", shadow: "#6C5B3E" } }
  },
  {
    id: "tityus-serrulatus",
    kind: "arthropod",
    name: "巴西黄蝎",
    en: "Brazilian Yellow Scorpion",
    latin: "Tityus serrulatus",
    family: "钳蝎科 Buthidae",
    genus: "Tityus",
    aliases: ["Brazilian yellow scorpion", "Yellow scorpion"],
    summary: "巴西常见的黄蝎，可孤雌繁殖，适应城市环境。毒液含强效神经毒素，蜇伤可致剧痛、呕吐、出汗、心悸与肺水肿。",
    hazard: {
      level: 4,
      source: "尾节毒针与毒腺",
      mechanism: "神经毒素可致自主神经风暴、心肌损伤与肺水肿",
      symptoms: ["局部肿痛", "心悸", "恶心呕吐", "呼吸困难", "抽搐", "昏迷"],
      onset: "蜇伤后数分钟–1 小时；儿童可迅速出现全身症状（参考）",
      lethal: "可能（儿童与老人风险更高；可致肺水肿与心衰）",
      note: "它常进入城市住宅、下水道与杂物堆；不要徒手翻动鞋子或瓦砾。"
    },
    length: "体长 4–7 厘米",
    venom: "神经毒素，可致自主神经与心肺症状",
    activity: "夜行，藏于瓦砾、下水道与室内角落",
    habitat: "巴西的城市与半干旱地区，常见于人类居住环境。",
    habitatTypes: ["人居", "旷野", "热带"],
    routeTags: ["蜇伤 / 刺伤"],
    colorTags: ["黄", "褐"],
    distribution: "巴西，尤其东南部城市；其他南美地区有近缘种。",
    profile: [
      { label: "体长", value: "4–7 厘米。" },
      { label: "毒性", value: "神经毒素，可致心肺症状。" },
      { label: "毒器", value: "尾节毒针与毒腺。" },
      { label: "活动", value: "夜行，藏于瓦砾与室内角落。" },
      { label: "辨识", value: "体黄褐，尾部有锯齿状脊；钳子较细。" },
      { label: "生境", value: "巴西城市与半干旱环境。" }
    ],
    lookalikes: [
      { name: "其他 Tityus 属", diff: "南美黄蝎属多种外形相近、毒性强；不能靠颜色或体型判断。" },
      { name: "无毒蝎", diff: "尾针与体形结构不同，但非专业鉴定不可靠；不要徒手接触。" }
    ],
    protection: "穿封闭鞋袜；抖开鞋子与衣物；不要徒手翻瓦砾、下水道盖板与木堆。",
    firstAid: "立即联系急救或毒物中心。保持安静并尽快就医；不要切开、吸吮、冰敷或自行用药。",
    legend: "巴西黄蝎能孤雌繁殖，一只雌蝎就可能建立新的城市种群。它把“毒物”带进了下水道与卧室，而不是荒野。",
    creative: "适合写圣保罗的旧公寓：角色在浴室地漏旁看到一只小黄蝎，以为“这么小不会有毒”。几分钟后，孩子开始呕吐、出汗、呼吸急促。",
    misuse: "把小型黄蝎当无害；徒手翻下水道盖；用拖鞋拍打；忽视儿童症状。",
    trivia: "巴西黄蝎可孤雌生殖，未交配的雌蝎也能产下后代，这让它更容易扩散。",
    art: { type: "arthropod", form: "scorpion", palette: { body: "#C0A25E", accent: "#8A5A3B", shadow: "#6C5B3A" } }
  },
  {
    id: "sicarius-terrosus",
    kind: "arthropod",
    name: "六眼沙蛛",
    en: "Six-eyed Sand Spider",
    latin: "Sicarius terrosus",
    family: "丝蛛科 Sicariidae",
    genus: "Sicarius",
    aliases: ["Six-eyed sand spider", "Sand spider"],
    summary: "非洲南部的沙地蜘蛛，体色与沙粒几乎一致，只有六只眼。毒液含强效坏死与溶血成分，咬伤罕见但可能非常严重。",
    hazard: {
      level: 4,
      source: "螯肢与毒腺；受惊时可能咬伤",
      mechanism: "毒液含坏死与溶血成分，可致局部组织损伤、弥散性血管内凝血与多器官损伤",
      symptoms: ["局部肿痛", "皮肤溃疡", "出血", "恶心呕吐", "呼吸困难", "昏迷"],
      onset: "咬伤后数小时–数日；局部与全身症状可延迟（参考）",
      lethal: "可能（罕见但已有严重中毒与死亡记录）",
      note: "它常把身体埋进沙里，只露出眼与螯肢；不要徒手筛沙或翻动沙堆。"
    },
    length: "体长 8–15 毫米；腿展约 3–4 厘米",
    venom: "坏死与溶血性毒液，可致 DIC 与多器官损伤",
    activity: "夜行，伏于沙中；行动缓慢",
    habitat: "非洲南部沙漠、沙丘与干燥河床。",
    habitatTypes: ["旷野", "山地"],
    routeTags: ["咬伤"],
    colorTags: ["黄", "褐"],
    distribution: "非洲南部，尤其纳米比亚与南非的沙漠地区。",
    profile: [
      { label: "体长", value: "8–15 毫米，腿展 3–4 厘米。" },
      { label: "毒性", value: "坏死与溶血性毒液，可致 DIC。" },
      { label: "毒器", value: "螯肢与毒腺。" },
      { label: "活动", value: "夜行，伏于沙中。" },
      { label: "辨识", value: "体沙黄至红褐，六眼，体表与沙粒相似。" },
      { label: "生境", value: "非洲南部沙漠、沙丘与干河床。" }
    ],
    lookalikes: [
      { name: "褐隐遁蛛 Loxosceles reclusa", diff: "褐隐遁蛛头胸部有提琴斑、分布北美；六眼沙蛛分布非洲南部、体色更似沙。" },
      { name: "普通沙地蜘蛛", diff: "眼列与体色不同；不要徒手在沙中翻找。" }
    ],
    protection: "在沙漠地区穿封闭鞋袜、戴手套；不要徒手筛沙或翻动沙堆；帐篷拉链保持闭合。",
    firstAid: "立即联系急救或毒物中心。保留蜘蛛照片或样本；不要切开、吸吮或挤压伤口；尽快就医。",
    legend: "六眼沙蛛几乎把身体变成沙粒的一部分。它不结网追捕，而是伏击；这使它在故事里更像“沙中的陷阱”。",
    creative: "适合写沙漠考古：队员在沙丘上筛土，手套破了一个小口。几天后手臂出现大片坏死与出血点，谁也没想到凶手只有指甲大小。",
    misuse: "徒手筛沙；把沙色蜘蛛当普通虫子；切开伤口；因为咬伤不痛而延误就医。",
    trivia: "六眼沙蛛只有六只眼，且能长时间埋在沙中等待猎物。",
    art: { type: "arthropod", form: "spider", mark: "none", palette: { body: "#B49A6A", accent: "#8A5A3B", shadow: "#6C5B3E" } }
  }
];
