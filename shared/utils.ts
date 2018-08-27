export const mount = (template: string) => {
  const __html__ = (window as any).__html__ || {}; // tslint:disable-line variable-name
  if (__html__[template]) {
    document.body.innerHTML = __html__[template];
  }
};
