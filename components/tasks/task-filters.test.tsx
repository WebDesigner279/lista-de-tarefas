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
    expect(screen.getByText("Não finalizadas")).toBeDefined();
    expect(screen.getByText("Concluídas")).toBeDefined();
  });

  it("notifica quando o usuario escolhe outro filtro", () => {
    const onFilterChange = vi.fn();

    render(<TaskFilters activeFilter="all" onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByText("Concluídas"));

    expect(onFilterChange).toHaveBeenCalledWith("done");
  });
});
