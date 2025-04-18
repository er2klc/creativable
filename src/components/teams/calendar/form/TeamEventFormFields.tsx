import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { DateSelector } from "@/components/calendar/appointment-dialog/DateSelector";
import * as z from "zod";
import { formSchema } from "../TeamEventForm";

interface TeamEventFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onEndDateSelect: (date: Date | null) => void;
  endDate: Date | null;
}

export const TeamEventFormFields = ({ 
  form, 
  selectedDate, 
  onDateSelect,
  onEndDateSelect,
  endDate 
}: TeamEventFormFieldsProps) => {
  const isMultiDay = form.watch("is_multi_day");

  return (
    <>
      <FormField
        control={form.control}
        name="is_multi_day"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Mehrtägiges Event
              </FormLabel>
              <FormDescription>
                Event erstreckt sich über mehrere Tage
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {isMultiDay ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel>Startdatum</FormLabel>
            <DateSelector 
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
            />
          </div>
          <div>
            <FormLabel>Enddatum</FormLabel>
            <DateSelector 
              selectedDate={endDate}
              onDateSelect={onEndDateSelect}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormLabel>Datum</FormLabel>
            <DateSelector 
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
            />
          </div>
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endzeit (optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titel</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Beschreibung</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="recurring_pattern"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Wiederholung</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie ein Muster" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Keine Wiederholung</SelectItem>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly">Wöchentlich</SelectItem>
                <SelectItem value="monthly">Monatlich</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="is_admin_only"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Admin-Termin
                </FormLabel>
                <FormDescription>
                  Nur für Team-Admins sichtbar
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_team_event"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Team-Event
                </FormLabel>
                <FormDescription>
                  Wichtiges Team-Event
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Farbe</FormLabel>
            <FormControl>
              <Input type="color" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};