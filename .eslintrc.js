module.exports = {
    "extends": "airbnb-base",
    rules: {
      "max-len": [1, 120],
      "no-use-before-define": 0,
      "arrow-parens": ["error", "always"],
      "comma-dangle": 0
    },
    env: {
      "browser": true
    },
    globals: {
      firebase: true
    }
};
