import { createEffect, onCleanup, onMount } from "solid-js";
import uPlot, { AlignedData, Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface XpCurveUplotProps {
  values: number[];
  label: string;
}

export function XpCurveUplot(props: XpCurveUplotProps) {
  let containerRef!: HTMLDivElement;
  let chartRef!: HTMLDivElement;
  let plot: uPlot | undefined;
  let resizeObserver: ResizeObserver;

  const makeData = (): AlignedData => [
    props.values.map((_, i) => i + 1),
    props.values,
  ];

  const makeOpts = (width: number): Options => ({
    width,
    height: 180,
    scales: {
      x: { time: false },
      y: {},
    },
    axes: [
      { stroke: "#555" },
      { stroke: "#555" },
    ],
    series: [
      {},
      {
        label: props.label,
        stroke: "#4f46e5",
        width: 2,
      },
    ],
  });

  const createPlot = () => {
    const width = Math.max(containerRef.clientWidth, 280); // clamp for mobile
    plot?.destroy();
    plot = new uPlot(makeOpts(width), makeData(), chartRef);
  };

  onMount(() => {
    createPlot();

    resizeObserver = new ResizeObserver(() => {
      createPlot();
    });

    resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    if (!plot) return;
    plot.setData(makeData());
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    plot?.destroy();
  });

  return (
    <div
      ref={containerRef}
      class="w-full overflow-hidden"
    >
      <div ref={chartRef} />
    </div>
  );
}
