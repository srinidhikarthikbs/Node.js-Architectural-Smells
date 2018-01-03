const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const getTree = require('./index');
const graphviz = require('graphviz');
const graph = require('graph-data-structure');
const iqr = require('compute-iqr');
const stats = require('stats-analysis');
const et = require('elapsed-timer');

// my imports
const updateExports = require('./updateExports');
const updateImports = require('./updateImports');
const updateOccurrences = require('./updateOccurrences');
const calculateCdegree = require('./calculateCdegree');
const updateUnusedInterfaces = require('./updateUnusedInterfaces');
const prepareDCPPMatrix = require('./prepareDCPPMatrix');
const calculateCoCouplingIQR = require('./calculateCoCouplingIQR');
const calculateCoCouplingMAD = require('./calculateCoCouplingMAD');
const findDFS = require('./findDFS');

const g1 = graph();
const g = graphviz.digraph('G');
g.set('size', '10,8.5');
g.set('ratio', 'fill');

// call the other script and get the directory object
let inputPath = 'test';
if (!(process.argv[2])) { console.log('Please specify an appropriate input path'); } else
if (!process.argv[2].length) { console.log('Please specify an appropriate input path'); } else {
  inputPath = process.argv[2].split('/')[process.argv[2].split('/').length - 2];
  console.log(inputPath);
  getTree(process.argv[2], handleTree);
}


function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), (err) => {
    if (err) return cb(err);
    fs.writeFile(path, contents, cb);
  });
}

function printExportsImportsOccurrences(root) {
  if (!root) return;
  console.log(root.filePath);
  if (root.isFile) {
    console.log(root.interfaceUsage);
  }
  for (let i = 0; i < root.children.length; i++) { printExportsImportsOccurrences(root.children[i]); }
}

const allFiles = [];

function storeAllFiles(root) {
  if (root.isFile) {
    allFiles.push(root);
    return;
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      storeAllFiles(root.children[i]);
    }
  }
}

const unusedInterfaces = [];

const DCPPMatrix = [];
const DCPPAllValues = [];

function getDCPPValues() {
  let output = '';
  for (let i = 0; i < DCPPMatrix.length; i++) {
    output = `${output}\n${JSON.stringify(DCPPMatrix[i])}`;
  }
  return output;
}

const coCouplingIQR = [];
const coCouplingMAD = [];

function handleTree(root) {
  // your code goes here
  console.log('\n\nProgress:');

  // extract exports and store them
  const totalTime = new et.Timer('totalTime');
  totalTime.start();

  root = updateExports(root);

  // next task of extracting imports, storing them
  root = updateImports(root, g, g1);

  // find occurrences
  root = updateOccurrences(root);

  storeAllFiles(root);

  // calculate cdegree
  root = calculateCdegree(root, allFiles);

  findDFS(g1, inputPath);

  writeFile(path.join(__dirname, `./output/${inputPath}/dot_result.dot`), g.to_dot(), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('Dot File was saved');
  });

  updateUnusedInterfaces(root, unusedInterfaces);
  writeFile(path.join(__dirname, `./output/${inputPath}/unusedInterfaces.txt`), JSON.stringify(unusedInterfaces, null, 4), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('Unused Interfaces was saved');
  });


  prepareDCPPMatrix(root, DCPPMatrix, DCPPAllValues);
  writeFile(path.join(__dirname, `./output/${inputPath}/DCPPMatrix.txt`), getDCPPValues(), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('DCPP Matrix was saved');
  });

  const IQRValue = 1.5 * iqr(DCPPAllValues);
  calculateCoCouplingIQR(root, IQRValue, coCouplingIQR);
  writeFile(path.join(__dirname, `./output/${inputPath}/coCouplingIQR.txt`), JSON.stringify(coCouplingIQR, null, 4), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('Cocoupling IQR was saved');
  });

  const MADValue = 2 * stats.MAD(DCPPAllValues);
  calculateCoCouplingMAD(root, MADValue, coCouplingMAD);
  writeFile(path.join(__dirname, `./output/${inputPath}/coCouplingMAD.txt`), JSON.stringify(coCouplingMAD, null, 4), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('Cocoupling MAD was saved');
  });

  g.output('png', path.join(__dirname, `./output/${inputPath}/dot_graph.png`), (err) => {

  });
  totalTime.end();
}
