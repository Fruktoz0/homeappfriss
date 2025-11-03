import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { logout } from "../../services/authService";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Text variant="headlineSmall" style={{ marginBottom: 24 }}>
        Fiók
      </Text>
      <Button mode="contained" onPress={handleLogout}>
        Kijelentkezés
      </Button>
    </View>
  );
}
