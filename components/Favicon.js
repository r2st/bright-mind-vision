export default function Favicon({ color = "#4A9B8E" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width="32"
      height="32"
    >
      {/* Bigger nodes */}
      <circle cx="32" cy="12" r="12" fill={color} />
      <circle cx="12" cy="52" r="12" fill={color} />
      <circle cx="52" cy="52" r="12" fill={color} />

      {/* Thicker connectors */}
      <line
        x1="32"
        y1="20"
        x2="12"
        y2="44"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="20"
        x2="52"
        y2="44"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
