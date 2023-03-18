import useColorScheme from "./useColorScheme";

export default function useIsDarkMode() {
  return useColorScheme() === "dark";
}
