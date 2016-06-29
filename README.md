# to-sass-value

Converts a JavaScript value to its corresponding Sass value for use in @node-sass.

## Why?

- Some people who use Sass still struggle with the syntaxes of Sass elements (such as
  maps and functions).
- You want to have more control over your Sass stylesheets, particularly on parts where
  you think will involve heavy back-and-forth JavaScript-Sass interaction.
- You want to avoid declaring too many variables, functions, etc.
- I'm inspired by [SassyJSON](http://hugogiraudel.com/2014/01/20/json-in-sass/) and what
  [Webpack](https://webpack.github.io) can do.

## Installation

Via NPM:

	$ npm install --save @theoryofnekomata/to-sass-value

## Usage

```javascript
var toSassValue = require('@theoryofnekomata/to-sass-value');

var sassString = toSassValue('a'),
	sassList = [1, 2, 3, 4, 5],
	sassMap = { a: 'b', c: 'gdfg' };

// use it with node-sass however you want
```

## Notes

It supports conversion of:
- numbers + optional units (integers and floats)
- strings
- arrays
- objects
- colors
- Booleans
- `null` and `undefined`
- dates (powered by [Moment.js](https://momentjs.com))

It does not support conversion of
- functions (converts it to `SassTypes.Null.NULL`)
- complex objects (such as recursive ones)

## Contribution

Sure thing! Just clone the repo.

`to-sass-value` uses [Jasmine](https://jasmine.github.io) for unit tests, and
[ESLint](http://eslint.org) to make sure code is written consistently (and implied it will
run consistently as well).

- Run `npm install` upon initial clone.
- Run `npm test` and make sure all the tests pass and properly written.
- Run `npm run lint` to ensure consistency of your code (make sure to install ESLint first).
- Create PRs so that I can confirm and merge your contributions.

Please star the repo if you find it useful in your projects.

## License

MIT. See [LICENSE file](https://raw.githubusercontent.com/Temoto-kun/to-sass-value/master/LICENSE) for details.
