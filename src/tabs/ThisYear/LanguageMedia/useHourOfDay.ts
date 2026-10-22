import { useEffect, useState } from 'react';

const readHourOfDay = () => {
  const now = Temporal.Now.plainTimeISO();
  return now.hour + now.minute / 60;
};

export function useHourOfDay() {
  const [hour, setHour] = useState(readHourOfDay);

  useEffect(() => {
    const timer = setInterval(() => setHour(readHourOfDay()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return hour;
}
