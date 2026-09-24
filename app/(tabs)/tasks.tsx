import { useAppTheme } from "@/hooks/useAppTheme";
import { taskServices } from "@/services/taskServices";
import { TaskApiItem } from "@/types/Task";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
const PRIMARY_BACKGROUND = "#E8F2FF";

const USER_ID = 100000202;
const USER_NAME = "Phạm Gia Lộc";

const STATUS_MAP: Record<Exclude<TaskFilter, "all" | "overdue">, number[]> = {
  pending: [2],
  processing: [],
  waitingApproval: [],
  completed: [3],
};

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

const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return "--";

  return new Date(timestamp).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const normalizeText = (value?: string | null) => {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
};

const isOverdue = (task: TaskApiItem) => {
  if (!task.expired_on) return false;
  return task.expired_on < Date.now();
};

const getStatusLabel = (status: number) => {
  if (STATUS_MAP.pending.includes(status)) return "Đang chờ";
  if (STATUS_MAP.processing.includes(status)) return "Đang xử lý";
  if (STATUS_MAP.waitingApproval.includes(status)) return "Chờ duyệt";
  if (STATUS_MAP.completed.includes(status)) return "Hoàn thành";
  return `Status ${status}`;
};

export default function TasksScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TopTab>("mine");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await taskServices.getRows({
        web: "yes",
        offset: 0,
        limit: 20,
        creator: USER_ID,
      });

      setTasks(response.data ?? []);
    } catch (error) {
      console.log("GET TASKS ERROR:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await taskServices.getRows({
        web: "yes",
        offset: 0,
        limit: 20,
        creator: USER_ID,
      });

      setTasks(response.data ?? []);
    } catch (error) {
      console.log("REFRESH TASKS ERROR:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredTasks = useMemo(() => {
    const keyword = normalizeText(search);
    const currentUserName = normalizeText(USER_NAME);

    return tasks.filter((task) => {
      let matchesTab = false;

      if (activeTab === "mine") {
        matchesTab = task.type_task_id === 1;
      }

      if (activeTab === "created") {
        matchesTab = normalizeText(task.creator_name) === currentUserName;
      }

      if (activeTab === "customerRequest") {
        matchesTab = task.type_task_id === 2;
      }

      if (activeTab === "staff") {
        matchesTab = task.type_task_id !== 1 && task.type_task_id !== 2;
      }

      if (!matchesTab) return false;

      let matchesStatus = true;

      if (activeFilter === "pending") {
        matchesStatus = STATUS_MAP.pending.includes(task.status);
      }

      if (activeFilter === "processing") {
        matchesStatus = STATUS_MAP.processing.includes(task.status);
      }

      if (activeFilter === "waitingApproval") {
        matchesStatus = STATUS_MAP.waitingApproval.includes(task.status);
      }

      if (activeFilter === "completed") {
        matchesStatus = STATUS_MAP.completed.includes(task.status);
      }

      if (activeFilter === "overdue") {
        matchesStatus = isOverdue(task);
      }

      if (!matchesStatus) return false;

      if (!keyword) return true;

      return (
        normalizeText(task.name).includes(keyword) ||
        normalizeText(task.creator_name).includes(keyword) ||
        normalizeText(task.username).includes(keyword) ||
        normalizeText(task.type_task_name).includes(keyword)
      );
    });
  }, [tasks, activeTab, activeFilter, search]);

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

  const getStatusStyle = useCallback(
    (task: TaskApiItem) => {
      if (isOverdue(task)) {
        return {
          backgroundColor: isDark ? "rgba(220,53,69,0.18)" : "#FDEBEC",
          textColor: "#DC3545",
          label: t("tasks.overdue"),
        };
      }

      if (STATUS_MAP.completed.includes(task.status)) {
        return {
          backgroundColor: isDark ? "rgba(40,167,69,0.18)" : "#EAF7ED",
          textColor: "#28A745",
          label: t("tasks.completed"),
        };
      }

      if (STATUS_MAP.processing.includes(task.status)) {
        return {
          backgroundColor: isDark ? "rgba(25,118,233,0.18)" : "#E8F2FF",
          textColor: PRIMARY,
          label: t("tasks.processing"),
        };
      }

      if (STATUS_MAP.waitingApproval.includes(task.status)) {
        return {
          backgroundColor: isDark ? "rgba(255,193,7,0.18)" : "#FFF7DB",
          textColor: "#D99A00",
          label: t("tasks.waitingApproval"),
        };
      }

      if (STATUS_MAP.pending.includes(task.status)) {
        return {
          backgroundColor: isDark ? "rgba(244,166,42,0.18)" : "#FFF6E8",
          textColor: "#F4A62A",
          label: t("tasks.pending"),
        };
      }

      return {
        backgroundColor: isDark ? "rgba(25,118,233,0.18)" : PRIMARY_BACKGROUND,
        textColor: PRIMARY,
        label: getStatusLabel(task.status),
      };
    },
    [isDark, t],
  );

  const renderTask = useCallback(
    ({ item }: { item: TaskApiItem }) => {
      const statusStyle = getStatusStyle(item);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/(tasks)/[id]",
              params: {
                id: item.task_id.toString(),
                creator: item.creator.toString(),
              },
            })
          }
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
              {item.name}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusStyle.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: statusStyle.textColor,
                  },
                ]}
              >
                {statusStyle.label}
              </Text>
            </View>
          </View>

          <View style={styles.stars}>
            {Array.from({
              length: Math.max(0, item.priority ?? 0),
            }).map((_, index) => (
              <Ionicons
                key={`${item.task_id}-star-${index}`}
                name="star-outline"
                size={23}
                color={STAR}
              />
            ))}
          </View>

          <View style={styles.peopleRow}>
            <Text
              style={[
                styles.peopleText,
                {
                  color: colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {item.creator_name || "--"}
            </Text>

            <Ionicons
              name="caret-forward"
              size={15}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.peopleText,
                {
                  color: colors.textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {item.username || "--"}
            </Text>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.timeText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {formatDateTime(item.created_at)}
              </Text>
            </View>

            <View style={styles.timeRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={isOverdue(item) ? "#DC3545" : colors.textSecondary}
              />

              <Text
                style={[
                  styles.timeText,
                  {
                    color: isOverdue(item) ? "#DC3545" : colors.textSecondary,
                  },
                ]}
              >
                {formatDateTime(item.expired_on)}
              </Text>
            </View>

            {item.updated_at && (
              <View style={styles.timeRow}>
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <Text
                  style={[
                    styles.timeText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {formatDateTime(item.updated_at)}
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
              <Text style={styles.typeText}>{item.type_task_name || "--"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      colors.border,
      colors.surface,
      colors.text,
      colors.textSecondary,
      getStatusStyle,
      isDark,
    ],
  );

  const handleChangeTab = (tab: TopTab) => {
    setActiveTab(tab);
    setActiveFilter("all");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
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
              onPress={() => handleChangeTab(tab)}
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
              style={[
                styles.searchInput,
                {
                  color: colors.text,
                },
              ]}
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.task_id.toString()}
            renderItem={renderTask}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              filteredTasks.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="briefcase-outline"
                  size={42}
                  color={colors.textSecondary}
                />

                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t("tasks.empty")}
                </Text>
              </View>
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 100,
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
