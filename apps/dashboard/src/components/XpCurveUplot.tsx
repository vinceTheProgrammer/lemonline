import { createEffect, onCleanup, onMount } from "solid-js";
import uPlot, { AlignedData, Options } from "uplot";
import "uplot/dist/uPlot.min.css";

interface XpCurveUplotProps {
  values: number[];
  label: string;
}

export function XpCurveUplot(props: XpCurveUplotProps) {
  let chartRef!: HTMLDivElement;
  let plot: uPlot | undefined;

  const makeData = (): AlignedData => [
    props.values.map((_, i) => i + 1),
    props.values,
  ];

  const makeOpts = (): Options => ({
    width: 400,
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
        label: props.label, // 🔑 recreated
        stroke: "#4f46e5",
        width: 2,
      },
    ],
  });

  onMount(() => {
    plot = new uPlot(makeOpts(), makeData(), chartRef);
  });

  // Update data only
  createEffect(() => {
    if (!plot) return;
    plot.setData(makeData());
  });

  // 🔑 Recreate when label changes
  createEffect(() => {
    if (!plot) return;

    plot.destroy();
    plot = new uPlot(makeOpts(), makeData(), chartRef);
  });

  onCleanup(() => {
    plot?.destroy();
  });

  return <div ref={chartRef} />;
}
