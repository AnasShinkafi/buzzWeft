import * as z from 'zod'

export const BuzzWeftValidation = z.object({
    buzzWeft: z.string().nonempty().min(3, { message: "MINIMUM IS 3 CHARACTERS"}),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    buzzWeft: z.string().nonempty().min(3, { message: "MINIMUM IS 3 CHARACTERS"}),
})