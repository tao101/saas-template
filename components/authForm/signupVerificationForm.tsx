"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MailIcon } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { supabaseClient } from "@/utils/supabase/client";

const verificationSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

type VerificationSchema = z.infer<typeof verificationSchema>;

interface SignupVerificationFormProps {
  email: string;
  onVerificationComplete: () => void;
}

export default function SignupVerificationForm({
  email,
  onVerificationComplete,
}: SignupVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VerificationSchema>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: VerificationSchema) => {
    setIsLoading(true);
    try {
      // TODO: Implement OTP verification logic here
      console.log("Verifying OTP:", data.otp);

      const { data: supaData, error } = await supabaseClient.auth.verifyOtp({
        email,
        token: data.otp,
        type: "email",
      });

      console.log("supaData", supaData);
      console.log("error", error);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Verification successful", {
        description: "Your account has been successfully created.",
      });
      onVerificationComplete();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during verification. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
              <FormDescription>
                Enter the 6-digit OTP sent to{" "}
                <span className="font-bold">{email}</span> to complete your
                registration, or click the magic link in the email.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#34CCFF] hover:bg-[#2AB8E8]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Verifying...</span>
              <span className="animate-spin">⚪</span>
            </>
          ) : (
            <>
              <MailIcon className="mr-2 h-4 w-4" />
              Verify OTP
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
