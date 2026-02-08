export function getRandomElement<T>(array: T[] | readonly T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}