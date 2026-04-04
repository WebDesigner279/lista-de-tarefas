import { redirect } from "next/navigation";

const DEFAULT_HOME_ROUTE = "/home";

export default function Page() {
  redirect(DEFAULT_HOME_ROUTE);
}
