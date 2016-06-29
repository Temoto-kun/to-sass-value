/**
 * to-sass-value
 * Converts a JavaScript value to its corresponding Sass value.
 *
 * @author TheoryOfNekomata <allan.crisostomo@outlook.com>
 * @license MIT
 */

var sass = require('node-sass'),
    parseColor = require('parse-color'),
    moment = require('moment');

(function _toSassValue() {
    var booleanStrings,
        colorChannelStrings,
        dateFormat,

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
     * @param {String} colorString A color string.
     * @returns {Array|undefined} The RGB(A) color channels, or undefined if the string cannot be parsed as a color.
     */
    function parseColorString(colorString) {
        var parsedColorValues = parseColor(colorString);

        return parsedColorValues.rgba || parsedColorValues.rgb;
    }

    /**
     * Checks if color values provided are valid.
     * @param {Number} red The red channel value.
     * @param {Number} green The green channel value.
     * @param {Number} blue The blue channel value.
     * @param {Number} alpha The alpha channel value.
     * @returns {Boolean} Are color values valid? 
     */
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

    /**
     * Normalizes the color objects (i.e. converting "red" => "r", "cyan" => "c", "lightness" => "l" etc).
     * @param {Object} obj The color object. 
     * @returns {Object} The normalized color object.
     */
    function normalizeColorObject(obj) {
        var colorObj = {};

        Object.keys(obj).forEach(function eachColorObjectChannel(objChannel) {
            objChannel = objChannel.trim().toLowerCase();

            Object.keys(colorChannelStrings)
                .filter((colorChannel) => colorChannelStrings[colorChannel].indexOf(objChannel) > -1)
                .forEach((colorChannel) => colorObj[colorChannel] = obj[objChannel]);
        });

        return colorObj;
    }

    /**
     * Determines the color space of a color object.
     * @param {Object} colorObj An object representing a color.
     * @returns {String|null} The object's color space, or null if it is an unrecognized color space.
     */
    function determineColorSpace(colorObj) {
        var hasAlpha = !isNaN(colorObj.a),
            isRgb = !(isNaN(colorObj.r) || isNaN(colorObj.g) || isNaN(colorObj.b)),
            isHs = !(isNaN(colorObj.h) || isNaN(colorObj.s)),
            isHsl = isHs && !isNaN(colorObj.l),
            isHsv = isHs && !isNaN(colorObj.v),
            isCmyk = !(isNaN(colorObj.c) || isNaN(colorObj.m) || isNaN(colorObj.y) || isNaN(colorObj.k)),
            colorSpace = null;

        if (isRgb) {
            colorSpace = 'rgb';
        }

        if (isHsl) {
            colorSpace = 'hsl';
        }

        if (isHsv) {
            colorSpace = 'hsv';
        }

        if (isCmyk) {
            colorSpace = 'cmyk';
        }

        if (hasAlpha && !!colorSpace) {
            colorSpace += 'a';
        }

        return colorSpace;
    }

    /**
     * Determines if an object represents a color.
     * @param {Object} obj An object.
     * @returns {Boolean} Does obj represent a color?
     */
    function isValidColorObject(obj) {
        return !!determineColorSpace(obj);
    }

    /**
     * Gets the color channel values of an object representing a color within a color space.
     * @param {Object} colorObj A color object.
     * @param {String} colorSpace The color space of the color object.
     * @returns {Array|null} The color's channels' values, or null if the channel values cannot be extracted.
     */
    function getColorChannelValues(colorObj, colorSpace) {
        switch (colorSpace) {
            case 'rgb':
                return [colorObj.r, colorObj.g, colorObj.b];
            case 'rgba':
                return [colorObj.r, colorObj.g, colorObj.b, colorObj.a];
            case 'hsl':
                return [colorObj.h, colorObj.s, colorObj.l];
            case 'hsla':
                return [colorObj.h, colorObj.s, colorObj.l, colorObj.a];
            case 'hsv':
                return [colorObj.h, colorObj.s, colorObj.v];
            case 'hsva':
                return [colorObj.h, colorObj.s, colorObj.v, colorObj.a];
            case 'cmyk':
                return [colorObj.c, colorObj.m, colorObj.y, colorObj.k];
            case 'cmyka':
                return [colorObj.c, colorObj.m, colorObj.y, colorObj.k, colorObj.a];
            default:
                break;
        }

        return null;
    }

    /**
     * Converts a color object to a string.
     * @param {Object} colorObj A color object. 
     * @returns {String} The color object's string representation.
     */
    function stringifyColorChannelValues(colorObj) {
        var colorSpace = determineColorSpace(colorObj),
            colorChannelValues = getColorChannelValues(colorObj, colorSpace);

        return colorChannelValues !== null ? colorChannelValues.join(',') : null;
    }

    function stringifyColorObject(obj) {
        var colorChannelValues = stringifyColorChannelValues(obj),
            colorSpace = determineColorSpace(obj);

        return `${colorSpace}(${colorChannelValues})`;
    }

    /**
     * Converts a JavaScript value to a Sass color.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassColor|null} A Sass color, or null if jsValue cannot be parsed as a color.
     */
    function toSassColor(jsValue) {
        var values = null,
            normalizedObject = null;

        switch (typeof jsValue) {
            case 'string':
                values = parseColorString(jsValue.trim().toLowerCase());

                if (!values) {
                    return null;
                }

                if (isNaN(values[3])) {
                    values[3] = 1.0;
                }

                if (!isValidColorValues.apply(null, values)) {
                    return null;
                }
                
                return new SassColor(values[0], values[1], values[2], values[3]);
            case 'object':
                normalizedObject = normalizeColorObject(jsValue);

                if (!isValidColorObject(normalizedObject)) {
                    return null;
                }

                return toSassColor(stringifyColorObject(normalizedObject));
            default:
                break;
        }

        return null;
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

        booleanStrings.truthy.forEach((string) => isTrue = isTrue || normalizedString === string);

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

        booleanStrings.falsey.forEach((string) => isFalsey = isFalsey || normalizedString === string);

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

        if (colorValue !== null) {
            return colorValue;
        }

        keys.forEach((key, i) => {
            sassMap.setKey(i, new SassString(key));
            sassMap.setValue(i, toSassValue(jsValue[key]));
        });

        return sassMap;
    }

    /**
     * Converts a JavaScript date to its Sass representation (a Sass string).
     * @param {Date} jsDate A JavaScript Date.
     * @returns {SassString} The Date representation.
     */
    function toSassDate(jsDate) {
        var momentDate = moment(jsDate);

        return toSassMap({
            string: (dateFormat === null || typeof dateFormat === 'undefined') ?
                momentDate.toISOString() :
                momentDate.format(dateFormat),
            mstimestamp: parseInt(momentDate.format('x')),
            timestamp: parseInt(momentDate.format('X')),
            millisecond: jsDate.getUTCMilliseconds(),
            second: jsDate.getUTCSeconds(),
            minute: jsDate.getUTCMinutes(),
            hour: jsDate.getUTCHours(),
            day: jsDate.getUTCDay(),
            date: jsDate.getUTCDate(),
            week: parseInt(momentDate.format('w')),
            month: jsDate.getUTCMonth() + 1, // JavaScript's month is zero-indexed ;P
            year: jsDate.getUTCFullYear()
        });
    }

    /**
     * Converts a JavaScript value as a Sass list.
     * @param {Array} jsValue A JavaScript value.
     * @return {SassList} A Sass list.
     */
    function toSassList(jsValue) {
        var sassList = new SassList(jsValue.length, true);

        jsValue.forEach((item, i) => sassList.setValue(i, toSassValue(item)));

        return sassList;
    }

    /**
     * Checks if a value is a String.
     * @param {*} value A value.
     * @return {Boolean} Is value a String?
     */
    function isString(value) {
        return typeof value === 'string';
    }

    /**
     * Initializes the recognized Boolean strings.
     * @param {Object} booleans The hash of Boolean strings.
     * @returns {undefined}
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
            .filter((booleanCategory) => !!booleans[booleanCategory])
            .forEach((booleanCategory) => {
                booleanStrings[booleanCategory] = booleanStrings[booleanCategory].concat(
                    booleans[booleanCategory].filter(isString)
                );
            });
    }

    /**
     * Initializes the recognized color channel strings.
     * @param {Object} strings The hash of color channel strings.
     * @returns {undefined}
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
            .filter((channel) => !!strings[channel])
            .forEach((channel) => {
                colorChannelStrings[channel] = colorChannelStrings[channel].concat(
                    strings[channel].filter(isString)
                );
            });
    }

    /**
     * Converts a JavaScript value to its corresponding Sass value.
     * @param {*} jsValue A JavaScript value.
     * @returns {SassNull|SassNumber|SassColor|SassBoolean|SassString|SassList|SassMap} Corresponding Sass value.
     */
    // ReSharper disable once DuplicatingLocalDeclaration
    toSassValue = function toSassValue(jsValue) {
        if (jsValue === null || typeof jsValue === 'undefined') {
            return SassNull.NULL;
        }

        switch (typeof jsValue) {
            case 'number':
            case 'string':
            case 'boolean':
                // For meticulous validation, use the string converter.
                return toSassString(jsValue);
            case 'function':
                return SassNull.NULL;
            default:
                break;
        }

        if ('' + jsValue === '[object Arguments]') {
            jsValue = Array.from(jsValue);
        }

        if (jsValue instanceof Date) {
            return toSassDate(jsValue);
        }

        if (jsValue instanceof Array) {
            return toSassList(jsValue);
        }

        return toSassMap(jsValue);
    };

    /**
     * Initializes the date conversion.
     * @param {Object} config The configuration object.
     * @returns {undefined}
     */
    function initializeDateConversion(config) {
        dateFormat = config.format;
    }

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
        config.date = config.date || {};

        initializeBooleans(config.boolean.booleans);
        initializeColorChannelStrings(config.color.channels);
        initializeDateConversion(config.date);

        return toSassValue;
    };
    
    // TODO add options for date format
})();
