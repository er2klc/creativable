import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  subject: z.string().min(1, "Bitte geben Sie einen Betreff ein"),
  message: z.string().min(1, "Bitte geben Sie eine Nachricht ein"),
});

export const VisitorSupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([
          { 
            email: data.email,
            subject: data.subject,
            message: data.message,
            is_visitor: true
          }
        ]);

      if (error) throw error;

      toast.success("Ihre Nachricht wurde erfolgreich gesendet!");
      reset();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          type="email"
          placeholder="E-Mail Adresse"
          {...register("email")}
          className={cn(
            "bg-[#1A1F2C]/60 border border-white/10 text-white placeholder-gray-400",
            errors.email && "border-red-500"
          )}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message?.toString()}</p>
        )}
      </div>

      <div>
        <Input
          type="text"
          placeholder="Betreff"
          {...register("subject")}
          className={cn(
            "bg-[#1A1F2C]/60 border border-white/10 text-white placeholder-gray-400",
            errors.subject && "border-red-500"
          )}
        />
        {errors.subject && (
          <p className="text-red-500 text-sm mt-1">{errors.subject.message?.toString()}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Ihre Nachricht"
          {...register("message")}
          className={cn(
            "bg-[#1A1F2C]/60 border border-white/10 text-white placeholder-gray-400 min-h-[150px]",
            errors.message && "border-red-500"
          )}
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message.message?.toString()}</p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full relative group bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10"
      >
        <span className="relative z-10">Kontakt versenden</span>
        <div className="absolute -bottom-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Button>
    </form>
  );
};