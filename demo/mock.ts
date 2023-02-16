export function generateMockTree(maxLevel = 5, maxChildren = 5) {
  let startNodeId = 1;
  function generateNode(nodeId, level) {
    return {
      nodeId,
      nodeData: `Node ${nodeId}`,
      children: [],
      level,
      expanded: true,
    };
  }

  function generateChildren(node, level) {
    if (level >= maxLevel) {
      return;
    }

    const childrenCount = Math.ceil(Math.random() * maxChildren);
    for (let i = 0; i < childrenCount; i++) {
      const child = generateNode(++startNodeId, level + 1);
      node.children.push(child);
      generateChildren(child, level + 1);
    }
  }

  const rootNode = generateNode(1, 0);
  generateChildren(rootNode, 0);

  return {
    rootNode,
    startNodeId,
  };
}
