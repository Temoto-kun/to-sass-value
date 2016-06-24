/**
 * to-sass-value
 * Converts a JavaScript value to its corresponding Sass value.
 *
 * Author: TheoryOfNekomata <allan.crisostomo@outlook.com>
 * License: MIT
 */

(function () {
    var sass = require('node-sass'),
        parseColor = require('parse-color'),
        booleanStrings,
        colorChannelStrings,

        // ReSharper disable once DuplicatingLocalDeclaration
        toSassValue,

        // ReSharper disable once InconsistentNaming
        SassBoolean = sass.types.Boolean,
        SassString = sass.types.String,
        SassNumber = sass.types.Number,
        SassColor = sass.types.Color,
        SassList = sass.types.List,
        SassMap = sass.types.Map,
        SassNull = sass.types.Null;

    /**
     * Parses a color string.
     * @param colorString A color string
     * @returns {Array|undefined} The RGB(A) color channels, or undefined if the string cannot be parsed as a color.
     */
    function parseColorString(colorString) {
        var parsedColorValues = parseColor(colorString);

        return parsedColorValues.rgba || parsedColorValues.rgb;
    }

    function isValidColorValues(red, green, blue, alpha) {
        const maxChannel = 255,
            maxAlpha = 1.0,
            minChannel = 0,
            minAlpha = 0.0,

            isAboveMax = (red > maxChannel ||
                green > maxChannel ||
                blue > maxChannel ||
                alpha > maxAlpha),
            isBelowMin = (red < minChannel ||
                green < minChannel ||
                blue < minChannel ||
                alpha < minAlpha);

        return !(isAboveMax || isBelowMin);
    }

    function isValidColorObject(obj) {
        // TODO don't restrict to RGB(A)
        // TODO normalize attributes (e.g. red => r, alpha => a, etc.)
        return (Object.keys(obj).length === 4 &&
            !isNaN(obj.r) &&
            !isNaN(obj.g) &&
            !isNaN(obj.b) &&
            !isNaN(obj.a)
        );
    }

    /**
     * Converts a JavaScript value to a Sass color.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassColor|null} A Sass color, or null if jsValue cannot be parsed as a color.
     */
    function toSassColor(jsValue) {
        var values;

        switch (typeof jsValue) {
            case 'string':
                values = parseColorString(jsValue.trim().toLowerCase());

                if (!values) {
                    return null;
                }
                break;
            case 'object':
                if (!isValidColorObject(jsValue)) {
                    return null;
                }

                values = [ jsValue.r, jsValue.g, jsValue.b, jsValue.a ];
                break;
            default:
                return null;
        }

        if (isNaN(values[3])) {
            values[3] = 1.0;
        }

        if (!isValidColorValues.apply(null, values)) {
            return null;
        }

        return new SassColor(values[0], values[1], values[2], values[3]);
    }

    /**
     * Determines if a unit is valid in CSS.
     * @param {String} unit A unit string.
     * @returns {Boolean} Is unit valid?
     */
    function isValidUnit(unit) {
        return ['%', 'cm', 'em', 'ex', 'in', 'mm', 'pc', 'pt', 'px', 'vh', 'vw', 'vmin', 'vmax', 'ch', 'rem']
                .indexOf(unit) > -1;
    }

    /**
     * Converts a JavaScript value to a Sass number.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassNumber|null} A Sass number, or null if jsValue cannot be parsed as a number.
     */
    function toSassNumber(jsValue) {
        var numValue = parseFloat(jsValue),
            strNum,
            unit = '';

        if (typeof jsValue === 'object') {
            if (!(Object.keys(jsValue).length === 2 && !!jsValue.value && !!jsValue.unit)) {
                return null;
            }
            numValue = jsValue.value;
            unit = jsValue.unit;
        }

        // This 'number' cannot be parsed.
        if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
            // Let them be dealt with another method
            return null;
        }

        if (typeof jsValue !== 'number') {
            // Because numbers with units are String instances.
            strNum = '' + numValue;
            unit = jsValue.slice(strNum.length);
        }

        // Strip unrecognized units.
        return new SassNumber(numValue, isValidUnit(unit) ? unit : '');
    }

    /**
     * Determines if a string seems a truthy Boolean.
     * @param {String} jsValue A string.
     * @returns {Boolean} If jsValue is truthy.
     */
    function isTruthy(jsValue) {
        var isTrue = false,
            normalizedString = jsValue.trim().toLowerCase();

        booleanStrings.truthy.forEach(function (string) {
            isTrue = isTrue || normalizedString === string;
        });

        return isTrue;
    }

    /**
     * Determines if a string seems a falsey Boolean.
     * @param {String} jsValue A string.
     * @returns {Boolean} If jsValue is falsey.
     */
    function isFalsey(jsValue) {
        var isFalsey = false,
            normalizedString = jsValue.trim().toLowerCase();

        booleanStrings.falsey.forEach(function (string) {
            isFalsey = isFalsey || normalizedString === string;
        });

        return isFalsey;
    }

    /**
     * Converts a JavaScript value to a Sass Boolean.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassBoolean|null} A Sass Boolean value, or null if jsValue doesn't seem like a Boolean value.
     */
    function toSassBoolean(jsValue) {
        switch (typeof jsValue) {
            case 'boolean':
                return jsValue ? SassBoolean.TRUE : SassBoolean.FALSE;
            case 'string':
                if (isTruthy(jsValue)) {
                    return SassBoolean.TRUE;
                }

                return isFalsey(jsValue) ? SassBoolean.FALSE : null;

            // We will not convert numbers.
            default:
                break;
        }

        return null;
    }

    /**
     * Converts a JavaScript value to a Sass string.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassColor|SassNumber|SassBoolean|SassString} Appropriate Sass value if it is a valid color or number
     *          format, else a Sass string.
     */
    function toSassString(jsValue) {
        var value = toSassColor(jsValue) ||
            toSassNumber(jsValue) ||
            toSassBoolean(jsValue);

        if (value === null) {
            return new SassString('' + jsValue);
        }

        return value;
    }

    /**
     * Converts a JavaScript value as a Sass map.
     * @param {Object} jsValue A JavaScript value.
     * @returns {SassColor|SassNumber|SassMap} A Sass map, or a color/number if it can be parsed.
     */
    function toSassMap(jsValue) {
        var keys = Object.keys(jsValue),
            colorValue = toSassColor(jsValue) || toSassNumber(jsValue),
            sassMap = new SassMap(keys.length);

        if (!!colorValue) {
            return colorValue;
        }

        keys.forEach(function (key, i) {
            sassMap.setKey(i, new SassString(key));
            sassMap.setValue(i, toSassValue(jsValue[key]));
        });

        return sassMap;
    }

    /**
     * Converts a JavaScript value as a Sass list.
     * @param {Array} jsValue A JavaScript value.
     * @returns {SassList} A Sass list.
     */
    function toSassList(jsValue) {
        var sassList = new SassList(jsValue.length, true);

        jsValue.forEach(function (item, i) {
            sassList.setValue(i, toSassValue(item));
        });

        return sassList;
    }

    /**
     * Checks if a value is a String.
     * @param {*} value A value.
     * @returns {Boolean} Is value a String?
     */
    function isString(value) {
        return typeof value === 'string';
    }

    /**
     * Initializes the recognized Boolean strings.
     * @param {Object} booleans The hash of Boolean strings.
     */
    function initializeBooleans(booleans) {
        booleanStrings = {
            truthy: [
                'true',
                'yes',
                'on'
            ],
            falsey: [
                'false',
                'no',
                'off'
            ]
        };

        Object.keys(booleanStrings)
            .filter(function (booleanCategory) {
                return !!booleans[booleanCategory];
            })
            .forEach(function (booleanCategory) {
                var validStrings = booleans[booleanCategory].filter(isString);

                booleanStrings[booleanCategory] = booleanStrings[booleanCategory].concat(validStrings);
            });
    }

    /**
     * Initializes the recognized color channel strings.
     * @param {Object} strings
     */
    function initializeColorChannelStrings(strings) {
        colorChannelStrings = {
            a: ['alpha'],
            b: ['blue'],
            c: ['cyan'],
            g: ['green'],
            h: ['hue'],
            k: ['black'],
            l: ['lightness'],
            m: ['magenta'],
            r: ['red'],
            s: ['saturation'],
            v: ['value'],
            y: ['yellow']
        };

        Object.keys(colorChannelStrings)
            .filter(function (channel) {
                return !!strings[channel];
            })
            .forEach(function (channel) {
                var validStrings = strings[channel].filter(isString);

                colorChannelStrings[channel] = colorChannelStrings[channel].concat(validStrings);
            });
    }

    /**
     * Converts a JavaScript value to its corresponding Sass value.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassNull|SassNumber|SassColor|SassBoolean|SassString|SassList|SassMap} Corresponding Sass value.
     */
    // ReSharper disable once DuplicatingLocalDeclaration
    toSassValue = function toSassValue(jsValue) {
        if (jsValue === null || jsValue === undefined) {
            return SassNull.NULL;
        }

        switch (typeof jsValue) {
            case 'number':
            case 'string':
            case 'boolean':
                // For meticulous validation, use the string converter.
                return toSassString(jsValue);
            default:
                break;
        }

        if ('' + jsValue === '[object Arguments]') {
            jsValue = Array.from(jsValue);
        }

        if (jsValue instanceof Array) {
            return toSassList(jsValue);
        }

        return toSassMap(jsValue);
    };

    /**
     * Creates a custom toSassValue() function.
     * @param {Object} config The configuration object.
     * @returns {Function} The toSassValue() function.
     */
    module.exports = function customToSassValue(config) {
        config = config || {};
        config.boolean = config.boolean || {};
        config.boolean.booleans = config.boolean.booleans || {};
        config.color = config.color || {};
        config.color.channels = config.color.channels || {};

        initializeBooleans(config.boolean.booleans);
        initializeColorChannelStrings(config.color.channels);

        return toSassValue;
    };
})();
