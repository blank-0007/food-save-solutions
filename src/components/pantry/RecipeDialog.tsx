import { useEffect, useState } from "react";
import { ChefHat, Clock, Gauge, Leaf, Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateRecipe, type FoodItem, type Recipe } from "@/lib/pantry";

export function RecipeDialog({
  item,
  onOpenChange,
}: {
  item: FoodItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!item) {
      setRecipe(null);
      return;
    }
    setRecipe(null);
    const t = setTimeout(() => setRecipe(generateRecipe(item)), 1800);
    return () => clearTimeout(t);
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ChefHat className="h-6 w-6 text-primary" /> Chef AI
          </DialogTitle>
          <DialogDescription>
            A sustainable recipe built around {item?.name ?? "your ingredient"}.
          </DialogDescription>
        </DialogHeader>

        {!recipe ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-base font-medium">
              Chef AI is whipping up a sustainable recipe…
            </p>
            <p className="text-sm text-muted-foreground">
              Balancing flavour, pantry staples and zero waste.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold leading-snug">{recipe.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {recipe.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { Icon: Clock, label: "Prep time", value: recipe.prepTime },
                { Icon: Gauge, label: "Difficulty", value: recipe.difficulty },
                { Icon: Users, label: "Serves", value: recipe.servings },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3"
                >
                  <m.Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold">{m.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h3 className="text-lg font-semibold">Ingredients</h3>
              <ul className="mt-3 space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={ing.text}
                    className={
                      ing.highlight
                        ? "flex items-center gap-2 rounded-lg bg-warn px-3 py-2 text-sm font-semibold text-warn-foreground"
                        : "flex items-center gap-2 px-3 py-1.5 text-sm"
                    }
                  >
                    <Leaf className="h-4 w-4 shrink-0 opacity-70" />
                    <span>{ing.text}</span>
                    {ing.highlight && (
                      <Badge variant="secondary" className="ml-auto rounded-full text-[11px]">
                        Use first
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Method</h3>
              <ol className="mt-3 space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed sm:text-base">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
