import { FormControl } from '@angular/forms';

export class NoWhiteSpaceValidator {
  static isValid(control: FormControl) {
    const isWhitespace = (String(control.value) || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid || String(control.value) === '' ? null : { whitespace: true };
  }
}
