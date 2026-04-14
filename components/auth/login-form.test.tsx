/* @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";

const replaceMock = vi.fn();
const refreshMock = vi.fn();
const loginActionMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

vi.mock("@/actions/auth", () => ({
  loginAction: (...args: unknown[]) => loginActionMock(...args),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  replaceMock.mockReset();
  refreshMock.mockReset();
  loginActionMock.mockReset();
});

describe("LoginForm", () => {
  it("envia os valores reais do formulario mesmo quando o navegador preenche sem disparar onChange", async () => {
    loginActionMock.mockResolvedValue({
      status: "success",
      redirectTo: "/dashboard",
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("E-mail") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Senha") as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: "Entrar" });

    emailInput.value = "demo@listadetarefas.local";
    passwordInput.value = "Demo1234";

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(loginActionMock).toHaveBeenCalledWith({
        email: "demo@listadetarefas.local",
        password: "Demo1234",
      });
    });

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    expect(refreshMock).toHaveBeenCalled();
  });
});