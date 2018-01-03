const estraverse = require('estraverse');

function findOccurrences(root) {
  // find occurrences using imports and AST
  const occurrences = {};
  occurrences.totalCount = 0;
  estraverse.traverse(root.AST, {
    enter(node) {
      let name = '';
      if (node.type === 'Identifier') { name = node.name; }
      if (node.type === 'CallExpression' || node.type === 'NewExpression') {
        if (node.callee) {
          if (node.callee.name) { name = node.callee.name; }
        }
      }

      if (node.type === 'MemberExpression') {
        if (node.object) {
          if (node.object.name) { name = node.object.name; }
        }
      }
      let done = false;
      for (let i = 0; !done && name.length > 0 && i < root.importsList.length; i++) {
        const localVar = root.importsList[i].local;
        if (name === localVar) {
          done = true;
          if (!occurrences[root.importsList[i].module]) { occurrences[root.importsList[i].module] = 1; } else { occurrences[root.importsList[i].module]++; }
          // console.log("updated: "+name+", "+occurrences[name]);
          occurrences.totalCount++;
        }
      }
    },
  });
  // console.log("");
  // pending - yet to map local variables to absolute path module names
  root.occurrences = occurrences;
  return root;
}

function updateOccurrences(root) {
  if (root.isFile) {
    return findOccurrences(root);
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      root.children[i] = updateOccurrences(root.children[i]);
    }
    return root;
  }
}

module.exports = updateOccurrences;
