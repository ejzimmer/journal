const FEATURE_GATE_DESCRIPTION =
  /^\s*((?=[a-z0-9_-]*[-_])[a-z0-9_-]+)\s*(\[\d{4}\])?\s*$/;

export function getFeatureGateName(description: string): string | undefined {
  return FEATURE_GATE_DESCRIPTION.exec(description)?.[1];
}
