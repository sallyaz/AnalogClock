/**
 * Clock calculation and time utility functions
 */

/**
 * Gets current time in specified timezone or local time
 */
export const getTimeInTimezone = (timezone?: string): Date => {
  const now = new Date();
  
  if (!timezone) {
    return now;
  }
  
  try {
    // Get the time string in the target timezone
    const timeString = now.toLocaleString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // Parse it back to a Date
    // Format: "MM/DD/YYYY, HH:mm:ss"
    const [datePart, timePart] = timeString.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  } catch (error) {
    console.error('[clockUtils] Error converting timezone:', error);
    return now;
  }
};

/**
 * Calculates rotation degrees for clock hands
 * - Hour: 0° = 12 o'clock, 90° = 3 o'clock
 * - Minute/Second: 0° = 12 o'clock
 */
export const getHandRotations = (date: Date) => {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = ((hours + minutes / 60 + seconds / 3600) / 12) * 360;

  return { hourDeg, minuteDeg, secondDeg };
};

/**
 * Calculates responsive clock size based on window dimensions
 */
export const calculateClockSize = (width: number, height: number): number => {
  return Math.max(Math.min(width, height) * 0.5, 150);
};

/**
 * Calculates hand lengths based on clock center radius
 */
export const getHandLengths = (center: number) => ({
  second: center * 0.85,
  minute: center * 0.75,
  hour: center * 0.55,
});

/**
 * Returns hand widths for different clock hands
 */
export const getHandWidths = () => ({
  second: 2,
  minute: 4,
  hour: 6,
});

/**
 * Calculates position for hour numbers on clock face
 */
export const getHourNumberPosition = (
  hour: number,
  center: number
): { x: number; y: number } => {
  const angle = ((hour === 12 ? 0 : hour) * 30 - 90) * (Math.PI / 180);
  const numberDistance = center * 0.75;
  const x = center + numberDistance * Math.cos(angle);
  const y = center + numberDistance * Math.sin(angle);
  
  return { x, y };
};
