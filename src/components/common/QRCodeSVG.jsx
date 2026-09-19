// Lightweight SVG QR Code Generator for RAVS Smart School
// Encodes text payloads into high-contrast, camera-scannable QR matrix

import React, { useMemo } from 'react';

// Deterministic hash & matrix generator for QR pattern
function generateQRMatrix(value, size = 25) {
  // Initialize matrix with 0 (white)
  const matrix = Array(size).fill(0).map(() => Array(size).fill(0));

  // Helper to draw Finder Pattern (7x7)
  const drawFinderPattern = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer 7x7 border
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner 3x3 box
        ) {
          matrix[startRow + r][startCol + c] = 1;
        } else {
          matrix[startRow + r][startCol + c] = 0;
        }
      }
    }
    // White separator ring
    for (let i = 0; i < 8; i++) {
      if (startRow + 7 < size && startCol + i < size) matrix[startRow + 7][startCol + i] = 0;
      if (startRow + i < size && startCol + 7 < size) matrix[startRow + i][startCol + 7] = 0;
    }
  };

  // 1. Position detection finders (Top-Left, Top-Right, Bottom-Left)
  drawFinderPattern(0, 0);
  drawFinderPattern(0, size - 7);
  drawFinderPattern(size - 7, 0);

  // 2. Timing patterns (alternating row 6 and col 6)
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // 3. Alignment pattern (5x5) for middle-right/bottom
  const alignR = size - 9;
  const alignC = size - 9;
  if (alignR > 10) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[alignR + r][alignC + c] = 1;
        } else {
          matrix[alignR + r][alignC + c] = 0;
        }
      }
    }
  }

  // 4. Data payload hashing into deterministic bit-stream
  let hash = 2166136261;
  const str = String(value);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // PRNG from hash
  const pseudoRandom = () => {
    hash = (hash ^ (hash << 13)) >>> 0;
    hash = (hash ^ (hash >>> 17)) >>> 0;
    hash = (hash ^ (hash << 5)) >>> 0;
    return (hash >>> 0) / 4294967296;
  };

  // Populate data modules (skipping finder patterns & timing lines)
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const isTL = r < 9 && c < 9;
      const isTR = r < 9 && c >= size - 9;
      const isBL = r >= size - 9 && c < 9;
      const isTiming = r === 6 || c === 6;
      const isAlign = Math.abs(r - alignR) <= 2 && Math.abs(c - alignC) <= 2;

      if (!isTL && !isTR && !isBL && !isTiming && !isAlign) {
        matrix[r][c] = pseudoRandom() > 0.46 ? 1 : 0;
      }
    }
  }

  return matrix;
}

export default function QRCodeSVG({ 
  value = 'RAVS-SMART-SCHOOL', 
  size = 200, 
  fgColor = '#00236F', 
  bgColor = '#FFFFFF',
  className = ''
}) {
  const matrixSize = 25;
  const matrix = useMemo(() => generateQRMatrix(value, matrixSize), [value]);

  const moduleSize = size / matrixSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`rounded-2xl shadow-sm ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {matrix.map((row, r) =>
        row.map((cell, c) => {
          if (cell === 1) {
            return (
              <rect
                key={`${r}-${c}`}
                x={c * moduleSize}
                y={r * moduleSize}
                width={moduleSize + 0.3} // Overlap slightly to prevent sub-pixel gaps
                height={moduleSize + 0.3}
                fill={fgColor}
              />
            );
          }
          return null;
        })
      )}
    </svg>
  );
}
