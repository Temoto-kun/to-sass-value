/**
 * to-sass-value
 * 
 * Author: Temoto-kun <kiiroifuriku@hotmail.com>
 * License: MIT
 */

(function () {
    // ReSharper disable once InconsistentNaming
    var SassTypes = require('node-sass').types,
        colorFormats = require('./color-formats'),
        booleanStrings = require('./booleans'),
        // ReSharper disable once DuplicatingLocalDeclaration
        parseValue;

    // TODO use a color parsing library!

    /**
     * Parses a JavaScript value to a Sass color.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassColor|null} A Sass color, or null if jsValue cannot be parsed as a color.
     */
    function parseColor(jsValue) {
        var values,
            sassColor = null;

        colorFormats.forEach(function (pattern, i) {
            if (!pattern.test(jsValue)) {
                return null;
            }

            switch (i) {
                // TODO better determine which color format is recognized (use strings instead of indexes for color-formats)
                case 0:
                case 1:
                    values = jsValue.slice(jsValue.indexOf('(') + 1, jsValue.lastIndexOf(')')).split(',').map(function (value) {
                        return parseInt(value.trim());
                    });

                    return sassColor = new SassTypes.Color(parseInt(values[0]), parseInt(values[1]), parseInt(values[2]), parseFloat(values[3]) || 1.0);
                case 2:
                    return sassColor = new SassTypes.Color(parseInt(jsValue.slice(jsValue.indexOf('#') + 1)) | 0xFF000000);
                default:
                    break;
            }
            return null;
        });

        return sassColor;
    }

    /**
     * Parses a JavaScript value to a Sass number.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassNumber|null} A Sass number, or null if jsValue cannot be parsed as a number.
     */
    function parseNumber(jsValue) {
        var numValue = parseFloat(jsValue),
            strNum,
            unit = '';

        if (isNaN(numValue) || numValue === Infinity || numValue === -Infinity) {
            // Let them be dealt with another method
            return null;
        }

        if (typeof jsValue !== 'number') {
            // Because numbers with units are String instances.
            strNum = '' + numValue;
            unit = jsValue.slice(strNum.length);
        }

        return new SassTypes.Number(numValue, unit);
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
     * Parses a JavaScript value to a Sass Boolean.
     * @param {String} jsValue A JavaScript value.
     * @returns {SassBoolean|null} A Sass Boolean value, or null if jsValue doesn't seem like a Boolean value.
     */
    function parseBoolean(jsValue) {
        switch (typeof jsValue) {
            case 'boolean':
                return jsValue ? SassTypes.Boolean.TRUE : SassTypes.Boolean.FALSE;
            case 'string':
                if (isTruthy(jsValue)) {
                    return SassTypes.Boolean.TRUE;
                }
                
                if (isFalsey(jsValue)) {
                    return SassTypes.Boolean.FALSE;
                }

                return null;

            // We will not convert numbers.

            default:
                break;
        }

        return null;
    }

    /**
     * Parses a JavaScript value to a Sass string.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassColor|SassNumber|SassBoolean|SassString} Appropriate Sass value if it is a valid color or number format, else a Sass string.
     */
    function parseString(jsValue) {
        var value = parseColor(jsValue) || parseNumber(jsValue) || parseBoolean(jsValue);

        if (value === null) {
            return new SassTypes.String('' + jsValue);
        }

        return value;
    }

    /**
     * Parses a JavaScript value as a Sass map.
     * @param {Object} jsValue A JavaScript value.
     * @returns {SassMap} A Sass map.
     */
    function parseMap(jsValue) {
        // TODO parse color-like objects (e.g. {r:Number,g:Number,b:Number}), number-like objects (e.g. {value:Number,unit:String})

        var keys = Object.keys(jsValue),
            sassMap = new SassTypes.Map(keys.length);

        keys.forEach(function (key, i) {
            sassMap.setKey(i, new SassTypes.String(key));
            sassMap.setValue(i, parseValue(jsValue[key]));
        });

        return sassMap;
    }

    /**
     * Parses a JavaScript value as a Sass list.
     * @param {Array} jsValue A JavaScript value.
     * @returns {SassList} A Sass list.
     */
    function parseList(jsValue) {
        var sassList = new SassTypes.List(jsValue.length, true);

        jsValue.forEach(function (item, i) {
            sassList.setValue(i, parseValue(item));
        });

        return sassList;
    }

    /**
     * Parses a JavaScript value.
     * @param {*} jsValue A JavaScript value. 
     * @returns {SassNull|SassNumber|SassColor|SassBoolean|SassString|SassList|SassMap} Corresponding Sass value.
     */
    // ReSharper disable once DuplicatingLocalDeclaration
    parseValue = function parseValue(jsValue) {
        if (jsValue === null || jsValue === undefined) {
            return SassTypes.Null.NULL;
        }

        switch (typeof jsValue) {
            case 'number':
            case 'string':
            case 'boolean':
                return parseString(jsValue);
            default:
                break;
        }

        if (jsValue instanceof Array) {
            return parseList(jsValue);
        }

        return parseMap(jsValue);
    };

    module.exports = parseValue;
})();
