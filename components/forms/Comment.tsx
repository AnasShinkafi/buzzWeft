"use client"
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { CommentValidation } from "@/lib/validation/buzzweft";
import * as z  from "zod";
import Image from "next/image";
import { addCommentToBuzzWeft } from "@/lib/action/buzz.action";

interface Props {
    buzzWeftId: string,
    currentUserImg: string,
    currentUserId: string,
}
const Comment = ({ buzzWeftId, currentUserImg, currentUserId }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            buzzWeft: '',
        }
    });

    const onsubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToBuzzWeft(buzzWeftId, values.buzzWeft, JSON.parse(currentUserId), pathname);

        form.reset();
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onsubmit)}
                className="comment-form"
            >
                <FormField
                    control={form.control}
                    name="buzzWeft"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3 w-full">
                            <FormLabel>
                                <Image 
                                    src={currentUserImg}
                                    alt="Profile Photo"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </FormLabel>
                            <FormControl className=" border-none bg-transparent">
                                <Input
                                    type="text"
                                    placeholder="Comment..."
                                    className="no-focus text-light-1 outline-none"
                                    {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="comment-form_btn">Reply</Button>
            </form>
        </Form>
    )
}

export default Comment