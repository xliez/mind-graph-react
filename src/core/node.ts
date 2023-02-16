import { Size } from '../types';

interface Position {
  x: number;
  y: number;
}

export class Node {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  level: number;
  parent?: Node;
  rect: Size = {
    width: 0,
    height: 0,
  };
  children?: Node[];
  nodeId: string;
  nodeData?: any;
  expanded = true;

  line: {
    source: Position;
    target: Position;
  } = {
    source: {
      x: 0,
      y: 0,
    },
    target: {
      x: 0,
      y: 0,
    },
  };

  constructor({
    level,
    nodeId,
    expanded,
    nodeData,
  }: {
    level: number;
    nodeId: string;
    nodeData?: any;
    expanded?: boolean;
  }) {
    this.level = level;
    this.nodeId = nodeId;
    this.expanded = !!expanded;
    this.nodeData = nodeData;
  }

  setChildren(children: Node, idx: number) {
    if (this.children) {
      this.children[idx] = children;
    } else {
      this.children = [children];
    }
  }

  postOrderTraverse(fn: (node: Node) => void) {
    this.children?.forEach((child) => {
      child.postOrderTraverse(fn);
    });
    fn(this);
  }

  /**
   * 展开或收起某个节点
   */
  toggle() {
    this.expanded = !this.expanded;
    /**
     * 触发更新，将节点隐藏/展示，同时隐藏/展示连线
     */
  }
}
