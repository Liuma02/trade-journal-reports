import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTrades } from "@/contexts/TradeContext";

interface TagManagerProps {
  tradeId: string;
  currentTags: string[];
  variant?: 'compact' | 'full';
}

export function TagManager({ tradeId, currentTags, variant = 'compact' }: TagManagerProps) {
  const { customTags, updateTrade, addCustomTag } = useTrades();
  const [newTag, setNewTag] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim().toUpperCase();
    
    if (!currentTags.includes(normalizedTag)) {
      updateTrade(tradeId, { tags: [...currentTags, normalizedTag] });
    }
    
    if (!customTags.includes(normalizedTag)) {
      addCustomTag(normalizedTag);
    }
    
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateTrade(tradeId, { tags: currentTags.filter(t => t !== tagToRemove) });
  };

  const availableTags = customTags.filter(tag => !currentTags.includes(tag));

  if (variant === 'compact') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <TagIcon className="w-3 h-3" />
            {currentTags.length > 0 ? currentTags.length : '+'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {currentTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs gap-1 pr-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-loss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {availableTags.slice(0, 6).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-primary/20"
                    onClick={() => handleAddTag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(newTag);
                  }
                }}
              />
              <Button 
                size="sm" 
                className="h-8 px-2"
                onClick={() => handleAddTag(newTag)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {currentTags.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-loss"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {availableTags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/20"
              onClick={() => handleAddTag(tag)}
            >
              + {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Create new tag..."
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTag(newTag);
            }
          }}
        />
        <Button onClick={() => handleAddTag(newTag)}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
