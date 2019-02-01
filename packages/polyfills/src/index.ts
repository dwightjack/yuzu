import 'core-js/fn/array/from';
import 'core-js/fn/map';
import 'core-js/fn/object/assign';
import 'core-js/fn/object/entries';
import 'core-js/fn/promise';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';
import 'core-js/fn/number/is-nan';
import 'element-closest';

// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
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
