let counter = 0;

export function nanoid(): string {
  counter += 1;
  return `mock-trial-${counter}`;
}

