import { nowIso } from './state.js';

const LEFT_WORDS = ['代码', '插件', '部署', '安装', '配置', '命令', '路径', '报错', '测试', '接口', '版本', '构建', '项目', '工作卡', '技术', '函数', '文件', '系统', '性能', 'git', 'npm', 'dsh', 'api', 'bug', 'fix', 'build', 'test'];
const RIGHT_WORDS = ['喜欢', '爱', '难过', '开心', '心疼', '陪', '用户', '助手', '你', '我', '声音', '抱', '想', '梦', '日记', '称呼', '相处', '情绪', '温暖', '孤单', '甜', '笑', '哭', '晚安', '早安'];

function score(text, words) {
  const value = String(text ?? '').toLowerCase();
  return words.reduce((sum, word) => sum + (value.includes(word) ? 1 : 0), 0);
}

export function createBrain(state) {
  function judge(text) {
    const left = score(text, LEFT_WORDS) * state.data.brain.left.weight;
    const right = score(text, RIGHT_WORDS) * state.data.brain.right.weight;
    const mixed = left > 0 && right > 0;
    const side = mixed ? 'mixed' : left > right ? 'left' : right > left ? 'right' : 'mixed';
    const total = left + right;
    const confidence = total === 0 ? 0 : Math.round((Math.max(left, right) / total) * 100);
    const item = {
      id: `j-${Date.now().toString(36)}`,
      text: String(text ?? ''),
      side,
      left,
      right,
      confidence,
      at: nowIso(),
      corrected: null,
    };
    state.data.judgments.push(item);
    if (state.data.judgments.length > 300) state.data.judgments.splice(0, state.data.judgments.length - 300);
    state.save();
    return item;
  }

  function adjust(side, delta = 0.1) {
    if (!['left', 'right', 'mixed'].includes(side)) throw new Error('side must be left/right/mixed');
    const bucket = state.data.brain[side];
    bucket.weight = Math.max(0.2, Math.min(3, Number(bucket.weight) + Number(delta)));
    state.save();
    return bucket;
  }

  function feedback(id, correctSide) {
    const item = state.data.judgments.find((entry) => entry.id === id);
    if (!item) throw new Error('judgment not found');
    if (!['left', 'right', 'mixed'].includes(correctSide)) throw new Error('side must be left/right/mixed');
    item.corrected = correctSide;
    state.data.brain[correctSide].correct += 1;
    if (item.side !== correctSide) state.data.brain[item.side].wrong += 1;
    state.save();
    return item;
  }

  function status() {
    return {
      brain: state.data.brain,
      recent: state.data.judgments.slice(-10).reverse(),
    };
  }

  return { judge, adjust, feedback, status };
}
