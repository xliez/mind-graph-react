import * as D3 from 'd3';

export const bindZoom = (viewport: Element, container: Element) => {
  const $viewport = D3.select(viewport);
  const $container = D3.select(container);
  const zoom = D3.zoom().filter((event) => {
    return event.button === 2 || event.type === 'wheel';
  });

  $viewport.call(
    zoom.on('zoom', (e) => {
      $container.style('transform', `translate(${e.transform.x}px, ${e.transform.y}px) scale(${e.transform.k})`);
      $container.style('transform-origin', 'left top');
    }),
  );

  const unBind = () => {
    $viewport.on('.zoom', null);
  };

  return {
    unBind,
  };
};
