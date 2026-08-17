import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";

const countries = [
  { code: "+52", flag: "🇲🇽", id: "MX", name: "México" },
  { code: "+1", flag: "🇺🇸", id: "US", name: "Estados Unidos" },
  { code: "+57", flag: "🇨🇴", id: "CO", name: "Colombia" },
  { code: "+34", flag: "🇪🇸", id: "ES", name: "España" },
  { code: "+54", flag: "🇦🇷", id: "AR", name: "Argentina" },
  { code: "+56", flag: "🇨🇱", id: "CL", name: "Chile" },
  { code: "+51", flag: "🇵🇪", id: "PE", name: "Perú" },
  { code: "+55", flag: "🇧🇷", id: "BR", name: "Brasil" },
  { code: "+1", flag: "🇨🇦", id: "CA", name: "Canadá" },
] as const;

type Country = typeof countries[number];
type Props = {
  countryCode: string;
  error?: string;
  onBlur?: () => void;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  phoneNumber: string;
};

export function PhoneNumberInput({ countryCode, error, onBlur, onCountryCodeChange, onPhoneNumberChange, phoneNumber }: Props) {
  const initialCountry = countries.find(country => country.code === countryCode) ?? countries[0];
  const [country, setCountry] = useState<Country>(initialCountry);
  const [focused, setFocused] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);

  function selectCountry(nextCountry: Country) {
    setCountry(nextCountry);
    onCountryCodeChange(nextCountry.code);
    setSelectorVisible(false);
  }

  function updatePhoneNumber(value: string) {
    const digits = [...value].filter(character => character >= "0" && character <= "9").join("").slice(0, 12);
    onPhoneNumberChange(digits);
  }

  return (
    <View style={styles.group}>
      <View style={[styles.control, focused && styles.focused, error && styles.errorBorder]}>
        <Pressable
          accessibilityHint="Abre la lista de países"
          accessibilityLabel={`Código de país, ${country.name} ${country.code}`}
          accessibilityRole="button"
          onPress={() => setSelectorVisible(true)}
          style={styles.countryButton}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={styles.code}>{country.code}</Text>
          <Ionicons color={colors.textMuted} name="chevron-down" size={16} />
        </Pressable>
        <View style={styles.divider} />
        <TextInput
          accessibilityLabel="Número de teléfono"
          keyboardType="phone-pad"
          maxLength={12}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          onChangeText={updatePhoneNumber}
          onFocus={() => setFocused(true)}
          placeholder="Número de teléfono"
          placeholderTextColor="#70786F"
          style={styles.input}
          textContentType="telephoneNumber"
          value={phoneNumber}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal animationType="fade" onRequestClose={() => setSelectorVisible(false)} transparent visible={selectorVisible}>
        <SafeAreaView style={styles.modalRoot}>
          <Pressable accessibilityLabel="Cerrar selector de país" onPress={() => setSelectorVisible(false)} style={StyleSheet.absoluteFill} />
          <View accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text accessibilityRole="header" style={styles.sheetTitle}>Selecciona tu país</Text>
              <Pressable accessibilityLabel="Cerrar" accessibilityRole="button" hitSlop={8} onPress={() => setSelectorVisible(false)}>
                <Ionicons color={colors.primary} name="close" size={26} />
              </Pressable>
            </View>
            <FlatList
              data={countries}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityLabel={`${item.name}, código ${item.code}`}
                  accessibilityRole="button"
                  onPress={() => selectCountry(item)}
                  style={({ pressed }) => [styles.countryRow, item.id === country.id && styles.selectedRow, pressed && styles.pressedRow]}
                >
                  <Text style={styles.rowFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>{item.code}</Text>
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  code: { color: colors.text, fontFamily: fonts.body, fontSize: 13 },
  control: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 11, borderWidth: 1, flexDirection: "row", minHeight: 43 },
  countryButton: { alignItems: "center", flexDirection: "row", gap: 4, minHeight: 43, paddingHorizontal: 10 },
  countryCode: { color: colors.primary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
  countryName: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14 },
  countryRow: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 52, paddingHorizontal: 16 },
  divider: { alignSelf: "stretch", backgroundColor: colors.border, width: StyleSheet.hairlineWidth },
  errorBorder: { borderColor: colors.error },
  errorText: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 5 },
  flag: { fontSize: 18 },
  focused: { borderColor: colors.primary, borderWidth: 2 },
  group: { marginBottom: 10 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14, minHeight: 43, paddingHorizontal: 12 },
  modalRoot: { alignItems: "center", backgroundColor: "rgba(24,37,28,0.35)", flex: 1, justifyContent: "center", padding: 24 },
  pressedRow: { opacity: 0.65 },
  rowFlag: { fontSize: 22, marginRight: 12 },
  selectedRow: { backgroundColor: "rgba(54,75,38,0.10)" },
  sheet: { backgroundColor: colors.background, borderRadius: 18, maxHeight: "72%", maxWidth: 480, overflow: "hidden", width: "100%" },
  sheetHeader: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", padding: 16 },
  sheetTitle: { color: colors.text, fontFamily: fonts.title, fontSize: 23 },
});
