function updateUnusedInterfaces(root, unusedInterfacesGlobal) {
  if (root.isFile) {
    const obj = {
      module: root.filePath,
      unusedInterfces: [],
    };
    // console.log(root.filePath)
    // console.log(root.interfaceUsage)
    for (const key in root.interfaceUsage) {
      if (root.interfaceUsage[key] === 0 && key !== 'default') { obj.unusedInterfces.push(key); }
    }
    if (obj.unusedInterfces.length) { unusedInterfacesGlobal.push(obj); }
    return;
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      updateUnusedInterfaces(root.children[i], unusedInterfacesGlobal);
    }
  }
}

module.exports = updateUnusedInterfaces;
