// Extend Jest with custom matchers from testing-library
import '@testing-library/jest-dom'
import React from 'react'

// Mock next/dynamic globally to render dynamic components synchronously in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // Create a mock component that will render the dynamic component synchronously
    const DynamicComponent = (props) => {
      // In tests, we can just render a placeholder or a div.
      // We'll give it a default testid so tests can verify dynamic components.
      return React.createElement('div', { 'data-testid': 'mock-map-container', ...props })
    }
    
    DynamicComponent.displayName = 'DynamicComponent'
    return DynamicComponent
  },
}))
