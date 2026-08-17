import type { Ref } from "react";
import type { TextInput as TextInputType, TextInputProps } from "react-native";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { colors, fonts } from "@/config/onboarding-theme";

type AppInputProps = TextInputProps & {
  compact?: boolean;
  error?: string;
  inputRef?: Ref<TextInputType>;
  label: string;
  password?: boolean;
  showLabel?: boolean;
};

export function AppInput({ compact = false, error, inputRef, label, onBlur, onFocus, password = false, showLabel = true, ...props }: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const errorId = `${props.nativeID ?? label}-error`;

  return (
    <View style={[styles.group, compact && styles.compactGroup]}>
      {showLabel ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, compact && styles.compactShell, focused && styles.focused, error && styles.errorBorder]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityState={{ disabled: props.editable === false }}
          aria-describedby={error ? errorId : undefined}
          onBlur={event => { setFocused(false); onBlur?.(event); }}
          onFocus={event => { setFocused(true); onFocus?.(event); }}
          placeholderTextColor="#70786F"
          ref={inputRef}
          secureTextEntry={password && !visible}
          style={[styles.input, compact && styles.compactInput]}
          {...props}
        />
        {password ? (
          <Pressable
            accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setVisible(value => !value)}
            style={styles.eye}
          >
            <Ionicons color={colors.text} name={visible ? "eye-off-outline" : "eye-outline"} size={22} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text nativeID={errorId} style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  compactGroup: { marginBottom: 10 },
  compactInput: { fontSize: 14, minHeight: 43, paddingHorizontal: 13 },
  compactShell: { borderRadius: 11 },
  errorBorder: { borderColor: colors.error },
  errorText: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: 5 },
  eye: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  focused: { borderColor: colors.primary, borderWidth: 2 },
  group: { marginBottom: 16 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 16, minHeight: 50, paddingHorizontal: 15 },
  inputShell: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: "row" },
  label: { color: colors.text, fontFamily: fonts.body, fontSize: 14, marginBottom: 7 },
});
