import { arcs } from "./input";
import { customers } from "./customers";
import { Output, Point, Segment, Vehicle } from "./types";
import { chain, find, pick, mapValues } from "lodash-es";
import { writeFile } from "fs/promises";
import { dump } from "js-yaml";

const CUSTOMER = 0;
const TIMESTEP = 1;
const VEHICLE = 2;

const SEGMENT_COUNT_TRUCK = 2;
const SEGMENT_COUNT_DRONE = 3;

const end = chain(arcs)
  .flatten()
  .map(([, timestep]) => timestep)
  .max()
  .value();

const between = (a: Segment, b: Segment, i: number) =>
  a[TIMESTEP] <= i && i <= b[TIMESTEP];

const progress = (a: Segment, b: Segment, i: number) =>
  (i - a[TIMESTEP]) / (b[TIMESTEP] - a[TIMESTEP]);

const coordinate = (a: Segment): Point => ({
  ...pick(customers[a[CUSTOMER]], ["x", "y"]),
  time: a[TIMESTEP],
});

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

const interpolate = (a: Point, b: Point, n: number): Point =>
  mapValues(a, (v, k) => lerp(v, b[k], n));

const events = chain(end + 1)
  .range()
  .map((i) => {
    const out: Output[] = [];
    for (const arc of arcs) {
      switch (arc.length) {
        case SEGMENT_COUNT_TRUCK:
          {
            const [start, end] = arc;
            if (between(start, end, i)) {
              out.push({
                start: coordinate(start),
                end: coordinate(end),
                type: "truck",
                vehicle: start[VEHICLE],
                progress: progress(start, end, i),
              });
            }
          }
          break;
        case SEGMENT_COUNT_DRONE:
          {
            const [start, middle, end] = arc;
            if (between(start, end, i)) {
              out.push({
                start: coordinate(start),
                end: coordinate(end),
                type: "drone",
                vehicle: start[VEHICLE],
                progress: progress(start, end, i),
                trip: between(start, middle, i) ? "outward" : "return",
              });
            }
          }
          break;
      }
    }
    return out.map((c) => ({
      ...c,
      ...interpolate(c.start, c.end, c.progress),
    }));
  })
  .map((arcs, id) => ({
    id,
    type: "timestep",
    arcs,
  }))
  .value();

await writeFile(
  "arcs.trace.yaml",
  dump(
    {
      version: "1.4.0",
      views: {
        arc: [
          {
            $: "circle",
            x: "${{ $.arc.x }}",
            y: "${{ $.arc.y }}",
            radius: 0.5,
            fill: "${{ $.color }}",
            clear: true,
            label: "V:${{ $.arc.vehicle }}",
            "label-color": "${{ theme.foreground }}",
            "label-size": 0.5,
            "label-x": 0.25,
            "label-y": 1,
            $info: "${{ $.arc }}",
          },
          {
            $: "path",
            points: ["${{ $.arc.start }}", "${{ $.arc.end }}"],
            fill: "${{ $.color }}",
            clear: true,
            alpha: 0.5,
          },
        ],
        main: [
          {
            $: "arc",
            arc: "${{ $.arcs[$.i] }}",
            color:
              "${{ ({ outward: color.yellow, return: color.red })[$.arcs[$.i].trip] ?? color.green }}",
            $for: {
              $to: "${{ $.arcs.length }}",
            },
          },
        ],
      },
      events,
    },
    { noCompatMode: true }
  )
);
