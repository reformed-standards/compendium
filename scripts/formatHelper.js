const escapeCharRegex = RegExp(/\\/);
const newLineCharRegex = RegExp(/\n/);
const yamlExtensionRegExp = RegExp(/.yaml/);

const removeFormattingForString = (str) => {
    return str
        .split('')
        .map((char) => {
            if (newLineCharRegex.test(char)) return char.replace(newLineCharRegex, ' ')
            if (escapeCharRegex.test(char)) return char.replace(escapeCharRegex, '')
            return char
        })
        .join('');
}

const removeFormattingForObjects = (obj) => {
    if (!obj) return '';
    if (Array.isArray(obj)) {
        return obj
            .map((data) => {
                if (typeof data === 'string') {
                    return removeFormattingForString(data);
                }
                if (typeof data === 'object') {
                    console.log("data", data);
                    return removeFormattingForObjects(data);
                }
                return data;
            });
    }
    return Object
        .keys(obj)
        .reduce((acc, key) => {
            if (Array.isArray(acc[key])) {
                return {
                    ...acc,
                    [key]: removeFormattingForObjects(obj[key])
                };
            }
            if (typeof acc[key] === 'string') {
                return {
                    ...acc,
                    [key]: removeFormattingForString(acc[key])
                }
            }
            if (typeof acc[key] === 'object') {
                return {
                    ...acc,
                    [key]: removeFormattingForObjects(acc[key])
                }
            }
            return acc;
        }, obj);
}

const removeFormatting = (json) => {
    const keysToBeUnFormatted = Object
            .keys(json)
            .filter((key) => {
                if (typeof json[key] === 'string') return true;
                if (typeof json[key] === 'object') return true;
                return false
            });
    return keysToBeUnFormatted
        .map((key) => ({ key, type: typeof json[key] }))
        .reduce((acc, key) => {
            switch (key.type) {
                case 'string':
                    return {
                        ...acc,
                        [key.key]: removeFormattingForString(acc[key.key])
                    };
                case 'object':
                    return {
                        ...acc,
                        [key.key]: removeFormattingForObjects(acc[key.key])
                    }
            }
        }, json);
};

module.exports = removeFormatting;