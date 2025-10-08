import { ansistyle, ansiEffects } from "../ansiiStyles";
import { Styles } from "../types";

export function text(text: string, styles?: Styles) {

    let result = text;
    if (styles?.effect) result = ansistyle(ansiEffects[styles.effect], result);
    if (styles?.color) result = ansistyle(38, result, styles.color);
    if (styles?.bgcolor) result = ansistyle(48, result, styles.bgcolor);
    return result;
}
