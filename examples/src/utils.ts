export function html(
  strings: TemplateStringsArray,
  ...args: any[]
): DocumentFragment {
  let result = ``;
  for (let i = 0; i < args.length; i++) {
    if (args[i] instanceof HTMLElement) {
      const id = 'id' + i;
      result += `${strings[i]}<div append="${id}"></div>`;
    } else {
      result += strings[i] + args[i];
    }
  }
  result += strings[strings.length - 1];

  const template = document.createElement(`template`);
  template.innerHTML = result;

  return template.content;
}
