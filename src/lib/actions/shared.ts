import { ZodError } from "zod";

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Turn a thrown ZodError (or unknown) into a user-friendly ActionState. */
export function parseErrors(error: unknown): ActionState {
  if (error instanceof ZodError) {
    return {
      error: "Revisa los campos marcados.",
      fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  return { error: "Ocurrió un error al guardar." };
}
