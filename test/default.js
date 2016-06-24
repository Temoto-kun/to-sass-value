(function () {
    var toSassValue = require('./../src/to-sass-value'),
        sass = require('node-sass'),

        SassBoolean = sass.types.Boolean,
        SassString = sass.types.String,
        SassNumber = sass.types.Number,
        SassColor = sass.types.Color,
        SassList = sass.types.List,
        SassMap = sass.types.Map,
        SassNull = sass.types.Null;

    describe('to-sass-value', function () {
        describe('upon converting Boolean values', function () {
            it('should be able to convert simple Boolean values', function () {
                var jsTrue = true,
                    jsFalse = false,

                    sassTrue = toSassValue(jsTrue),
                    sassFalse = toSassValue(jsFalse);

                expect(sassTrue instanceof SassBoolean).toBe(true);
                expect(sassFalse instanceof SassBoolean).toBe(true);

                expect(sassTrue.getValue()).toBe(jsTrue);
                expect(sassFalse.getValue()).toBe(jsFalse);
            });

            it('should be able to convert String representations of Boolean values', function () {
                var jsTrue1 = 'true',
                    jsFalse1 = 'false',
                    jsTrue2 = 'yes',
                    jsFalse2 = 'no',

                    sassTrue1 = toSassValue(jsTrue1),
                    sassFalse1 = toSassValue(jsFalse1),

                    sassTrue2 = toSassValue(jsTrue2),
                    sassFalse2 = toSassValue(jsFalse2);

                expect(sassTrue1 instanceof SassBoolean).toBe(true);
                expect(sassFalse1 instanceof SassBoolean).toBe(true);

                expect(sassTrue2 instanceof SassBoolean).toBe(true);
                expect(sassFalse2 instanceof SassBoolean).toBe(true);

                expect(sassTrue1.getValue()).toBe(true);
                expect(sassFalse1.getValue()).toBe(false);

                expect(sassTrue2.getValue()).toBe(true);
                expect(sassFalse2.getValue()).toBe(false);
            });

            it('should not convert non-Boolean values as SassBoolean instances', function () {
                var jsNonZero1 = 1,
                    jsZero1 = 0,
                    jsNonZero2 = 1.2345,
                    jsZero2 = 0.0000000,

                    sassNonZero1 = toSassValue(jsNonZero1),
                    sassNonZero2 = toSassValue(jsNonZero2),
                    sassZero1 = toSassValue(jsZero1),
                    sassZero2 = toSassValue(jsZero2);

                expect(sassNonZero1 instanceof SassBoolean).toBe(false);
                expect(sassNonZero2 instanceof SassBoolean).toBe(false);
                expect(sassZero1 instanceof SassBoolean).toBe(false);
                expect(sassZero2 instanceof SassBoolean).toBe(false);
            });
        });

        describe('upon converting strings', function () {
            it('should be able to convert ordinary String values', function () {
                var jsValue1 = 'string',
                    sassValue1 = toSassValue(jsValue1),
                    jsValue2 = 'my_name_is_mud',
                    sassValue2 = toSassValue(jsValue2);

                expect(sassValue1 instanceof SassString).toBe(true);
                expect(sassValue1.getValue()).toBe(jsValue1);
                expect(sassValue2 instanceof SassString).toBe(true);
                expect(sassValue2.getValue()).toBe(jsValue2);
            });

            it('should be able to convert Unicode characters', function () {
                var jsValue3 = String.fromCharCode(0x3042),
                    sassValue3 = toSassValue(jsValue3),
                    jsValue4 = String.fromCharCode(0x30A2),
                    sassValue4 = toSassValue(jsValue4);

                expect(sassValue3 instanceof SassString).toBe(true);
                expect(sassValue3.getValue()).toBe(jsValue3);
                expect(sassValue4 instanceof SassString).toBe(true);
                expect(sassValue4.getValue()).toBe(jsValue4);
            });
        });

        describe('upon converting numbers', function () {
            var jsValue1 = 69,
                jsValue2 = 420.1337;

            it('should be able to convert numbers represented as Number', function () {
                var sassValue1 = toSassValue(jsValue1),
                    sassValue2 = toSassValue(jsValue2);

                expect(sassValue1 instanceof SassNumber).toBe(true);
                expect(sassValue2 instanceof SassNumber).toBe(true);

                expect(sassValue1.getValue()).toBe(jsValue1);
                expect(sassValue2.getValue()).toBe(jsValue2);
            });

            it('should be able to convert numbers represented as String', function () {
                var sassValue3 = toSassValue('69'),
                    sassValue4 = toSassValue('420.1337');

                expect(sassValue3 instanceof SassNumber).toBe(true);
                expect(sassValue4 instanceof SassNumber).toBe(true);

                // The values have been parsed; we reference the Number instances this time.
                expect(sassValue3.getValue()).toBe(jsValue1);
                expect(sassValue4.getValue()).toBe(jsValue2);
            });

            it('should be able to convert numbers with units', function () {
                var sassValue5 = toSassValue('69em'),
                    sassValue6 = toSassValue('420.1337px');

                expect(sassValue5 instanceof SassNumber).toBe(true);
                expect(sassValue6 instanceof SassNumber).toBe(true);

                // The values have been parsed; we reference the Number instances this time.
                expect(sassValue5.getValue()).toBe(jsValue1);
                expect(sassValue6.getValue()).toBe(jsValue2);

                expect(sassValue5.getUnit()).toBe('em');
                expect(sassValue6.getUnit()).toBe('px');
            });

            describe('upon converting infinite values and NaN', function () {
                it('should be able to convert values such as +/-Infinity or NaN to a SassString', function () {
                    var sassPositiveInfinity = toSassValue(Infinity),
                        sassNegativeInfinity = toSassValue(-Infinity),
                        sassNaN = toSassValue(NaN);

                    expect(sassPositiveInfinity instanceof SassString).toBe(true);
                    expect(sassNegativeInfinity instanceof SassString).toBe(true);
                    expect(sassNaN instanceof SassString).toBe(true);

                    expect(sassPositiveInfinity.getValue()).toBe('Infinity');
                    expect(sassNegativeInfinity.getValue()).toBe('-Infinity');
                    expect(sassNaN.getValue()).toBe('NaN');
                });

                it('should still convert the String representations of +/-Infinity or NaN to a SassString', function () {
                    var sassPositiveInfinity = toSassValue('Infinity'),
                        sassNegativeInfinity = toSassValue('-Infinity'),
                        sassNaN = toSassValue('NaN');

                    expect(sassPositiveInfinity instanceof SassString).toBe(true);
                    expect(sassNegativeInfinity instanceof SassString).toBe(true);
                    expect(sassNaN instanceof SassString).toBe(true);

                    expect(sassPositiveInfinity.getValue()).toBe('Infinity');
                    expect(sassNegativeInfinity.getValue()).toBe('-Infinity');
                    expect(sassNaN.getValue()).toBe('NaN');
                });
            });
        });

        describe('upon converting colors', function () {
            it('should be able to convert colors in hexadecimal format', function () {
                var sassValue1 = toSassValue('#c0ffee'),
                    sassValue2 = toSassValue('#beefed'),
                    sassValue3 = toSassValue('#ecchi'),
                    sassValue4 = toSassValue('#708090');

                expect(sassValue1 instanceof SassColor).toBe(true);
                expect(sassValue1.getR()).toBe(0xc0);
                expect(sassValue1.getG()).toBe(0xff);
                expect(sassValue1.getB()).toBe(0xee);

                expect(sassValue2 instanceof SassColor).toBe(true);
                expect(sassValue2.getR()).toBe(0xbe);
                expect(sassValue2.getG()).toBe(0xef);
                expect(sassValue2.getB()).toBe(0xed);

                expect(sassValue3 instanceof SassColor).not.toBe(true);

                expect(sassValue4 instanceof SassColor).toBe(true);
                expect(sassValue4.getR()).not.toBe(70);
                expect(sassValue4.getG()).not.toBe(80);
                expect(sassValue4.getB()).not.toBe(90);
            });

            it('should be able to convert colors in rgb() format', function () {
                var sassValue1 = toSassValue('RGB(96, 33, 122)'),
                    sassValue2 = toSassValue('RGB    (1, 2, 3)'),
                    sassValue3 = toSassValue('RGB(9001, 131072, 128)');

                expect(sassValue1 instanceof SassColor).toBe(true);
                expect(sassValue1.getR()).toBe(96);
                expect(sassValue1.getG()).toBe(33);
                expect(sassValue1.getB()).toBe(122);
                expect(sassValue1.getA()).toBeCloseTo(1.0, 0.0);

                expect(sassValue2 instanceof SassColor).toBe(true);
                expect(sassValue2.getR()).toBe(1);
                expect(sassValue2.getG()).toBe(2);
                expect(sassValue2.getB()).toBe(3);
                expect(sassValue2.getA()).toBeCloseTo(1.0, 0.0);

                expect(sassValue3 instanceof SassColor).toBe(false);
            });

            it('should be able to convert colors in rgba() format', function () {
                var sassValue1 = toSassValue('rgba ( 11 , 23 , 58 , 0.618033989     )'),
                    sassValue2 = toSassValue('rgba(69, 420, 1337, 3.14)');

                expect(sassValue1 instanceof SassColor).toBe(true);
                expect(sassValue1.getR()).toBe(11);
                expect(sassValue1.getG()).toBe(23);
                expect(sassValue1.getB()).toBe(58);
                expect(sassValue1.getA()).toBeCloseTo(0.618033989, 0.7);

                expect(sassValue2 instanceof SassColor).not.toBe(true);
            });

            // TODO test for other color formats
            // TODO refactor tests (i.e. change variable names, remove excess variables)?
        });

        describe('upon converting arrays', function () {
            it('should be able to convert unidimensional arrays', function () {
                var jsValue = [1, 2, 3, 4, 5],
                    sassValue = toSassValue(jsValue);

                function getOutOfRange() {
                    return sassValue.getValue(5);
                }

                function getLastItem() {
                    return sassValue.getValue(jsValue.length - 1);
                }

                expect(sassValue instanceof SassList).toBe(true);
                expect(sassValue.getValue(1).getValue()).toBe(jsValue[1]);
                expect(getOutOfRange).toThrow(RangeError('Out of bound index'));
                expect(getLastItem).not.toThrow(RangeError('Out of bound index'));
                expect(getLastItem().getValue()).toBe(5);
            });

            it('should be able to convert multidimensional arrays', function () {
                var jsValue = [
                        [ 1, 'two',  3,    4,        5],
                        [ 6,     7,  8,    9, '10.2cm'],
                        [11,    12, 13, '14',       []]
                    ],
                    sassValue = toSassValue(jsValue);

                function getItemAt(y, x) {
                    return sassValue
                        .getValue(y)
                        .getValue(x);
                }

                expect(getItemAt(0, 1) instanceof SassString).toBe(true);
                expect(getItemAt(2, 3) instanceof SassNumber).toBe(true); // clincher, but because it can be parsed as Number, it will.
                expect(getItemAt(1, 4) instanceof SassNumber).toBe(true);
                expect(getItemAt(2, 4) instanceof SassList).toBe(true);
            });

            it('should be able to convert the arguments object to a SassList', function () {
                var sassValue;

                function getArgs() {
                    return toSassValue(arguments);
                }

                sassValue = getArgs('corn', 'chicken', 'cheese');

                expect(sassValue instanceof SassList).toBe(true);
                expect(sassValue.getLength()).toBe(3);
            });
        });
    });
})();
