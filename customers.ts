import { chain, filter } from "lodash-es";
import { map } from "./input";

export const customers = chain(map)
  .split("\n")
  .map((c) => filter(c.split(" ")).map((c) => parseInt(c)))
  .filter((c) => !!c.length)
  .map(([customer, x, y, demand, readyTime, dueDate, serviceTime]) => ({
    type: "customer",
    id: customer,
    x,
    y,
    demand,
    readyTime,
    dueDate,
    serviceTime,
  }))
  .value();
