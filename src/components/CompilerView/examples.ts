export type ExampleCode = Record<string, string>;

export const examples: ExampleCode = {
  // ===== ARITHMETIC =====
  'arithmetic-basic': `// Basic arithmetic operations
x = 10;
y = 3;

sum = x + y;        // Addition: 13
difference = x - y; // Subtraction: 7
product = x * y;    // Multiplication: 30
quotient = x / y;   // Division: 3`,

  'arithmetic-order': `// Order of operations (follows standard precedence)
a = 2;
b = 3;
c = 4;

// Multiplication before addition
result1 = a + b * c;  // Result: 14 (not 20)

// Use parentheses to control order
result3 = (a + b) * c; // Result: 20`,

  // ===== CONTROL FLOW =====
  'control-if-basic': `// Basic if statement
age = 18;
status = 0;  // 0 = Minor, 1 = Adult

if age >= 18 {
    status = 1;  // Adult
}`,

  'control-if-else': `// If-else for binary decisions
temperature = 35;

if temperature > 30 {
    comfort = 1;  // Too hot
} else {
    comfort = 0;  // Comfortable
}`,

  'control-nested-if': `// Nested if statements for multiple conditions
score = 85;

if score >= 90 {
    grade = 4;  // A
} else {
    if score >= 80 {
        grade = 3;  // B
    } else {
        if score >= 70 {
            grade = 2;  // C
        } else {
            grade = 1;  // D
        }
    }
}`,

  // ===== LOOPS =====
  'loops-for-basic': `// For loop - used when you know the iteration count
sum = 0;

// Add numbers from 1 to 10
for i from 1 to 10 {
    sum = sum + i;
}

// Result: 55`,

  'loops-while-basic': `// While loop - used when condition-based iteration
counter = 10;
sum = 0;

// Add numbers while counter is positive
while counter > 0 {
    sum = sum + counter;
    counter = counter - 1;
}

// Result: 55`,

  'loops-while-search': `// Using while loop to search in an array
array numbers[10] = [5, 12, 42, 7, 9, 18, 3, 11, 25, 30];
target = 42;
found = 0;
i = 0;

while i < 10 {
    if numbers[i] == target {
        found = 1;  // Found target
    }
    i = i + 1;
}`,

  'loops-nested': `// Nested loops - multiplication table concept
row = 1;

while row <= 3 {
    col = 1;
    while col <= 3 {
        // Would compute: row * col
        result = row * col;
        col = col + 1;
    }
    row = row + 1;
}`,

  // ===== SUBROUTINES/FUNCTIONS =====
  'function-simple': `// Simple function with one parameter
fn square(n) {
    result = n * n;
    return result;
}

x = 5;
answer = square(x);  // Returns 25`,

  'function-multiple-params': `// Function with multiple parameters
fn add(a, b) {
    sum = a + b;
    return sum;
}

x = 10;
y = 20;
total = add(x, y);  // Returns 30`,

  'function-max': `// Finding maximum of two numbers
fn max(a, b) {
    if a > b {
        return a;
    } else {
        return b;
    }
}

x = 15;
y = 25;
largest = max(x, y);  // Returns 25`,

  'function-factorial-recursive': `// Factorial using recursion
fn fact(n) {
    if n <= 1 {
        // Base case: 0! = 1, 1! = 1
        return 1;
    } else {
        // Recursive case: n! = n * (n-1)!
        return n * fact(n - 1);
    }
}

x = 5;
result = fact(x);  // Returns 120`,

  'function-fibonacci': `// Fibonacci sequence using recursion
fn fib(n) {
    if n <= 1 {
        // Base cases: fib(0) = 0, fib(1) = 1
        return n;
    } else {
        // Recursive: fib(n) = fib(n-1) + fib(n-2)
        return fib(n - 1) + fib(n - 2);
    }
}

x = 7;
result = fib(x);  // Returns 13`,

  'function-power': `// Power function using iteration
fn power(base, exp) {
    result = 1;
    i = 0;

    // Multiply base by itself exp times
    while i < exp {
        result = result * base;
        i = i + 1;
    }

    return result;
}

answer = power(2, 8);  // Returns 256`,

  'function-gcd': `// Greatest Common Divisor (Euclidean algorithm)
fn gcd(a, b) {
    // Keep finding remainder until b is 0
    while b != 0 {
        temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

result = gcd(48, 18);  // Returns 6`,

  // ===== ARRAYS & STRINGS =====
  'array-sum': `// Computing sum of array elements
array data[5] = [10, 20, 30, 40, 50];
sum = 0;
i = 0;

while i < 5 {
    sum = sum + data[i];
    i = i + 1;
}`,

  'array-find-max': `// Finding maximum element in array
array nums[6] = [12, 3, 41, 7, 25, 19];
max = nums[0];
i = 1;

while i < 6 {
    if nums[i] > max {
        max = nums[i];
    }
    i = i + 1;
}`,

  'string-length': `// Computing string length using array-style parameter
fn strlen(s) {
    i = 0;
    while s[i] != 0 {
        i = i + 1;
    }
    return i;
}

str = "Hello, world!";
len = strlen(str);`,

  'array-reverse': `// Reversing an array (using two pointers)
array a[6] = [1, 2, 3, 4, 5, 6];
left = 0;
right = 5;

while left < right {
    temp = a[left];
    a[left] = a[right];
    a[right] = temp;
    left = left + 1;
    right = right - 1;
}`,

  // ===== ADVANCED =====
  'advanced-is-prime': `// Check if a number is prime
fn is_prime(n) {
    if n <= 1 {
        return 0;  // Not prime
    }

    if n == 2 {
        return 1;  // 2 is prime
    }

    // Check divisibility from 2 to n-1
    i = 2;
    while i < n {
        if n % i == 0 {
            return 0;  // Found divisor, not prime
        }
        i = i + 1;
    }

    return 1;  // No divisors found, is prime
}

result = is_prime(17);  // Returns 1 (true)`,

  'advanced-bubble-sort': `// Bubble sort algorithm
fn bubble_sort(arr, n) {
    i = 0;

    // Outer loop: n-1 passes
    while i < n - 1 {
        j = 0;

        // Inner loop: compare adjacent elements
        while j < n - i - 1 {
            // If elements are out of order, swap
            if arr[j] > arr[j + 1] {
                temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
            j = j + 1;
        }
        i = i + 1;
    }

    return arr;
  }

  array values[8] = [9, 2, 7, 1, 8, 3, 6, 4];
  sorted = bubble_sort(values, 8);`,

  'advanced-binary-search': `// Binary search in sorted array
fn binary_search(arr, target, n) {
    left = 0;
    right = n - 1;

    while left <= right {
        // Find middle index
        mid = (left + right) / 2;

        if arr[mid] == target {
            return mid;  // Found target
        }

        if arr[mid] < target {
            left = mid + 1;  // Search right half
        } else {
            right = mid - 1;  // Search left half
        }
    }

  return -1;  // Not found
}

array sorted[8] = [3, 7, 9, 12, 18, 25, 31, 42];
index = binary_search(sorted, 25, 8);`,

  'advanced-sum-of-digits': `// Sum of digits in a number
fn sum_digits(n) {
    sum = 0;

    // Extract each digit using modulo
    while n > 0 {
        digit = n % 10;  // Get last digit
        sum = sum + digit;
        n = n / 10;      // Remove last digit
    }

    return sum;
}

num = 12345;
result = sum_digits(num);  // Returns 15`,
};

export type ExampleCategory = {
  label: string;
  examples: Array<{ key: string; label: string }>;
};

export const exampleCategories: ExampleCategory[] = [
  {
    label: 'Arithmetic',
    examples: [
      { key: 'arithmetic-basic', label: 'Basic Operations' },
      { key: 'arithmetic-order', label: 'Order of Operations' },
    ],
  },
  {
    label: 'Control Flow',
    examples: [
      { key: 'control-if-basic', label: 'Basic If Statement' },
      { key: 'control-if-else', label: 'If-Else' },
      { key: 'control-nested-if', label: 'Nested If Statements' },
    ],
  },
  {
    label: 'Loops',
    examples: [
      { key: 'loops-for-basic', label: 'For Loop (Basic)' },
      { key: 'loops-while-basic', label: 'While Loop (Basic)' },
      { key: 'loops-while-search', label: 'While Loop (Search)' },
      { key: 'loops-nested', label: 'Nested Loops' },
    ],
  },
  {
    label: 'Functions & Recursion',
    examples: [
      { key: 'function-simple', label: 'Simple Function' },
      { key: 'function-multiple-params', label: 'Multiple Parameters' },
      { key: 'function-max', label: 'Maximum of Two Numbers' },
      { key: 'function-factorial-recursive', label: 'Factorial (Recursive)' },
      { key: 'function-fibonacci', label: 'Fibonacci (Recursive)' },
      { key: 'function-power', label: 'Power Function' },
      { key: 'function-gcd', label: 'Greatest Common Divisor' },
    ],
  },
  {
    label: 'Arrays & Strings',
    examples: [
      { key: 'array-sum', label: 'Sum Array Elements' },
      { key: 'array-find-max', label: 'Find Maximum Element' },
      { key: 'string-length', label: 'String Length' },
      { key: 'array-reverse', label: 'Reverse Array' },
    ],
  },
  {
    label: 'Advanced Algorithms',
    examples: [
      { key: 'advanced-is-prime', label: 'Prime Number Check' },
      { key: 'advanced-bubble-sort', label: 'Bubble Sort' },
      { key: 'advanced-binary-search', label: 'Binary Search' },
      { key: 'advanced-sum-of-digits', label: 'Sum of Digits' },
    ],
  },
];

