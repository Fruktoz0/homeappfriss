import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  TouchableOpacity,
  View
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import {
  Button,
  Card,
  FAB,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";
import Carousel from "react-native-reanimated-carousel";
import ExpenseList from "../../components/ExpenseList";
import { useBudget } from "../../contexts/BudgetContext";
import { getToken } from "../../services/authService";
import { deleteExpense, getBudgetMonths, updateBudgetMonth } from "../../services/budgetService";
import { exportExpensesToExcel } from "../../services/exportService";
import type { BudgetMonth } from "../../types/budget";

const { width } = Dimensions.get("window");
const months = [
  "Január","Február","Március","Április","Május","Június",
  "Július","Augusztus","Szeptember","Október","November","December"
];

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { setBudgetMonthId } = useBudget();
  const [modalVisible, setModalVisible] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  const currentMonthIndex = new Date().getMonth(); // 0–11
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

  const fetchBudgetData = useCallback(async (monthIndex: number) => {
    try {
      setIsLoading(true);
      const t = await getToken();
      if (!t) return;
      setToken(t);

      const budgetData = await getBudgetMonths(t, monthIndex);
      const selected = budgetData.currentMonth;
      if (selected) {
        setBudgetMonth(selected);
        setBudgetMonthId(selected.id);
      } else setBudgetMonth(null);
    } catch (err) {
      console.error("Failed to fetch budget months:", err);
    } finally {
      setIsLoading(false);
    }
  }, [setBudgetMonthId]);

  useEffect(() => {
    fetchBudgetData(selectedMonth);
  }, [selectedMonth]);

  // 🔁 új költség után frissítjük a listát
  useFocusEffect(
    useCallback(() => {
      fetchBudgetData(selectedMonth);
    }, [selectedMonth])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData(selectedMonth);
    setRefreshing(false);
  };

  const handleUpdateBudget = async () => {
    if (!budgetMonth || !token) return;
    try {
      await updateBudgetMonth(token, budgetMonth.id, parseFloat(newBudget));
      setModalVisible(false);
      fetchBudgetData(selectedMonth);
    } catch (err) {
      console.error("Havi keret frissítés hiba:", err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!token) return;
    try {
      await deleteExpense(token, id);
      fetchBudgetData(selectedMonth);
    } catch (err) {
      console.error("Kiadás törlés hiba:", err);
      Alert.alert("Hiba", "A törlés nem sikerült.");
    }
  };

  const handleExcelExport = async () => {
    if (!budgetMonth || !token) return;
    try {
      const { uri } = await exportExpensesToExcel(token, budgetMonth.id, months[selectedMonth]);
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error("Export hiba:", err);
      Alert.alert("Hiba", "Nem sikerült exportálni az adatokat.");
    }
  };

  const remainingPercent =
    budgetMonth && budgetMonth.total_budget > 0
      ? Math.max(0, Math.min(100,
        (Number(budgetMonth.remaining_budget) /
         Number(budgetMonth.total_budget)) * 100))
      : 0;

  const renderMonthCard = (monthIndex: number) => (
  <View key={monthIndex} style={{ flex: 1 }}>
    <View style={{ padding: 16 }}>
      <Card
        style={{
          marginBottom: 20,
          paddingVertical: 20,
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          elevation: 3,
          position: "relative",
        }}
      >
        <Card.Content
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Havi költségvetés
            </Text>
            <Text
              variant="headlineMedium"
              style={{
                color: theme.colors.primary,
                fontWeight: "bold",
              }}
            >
              {budgetMonth
                ? `${budgetMonth.remaining_budget.toLocaleString("hu-HU")} Ft`
                : "—"}
            </Text>
            {budgetMonth && (
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Összesen: {budgetMonth.total_budget.toLocaleString("hu-HU")} Ft
              </Text>
            )}
          </View>

          <CircularProgress
            value={remainingPercent}
            maxValue={100}
            radius={40}
            activeStrokeWidth={8}
            inActiveStrokeWidth={8}
            activeStrokeColor={theme.colors.primary}
            inActiveStrokeColor={theme.colors.outline}
            progressValueColor={theme.colors.onSurface}
            progressValueFontSize={16}
            inActiveStrokeOpacity={0.2}
            duration={1200}
            valueSuffix="%"
          />
        </Card.Content>

        <IconButton
          icon="pencil"
          size={22}
          onPress={() => {
            setNewBudget(budgetMonth?.total_budget?.toString() || "");
            setModalVisible(true);
          }}
          style={{ position: "absolute", top: -20, right: -6 }}
          iconColor={theme.colors.primary}
        />
      </Card>
    </View>

    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 100 }}>
      {budgetMonth ? (
        <ExpenseList
          token={token!}
          budgetMonthId={budgetMonth.id}
          // ha a komponens támogatja:
          onDelete={handleDeleteExpense}
          // ha van benne pull-to-refresh támogatás:
           refreshing={refreshing}
           onRefresh={onRefresh}
        />
      ) : (
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          Még nincs rögzített havi keret.
        </Text>
      )}
    </View>
  </View>
);


  const renderDots = () => (
    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 12 }}>
      {months.map((_, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => setSelectedMonth(idx)}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 4,
            backgroundColor:
              idx === selectedMonth ? theme.colors.primary : "#ccc",
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Fejléc + export gomb */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingHorizontal: 16,
      }}>
        <Text variant="headlineSmall" style={{ fontWeight: "600" }}>
          {months[selectedMonth]}
        </Text>
        <IconButton
          icon="file-excel"
          size={26}
          iconColor={theme.colors.primary}
          onPress={handleExcelExport}
        />
      </View>

      <Carousel
        width={width}
        height={Dimensions.get("window").height * 0.78}
        data={months}
        scrollAnimationDuration={400}
        onSnapToItem={(index) => setSelectedMonth(index)}
        defaultIndex={currentMonthIndex}
        renderItem={({ index }) => renderMonthCard(index)}
        windowSize={2}
      />

      {renderDots()}

      {/* Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 20,
            padding: 20,
            borderRadius: 12,
          }}
        >
          <Text variant="titleMedium" style={{ marginBottom: 10 }}>
            Havi költségkeret beállítása
          </Text>

          <TextInput
            label="Új havi keret (Ft)"
            mode="outlined"
            keyboardType="numeric"
            value={newBudget}
            onChangeText={setNewBudget}
            style={{ marginBottom: 16 }}
          />

          <Button mode="contained" onPress={handleUpdateBudget} disabled={!newBudget}>
            Mentés
          </Button>
        </Modal>
      </Portal>

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? "close" : "plus"}
        onStateChange={({ open }) => setFabOpen(open)}
        actions={[
          {
            icon: "calendar-plus",
            label: "Új fix költség",
            onPress: () => router.push("/add-fixed-expense"),
          },
          {
            icon: "plus-circle-outline",
            label: "Új kiadás",
            onPress: () => router.push("/add-expense"),
          },
        ]}
        style={{ paddingBottom: 60 }}
      />
    </View>
  );
};

export default HomeScreen;
