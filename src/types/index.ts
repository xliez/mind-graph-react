// 传入的数据结构
export interface DataSource<T = any> {
  nodeId: string;
  // 节点数据
  nodeData: T;
  children?: DataSource<T>[];
  // 是否展开
  expanded?: boolean;
}

// 类似于树的数据结构
export interface TreeLikeNode {
  children?: TreeLikeNode[];
  [key: string]: any;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
