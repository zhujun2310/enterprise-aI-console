module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
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
      ]
    ],
    'subject-empty': [2, 'never']
  }
};
