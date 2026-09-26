import AnimatedTabScreen from "@/components/common/AnimatedTabScreen";
import Skeleton from "@/components/common/Skeleton";
import { Colors } from "@/constants/Colors";
import {
  filters,
  floatingActions,
  STATUS_MAP,
  TaskFilter,
  TopTab,
  topTabs,
} from "@/constants/Tasks";
import { useAppTheme } from "@/hooks/useAppTheme";
import { taskServices } from "@/services/taskServices";
import { useAuthStore } from "@/store/useAuthStore";
import { TaskApiItem } from "@/types/Task";
import { formatDateTime } from "@/utils/formatDateTime";
import { normalizeText } from "@/utils/normalizeText";
import { getTaskStatusLabel, isTaskOverdue } from "@/utils/taskCommon";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

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
  const [filterLoading, setFilterLoading] = useState(false);
  const [animatingTab, setAnimatingTab] = useState(false);

  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  const actionAnimations = useRef(
    floatingActions.map(() => new Animated.Value(0)),
  ).current;

  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = useAuthStore((state) => state.userId);

  const userDetail = useAuthStore((state) => state.userDetail);

  const userName = userDetail?.name;

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await taskServices.getTasks({
        web: "yes",
        offset: 0,
        limit: 20,
        creator: userId,
      });

      setTasks(response.data ?? []);
    } catch (error) {
      console.log("GET TASKS ERROR:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    return () => {
      if (filterTimerRef.current) {
        clearTimeout(filterTimerRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!userId) return;

    try {
      setRefreshing(true);

      const response = await taskServices.getTasks({
        web: "yes",
        offset: 0,
        limit: 20,
        creator: userId,
      });

      setTasks(response.data ?? []);
    } catch (error) {
      console.log("REFRESH TASKS ERROR:", error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const handleChangeFilter = (filter: TaskFilter) => {
    if (filter === activeFilter) return;

    if (filterTimerRef.current) {
      clearTimeout(filterTimerRef.current);
    }

    setActiveFilter(filter);
    setFilterLoading(true);

    filterTimerRef.current = setTimeout(() => {
      setFilterLoading(false);
    }, 1000);
  };

  const handleChangeTab = (tab: TopTab) => {
    if (tab === activeTab || animatingTab) return;

    const currentIndex = topTabs.indexOf(activeTab);
    const nextIndex = topTabs.indexOf(tab);
    const direction = nextIndex > currentIndex ? -1 : 1;

    if (filterTimerRef.current) {
      clearTimeout(filterTimerRef.current);
    }

    setFilterLoading(false);
    setAnimatingTab(true);

    Animated.timing(contentTranslateX, {
      toValue: direction * SCREEN_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setActiveFilter("all");
      setSearch("");

      contentTranslateX.setValue(direction * -SCREEN_WIDTH);

      Animated.timing(contentTranslateX, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => {
        setAnimatingTab(false);
      });
    });
  };

  const openActionMenu = () => {
    actionAnimations.forEach((animation) => {
      animation.setValue(0);
    });

    setMenuOpen(true);

    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.stagger(
        70,
        [...actionAnimations].reverse().map((animation) =>
          Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 90,
            friction: 9,
          }),
        ),
      ),
    ]).start();
  };

  const closeActionMenu = () => {
    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.stagger(
        40,
        actionAnimations.map((animation) =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start(() => {
      setMenuOpen(false);
    });
  };

  const toggleActionMenu = () => {
    if (menuOpen) {
      closeActionMenu();
    } else {
      openActionMenu();
    }
  };

  const rotateFab = fabRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const filteredTasks = useMemo(() => {
    const keyword = normalizeText(search);
    const currentUserName = normalizeText(userName);

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
        matchesStatus = isTaskOverdue(task);
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
  }, [tasks, activeTab, activeFilter, search, userName]);

  useEffect(() => {
    console.log("FILTERED TASKS:", filteredTasks);

    const invalidTasks = filteredTasks.filter(
      (task) => task?.task_id == null || task?.creator == null,
    );

    console.log("INVALID TASKS:", invalidTasks);
  }, [filteredTasks]);

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
      if (isTaskOverdue(task)) {
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
          textColor: Colors.primary,
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
        backgroundColor: isDark
          ? "rgba(25,118,233,0.18)"
          : Colors.light.background,
        textColor: Colors.primary,
        label: getTaskStatusLabel(task.status),
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
          onPress={() => {
            if (item.task_id == null) return;

            router.push({
              pathname: "/(tasks)/[id]",
              params: {
                id: String(item.task_id),
                ...(item.creator != null
                  ? { creator: String(item.creator) }
                  : {}),
              },
            });
          }}
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
                color={Colors.warning}
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
                color={isTaskOverdue(item) ? "#DC3545" : colors.textSecondary}
              />

              <Text
                style={[
                  styles.timeText,
                  {
                    color: isTaskOverdue(item)
                      ? "#DC3545"
                      : colors.textSecondary,
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
                    : Colors.light.background,
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

  return (
    <AnimatedTabScreen>
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
                disabled={animatingTab}
                onPress={() => handleChangeTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: isActive ? Colors.primary : colors.textSecondary,
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

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX: contentTranslateX }],
            },
          ]}
        >
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
                      backgroundColor: isActive
                        ? Colors.primary
                        : colors.surface,
                      borderColor: isActive ? Colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleChangeFilter(filter)}
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
              <Ionicons
                name="calendar-outline"
                size={27}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filterLoading ? (
            <Skeleton />
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={(item, index) =>
                `${item.task_id}-${item.task_receiver_id ?? index}`
              }
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
        </Animated.View>

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
            onPress={closeActionMenu}
          />
        )}

        {menuOpen && (
          <View style={styles.floatingMenu} pointerEvents="box-none">
            {floatingActions.map((action, index) => {
              const animation = actionAnimations[index];

              const translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [35, 0],
              });

              const scale = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              });

              return (
                <Animated.View
                  key={action.id}
                  style={[
                    styles.actionRow,
                    {
                      opacity: animation,
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
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
                    <Ionicons
                      name={action.icon}
                      size={27}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
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
          onPress={toggleActionMenu}
        >
          <Animated.View
            style={{
              transform: [{ rotate: rotateFab }],
            }}
          >
            <Ionicons name="add" size={36} color={Colors.primary} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  tabs: {
    height: 48,
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "space-around",
  },

  tab: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    width: "100%",
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
    fontSize: 12,
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
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    paddingVertical: 0,
  },
  calendarButton: {
    width: 48,
    height: 48,
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
    fontSize: 12,
  },
  taskCard: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.12)",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 26,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
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
    fontSize: 12,
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
    fontSize: 12,
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
    color: Colors.primary,
    fontSize: 12,
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
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  actionButton: {
    width: 48,
    height: 48,
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
    width: 48,
    height: 48,
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
