import { ansiCodes } from "./ansiiStyles";

const errorStyles = {
    warning: ansiCodes.yellow,
    error: ansiCodes.red,
}

export const formatError =  {
    warning(context: string, message: string) {
        return {
            color: ansiCodes.yellow,
            message: `[${context}] ${message}`,
        }
    },
    error(context: string, message: string) {
        return {
            color: ansiCodes.red,
            message: `[${context}] ${message}`,
        }
    }
}
