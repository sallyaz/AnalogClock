/**
 * AnalogClock - Custom analog clock component (no third-party clock libraries)
 * Displays hour, minute, and second hands with real-time updates.
 * Responsive and supports orientation changes via useWindowDimensions.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import {
  getTimeInTimezone,
  getHandRotations,
  calculateClockSize,
  getHandLengths,
  getHandWidths,
  getHourNumberPosition,
} from '../helpers/clockUtils';
import type { IAnalogClockProps } from '../types/IAnalogClockProps';
import type { IClockHandProps } from '../types/IClockHandProps';

const ClockHand = ({
  degree,
  length,
  width,
  center,
  handType,
}: IClockHandProps) => {
  const handWrapperStyle: ViewStyle[] = [
    styles.handWrapper,
    {
      left: center - width / 2,
      top: center - length,
      width,
      height: length * 2,
      transform: [{ rotate: `${degree}deg` }],
    },
  ];

  const handStyle = [
    handType === 'second' ? styles.handSecond : styles.hand,
    handType === 'hour' && styles.handHour,
    { width, height: length },
  ];

  return (
    <View style={handWrapperStyle}>
      <View style={handStyle} />
    </View>
  );
};

export const AnalogClock = ({ timezone }: IAnalogClockProps) => {
  const [time, setTime] = useState<Date>(() => getTimeInTimezone(timezone));
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    // Immediately update time when timezone changes
    setTime(getTimeInTimezone(timezone));

    const interval = setInterval(() => {
      const newTime = getTimeInTimezone(timezone);
      setTime(newTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const { hourDeg, minuteDeg, secondDeg } = getHandRotations(time);

  const size = calculateClockSize(width, height);
  const clockSize = size ;
  const center = clockSize / 2;

  const handLengths = getHandLengths(center);
  const handWidths = getHandWidths();

  return (
    <View style={[styles.container, { width: clockSize, height: clockSize }]}>
      {/* Outer glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: clockSize + 40,
            height: clockSize + 40,
            borderRadius: (clockSize + 35) / 2,
          },
        ]}
      />

      {/* Clock face circle with gradient effect */}
      <View
        style={[
          styles.face,
          {
            width: clockSize,
            height: clockSize,
            borderRadius: center,
          },
        ]}
      >
        {/* Hour numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(hour => {
          const { x, y } = getHourNumberPosition(hour, center);

          return (
            <Text
              key={hour}
              style={[
                styles.hourNumber,
                {
                  left: x - 20,
                  top: y - 20,
                },
              ]}
            >
              {hour}
            </Text>
          );
        })}
      </View>

      {/* Clock hands */}
      <ClockHand
        degree={hourDeg}
        length={handLengths.hour}
        width={handWidths.hour}
        center={center}
        handType="hour"
      />
      <ClockHand
        degree={minuteDeg}
        length={handLengths.minute}
        width={handWidths.minute}
        center={center}
        handType="minute"
      />
      <ClockHand
        degree={secondDeg}
        length={handLengths.second}
        width={handWidths.second}
        center={center}
        handType="second"
      />

      {/* Center cap with gradient */}
      <View
        style={[
          styles.centerCap,
          {
            left: center - 12,
            top: center - 12,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  face: {
    position: 'absolute',
    backgroundColor: '#1e293b',
    borderWidth: 5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  hourNumber: {
    position: 'absolute',
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
  },
  handWrapper: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  hand: {
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handHour: {
    backgroundColor: '#f1f5f9',
  },
  handSecond: {
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  centerCap: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    borderWidth: 4,
    borderColor: '#1e293b',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
