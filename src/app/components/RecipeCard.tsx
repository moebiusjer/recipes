import { Link } from "react-router";
import { Clock, Users, Heart } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  likes?: number;
}

export function RecipeCard({ id, title, image, cookTime, servings, likes = 0 }: RecipeCardProps) {
  return (
    <Link to={`/recipe/${id}`} className="group block">
      <div className="bg-orange-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {cookTime}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {servings}
            </div>
            {likes > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                {likes}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
