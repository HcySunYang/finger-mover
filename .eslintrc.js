module.exports = {
    root: true,
    parser: 'babel-eslint',
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    "env": {
        "browser": true,
        "es6": true
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-dupe-args": "error",
        "no-extra-semi": "error",
        "no-multi-spaces": "error",
        "no-redeclare": "error",
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "func-call-spacing": "error",
        "key-spacing": [
            "error",
            {
                "beforeColon": false,
                "afterColon": true,
                "mode": "strict"
            }
        ],
        "keyword-spacing": [
            "error",
        ],
        "space-before-blocks": "error",
        "space-before-function-paren": [
            "error",
            {
                "anonymous": "always",
                "named": "always",
                "asyncArrow": "always"
            }
        ],
        "space-infix-ops": "error",
        "space-unary-ops": [
            "error",
            {
                "words": true,
                "nonwords": false
            }
        ],
        "arrow-spacing": "error",
        "constructor-super": "error",
        "no-const-assign": "error",
        "no-this-before-super": "error",
        "no-var": "error"
    }
}