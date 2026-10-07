// @vitest-environment happy-dom
/**
 * Regression test for a real production incident: this route's component
 * calls `useIntl()`/`FormattedMessage` but is a flat, standalone route (no
 * `_portal`/`admin`/`onboarding` layout ancestor providing an IntlProvider),
 * so it crashed with "[React Intl] Could not find required `intl` object"
 * for a real user the moment they opened an invitation link while already
 * signed in. The fix is the route wrapping its own tree in
 * `<PortalIntlProvider>`, fed by a `loadPortalIntl()` loader call — the same
 * pattern `auth.recovery.tsx` / `auth.reset-password.tsx` already use.
 *
 * Deliberately does NOT wrap the test render in any ambient IntlProvider —
 * that would hide exactly the bug this test exists to catch.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRoute,
  createRootRouteWithContext,
  createRouter,
} from '@tanstack/react-router'

vi.mock('@/lib/server/functions/locale', () => ({
  loadPortalIntl: async () => ({ locale: 'en', messages: {} }),
}))

vi.mock('@/lib/server/functions/invitations', () => ({
  getInviteBrandingFn: async () => ({
    workspaceName: 'Acme',
    logoUrl: null,
    inviterName: null,
  }),
  getInvitationDetailsFn: async () => {
    throw new Error('not used in this test')
  },
  acceptInvitationFn: async () => {
    throw new Error('not used in this test')
  },
  setPasswordFn: async () => {
    throw new Error('not used in this test')
  },
}))

afterEach(cleanup)

async function mount() {
  // `createFileRoute` objects are wired to the real generated route tree and
  // can't be remounted standalone (constructing a router from one directly
  // throws "Duplicate routes found with id: __root__"). Pull just the real
  // loader/component/validateSearch off the module's exported Route and wire
  // them into a fresh test-only route instead — that still exercises the
  // actual code this bug lived in, just not the literal Route object.
  const mod = await import('../complete-signup.$id')
  const options = (mod.Route as unknown as { options: Record<string, unknown> }).options

  const rootRoute = createRootRouteWithContext<object>()({})
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/complete-signup/$id',
    validateSearch: options.validateSearch as never,
    loader: options.loader as never,
    component: options.component as never,
  })
  // The route's options are borrowed reflectively (typed `unknown` by the
  // cast above), so `testRoute`'s inferred type doesn't structurally match
  // what `addChildren`/`createRouter` expect — a type-only mismatch, not a
  // runtime one (the test passes; this only silences `tsc`). Widen to `any`
  // at the narrowest point that actually trips the inference.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeTree = rootRoute.addChildren([testRoute as any])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/complete-signup/invite_123'] }),
    context: { session: null },
  })
  render(<RouterProvider router={router} />)
  return router
}

describe('complete-signup/$id (not authenticated)', () => {
  it('renders without an ambient IntlProvider', async () => {
    await mount()
    expect(await screen.findByText("You're invited!")).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
  })
})
