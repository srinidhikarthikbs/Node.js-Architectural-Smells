function storeCdegree(node, allFiles) {
  // iterate through all files to find to find if any file has imports which matches this file's exports
  // if so, then calculate the number of occurrences belonging to this file's exports, total
  // then divide by totalCount and store in this node's cdegree object as {"/path/of/imported/file": cdegree_value, .....}
  const cdegree = {};
  const interfaceUsage = {};
  for (let q = 0; q < node.exportsList.length; q++) {
    interfaceUsage[node.exportsList[q]] = 0;
  }
  for (let f = 0; f < allFiles.length; f++) {
    let referenceCount = 0;
    if (allFiles[f].filePath !== node.filePath) {
      for (const keyModule in allFiles[f].occurrences) {
        if (keyModule === 'totalCount') {
          continue;
        }
        if (keyModule.indexOf(node.filePath.substring(0, node.filePath.length - 3)) !== -1) {
          const component = keyModule.split('/')[keyModule.split('/').length - 1];
          const splitComponent = component.split('.');
          if (splitComponent.length === 1) {
            let done = 0;
            for (let i = 0; !done && i < node.exportsList.length; i++) {
              if (node.exportsList[i] === splitComponent[0]) {
                interfaceUsage[splitComponent[0]] += allFiles[f].occurrences[keyModule];
                referenceCount += allFiles[f].occurrences[keyModule];
                done = 1;
              }
            }
            if (!done) {
              if (interfaceUsage.default) {
                interfaceUsage.default += allFiles[f].occurrences[keyModule];
              }
              referenceCount += allFiles[f].occurrences[keyModule];
            }
          } else {
            const subComponent = splitComponent[splitComponent.length - 1];
            let done = 0;
            for (let i = 0; !done && i < node.exportsList.length; i++) {
              if (node.exportsList[i] === subComponent) {
                interfaceUsage[subComponent] += allFiles[f].occurrences[keyModule];
                referenceCount += allFiles[f].occurrences[keyModule];
                done = 1;
              }
            }
            if (!done) {
              if (interfaceUsage.default) {
                interfaceUsage.default += allFiles[f].occurrences[keyModule];
              }
              referenceCount += allFiles[f].occurrences[keyModule];
            }
          }
        }
      }
    }

    if (referenceCount) {
      cdegree[allFiles[f].filePath] = (referenceCount * 1.0 / allFiles[f].occurrences.totalCount * 1.0);
    } else {
      cdegree[allFiles[f].filePath] = 0;
    }
  }
  node.cdegree = cdegree;
  node.interfaceUsage = interfaceUsage;
  return node;
}

function calculateCdegree(root, allFiles) {
  if (root.isFile) {
    return storeCdegree(root, allFiles);
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      root.children[i] = calculateCdegree(root.children[i], allFiles);
    }
    return root;
  }
}

module.exports = calculateCdegree;
