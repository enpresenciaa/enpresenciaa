import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { CommunityPost } from "@/features/community/types";

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <View style={styles.avatar}><Ionicons color={colors.primary} name="leaf-outline" size={24} /></View>
        <View style={styles.authorCopy}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.caption}>Publicación de muestra</Text>
        </View>
        <Ionicons accessible={false} color={colors.textMuted} name="logo-instagram" size={23} />
      </View>
      {post.image ? (
        <Image accessibilityLabel={post.imageDescription} contentFit="cover" contentPosition="top center" source={post.image} style={styles.image} />
      ) : (
        <View style={styles.quote}><Text style={styles.quoteText}>{post.quote ?? post.title}</Text></View>
      )}
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  author: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  authorCopy: { flex: 1, minWidth: 0 },
  authorRow: { alignItems: "center", flexDirection: "row", gap: 12, padding: 16 },
  avatar: { alignItems: "center", backgroundColor: "#F1E8D4", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  body: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 23, marginTop: 8 },
  caption: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E6E8E3", borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  copy: { padding: 20 },
  image: { aspectRatio: 1.2, backgroundColor: colors.primary, width: "100%" },
  quote: { backgroundColor: "#E9EBDD", justifyContent: "center", minHeight: 180, padding: 28 },
  quoteText: { color: colors.primary, fontFamily: fonts.title, fontSize: 34 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 25 },
});
