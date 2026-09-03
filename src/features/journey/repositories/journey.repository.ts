import type { JourneySnapshot } from "@/features/journey/domain/journey.types";

export interface JourneyRepository {
  getSnapshot: () => Promise<JourneySnapshot>;
}
