import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventListener } from "expo";
import type { VideoPlayer } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { createVideoControlActions, getVideoControlState, getVideoDuration } from "@/components/video/video-controls";
import { colors, fonts } from "@/config/onboarding-theme";

export function useVideoControls(player: VideoPlayer, onEnded?: () => void) {
  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player.playing });
  const { status } = useEvent(player, "statusChange", { status: player.status });
  const [duration, setDuration] = useState(player.duration);
  const [currentTime, setCurrentTime] = useState(player.currentTime);
  const [hasEnded, setHasEnded] = useState(false);
  const hasEndedRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  const [actionFailed, setActionFailed] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actions = useMemo(() => createVideoControlActions(player), [player]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEventListener(player, "sourceLoad", event => setDuration(previous => getVideoDuration(event.duration, previous)));
  useEventListener(player, "statusChange", () => {
    setDuration(previous => getVideoDuration(player.duration, previous));
  });
  useEventListener(player, "timeUpdate", event => {
    setDuration(previous => getVideoDuration(player.duration, previous));
    if (!hasEndedRef.current) {
      setCurrentTime(event.currentTime);
    }
  });
  useEventListener(player, "sourceChange", () => {
    hasEndedRef.current = false;
    setHasEnded(false);
    setDuration(0);
    setCurrentTime(0);
    setActionFailed(false);
  });
  useEventListener(player, "playToEnd", () => {
    hasEndedRef.current = true;
    setHasEnded(true);
    setCurrentTime(0);
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current);
    }
    setIsActing(false);
    onEndedRef.current?.();
    try {
      actions.resetAfterEnd();
    } catch {
      setActionFailed(true);
    }
  });

  useEffect(() => {
    return () => {
      if (actionTimerRef.current) {
        clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  const playbackState = getVideoControlState(status, hasEnded, isPlaying);
  const disabled = playbackState.disabled || isActing;
  const availableDuration = getVideoDuration(player.duration, duration);
  const canSeek = availableDuration > 0;

  function runAction(action: () => boolean) {
    if (disabled) {
      return;
    }
    setActionFailed(false);
    try {
      if (action()) {
        setIsActing(true);
        actionTimerRef.current = setTimeout(() => setIsActing(false), 300);
      }
    } catch {
      setActionFailed(true);
    }
  }

  function seek(offset: -10 | 10) {
    runAction(() => {
      const target = actions.seek(offset, availableDuration);
      if (target === null) {
        return false;
      }
      setCurrentTime(target);
      hasEndedRef.current = false;
      setHasEnded(false);
      return true;
    });
  }

  const rewindDisabled = disabled || !canSeek || currentTime <= 0;
  const forwardDisabled = disabled || !canSeek || currentTime >= availableDuration;

  function toggle() {
    runAction(() => {
      const accepted = actions.toggle(hasEndedRef.current);
      if (accepted) {
        hasEndedRef.current = false;
        setHasEnded(false);
      }
      return accepted;
    });
  }

  return { actionFailed, disabled, forwardDisabled, isActing, isLoading: playbackState.isLoading, rewindDisabled, seek, showPause: playbackState.showPause, status, toggle };
}

const ICON_SIZE = 24;

type Props = {
  controls: ReturnType<typeof useVideoControls>;
  isFullscreen?: boolean;
  mediaLabel?: "audio" | "video";
  onToggleFullscreen?: () => void;
  title?: string;
};

export function CustomVideoControls({
  controls,
  isFullscreen = false,
  mediaLabel = "video",
  onToggleFullscreen,
  title = "Título del video",
}: Props) {
  const { actionFailed, disabled, forwardDisabled, isActing, isLoading, rewindDisabled, seek, showPause, status, toggle } = controls;

  return (
    <View style={styles.container}>
      {title ? <Text numberOfLines={1} style={styles.title}>{title}</Text> : null}
      <View style={styles.controlsRow}>
        <View style={styles.centerGroup}>
          <Pressable
            accessibilityLabel="Retroceder 10 segundos"
            accessibilityRole="button"
            accessibilityState={{ disabled: rewindDisabled }}
            disabled={rewindDisabled}
            onPress={() => seek(-10)}
            style={({ pressed }) => [styles.skip, rewindDisabled && styles.disabled, pressed && styles.pressed]}
          >
            <Ionicons color="#000000" name="play-back" size={ICON_SIZE} />
            <Text style={styles.seconds}>10</Text>
          </Pressable>

          <Pressable
            accessibilityLabel={showPause ? `Pausar ${mediaLabel}` : `Reproducir ${mediaLabel}`}
            accessibilityRole="button"
            accessibilityState={{ busy: isLoading || isActing, disabled }}
            disabled={disabled}
            onPress={toggle}
            style={({ pressed }) => [styles.play, disabled && styles.disabled, pressed && styles.pressed]}
          >
            <Ionicons
              color="#FFFFFF"
              name={showPause ? "pause" : "play"}
              size={ICON_SIZE}
              style={!showPause ? styles.playIconOffset : undefined}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Adelantar 10 segundos"
            accessibilityRole="button"
            accessibilityState={{ disabled: forwardDisabled }}
            disabled={forwardDisabled}
            onPress={() => seek(10)}
            style={({ pressed }) => [styles.skip, forwardDisabled && styles.disabled, pressed && styles.pressed]}
          >
            <Ionicons color="#000000" name="play-forward" size={ICON_SIZE} />
            <Text style={styles.seconds}>10</Text>
          </Pressable>
        </View>

        {onToggleFullscreen ? (
          <Pressable
            accessibilityLabel={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
            accessibilityRole="button"
            onPress={onToggleFullscreen}
            style={({ pressed }) => [styles.fullscreen, pressed && styles.pressed]}
          >
            <Ionicons
              color="#000000"
              name={isFullscreen ? "contract-outline" : "expand-outline"}
              size={ICON_SIZE}
            />
          </Pressable>
        ) : null}
      </View>
      {status === "error" || actionFailed ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {status === "error" ? `No pudimos cargar el ${mediaLabel}.` : "No se pudo realizar la acción. Inténtalo de nuevo."}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
    width: "100%",
  },
  disabled: { opacity: 0.45 },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 12, marginTop: 6, textAlign: "center" },
  fullscreen: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 48,
  },
  play: {
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  playIconOffset: { marginLeft: 2 },
  pressed: { opacity: 0.7 },
  seconds: {
    color: "#000000",
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    lineHeight: 13,
    marginTop: 1,
    textAlign: "center",
  },
  skip: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
    paddingHorizontal: 4,
    textAlign: "left",
  },
});
