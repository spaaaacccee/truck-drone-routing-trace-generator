export type Customer = number;
export type Point = {
  x: number;
  y: number;
  time: number;
};

export type Timestep = number;

export type Vehicle = number | "d";

export type Segment = [Customer, Timestep, Vehicle];

export type Output = {
  start: Point;
  end: Point;
  type: "truck" | "drone";
  progress: number;
  vehicle: Vehicle;
  trip?: "outward" | "return";
};
