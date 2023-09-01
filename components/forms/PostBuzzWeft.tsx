"use client"

import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from "../ui/button";
import * as z from 'zod';
import { usePathname, useRouter } from "next/navigation";
import { BuzzWeftValidation } from "@/lib/validation/buzzweft";
import { Textarea } from "../ui/textarea";
import { createBuzz } from "@/lib/action/buzz.action";
 

const PostBuzzWeft = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver: zodResolver(BuzzWeftValidation),
    defaultValues: {
      buzzWeft: '',
      accountId: userId,
    }
  });

  const onsubmit = async (values: z.infer<typeof BuzzWeftValidation>) => {
    await createBuzz({
      text: values.buzzWeft,
      author: userId,
      communityId: null,
      path: pathname,
    });
    
    router.push('/');
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onsubmit)}
        className="mt-10 flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="buzzWeft"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">Content</FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea
                  rows={16}
                  {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-primary-500">Post Buzz</Button>
      </form>
    </Form>
  )
}

export default PostBuzzWeft