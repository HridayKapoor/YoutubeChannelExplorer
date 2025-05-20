
import { useState } from "react";
import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CategoryListProps {
  categories: Category[];
  onCreateCategory: (title: string) => void;
  onSelectCategory: (category: Category) => void;
}

export default function CategoryList({ categories, onCreateCategory, onSelectCategory }: CategoryListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryTitle.trim()) {
      onCreateCategory(newCategoryTitle);
      setNewCategoryTitle("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setIsDialogOpen(true)}>Create Category</Button>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="outline"
            className="justify-start h-auto p-4"
            onClick={() => onSelectCategory(category)}
          >
            <div className="text-left">
              <h3 className="font-medium">{category.title}</h3>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Category name"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
            />
            <Button onClick={handleCreateCategory}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
