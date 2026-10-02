import { fetchUserLevel } from './api';
import { fetchCachedCollection } from './collectionCache';
import { Assignment, Subject, SubjectType, WaniKaniData } from './types';

type RawSubject = { level: number; hidden_at: string | null };

type RawAssignment = {
  subject_id: number;
  srs_stage: number;
  passed_at: string | null;
  hidden: boolean;
};

const SUBJECT_TYPES_BY_OBJECT: Record<string, SubjectType> = {
  radical: 'radical',
  kanji: 'kanji',
  vocabulary: 'vocabulary',
  kana_vocabulary: 'vocabulary',
};

export async function fetchWaniKaniData(apiKey: string): Promise<WaniKaniData> {
  const [level, subjects, assignments] = await Promise.all([
    fetchUserLevel(apiKey),
    fetchCachedCollection<RawSubject, Subject>(
      'subjects',
      apiKey,
      (resource) => {
        const type = SUBJECT_TYPES_BY_OBJECT[resource.object];
        return type && !resource.data.hidden_at
          ? { id: resource.id, type, level: resource.data.level }
          : undefined;
      },
    ),
    fetchCachedCollection<RawAssignment, Assignment>(
      'assignments',
      apiKey,
      ({ data }) =>
        data.hidden
          ? undefined
          : {
              subjectId: data.subject_id,
              srsStage: data.srs_stage,
              passedAt: data.passed_at,
            },
    ),
  ]);

  return { level, subjects, assignments };
}
