export function hasDatePassed(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  export function parseRelativeDate(input: string): Date {
    const now = new Date();
    const regex = /(\d+)\s*(y|mo|w|d|h|m|s)/gi;
  
    const unitToMs: { [key: string]: number } = {
      y: 365.25 * 24 * 60 * 60 * 1000, // approximate
      mo: 30.44 * 24 * 60 * 60 * 1000, // approximate
      w: 7 * 24 * 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      h: 60 * 60 * 1000,
      m: 60 * 1000,
      s: 1000,
    };
  
    let totalMs = 0;
  
    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      const value = parseInt(match[1] ?? '', 10);
      const unit = (match[2] ?? '').toLowerCase();
  
      // Normalize aliases
      const normalizedUnit = unit === 'mo' ? 'mo' : unit[0] ?? '';
  
      if (unitToMs[normalizedUnit] !== undefined) {
        totalMs += value * unitToMs[normalizedUnit];
      } else {
        throw new Error(`Invalid time unit: ${unit}`);
      }
    }
  
    return new Date(now.getTime() + totalMs);
  }