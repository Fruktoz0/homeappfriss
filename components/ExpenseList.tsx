import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { IconButton, List, Snackbar, Text, useTheme } from 'react-native-paper';
import Animated, {
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { deleteExpense, getBudgetExpenses } from '../services/budgetService';
import type { BudgetExpense } from '../types/budget';

interface ExpenseListProps {
    token: string;
    budgetMonthId: number;
    onDelete?: (id: number) => Promise<void>;
    refreshing?: boolean;
    onRefresh?: () => Promise<void>;
}

const RIGHT_ACTION_WIDTH = 80;

const ExpenseList: React.FC<ExpenseListProps> = ({ token, budgetMonthId }) => {
    const theme = useTheme();
    const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getBudgetExpenses(token, budgetMonthId);
            setExpenses(data);
        } catch (err) {
            console.error('Failed to fetch expenses:', err);
        } finally {
            setLoading(false);
        }
    }, [token, budgetMonthId]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleDelete = async (id: number) => {
        try {
            await deleteExpense(token, id);
            setExpenses((prev) => prev.filter((e) => e.id !== id));
            setSnackbarMsg('Kiadás törölve');
            setSnackbarVisible(true);
        } catch (err) {
            console.error('Failed to delete expense:', err);
            setSnackbarMsg('Hiba történt a törlés során');
            setSnackbarVisible(true);
        }
    };

    // Reanimated right actions (delete)
    const renderRightActions = (progress: SharedValue<number>, id: number) => {
        const animatedStyle = useAnimatedStyle(() => {
            const translateX = interpolate(progress.value, [0, 1], [RIGHT_ACTION_WIDTH, 0]);
            const opacity = interpolate(progress.value, [0, 1], [0.2, 1]);
            return { transform: [{ translateX }], opacity };
        });

        return (
            <Animated.View
                style={[
                    {
                        width: RIGHT_ACTION_WIDTH,
                        height: '100%',
                        backgroundColor: theme.colors.error,
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    animatedStyle,
                ]}
            >
                <IconButton
                    icon="delete"
                    iconColor="white"
                    onPress={() => handleDelete(id)}
                />
            </Animated.View>
        );
    };


    if (loading && expenses.length === 0) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Betöltés...</Text>
            </View>
        );
    }

    if (!loading && expenses.length === 0) {
        return (
            <View style={{ padding: 16 }}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Még nincs hozzáadott kiadás ebben a hónapban.
                </Text>
            </View>
        );
    }

    return (
        <View>
            {expenses.map((expense) => (
                <Swipeable
                    key={expense.id}
                    // a Reanimated Swipeable progress-e shared value-ként érkezik
                    renderRightActions={(progress) => renderRightActions(progress, expense.id)}
                    overshootRight={false}
                    friction={2}
                    rightThreshold={40}
                >
                    <List.Item
                        title={expense.description || 'Kiadás'}
                        description={`${expense.amount.toLocaleString('hu-HU')} ${expense.currency || 'Ft'}${expense.category ? ` • ${expense.category}` : ''
                            }`}
                        right={(props) => (
                            <Text
                                {...props}
                                style={{
                                    alignSelf: 'center',
                                    color: theme.colors.onSurfaceVariant,
                                }}
                            >
                                {new Date(expense.createdAt || '').toLocaleDateString('hu-HU')}
                            </Text>
                        )}
                    />
                </Swipeable>
            ))}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2500}
                style={{ backgroundColor: theme.colors.surface }}
            >
                <Text style={{ color: theme.colors.onSurface }}>{snackbarMsg}</Text>
            </Snackbar>
        </View>
    );
};

export default ExpenseList;
