function stack() {
  this.elements = [];
  this.push = (source) => {
    this.elements.push(source);
  };

  this.pop = () => this.elements.pop();

  this.peek = () => this.elements[this.elements.length - 1];

  this.contains = (x) => {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i] === x) {
        return true;
      }
    }
    return false;
  };
  this.length = () => this.elements.length;
  this.clear = () => {
    this.elements = [];
  };
  this.getPosition = (ele) => {
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i] === ele) {
        return i;
      }
    }
    return -1;
  };
}

module.exports = stack;
