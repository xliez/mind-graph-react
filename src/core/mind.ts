import { DataSource, Position, Size } from '../types';
import { Node } from './node';
import { BoundingBox, Layout } from '../algorithm';
import { Line } from './line.ts';

export interface MindOptions {
  levelGap: number;
  siblingGap: number;
  className?: string;
  lineStyle?: 'line' | 'bezier';
  emitUpdate?: (args?: any) => any;
}

const genDefaultOptions = (options: MindOptions): MindOptions => ({
  lineStyle: 'bezier',
  ...options,
});

export interface MindNode<T> {
  position: Position;
  size: Size;
  level?: number;
  parent?: MindNode<T>;
  node: DataSource<T>;
  rect?: Size;
}

/**
 * Mind Core Class
 *
 */
export class Mind<T> {
  /**
   * 配置
   */
  options: MindOptions;

  /**
   * 树形节点打平为 Map<id, Node>
   */
  nodeMap: Map<string, Node> = new Map();

  /**
   * 保持树形结构的内部Node
   */
  tree: Node;

  /**
   * 原始数据
   */
  sourceData: DataSource<T>;

  /**
   * 已更新宽高的节点数量
   */
  updatedNodeCount = 0;

  /**
   * 容器 DOM
   */
  container: HTMLElement;

  line: Line<T>;

  /**
   * 容器 大小
   */
  boundingBox: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  constructor(options: MindOptions, container: HTMLElement | null = null) {
    this.options = genDefaultOptions(options);
    this.container = container;
    this.line = new Line(this);
  }

  /**
   * 加载数据，构建内部数据结构的树
   */
  setData(data: DataSource<T>) {
    this.sourceData = data;
    this.clearUpdate();
    return this.buildTree();
  }

  /**
   * 是否全部节点宽高更新完成
   */
  get isSizeUpdated() {
    return this.updatedNodeCount === this.nodeMap.size;
  }

  /**
   * 更新配置
   */
  updateOptions(options: MindOptions) {
    this.options = genDefaultOptions(options);
  }

  /**
   * 重制已更新节点数量
   */
  clearUpdate() {
    this.updatedNodeCount = 0;
  }

  /**
   * 更新宽高，全部节点更新完成后，计算布局
   */
  updateSize(mindNode: Node, size: Size) {
    mindNode.width = size.width;
    mindNode.height = size.height;
    this.updatedNodeCount += 1;

    if (this.isSizeUpdated) {
      this.layoutHorizontal();
      this.draw();
    }
  }

  /**
   * 生成树, map 扁平化节点
   */
  buildTree() {
    const queue = [this.sourceData];

    this.nodeMap.clear();
    this.tree = new Node({
      ...this.sourceData,
      level: 1,
    });

    const queue2 = [this.tree];

    while (queue.length) {
      const node = queue.shift()!;
      const node2 = queue2.shift()!;

      this.nodeMap.set(node.nodeId, node2);

      if (node.children && node.expanded) {
        queue.push(...node.children);

        node.children.map((child, idx) => {
          const childNode = new Node({
            ...child,
            level: node2.level + 1,
          });
          childNode.parent = node2;
          node2.setChildren(childNode, idx);

          queue2.push(childNode);
        });
      }
    }

    return this.nodeMap;
  }

  /**
   * 计算布局
   */
  layoutHorizontal() {
    const bb = new BoundingBox(this.options.siblingGap, this.options.levelGap);

    const layout = new Layout(bb);

    // 整体大小
    const { boundingBox } = layout.layoutHorizontal(this.tree);
    this.boundingBox = boundingBox;

    this.computeConnect();
    // this.draw();
  }

  /**
   * 计算连线位置
   */
  computeConnect() {
    this.tree.postOrderTraverse((node) => {
      if (!node.parent) {
        return;
      }

      const parent = node.parent;

      const target = {
        x: node.x,
        y: node.y + node.height / 2,
      };

      const source = {
        x: parent.x + parent.width,
        y: parent.y + parent.height / 2,
      };

      node.line = {
        source,
        target,
      };
    });
  }

  /**
   * 画连线
   */
  draw() {
    this.line.fullDraw();
  }

  /**
   * 折叠某个节点
   */
  toggleNode(node: Node) {
    // node.expanded = !node.expanded;
    const newExpanded = !node.expanded;
    node.postOrderTraverse((node) => (node.expanded = newExpanded));
    this.line.hideLine(node);
    this.options.emitUpdate?.();
  }
}
