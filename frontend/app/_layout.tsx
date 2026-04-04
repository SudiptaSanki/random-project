import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Index from "./index";

export default function AppLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#0f172a', '#020617']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar style="light" />
        <Index />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
