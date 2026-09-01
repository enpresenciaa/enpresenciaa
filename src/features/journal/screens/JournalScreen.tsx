import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "@/config/onboarding-theme";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { JournalEntryCard } from "@/features/journal/components/JournalEntryCard";
import { JournalFilters } from "@/features/journal/components/JournalFilters";
import { JournalState } from "@/features/journal/components/JournalState";
import { useJournal } from "@/features/journal/hooks/useJournal";
import type { JournalEntry, JournalFilter } from "@/features/journal/types";
import { getJournalListState, normalizeJournalSearch } from "@/features/journal/utils/journal.utils";

export function JournalScreen() {
  const { status } = useAuth();
  const [filter, setFilter] = useState<JournalFilter>("all");
  const [search, setSearch] = useState("");
  const journalQuery = useJournal(filter, search);
  const entries = useMemo(() => journalQuery.data?.pages.flatMap(page => page.entries) ?? [], [journalQuery.data]);
  const hasActiveCriteria = filter !== "all" || normalizeJournalSearch(search).length > 0;

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
      isPending: status === "loading" || journalQuery.isPending,
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
          <Ionicons color={colors.primary} name="journal-outline" size={31} />
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
            onChangeText={setSearch}
            placeholder="Buscar ejercicio o nivel"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search.length > 0 ? (
            <Pressable accessibilityLabel="Limpiar búsqueda" accessibilityRole="button" hitSlop={10} onPress={() => setSearch("")}>
              <Ionicons color={colors.textMuted} name="close-circle" size={20} />
            </Pressable>
          ) : null}
        </View>
        <JournalFilters onChange={setFilter} value={filter} />
      </View>
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
        <FlatList<JournalEntry>
          contentContainerStyle={[styles.content, entries.length === 0 && styles.emptyContent]}
          data={entries}
          keyExtractor={entry => entry.id}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={renderHeader}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          onRefresh={() => void journalQuery.refetch()}
          refreshing={journalQuery.isRefetching && !journalQuery.isFetchingNextPage}
          renderItem={({ item }) => <JournalEntryCard entry={item} />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", flexGrow: 1, maxWidth: 620, paddingBottom: 30, paddingHorizontal: 22, width: "100%" },
  emptyContent: { flexGrow: 1 },
  footerLoader: { marginVertical: 18 },
  moreError: { alignItems: "center", minHeight: 48, paddingVertical: 14 },
  moreErrorText: { color: colors.error, fontFamily: fonts.body, fontSize: 12, textAlign: "center" },
  safeArea: { flex: 1 },
  screen: { backgroundColor: colors.background, flex: 1 },
  searchBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: colors.border, borderRadius: 23, borderWidth: 1, flexDirection: "row", marginBottom: 14, minHeight: 48, paddingHorizontal: 15 },
  searchInput: { color: colors.text, flex: 1, fontFamily: fonts.body, fontSize: 14, marginLeft: 9, paddingVertical: 10 },
  subtitle: { color: colors.text, fontFamily: fonts.body, fontSize: 16, marginBottom: 18, marginTop: 13 },
  title: { color: colors.text, fontFamily: fonts.title, fontSize: 34 },
  titleLine: { backgroundColor: colors.primary, height: 2, marginTop: 10, width: "100%" },
  titleRow: { alignItems: "center", flexDirection: "row", gap: 11, paddingTop: 14 },
});
