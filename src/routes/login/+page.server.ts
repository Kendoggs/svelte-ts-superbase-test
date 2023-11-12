import { z } from "zod";
import { setError, superValidate } from "sveltekit-superforms/server";
import type { PageServerLoad } from "./$types";
import { fail, type Actions, redirect } from "@sveltejs/kit";
import { AuthApiError, AuthError } from "@supabase/supabase-js";

const loginUserSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Please enter a password")
})

export const load: PageServerLoad = async (event) => {
    return {
        form: superValidate(loginUserSchema)
    }
}

export const actions: Actions = {
    default:async (event) => {
        const form = await superValidate(event, loginUserSchema)

        if (!form.valid) {
            return fail(400, {
                form
            })
        }

        if (AuthError) {
            if (AuthError instanceof AuthApiError && AuthError.status === 400){
                setError(form, "email", "Invalid credentials");
                setError(form, "password", "Invalid credentials");
                return fail(400, {
                    form
                })
            }
        }

        throw redirect(302, "/")
    }   
}