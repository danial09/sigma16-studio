export type ExampleCode = Record<string, string>;

export const examples: ExampleCode = {
  simple: `x = 5;
y = 10;
z = x + y;`,

  ifelse: `x = 5;
y = 10;
if x < y {
    z = x + y;
} else {
    z = x - y;
}`,

  while: `counter = 10;
sum = 0;
while counter > 0 {
    sum = sum + counter;
    counter = counter - 1;
}`,

  for: `result = 0
for i from 1 to 10 {
    result = result + i;
}`,

  complex: `x = 5;
y = 10;
if x < y {
    z = x + y;
} else {
    z = x - y;
}
while z > 0 {
    z = z - 1;
    w = z * 2;
}
result = z + 100;
for i from 1 to 10 {
    result = result + i;
}`,
};

export const examplesList = [
  { key: 'simple', label: 'Simple' },
  { key: 'ifelse', label: 'If-Else' },
  { key: 'while', label: 'While Loop' },
  { key: 'for', label: 'For Loop' },
  { key: 'complex', label: 'Complex' },
];
