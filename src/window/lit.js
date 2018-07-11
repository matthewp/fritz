import {
  AttributePart,
  defaultPartCallback,
  getValue,
  render as baseRender,
  SVGTemplateResult,
  TemplateResult
} from 'lit-html';
import { mark } from './handle.js';

function html(strings, values) {
  return new TemplateResult(strings, values, 'html', partCallback);
}

function svg(strings, values) {
  return new SVGTemplateResult(strings, values, 'svg', partCallback);
}

function partCallback(instance, templatePart, node) {
  if (templatePart.type === 'attribute') {
    if (templatePart.rawName.startsWith('on-')) {
      const eventName = templatePart.rawName.substring(3);
      return new EventPart(instance, node, eventName);
    }

    // What to do about properties
    if(templatePart.name.startsWith(":")) {
      const name = templatePart.name.substr(1);
      return new PropertyPart(instance, node, name, templatePart.strings);
    }
    return new AttributePart(instance, node, templatePart.rawName, templatePart.strings);
    //return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
  }
  return defaultPartCallback(instance, templatePart, node);
};

class EventPart {
  constructor(instance, element, eventName) {
    this.instance = instance;
    this.element = element;
    this.eventName = eventName;
  }
  setValue(value) {
    const listener = getValue(this, value);
    if (listener === this._listener) {
      return;
    }
    // Mark garbage if the value has changed
    if(listener && this._listener && listener !== this._listener) {
      mark(this._listener);
    }
    if (listener == null) {
      this.element.removeEventListener(this.eventName, this);
    }
    else if (this._listener == null) {
      this.element.addEventListener(this.eventName, this);
    }
    this._listener = listener;
  }
  handleEvent(event) {
    if (typeof this._listener === 'function') {
      this._listener.call(this.element, event);
    }
    else if (typeof this._listener.handleEvent === 'function') {
      this._listener.handleEvent(event);
    }
  }
}

class PropertyPart extends AttributePart {
  setValue(values, startIndex) {
    const s = this.strings;
    let value;
    if (s.length === 2 && s[0] === '' && s[s.length - 1] === '') {
      // An expression that occupies the whole attribute value will leave
      // leading and trailing empty strings.
      value = getValue(this, values[startIndex]);
    }
    else {
      // Interpolation, so interpolate
      value = '';
      for (let i = 0; i < s.length; i++) {
        value += s[i];
        if (i < s.length - 1) {
          value += getValue(this, values[startIndex + i]);
        }
      }
    }
    this.element[this.name] = value;
  }
}

class PropertyOrAttributePart { 
  constructor(...args) {
    this._args = args;
    this._part = null;
  }
}

export { baseRender as render, html, svg };
