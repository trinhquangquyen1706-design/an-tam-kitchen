"use client";

import { ChefHat, Clock, Flame, Sparkles } from "lucide-react";
import Image from "next/image";
import type { FoodItemViewModel } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Recipe = {
  id: string;
  name: string;
  imageUrl: string;
  cookTime: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  matchedIngredients: string[];
  description: string;
};

const RECIPE_DATABASE: Recipe[] = [
  {
    id: "r1",
    name: "Smoothie chuối sữa tươi",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
    cookTime: "5 phút",
    difficulty: "Dễ",
    matchedIngredients: ["sữa tươi", "chuối"],
    description: "Xay nhuyễn sữa tươi với chuối chín và đá viên.",
  },
  {
    id: "r2",
    name: "Mì xào xúc xích rau cải",
    imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop",
    cookTime: "15 phút",
    difficulty: "Dễ",
    matchedIngredients: ["xúc xích", "rau cải"],
    description: "Xào mì với xúc xích thái lát và rau cải xanh.",
  },
  {
    id: "r3",
    name: "Trứng chiên tương cà",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
    cookTime: "10 phút",
    difficulty: "Dễ",
    matchedIngredients: ["trứng", "tương cà"],
    description: "Trứng chiên giòn, ăn kèm tương cà và cơm nóng.",
  },
  {
    id: "r4",
    name: "Soup rau củ thịt bằm",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    cookTime: "25 phút",
    difficulty: "Trung bình",
    matchedIngredients: ["thịt", "rau củ", "cà rốt"],
    description: "Soup ấm nóng với rau củ tươi và thịt bằm mềm.",
  },
  {
    id: "r5",
    name: "Phô mai nướng bánh mì",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop",
    cookTime: "8 phút",
    difficulty: "Dễ",
    matchedIngredients: ["phô mai", "bơ", "bánh mì"],
    description: "Phô mai tan chảy kẹp trong bánh mì nướng giòn.",
  },
];

function findMatchingRecipes(foods: FoodItemViewModel[]): Recipe[] {
  const expiringFoods = foods
    .filter((f) => f.status !== "fresh")
    .map((f) => f.displayName.toLowerCase());

  if (expiringFoods.length === 0) {
    // Return first 3 recipes as default
    return RECIPE_DATABASE.slice(0, 3);
  }

  // Score recipes by how many ingredients match expiring foods
  const scored = RECIPE_DATABASE.map((recipe) => {
    const score = recipe.matchedIngredients.filter((ingredient) =>
      expiringFoods.some((food) =>
        food.includes(ingredient) || ingredient.includes(food.split(" ")[0])
      )
    ).length;
    return { recipe, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.recipe);
}

export function RecipeSuggestions({ foods }: { foods: FoodItemViewModel[] }) {
  const recipes = findMatchingRecipes(foods);
  const hasExpiring = foods.some((f) => f.status !== "fresh");

  return (
    <aside className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ChefHat className="size-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold">Gợi ý bữa tối</h3>
          <p className="text-xs text-muted-foreground">
            {hasExpiring
              ? "Dựa trên thực phẩm sắp hết hạn"
              : "Những món ăn đơn giản hàng ngày"}
          </p>
        </div>
      </div>

      {/* Recipe Cards */}
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}

      {/* AI suggestion hint */}
      <div className="rounded-2xl border border-dashed bg-card/50 p-4 text-center">
        <Sparkles className="mx-auto size-6 text-primary/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          AI sẽ gợi ý thêm công thức dựa trên thực phẩm trong tủ lạnh của bạn.
        </p>
        <p className="mt-1 text-[10px] font-medium text-primary/60">Sắp ra mắt</p>
      </div>
    </aside>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const difficultyColor =
    recipe.difficulty === "Dễ"
      ? "text-emerald-600"
      : recipe.difficulty === "Trung bình"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={recipe.imageUrl}
          alt={recipe.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="20rem"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <h4 className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white">
          {recipe.name}
        </h4>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground">{recipe.description}</p>

        <div className="mt-2 flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3" />
            {recipe.cookTime}
          </span>
          <span className={cn("flex items-center gap-1 font-medium", difficultyColor)}>
            <Flame className="size-3" />
            {recipe.difficulty}
          </span>
        </div>

        {/* Matched ingredients tag */}
        <div className="mt-2 flex flex-wrap gap-1">
          {recipe.matchedIngredients.slice(0, 3).map((ing) => (
            <span
              key={ing}
              className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
