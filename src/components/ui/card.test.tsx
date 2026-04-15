import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Card } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders as a div element', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card.tagName).toBe('DIV')
  })

  it('has default padding (md)', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('p-4')
  })

  it('supports small padding', () => {
    render(<Card padding="sm">Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('p-3')
  })

  it('supports large padding', () => {
    render(<Card padding="lg">Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('p-6')
  })

  it('has default background and border classes', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('bg-surface-container')
    expect(card).toHaveClass('ghost-border')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('transition-all')
  })

  it('supports hoverable prop', () => {
    render(<Card hoverable>Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('hover:bg-surface-bright')
    expect(card).toHaveClass('hover:border-white/20')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('does not have hover classes when hoverable is false', () => {
    render(<Card hoverable={false}>Content</Card>)
    const card = screen.getByText('Content')
    expect(card).not.toHaveClass('hover:bg-surface-bright')
    expect(card).not.toHaveClass('cursor-pointer')
  })

  it('supports custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('custom-class')
  })

  it('handles onClick events', async () => {
    const handleClick = vi.fn()
    render(<Card onClick={handleClick}>Clickable Content</Card>)
    const card = screen.getByText('Clickable Content')
    
    await userEvent.click(card)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('works without onClick handler', async () => {
    render(<Card>Non-clickable Content</Card>)
    const card = screen.getByText('Non-clickable Content')
    
    // Should not throw when clicked
    await userEvent.click(card)
    
    expect(card).toBeInTheDocument()
  })

  it('renders complex children', () => {
    render(
      <Card>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </Card>
    )
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('combines all classes correctly', () => {
    render(
      <Card 
        padding="lg" 
        hoverable 
        className="my-card"
      >
        Full Config Card
      </Card>
    )
    
    const card = screen.getByText('Full Config Card')
    expect(card).toHaveClass('p-6')
    expect(card).toHaveClass('hover:bg-surface-bright')
    expect(card).toHaveClass('my-card')
    expect(card).toHaveClass('bg-surface-container')
    expect(card).toHaveClass('rounded-xl')
  })
})
