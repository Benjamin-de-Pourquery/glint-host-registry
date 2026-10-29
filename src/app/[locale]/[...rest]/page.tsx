import { notFound } from "next/navigation";

/** Unknown paths under a locale prefix render the localized not-found page. */
export default function UnknownLocaleCatchAll() {
  notFound();
}
