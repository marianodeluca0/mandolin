import { text } from "../helpers/text";
import { Spinner } from "./Spinner";

export const Components =  {
    divider() {
        return text("===============================================================");
    },
    br() {
        return text("\n");
    },
    text,
    Spinner
}
