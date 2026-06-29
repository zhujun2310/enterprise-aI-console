const { execSync } = require('node:child_process');
const { definePrompt } = require('cz-git');

const scopes = [
  'repo',
  'admin',
  'server',
  'auth',
  'ai-sdk',
  'constants',
  'hooks',
  'request',
  'types',
  'ui',
  'utils',
  'docs',
  'ci',
  'deps',
  'release'
];

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function getIssueKeyFromBranch(branchName) {
  const match = branchName.match(/[A-Z][A-Z0-9]+-[0-9]+/);
  return match ? match[0] : 'N/A';
}

module.exports = definePrompt({
  messages: {
    type: '选择提交类型:',
    scope: '选择影响范围:',
    customScope: '请输入自定义 scope:',
    subject: '填写简短描述:\n',
    body: '填写详细描述，可使用 "|" 分隔换行，留空可跳过:\n',
    breaking: '填写破坏性变更说明，留空可跳过:\n',
    footerPrefixesSelect: '选择关联方式:',
    customFooterPrefix: '请输入自定义 footer 前缀:',
    footer: '填写工单号，当前阶段无工单可直接使用默认值 N/A，多个可用逗号分隔:\n',
    confirmCommit: '确认提交以上信息?'
  },
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      缺陷修复' },
    { value: 'docs', name: 'docs:     文档更新' },
    { value: 'style', name: 'style:    代码格式调整' },
    { value: 'refactor', name: 'refactor: 重构优化' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     测试相关' },
    { value: 'build', name: 'build:    构建系统变更' },
    { value: 'ci', name: 'ci:       CI/CD 变更' },
    { value: 'chore', name: 'chore:    杂项维护' },
    { value: 'revert', name: 'revert:   回滚变更' }
  ],
  scopes,
  allowCustomScopes: false,
  allowEmptyScopes: false,
  issuePrefixes: [{ value: 'Refs:', name: 'Refs:    当前阶段统一使用' }],
  allowCustomIssuePrefix: false,
  allowEmptyIssuePrefix: false,
  defaultFooterPrefix: 'Refs:',
  defaultIssues: getIssueKeyFromBranch(getCurrentBranch()),
  breaklineChar: '|',
  skipQuestions: [],
  useEmoji: false
});
