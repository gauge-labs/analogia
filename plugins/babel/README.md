# Analogia React Babel preprocessor

## Usage

1. Install preprocessor library

```bash
npm i --save-dev @analogia/babel-plugin-react
```

2. Add the analogia preprocessor

If it doesn't exists, create a `.babelrc` file and add the analogia preprocessor.

```
{
  "plugins": ["@analogia/react"]
}
```

## Using with Webpack

For base Webpack project, use [babel-loader](https://www.npmjs.com/package/babel-loader) in order to use the Babel plugin

1. Install `babel-loader` and the plugin

```bash
npm install -D babel-loader @babel/core @babel/preset-env webpack @analogia/babel-plugin-react
```

2. Add `babel-loader` rule in webpack.config.js

```js
module: {
    rules: [
        {
            test: /\.(?:js|mjs|cjs|ts|tsx|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [['@babel/preset-env', { targets: 'defaults' }]],
                },
            },
        },
    ];
}
```

3. Add the analogia babel plugin

If it doesn't exists, create a `.babelrc` file and add the analogia plugin.

```json
{
    "plugins": ["@analogia/react"]
}
```

4. Run the project normally

## Using with Create react app

To use with Create React App, access to webpack configuration is required to add the preprocessor. This requires either [ejecting the app](https://create-react-app.dev/docs/available-scripts/#npm-run-eject) or using `react-app-rewired`.

### Using react-app-rewired

1. Install dependencies

```
npm install react-app-rewired customize-cra @analogia/babel-plugin-react --save-dev
```

2. Modify the `package.json` scripts

In your package.json, replace react-scripts with react-app-rewired in the start, build, and test scripts.

```json
"scripts": {
  "start": "react-app-rewired start",
  "build": "react-app-rewired build",
  "test": "react-app-rewired test",
  "eject": "react-scripts eject"
},
```

3. Create a `config-overrides.js` file

In the root of your project, create a file named `config-overrides.js` with the following content.

```js
const { override, addBabelPlugins } = require('customize-cra');

module.exports = override(...addBabelPlugins('@analogia/react'));
```

### Ejecting create-react-app

Alternatively, you can eject create-react-app. This exposes the internals of how create-react-app works which allows us to use the preprocessor.

WARNING: This cannot be reversed! Before ejecting, it's highly recommended to commit your current changes to version control. This way, you have a point to revert back to in case something goes wrong during the eject process.

1. Run the Eject Command

In your project directory, run the following command:

```bash
npm run eject
```

You'll notice that the config and scripts folders have been added to your project directory. These folders contain all the configuration files and scripts that were previously managed by CRA, including webpack, Babel, ESLint, etc.

2. Add the analogia preprocessor

If it doesn't exists, create a `.babelrc` file and add the analogia preprocessor.

```bash
{
  "plugins": ["@analogia/react"]
}
```
