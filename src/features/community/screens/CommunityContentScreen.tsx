import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { colors } from "@/config/onboarding-theme";
import { CommunityPostCard } from "@/features/community/components/CommunityPostCard";
import { ConsultationCard } from "@/features/community/components/ConsultationCard";
import { communityPostsMock, consultationInfoMock } from "@/mocks/community";

function CommunityContentScreen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cards}>{children}</View>
    </ScrollView>
  );
}

export function CommunityPostsScreen() {
  return (
    <CommunityContentScreen>
      {communityPostsMock.map(post => <CommunityPostCard key={post.id} post={post} />)}
    </CommunityContentScreen>
  );
}

export function CommunityConsultationsScreen() {
  return (
    <CommunityContentScreen>
      {consultationInfoMock.map(consultation => <ConsultationCard key={consultation.id} consultation={consultation} />)}
    </CommunityContentScreen>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 20 },
  content: {
    alignSelf: "center",
    maxWidth: 600,
    paddingBottom: 36,
    paddingHorizontal: 22,
    paddingTop: 24,
    width: "100%",
  },
  screen: { backgroundColor: colors.background, flex: 1 },
});
