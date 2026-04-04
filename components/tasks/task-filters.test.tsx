/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskFilters } from "@/components/tasks/task-filters";

afterEach(() => {
  cleanup();
});

describe("TaskFilters", () => {
  it("renderiza os tres filtros esperados", () => {
    render(<TaskFilters activeFilter="all" onFilterChange={vi.fn()} />);

    expect(screen.getByText("Todos")).toBeDefined();
    expect(screen.getByText("Nao finalizadas")).toBeDefined();
    expect(screen.getByText("Concluidas")).toBeDefined();
  });

  it("notifica quando o usuario escolhe outro filtro", () => {
    const onFilterChange = vi.fn();

    render(<TaskFilters activeFilter="all" onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText("Concluidas"));

    expect(onFilterChange).toHaveBeenCalledWith("done");
  });
});
