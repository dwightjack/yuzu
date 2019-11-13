import 'core-js/es/array/from';
import 'core-js/es/map';
import 'core-js/es/object/assign';
import 'core-js/es/object/entries';
import 'core-js/es/promise';
import 'core-js/es/string/includes';
import 'core-js/es/string/starts-with';
import 'element-closest';

if (!Number.MAX_SAFE_INTEGER) {
  (Number as any).MAX_SAFE_INTEGER = 0x1fffffffffffff;
}

// from: https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function removePolyfill(arr) {
  arr.forEach((item) => {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value() {
        if (this.parentNode !== null) {
          this.parentNode.removeChild(this);
        }
      },
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
