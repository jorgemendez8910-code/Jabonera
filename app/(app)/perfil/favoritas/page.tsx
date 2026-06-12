import { getFavoriteRecipes } from '@/lib/favorites'
import { FavoritasScreen } from './FavoritasScreen'

export default async function FavoritasPage() {
  const recipes = await getFavoriteRecipes()
  return <FavoritasScreen recipes={recipes} />
}
