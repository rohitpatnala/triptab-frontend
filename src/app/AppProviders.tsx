
import {
  FluentProvider,
  webLightTheme,
} from "@fluentui/react-components";

import { lightTheme } from "../styles/theme";

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <FluentProvider theme={lightTheme ?? webLightTheme}>
      {children}
    </FluentProvider>
  );
}
