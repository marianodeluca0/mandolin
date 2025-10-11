import { ansistyle, ansiEffects } from "../ansiiStyles";
import { Styles } from "../types";

export type TextHelper = (text: string, styles?: Styles) => string;

export const text: TextHelper = (text: string, styles?: Styles) => {

    let result = text;
    if (styles?.effect?.length) result = ansistyle(styles.effect.map(style => ansiEffects[style]), result);
    if (styles?.color) result = ansistyle(38, result, styles.color);
    if (styles?.bgcolor) result = ansistyle(48, result, styles.bgcolor);
    return result;
}
