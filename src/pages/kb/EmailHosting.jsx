import { KB_CATEGORIES } from '@/data/kbArticles'
import KBCategory from './KBCategory'

export default function EmailHosting() {
  return <KBCategory category={KB_CATEGORIES.find((c) => c.slug === 'email')} />
}
