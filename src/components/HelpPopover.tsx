import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HelpItem {
  term: string;
  description: string;
}

interface HelpPopoverProps {
  items: HelpItem[];
}

export default function HelpPopover({ items }: HelpPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <dl className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.term}>
              <dt className="font-medium">{item.term}</dt>
              <dd className="text-muted-foreground">{item.description}</dd>
            </div>
          ))}
        </dl>
      </PopoverContent>
    </Popover>
  );
}
