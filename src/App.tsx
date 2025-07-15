import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { DataObjectRounded, DeleteForeverRounded } from "@mui/icons-material";
import { ThemeProvider as MuiThemeProvider, type Theme } from "@mui/material";
import { useCallback, useContext, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./layouts/MainLayout";
import { CustomToaster } from "./components/Toaster";
import { defaultUser } from "./constants/defaultUser";
import { UserContext } from "./contexts/UserContext";
import { useSystemTheme } from "./hooks/useSystemTheme";
import AppRouter from "./router";
import { GlobalStyles } from "./styles";
import { Themes, createCustomTheme, isDarkMode } from "./theme/createTheme";
import { showToast } from "./utils";
import { GlobalQuickSaveHandler } from "./components/GlobalQuickSaveHandler";

function App() {
  const { user, setUser } = useContext(UserContext);
  const systemTheme = useSystemTheme();

  // Initialize user properties if they are undefined
  // this allows to add new properties to the user object without error
  const updateNestedProperties = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (userObject: any, defaultObject: any) => {
      if (!userObject) {
        return defaultObject;
      }

      Object.keys(defaultObject).forEach((key) => {
        if (key === "categories") {
          return;
        }
        if (
          key === "colorList" &&
          user.colorList &&
          !defaultUser.colorList.every((element, index) => element === user.colorList[index])
        ) {
          return;
        }

        if (key === "settings" && Array.isArray(userObject.settings)) {
          delete userObject.settings;
          showToast("Removed old settings array format.", {
            duration: 6000,
            icon: <DeleteForeverRounded />,
            disableVibrate: true,
          });
        }

        const userValue = userObject[key];
        const defaultValue = defaultObject[key];

        if (typeof defaultValue === "object" && defaultValue !== null) {
          userObject[key] = updateNestedProperties(userValue, defaultValue);
        } else if (userValue === undefined) {
          userObject[key] = defaultValue;
          showToast(
            <div>
              Added new property to user object{" "}
              <i translate="no">
                {key.toString()}: {userObject[key].toString()}
              </i>
            </div>,
            {
              duration: 6000,
              icon: <DataObjectRounded />,
              disableVibrate: true,
            },
          );
        }
      });

      return userObject;
