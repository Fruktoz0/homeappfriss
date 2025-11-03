import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import {
  ActivityIndicator,
  Card,
  FAB,
  Text,
  useTheme,
} from 'react-native-paper';
import ExpenseList from '../../components/ExpenseList';
import { getBudgetMonths } from '../../services/budgetService';
import type { BudgetMonth } from '../../types/budget';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  

  // 🔹 majd auth contextből jön:
  const token = 'TOKEN_IDE';
  const [budgetMonth, setBudgetMonth] = useState<BudgetMonth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Fetch current month's budget
  const fetchBudgetData = async () => {
    try {
      setIsLoading(true);
      const months = await getBudgetMonths(token);
      if (months.length > 0) {
        const now = new Date();
        const currentMonth = months.find(
          (m: BudgetMonth) => new Date(m.month).getMonth() === now.getMonth()
        );
        setBudgetMonth(currentMonth || months[0]);
      }
    } catch (err) {
      console.error('Failed to fetch budget months:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgetData();
    setRefreshing(false);
  };

  // számolás: maradék százalék
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
            fontWeight: '600',
            marginBottom: 12,
          }}
        >
          {format(new Date(), 'yyyy. MMMM', { locale: hu })} havi költségvetés
        </Text>

        {/* Ha betölt */}
        {isLoading ? (
          <ActivityIndicator
            animating={true}
            color={theme.colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* Kártya a havi kerethez */}
            <Card
              style={{
                marginBottom: 20,
                paddingVertical: 20,
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                elevation: 3,
              }}
            >
              <Card.Content
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                      fontWeight: 'bold',
                    }}
                  >
                    {budgetMonth
                      ? `${budgetMonth.remaining_budget.toLocaleString('hu-HU')} Ft`
                      : '—'}
                  </Text>
                  {budgetMonth && (
                    <Text
                      style={{
                        color: theme.colors.onSurfaceVariant,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      Összesen: {budgetMonth.total_budget.toLocaleString('hu-HU')} Ft
                    </Text>
                  )}
                </View>

                {/* Félkör progress (egyszerű placeholder) */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    elevation: 2,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 16, color: theme.colors.onSurfaceVariant }}>
                      Havi költségkeret
                    </Text>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.primary }}>
                      {budgetMonth?.remaining_budget?.toLocaleString('hu-HU')} Ft
                    </Text>
                  </View>

                 
                  <CircularProgress
                    value={remainingPercent}        // 0–100
                    maxValue={100}
                    radius={40}                     // size(80) -> radius(40)
                    activeStrokeWidth={8}           // width
                    inActiveStrokeWidth={8}
                    activeStrokeColor={theme.colors.primary}       // tintColor
                    inActiveStrokeColor={theme.colors.outline}     // backgroundColor
                    progressValueColor={theme.colors.onSurface}
                    progressValueFontSize={16}
                    inActiveStrokeOpacity={0.2}
                    duration={1200}
                    // formázd ugyanúgy egész %-ra, mint korábban:
                    progressFormatter={(v) => `${Math.round(v)}%`}
                  />
                </View>

              </Card.Content>
            </Card>

            {/* Kiadások listája */}
            {budgetMonth ? (
              <ExpenseList
                token={token}
                budgetMonthId={budgetMonth.id}
              />
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Még nincs rögzített havi keret.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Lebegő gomb csoport */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        onStateChange={({ open }) => setFabOpen(open)}
        actions={[
          {
            icon: 'calendar-plus',
            label: 'Új fix költség',
            onPress: () => router.push('/add-fixed-expense'),
          },
          {
            icon: 'plus-circle-outline',
            label: 'Új kiadás',
            onPress: () => router.push('/add-expense'),
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
