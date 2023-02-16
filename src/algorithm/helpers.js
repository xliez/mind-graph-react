import { layout, Tree } from './algorithm';

class BoundingBox {
  /**
   * @param {number} gap - the gap between sibling nodes
   * @param {number} bottomPadding - the height reserved for connection drawing
   */
  constructor(gap, bottomPadding) {
    this.gap = gap;
    this.bottomPadding = bottomPadding;
  }

  addBoundingBox(width, height) {
    return { width: width + this.gap, height: height + this.bottomPadding };
  }

  addBoundingBoxHorizontal(width, height) {
    return { width: width + this.bottomPadding, height: height + this.gap };
  }

  /**
   * Return the coordinate without the bounding box for a node
   */
  removeBoundingBox(x, y) {
    return { x: x + this.gap / 2, y };
  }

  removeBoundingBoxHorizontal(x, y) {
    return { x, y: y + this.gap / 2 };
  }
}

class Layout {
  constructor(boundingBox) {
    this.bb = boundingBox;
  }

  /**
   * Layout treeData.
   * Return modified treeData and the bounding box encompassing all the nodes.
   *
   * See getSize() for more explanation.
   */
  layout(treeData) {
    const tree = this.convert(treeData);
    layout(tree);
    const { boundingBox, result } = this.assignLayout(tree, treeData);

    return { result, boundingBox };
  }

  /**
   * horizontal layout treeData.
   */
  layoutHorizontal(treeData) {
    const tree = this.convertHorizontal(treeData);
    layout(tree);
    const { boundingBox, result } = this.assignLayoutHorizontal(tree, treeData);
    return { result, boundingBox };
  }

  /**
   * Returns Tree to layout, with bounding boxes added to each node.
   */
  convert(treeData, y = 0) {
    if (treeData === null) return null;

    const { width, height } = this.bb.addBoundingBox(treeData.width, treeData.height);
    let children = [];
    if (treeData.children && treeData.children.length) {
      for (let i = 0; i < treeData.children.length; i++) {
        children[i] = this.convert(treeData.children[i], y + height);
      }
    }

    return new Tree(width, height, y, children);
  }

  /**
   * horizontal convert
   */
  convertHorizontal(treeData, x = 0) {
    if (treeData === null) return null;

    const { width, height } = this.bb.addBoundingBoxHorizontal(treeData.width, treeData.height);
    let children = [];
    if (treeData.children && treeData.children.length) {
      for (let i = 0; i < treeData.children.length; i++) {
        children[i] = this.convertHorizontal(treeData.children[i], x + width);
      }
    }

    return new Tree(height, width, x, children);
  }

  /**
   * Assign layout tree x, y coordinates back to treeData,
   * with bounding boxes removed.
   */
  assignCoordinates(tree, treeData) {
    const { x, y } = this.bb.removeBoundingBox(tree.x, tree.y);
    treeData.x = x;
    treeData.y = y;
    for (let i = 0; i < tree.c.length; i++) {
      this.assignCoordinates(tree.c[i], treeData.children[i]);
    }
  }

  /**
   * Return the bounding box that encompasses all the nodes.
   * The result has a structure of
   * { left: number, right: number, top: number, bottom: nubmer}.
   * This is not the same bounding box concept as the `BoundingBox` class
   * used to construct `Layout` class.
   */
  getSize(treeData, box = null) {
    const { x, y, width, height } = treeData;
    if (box === null) {
      box = { left: x, right: x + width, top: y, bottom: y + height };
    }
    box.left = Math.min(box.left, x);
    box.right = Math.max(box.right, x + width);
    box.top = Math.min(box.top, y);
    box.bottom = Math.max(box.bottom, y + height);

    if (treeData.children) {
      for (const child of treeData.children) {
        this.getSize(child, box);
      }
    }

    return box;
  }

  /**
   * This function does assignCoordinates and getSize in one pass.
   */
  assignLayout(tree, treeData, box = null) {
    const { x, y } = this.bb.removeBoundingBox(tree.x, tree.y);
    treeData.x = x;
    treeData.y = y;

    const { width, height } = treeData;
    if (box === null) {
      box = { left: x, right: x + width, top: y, bottom: y + height };
    }
    box.left = Math.min(box.left, x);
    box.right = Math.max(box.right, x + width);
    box.top = Math.min(box.top, y);
    box.bottom = Math.max(box.bottom, y + height);

    for (let i = 0; i < tree.c.length; i++) {
      this.assignLayout(tree.c[i], treeData.children[i], box);
    }

    return { result: treeData, boundingBox: box };
  }

  /**
   * swap x & y ann  assign Coordinates
   */
  assignLayoutHorizontal(tree, treeData, box = null) {
    const { x, y } = this.bb.removeBoundingBox(tree.x, tree.y);
    treeData.y = x;
    treeData.x = y;

    const { width, height } = treeData;
    if (box === null) {
      box = { left: y, right: y + width, top: x, bottom: x + height };
    }
    box.left = Math.min(box.left, y);
    box.right = Math.max(box.right, y + width);
    box.top = Math.min(box.top, x);
    box.bottom = Math.max(box.bottom, x + height);


    for (let i = 0; i < tree.c.length; i++) {
      this.assignLayoutHorizontal(tree.c[i], treeData.children[i], box);
    }

    return { result: treeData, boundingBox: box };
  }
}

export { Layout, BoundingBox };
