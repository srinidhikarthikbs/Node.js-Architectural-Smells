const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getDirName = require('path').dirname;
const Stack = require('./stack');

const stack = new Stack();
let visited = {};
const objcycle = [];

function writeFile(filePath, contents, cb) {
  mkdirp(getDirName(filePath), (err) => {
    if (err) return cb(err);
    fs.writeFile(filePath, contents, cb);
  });
}

function findDFS(g1, inputPath) {
  const graphNodes = g1.nodes();
  for (let i = 0; i < graphNodes.length; i++) {
    visited = {};
    stack.clear();
    dfs(g1, graphNodes[i]);
  }

  writeFile(path.join(__dirname, `./output/${inputPath}/dependency_result.txt`), JSON.stringify(objcycle, null, 2), (err) => {
    if (err) {
      return console.log(err);
    }

    console.log('Dependency File was saved');
  });
}

function dfs(graph, source) {
  visited[source] = 1;
  stack.push(source);
  const cycle = [];
  const adjacents = graph.adjacent(source);
  for (let i = 0; i < adjacents.length; i++) {
    if (visited[adjacents[i]] && stack.contains(adjacents[i])) {
      let position = stack.getPosition(adjacents[i]);

      while (position !== stack.length() - 1) {
        cycle.push(stack.elements[position]);
        position++;
      }
      cycle.push(stack.elements[stack.length() - 1]);
      objcycle.push({
        cycle,
      });
    }
    if (!visited[adjacents[i]]) {
      dfs(graph, adjacents[i]);
    }
  }
  stack.pop();
}

function adjacent1(x) {
  const result = g1.adjacent(x);
  return result;
}

module.exports = findDFS;
