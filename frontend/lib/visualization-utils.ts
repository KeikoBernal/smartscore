// Color mapping utilities for the mango palette
export const MANGO_COLORS = {
  yellow: "#FFC500",
  orange: "#F29D37",
  coral: "#F6504E",
  pink: "#DA3361",
  purple: "#9F1B7F",
} as const

export const MANGO_PALETTE = [
  MANGO_COLORS.purple,
  MANGO_COLORS.pink,
  MANGO_COLORS.coral,
  MANGO_COLORS.orange,
  MANGO_COLORS.yellow,
]

// Generate color scale for data visualization
export function getColorScale(dataLength: number): string[] {
  if (dataLength <= MANGO_PALETTE.length) {
    return MANGO_PALETTE.slice(0, dataLength)
  }

  // For larger datasets, interpolate between colors
  const colors: string[] = []
  for (let i = 0; i < dataLength; i++) {
    const index = (i / (dataLength - 1)) * (MANGO_PALETTE.length - 1)
    const lowerIndex = Math.floor(index)
    const upperIndex = Math.ceil(index)

    if (lowerIndex === upperIndex) {
      colors.push(MANGO_PALETTE[lowerIndex])
    } else {
      // Simple interpolation between two colors
      colors.push(MANGO_PALETTE[lowerIndex])
    }
  }

  return colors
}

// Normalize data for visualization
export function normalizeData(data: number[], min?: number, max?: number): number[] {
  const dataMin = min ?? Math.min(...data)
  const dataMax = max ?? Math.max(...data)
  const range = dataMax - dataMin

  if (range === 0) return data.map(() => 0.5)

  return data.map((value) => (value - dataMin) / range)
}

// Calculate entropy for musical data
export function calculateEntropy(frequencies: number[]): number {
  const total = frequencies.reduce((sum, freq) => sum + freq, 0)
  if (total === 0) return 0

  const probabilities = frequencies.map((freq) => freq / total)
  return -probabilities.reduce((entropy, prob) => {
    return prob > 0 ? entropy + prob * Math.log2(prob) : entropy
  }, 0)
}

// Generate coordinate mapping for orchestra seating
export function generateOrchestraSeating(): Array<{ instrument: string; x: number; y: number; section: string }> {
  return [
    // Strings
    { instrument: "Violin I", x: 0.2, y: 0.8, section: "strings" },
    { instrument: "Violin II", x: 0.8, y: 0.8, section: "strings" },
    { instrument: "Viola", x: 0.9, y: 0.6, section: "strings" },
    { instrument: "Cello", x: 0.7, y: 0.4, section: "strings" },
    { instrument: "Double Bass", x: 0.9, y: 0.2, section: "strings" },

    // Woodwinds
    { instrument: "Flute", x: 0.3, y: 0.6, section: "woodwinds" },
    { instrument: "Oboe", x: 0.4, y: 0.6, section: "woodwinds" },
    { instrument: "Clarinet", x: 0.5, y: 0.6, section: "woodwinds" },
    { instrument: "Bassoon", x: 0.6, y: 0.6, section: "woodwinds" },

    // Brass
    { instrument: "Horn", x: 0.3, y: 0.4, section: "brass" },
    { instrument: "Trumpet", x: 0.4, y: 0.4, section: "brass" },
    { instrument: "Trombone", x: 0.5, y: 0.4, section: "brass" },
    { instrument: "Tuba", x: 0.6, y: 0.4, section: "brass" },

    // Percussion
    { instrument: "Timpani", x: 0.1, y: 0.2, section: "percussion" },
    { instrument: "Percussion", x: 0.2, y: 0.2, section: "percussion" },
  ]
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Generate musical intervals data
export const MUSICAL_INTERVALS = [
  { name: "Unison", semitones: 0, color: MANGO_COLORS.purple },
  { name: "Minor 2nd", semitones: 1, color: MANGO_COLORS.pink },
  { name: "Major 2nd", semitones: 2, color: MANGO_COLORS.coral },
  { name: "Minor 3rd", semitones: 3, color: MANGO_COLORS.orange },
  { name: "Major 3rd", semitones: 4, color: MANGO_COLORS.yellow },
  { name: "Perfect 4th", semitones: 5, color: MANGO_COLORS.purple },
  { name: "Tritone", semitones: 6, color: MANGO_COLORS.pink },
  { name: "Perfect 5th", semitones: 7, color: MANGO_COLORS.coral },
  { name: "Minor 6th", semitones: 8, color: MANGO_COLORS.orange },
  { name: "Major 6th", semitones: 9, color: MANGO_COLORS.yellow },
  { name: "Minor 7th", semitones: 10, color: MANGO_COLORS.purple },
  { name: "Major 7th", semitones: 11, color: MANGO_COLORS.pink },
  { name: "Octave", semitones: 12, color: MANGO_COLORS.coral },
]

// Circle of fifths positions
export const CIRCLE_OF_FIFTHS = [
  { key: "C", angle: 0, color: MANGO_COLORS.purple },
  { key: "G", angle: 30, color: MANGO_COLORS.pink },
  { key: "D", angle: 60, color: MANGO_COLORS.coral },
  { key: "A", angle: 90, color: MANGO_COLORS.orange },
  { key: "E", angle: 120, color: MANGO_COLORS.yellow },
  { key: "B", angle: 150, color: MANGO_COLORS.purple },
  { key: "F#", angle: 180, color: MANGO_COLORS.pink },
  { key: "Db", angle: 210, color: MANGO_COLORS.coral },
  { key: "Ab", angle: 240, color: MANGO_COLORS.orange },
  { key: "Eb", angle: 270, color: MANGO_COLORS.yellow },
  { key: "Bb", angle: 300, color: MANGO_COLORS.purple },
  { key: "F", angle: 330, color: MANGO_COLORS.pink },
]
