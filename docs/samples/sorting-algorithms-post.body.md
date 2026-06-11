Programming is tightly coupled to a simple goal: solve problems with algorithms that are as efficient as possible. It is striking how many different ways exist to attack the same problem, and how much performance changes when you question the "obvious" solution.

To compare algorithms, we usually describe them in a high-level language. Even then, measuring efficiency precisely is not trivial. Counting instructions is a poor proxy for runtime: not all instructions cost the same on the CPU.

This post revisits classic **sorting algorithms** — a foundation for search, merge pipelines, and canonical data layouts — with complexity notes and compact implementations.

## Why sorting still matters

A sorting algorithm rearranges a list so elements satisfy an ordering relation. Efficient sorts matter because many other algorithms (binary search, merge joins, deduplication) assume sorted input for fast execution.

| Algorithm      | Best case   | Average case | Worst case  | Space   | Stable |
|----------------|-------------|--------------|-------------|---------|--------|
| Bubble sort    | O(n)        | O(n²)        | O(n²)       | O(1)    | Yes    |
| Insertion sort | O(n)        | O(n²)        | O(n²)       | O(1)    | Yes    |
| Quicksort      | O(n log n)  | O(n log n)   | O(n²)       | O(log n)| No     |
| Mergesort      | O(n log n)  | O(n log n)   | O(n log n)  | O(n)    | Yes    |
| Heapsort       | O(n log n)  | O(n log n)   | O(n log n)  | O(1)    | No     |

## Bubble sort

Repeatedly scan the array, swapping adjacent elements when they are out of order. Simple to teach; rarely used in production.

**Complexity:** nested loops over `n` elements → **O(n²)** average and worst case.

```typescript
function bubbleSort(arr: number[]): number[] {
  const a = [...arr];
  let swaps = 0;

  for (let i = 1; i < a.length; i++) {
    for (let j = 0; j < a.length - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
      }
    }
  }

  return a;
}
```

## Insertion sort

Build a sorted prefix by inserting each new element into its correct position — like sorting playing cards in your hand.

**Complexity:** inner loop runs 1 + 2 + … + (n−1) times → **O(n²)**. Excellent for small or nearly sorted arrays.

```typescript
function insertionSort(arr: number[]): number[] {
  const a = [...arr];

  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;

    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }

    a[j + 1] = key;
  }

  return a;
}
```

## Quicksort

Divide-and-conquer: pick a pivot, partition smaller elements to the left and larger to the right, recurse on both sides.

**Complexity:**

- Average: **O(n log n)**
- Worst case (already sorted + bad pivot): **O(n²)**

```typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[0];
  const left = arr.slice(1).filter((x) => x <= pivot);
  const right = arr.slice(1).filter((x) => x > pivot);

  return [...quickSort(left), pivot, ...quickSort(right)];
}
```

> Production quicksort uses in-place partitioning (Lomuto or Hoare) to avoid extra allocations.

## Mergesort

Split the array in half recursively until singletons, then merge sorted halves. Predictable **O(n log n)** regardless of input order, at the cost of **O(n)** auxiliary space.

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }

  return result.concat(left.slice(i), right.slice(j));
}
```

## Heapsort

Build a max-heap, repeatedly extract the root (maximum), and restore the heap property. Guarantees **O(n log n)** with **O(1)** extra space when implemented in-place.

Heapsort is a solid choice when you need guaranteed worst-case performance without mergesort's memory overhead.

## Choosing an algorithm

- **Small n (< 50):** insertion sort often wins due to low constant factors.
- **General purpose in-memory:** quicksort (with good pivot strategy) or introspective sort hybrids.
- **Stable sort required:** mergesort or timsort (used by many standard libraries).
- **Memory constrained:** heapsort.

## Takeaways

1. Big-O describes growth rate, not absolute runtime — constants and cache behavior still matter.
2. "Fast on average" (quicksort) can degrade without careful pivot selection.
3. Understand the trade-off between time, space, and stability before picking a sort in production code.

---

*Inspired by the original Making Code post (July 2015). Implementations modernized to TypeScript for clarity.*
