import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import {
  ActivityIndicator,
  Button,
  Card,
  FAB,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import ExpenseList from "../../components/ExpenseList";
import { useBudget } from "../../contexts/BudgetContext";
import { getToken } from "../../services/authService";
import { getBudgetMonths, updateBudgetMonth } from "../../services/budgetService";
import type { BudgetMonth } from "../../types/budget";


const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();

  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { budgetMonthId, setBudgetMonthId } = useBudget();
  const [modalVisible, setModalVisible] = useState(false);
  const [newBudget, setNewBudget] = useState("");

 const fetchBudgetData = async () => {
  try {
    setIsLoading(true);
    const t = await getToken();
    if (!t) {
      // Ha nincs token, ne folytassuk
      setIsLoading(false);
      return;
    }
    setToken(t);

    // Az API egy objektumot ad vissza, ami tartalmazza a `currentMonth`-ot
    const budgetData = await getBudgetMonths(t);
    console.log("Fetched budget data:", budgetData);

    // A `currentMonth` objektumot használjuk közvetlenül
    const selectedMonth = budgetData.currentMonth;

    // Ellenőrizzük, hogy van-e kiválasztott hónap
    if (selectedMonth) {
      // Helyi állapot beállítása a `HomeScreen` számára
      setBudgetMonth(selectedMonth);
      
      // Kontextus állapotának beállítása a teljes alkalmazás számára
      setBudgetMonthId(selectedMonth.id);
    } else {
      console.log("Nincs elérhető havi költségvetés.");
    }

  } catch (err) {
    console.error("Failed to fetch budget months:", err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchBudgetData();
  }, []);

  useEffect(() => {
    console.log("Updated budgetMonthId:", budgetMonthId);
  }, [budgetMonthId]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData();
    setRefreshing(false);
  };

  const handleUpdateBudget = async () => {
    if (!budgetMonth || !token) return;
    try {
      await updateBudgetMonth(token, budgetMonth.id, parseFloat(newBudget));
      setModalVisible(false);
      fetchBudgetData(); // újratöltés
    } catch (err) {
      console.error("Havi keret frissítés hiba:", err);
    }
  };

  const remainingPercent =
    budgetMonth && budgetMonth.total_budget > 0
      ? Math.max(
        0,
        Math.min(
          100,
          (Number(budgetMonth.remaining_budget) /
            Number(budgetMonth.total_budget)) *
          100
        )
      )
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.primary,
            fontWeight: "600",
            marginBottom: 12,
          }}
        >
          {format(new Date(), "yyyy. MMMM", { locale: hu })} havi költségvetés
        </Text>

        {isLoading ? (
          <ActivityIndicator
            animating={true}
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
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
                    Elérhető keret:
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

              {/* ✏️ Ceruza ikon a jobb alsó sarokban */}
              <IconButton
                icon="pencil"
                size={22}
                onPress={() => {
                  setNewBudget(budgetMonth?.total_budget?.toString() || "");
                  setModalVisible(true);
                }}
                style={{
                  position: "absolute",
                  top: -20,
                  right: -6,
                }}
                iconColor={theme.colors.primary}
              />
            </Card>



            {budgetMonth ? (
              <ExpenseList token={token!} budgetMonthId={budgetMonth.id} />
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Még nincs rögzített havi keret.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* ✏️ Modal a havi keret beállításához */}
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

          <Button
            mode="contained"
            onPress={handleUpdateBudget}
            disabled={!newBudget}
          >
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
        style={{
          paddingBottom: 60,
        }}
      />
    </View>
  );
};

export default HomeScreen;
