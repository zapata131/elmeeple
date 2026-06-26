import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import OnboardingPage from "@/app/onboarding/page"
import React from "react"
import { useSession } from "next-auth/react"

const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn()
  }),
  usePathname: () => "/"
}))

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  Marker: () => <div data-testid="mock-marker" />,
  useMap: () => ({
    setView: jest.fn(),
    getZoom: jest.fn().mockReturnValue(12)
  }),
  useMapEvents: () => null
}))

jest.mock("../app/actions/venue", () => ({
  createVenue: jest.fn().mockResolvedValue({
    success: true,
    venueId: "mock-123"
  })
}))

describe("Onboarding Secure Encryption Trust Badge", () => {
  beforeAll(() => {
    // Mock FileReader prototype for JSDOM
    const mockFileReader = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readAsDataURL: jest.fn().mockImplementation(function(this: any) {
        if (this.onload) {
          this.onload({ target: { result: "data:image/jpeg;base64,mockcroppedlogo" } })
        }
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(global, "FileReader").mockImplementation(() => mockFileReader as any)

    // Mock Image prototype in JSDOM to trigger onload instantly
    Object.defineProperty(global.Image.prototype, "src", {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(_src) {
        if (this.onload) {
          setTimeout(() => this.onload(), 0)
        }
      }
    })

    // Mock Canvas creation to prevent DOM exceptions in JSDOM
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: jest.fn()
          }),
          toDataURL: () => "data:image/jpeg;base64,mockcroppedlogo"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
      return originalCreateElement(tagName)
    })
  })

  beforeEach(() => {
    // Reset useSession mock to authenticated
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "Jose Zapata",
          email: "jose@elmeeple.com",
          role: "partner"
        }
      },
      status: "authenticated"
    })

    // Mock Geolocation
    const mockGetCurrentPosition = jest.fn().mockImplementation((success) =>
      success({
        coords: {
          latitude: 19.4155,
          longitude: -99.1622
        }
      })
    )
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: mockGetCurrentPosition
      },
      writable: true,
      configurable: true
    })
  })

  it("displays the secure encryption trust badge in the ownership verification step (Step 5)", async () => {
    render(<OnboardingPage />)
    const user = userEvent.setup()

    // --- STEP 1: Datos del local ---
    await user.type(screen.getByLabelText(/Nombre del local/i), "Meeple Oasis CDMX")
    await user.type(screen.getByLabelText(/Descripción/i), "Un oasis de juegos de mesa.")
    await user.click(screen.getByRole("button", { name: /Siguiente/i }))

    // --- STEP 2: Ubicar en el mapa ---
    await user.click(screen.getByRole("button", { name: /Usar mi ubicación actual/i }))
    await user.click(screen.getByRole("button", { name: /Siguiente/i }))

    // --- STEP 3: Especialidades ---
    await user.click(screen.getByRole("button", { name: /Siguiente/i }))

    // --- STEP 4: Confirmar datos ---
    await user.click(screen.getByRole("button", { name: /Siguiente/i }))

    // --- STEP 5: Verificación de propiedad ---
    expect(screen.getByRole("heading", { name: /Paso 5: verificación de propiedad/i })).toBeInTheDocument()

    // Verify secure trust badge is present
    const trustBadge = screen.getByTestId("secure-trust-badge")
    expect(trustBadge).toBeInTheDocument()

    // Verify it contains a lock icon (SVG)
    const lockIcon = trustBadge.querySelector("svg")
    expect(lockIcon).toBeInTheDocument()

    // Verify it does not contain emojis (simple check)
    expect(trustBadge.textContent).not.toMatch(/🔒|🛡️|🔑|💼/)

    // Verify description text is present
    expect(screen.getByText(/encripta/i)).toBeInTheDocument()
    expect(screen.getByText(/Solo son visibles para la administración/i)).toBeInTheDocument()
  })
})
