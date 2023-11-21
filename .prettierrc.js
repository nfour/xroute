module.exports = {
  ...require('eslint-config-nfour/.prettierrc'),
  semi: false,
  
  overrides: [
    {
      files: "docs/examples.tsx",
      options: {
        semi: true,
        printWidth: 50
      }
    },
  ]
}