import './App.css';
import { generateMockTree } from './mock';
import { View } from '../src';
import { useEffect, useRef, useState } from 'react';
import { ViewProps } from '../src/view';
import { Mind } from '../src/core/mind.ts';

const { rootNode, startNodeId } = generateMockTree();

function App<T>() {
  const [nodeCount, setNodeCount] = useState(startNodeId);
  const [data, setData] = useState<ViewProps<T>['dataSource']>();
  const [options, setOptions] = useState<ViewProps<T>['options']>({
    levelGap: 20,
    siblingGap: 20,
    lineStyle: 'bezier',
  });

  const mindRef = useRef<{ mind: Mind<T> }>();

  const render = (node) => {
    const onClick = () => {
      console.log(node);
      mindRef.current.mind.toggleNode(node);
    };

    return (
      <div className="custom-render-box" onClick={onClick}>
        {node.nodeData}
      </div>
    );
  };

  useEffect(() => {
    setData(rootNode as any);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <View dataSource={data} render={render} options={options} width={'80vw'} height={'100vh'} ref={mindRef} />
      <div
        style={{
          borderLeft: '1px solid #eee',
          padding: 20,
        }}
      >
        <label
          style={{
            marginRight: 20,
          }}
        >
          节点个数：{nodeCount}
        </label>
        <button
          onClick={() => {
            const { rootNode, startNodeId } = generateMockTree();
            setData(rootNode as any);
            setNodeCount(startNodeId);
          }}
        >
          重新Mock节点数据
        </button>
        <button
          onClick={() => {
            setOptions({
              levelGap: 20,
              siblingGap: 20,
              lineStyle: options.lineStyle === 'line' ? 'bezier' : 'line',
            });
          }}
        >
          切换线条样式
        </button>
        <div>
          鼠标右键拖动画布，鼠标滚轮缩放画布，鼠标左键点击节点可折叠
        </div>
      </div>
    </div>
  );
}

export default App;
