import React from "react";

/**
 * === 1) Brain-only mark (clean + scalable) ===
 * Non-scaling strokes keep line weight consistent across sizes.
 */
export default function BMVIcon({
  size = 128,
  color = "#153A5B",
  strokeWidth = 8,
  className = "",
  title = "Bright Mind Vision — Brain Icon",
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
    >
      <title>{title}</title>

      {/* Brain outline */}
      <path
        d="
          M86 52
          C 86 34, 102 24, 118 28
          C 128 12, 156 14, 166 30
          C 190 24, 210 40, 210 62
          C 230 66, 240 86, 232 104
          C 246 118, 244 142, 226 154
          C 214 156, 202 164, 196 176
          C 184 170, 168 170, 156 178
          C 146 162, 126 154, 108 156
          C 94 158, 82 166, 74 178
          C 62 172, 46 176, 38 188
          C 20 180, 14 158, 26 140
          C 10 124, 16 96, 38 90
          C 38 70, 58 54, 86 52
          Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Sulci (inner grooves) */}
      <path
        d="M118 44 C132 66, 132 98, 116 116"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M164 44 C150 62, 150 94, 168 114"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M86 120 C102 120, 116 128, 124 138"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Subtle neuron motif */}
      <g fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" strokeLinecap="round">
        <circle cx="94" cy="84" r="6" />
        <circle cx="144" cy="86" r="6" />
        <circle cx="124" cy="122" r="6" />
        <path d="M100 86 L138 86" />
        <path d="M140 92 L128 116" />
        <path d="M118 116 L100 90" />
      </g>
    </svg>
  );
}

/**
 * === 2) Creative variant: Brain + "AI" bubble (refined) ===
 */
export function BMVBrainBubbleIcon({
  size = 128,
  color = "#153A5B",
  strokeWidth = 8,
  className = "",
  title = "Bright Mind Vision — Brain + AI",
}) {
  return (
    <svg
      role="img"
      aria-label={title}
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
    >
      <title>{title}</title>

      {/* reuse the brain path from above */}
      <path
        d="
          M86 52
          C 86 34, 102 24, 118 28
          C 128 12, 156 14, 166 30
          C 190 24, 210 40, 210 62
          C 230 66, 240 86, 232 104
          C 246 118, 244 142, 226 154
          C 214 156, 202 164, 196 176
          C 184 170, 168 170, 156 178
          C 146 162, 126 154, 108 156
          C 94 158, 82 166, 74 178
          C 62 172, 46 176, 38 188
          C 20 180, 14 158, 26 140
          C 10 124, 16 96, 38 90
          C 38 70, 58 54, 86 52
          Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M118 44 C132 66, 132 98, 116 116"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M164 44 C150 62, 150 94, 168 114"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M86 120 C102 120, 116 128, 124 138"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* AI bubble */}
      <g transform="translate(140,130)">
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 30 86 L 22 106 L 44 96"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <text
          x="60"
          y="68"
          textAnchor="middle"
          fontSize="38"
          fontWeight="800"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
          fill={color}
        >
          AI
        </text>
      </g>
    </svg>
  );
}

/**
 * === 3) Wordmark lockup (icon + text) ===
 * Drop into a header/hero. Pass your UI font via CSS if you prefer.
 */
export function BMVLogoLockup({
  size = 48,
  color = "#153A5B",
  strokeWidth = 6,
  textColor, // defaults to color
  className = "",
  title = "Bright Mind Vision",
}) {
  const fillText = textColor || color;
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label={title}>
      <BMVIcon size={size} color={color} strokeWidth={strokeWidth} title={title} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontWeight: 800, fontSize: typeof size === "number" ? size * 0.48 : 22, color: fillText }}>
          Bright Mind Vision
        </div>
        <div style={{ opacity: 0.8, fontWeight: 500, fontSize: typeof size === "number" ? size * 0.22 : 12, color: fillText }}>
          Intelligence. Clarity. Impact.
        </div>
      </div>
    </div>
  );
}
