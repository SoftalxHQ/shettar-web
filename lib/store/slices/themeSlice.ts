import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeHTMLAttribute } from "@/app/utils/html-layout";

interface ThemeState {
  theme: "light" | "dark" | "auto";
  dir: "ltr" | "rtl";
}

const initialState: ThemeState = {
  theme: "auto",
  dir: "ltr",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<"light" | "dark" | "auto">) {
      state.theme = action.payload;

      let resolvedTheme: string = action.payload;
      if (action.payload === "auto") {
        if (typeof window !== "undefined") {
          resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
        } else {
          resolvedTheme = "light";
        }
      }

      changeHTMLAttribute("data-bs-theme", resolvedTheme);
    },
    setDir(state, action: PayloadAction<"ltr" | "rtl">) {
      state.dir = action.payload;
    },
  },
});

export const { setTheme, setDir } = themeSlice.actions;

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;
export const selectDir = (state: { theme: ThemeState }) => state.theme.dir;

export default themeSlice.reducer;
