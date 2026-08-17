import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/config/onboarding-theme";
import type { ActivityDay } from "@/types/home";
import { createMonthGrid } from "@/utils/calendar";

const weekdays = [
  { key: "sunday", label: "D" },
  { key: "monday", label: "L" },
  { key: "tuesday", label: "M" },
  { key: "wednesday", label: "M" },
  { key: "thursday", label: "J" },
  { key: "friday", label: "V" },
  { key: "saturday", label: "S" },
];

interface ActivityCalendarProps {
  activityDays: ActivityDay[];
  month: number;
  year: number;
}

export function ActivityCalendar({
  activityDays,
  month,
  year,
}: ActivityCalendarProps) {
  const cells = createMonthGrid(year, month, activityDays);

  const monthName = new Intl.DateTimeFormat("es-MX", {
    month: "long",
  }).format(new Date(year, month, 1));

  return (
    <View style={styles.calendar}>
      <View style={styles.monthHeader}>
        <Text
          accessibilityRole="header"
          style={styles.month}
        >
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        {weekdays.map(weekday => (
          <View key={weekday.key} style={styles.cell}>
            <Text style={styles.weekday}>
              {weekday.label}
            </Text>
          </View>
        ))}

        {cells.map((cell, index) => {
          if (!cell) {
            return (
              <View
                key={`empty-${index}`}
                style={styles.cell}
              />
            );
          }

          const hasActivity = cell.activityLevel > 0;

          return (
            <View
              key={cell.date}
              style={styles.cell}
            >
              <View
                accessibilityLabel={
                  hasActivity
                    ? `${cell.date}, día con actividad`
                    : `${cell.date}, día sin actividad`
                }
                style={[
                  styles.day,
                  hasActivity && styles.activeDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    hasActivity && styles.activeDayText,
                  ]}
                >
                  {cell.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  cell: {
    alignItems: "center",
    justifyContent: "center",
    width: "14.2857%",
  },

  day: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    height: 30,
    justifyContent: "center",
    marginVertical: 3,
    width: 30,
  },

  activeDay: {
    backgroundColor: "#91a882cb",
  },

  dayText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
  },

  activeDayText: {
    color: colors.text,
    fontFamily: fonts.bodySemiBold,
  },

 monthHeader: {
  alignItems: "center",
  alignSelf: "center",
  backgroundColor: "#547207",
  height: 45,
  justifyContent: "center",
  marginBottom: 10,
  width: "80%",
},

month: {
  color: "#FFFFFF",
  fontFamily: fonts.title,
  fontSize: 26,
  lineHeight: 32,
  textAlign: "center",
},

divider: {
  alignSelf: "center",
  backgroundColor: "#B7B7B7",
  height: StyleSheet.hairlineWidth,
  marginBottom: 10,
  width: "100%",
},

  weekday: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginBottom: 5,
  },

});