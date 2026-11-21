import { render, screen } from '@testing-library/react';

// Smoke test de la infraestructura (T1): jsdom + RTL + jest-dom + globals.
describe('Infraestructura de pruebas', () => {
  it('renderiza y usa matchers de jest-dom sobre el DOM de jsdom', () => {
    render(<button>Ingresar</button>);
    const boton = screen.getByRole('button', { name: 'Ingresar' });
    expect(boton).toBeInTheDocument();
    expect(boton).toBeEnabled();
  });
});
