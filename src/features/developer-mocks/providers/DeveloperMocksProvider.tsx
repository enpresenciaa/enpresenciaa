import { useQueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { useCallback, useMemo, useState } from "react";
import { Image } from "react-native";

import type { DeveloperDataSource } from "@/features/developer-mocks/context/DeveloperMocksContext";
import { DeveloperMocksContext } from "@/features/developer-mocks/context/DeveloperMocksContext";
import { mockJourneyRepository, setMockJourneyMediaSources } from "@/features/journey/services/mock-journey.repository";

setMockJourneyMediaSources({
  audio: Image.resolveAssetSource(require("../../../../assets/audios/audiomockejercicio.mp3")).uri,
  video: Image.resolveAssetSource(require("../../../../assets/videos/videomockejercicio.mp4")).uri,
});

export function DeveloperMocksProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [activeDataSource, setActiveDataSource] = useState<DeveloperDataSource>("real");

  const setDataSource = useCallback((source: DeveloperDataSource) => {
    if (source === "journey-demo") {
      mockJourneyRepository.reset();
    }
    setActiveDataSource(source);
    void queryClient.invalidateQueries({ queryKey: ["journey"] });
    void queryClient.invalidateQueries({ queryKey: ["exercise-detail"] });
  }, [queryClient]);

  const value = useMemo(() => ({ dataSource: activeDataSource, setDataSource }), [activeDataSource, setDataSource]);

  return <DeveloperMocksContext value={value}>{children}</DeveloperMocksContext>;
}
