import { Loading } from 'shared/loading';

const TWIST_PATTERN_ID = 'yarn-twist';

export function YarnLoading() {
  return (
    <Loading
      stroke={`url(#${TWIST_PATTERN_ID})`}
      defs={
        <pattern
          id={TWIST_PATTERN_ID}
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="4" height="4" fill="white" />
          <rect width="1.5" height="4" fill="hsl(214 40% 84%)" />
        </pattern>
      }
    />
  );
}
