/* eslint-disable global-require, func-names, no-undefined, no-console */

(function () {
    var toSassValue = require('./../src/to-sass-value')(),
        sass = require('node-sass'),

        SassBoolean = sass.types.Boolean,
        SassString = sass.types.String,
        SassNumber = sass.types.Number,
        SassColor = sass.types.Color,
        SassList = sass.types.List,
        SassMap = sass.types.Map,
        SassNull = sass.types.Null;

    describe('to-sass-value', function () {
        describe('upon converting nothings', function () {
            it('should be able to convert `null`', function () {
                expect(toSassValue(null) instanceof SassNull).toBe(true);
                expect(toSassValue('null') instanceof SassNull).toBe(false);
            });

            it('should be able to convert `undefined`', function () {
                expect(toSassValue(undefined) instanceof SassNull).toBe(true);
                expect(toSassValue('undefined') instanceof SassNull).toBe(false);
            });
        });

        describe('upon converting Boolean values', function () {
            it('should be able to convert simple Boolean values', function () {
                var teaIsGreat = toSassValue(true),
                    teaIsNotGreat = toSassValue(false);

                expect(teaIsGreat instanceof SassBoolean).toBe(true);
                expect(teaIsNotGreat instanceof SassBoolean).toBe(true);

                expect(teaIsGreat.getValue()).toBe(true);
                expect(teaIsNotGreat.getValue()).toBe(false);
            });

            it('should be able to convert String representations of Boolean values', function () {
                var coffeeIsGreat = toSassValue('true'),
                    coffeeIsNotGreat = toSassValue('false'),

                    yes = toSassValue('yes'),
                    no = toSassValue('no'),

                    yesGerman = toSassValue('ja'),
                    noGerman = toSassValue('nein');

                expect(coffeeIsGreat instanceof SassBoolean).toBe(true);
                expect(coffeeIsGreat.getValue()).toBe(true);

                expect(coffeeIsNotGreat instanceof SassBoolean).toBe(true);
                expect(coffeeIsNotGreat.getValue()).toBe(false);

                expect(yes instanceof SassBoolean).toBe(true);
                expect(yes.getValue()).toBe(true);

                expect(no instanceof SassBoolean).toBe(true);
                expect(no.getValue()).toBe(false);

                expect(yesGerman instanceof SassBoolean).toBe(false);
                expect(noGerman instanceof SassBoolean).toBe(false);
            });

            it('should be able to add Boolean strings on configuration', function () {
                var toSassValue = require('./../src/to-sass-value')({
                        boolean: {
                            booleans: {
                                truthy: ['ja'],
                                falsey: ['nein']
                            }
                        }
                    }),

                    beerIsGreat = toSassValue('true'),
                    beerIsNotGreat = toSassValue('false'),

                    yes = toSassValue('yes'),
                    no = toSassValue('no'),

                    yesGerman = toSassValue('ja'),
                    noGerman = toSassValue('nein');

                expect(beerIsGreat instanceof SassBoolean).toBe(true);
                expect(beerIsGreat.getValue()).toBe(true);

                expect(beerIsNotGreat instanceof SassBoolean).toBe(true);
                expect(beerIsNotGreat.getValue()).toBe(false);

                expect(yes instanceof SassBoolean).toBe(true);
                expect(yes.getValue()).toBe(true);

                expect(no instanceof SassBoolean).toBe(true);
                expect(no.getValue()).toBe(false);

                expect(yesGerman instanceof SassBoolean).toBe(true);
                expect(yesGerman.getValue()).toBe(true);

                expect(noGerman instanceof SassBoolean).toBe(true);
                expect(noGerman.getValue()).toBe(false);
            });

            it('should not convert non-Boolean values as SassBoolean instances', function () {
                var nonZero1 = toSassValue(1),
                    zero1 = toSassValue(0),
                    nonZero2 = toSassValue(1.2345),
                    zero2 = toSassValue(0.0000000);

                expect(nonZero1 instanceof SassBoolean).toBe(false);
                expect(zero1 instanceof SassBoolean).toBe(false);
                expect(nonZero2 instanceof SassBoolean).toBe(false);
                expect(zero2 instanceof SassBoolean).toBe(false);
            });
        });

        describe('upon converting strings', function () {
            it('should be able to convert ordinary String values', function () {
                var string = 'string',
                    sassString = toSassValue(string),
                    primus = 'my_name_is_mud',
                    sassPrimus = toSassValue(primus);

                expect(sassString instanceof SassString).toBe(true);
                expect(sassString.getValue()).toBe(string);
                expect(sassPrimus instanceof SassString).toBe(true);
                expect(sassPrimus.getValue()).toBe(primus);
            });

            it('should be able to convert Unicode characters', function () {
                var hiraganaA = String.fromCharCode(0x3042),
                    sassHiraganaA = toSassValue(hiraganaA),
                    katakanaA = String.fromCharCode(0x30A2),
                    sassKatakanaA = toSassValue(katakanaA);

                expect(sassHiraganaA instanceof SassString).toBe(true);
                expect(sassHiraganaA.getValue()).toBe(hiraganaA);
                expect(sassKatakanaA instanceof SassString).toBe(true);
                expect(sassKatakanaA.getValue()).toBe(katakanaA);
            });
        });

        describe('upon converting numbers', function () {
            var soixanteNeuf = 69,
                theNumber = 420.1337;

            it('should be able to convert numbers represented as Number', function () {
                var sassValue1 = toSassValue(soixanteNeuf),
                    sassValue2 = toSassValue(theNumber);

                expect(sassValue1 instanceof SassNumber).toBe(true);
                expect(sassValue2 instanceof SassNumber).toBe(true);

                expect(sassValue1.getValue()).toBe(soixanteNeuf);
                expect(sassValue2.getValue()).toBe(theNumber);
            });

            it('should be able to convert numbers represented as String', function () {
                var strSoixanteNeuf = toSassValue('69'),
                    strTheNumber = toSassValue('420.1337');

                expect(strSoixanteNeuf instanceof SassNumber).toBe(true);
                expect(strTheNumber instanceof SassNumber).toBe(true);

                // The values have been parsed; we reference the Number instances this time.
                expect(strSoixanteNeuf.getValue()).toBe(soixanteNeuf);
                expect(strTheNumber.getValue()).toBe(theNumber);
            });

            it('should be able to convert numbers with units', function () {
                var emNumber = toSassValue('69em'),
                    pixelNumber = toSassValue('420.1337px');

                expect(emNumber instanceof SassNumber).toBe(true);
                expect(pixelNumber instanceof SassNumber).toBe(true);

                // The values have been parsed; we reference the Number instances this time.
                expect(emNumber.getValue()).toBe(soixanteNeuf);
                expect(pixelNumber.getValue()).toBe(theNumber);

                expect(emNumber.getUnit()).toBe('em');
                expect(pixelNumber.getUnit()).toBe('px');
            });

            describe('upon converting infinite values and NaN', function () {
                it('should be able to convert values such as +/-Infinity or NaN to a SassString', function () {
                    var plusInfinity = toSassValue(Infinity),
                        minusInfinity = toSassValue(-Infinity),
                        notANumber = toSassValue(NaN);

                    expect(plusInfinity instanceof SassString).toBe(true);
                    expect(minusInfinity instanceof SassString).toBe(true);
                    expect(notANumber instanceof SassString).toBe(true);

                    expect(plusInfinity.getValue()).toBe('Infinity');
                    expect(minusInfinity.getValue()).toBe('-Infinity');
                    expect(notANumber.getValue()).toBe('NaN');
                });

                it('should still convert the String representations of +/-Infinity or NaN to a SassString', function () {
                    var plusInfinity = toSassValue('Infinity'),
                        minusInfinity = toSassValue('-Infinity'),
                        notANumber = toSassValue('NaN');

                    expect(plusInfinity instanceof SassString).toBe(true);
                    expect(minusInfinity instanceof SassString).toBe(true);
                    expect(notANumber instanceof SassString).toBe(true);

                    expect(plusInfinity.getValue()).toBe('Infinity');
                    expect(minusInfinity.getValue()).toBe('-Infinity');
                    expect(notANumber.getValue()).toBe('NaN');
                });
            });
        });

        describe('upon converting colors', function () {
            it('should be able to convert colors in hexadecimal RGB format', function () {
                var hexRgb1 = toSassValue('#c0ffee'),
                    hexRgb2 = toSassValue('#beefed'),
                    notHex = toSassValue('#ecchi'),
                    hexRgb3 = toSassValue('#708090');

                expect(hexRgb1 instanceof SassColor).toBe(true);
                expect(hexRgb1.getR()).toBe(0xc0);
                expect(hexRgb1.getG()).toBe(0xff);
                expect(hexRgb1.getB()).toBe(0xee);

                expect(hexRgb2 instanceof SassColor).toBe(true);
                expect(hexRgb2.getR()).toBe(0xbe);
                expect(hexRgb2.getG()).toBe(0xef);
                expect(hexRgb2.getB()).toBe(0xed);

                expect(notHex instanceof SassColor).not.toBe(true);

                expect(hexRgb3 instanceof SassColor).toBe(true);
                expect(hexRgb3.getR()).not.toBe(70);
                expect(hexRgb3.getG()).not.toBe(80);
                expect(hexRgb3.getB()).not.toBe(90);
            });

            it('should be able to convert colors in RGB(A) format', function () {
                var rgb1 = toSassValue('rgb(96, 33, 122)'),
                    rgb2 = toSassValue('RGB    (1, 2, 3)'),
                    notRgb = toSassValue('RGB(9001, 131072, 128)'),
                    rgba = toSassValue('rgba ( 11 , 23 , 58 , 0.618033989     )'),
                    notRgba = toSassValue('RGBA(69, 420, 1337, 3.14)');

                expect(rgb1 instanceof SassColor).toBe(true);
                expect(rgb1.getR()).toBe(96);
                expect(rgb1.getG()).toBe(33);
                expect(rgb1.getB()).toBe(122);
                expect(rgb1.getA()).toBeCloseTo(1.0, 0.0);

                expect(rgb2 instanceof SassColor).toBe(true);
                expect(rgb2.getR()).toBe(1);
                expect(rgb2.getG()).toBe(2);
                expect(rgb2.getB()).toBe(3);
                expect(rgb2.getA()).toBeCloseTo(1.0, 0.0);

                expect(notRgb instanceof SassColor).toBe(false);

                expect(rgba instanceof SassColor).toBe(true);
                expect(rgba.getR()).toBe(11);
                expect(rgba.getG()).toBe(23);
                expect(rgba.getB()).toBe(58);
                expect(rgba.getA()).toBeCloseTo(0.618033989, 0.7);

                expect(notRgba instanceof SassColor).not.toBe(true);
            });

            it('should be able to convert colors in other formats', function () {
                var hsl = toSassValue('hsl(240deg, 100%, 100%)'),
                    hsv = toSassValue('hsv(120deg, 20%, 50%)'),
                    cmyk = toSassValue('cmyk(120deg, 20%, 50%)'),
                    hsla = toSassValue('hsla(120deg, 20%, 50%)'),
                    hsva = toSassValue('hsva(120deg, 20%, 50%)'),
                    cmyka = toSassValue('cmyka(120deg, 20%, 50%)');

                expect(hsl instanceof SassColor).toBe(true);
                expect(hsv instanceof SassColor).toBe(true);
                expect(cmyk instanceof SassColor).toBe(true);
                expect(hsla instanceof SassColor).toBe(true);
                expect(hsva instanceof SassColor).toBe(true);
                expect(cmyka instanceof SassColor).toBe(true);
            });

            it('should be able to convert color objects to SassColor', function () {
                var color = toSassValue({
                        red: 123,
                        green: 143,
                        blue: 69
                    }),
                    invalidColor = toSassValue({
                        rojo: 124,
                        verde: 34,
                        azul: 43
                    });

                expect(color instanceof SassColor).toBe(true);
                expect(invalidColor instanceof SassColor).toBe(false);
                expect(invalidColor instanceof SassMap).toBe(true);
            });

            it('should be able to add custom formats of colors', function () {
                var toSassValue = require('./../src/to-sass-value')({
                        color: {
                            channels: {
                                r: ['rojo'],
                                g: ['verde'],
                                b: ['azul']
                            }
                        }
                    }),
                    color = toSassValue({
                        red: 123,
                        green: 143,
                        blue: 69
                    }),
                    validColor = toSassValue({
                        rojo: 124,
                        verde: 34,
                        azul: 43
                    });

                expect(color instanceof SassColor).toBe(true);
                expect(validColor instanceof SassColor).toBe(true);
                expect(validColor instanceof SassMap).toBe(false);
                expect(validColor.getR()).toBe(124);
                expect(validColor.getG()).toBe(34);
                expect(validColor.getB()).toBe(43);
            });
        });

        describe('upon converting arrays', function () {
            it('should be able to convert unidimensional arrays', function () {
                var array = [1, 2, 3, 4, 5],
                    sassArray = toSassValue(array);

                function getOutOfRange() {
                    return sassArray.getValue(5);
                }

                function getLastItem() {
                    return sassArray.getValue(array.length - 1);
                }

                expect(sassArray instanceof SassList).toBe(true);
                expect(sassArray.getValue(1).getValue()).toBe(array[1]);
                expect(getOutOfRange).toThrow(RangeError('Out of bound index'));
                expect(getLastItem).not.toThrow(RangeError('Out of bound index'));
                expect(getLastItem().getValue()).toBe(5);
            });

            it('should be able to convert multidimensional arrays', function () {
                var matrix = [
                        [ 1, 'two',  3,    4,        5],
                        [ 6,     7,  8,    9, '10.2cm'],
                        [11,    12, 13, '14',       []]
                    ],
                    sassMatrix = toSassValue(matrix);

                function getItemAt(y, x) {
                    return sassMatrix
                        .getValue(y)
                        .getValue(x);
                }

                expect(getItemAt(0, 1) instanceof SassString).toBe(true);

                // clincher, but because it can be parsed as Number, it will be.
                expect(getItemAt(2, 3) instanceof SassNumber).toBe(true);

                expect(getItemAt(1, 4) instanceof SassNumber).toBe(true);
                expect(getItemAt(2, 4) instanceof SassList).toBe(true);
            });

            it('should be able to convert the arguments object to a SassList', function () {
                var sassArgs;

                function getArgs() {
                    return toSassValue(arguments);
                }

                sassArgs = getArgs('corn', 'chicken', 'cheese');

                expect(sassArgs instanceof SassList).toBe(true);
                expect(sassArgs.getLength()).toBe(3);
                expect(sassArgs.getValue(1).getValue()).toBe('chicken');
            });
        });

        describe('upon converting objects', function () {
            it('should be able to convert any non-Array object to SassMap', function () {
                var obj = toSassValue({
                    string: 'a',
                    integer: 1,
                    float: 0.5,
                    unit: '50%',
                    color: '#daf0cc',
                    none: null
                });

                expect(obj.getLength()).toBe(6);
            });

            it('should be able to convert Date objects to SassMap', function () {
                var utcDate = toSassValue(new Date('1995-03-02')),
                    tzDate = toSassValue(new Date(1995, 2, 2, 1, 20, 42, 420)); // gets converted to UTC, in my case this is +8

                expect(utcDate instanceof SassMap).toBe(true);
                expect(tzDate instanceof SassMap).toBe(true);

                expect(utcDate.getValue(3).getValue()).toBe(0); // millisecond
                expect(utcDate.getValue(4).getValue()).toBe(0); // second
                expect(utcDate.getValue(5).getValue()).toBe(0); // minute
                expect(utcDate.getValue(6).getValue()).toBe(0); // hour
                expect(utcDate.getValue(7).getValue()).toBe(4); // day
                expect(utcDate.getValue(8).getValue()).toBe(2); // date
                expect(utcDate.getValue(9).getValue()).toBe(9); // week
                expect(utcDate.getValue(10).getValue()).toBe(3); // month
                expect(utcDate.getValue(11).getValue()).toBe(1995); // year

                expect(tzDate.getValue(3).getValue()).toBe(420); // millisecond
                expect(tzDate.getValue(4).getValue()).toBe(42); // second
                expect(tzDate.getValue(5).getValue()).toBe(20); // minute
                expect(tzDate.getValue(6).getValue()).toBe(17); // hour
                expect(tzDate.getValue(7).getValue()).toBe(3); // day
                expect(tzDate.getValue(8).getValue()).toBe(1); // date
                expect(tzDate.getValue(9).getValue()).toBe(9); // week
                expect(tzDate.getValue(10).getValue()).toBe(3); // month
                expect(tzDate.getValue(11).getValue()).toBe(1995); // year
            });
        });
    });
})();
