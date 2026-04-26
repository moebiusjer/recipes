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
    <Link to={`/recipe/${id}`} className="recipe-card-link">
      <article className="recipe-card">
        <ImageWithFallback src={image} alt={title} className="recipe-card-image" />
        <div className="recipe-card-body">
          <h3>{title}</h3>
          <div className="recipe-card-meta">
            <span><Clock size={16} /> {cookTime}</span>
            <span><Users size={16} /> {servings}</span>
            {likes > 0 ? <span><Heart size={16} /> {likes}</span> : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
