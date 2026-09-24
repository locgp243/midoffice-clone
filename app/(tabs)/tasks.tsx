import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { router } from "expo-router";

import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TaskStatus =
  | "pending"
  | "processing"
  | "overdue"
  | "waitingApproval"
  | "completed";

type Task = {
  id: string;
  title: string;
  priority: number;
  creator: string;
  assignee: string;
  createdAt: string;
  deadline: string;
  completedAt?: string;
  type: string;
  status: TaskStatus;
  group: TopTab;
  remaining?: string;
};

type TopTab = "mine" | "created" | "customerRequest" | "staff";

type TaskFilter =
  | "all"
  | "pending"
  | "processing"
  | "overdue"
  | "waitingApproval"
  | "completed";

const PRIMARY = "#1976E9";
const STAR = "#FFC928";
const WARNING = "#F4A62A";
const WARNING_BACKGROUND = "#FFF6E8";
const APPROVAL = "#A96EF4";
const APPROVAL_BACKGROUND = "#F5EEFF";
const SUCCESS = "#4DBD65";
const SUCCESS_BACKGROUND = "#EAF8EC";
const PRIMARY_BACKGROUND = "#E8F2FF";

const tasks: Task[] = [
  {
    id: "1",
    title: "180 ngày tập trung",
    priority: 3,
    creator: "Phan Công Hậu",
    assignee: "Phan Công Hậu",
    createdAt: "23:19:06 09/09/2026",
    deadline: "17:00:00 09/03/2027",
    type: "internalRequest",
    status: "pending",
    group: "mine",
    remaining: "169d 06:46:04",
  },
  {
    id: "2",
    title: "Hoàn thành Ứng dụng MID Office",
    priority: 3,
    creator: "Sàn Ứng Mọi",
    assignee: "Phan Công Hậu",
    createdAt: "11:10:07 14/04/2026",
    deadline: "23:00:00 18/06/2026",
    completedAt: "11:34:45 18/06/2026",
    type: "internalRequest",
    status: "waitingApproval",
    group: "mine",
  },
  {
    id: "3",
    title: "Liên kết App Gps với App mPay",
    priority: 2,
    creator: "Trần Viễn Chinh",
    assignee: "Phan Công Hậu",
    createdAt: "22:05:19 06/03/2026",
    deadline: "21:04:00 07/03/2026",
    completedAt: "11:33:03 07/03/2026",
    type: "internalRequest",
    status: "completed",
    group: "mine",
  },
  {
    id: "4",
    title: "Kiểm tra báo cáo doanh thu tháng",
    priority: 2,
    creator: "Phan Công Hậu",
    assignee: "Nguyễn Văn An",
    createdAt: "08:30:00 20/09/2026",
    deadline: "17:00:00 25/09/2026",
    type: "internalRequest",
    status: "processing",
    group: "created",
    remaining: "3d 08:30:00",
  },
  {
    id: "5",
    title: "Cập nhật danh sách khách hàng",
    priority: 3,
    creator: "Phan Công Hậu",
    assignee: "Trần Minh Khoa",
    createdAt: "09:15:00 18/09/2026",
    deadline: "17:00:00 22/09/2026",
    type: "internalRequest",
    status: "overdue",
    group: "created",
  },
  {
    id: "6",
    title: "Hỗ trợ kiểm tra hệ thống khách hàng",
    priority: 3,
    creator: "Công ty ABC",
    assignee: "Phan Công Hậu",
    createdAt: "10:20:00 21/09/2026",
    deadline: "17:00:00 26/09/2026",
    type: "customerSupportRequest",
    status: "pending",
    group: "customerRequest",
    remaining: "4d 06:40:00",
  },
  {
    id: "7",
    title: "Kiểm tra kết nối camera khách hàng",
    priority: 2,
    creator: "Công ty XYZ",
    assignee: "Phan Công Hậu",
    createdAt: "13:40:00 20/09/2026",
    deadline: "17:00:00 24/09/2026",
    type: "customerSupportRequest",
    status: "processing",
    group: "customerRequest",
    remaining: "2d 03:20:00",
  },
  {
    id: "8",
    title: "Hoàn thành báo cáo công việc tuần",
    priority: 2,
    creator: "Nguyễn Văn An",
    assignee: "Nguyễn Văn An",
    createdAt: "08:00:00 21/09/2026",
    deadline: "17:00:00 23/09/2026",
    type: "internalRequest",
    status: "processing",
    group: "staff",
    remaining: "1d 09:00:00",
  },
  {
    id: "9",
    title: "Kiểm tra thiết bị tại văn phòng",
    priority: 3,
    creator: "Trần Minh Khoa",
    assignee: "Trần Minh Khoa",
    createdAt: "09:00:00 19/09/2026",
    deadline: "17:00:00 22/09/2026",
    type: "internalRequest",
    status: "completed",
    group: "staff",
  },
];

const topTabs: TopTab[] = ["mine", "created", "customerRequest", "staff"];

const filters: TaskFilter[] = [
  "all",
  "pending",
  "processing",
  "overdue",
  "waitingApproval",
  "completed",
];

const floatingActions = [
  {
    id: "office",
    label: "officeTask",
    icon: "create-outline" as const,
  },
  {
    id: "outside",
    label: "outsideTask",
    icon: "arrow-redo-circle-outline" as const,
  },
  {
    id: "department",
    label: "departmentRequest",
    icon: "chatbox-ellipses-outline" as const,
  },
  {
    id: "support",
    label: "customerSupportRequest",
    icon: "git-compare-outline" as const,
  },
];

export default function TasksScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TopTab>("mine");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    return tasks.filter((task) => {
      if (task.group !== activeTab) {
        return false;
      }

      const matchesSearch =
        !keyword ||
        task.title.toLocaleLowerCase().includes(keyword) ||
        task.creator.toLocaleLowerCase().includes(keyword) ||
        task.assignee.toLocaleLowerCase().includes(keyword);

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === "all") {
        return true;
      }

      return task.status === activeFilter;
    });
  }, [activeTab, activeFilter, search]);

  const getStatusStyle = useCallback((status: TaskStatus) => {
    switch (status) {
      case "pending":
        return {
          backgroundColor: WARNING_BACKGROUND,
          color: WARNING,
        };
      case "waitingApproval":
        return {
          backgroundColor: APPROVAL_BACKGROUND,
          color: APPROVAL,
        };
      case "completed":
        return {
          backgroundColor: SUCCESS_BACKGROUND,
          color: SUCCESS,
        };
    }
  }, []);

  const getStatusLabel = useCallback(
    (status: TaskStatus) => {
      switch (status) {
        case "pending":
          return t("tasks.pending");
        case "waitingApproval":
          return t("tasks.waitingApproval");
        case "completed":
          return t("tasks.completed");
      }
    },
    [t],
  );

  const getTabLabel = useCallback(
    (tab: TopTab) => {
      switch (tab) {
        case "mine":
          return t("tasks.mine");
        case "created":
          return t("tasks.created");
        case "customerRequest":
          return t("tasks.customerRequest");
        case "staff":
          return t("tasks.staff");
      }
    },
    [t],
  );

  const getFilterLabel = useCallback(
    (filter: TaskFilter) => {
      switch (filter) {
        case "all":
          return t("tasks.all");
        case "pending":
          return t("tasks.pending");
        case "processing":
          return t("tasks.processing");
        case "overdue":
          return t("tasks.overdue");
        case "waitingApproval":
          return t("tasks.waitingApproval");
        case "completed":
          return t("tasks.completed");
      }
    },
    [t],
  );

  const renderTask = useCallback(
    ({ item }: { item: Task }) => {
      const statusStyle = getStatusStyle(item.status);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(tasks)/task-detail")}
          style={[
            styles.taskCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.taskHeader}>
            <Text
              style={[styles.taskTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View
              style={[styles.statusBadge, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.statusText, { color: colors.text }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.stars}>
            {Array.from({ length: item.priority }).map((_, index) => (
              <Ionicons
                key={`${item.id}-star-${index}`}
                name="star-outline"
                size={23}
                color={STAR}
              />
            ))}
          </View>

          <View style={styles.peopleRow}>
            <Text
              style={[styles.peopleText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.creator}
            </Text>

            <Ionicons
              name="caret-forward"
              size={15}
              color={colors.textSecondary}
            />

            <Text
              style={[styles.peopleText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.assignee}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {item.createdAt}
              </Text>
            </View>

            <View style={styles.timeRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                {item.deadline}
              </Text>
            </View>

            {item.completedAt && (
              <View style={styles.timeRow}>
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.timeText, { color: colors.textSecondary }]}
                >
                  {item.completedAt}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.taskFooter}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(25,118,233,0.18)"
                    : PRIMARY_BACKGROUND,
                },
              ]}
            >
              <Text style={styles.typeText}>{t(`tasks.${item.type}`)}</Text>
            </View>

            {item.remaining && (
              <View
                style={[
                  styles.remainingBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(25,118,233,0.18)"
                      : PRIMARY_BACKGROUND,
                  },
                ]}
              >
                <Text style={styles.remainingText}>{item.remaining}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [
      colors.border,
      colors.surface,
      colors.text,
      colors.textSecondary,
      getStatusLabel,
      getStatusStyle,
      isDark,
      t,
    ],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.tabs,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {topTabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? PRIMARY : colors.textSecondary,
                  },
                ]}
              >
                {getTabLabel(tab)}
              </Text>

              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.8}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: isActive ? PRIMARY : colors.surface,
                    borderColor: isActive ? PRIMARY : colors.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {getFilterLabel(filter)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("tasks.searchPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
            />

            <Ionicons
              name="search-outline"
              size={25}
              color={colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.calendarButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="calendar-outline" size={27} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            filteredTasks.length === 0 && styles.emptyListContent,
          ]}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("tasks.empty")}
            </Text>
          }
        />
      </View>

      {menuOpen && (
        <Pressable
          style={[
            styles.menuOverlay,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.72)"
                : "rgba(255,255,255,0.82)",
            },
          ]}
          onPress={() => setMenuOpen(false)}
        />
      )}

      {menuOpen && (
        <View style={styles.floatingMenu}>
          {floatingActions.map((action) => (
            <View key={action.id} style={styles.actionRow}>
              <View style={styles.actionLabel}>
                <Text style={styles.actionLabelText}>
                  {t(`tasks.${action.label}`)}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name={action.icon} size={27} color={PRIMARY} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.mainFloatingButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setMenuOpen((value) => !value)}
      >
        <Ionicons
          name={menuOpen ? "remove" : "add"}
          size={36}
          color={menuOpen ? colors.text : PRIMARY}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    height: 58,
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: PRIMARY,
  },
  content: {
    flex: 1,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 68,
  },
  filterContent: {
    height: 68,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  filterButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "500",
  },
  searchRow: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    paddingVertical: 0,
  },
  calendarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
  },
  taskCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 26,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    marginBottom: 14,
    gap: 4,
  },
  peopleText: {
    flexShrink: 1,
    fontSize: 15,
  },
  timeContainer: {
    gap: 5,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  timeText: {
    flexShrink: 1,
    fontSize: 15,
  },
  taskFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 7,
  },
  typeBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 4,
  },
  typeText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  remainingBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 4,
  },
  remainingText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
  menuOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  floatingMenu: {
    position: "absolute",
    right: 18,
    bottom: 96,
    alignItems: "flex-end",
    gap: 12,
    zIndex: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionLabel: {
    maxWidth: 280,
    backgroundColor: PRIMARY,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionLabelText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 7,
  },
  mainFloatingButton: {
    position: "absolute",
    right: 18,
    bottom: 22,
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 30,
  },
});
