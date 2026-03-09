import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes";
import { QueryClient, QueryClientProvider } from 'react-query'
import { UserProvider } from "@/context/user/userContext";
import { RootLayout } from "./layout";
import { ThemeProvider } from "@/context/theme/themeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserProvider>
          <ThemeProvider>
            <RootLayout>
              <AppRouter />
            </RootLayout>
          </ThemeProvider>
        </UserProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App;