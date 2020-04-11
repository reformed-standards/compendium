const fs = require('fs');
const YAML = require('yaml');

const removeFormatting = require('./formatHelper');

const readFileRoot = './data/yaml';
const writeFileRoot = './data/json/unformatted';
const yamlExtensionRegExp = RegExp(/.yaml/);

const fileToJson = async (file) => {
    const yml = await fs.readFileSync(file, 'utf8')
    return YAML.parse(yml);
};
const writeFile = async (path, json) => {
    const directoryPath = path.split('/')[path.split('/').length - 2];
    const writePath = `${writeFileRoot}/${directoryPath}`;
    if (fs.existsSync(writePath)) {
        fs.writeFileSync(path, JSON.stringify(json));
    } else {
        fs.mkdir(writePath, async () => {
            writeFile(path, json);
        });
    }
};

const readFileAndWriteUnformattedJSON = async (pathToSubDir, pathToFile) => {
    const readFilePath = `${readFileRoot}/${pathToSubDir}/${pathToFile}`;
    const json = await fileToJson(readFilePath);
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
