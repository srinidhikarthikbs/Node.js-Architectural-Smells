const estraverse = require('estraverse');

function repairPathForDependencyGraph(nodePath, modulePath) {
  const splitNodePath = nodePath.split('/');
  splitNodePath.pop(); // to remove node file name - it is useless, parent's path is what is left
  const splitModulePath = modulePath.split('/');
  if (splitModulePath.length === 1) { return `projectHome/${splitModulePath[0]}`; }


  const finalPath = splitNodePath.join('/');
  const splitFinalPath = finalPath.split('/');
  for (let i = 0; i < splitModulePath.length; i++) {
    if (splitModulePath[i] === '.') {
    } else if (splitModulePath[i] === '..') {
      splitFinalPath.pop();
    } else {
      const fileName = splitModulePath[i];
      splitFinalPath.push(fileName);
    }
  }
  return splitFinalPath.join('/');
}

function repairPath(nodePath, modulePath) {
  const splitNodePath = nodePath.split('/');
  splitNodePath.pop();
  const splitModulePath = modulePath.split('/');
  if (splitModulePath.length === 1 || (splitModulePath[splitModulePath.length - 1].indexOf('.') !== -1 && splitModulePath[splitModulePath.length - 1].substring(splitModulePath[splitModulePath.length - 1].indexOf('.'), splitModulePath[splitModulePath.length - 1].length) !== '.js')) { return false; } // for npm dependencies

  const finalPath = splitNodePath.join('/');
  const splitFinalPath = finalPath.split('/');
  for (let i = 0; i < splitModulePath.length; i++) {
    if (splitModulePath[i] === '.') {
    } else if (splitModulePath[i] === '..') {
      splitFinalPath.pop();
    } else {
      let fileName = splitModulePath[i];

      if (i === splitModulePath.length - 1 && fileName.indexOf('.js') !== -1) { fileName = fileName.substring(0, fileName.indexOf('.js')); }

      splitFinalPath.push(fileName);
    }
  }
  return splitFinalPath.join('/');
}

function storeImports(root, g, g1) {
  g.addNode(root.filePath);
  g1.addNode(root.filePath);
  const objarr = [];
  estraverse.traverse(root.AST, {
    enter(node) {
      if (node.type === 'ImportDeclaration') {
        if (node.specifiers.length === 0) {
          g1.addNode(repairPathForDependencyGraph(root.filePath, node.source.value));
          g.addNode(repairPathForDependencyGraph(root.filePath, node.source.value), {
            color: 'white',
          }).set('style', 'filled');
          g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value));
          g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value)).set('color', 'red');
          if (repairPath(root.filePath, node.source.value)) {
            objarr.push({
              module: repairPath(root.filePath, node.source.value),
              local: '',
            });
          }
        } else {
          for (let j = 0; j < node.specifiers.length; j++) {
            if (node.specifiers[j].type === 'ImportNamespaceSpecifier') {
              g1.addNode(repairPathForDependencyGraph(root.filePath, node.source.value));
              g.addNode(repairPathForDependencyGraph(root.filePath, node.source.value), {
                color: 'white',
              }).set('style', 'filled');
              g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value));
              g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value)).set('color', 'red');
              if (node.specifiers[j].local.name) {
                if (repairPath(root.filePath, node.source.value)) {
                  objarr.push({
                    module: repairPath(root.filePath, node.source.value),
                    local: node.specifiers[j].local.name,
                  });
                }
              } else if (repairPath(root.filePath, node.source.value)) {
                objarr.push({
                  module: repairPath(root.filePath, node.source.value),
                  local: '',
                });
              }
            } else if (node.specifiers[j].type === 'ImportDefaultSpecifier') {
              if (node.specifiers[j].local.name) {
                g1.addNode(repairPathForDependencyGraph(root.filePath, node.source.value));
                g.addNode(repairPathForDependencyGraph(root.filePath, node.source.value), {
                  color: 'white',
                }).set('style', 'filled');
                g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value));
                g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value)).set('color', 'red');
                if (repairPath(root.filePath, node.source.value)) {
                  objarr.push({
                    module: `${repairPath(root.filePath, node.source.value)}.${node.specifiers[j].local.name}`,
                    local: node.specifiers[j].local.name,
                  });
                }
              }
            } else if (node.specifiers[j].type === 'ImportSpecifier') {
              if (node.specifiers[j].local.name) {
                g1.addNode(repairPathForDependencyGraph(root.filePath, node.source.value));
                g.addNode(repairPathForDependencyGraph(root.filePath, node.source.value), {
                  color: 'white',
                }).set('style', 'filled');
                g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value));
                g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.source.value)).set('color', 'red');
                if (repairPath(root.filePath, node.source.value)) {
                  objarr.push({
                    module: `${repairPath(root.filePath, node.source.value)}.${node.specifiers[j].imported.name}`,
                    local: node.specifiers[j].local.name,
                  });
                }
              }
            }
          }
        }
      }

      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'CallExpression') {
          if (node.expression.callee.name === 'require') {
            if (node.expression.arguments[0].type === 'Literal') {
              g1.addNode(repairPathForDependencyGraph(root.filePath, node.expression.arguments[0].value));
              g.addNode(repairPathForDependencyGraph(root.filePath, node.expression.arguments[0].value), {
                color: 'white',
              }).set('style', 'filled');
              g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.expression.arguments[0].value));
              g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, node.expression.arguments[0].value)).set('color', 'red');
              if (repairPath(root.filePath, node.expression.arguments[0].value)) {
                objarr.push({
                  module: repairPath(root.filePath, node.expression.arguments[0].value),
                  local: '',
                });
              }
            }
          }
        }
      } else if (node.type === 'VariableDeclaration') {
        let moduleVar = '';
        let subModuleVar = '';
        for (let q = 0; q < node.declarations.length; q++) {
          let localVar = '';
          if (node.declarations[q].id) {
            if (node.declarations[q].id.name) {
              localVar = node.declarations[q].id.name;
            // console.log(localVar)
            }
          }

          if (node.declarations[q].init) {
            if (node.declarations[q].init.type === 'CallExpression') {
              if (node.declarations[q].init.callee.name === 'require') {
                if (node.declarations[q].init.arguments[0].type === 'Literal') {
                  moduleVar = node.declarations[q].init.arguments[0].value;
                  if (moduleVar.length) {
                    g1.addNode(repairPathForDependencyGraph(root.filePath, moduleVar));
                    g.addNode(repairPathForDependencyGraph(root.filePath, moduleVar), {
                      color: 'white',
                    }).set('style', 'filled');
                    g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, moduleVar));
                    g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, moduleVar)).set('color', 'red');
                  }
                  if (moduleVar.length && repairPath(root.filePath, moduleVar)) {
                    objarr.push({
                      module: repairPath(root.filePath, moduleVar),
                      local: localVar,
                    });
                  }
                  // console.log(node.declarations[q].init.arguments[q].value);
                }
              }
            }
            if (node.declarations[q].init.type === 'MemberExpression') {
              if (node.declarations[q].init.object) {
                if (node.declarations[q].init.object.callee) {
                  if (node.declarations[q].init.object.callee.name === 'require') {
                    // console.log(JSON.stringify(node, null ,4))
                    if (node.declarations[q].init.property.type === 'Identifier') {
                      subModuleVar = node.declarations[q].init.property.name;
                      // console.log(subModuleVar)
                      if (node.declarations[q].init.arguments) {
                        if (node.declarations[q].init.arguments[0].type === 'Literal') { moduleVar = node.declarations[q].init.arguments[0].value; }
                      }
                      if (node.declarations[q].init.object) {
                        if (node.declarations[q].init.object.arguments[0].type === 'Literal') { moduleVar = node.declarations[q].init.object.arguments[0].value; }
                      }
                      if (moduleVar.length) {
                        g1.addNode(repairPathForDependencyGraph(root.filePath, moduleVar));
                        g.addNode(repairPathForDependencyGraph(root.filePath, moduleVar), {
                          color: 'white',
                        }).set('style', 'filled');
                        g1.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, moduleVar));
                        g.addEdge(root.filePath, repairPathForDependencyGraph(root.filePath, moduleVar)).set('color', 'red');
                      }
                      if (moduleVar.length && subModuleVar.length && repairPath(root.filePath, moduleVar)) {
                        objarr.push({
                          module: `${repairPath(root.filePath, moduleVar)}.${subModuleVar}`,
                          local: localVar,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  });
  root.importsList = objarr;
  return root;
}

function updateImports(root, g, g1) {
  if (root.isFile) {
    return storeImports(root, g, g1);
    // return root;
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      root.children[i] = updateImports(root.children[i], g, g1);
    }
    return root;
  }
}

module.exports = updateImports;
