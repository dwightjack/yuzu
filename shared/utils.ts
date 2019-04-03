export const mount = (template: string) => {
  const __html__ = (window as any).__html__ || {};
  if (__html__[template]) {
    document.body.innerHTML = __html__[template];
  }
};
