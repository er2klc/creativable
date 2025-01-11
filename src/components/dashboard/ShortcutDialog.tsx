import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { ShortcutType } from "@/hooks/use-shortcuts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ShortcutFormData {
  type: ShortcutType;
  title: string;
  target_id?: string;
}

interface ShortcutDialogProps {
  trigger: React.ReactNode;
  onSubmit: (data: ShortcutFormData) => void;
}

export const ShortcutDialog = ({ trigger, onSubmit }: ShortcutDialogProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<ShortcutFormData>();
  const selectedType = form.watch("type");

  const { data: teams = [] } = useQuery({
    queryKey: ["user-teams"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: userTeams } = await supabase.rpc("get_user_teams", {
        uid: user.id,
      });

      return userTeams || [];
    },
  });

  const handleSubmit = (data: ShortcutFormData) => {
    onSubmit(data);
    setOpen(false);
    form.reset();
  };

  const needsTeamSelection = selectedType === "team" || selectedType === "team_calendar";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Shortcut</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shortcut type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="team_calendar">Team Calendar</SelectItem>
                      <SelectItem value="personal_calendar">Personal Calendar</SelectItem>
                      <SelectItem value="create_contact">Create Contact</SelectItem>
                      <SelectItem value="learning_platform">Learning Platform</SelectItem>
                      <SelectItem value="todo_list">To Do List</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter shortcut title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsTeamSelection && (
              <FormField
                control={form.control}
                name="target_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit">Add Shortcut</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};