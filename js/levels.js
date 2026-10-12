// 关卡元数据：把生成器输出的原始布局补充名称、难度信息与武将分配
import { RAW_LEVELS } from './levels-data.js';
import { parseState } from './solver.js';

export const GENERALS = {
  caocao: { name: '曹操', img: './assets/caocao.jpg', tone: '#c0392b' },
  guanyu: { name: '关羽', img: './assets/guanyu.jpg', tone: '#1e8449' },
  zhangfei: { name: '张飞', img: './assets/zhangfei.jpg', tone: '#34495e' },
  zhaoyun: { name: '赵云', img: './assets/zhaoyun.jpg', tone: '#2e86c1' },
  machao: { name: '马超', img: './assets/machao.jpg', tone: '#d68910' },
  huangzhong: { name: '黄忠', img: './assets/huangzhong.jpg', tone: '#7d3c98' },
  soldier: { name: '兵', img: './assets/soldier.jpg', tone: '#a0522d' }
};

export const TIERS = [
  {
    key: 'easy',
    title: '简单',
    subtitle: '初出茅庐',
    icon: 'ri-seedling-line',
    badge: 'bg-emerald-500',
    names: ['桃园结义', '黄巾之乱', '虎牢关前', '温酒斩华雄', '三英战吕布', '辕门射戟', '煮酒论英雄', '千里走单骑', '过五关', '古城相会', '三顾茅庐', '隆中对', '博望坡', '新野火攻', '长坂坡', '单骑救主', '当阳桥', '舌战群儒', '草船借箭', '苦肉计', '借东风', '连环计', '群英会', '蒋干盗书', '火烧赤壁', '赤壁余烬', '江东烟雨', '荆襄初定', '西川入画', '江陵晓月']
  },
  {
    key: 'normal',
    title: '普通',
    subtitle: '运筹帷幄',
    icon: 'ri-sword-line',
    badge: 'bg-amber-500',
    names: ['华容小道', '智取南郡', '刘备招亲', '甘露寺', '三气周瑜', '定军山', '汉水之战', '单刀赴会', '水淹七军', '刮骨疗毒', '走麦城', '夷陵之战', '白帝托孤', '七擒孟获', '南中平定', '出师表', '天水关', '失街亭', '空城计', '斩马谡', '陈仓道', '祁山道', '木牛流马', '上方谷', '五丈原', '褒斜古道', '箕谷疑兵', '街亭残阵', '汉中烽烟', '剑门晓色']
  },
  {
    key: 'hard',
    title: '困难',
    subtitle: '决胜千里',
    icon: 'ri-fire-line',
    badge: 'bg-rose-500',
    names: ['官渡鏖兵', '乌巢夜袭', '威震逍遥津', '濡须对峙', '汉中争霸', '樊城告急', '襄阳攻防', '江陵烽火', '剑阁天险', '偷渡阴平', '兵临成都', '潼关割须', '渭水之战', '西凉铁骑', '许都风云', '洛阳迷局', '长安古道', '铜雀春深', '卧龙迷阵', '八阵图', '七星灯', '北伐中原', '三分归晋', '天下一统', '华容绝境', '赤壁残局', '锦囊妙计', '六出祁山', '九伐中原']
  }
];

// 竖将优先按“张赵马黄”分配，第一个横将固定为关羽，剩余棋子按序补位
function assignGenerals(pieces) {
  const pool = ['zhangfei', 'zhaoyun', 'machao', 'huangzhong'];
  let guanyuUsed = false;
  const result = pieces.map((p) => {
    if (p.type === 'C') return 'caocao';
    if (p.type === 'S') return 'soldier';
    if (p.type === 'H' && !guanyuUsed) {
      guanyuUsed = true;
      return 'guanyu';
    }
    return null;
  });
  const rest = guanyuUsed ? pool : [...pool, 'guanyu'];
  pieces.forEach((p, i) => {
    if (p.type === 'V' && !result[i] && rest.length) result[i] = rest.shift();
  });
  pieces.forEach((p, i) => {
    if (!result[i]) result[i] = rest.shift() || 'soldier';
  });
  return result;
}

function buildLevels() {
  const levels = {};
  TIERS.forEach((tier) => {
    const raw = Array.isArray(RAW_LEVELS[tier.key]) ? RAW_LEVELS[tier.key] : [];
    levels[tier.key] = raw
      .filter((lv) => lv && typeof lv.state === 'string' && lv.state.length === 20)
      .map((lv, idx) => {
        const pieces = parseState(lv.state);
        const generals = assignGenerals(pieces);
        return {
          id: `${tier.key}-${idx + 1}`,
          tier: tier.key,
          index: idx,
          no: idx + 1,
          name: lv.name || tier.names[idx] || `${tier.title}第${idx + 1}关`,
          state: lv.state,
          optimal: Number(lv.optimal) || 0,
          pieces: pieces.map((p, i) => ({ ...p, general: generals[i] }))
        };
      });
  });
  return levels;
}

export const LEVELS = buildLevels();

export function getLevel(tierKey, index) {
  const list = LEVELS[tierKey];
  if (!Array.isArray(list)) return null;
  return list[index] || null;
}

export function getTier(tierKey) {
  return TIERS.find((t) => t.key === tierKey) || TIERS[0];
}
