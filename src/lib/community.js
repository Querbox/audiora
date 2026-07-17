// Community-Funktionen: Listen, Likes, Folgen – alles über Supabase (RLS-gesichert)
import { supabase } from './supabase.js'

// Erkennung: Schema v2 noch nicht eingespielt
export const isMissingSchema = (error) =>
  error && (error.code === 'PGRST205' || /schema cache|does not exist/i.test(error.message || ''))

const mapList = (l) => ({
  id: l.id,
  title: l.title,
  description: l.description,
  curator: l.profiles?.username || 'Unbekannt',
  ownerId: l.owner,
  createdAt: l.created_at,
  itemIds: (l.list_items || []).map((x) => x.item_id),
  likes: (l.list_likes || []).length,
  likedBy: (l.list_likes || []).map((x) => x.user_id),
  db: true,
})

const LIST_SELECT = 'id, title, description, owner, created_at, profiles(username), list_items(item_id), list_likes(user_id)'

export async function fetchCommunityLists() {
  const { data, error } = await supabase
    .from('user_lists')
    .select(LIST_SELECT)
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) throw error
  return data.map(mapList)
}

export async function fetchList(id) {
  const { data, error } = await supabase.from('user_lists').select(LIST_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapList(data) : null
}

export async function fetchMyLists(userId) {
  const { data, error } = await supabase
    .from('user_lists')
    .select('id, title, list_items(item_id)')
    .eq('owner', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((l) => ({ id: l.id, title: l.title, itemIds: (l.list_items || []).map((x) => x.item_id) }))
}

export async function createList(ownerId, title, description = '') {
  const { data, error } = await supabase
    .from('user_lists')
    .insert({ owner: ownerId, title, description })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function deleteList(id) {
  const { error } = await supabase.from('user_lists').delete().eq('id', id)
  if (error) throw error
}

export async function setListItem(listId, itemId, on) {
  const { error } = on
    ? await supabase.from('list_items').insert({ list_id: listId, item_id: itemId })
    : await supabase.from('list_items').delete().eq('list_id', listId).eq('item_id', itemId)
  if (error && error.code !== '23505') throw error // doppeltes Hinzufügen ignorieren
}

export async function setListLike(listId, userId, on) {
  const { error } = on
    ? await supabase.from('list_likes').insert({ list_id: listId, user_id: userId })
    : await supabase.from('list_likes').delete().eq('list_id', listId).eq('user_id', userId)
  if (error && error.code !== '23505') throw error
}

// ── Öffentliche Profile & Folgen ─────────────────────────────────────────
export async function fetchPublicProfile(username) {
  const { data: prof, error } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .eq('username', username)
    .maybeSingle()
  if (error) throw error
  if (!prof) return null

  const [lists, followers, following] = await Promise.all([
    supabase.from('user_lists').select(LIST_SELECT).eq('owner', prof.id).order('created_at', { ascending: false }),
    supabase.from('follows').select('follower').eq('followed', prof.id),
    supabase.from('follows').select('followed').eq('follower', prof.id),
  ])
  return {
    ...prof,
    lists: (lists.data || []).map(mapList),
    followers: (followers.data || []).map((f) => f.follower),
    following: (following.data || []).map((f) => f.followed),
  }
}

export async function setFollow(followerId, followedId, on) {
  const { error } = on
    ? await supabase.from('follows').insert({ follower: followerId, followed: followedId })
    : await supabase.from('follows').delete().eq('follower', followerId).eq('followed', followedId)
  if (error && error.code !== '23505') throw error
}
