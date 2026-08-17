import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";

type Props = { error?: string; onBlur?: () => void; onChange: (value: string) => void; value: string };

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function parseDate(value: string, fallback: Date): Date {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) {
    return fallback;
  }
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function getDateLimits() {
  const today = new Date();
  const maximumDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  const minimumDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate() + 1);
  return { maximumDate, minimumDate };
}

export function DateOfBirthPicker({ error, onBlur, onChange, value }: Props) {
  const { maximumDate, minimumDate } = getDateLimits();
  const [visible, setVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(() => parseDate(value, maximumDate));

  function openPicker() {
    setDraftDate(parseDate(value, maximumDate));
    setVisible(true);
  }

  function closePicker() {
    setVisible(false);
    onBlur?.();
  }

  function handleAndroidChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setVisible(false);
    if (event.type === "set" && selectedDate) {
      onChange(formatDate(selectedDate));
    }
    onBlur?.();
  }

  function confirmIOSDate() {
    onChange(formatDate(draftDate));
    closePicker();
  }

  return (
    <View style={styles.group}>
      <Pressable
        accessibilityHint="Abre el calendario"
        accessibilityLabel="Fecha de nacimiento"
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.control, error && styles.errorBorder, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value || "Fecha de nacimiento"}</Text>
        <Ionicons color={colors.primary} name="calendar-outline" size={21} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {Platform.OS === "android" && visible ? (
        <DateTimePicker
          display="calendar"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode="date"
          onChange={handleAndroidChange}
          value={draftDate}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal animationType="fade" onRequestClose={closePicker} transparent visible={visible}>
          <SafeAreaView style={styles.modalRoot}>
            <Pressable accessibilityLabel="Cerrar calendario" onPress={closePicker} style={StyleSheet.absoluteFill} />
            <View accessibilityViewIsModal style={styles.sheet}>
              <Text accessibilityRole="header" style={styles.title}>Fecha de nacimiento</Text>
              <DateTimePicker
                accentColor={colors.primary}
                display="inline"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                mode="date"
                onChange={(_, selectedDate) => { if (selectedDate) { setDraftDate(selectedDate); } }}
                value={draftDate}
              />
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" onPress={closePicker} style={styles.actionButton}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
                <Pressable accessibilityRole="button" onPress={confirmIOSDate} style={[styles.actionButton, styles.confirmButton]}><Text style={styles.confirmText}>Seleccionar</Text></Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: { alignItems: "center", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelText: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  confirmButton: { backgroundColor: colors.primary },
  confirmText: { color: colors.buttonText, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  control: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 11, borderWidth: 1, flexDirection: "row", minHeight: 43, paddingHorizontal: 13 },
  errorBorder: { borderColor: colors.error },
  errorText: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 5 },
  group: { marginBottom: 10 },
  modalRoot: { alignItems: "center", backgroundColor: "rgba(24,37,28,0.35)", flex: 1, justifyContent: "center", padding: 20 },
  placeholder: { color: "#70786F" },
  pressed: { opacity: 0.7 },
  sheet: { backgroundColor: colors.background, borderRadius: 18, maxWidth: 480, padding: 18, width: "100%" },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 24, marginBottom: 8, textAlign: "center" },
  value: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14 },
});
