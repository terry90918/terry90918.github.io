export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿㐀-䶿-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
