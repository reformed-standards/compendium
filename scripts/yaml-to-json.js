const fs = require('fs');
const YAML = require('yaml');

const readFileRoot = './data/yaml';
const writeFileRoot = './data/json/unformatted';

const escapeCharRegex = RegExp(/\\/);
const newLineCharRegex = RegExp(/\n/);
const yamlExtensionRegExp = RegExp(/.yaml/);

const fileToJson = async (file) => {
    const yml = fs.readFileSync(file, 'utf8')
    return YAML.parse(yml);
};
const writeFile = async (path, json) => {
    const directoryPath = path.split('/')[path.split('/').length - 2];
    const writePath = `${writeFileRoot}/${directoryPath}`;
    console.log("hello", json)
    if (fs.existsSync(writePath)) {
        fs.writeFileSync(path, JSON.stringify(json));
    } else {
        fs.mkdir(writePath, async () => {
            writeFile(path, json);
        });
    }
};

const removeFormatting = (json) => Object.keys(json)
    .filter((key) => {
        if (typeof json[key] === 'string') return true;
        return false
    })
    .reduce((acc, key) => {
        const newStr = json[key]
            .split('')
            .map((char) => {
                if (newLineCharRegex.test(char)) return char.replace(newLineCharRegex, ' ')
                if (escapeCharRegex.test(char)) return char.replace(escapeCharRegex, '')
                return char
            })
            .join('')
        return {
            ...acc,
            [key]: newStr
        }
    }, json);


const readFileAndWriteUnformattedJSON = async (pathToSubDir, pathToFile) => {
    const readFilePath = `${readFileRoot}/${pathToSubDir}/${pathToFile}`;
    const json = fileToJson(readFilePath);
    const unFormattedJson = removeFormatting(json);
    const writeFilePath = `${writeFileRoot}/${pathToSubDir}/${pathToFile.replace(yamlExtensionRegExp, '.json')}`;
    writeFile(writeFilePath, unFormattedJson);
};

const readDirectoryAndWriteFiles = async (subDirPath = '') => {
    const fullDirPath = subDirPath.includes(readFileRoot)
        ? subDirPath
        : `${readFileRoot}/${subDirPath}`;
    fs.readdir(fullDirPath, 'utf-8', (err, files) => {
        files
            .forEach(async (file) => {
                const pathToFile = `${fullDirPath}/${file}`;
                const isDir = fs.lstatSync(pathToFile).isDirectory();
                if (isDir) {
                    readDirectoryAndWriteFiles(file);
                }
                else {
                    readFileAndWriteUnformattedJSON(subDirPath, file);
                }
            });
    });
};

readDirectoryAndWriteFiles();
