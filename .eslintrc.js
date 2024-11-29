module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:import/typescript",
        "prettier"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": true,
        "tsconfigRootDir": __dirname
    },
    "plugins": [
        "@typescript-eslint", 
        "eslint-plugin-import"
    ],
    "root": true,
    "rules": {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/no-misused-promises": ["error", {
            "checksVoidReturn": {
                // Esto porque los handlers (middleware y controlador) de router.get post patch etc,
                // esperan un retorno void, pero casi siempre se devuelve Promise<void> en realidad,
                // asi que sacamos esta parte de la regla para que no joda por ahora.
                // Sirve en ciertos casos, pero medio que Express no arregla eso aun
                "arguments": false
            }
        }],
        "import/no-cycle": [
            "error",
            {
                "maxDepth": 10,
                "ignoreExternal": true
            }
        ]
    }
}
