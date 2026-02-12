export const changeHTMLAttribute = (attribute: string, value: string): void => {
  if (typeof document !== 'undefined') {
    document.getElementsByTagName('html')[0].setAttribute(attribute, value);
  }
};
