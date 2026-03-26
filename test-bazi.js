// Test bazi calculation
const { getBazi } = require('bazi');

// Test: 王冬的八字 (1995-12-25)
const birthDate = new Date(1995, 11, 25, 14, 0, 0); // 月份从0开始

const result = getBazi(birthDate);

console.log('=== 八字排盘测试 ===');
console.log('出生时间:', birthDate.toLocaleString('zh-CN'));
console.log('');
console.log('年柱:', result.year);
console.log('月柱:', result.month);
console.log('日柱:', result.day);
console.log('时柱:', result.hour);
console.log('');
console.log('日主:', result.day[0]); // 日干
console.log('地支:', result.day[1]); // 日支
console.log('');
console.log('完整八字:', result.year + ' ' + result.month + ' ' + result.day + ' ' + result.hour);
