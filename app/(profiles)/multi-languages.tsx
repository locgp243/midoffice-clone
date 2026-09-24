import SubHeader from "@/components/common/SubHeader";
import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Language, useLanguageStore } from "@/store/useLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Screenlanguage() {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const language = useLanguageStore((state) => state.language);
  const changeLanguage = useLanguageStore((state) => state.changeLanguage);

  const [showLanguages, setShowLanguages] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleChangeLanguage = async (value: Language) => {
    if (value === language) {
      setShowLanguages(false);
      return;
    }

    try {
      setIsChanging(true);
      await changeLanguage(value);
      setShowLanguages(false);
    } catch (error) {
    } finally {
      setIsChanging(false);
    }
  };

  const languageLabel =
    language === "vi" ? t("language.vietnamese") : t("language.english");

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SubHeader title={t("language.title")} />

      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t("language.generalSettings")}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setShowLanguages(true)}
            style={({ pressed }) => [
              styles.settingRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="language-outline"
                  size={21}
                  color={Colors.primary}
                />
              </View>

              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t("language.title")}
              </Text>
            </View>

            <View style={styles.settingRight}>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                {languageLabel}
              </Text>

              <Ionicons
                name="chevron-down-outline"
                size={18}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showLanguages}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguages(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLanguages(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {t("language.selectLanguage")}
                  </Text>

                  <Pressable onPress={() => setShowLanguages(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>

                <Pressable
                  disabled={isChanging}
                  onPress={() => handleChangeLanguage("vi")}
                  style={({ pressed }) => [
                    styles.languageRow,
                    { opacity: isChanging ? 0.5 : pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.flag}>🇻🇳</Text>

                    <View>
                      <Text
                        style={[styles.languageName, { color: colors.text }]}
                      >
                        {t("language.vietnamese")}
                      </Text>
                    </View>
                  </View>

                  {language === "vi" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>

                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />

                <Pressable
                  disabled={isChanging}
                  onPress={() => handleChangeLanguage("en")}
                  style={({ pressed }) => [
                    styles.languageRow,
                    { opacity: isChanging ? 0.5 : pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.languageInfo}>
                    <Text style={styles.flag}>🇬🇧</Text>

                    <View>
                      <Text
                        style={[styles.languageName, { color: colors.text }]}
                      >
                        {t("language.english")}
                      </Text>
                    </View>
                  </View>

                  {language === "en" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 14,
    overflow: "hidden",
  },
  settingRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 118, 233, 0.10)",
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  languageRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flag: {
    fontSize: 28,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
  },
  languageDescription: {
    marginTop: 3,
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
