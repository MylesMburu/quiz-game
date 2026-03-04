const colors = [
  "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Cyan",
  "Turquoise", "Magenta", "Crimson", "Gold", "Silver", "Teal", "Coral",
  "Lavender", "Indigo", "Scarlet", "Amber", "Lime",
];

const foods = [
  "Pizza", "Taco", "Burger", "Sushi", "Waffle", "Donut", "Pretzel", "Mango",
  "Cookie", "Bagel", "Pancake", "Noodle", "Burrito", "Cupcake", "Dumpling",
  "Croissant", "Popcorn", "Brownie", "Avocado", "Nacho",
];

export function generateRandomName(existingNames: string[]): string {
  const maxAttempts = 100;
  for (let i = 0; i < maxAttempts; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const food = foods[Math.floor(Math.random() * foods.length)];
    const name = `${color} ${food}`;
    if (!existingNames.includes(name)) {
      return name;
    }
  }
  // Fallback: append a number
  const color = colors[Math.floor(Math.random() * colors.length)];
  const food = foods[Math.floor(Math.random() * foods.length)];
  return `${color} ${food} ${Math.floor(Math.random() * 100)}`;
}
