module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
    },
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    plugins: ['@typescript-eslint', 'import', 'jsx-a11y', 'react', 'react-hooks', 'prefer-arrow'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        // 'prettier',
        'plugin:react-hooks/recommended',
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
        'react/display-name': 'off',
        'react/jsx-boolean-value': 'warn',
        'react/jsx-curly-brace-presence': [
            'warn',
            {
                props: 'never',
                children: 'never',
            },
        ],
        'react/jsx-filename-extension': [
            'error',
            {
                extensions: ['.jsx', '.tsx'],
            },
        ],
        'react/jsx-sort-props': [
            'error',
            {
                noSortAlphabetically: true,
                reservedFirst: true,
                shorthandLast: true,
            },
        ],
        'react/no-access-state-in-setstate': 'error',
        'react/no-deprecated': 'warn',
        'react/no-direct-mutation-state': 'error',
        'react/no-this-in-sfc': 'error',
        'react/no-unescaped-entities': 'off',
        'react/prop-types': 'off',
        'react/self-closing-comp': 'error',
        'react-hooks/exhaustive-deps': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        "@typescript-eslint/prefer-nullish-coalescing": "off"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
}
