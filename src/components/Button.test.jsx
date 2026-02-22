import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Button from "./Button"
import "@testing-library/jest-dom"

describe("Button", () => {
  it("renders text", () => {
    render(<Button>Click</Button>)
    expect(screen.getByText("Click")).toBeInTheDocument()
  })
})
