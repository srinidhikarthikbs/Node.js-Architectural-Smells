const estraverse = require('estraverse');

function removeDuplicates(list) {
  const hash = {};
  const finalList = [];
  for (let i = 0; i < list.length; i++) {
    if (!hash[list[i]]) {
      hash[list[i]] = 1;
      finalList.push(list[i]);
    }
  }
  return finalList;
}

function storeExports(node) {
  const exportsList = [];
  estraverse.traverse(node.AST, {
    enter(node) {
      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'AssignmentExpression') {
          if (node.expression.left.type === 'MemberExpression') {
          // for exports
            if (node.expression.left.object && node.expression.left.object.name === 'exports') {
              if (node.expression.left.property) {
                if (node.expression.left.property.name) { exportsList.push(node.expression.left.property.name); } else { exportsList.push('default'); }
              } else if (node.expression.left.name === 'exports') {
                exportsList.push('default');
                if (node.expression.right.properties && node.expression.right.type === 'ObjectExpression') {
                  for (let m = 0; m < node.expression.right.properties.length; m++) {
                    if (node.expression.right.properties[m].type === 'Property') {
                      if (node.expression.right.properties[m].key) {
                        if (node.expression.right.properties[m].key.name) { exportsList.push(node.expression.right.properties[m].key.name); }
                      }
                    }
                  }
                }
              }
            }

            // for module.exports
            if (node.expression.left.object.name && node.expression.left.object.name === 'module' && node.expression.left.property.name === 'exports') {
              exportsList.push('default');
              if (node.expression.right.properties && node.expression.right.type === 'ObjectExpression') {
                for (let m = 0; m < node.expression.right.properties.length; m++) {
                  if (node.expression.right.properties[m].type === 'Property') {
                    if (node.expression.right.properties[m].key) {
                      if (node.expression.right.properties[m].key.name) { exportsList.push(node.expression.right.properties[m].key.name); }
                    }
                  }
                }
              }
            } else {
              let lparent = node.expression;
              let l = node.expression.left;
              while (l.object.object) {
                lparent = l;
                l = l.object;
              }

              if (l.object.name === 'module' && l.property.name === 'exports') {
                if (lparent.property) {
                  if (lparent.property.name) { exportsList.push(lparent.property.name); }
                }
              }
            }
          }
        }
      }

      // for es6 type
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration != null) {
          if (node.declaration.type === 'VariableDeclaration') {
            for (let i = 0; i < node.declaration.declarations.length; i++) {
              exportsList.push(node.declaration.declarations[i].id.name);
            }
          }
          if (node.declaration.type === 'FunctionDeclaration') {
            exportsList.push(node.declaration.id.name);
          }
          if (node.declaration.type === 'ClassDeclaration') {
            exportsList.push(node.declaration.id.name);
          }
        } else {
          for (let i = 0; i < node.specifiers.length; i++) {
            if (node.specifiers[i].type === 'ExportSpecifier') {
              if (node.source != null) { exportsList.push(`${node.source.value}.${node.specifiers[i].exported.name}`); } else { exportsList.push(node.specifiers[i].exported.name); }
            }
          }
        }
      }

      if (node.type === 'ExportDefaultDeclaration') {
        if (node.declaration != null) {
          if (node.declaration.type !== 'Identifier' && node.declaration.type !== 'Literal' && node.declaration.type !== 'FunctionDeclaration' && node.declaration.type !== 'ClassDeclaration') {
            exportsList.push('default');
          }
          if (node.declaration.type === 'Identifier') {
            exportsList.push(node.declaration.name);
          }
          if (node.declaration.type === 'Literal') {
            exportsList.push(node.declaration.value);
          }
          if (node.declaration.type === 'FunctionDeclaration') {
            if (node.declaration.id) {
              exportsList.push(node.declaration.id.name);
            } else {
              exportsList.push('default');
            }
          }
          if (node.declaration.type === 'ClassDeclaration') {
            if (node.declaration.id) {
              exportsList.push(node.declaration.id.name);
            } else {
              exportsList.push('default');
            }
          }
        } else {
          exportsList.push('default');
        }
      }

      if (node.type === 'ExportAllDeclaration') {
        exportsList.push(node.source.value);
      }
    },
  });
  node.exportsList = removeDuplicates(exportsList);
  return node;
}

function updateExports(root) {
  if (root.isFile) {
    return storeExports(root);
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      root.children[i] = updateExports(root.children[i]);
    }
    return root;
  }
}

module.exports = updateExports;
