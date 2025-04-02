
import React from 'react';
import { Check, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Item {
  id: string;
  name: string;
}

interface TopicSelectorProps {
  label: string;
  placeholder: string;
  items: Item[] | undefined | null;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ 
  label, 
  placeholder, 
  items = [], 
  value, 
  onChange, 
  disabled = false,
  required = false
}) => {
  const [open, setOpen] = React.useState(false);
  
  // Ensure items is always a valid array
  const safeItems: Item[] = Array.isArray(items) ? items : [];
  
  // Find the selected item, with safe checking
  const selectedItem = value ? safeItems.find(item => item.id === value) : undefined;
  const displayText = selectedItem?.name || placeholder;
  
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="w-full flex justify-between items-center px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
            disabled={disabled}
          >
            {displayText}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Pesquisar ${label.toLowerCase()}...`} />
            <CommandEmpty>Nenhum {label.toLowerCase()} encontrado.</CommandEmpty>
            <CommandGroup>
              {safeItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  {item.name}
                  {value === item.id && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TopicSelector;
