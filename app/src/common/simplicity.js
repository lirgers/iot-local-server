/**
 * @module simplicity
 * @description simplicity template engine (copium)
 * @returns 
 */

// the initial plan was to use an enormous regex for everything, that didn't go well
// /#(if|elseif|foreach|set)\s?\(\s?\$([\w|\d]+(\[\d+\])?\s?(===|==|<|<=|>|>=|=)?(in\s?(\$[\w|\d]+))?\s?(.+))\s?\)/gm;
// #(if|elseif|foreach|set)\s?\(\s?\$([\w|\d]+(\[\d+\])?\s?(===|==|<|<=|>|>=|=)?(in\s?(\$[\w|\d]+))?\s?(\$?[\w|\d]+(\[?\d+\]?)[\w|\d|\.]+)(\([\w|\d|\.|\$]+\))?(.+))\s?\)

module.exports.get = () => {
    const promisify = require('src/common/promisify');
    const timeout = promisify(setTimeout, true);
    return {
        getLoopResult: function (commandBody, tagCode) {
            let result = '';
            let bodyContent = commandBody
                .replace(/#foreach\s?\(\s?[$\d\s\w]+\s?\)/, '')
                .replace(/#end\n$/, '');
            const [left, right] = tagCode.split(' in ');
            const array = this.getEnvValueFromExpression(right.trim()) || [];
            array.forEach((el, index) => {
                // bigger temp template gets, more better, right?
                result += `#set(${left} = ${right.trim()}[${index}])`;
                result += bodyContent;
            });
            return result;
        },
        parseLoop: function (tagCode, startIndex) {
            const { endCommandIndex, commandBody } = this.getNestedComandInfo(startIndex);
            const parsedLoop = this.getLoopResult(commandBody, tagCode);
            this.parsed = this.parsed.substring(0, startIndex) + parsedLoop + this.parsed.substring(endCommandIndex);
        },
        getNestedComandInfo: function (startIndex, textToParse) {
            const regExp = /#(if|foreach|elseif)\s?\(.+\)|#(end)\s?/gm
            let regExpRes;
            let foundCommandEnd;
            let currentEndTagCount = 0;
            let targetEndTagCount = 0;
            let index = 0;

            if (!textToParse) {
                textToParse = this.parsed;
            }

            while ((regExpRes = regExp.exec(textToParse)) !== null) {
                let [ fullMatch, tagName, endTagName ] = regExpRes;
                if (index === 0) {
                    targetEndTagCount++;
                    index++;
                    continue;
                }
                if (endTagName) {
                    tagName = endTagName;
                }
                if (tagName === 'if' || tagName === 'foreach') {
                    targetEndTagCount++;
                } else if (tagName === 'end') {
                    currentEndTagCount++;
                }
                if (currentEndTagCount === targetEndTagCount) {
                    foundCommandEnd = regExpRes;
                    break;
                }
                index++;
            }

            return {
                endCommandIndex: foundCommandEnd.index + foundCommandEnd[0].length,
                commandBody: textToParse.substring(startIndex, foundCommandEnd.index + foundCommandEnd[0].length)
            };
        },
        getConditionResult: function (commandBody) {
            const regExp = /#(if|foreach|elseif)\s?\((.+)\)|#(end)\s?|#(else)\s?/gm
            let regExpRes;
            let options = [];
            let res;
            let previousTag;
            let currentEndTagCount = 0;
            let targetEndTagCount = 0;
            let index = 0;

            while ((regExpRes = regExp.exec(commandBody)) !== null) {
                let [ fullMatch, tagName, equation, endTagName, elseTagName ] = regExpRes;

                if (endTagName) {
                    tagName = endTagName;
                }
                if (elseTagName) {
                    tagName = elseTagName;
                }

                if (index === 0) {
                    previousTag = regExpRes;
                }

                if (index === 0 || tagName === 'if' || tagName === 'foreach') {
                    targetEndTagCount++;
                }

                const oneEndingReamined = targetEndTagCount - currentEndTagCount <= 1;

                if (tagName === 'end'
                    || (oneEndingReamined && tagName === 'else')
                    || (oneEndingReamined && tagName === 'elseif')) {
                    currentEndTagCount++;
                }

                if (currentEndTagCount === targetEndTagCount) {
                    options.push({
                        operatorName: previousTag[1] || previousTag[4],
                        operatorCondition: previousTag[2],
                        body: commandBody.substring(
                            previousTag.index + previousTag[0].length,
                            regExpRes.index
                        )
                    });
                    if (tagName === 'else' || tagName === 'elseif') {
                        currentEndTagCount = 0;
                        targetEndTagCount = 1;
                    } else {
                        currentEndTagCount = 0;
                        targetEndTagCount = 0;
                    }
                    previousTag = regExpRes;
                }
                
                index++;
            }

            options.some(option => {
                if (option.operatorName === 'if' || option.operatorName === 'elseif') {
                    if (this.parseEquation(option.operatorCondition)) {
                        res = option.body;
                        return true;
                    }
                } else {
                    res = option.body
                    return true;
                }
            })

            return res || '';
        },
        parseCondition: async function (startIndex, textToParse) {
            const { endCommandIndex, commandBody } = this.getNestedComandInfo(startIndex, textToParse);
            const resultedText = this.getConditionResult(commandBody);
            if (textToParse) {
                textToParse = textToParse.substring(0, startIndex) + resultedText + textToParse.substring(endCommandIndex);
                return textToParse;
            }
            this.parsed = this.parsed.substring(0, startIndex) + resultedText + this.parsed.substring(endCommandIndex);
        },
        parseVariableSet: function (tag, tagCode) {
            const [, propertyName, unparsedValue] = tagCode.match(/^\$([\w\d]+)\s=\s(.+)/) || [];
            const isEquation = /.+\s?[\+\=\>\<\-\+\*\/]+\s?.+/.test(unparsedValue);

            if (isEquation) {
                this.runtimeScope[propertyName] = this.parseEquation(unparsedValue);
            } else {
                this.runtimeScope[propertyName] = this.getEnvValueFromExpression(unparsedValue);
            }
            
            this.parsed = this.parsed.replace(tag, '');
        },
        getPropertyValue: function (expression, obj) {
            let result;
            let [, property, index] = expression.match(/(.+)\[(\d+)\]/) || [];

            if (!index) {
                property = expression;
            }

            if (obj) {
                result = obj[property];
            } else {
                if (this.runtimeScope[property] !== undefined && this.runtimeScope[property] !== null) {
                    result = this.runtimeScope[property];
                } else {
                    result = this.data[property];
                }
            }

            if (index && result instanceof Array) {
                result = result[Number(index)];
            }

            return result;
        },
        getEnvValueFromExpression: function (expression) {
            const expPart = expression.split('.');
            let result = '';
            expPart.every(part => {
                if (/^\$/.test(part)) {
                    part = part.substr(1);
                    result = this.getPropertyValue(part);
                } else {
                    const [ , functionName, , unparsedValue ] = part.match(/([\w\d]+)(\((.+)?\))/) || [];
                    if (unparsedValue) {
                        // good luck figuring out
                        if (/^[\'|\"].+[\'|\"]$/.test(unparsedValue)) {
                            result = result[functionName]
                                (unparsedValue.substr(1, unparsedValue.length - 1));
                        } else {
                            let value = this.runtimeScope[unparsedValue];
                            if (typeof value === undefined || typeof value === null) {
                                value = this.data[unparsedValue];
                            }
                            result = result[functionName]
                                (typeof value === undefined || typeof value === null ? Number(unparsedValue) : value);
                        }
                    } else if (functionName) {
                        result = result[functionName]()
                    } else if (result && result[part]) {
                        result = result[part];
                    } else {
                        if (/^[\'|\"].+[\'|\"]$/.test(part)) {
                            result = part.substring(1, part.length - 1);
                        } else {
                            result = Number(part);
                        }
                    }
                }
                return result;
            });
            return result;
        },
        parseEquation: function (text) {
            // so much fun
            const [ , operator ]
                = text.match(/[\$]?[\w\d\[\]\]\(\)\'\"\.]+\s?([\+\-\*\/\=><]+)?\s?[\$]?[\w\d\[\]\]\(\)\'\"\.]/) || [];
            if (operator) {
                let [left, right] = text.split(/[\+\-\*\/\=><]+/) || [];
                left = this.getEnvValueFromExpression(left.trim());
                right = this.getEnvValueFromExpression(right.trim());
                switch (operator) {
                    case '+':
                        return left + right;
                    case '-':
                        return left - right;
                    case '*':
                        return left * right;
                    case '/':
                        return left / right;
                    case '==':
                        return left == right;
                    case '===':
                        return left === right;
                    default:
                        return left == right;
                }
            } else {
                return this.getEnvValueFromExpression(text.trim());
            }
        },
        run: async function () {
            let regExp = /(#(if|foreach|set|elseif)\s?\((.+)\))|(\$[\w\d\.]+)|#(else)\s?/gm
            let regExpRes;

            while ((regExpRes = regExp.exec(this.parsed)) !== null) {
                let [ fullMatch, , tagName, tagCode, variable, elseTagName ] = regExpRes;
                if (elseTagName) {
                    tagName = elseTagName;
                }
                if (tagName) {
                    switch (tagName) {
                        case 'if':
                        case 'else':
                        case 'elseif':
                            this.parseCondition(regExpRes.index);
                            break;
                        case 'foreach':
                            this.parseLoop(tagCode, regExpRes.index);
                            break;
                        case 'set':
                            this.parseVariableSet(fullMatch, tagCode.trim());
                            break;
                    }
                } else {
                    let value = this.getEnvValueFromExpression(variable);
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    }
                    this.parsed = this.parsed.replace(variable, value);
                }
                break;
            }

            // why not to parse the whole template over and over again? at least call stack shouldn't be overflown
            // @TODO find out if the performance penalty exists and if there are alternatives
            if (regExpRes) {
                await timeout(this.run(), 0);
            }
        },
        parse: async function (template, data) {
            this.runtimeScope = {};
            this.data = data;
            this.parsed = template;
            await this.run();
            return this.parsed;
        }
    }
}