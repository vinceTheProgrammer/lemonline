import type { ErrorType } from "../constants/errors.js";

export class CustomError extends Error {
    originalError: Error | null;
    errorType: ErrorType;
    footer: string | undefined;

    constructor(message: string, errorType: ErrorType, originalError: Error | null = null, footer?: string) {
        super(message); // Set the custom message.
        this.name = "CustomLemonLineError"; // Optional: set a specific name.
        this.originalError = originalError;
        this.errorType = errorType;
        this.footer = footer;

        // Ensure the prototype chain is properly set.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}