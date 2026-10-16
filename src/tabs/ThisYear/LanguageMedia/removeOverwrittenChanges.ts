export const removeOverwrittenChanges = (
  changes: Record<string, unknown>,
  overwritingPaths: string[],
) =>
  Object.fromEntries(
    Object.entries(changes).filter(
      ([path]) =>
        !overwritingPaths.some((overwritingPath) =>
          path.startsWith(`${overwritingPath}/`),
        ),
    ),
  );
