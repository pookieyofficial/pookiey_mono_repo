console.log('Hello, TypeScript World!');

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function add(a: number, b: number): number {
  return a + b;
}

// Example usage
const message = greet('Developer');
console.log(message);
console.log('Project intialized by PyCLI');

const sum = add(5, 3);
console.log(`5 + 3 = ${sum}`);
