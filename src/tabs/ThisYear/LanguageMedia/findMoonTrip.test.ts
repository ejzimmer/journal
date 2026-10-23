import SunCalc from 'suncalc';
import { findMoonTrip } from './findMoonTrip';

const sydney = { latitude: -33.87, longitude: 151.21 };

describe('findMoonTrip', () => {
  describe('in Sydney on 23 October 2026', () => {
    describe('while the moon is up', () => {
      const now = Date.parse('2026-10-23T10:00:00Z');

      it('finds the rise before now and the set after it', () => {
        const trip = findMoonTrip(now, sydney);

        expect(trip!.rise).toBeLessThan(now);
        expect(trip!.set).toBeGreaterThan(now);
        expect(
          SunCalc.getMoonPosition(new Date(trip!.rise), -33.87, 151.21)
            .altitude,
        ).toBeCloseTo(0, 1);
      });
    });

    describe('while the moon is down', () => {
      it('finds nothing', () => {
        expect(
          findMoonTrip(Date.parse('2026-10-23T01:00:00Z'), sydney),
        ).toBeUndefined();
      });
    });
  });
});
