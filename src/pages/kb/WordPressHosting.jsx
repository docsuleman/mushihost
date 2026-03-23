import { KB_CATEGORIES } from '@/data/kbArticles'
import KBCategory from './KBCategory'

export default function WordPressHosting() {
  return <KBCategory category={KB_CATEGORIES.find((c) => c.slug === 'wordpress')} />
}
