module.exports = {
    match: function (text, regex, index) {
        const res = text.match(regex);
        return res ? res[typeof index !== 'undefined' ? index : 1] : null;
    },
    replaceVariable: function (text, data) {
        let reg = /{{\w+}}/gm;
        let variablePlaceholder;
        while ((variablePlaceholder = reg.exec(text)) !== null) {
            if (typeof data === 'string') {
                text = text.replace(variablePlaceholder[0], data);
            } else {
                const dataPropertyName = this.match(variablePlaceholder[0], /{{(\w+)}}/);
                text = text.replace(variablePlaceholder[0], data[dataPropertyName]);
            }
        }
        return text;
    },
    parseTag: function (text, nestedCommandOpening) {
        const commandStartIndex = text.indexOf(nestedCommandOpening);
        const dataPropertyName = this.match(nestedCommandOpening, /{{[#|^](\w+)}}/);;
        const ifStatementSymbol = this.match(nestedCommandOpening, /{{([#|^])\w+}}/);;
        const isTrue = ifStatementSymbol === '#';
        const commandEndClose = `{{/${dataPropertyName}}}`;
        const textAfterNestedCoomendOpening = text.substr(commandStartIndex + nestedCommandOpening.length);
        const commandEndIndex = text.length - textAfterNestedCoomendOpening.length
            + textAfterNestedCoomendOpening.indexOf(commandEndClose) + commandEndClose.length;

        if (commandEndIndex === -1) {
            throw new Error(`No close tag for ${nestedCommandOpening}!`);
        }

        let commandBlock = text.substring(commandStartIndex, commandEndIndex);
        let innerBlock = text.substring(
            commandStartIndex + nestedCommandOpening.length,
            commandEndIndex - commandEndClose.length
        );
        return { isTrue, dataPropertyName, commandBlock, innerBlock };
    },
    parseNestedCommands: function (text, { parent, data }, nestedCommandOpening) {
        var { isTrue, dataPropertyName, commandBlock, innerBlock } = this.parseTag(text, nestedCommandOpening);
        let parsed = commandBlock;
        const emptyChildData = data[dataPropertyName] === null || data[dataPropertyName] === undefined;
        const emptyParentData = parent[dataPropertyName] === undefined || parent[dataPropertyName] === null;

        if (isTrue && (emptyChildData && emptyParentData)
            || (!isTrue && data[dataPropertyName])) {
            return { parsed: '', toReplace: commandBlock };
        }

        if (!((emptyChildData ? parent[dataPropertyName] : data[dataPropertyName]) instanceof Array)) {
            const foundCommandOpening = this.match(innerBlock, /({{[#|^]\w+}})/);
            if (foundCommandOpening) {
                const { parsed: parsedSubCommandRes, toReplace } = this.parseNestedCommands(
                    parsed, { parent: data, data: data[dataPropertyName] }, foundCommandOpening
                );
                parsed = parsed.replace(toReplace, parsedSubCommandRes);
                var { isTrue, dataPropertyName, innerBlock } = this.parseTag(parsed, nestedCommandOpening);
            }
        }

        if ((!emptyChildData && isTrue) || (!emptyParentData && isTrue) || emptyChildData && !isTrue) {
            const sourceAttrVal = emptyChildData ? parent[dataPropertyName] : data[dataPropertyName];
            if (typeof sourceAttrVal === 'string') {
                parsed = this.replaceVariable(innerBlock, sourceAttrVal);
            } else if (sourceAttrVal instanceof Array) {
                let replaced = '';

                const foundCommandOpening = this.match(innerBlock, /({{[#|^]\w+}})/);
                sourceAttrVal.forEach((value) => {
                    if (foundCommandOpening) {
                        const { parsed: parsedSubCommandRes, toReplace } = this.parseNestedCommands(
                            innerBlock,
                            { parent: emptyChildData ? parent[dataPropertyName] : data[dataPropertyName], data: value },
                            foundCommandOpening
                        );
                        let updatedInnerBlock = innerBlock.replace(toReplace, parsedSubCommandRes);
                        replaced += this.replaceVariable(updatedInnerBlock, dataPropertyName === value ? { [dataPropertyName]: value } : value);
                    } else {
                        replaced += this.replaceVariable(innerBlock, dataPropertyName === value ? { [dataPropertyName]: value } : value);
                    }
                });
                parsed = replaced;
            } else if (typeof sourceAttrVal === 'object') {
                parsed = this.replaceVariable(innerBlock, sourceAttrVal);
            } else {
                parsed = innerBlock;
            }
        }

        return { parsed, toReplace: commandBlock };
    },
    parse: function (text, data) {
        var reg = /{{[#|^]\w+}}/gm;
        var parseResult = [];
        let parsedText = text;
        let found = this.match(parsedText, reg, 0);

        while (found) {
            const { parsed, toReplace } = this.parseNestedCommands(parsedText, { parent: data, data }, found);
            parsedText = parsedText.replace(toReplace, parsed);
            found = this.match(parsedText, reg, 0);
        }

        parseResult.forEach(res => {
            parsedText = text.replace(res.toReplace, res.parsed);
        })

        return parsedText || text;
    }
}