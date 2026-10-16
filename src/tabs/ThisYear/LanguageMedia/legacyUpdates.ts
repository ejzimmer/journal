export type FieldChange = { from?: unknown; to?: unknown };

export type LegacyUpdate = {
  at: string;
  changes: Record<string, FieldChange>;
};

export type LegacyUpdates = { updates?: Record<string, object> };

export const isLegacyUpdate = (update: object): update is LegacyUpdate =>
  'changes' in update;

export const getLegacyUpdates = ({ updates }: LegacyUpdates) =>
  Object.values(updates ?? {}).filter(isLegacyUpdate);
