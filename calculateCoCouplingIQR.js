function getLength(x) {
  let count = 0;
  for (const key in x) {
    if (x.hasOwnProperty(key)) {
      count++;
    }
  }
  return count++;
}

function calculateCoCouplingIQR(root, threshold, coCouplingIQR) {
  if (root.isFile) {
    const obj = {
      module: root.filePath,
      smells: {},
    };
    for (const key in root.cdegree) {
      if (root.cdegree.hasOwnProperty(key)) {
        if (root.cdegree[key] > threshold) {
          obj.smells[key] = root.cdegree[key];
        }
      }
    }
    if (getLength(obj.smells)) {
      coCouplingIQR.push(obj);
    }
    return;
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      calculateCoCouplingIQR(root.children[i], threshold, coCouplingIQR);
    }
  }
}

module.exports = calculateCoCouplingIQR;
