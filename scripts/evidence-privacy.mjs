export function sanitizeText(input) {
  return input
    .replace(/(?:\/home|\/Users)\/[^/\\\s]+\/(?:[^/\\\s]+\/)*biblioteca-viva(?=[/\\\s"'<>]|$)/gi, "<repo-root>")
    .replace(/(?:\/home|\/Users)\/[^/\\\s]+\/(?:[^/\\\s]+\/)*bv-f4-lab(?=[/\\\s"'<>]|$)/gi, "<lab-root>")
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+\\(?:[^\\\s]+\\)*biblioteca-viva(?=[\\\s"'<>]|$)/gi, "<repo-root>")
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+\\(?:[^\\\s]+\\)*bv-f4-lab(?=[\\\s"'<>]|$)/gi, "<lab-root>")
    .replace(/\/tmp(?=\/|[\s"'<>]|$)/g, "<tmp-root>");
}
