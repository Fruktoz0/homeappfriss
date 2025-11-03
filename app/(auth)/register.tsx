import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { register } from "../../services/authService";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    if (!email || !password) return alert("Töltsd ki a mezőket!");
    setLoading(true);
    try {
      await register({ email, password, displayName });
      router.replace("/(tabs)");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Hiba a regisztráció során.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Regisztráció
      </Text>
      <TextInput
        label="Név"
        value={displayName}
        onChangeText={setDisplayName}
        style={{ marginBottom: 12 }}
      />
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
      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>
        Regisztrálok
      </Button>
    </View>
  );
}
