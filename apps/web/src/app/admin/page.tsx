"use client"

import React, { useState } from 'react'
import { useWebSocket } from '@web/hooks/useWebSocket'
import { DuoLeaderboard } from '@web/components/DuoLeaderboard'
export default function AdminPage() {
  const { leaderboardTotal } = useWebSocket()
  const [token, setToken] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [userId, setUserId] = useState('')
  const [fullname, setFullname] = useState('')
  const [group, setGroup] = useState('')
  const [rd1, setRd1] = useState('')
  const [rd2, setRd2] = useState('')
  const [rd3, setRd3] = useState('')
  const [physical, setPhysical] = useState('')
  const [lockFromSync, setLockFromSync] = useState(true)
  const [mode, setMode] = useState<'set' | 'add'>('set')
  const [status, setStatus] = useState('')

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  const row: Record<string, unknown> = { userId, source: lockFromSync ? 'manual' : 'mysql', mode }

  if (fullname.trim() !== '') row.fullname = fullname
  if (rd1.trim() !== '') row.rd1 = Number(rd1)
  if (rd2.trim() !== '') row.rd2 = Number(rd2)
  if (rd3.trim() !== '') row.rd3 = Number(rd3)
  if (physical.trim() !== '') row.physical = Number(physical)
  if (group.trim() !== '') row.group = group

  setStatus('saving')
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/leaderboard`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify([row])
    })
    if (res.ok) setStatus('saved')
    else setStatus(`error ${res.status}`)
  } catch (err) {
    setStatus('network error')
  }
}

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault()
    setStatus('verifying')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verify`, {
        method: 'POST',
        headers: {
          'x-admin-token': token
        }
      })
      if (res.ok) {
        setIsAuthed(true)
        setStatus('verified')
        try { sessionStorage.setItem('admin_token', token) } catch {}
      } else {
        setStatus('invalid token')
      }
    } catch (err) {
      setStatus('network error')
    }
  }

  return (
    <div style={{padding:20}}>
      <h1>Admin panel</h1>
      <p>Enter admin token and edit leaderboard.</p>

      {!isAuthed ? (
        <form onSubmit={handleVerify} style={{display:'grid',gap:8,maxWidth:480}}>
          <input type="password" placeholder="admin token" value={token} onChange={e=>setToken(e.target.value)} />
          <div>
            <button type="submit">Verify</button>
            <span style={{marginLeft:12}}>{status}</span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} style={{display:'grid',gap:8,maxWidth:480}}>
        <input placeholder="userId (idnumber)" value={userId} onChange={e=>setUserId(e.target.value)} />
        <input placeholder="group" value={group} onChange={e=>setGroup(e.target.value)} />
        <input placeholder="fullname" value={fullname} onChange={e=>setFullname(e.target.value)} />
        <input placeholder="rd1" value={rd1} onChange={e=>setRd1(e.target.value)} />
        <input placeholder="rd2" value={rd2} onChange={e=>setRd2(e.target.value)} />
        <input placeholder="rd3" value={rd3} onChange={e=>setRd3(e.target.value)} />
        <input placeholder="physical" value={physical} onChange={e=>setPhysical(e.target.value)} />
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
          <input type="checkbox" checked={lockFromSync} onChange={e=>setLockFromSync(e.target.checked)} />
          Lock from MySQL sync
        </label>
        <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
          <input type="checkbox" checked={mode === 'add'} onChange={e=>setMode(e.target.checked ? 'add' : 'set')} />
          Add to existing score (unchecked = replace)
        </label>
          <div>
            <button type="submit">Save</button>
            <span style={{marginLeft:12}}>{status}</span>
          </div>
      </form>
      )}

      <hr style={{margin:'24px 0'}} />

      <h2>Current total leaderboard</h2>
      <DuoLeaderboard />
    </div>
  )
}