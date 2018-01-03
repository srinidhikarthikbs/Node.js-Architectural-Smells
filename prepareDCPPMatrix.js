function prepareDCPPMatrix(root, DCPPMatric, DCPPAllValues) {
  if (root.isFile) {
    const values = [];
    for (const key in root.cdegree) {
      if (root.cdegree.hasOwnProperty(key)) {
        values.push(root.cdegree[key].toFixed(2));
        if (root.cdegree[key]) { DCPPAllValues.push(root.cdegree[key]); }
      }
    }

    DCPPMatric.push(values);
    return;
  }
  if (root.isDir) {
    for (let i = 0; i < root.children.length; i++) {
      prepareDCPPMatrix(root.children[i], DCPPMatric, DCPPAllValues);
    }
  }
}

module.exports = prepareDCPPMatrix;
