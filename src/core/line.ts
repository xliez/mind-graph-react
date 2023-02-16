import * as D3 from 'd3';
import { classPrefix } from '../utils/class-prefix.ts';
import { Position } from '../types/index.ts';
import { Mind } from './mind.ts';
import { Node } from './node.ts';

const SvgClassName = classPrefix('svg');
const GroupClassName = classPrefix('group');
const PathClassName = classPrefix('line');

interface IData {
  id: string;
  source: Position;
  target: Position;
}

export class Line<T> {
  mind: Mind<T>;

  constructor(mind: Mind<T>) {
    this.mind = mind;
  }

  fullDraw() {
    const { nodeMap, container, options } = this.mind;
    const lineStyle = options.lineStyle;
    const data: IData[] = Array.from(nodeMap.values()).map((node) => ({
      id: node.nodeId,
      source: node.line.source,
      target: node.line.target,
    }));

    const $container = D3.select(container);
    $container.selectChild(`svg.${SvgClassName}`).remove();

    if ($container.selectChild(`svg.${SvgClassName}`).empty()) {
      $container.append('svg').attr('class', SvgClassName).append('g').attr('class', GroupClassName);
    }

    const lineFn = lineStyle === 'bezier' ? bezier : line;

    $container
      .selectChild(`svg.${SvgClassName}`)
      .selectChild(`g.${GroupClassName}`)
      .selectAll('path')
      .data(data, (d: any) => d.id)
      .join('path')
      .attr('id', (d) => 'l-' + d.id)
      .attr('d', (d) => {
        return lineFn(d);
      })
      .attr('class', PathClassName)
      .attr('fill', 'transparent');
  }

  hideLine = (node: Node) => {
    node.postOrderTraverse(_node => {
      if (_node.parent?.expanded) {
        D3.select(`#l-${_node.nodeId}`).attr('visibility', 'visible');
      } else {
        D3.select(`#l-${_node.nodeId}`).attr('visibility', 'hidden');
      }
    })
  }
}

const bezier = (d: IData) => {
  const link = D3.linkHorizontal();

  return link({
    source: [d.source.x, d.source.y],
    target: [d.target.x, d.target.y],
  });
};

const line = (d: IData) => {
  const link = D3.line();
  const { source, target } = d;

  if (source.y === target.y) {
    return link([
      [source.x, source.y],
      [target.x, target.y],
    ]);
  }

  const mid = {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };

  return link([
    [source.x, source.y],
    [mid.x, source.y],
    [mid.x, target.y],
    [target.x, target.y],
  ]);
};
