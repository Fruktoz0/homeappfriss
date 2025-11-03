import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { login } from "../../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    if (!email || !password) return alert("Töltsd ki a mezőket!");
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/(tabs)");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Sikertelen bejelentkezés");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Bejelentkezés
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ marginBottom: 12 }}
      />
      <TextInput
        label="Jelszó"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 16 }}
      />
      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={loading}
      >
        Belépés
      </Button>
    </View>
  );
}
