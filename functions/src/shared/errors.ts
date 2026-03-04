export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ExtractionError extends AppError {
  constructor(
    message: string,
    public readonly rawOutput?: string
  ) {
    super(message, "EXTRACTION_FAILED");
    this.name = "ExtractionError";
  }
}

export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Cannot transition invoice from '${from}' to '${to}'`, "INVALID_TRANSITION");
    this.name = "InvalidTransitionError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_FAILED");
    this.name = "ValidationError";
  }
}
