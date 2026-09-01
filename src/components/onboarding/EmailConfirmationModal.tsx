import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";

type EmailConfirmationModalProps = {
  email: string | null;
  feedback?: string | null;
  isResending?: boolean;
  onChangeEmail: () => void;
  onClose: () => void;
  onResend: () => void;
};

export function EmailConfirmationModal({ email, feedback, isResending = false, onChangeEmail, onClose, onResend }: EmailConfirmationModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={email !== null}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <Pressable accessibilityLabel="Cerrar confirmación" accessibilityRole="button" hitSlop={10} onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
            <Ionicons color={colors.textMuted} name="close" size={24} />
          </Pressable>

          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.illustration}>
            <Ionicons color="#C5A76B" name="sparkles" size={18} style={styles.sparkleLeft} />
            <View style={styles.envelope}>
              <Ionicons color="#C8B98E" name="mail-outline" size={64} />
              <View style={styles.checkBadge}>
                <Ionicons color="#FFFFFF" name="checkmark" size={24} />
              </View>
            </View>
            <Ionicons color="#C5A76B" name="sparkles" size={18} style={styles.sparkleRight} />
          </View>

          <Text accessibilityRole="header" style={styles.title}>Confirma tu correo</Text>
          <Text style={styles.description}>
            Te enviamos un enlace a{"\n"}<Text style={styles.email}>{email}</Text>{"\n"}para confirmar tu cuenta.
          </Text>
          <Text style={styles.hint}>Revisa también spam o correo no deseado.</Text>

          <View style={styles.divider} />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isResending, disabled: isResending }}
            disabled={isResending}
            onPress={onResend}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            {isResending ? <ActivityIndicator color={colors.primary} size="small" /> : <Text style={styles.actionText}>Reenviar correo</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" disabled={isResending} onPress={onChangeEmail} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <Text style={styles.actionText}>Cambiar correo</Text>
          </Pressable>

          {feedback ? <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 38 },
  actionText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  backdrop: { alignItems: "center", backgroundColor: "rgba(13, 20, 16, 0.72)", flex: 1, justifyContent: "center", padding: 20 },
  card: { alignItems: "center", backgroundColor: colors.background, borderColor: "rgba(181, 138, 67, 0.2)", borderRadius: 20, borderWidth: 1, maxWidth: 380, paddingBottom: 24, paddingHorizontal: 24, paddingTop: 28, shadowColor: "#000000", shadowOffset: { height: 8, width: 0 }, shadowOpacity: 0.24, shadowRadius: 18, width: "100%" },
  checkBadge: { alignItems: "center", backgroundColor: colors.primary, borderColor: colors.background, borderRadius: 19, borderWidth: 3, bottom: -4, height: 38, justifyContent: "center", position: "absolute", right: 4, width: 38 },
  close: { alignItems: "center", height: 40, justifyContent: "center", position: "absolute", right: 10, top: 8, width: 40 },
  description: { color: colors.text, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: "center" },
  divider: { backgroundColor: "rgba(181, 138, 67, 0.2)", height: 1, marginBottom: 8, marginTop: 24, width: "100%" },
  email: { fontFamily: fonts.bodySemiBold },
  envelope: { alignItems: "center", justifyContent: "center", position: "relative" },
  feedback: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: "center" },
  hint: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 12, textAlign: "center" },
  illustration: { alignItems: "center", flexDirection: "row", height: 82, justifyContent: "center", width: 180 },
  pressed: { opacity: 0.62 },
  sparkleLeft: { marginRight: 20, marginTop: -20 },
  sparkleRight: { marginLeft: 20, marginTop: -20 },
  title: { color: colors.primary, fontFamily: fonts.title, fontSize: 29, lineHeight: 36, marginBottom: 10, marginTop: 4, textAlign: "center" },
});
