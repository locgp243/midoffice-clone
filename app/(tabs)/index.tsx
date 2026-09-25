import AnimatedTabScreen from "@/components/common/AnimatedTabScreen";
import { useAppTheme } from "@/hooks/useAppTheme";
import { reportServices } from "@/services/reportServices";
import { useAuthStore } from "@/store/useAuthStore";
import { ReportData } from "@/types/Reports";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY = "#1976E9";
const GREEN = "#34C759";
const RED = "#FF3B30";
const BLUE = "#2196F3";
const ORANGE = "#FF9500";
const CYAN = "#43BCCD";

export default function HomeScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const userId = useAuthStore((state) => state.userId);
  const userDetail = useAuthStore((state) => state.userDetail);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const fetchReport = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const data = await reportServices.getStatistic(userId);

      console.log("REPORT HOME:", data);

      setReport(data);
    } catch (error: any) {
      console.log("GET REPORT ERROR:", error?.response?.data ?? error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchReport();
    } finally {
      setRefreshing(false);
    }
  };

  const total = report?.total ?? 0;
  const completed = report?.completed ?? 0;
  const lateCompleted = report?.late_completed ?? 0;
  const delayed = report?.delayed ?? 0;

  const doing = Math.max(total - completed - lateCompleted - delayed, 0);

  const completedPercent =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
        >
          <View style={styles.monthRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.monthButton,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>

            <View
              style={[
                styles.monthCenter,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={19}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.monthText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t("home.month", {
                  month: currentMonth,
                  year: currentYear,
                })}
              </Text>

              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>{t("home.current")}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.monthButton,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeSection}>
            <Text
              style={[
                styles.helloText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {t("home.greeting")},
            </Text>

            <Text
              style={[
                styles.userName,
                {
                  color: colors.text,
                },
              ]}
            >
              {userDetail?.name || t("profile.defaultUser")}
            </Text>

            <TouchableOpacity activeOpacity={0.8} style={styles.checkInButton}>
              <Ionicons name="finger-print-outline" size={17} color="#FFFFFF" />

              <Text style={styles.checkInText}>{t("home.checkIn")}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.summaryRow}>
              <SummaryCard
                title={t("home.summary.kpi")}
                value="0/100"
                colors={colors}
              />

              <SummaryCard
                title={t("home.summary.tasks")}
                value={`${completed}/${total}`}
                colors={colors}
              />

              <SummaryCard
                title={t("home.summary.attendance")}
                value="0/26"
                colors={colors}
              />
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t("home.kpi.title")}
                </Text>

                <View
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(52,199,89,0.16)"
                        : "#E7F7EC",
                    },
                  ]}
                >
                  <Text style={styles.scoreText}>
                    {t("home.kpi.point", {
                      value: 0,
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.kpiContent}>
                <View style={styles.kpiCircle}>
                  <Text style={styles.kpiNumber}>0</Text>
                </View>

                <View style={styles.kpiInfo}>
                  <Text style={styles.improveText}>
                    {t("home.kpi.needImprovement")}
                  </Text>

                  <Text
                    style={[
                      styles.kpiDescription,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {t("home.kpi.description")}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t("home.tasks.title")}
                </Text>

                <Text style={styles.percentText}>{completedPercent}%</Text>
              </View>

              <View style={styles.taskGrid}>
                <TaskStatistic
                  value={total}
                  label={t("home.tasks.total")}
                  valueColor={colors.text}
                  textColor={colors.textSecondary}
                />

                <TaskStatistic
                  value={completed}
                  label={t("home.tasks.completed")}
                  valueColor={GREEN}
                  textColor={colors.textSecondary}
                />

                <TaskStatistic
                  value={doing}
                  label={t("home.tasks.doing")}
                  valueColor={BLUE}
                  textColor={colors.textSecondary}
                />

                <TaskStatistic
                  value={delayed}
                  label={t("home.tasks.overdue")}
                  valueColor={RED}
                  textColor={colors.textSecondary}
                />
              </View>

              <View
                style={[
                  styles.lateCompleted,
                  {
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.lateCompletedLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t("home.tasks.lateCompleted")}
                </Text>

                <Text style={styles.lateCompletedValue}>{lateCompleted}</Text>
              </View>
            </View>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t("home.attendance.title")}
                </Text>

                <View style={styles.attendancePercent}>
                  <Text style={styles.percentText}>0.0%</Text>

                  <Text
                    style={[
                      styles.attendancePercentLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {t("home.attendance.presentPercent")}
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceTop}>
                <AttendanceNumber
                  value="26"
                  label={t("home.attendance.workingDays")}
                  color={colors.text}
                  textColor={colors.textSecondary}
                />

                <AttendanceNumber
                  value="0"
                  label={t("home.attendance.present")}
                  color={GREEN}
                  textColor={colors.textSecondary}
                />

                <AttendanceNumber
                  value="0"
                  label={t("home.attendance.absent")}
                  color={RED}
                  textColor={colors.textSecondary}
                />
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.attendanceStatusRow}
              >
                <AttendanceStatus
                  icon="checkmark-circle"
                  value="0"
                  label={t("home.attendance.status.onTime")}
                  iconColor="#34C759"
                  backgroundColor={isDark ? "rgba(52,199,89,0.16)" : "#E7F7EC"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="time"
                  value="0"
                  label={t("home.attendance.status.late")}
                  iconColor="#FF9500"
                  backgroundColor={isDark ? "rgba(255,149,0,0.16)" : "#FFF3E0"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="home"
                  value="0"
                  label={t("home.attendance.status.earlyLeave")}
                  iconColor="#FF9F0A"
                  backgroundColor={isDark ? "rgba(255,159,10,0.16)" : "#FFF4E3"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="alert-circle"
                  value="0"
                  label={t("home.attendance.status.lateAndEarly")}
                  iconColor="#FF3B30"
                  backgroundColor={isDark ? "rgba(255,59,48,0.16)" : "#FDE9E7"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="log-out-outline"
                  value="0"
                  label={t("home.attendance.status.missingCheckout")}
                  iconColor="#FF6B35"
                  backgroundColor={isDark ? "rgba(255,107,53,0.16)" : "#FFF0E9"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="calendar-outline"
                  value="0"
                  label={t("home.attendance.status.leaveWithPermission")}
                  iconColor="#5856D6"
                  backgroundColor={isDark ? "rgba(88,86,214,0.16)" : "#EEEDFC"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="close-circle"
                  value="0"
                  label={t("home.attendance.status.leaveWithoutPermission")}
                  iconColor="#FF3B30"
                  backgroundColor={isDark ? "rgba(255,59,48,0.16)" : "#FDE9E7"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="help-circle"
                  value="0"
                  label={t("home.attendance.status.unknown")}
                  iconColor="#8E8E93"
                  backgroundColor={
                    isDark ? "rgba(142,142,147,0.16)" : "#F0F0F2"
                  }
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="briefcase"
                  value="0"
                  label={t("home.attendance.status.sale")}
                  iconColor="#007AFF"
                  backgroundColor={isDark ? "rgba(0,122,255,0.16)" : "#E5F1FF"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />

                <AttendanceStatus
                  icon="sunny"
                  value="0"
                  label={t("home.attendance.status.holiday")}
                  iconColor="#AF52DE"
                  backgroundColor={isDark ? "rgba(175,82,222,0.16)" : "#F5EAFB"}
                  textColor={colors.text}
                  secondaryColor={colors.textSecondary}
                />
              </ScrollView>

              <View style={styles.attendanceDetail}>
                <AttendanceDetailRow
                  label={t("home.attendance.detail.onTimeRate")}
                  value="0%"
                  valueColor={colors.text}
                  textColor={colors.textSecondary}
                />

                <AttendanceDetailRow
                  label={t("home.attendance.detail.late")}
                  value={t("home.attendance.detail.days", {
                    value: 0,
                  })}
                  valueColor={ORANGE}
                  textColor={colors.textSecondary}
                />

                <AttendanceDetailRow
                  label={t("home.attendance.detail.earlyLeave")}
                  value={t("home.attendance.detail.days", {
                    value: 0,
                  })}
                  valueColor={ORANGE}
                  textColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AnimatedTabScreen>
  );
}

function SummaryCard({
  title,
  value,
  colors,
}: {
  title: string;
  value: string;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.summaryTitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function TaskStatistic({
  value,
  label,
  valueColor,
  textColor,
}: {
  value: number;
  label: string;
  valueColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.taskStatistic}>
      <Text
        style={[
          styles.taskStatisticValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.taskStatisticLabel,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function AttendanceNumber({
  value,
  label,
  color,
  textColor,
}: {
  value: string;
  label: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.attendanceNumber}>
      <Text
        style={[
          styles.attendanceNumberValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.attendanceNumberLabel,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function AttendanceStatus({
  icon,
  value,
  label,
  iconColor,
  backgroundColor,
  textColor,
  secondaryColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  iconColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryColor: string;
}) {
  return (
    <View style={styles.attendanceStatus}>
      <View
        style={[
          styles.attendanceIcon,
          {
            backgroundColor,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <Text
        style={[
          styles.attendanceStatusValue,
          {
            color: textColor,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.attendanceStatusLabel,
          {
            color: secondaryColor,
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function AttendanceDetailRow({
  label,
  value,
  valueColor,
  textColor,
}: {
  label: string;
  value: string;
  valueColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.attendanceDetailRow}>
      <Text
        style={[
          styles.attendanceDetailLabel,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.attendanceDetailValue,
          {
            color: valueColor,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 10,
  },

  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "rgba(99,99,99,0.12) 0px 2px 8px 0px",
  },

  monthCenter: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    boxShadow: "rgba(99,99,99,0.12) 0px 2px 8px 0px",
  },

  monthText: {
    fontSize: 14,
    fontWeight: "700",
  },

  currentBadge: {
    backgroundColor: GREEN,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },

  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },

  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  helloText: {
    fontSize: 14,
  },

  userName: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: "700",
  },

  checkInButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 7,
    backgroundColor: "#18A83E",
  },

  checkInText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  contentSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },

  summaryCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "rgba(99,99,99,0.15) 0px 2px 8px 0px",
  },

  summaryTitle: {
    fontSize: 12,
  },

  summaryValue: {
    marginTop: 4,
    color: CYAN,
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    borderRadius: 14,
    padding: 18,
    boxShadow: "rgba(99,99,99,0.16) 0px 2px 8px 0px",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },

  scoreText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "700",
  },

  kpiContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  kpiCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiNumber: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },

  kpiInfo: {
    flex: 1,
    marginLeft: 18,
  },

  improveText: {
    color: RED,
    fontSize: 16,
    fontWeight: "700",
  },

  kpiDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  percentText: {
    color: GREEN,
    fontSize: 22,
    fontWeight: "700",
  },

  taskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 24,
  },

  taskStatistic: {
    width: "50%",
    alignItems: "center",
    marginBottom: 26,
  },

  taskStatisticValue: {
    fontSize: 27,
    fontWeight: "700",
  },

  taskStatisticLabel: {
    marginTop: 5,
    fontSize: 12,
  },

  lateCompleted: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lateCompletedLabel: {
    fontSize: 12,
  },

  lateCompletedValue: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: "700",
  },

  attendancePercent: {
    alignItems: "flex-end",
  },

  attendancePercentLabel: {
    marginTop: -2,
    fontSize: 11,
  },

  attendanceTop: {
    flexDirection: "row",
    marginTop: 22,
  },

  attendanceNumber: {
    flex: 1,
    alignItems: "center",
  },

  attendanceNumberValue: {
    fontSize: 27,
    fontWeight: "700",
  },

  attendanceNumberLabel: {
    marginTop: 4,
    fontSize: 11,
    textAlign: "center",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },

  attendanceStatusRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  attendanceStatus: {
    width: 78,
    alignItems: "center",
  },

  attendanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  attendanceStatusValue: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: "700",
  },

  attendanceStatusLabel: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    minHeight: 28,
  },

  attendanceDetail: {
    marginTop: 22,
    gap: 10,
  },

  attendanceDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  attendanceDetailLabel: {
    fontSize: 12,
  },

  attendanceDetailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});
