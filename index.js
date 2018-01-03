const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const esprima = require('esprima');
const readfiles = require('node-readfiles');
const et = require('elapsed-timer');

function file() {
  this.name = '',
  this.parentName = null,
  this.filePath = '',
  this.isDir = false,
  this.isFile = true,
  this.AST = [],
  this.content = '',
  this.occurrences = {},
  this.importsList = {},
  this.exportsList = [],
  this.cdegree = {},
  this.interfaceUsage = {},
  this.children = [];
}

function sortArray(arr) {
  const allDirs = [];
  const allFiles = [];
  for (let p = 0; p < arr.length; p++) {
    if (arr[p].isDir) { allDirs.push(arr[p]); } else { allFiles.push(arr[p]); }
  }

  // sort alphabetically
  allDirs.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0; // default return value (no sorting)
  });

  allFiles.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0; // default return value (no sorting)
  });

  arr = [];
  for (let p = 0; p < allDirs.length; p++) { arr.push(allDirs[p]); }
  for (let p = 0; p < allFiles.length; p++) { arr.push(allFiles[p]); }
  return arr;
}

function sort(root) {
  if (root.children.length === 0) return root;
  root.children = sortArray(root.children);
  for (let h = 0; h < root.children.length; h++) {
    root.children[h] = sort(root.children[h]);
  }
  return root;
}

function isPresent(Parent, name) {
  for (let p = 0; p < Parent.children.length; p++) {
    if (Parent.children[p].name === name) {
      return Parent.children[p];
    }
  }
  return null;
}

function highestNumberOfChildren(root) {
  if (root.children.length === 0) { return 0; }
  let max = 0;
  for (let j = 0; j < root.children.length; j++) {
    const val = highestNumberOfChildren(root.children[j]);
    if (val > max) { max = val; }
  }
  return Math.max(root.children.length, max);
}

function printAllFileNames(root) {
  if (!root) return;
  console.log(root.filePath);
  for (let i = 0; i < root.children.length; i++) { printAllFileNames(root.children[i]); }
}

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), (err) => {
    if (err) return cb(err);

    fs.writeFile(path, contents, cb);
  });
}

function getAllFiles(root, output) {
  if (root.isFile) { return root.filePath; }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) { output += `${getAllFiles(root.children[i])}\n`; }
    return output;
  }
}

const projectDir = new file();
projectDir.name = 'projectHome';
projectDir.isDir = true;
projectDir.isFile = false;
projectDir.filePath = 'projectHome';
let JSFiles = 0;

module.exports = (dirPath, callback) => {
  const timer = new et.Timer('fileread');
  timer.start();
  readfiles(dirPath, {
    // filter: '*.*',
    // depth: 100
  }, (err, filename, content) => {
    if (err) {
      console.error(err);
    }

    if (!err && filename.toString().indexOf('.js') === filename.toString().length - 3) {
      JSFiles++;
      try {
        esprima.parse(content, {
          sourceType: 'module',
        });
      } catch (err) {
        console.error(err);
        return;
      }
      const absPath = filename;
      const absPathArr = absPath.trim().split('/');
      let Parent = projectDir;
      let pathsofar = '';
      for (let m = 0; m < absPathArr.length - 1; m++) {
        pathsofar = (pathsofar === '') ? absPathArr[m] : `${pathsofar}/${absPathArr[m]}`;
        if (isPresent(Parent, absPathArr[m])) {
          Parent = isPresent(Parent, absPathArr[m]);
        } else {
          const newFile = new file();
          newFile.name = absPathArr[m];
          newFile.isDir = true;
          newFile.isFile = false;
          newFile.parentName = Parent.name;
          newFile.filePath = `${Parent.filePath}/${absPathArr[m]}`;
          Parent.children.push(newFile);
          Parent = newFile;
        }
      }
      const actualFile = new file();
      actualFile.name = absPathArr[absPathArr.length - 1];
      actualFile.parentName = Parent.name;
      actualFile.filePath = `${Parent.filePath}/${absPathArr[absPathArr.length - 1]}`;
      actualFile.AST = esprima.parse(content, {
        sourceType: 'module',
      });
      actualFile.content = content;
      actualFile.children = [];
      Parent.children.push(actualFile);
    }
  }).then((files) => {
    console.log('');
    console.log('');
    console.log(`Read ${files.length} file(s)`);
    console.log(`Read ${JSFiles} JS file(s)`);
    timer.end();
    sort(projectDir);
    callback(projectDir);
    console.log('');
  }).catch((err) => {
    console.log('Error reading files:', err.message);
  });
};
