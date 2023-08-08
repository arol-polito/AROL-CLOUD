// module.exports = {
//     "env": {},
//     "extends": [
//         "eslint:recommended",
//         "plugin:@typescript-eslint/recommended"
//     ],
//     "overrides": [
//         {
//             "env": {
//                 "node": true
//             },
//             "files": [
//                 ".eslintrc.{js,cjs}"
//             ],
//             "parserOptions": {
//                 "sourceType": "script"
//             }
//         }
//     ],
//     "parser": "@typescript-eslint/parser",
//     "parserOptions": {
//         "ecmaVersion": "latest"
//     },
//     "plugins": [
//         "@typescript-eslint"
//     ],
//     "rules": {}
// }
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
    },
    env: {
        commonjs: true,
        es2021: true,
        node: true
    },
    plugins: ['@typescript-eslint', 'import', 'prefer-arrow'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        // 'prettier',
    ],
    rules: {
        curly: ['error', 'multi'],
        'prefer-arrow/prefer-arrow-functions': [
            'error',
            {
                disallowPrototype: true,
                singleReturnOnly: true,
            },
        ],
        'newline-before-return': 'error',
        'callback-return': 'warn',
        'consistent-return': 'error',
        'dot-notation': 'warn',
        'jsx-a11y/anchor-is-valid': 'off',
        'no-debugger': 'warn',
        'no-confusing-arrow': 'off',
        'no-console': [
            'error',
            {
                allow: ['warn', 'error', 'debug'],
            },
        ],
        'no-prototype-builtins': 'off',
        'no-duplicate-imports': 'off',
        'no-else-return': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-return-assign': ['error'],
        'arrow-body-style': ['error', 'as-needed', {requireReturnForObjectLiteral: false}],
        'no-return-await': 'error',
        'no-self-compare': 'warn',
        'no-sequences': 'error',
        'no-unneeded-ternary': 'error',
        'no-unused-expressions': 'off',
        'no-useless-concat': 'error',
        'no-useless-constructor': 'warn',
        'no-useless-return': 'warn',
        'no-var': 'error',
        'prefer-arrow-callback': 'warn',
        'prefer-const': 'error',
        'prefer-object-spread': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'warn',
        'require-await': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/no-namespace": "off"
    },
}

