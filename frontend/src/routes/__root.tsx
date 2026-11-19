import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const RootLayout = () => (
  <>
    {/* <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{' '}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </div>
    <hr /> */}
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })