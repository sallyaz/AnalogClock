/**
 * Props interface for ClockHand component
 */

export interface IClockHandProps {
  degree: number;
  length: number;
  width: number;
  center: number;
  handType: 'hour' | 'minute' | 'second';
}
