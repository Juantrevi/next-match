import {ZodIssue} from "zod";

// This is made for the types that are used in the whole project, for example to throw errors or to return a result
// This is a discriminated union, we can return a success with data of certain type,
// or an error with a string or an array of ZodIssues
type ActionResult<T> = {status: 'success', data: T}
    | {status: 'error', error: string | ZodIssue[]};

