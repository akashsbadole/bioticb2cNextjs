"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminMedia } from "./AdminMedia";
import { Image as ImageIcon, XIcon } from "lucide-react";

interface MediaPickerFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MediaPickerField({
  label,
  value,
  onChange,
  placeholder,
}: MediaPickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Browse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Select Media</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <AdminMedia onSelect={handleSelect} />
            </div>
          </DialogContent>
        </Dialog>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-rose-600 hover:text-rose-700"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <div className="mt-2 rounded-md overflow-hidden border border-input max-w-xs">
          <img
            src={value}
            alt="Preview"
            className="object-cover w-full h-32"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}