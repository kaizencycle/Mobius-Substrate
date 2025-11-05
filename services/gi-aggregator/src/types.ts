export type GISample = {
  t: number;   // epoch millis
  gi: number;  // 0..1
  w?: number;  // optional weight (defaults to 1)
};

