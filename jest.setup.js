// Extend Jest with custom matchers from testing-library
import '@testing-library/jest-dom'
import React from 'react'

// Mock next/dynamic globally to render dynamic components synchronously in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    // Create a mock component that will render the dynamic component synchronously
    const DynamicComponent = (props) => {
      // Filter out non-DOM props to prevent React warnings in test logs
      const domProps = {}
      for (const [key, value] of Object.entries(props)) {
        if (typeof value !== 'function' && key !== 'venues') {
          domProps[key] = value
        }
      }
      return React.createElement('div', { 'data-testid': 'mock-map-container', ...domProps })
    }
    
    DynamicComponent.displayName = 'DynamicComponent'
    return DynamicComponent
  },
}))
