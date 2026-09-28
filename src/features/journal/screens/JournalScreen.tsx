import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, FlatList, Keyboard, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { JournalEntryCard } from "@/features/journal/components/JournalEntryCard";
import { JournalFavoriteCard } from "@/features/journal/components/JournalFavoriteCard";
import { JournalCalendar } from "@/features/journal/components/JournalCalendar";
import { JournalDayDetails } from "@/features/journal/components/JournalDayDetails";
import { JournalFilters } from "@/features/journal/components/JournalFilters";
import { JournalState } from "@/features/journal/components/JournalState";
import { useJournal, useJournalMonth } from "@/features/journal/hooks/useJournal";
import type { JournalEntry, JournalFilter } from "@/features/journal/types";
import { filterFavoriteExercises, getJournalListState, normalizeJournalSearch } from "@/features/journal/utils/journal.utils";
import { getCurrentJournalMonth, groupJournalCalendarEntries } from "@/features/journal/utils/journal-calendar.utils";
import type { JourneyExerciseState } from "@/features/journey/domain/journey.types";
import { useJourney, useSetExerciseFavorite } from "@/features/journey/hooks/useJourney";

function JournalContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<JournalFilter>("all");
  const [search, setSearch] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(getCurrentJournalMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const journalQuery = useJournal(filter, search);
  const monthQuery = useJournalMonth(visibleMonth, search, filter === "calendar");
  // Favourites live in the Camino state (real or mock), not in the journal read model.
  const journey = useJourney();
  const favoriteMutation = useSetExerciseFavorite();
  const pendingFavorite = favoriteMutation.isPending ? favoriteMutation.variables : null;
  const favorites = useMemo(() => filterFavoriteExercises(journey.data?.exercises ?? [], search), [journey.data?.exercises, search]);
  const entries = useMemo(() => journalQuery.data?.pages.flatMap(page => page.entries) ?? [], [journalQuery.data]);
  const entriesByDay = useMemo(() => groupJournalCalendarEntries(monthQuery.data ?? [], visibleMonth), [monthQuery.data, visibleMonth]);
  const activityByDay = useMemo(() => new Map(Array.from(entriesByDay, ([day, records]) => [day, records.length])), [entriesByDay]);
  const selectedEntries = selectedDay ? entriesByDay.get(selectedDay) : undefined;
  const isMonthLoading = monthQuery.isPending || monthQuery.isSearchPending;
  const hasActiveCriteria = filter !== "all" || normalizeJournalSearch(search).length > 0;

  // Discard a selection when a refreshed month no longer contains its records.
  if (selectedDay && (monthQuery.isError || (monthQuery.isSuccess && !entriesByDay.has(selectedDay)))) {
    setSelectedDay(null);
  }

  useFocusEffect(useCallback(() => {
    if (!selectedDay) {
      return;
    }
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setSelectedDay(null);
      return true;
    });
    return () => subscription.remove();
  }, [selectedDay]));

  function changeFilter(value: JournalFilter) {
    setSelectedDay(null);
    setFilter(value);
  }

  function changeSearch(value: string) {
    setSelectedDay(null);
    setSearch(value);
  }

  function changeMonth(value: string) {
    setSelectedDay(null);
    setVisibleMonth(value);
  }

  function openExercise(exerciseId: string) {
    setSelectedDay(null);
    router.push({ pathname: "/exercise/[exerciseId]", params: { exerciseId } } as Href);
  }

  function loadMore() {
    if (journalQuery.hasNextPage && !journalQuery.isFetchingNextPage) {
      void journalQuery.fetchNextPage();
    }
  }

  function renderEmptyState() {
    const listState = getJournalListState({
      entryCount: entries.length,
      hasCriteria: hasActiveCriteria,
      isError: journalQuery.isError,
      isPending: journalQuery.isPending,
    });

    if (listState === "loading") {
      return <JournalState loading message="Estamos recuperando tu historial." title="Cargando Bitácora" />;
    }

    if (listState === "error") {
      return <JournalState actionLabel="Reintentar" message="Revisa tu conexión e inténtalo nuevamente." onAction={() => void journalQuery.refetch()} title="No pudimos cargar tu historial" />;
    }

    if (listState === "no_results") {
      return <JournalState message="Prueba otra búsqueda o cambia el periodo seleccionado." title="No hay resultados" />;
    }

    return <JournalState message="Cuando avances o completes un ejercicio, aparecerá aquí." title="Tu Bitácora está vacía" />;
  }

  function renderHeader() {
    return (
      <View>
        <View style={styles.titleRow}>
          <Ionicons color={colors.primary} name="list" size={22} />
          <Text style={styles.title}>Bitácora</Text>
        </View>
        <View style={styles.titleLine} />
        <Text style={styles.subtitle}>Historial de tu camino</Text>

        <View style={styles.searchBox}>
          <Ionicons color={colors.textMuted} name="search-outline" size={20} />
          <TextInput
            accessibilityLabel="Buscar por ejercicio o nivel"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={changeSearch}
            placeholder="Buscar ejercicio o nivel"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search.length > 0 ? (
            <Pressable accessibilityLabel="Limpiar búsqueda" accessibilityRole="button" hitSlop={10} onPress={() => changeSearch("")}>
              <Ionicons color={colors.textMuted} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>
        <JournalFilters onChange={changeFilter} value={filter} />
      </View>
    );
  }

  function renderFavoritesEmptyState() {
    if (journey.isPending) {
      return <JournalState loading message="Estamos recuperando tus favoritos." title="Cargando favoritos" />;
    }

    if (journey.isError) {
      return <JournalState actionLabel="Reintentar" message="Revisa tu conexión e inténtalo nuevamente." onAction={() => void journey.refetch()} title="No pudimos cargar tus favoritos" />;
    }

    if (normalizeJournalSearch(search)) {
      return <JournalState message="Prueba otra búsqueda." title="No hay favoritos que coincidan" />;
    }

    return <JournalState message="Toca la estrella de una cueva en tu Camino para guardarla aquí." title="Aún no tienes favoritos" />;
  }

  function toggleFavorite(exercise: JourneyExerciseState, isFavorite: boolean) {
    if (!isFavorite) {
      favoriteMutation.mutate({ exerciseId: exercise.id, isFavorite: true });
      return;
    }

    // Removing hides the card from this list, so it asks first.
    Alert.alert(
      "Quitar de favoritos",
      `¿Quieres quitar "${exercise.title}" de tus favoritos?`,
      [
        { style: "cancel", text: "Cancelar" },
        { onPress: () => favoriteMutation.mutate({ exerciseId: exercise.id, isFavorite: false }), style: "destructive", text: "Quitar" },
      ],
      { cancelable: true },
    );
  }

  function renderFavorite(exercise: JourneyExerciseState) {
    const isPending = pendingFavorite?.exerciseId === exercise.id;
    const isFavorite = isPending ? pendingFavorite.isFavorite : exercise.isFavorite;
    return (
      <JournalFavoriteCard
        exercise={exercise}
        isFavorite={isFavorite}
        onOpenExercise={openExercise}
        onToggleFavorite={() => toggleFavorite(exercise, isFavorite)}
        toggleDisabled={pendingFavorite !== null}
      />
    );
  }

  function renderFooter() {
    if (journalQuery.isFetchingNextPage) {
      return <ActivityIndicator color={colors.primary} style={styles.footerLoader} />;
    }

    if (journalQuery.isFetchNextPageError) {
      return (
        <Pressable accessibilityRole="button" onPress={loadMore} style={styles.moreError}>
          <Text style={styles.moreErrorText}>No pudimos cargar más. Toca para reintentar.</Text>
        </Pressable>
      );
    }

    return null;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        {filter === "calendar" ? (
          <>
            <ScrollView
              contentContainerStyle={styles.calendarContent}
              keyboardShouldPersistTaps="handled"
              refreshControl={<RefreshControl onRefresh={() => void monthQuery.refetch()} refreshing={monthQuery.isRefetching} tintColor={colors.primary} />}
            >
              <View style={styles.calendarHeader}>{renderHeader()}</View>
              <JournalCalendar
                activityByDay={monthQuery.isError ? new Map() : activityByDay}
                activityMarker={<Image accessible={false} contentFit="contain" source={require("../../../../assets/logo-calendar.png")} style={styles.activityMarker} />}
                isLoading={isMonthLoading}
                onDayPress={day => {
                  if (!isMonthLoading && entriesByDay.has(day)) {
                    Keyboard.dismiss();
                    setSelectedDay(day);
                  }
                }}
                onMonthChange={changeMonth}
                selectedDay={selectedDay}
                visibleMonth={visibleMonth}
              />
              {monthQuery.isError ? <JournalState actionLabel="Reintentar" message="Revisa tu conexión e inténtalo nuevamente." onAction={() => void monthQuery.refetch()} title="No pudimos cargar el mes" /> : null}
              {!isMonthLoading && !monthQuery.isError && activityByDay.size === 0 ? (
                <Text accessibilityLiveRegion="polite" style={styles.monthEmpty}>{normalizeJournalSearch(search) ? "No hay ejercicios completados que coincidan con tu búsqueda este mes." : "Este mes aún no tiene ejercicios completados."}</Text>
              ) : null}
            </ScrollView>
            <Modal animationType="fade" onRequestClose={() => setSelectedDay(null)} transparent visible={Boolean(selectedDay && selectedEntries?.length && !isMonthLoading && !monthQuery.isError)}>
              <View style={styles.modalOverlay}>
                <Pressable accessibilityLabel="Cerrar detalle del día" accessibilityRole="button" onPress={() => setSelectedDay(null)} style={StyleSheet.absoluteFill} />
                {selectedDay && selectedEntries?.length ? <JournalDayDetails day={selectedDay} entries={selectedEntries} onClose={() => setSelectedDay(null)} onOpenExercise={openExercise} /> : null}
              </View>
            </Modal>
          </>
        ) : filter === "favorites" ? (
          <FlatList<JourneyExerciseState>
            contentContainerStyle={[styles.content, favorites.length === 0 && styles.emptyContent]}
            data={favorites}
            extraData={pendingFavorite}
            keyExtractor={exercise => exercise.id}
            ListEmptyComponent={renderFavoritesEmptyState}
            ListHeaderComponent={renderHeader()}
            onRefresh={() => void journey.refetch()}
            refreshing={journey.isRefetching}
            renderItem={({ item }) => renderFavorite(item)}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList<JournalEntry>
            contentContainerStyle={[styles.content, entries.length === 0 && styles.emptyContent]}
            data={entries}
            keyExtractor={entry => entry.id}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={renderFooter}
            // An element, not a function: a new function identity each render remounts the
            // header and its TextInput, dropping focus and the keyboard on every keystroke.
            ListHeaderComponent={renderHeader()}
            onEndReached={loadMore}
            onEndReachedThreshold={0.35}
            onRefresh={() => void journalQuery.refetch()}
            refreshing={journalQuery.isRefetching && !journalQuery.isFetchingNextPage}
            renderItem={({ item }) => <JournalEntryCard entry={item} onOpenExercise={openExercise} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

export function JournalScreen() {
  const { status, user } = useAuth();
  if (status === "loading" || !user || (status !== "anonymous" && status !== "permanent")) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <JournalState loading={status === "loading"} message={status === "loading" ? "Preparando tu historial." : "Vuelve a entrar para consultar tu Bitácora."} title={status === "loading" ? "Cargando Bitácora" : "Sesión no disponible"} />
        </SafeAreaView>
      </View>
    );
  }
  return <JournalContent key={user.id} />;
}

const styles = StyleSheet.create({
  activityMarker: { height: 36, width: 44 },
  calendarContent: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 30, paddingHorizontal: 6, width: "100%" },
  calendarHeader: { paddingHorizontal: 16 },
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 30, paddingHorizontal: 22, width: "100%" },
  emptyContent: { flexGrow: 1 },
  footerLoader: { marginVertical: 18 },
  moreError: { alignItems: "center", minHeight: 48, paddingVertical: 14 },
  moreErrorText: { color: colors.error, fontFamily: fonts.body, fontSize: 12, textAlign: "center" },
  monthEmpty: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, paddingHorizontal: 24, paddingVertical: 18, textAlign: "center" },
  modalOverlay: { alignItems: "center", backgroundColor: "rgba(8, 20, 13, 0.64)", flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 36 },
  safeArea: { flex: 1 },
  screen: { backgroundColor: colors.background, flex: 1 },
  searchBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: colors.border, borderRadius: 23, borderWidth: 1, flexDirection: "row", marginBottom: 14, minHeight: 48, paddingHorizontal: 15 },
  searchInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14, marginLeft: 9, paddingVertical: 10 },
  subtitle: { color: colors.text, fontFamily: fonts.body, fontSize: 16, marginBottom: 18, marginTop: 13 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 34 },
  titleLine: { backgroundColor: colors.primary, borderRadius: 2, height: 4, marginTop: 10, width: "100%" },
  titleRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center", paddingTop: 14 },
});
