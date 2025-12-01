export function formatStatLabel(label) {
  return label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Placeholder() { return null; }
