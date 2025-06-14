import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // carried across unmodified
        project: './tsconfig.eslint.json',
        sourceType: 'module',
      },
      globals: {
        /* old "env" → explicit globals */
        ...globals.browser,
        ...globals.node,
        ...globals.es6,
        ...globals.mocha,
        /** user-added global */
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Enforces getter/setter pairs in objects
      "accessor-pairs": 0,
      // treat var statements as if they were block scoped
      "block-scoped-var": 2,
      // specify the maximum cyclomatic complexity allowed in a program
      complexity: [0, 11],
      // require return statements to either always or never specify values
      "consistent-return": 0,
      // specify curly brace conventions for all control statements
      curly: [2, "multi-line"],
      // require default case in switch statements
      "default-case": 2,
      // encourages use of dot notation whenever possible
      "dot-notation": [2, {
        allowKeywords: true
      }],
      // enforces consistent newlines before or after dots
      "dot-location": 0,
      // require the use of === and !==
      eqeqeq: 2,
      // make sure for-in loops have an if statement
      "guard-for-in": 2,
      // disabled use of an undefined variable
      "no-undef": 2,
      // disallow the use of console
      "no-console": 0,
      // disallow the use of alert, confirm, and prompt
      "no-alert": 0,
      // disallow use of arguments.caller or arguments.callee
      "no-caller": 2,
      // disallow division operators explicitly at beginning of regular expression
      "no-div-regex": 0,
      // disallow else after a return in an if
      "no-else-return": 0,
      // disallow comparisons to null without a type-checking operator
      "no-eq-null": 2,
      // disallow use of eval()
      "no-eval": 2,
      // disallow adding to native types
      "no-extend-native": 2,
      // disallow unnecessary function binding
      "no-extra-bind": 2,
      // disallow fallthrough of case statements
      "no-fallthrough": 2,
      // disallow the use of leading or trailing decimal points in numeric literals
      "no-floating-decimal": 2,
      // disallow the type conversions with shorter notations
      "no-implicit-coercion": 0,
      // disallow use of eval()-like methods
      "no-implied-eval": 2,
      // disallow this keywords outside of classes or class-like objects
      "no-invalid-this": 0,
      // disallow usage of __iterator__ property
      "no-iterator": 2,
      // disallow use of labeled statements
      "no-labels": 2,
      // disallow unnecessary nested blocks
      "no-lone-blocks": 2,
      // disallow creation of functions within loops
      "no-loop-func": 2,
      // disallow use of multiple spaces
      "no-multi-spaces": 2,
      // disallow use of multiline strings
      "no-multi-str": 2,
      // disallow reassignments of native objects
      "no-native-reassign": 2,
      // disallow use of new operator when not part of the assignment or comparison
      "no-new": 2,
      // disallow use of new operator for Function object
      "no-new-func": 2,
      // disallows creating new instances of String,Number, and Boolean
      "no-new-wrappers": 2,
      // disallow use of (old style) octal literals
      "no-octal": 2,
      // disallow use of octal escape sequences in string literals, such as
      // var foo = "Copyright \251";
      "no-octal-escape": 2,
      // disallow reassignment of function parameters
      "no-param-reassign": 0,
      // disallow use of process.env
      "no-process-env": 0,
      // disallow usage of __proto__ property
      "no-proto": 2,
      // disallow declaring the same variable more then once
      "no-redeclare": 2,
      // disallow use of assignment in return statement
      "no-return-assign": 2,
      // disallow use of `javascript:` urls.
      "no-script-url": 2,
      // disallow comparisons where both sides are exactly the same
      "no-self-compare": 0,
      // disallow use of comma operator
      "no-sequences": 2,
      // restrict what can be thrown as an exception
      "no-throw-literal": 2,
      // disallow usage of expressions in statement position
      "no-unused-expressions": 2,
      // disallow unnecessary .call() and .apply()
      "no-useless-call": 0,
      // disallow use of void operator
      "no-void": 0,
      // disallow usage of configurable warning terms in comments: e.g. todo
      "no-warning-comments": [0, {
        terms: ["todo", "fixme", "xxx"],
        location: "start"
      }],
      // disallow use of the with statement
      "no-with": 2,
      // require use of the second argument for parseInt()
      radix: 2,
      // requires to declare all vars on top of their containing scope
      "vars-on-top": 2,
      // require immediate function invocation to be wrapped in parentheses
      "wrap-iife": [2, "any"],
      // require or disallow Yoda conditions
      yoda: 2,
      // enforce spacing inside array brackets
      "array-bracket-spacing": 2,
      // enforce one true brace style
      "brace-style": [2, "1tbs", {
        allowSingleLine: true
      }],
      // require camel case names
      camelcase: [2, {
        properties: "never"
      }],
      // enforce spacing before and after comma
      "comma-spacing": [2, {
        before: false,
        after: true
      }],
      // enforce one true comma style
      "comma-style": [2, "last"],
      // require or disallow padding inside computed properties
      "computed-property-spacing": 2,
      // enforces consistent naming when capturing the current execution context
      "consistent-this": 0,
      // enforce newline at the end of file, with no multiple empty lines
      "eol-last": 2,
      // require function expressions to have a name
      "func-names": 0,
      // enforces use of function declarations or expressions
      "func-style": 0,
      // this option enforces minimum and maximum identifier lengths (variable names, property names etc.)
      "id-length": 0,
      // this option sets a specific tab width for your code
      indent: [2, 2, { SwitchCase: 1 }],
      // enforces spacing between keys and values in object literal properties
      "key-spacing": [2, {
        beforeColon: false,
        afterColon: true
      }],
      "keyword-spacing": 2,
      // enforces empty lines around comments
      "lines-around-comment": 0,
      // disallow mixed "LF" and "CRLF" as linebreaks
      "linebreak-style": [2, "unix"],
      // specify the maximum depth callbacks can be nested
      "max-nested-callbacks": 0,
      // require a capital letter for constructors
      "new-cap": [2, {
        newIsCap: true
      }],
      // disallow the omission of parentheses when invoking a constructor with no arguments
      "new-parens": 2,
      // allow/disallow an empty newline after var statement
      "newline-after-var": 0,
      // disallow use of the Array constructor
      "no-array-constructor": 0,
      // disallow use of the continue statement
      "no-continue": 0,
      // disallow comments inline after code
      "no-inline-comments": 0,
      // disallow if as the only statement in an else block
      "no-lonely-if": 0,
      // disallow mixed spaces and tabs for indentation
      "no-mixed-spaces-and-tabs": 2,
      // disallow multiple empty lines
      "no-multiple-empty-lines": [2, {
        max: 2
      }],
      // disallow nested ternary expressions
      "no-nested-ternary": 2,
      // disallow use of the Object constructor
      "no-new-object": 2,
      // disallow space between function identifier and application
      "no-spaced-func": 0,
      // disallow the use of ternary operators
      "no-ternary": 0,
      // disallow trailing whitespace at the end of lines
      "no-trailing-spaces": 2,
      // disallow dangling underscores in identifiers
      "no-underscore-dangle": 0,
      // disallow the use of Boolean literals in conditional expressions
      "no-unneeded-ternary": 2,
      // require or disallow padding inside curly braces
      "object-curly-spacing": [2, "always"],
      // allow just one var statement per function
      "one-var": [2, "never"],
      // require assignment operator shorthand where possible or prohibit it entirely
      "operator-assignment": 0,
      // enforce operators to be placed before or after line breaks
      "operator-linebreak": 0,
      // enforce padding within blocks
      "padded-blocks": [2, "never"],
      // require quotes around object literal property names
      "quote-props": [2, "as-needed"],
      // specify whether double or single quotes should be used
      quotes: [2, "single", "avoid-escape"],
      // require identifiers to match the provided regular expression
      "id-match": 0,
      // enforce spacing before and after semicolons
      "semi-spacing": [2, {
        before: false,
        after: true
      }],
      // require or disallow use of semicolons instead of ASI
      semi: [2, "always"],
      // sort variables within the same declaration block
      "sort-vars": 0,
      // require or disallow space before blocks
      "space-before-blocks": 2,
      // require or disallow space before function opening parenthesis
      "space-before-function-paren": [0, { anonymous: "always", named: "never" }],
      // require or disallow spaces inside parentheses
      "space-in-parens": 0,
      // require spaces around operators
      "space-infix-ops": 2,
      // Require or disallow spaces before/after unary operators
      "space-unary-ops": 2,

      /* ES6+ */
      // disallow using `var`. Must use `let` or `const`
      "no-var": 2,
      "no-class-assign": 2,
      "no-const-assign": 2,
      "no-dupe-class-members": 2,
      "no-this-before-super": 2,
      "prefer-const": 0,
      "prefer-spread": 2,
      // require object literal shorthand
      "object-shorthand": [2, "always"],
      "arrow-spacing": 2,
      "prefer-arrow-callback": 2,
      "arrow-parens": [0, "as-needed"],

      "@typescript-eslint/no-unused-vars": "error"
    },
  }
]
