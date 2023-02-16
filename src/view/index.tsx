import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { DataSource } from '../types';
import { Mind, MindOptions } from '../core/mind';
import { Node } from '../core/node';

import './style.css';
import { bindZoom } from './zoom';
import React from 'react';
import { classPrefix } from '../utils/class-prefix';

export interface ViewProps<T> {
  width?: number | string;
  height?: number | string;
  dataSource: DataSource<T>;
  render: (data) => React.ReactNode;
  options: MindOptions;
}

const View = <T,>(props: ViewProps<T>, ref) => {
  const { dataSource, render, options } = props;

  const mindRef = useRef<Mind<T>>();

  const [nodes, setNodes] = useState<Node[]>();
  const [visible, setVisible] = useState(false);
  const [update, setUpdate] = useState({});

  const shouldLayout = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // 节点先隐藏渲染后获取宽高，更新到 mind 中
  const updateDomSize = useCallback(
    (node: Node) => (dom: HTMLElement | null) => {
      if (!dom || !mindRef.current) return;

      const size = {
        width: dom?.clientWidth || 0,
        height: dom?.clientHeight || 0,
      };

      mindRef.current.updateSize(node, size);

      // 更新完后
      if (mindRef.current?.isSizeUpdated && shouldLayout.current) {
        // 更新容器的宽，防止塌缩
        containerRef.current?.style.setProperty('width', mindRef.current.boundingBox.right + 5 + 'px');
        setVisible(true);
        shouldLayout.current = false;
      }
    },
    [],
  );

  // 获取节点宽高
  const wrapDomNodes = useMemo(() => {
    if (!mindRef.current || !nodes || !render) return null;

    return nodes.map((node) => {
      const parentExpanded = !node.parent || (node.parent && node.parent.expanded);
      return (
        <div
          key={node.nodeId}
          ref={updateDomSize(node)}
          style={{
            visibility: visible && parentExpanded ? 'visible' : 'hidden',
            position: 'absolute',
            left: node.x,
            top: node.y,
          }}
        >
          {render(node)}
        </div>
      );
    });
  }, [nodes, render, updateDomSize, visible, update]);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  // 创建 Mind 实例, 加载原始数据
  useEffect(() => {
    if (!mindRef.current) {
      const mind = new Mind<T>(
        {
          ...options,
          emitUpdate: () => {
            setUpdate({});
          },
        },
        containerRef.current,
      );
      mindRef.current = mind;
    } else if (options && !shouldLayout.current) {
      mindRef.current.updateOptions(options);
      mindRef.current.draw();
    }
  }, [options]);

  useEffect(() => {
    if (mindRef.current && dataSource) {
      shouldLayout.current = true;
      setVisible(false);
      const nodes = mindRef.current.setData(dataSource).values();
      setNodes([...nodes]);
    }
  }, [dataSource]);

  // 绑定缩放&平移事件
  useEffect(() => {
    if (visible && viewportRef.current && containerRef.current) {
      const { unBind } = bindZoom(viewportRef.current, containerRef.current);

      return unBind;
    }
  }, [visible]);

  useImperativeHandle(
    ref,
    () => {
      return {
        mind: mindRef.current,
      };
    },
    [],
  );

  return (
    <div
      id="m-viewport"
      style={{
        width: props.width,
        height: props.height,
      }}
      onContextMenu={handleContextMenu}
      className={classPrefix('viewport')}
      ref={viewportRef}
    >
      <div id="m-container" ref={containerRef}>
        {wrapDomNodes}
      </div>
    </div>
  );
};

export default React.forwardRef(View);
