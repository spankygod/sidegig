import { Redirect } from 'expo-router'
import { authenticatedHomeHref } from '@/lib/route-paths'

export default function IndexScreen() {
  return <Redirect href={authenticatedHomeHref} />
}
