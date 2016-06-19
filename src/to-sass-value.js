/**
 * to-sass-value
 * 
 * Author: Temoto-kun <kiiroifuriku@hotmail.com>
 * License: MIT
 */

(function () {
    // ReSharper disable once InconsistentNaming
    var SassTypes = require('node-sass').types,
        // ReSharper disable once DuplicatingLocalDeclaration
        parseValue;

    function getColorFormatPatterns() {
        return [
            // rgb(rrr,ggg,bbb) format
            /^rgb\s*\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\)$/i,

            // rgba(rrr,ggg,bbb,a.aaaa...) format
            /^rgba\s*\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i, // TODO fix alpha to be recognized as floating point value

            // #rrggbb format
            /^#[0-9a-fA-F]{6}$/

            // TODO #rgb format

            // TODO #rgba format

            // TODO #rrggbaa format

            // TODO hsl(), hsv(), etc.
        ];
    };

    /**
     * Parses a JavaScript value to a Sass color.
     * @param {*} jsValue A JavaScript value.
     * @returns {*|null} A Sass color, or null if jsValue cannot be parsed as a color.
     */
    function parseColor(jsValue) {
        var values,
            sassColor = null;

        getColorFormatPatterns().forEach(function (pattern, i) {
            switch (i) {
                case 0:
                case 1:
                    values = jsValue.slice(jsValue.indexOf('(') + 1, jsValue.lastIndexOf(')')).split(',').map(function (value) {
                        return parseInt(value.trim());
                    });

                    return sassColor = new SassTypes.Color(values[0], values[1], values[2], values[3] || 1.0);
                case 2:
                    return sassColor = new SassTypes.Color(parseInt(jsValue.slice(jsValue.indexOf('#') + 1)) | 0xFF000000);
                default:
                    break;
            }
            return null;
        });

        return sassColor;
    };

    /**
     * Parses a JavaScript value to a Sass number.
     * @param {*} jsValue A JavaScript value.
     * @returns {*|null} A Sass number, or null if jsValue cannot be parsed as a number.
     */
    function parseNumber(jsValue) {
        var numValue, strNum, unit;
        try {
            numValue = parseFloat(jsValue);
            strNum = '' + numValue;
            unit = jsValue.slice(strNum.length);

            return new SassTypes.Number(numValue, unit);
        } catch (e) {
        }

        return null;
    };

    /**
     * Parses a JavaScript value to a Sass string.
     * @param {*} jsValue A JavaScript value.
     * @returns {*} Appropriate Sass value if it is a valid color or number format, else a Sass string.
     */
    function parseString(jsValue) {
        var value = parseColor(jsValue) || parseNumber(jsValue);

        if (value === null) {
            return new SassTypes.String(jsValue);
        }

        return value;
    };

    /**
     * Parses a JavaScript value as a Sass map.
     * @param {*} jsValue A JavaScript value.
     * @returns {*} A Sass map.
     */
    function parseMap(jsValue) {
        var keys = Object.keys(jsValue),
            sassMap = new SassTypes.Map(keys.length);

        keys.forEach(function (key, i) {
            sassMap.setKey(i, new SassTypes.String(key));
            sassMap.setValue(i, parseValue(jsValue[key]));
        });

        return sassMap;
    };

    /**
     * Parses a JavaScript value as a Sass list.
     * @param {*} jsValue A JavaScript value.
     * @returns {*} A Sass list.
     */
    function parseList(jsValue) {
        var sassList = new SassTypes.List(jsValue.length, true);

        jsValue.forEach(function (item, i) {
            sassList.setValue(i, parseValue(item));
        });

        return sassList;
    };

    /**
     * Parses a JavaScript value.
     * @param {*} jsValue A JavaScript value. 
     * @returns {*} Corresponding Sass value.
     */
    // ReSharper disable once DuplicatingLocalDeclaration
    parseValue = function parseValue(jsValue) {
        if (jsValue === null || jsValue === undefined) {
            return new SassTypes.Null();
        }

        switch (typeof jsValue) {
            case 'number':
                return new SassTypes.Number(jsValue);
            case 'string':
                return parseString(jsValue);
            case 'boolean':
                return new SassTypes.Boolean(jsValue);
            default:
                break;
        }

        if (jsValue instanceof Array) {
            return parseList(jsValue);
        }

        return parseMap(jsValue);
    };
    
    /**
     * Converts a JavaScript value to a corresponding Sass value.
     * @param {*} jsValue A JavaScript value.
     * @returns {*} A Sass value.
     */
    module.exports = function toSassValue(jsValue) {
        return parseValue(jsValue);
    };
})();
