module.exports = {
  ignorePatterns: ['x', '__stories.ts'],
  extends: 'eslint-config-nfour/.eslintrc.react',
  rules: {
    'no-useless-constructor': 0,
    "react/no-unknown-property": [ "error", { "ignore": [ "css" ] } ]
  }
}
