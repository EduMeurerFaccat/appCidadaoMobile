// constants/useTheme.ts
import { useColorScheme } from "react-native";
import { Colors } from "./Colors";

export function useTheme() {
  const colorScheme = useColorScheme();

  // Retorna as cores baseado no tema atual (light ou dark)
  return colorScheme === "dark" ? Colors.dark : Colors.light;
}
