import { writeFile } from "fs/promises";
import { dump } from "js-yaml";
import { customers } from "./customers";

await writeFile(
  "customers.trace.yaml",
  dump(
    {
      version: "1.4.0",
      views: {
        main: [
          {
            $: "circle",
            x: "${{ $.customers[$.i].x }}",
            y: "${{ $.customers[$.i].y }}",
            radius: 1,
            alpha: 0.25,
            fill: "${{ theme.foreground }}",
            $for: { $to: "${{ $.customers.length }}" },
            label: "N:${{ $.i }}",
            "label-color": "${{ theme.foreground }}",
            "label-size": 0.5,
            "label-x": 0.25,
            "label-y": 1.5,
            $info: { customer: "${{ $.i }}" },
          },
        ],
      },
      events: [
        {
          type: "customer-list",
          customers,
        },
      ],
    },
    { noCompatMode: true }
  )
);
