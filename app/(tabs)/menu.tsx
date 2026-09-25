import AnimatedTabScreen from "@/components/common/AnimatedTabScreen";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#1976E9";

type MenuItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: boolean;
  onPress?: () => void;
};

type MenuSectionProps = {
  title: string;
  items: MenuItem[];
  t: (key: string) => string;
  colors: any;
};

export default function MenuScreen() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const personalItems: MenuItem[] = [
    {
      key: "menu.items.attendance",
      icon: "calendar-outline",
    },
    {
      key: "menu.items.attendanceList",
      icon: "list-outline",
    },
    {
      key: "menu.items.leaveRequest",
      icon: "document-text-outline",
    },
    {
      key: "menu.items.myMeetingSchedule",
      icon: "calendar-number-outline",
    },
    {
      key: "menu.items.proposal",
      icon: "leaf-outline",
    },
    {
      key: "menu.items.initiative",
      icon: "bulb-outline",
    },
    {
      key: "menu.items.taskStatistics",
      icon: "checkbox-outline",
    },
    {
      key: "menu.items.businessReport",
      icon: "bar-chart-outline",
    },
    {
      key: "menu.items.monthlyDepartmentPlan",
      icon: "paper-plane-outline",
    },
    {
      key: "menu.items.teamPlan",
      icon: "people-circle-outline",
    },
    {
      key: "menu.items.weeklyKpiReport",
      icon: "analytics-outline",
    },
    {
      key: "menu.items.monthlyKpiReport",
      icon: "stats-chart-outline",
    },
    {
      key: "menu.items.myDutySchedule",
      icon: "id-card-outline",
    },
  ];

  const internalItems: MenuItem[] = [
    {
      key: "menu.items.meetingRoomBooking",
      icon: "calendar-clear-outline",
    },
    {
      key: "menu.items.rulesAndPenalties",
      icon: "warning-outline",
    },
    {
      key: "menu.items.internalNews",
      icon: "newspaper-outline",
      badge: true,
    },
    {
      key: "menu.items.warranty",
      icon: "shield-checkmark-outline",
    },
  ];

  const libraryItems: MenuItem[] = [
    {
      key: "menu.items.internalLibrary",
      icon: "library-outline",
    },
    {
      key: "menu.items.customerServiceProcess",
      icon: "documents-outline",
    },
  ];

  const lookupItems: MenuItem[] = [
    {
      key: "menu.items.officeHoroscope",
      icon: "moon-outline",
    },
    {
      key: "menu.items.lunarCalendar",
      icon: "calendar-outline",
    },
  ];

  return (
    <AnimatedTabScreen>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <MenuSection
            title={t("menu.sections.personal")}
            items={personalItems}
            t={t}
            colors={colors}
          />

          <MenuSection
            title={t("menu.sections.internal")}
            items={internalItems}
            t={t}
            colors={colors}
          />

          <MenuSection
            title={t("menu.sections.library")}
            items={libraryItems}
            t={t}
            colors={colors}
          />

          <MenuSection
            title={t("menu.sections.lookup")}
            items={lookupItems}
            t={t}
            colors={colors}
          />
        </ScrollView>
      </View>
    </AnimatedTabScreen>
  );
}

function MenuSection({ title, items, t, colors }: MenuSectionProps) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.menuCard,
          {
            backgroundColor: colors.surface,
          },
        ]}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <MenuRow
              key={item.key}
              icon={item.icon}
              label={t(item.key)}
              badge={item.badge}
              isLast={isLast}
              onPress={item.onPress}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  badge,
  isLast,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: boolean;
  isLast: boolean;
  onPress?: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity activeOpacity={0.65} onPress={onPress} style={styles.row}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={23} color={PRIMARY} />

        {badge && <View style={styles.notificationDot} />}
      </View>

      <View
        style={[
          styles.rowContent,
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.rowText,
            {
              color: colors.text,
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 28,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    marginBottom: 9,
    fontSize: 13,
    fontWeight: "700",
  },

  menuCard: {
    borderRadius: 11,
    overflow: "hidden",
    boxShadow: "rgba(99, 99, 99, 0.10) 0px 2px 7px 0px",
  },

  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "stretch",
  },

  iconWrapper: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 13,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D55",
  },

  rowContent: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
    paddingRight: 14,
  },

  rowText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },
});
