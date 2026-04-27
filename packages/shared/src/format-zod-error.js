export function formatZodError(error) {
  return error.issues
    .map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join(', ');
}
//# sourceMappingURL=format-zod-error.js.map
