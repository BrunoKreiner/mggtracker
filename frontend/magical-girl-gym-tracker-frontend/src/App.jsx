import { useState, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Sparkles, Heart, Star, Dumbbell, Trophy, Zap } from 'lucide-react'
import './App.css'
import banner from './assets/banner.png'
import buffguys from './assets/buffguys.png'
import girlwithdumbbell from './assets/girlwithdumbbell.png'
import magicalman from './assets/magicalman.png'
import twogirlsflexing from './assets/twogirlsflexing.png'

// API configuration with production support
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all')
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [user, setUser] = useState(null)
  const [starting, setStarting] = useState(false)
  const [workoutName, setWorkoutName] = useState('Workout')
  const MUSCLE_GROUPS = [
    'Chest','Back','Shoulders','Biceps','Triceps','Forearms','Core','Obliques','Lower Back','Quadriceps','Hamstrings','Glutes','Calves','Hip Adductors','Hip Abductors','Traps','Lats','Neck','Full Body','Cardio','Other'
  ]
  const DIFFICULTIES = ['beginner','intermediate','advanced']
  const [newExercise, setNewExercise] = useState({ name: '', muscle_group: 'Chest', equipment: '', allowed_fields: ['reps','weight'] })
  const [autoAddToWorkout, setAutoAddToWorkout] = useState(true)
  const [setInputs, setSetInputs] = useState({}) // { [workoutExerciseId]: { mode, reps, weight, duration, distance, rest_time } }
  const [pastWorkouts, setPastWorkouts] = useState([])
  const [loadingPast, setLoadingPast] = useState(false)
  const [setOverrides, setSetOverrides] = useState({})
  const [showAddExercisePicker, setShowAddExercisePicker] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [workoutEdit, setWorkoutEdit] = useState({ notes: '' })
  const [modalSetEdits, setModalSetEdits] = useState({})
  const [imageBoard, setImageBoard] = useState([])
  const [profilePic, setProfilePic] = useState(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePersistError, setImagePersistError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [authToken, setAuthToken] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const persistTimerRef = useRef(null)
  const particleSeq = useRef(0)
  const [particles, setParticles] = useState([])
  const imageUploadRef = useRef(null)
  const workoutImageUploadRef = useRef(null)
  const modalImageUploadRef = useRef(null)
  const profilePicInputRef = useRef(null)

  // Helper to build a user-scoped localStorage key
  const keyFor = (base) => {
    if (user?.id) return `${base}:${user.id}`
    if (user?.username) return `${base}:${user.username}`
    return `${base}:guest`
  }

  // Crazy decora: timeframe, glitter particles, and calculator inputs
  const [timeframeDays, setTimeframeDays] = useState(30)
  const [glitterCount, setGlitterCount] = useState(48)
  const [glitterEnabled, setGlitterEnabled] = useState(true)
  const [calc, setCalc] = useState({ weight: '', reps: '', bw: '', proteinFactor: 1.6 })
  const [pastFilterDays, setPastFilterDays] = useState(30)
  const [pastShown, setPastShown] = useState(5)
  const [exercisesShown, setExercisesShown] = useState(9)
  const [exerciseQuery, setExerciseQuery] = useState('')
  const glitterPrefLoaded = useRef(false)

  useEffect(() => {
    // Load persisted auth and glitter prefs on startup
    try {
      const token = localStorage.getItem('authToken')
      const userDataRaw = localStorage.getItem('userData')
      const parsedUser = userDataRaw ? JSON.parse(userDataRaw) : null
      if (token && parsedUser) {
        setAuthToken(token)
        setUser(parsedUser)
      } else {
        setShowAuthModal(true)
      }
      
      const se = localStorage.getItem('glitterEnabled')
      if (se !== null) setGlitterEnabled(se === 'true')
      const sc = localStorage.getItem('glitterCount')
      if (sc !== null) setGlitterCount(Number(sc))

      const keyFrom = (base) => {
        if (parsedUser?.id) return `${base}:${parsedUser.id}`
        if (parsedUser?.username) return `${base}:${parsedUser.username}`
        return `${base}:guest`
      }

      const imgKey = keyFrom('imageBoard')
      const scopedImg = localStorage.getItem(imgKey)
      const legacyImg = localStorage.getItem('imageBoard')
      if (scopedImg) setImageBoard(JSON.parse(scopedImg))
      else if (legacyImg) { setImageBoard(JSON.parse(legacyImg)); localStorage.setItem(imgKey, legacyImg) }

      // Prefer server-provided profile_picture; fall back to local storage
      const picKey = keyFrom('profilePic')
      const scopedPic = localStorage.getItem(picKey)
      const legacyPic = localStorage.getItem('profilePic')
      const serverPic = parsedUser?.profile_picture
      if (serverPic) setProfilePic(serverPic)
      else if (scopedPic) setProfilePic(scopedPic)
      else if (legacyPic) { setProfilePic(legacyPic); localStorage.setItem(picKey, legacyPic) }
    } catch {}
    glitterPrefLoaded.current = true
    setImageLoaded(true)
  }, [])

  useEffect(() => {
    // Restore active workout from API if available
    const saved = async () => {
      if (authToken) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/workouts/active`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          if (response.status === 204) { setActiveWorkout(null); return }
          const data = await response.json()
          if (data) setActiveWorkout(data)
        } catch {}
      }
    }
    saved()
  }, [authToken])

  useEffect(() => {
    // Persist active workout to API while in progress
    if (activeWorkout && !activeWorkout.end_time && activeWorkout.id && authToken) {
      const save = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/workouts/${activeWorkout.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(activeWorkout)
          })
          await response.json()
        } catch {}
      }
      save()
    }
  }, [activeWorkout, authToken])

  useEffect(() => {
    // Load persisted glitter preferences and profile picture
    try {
      localStorage.setItem('glitterEnabled', String(glitterEnabled))
      localStorage.setItem('glitterCount', String(glitterCount))
      const picKey = keyFor('profilePic')
      if (profilePic) localStorage.setItem(picKey, profilePic)
      else localStorage.removeItem(picKey)
    } catch {}
  }, [glitterEnabled, glitterCount, profilePic])

  useEffect(() => {
    // Persist image board to localStorage with error surfacing
    // Skip saving during initial load to prevent overwriting stored data
    if (!imageLoaded) return
    try {
      const imgKey = keyFor('imageBoard')
      localStorage.setItem(imgKey, JSON.stringify(imageBoard))
      setImagePersistError(false)
    } catch (e) {
      console.warn('Failed to persist imageBoard', e)
      setImagePersistError(true)
    }
  }, [imageBoard, imageLoaded])

  useEffect(() => {
    // Respect reduced motion preference: turn off continuous glitter by default (unless user has saved preference)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = (m) => { if (m.matches && !glitterPrefLoaded.current) setGlitterEnabled(false) }
    apply(media)
    const onChange = (e) => apply(e)
    try { media.addEventListener('change', onChange) } catch { media.addListener(onChange) }
    return () => { try { media.removeEventListener('change', onChange) } catch { media.removeListener(onChange) } }
  }, [])

  useEffect(() => {
    // Load set overrides for this active workout
    if (activeWorkout?.id) {
      const key = `setOverrides:${activeWorkout.id}`
      const saved = localStorage.getItem(key)
      if (saved) {
        try { setSetOverrides(JSON.parse(saved)) } catch { setSetOverrides({}) }
      } else {
        setSetOverrides({})
      }
    } else {
      setSetOverrides({})
    }
  }, [activeWorkout?.id])

  useEffect(() => {
    // Persist set overrides per active workout (debounced)
    if (!activeWorkout?.id) return
    const key = `setOverrides:${activeWorkout.id}`
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(setOverrides)) } catch {}
    }, 200)
    return () => {
      if (persistTimerRef.current) { clearTimeout(persistTimerRef.current); persistTimerRef.current = null }
    }
  }, [setOverrides, activeWorkout?.id])

  useEffect(() => {
    // Fetch exercises on mount
    fetchExercises()
  }, [])

  useEffect(() => {
    // Load/migrate per-user scoped UI state when user changes
    if (!user) { setImageBoard([]); setProfilePic(null); return }
    try {
      const imgKey = keyFor('imageBoard')
      const scopedImg = localStorage.getItem(imgKey)
      
      // Only migrate legacy images if this is the first time for this user AND no scoped data exists
      if (scopedImg) {
        setImageBoard(JSON.parse(scopedImg))
      } else {
        // For new users or users without scoped data, start with empty board
        setImageBoard([])
        // Save empty state to prevent future legacy migration
        localStorage.setItem(imgKey, JSON.stringify([]))
      }

      const picKey = keyFor('profilePic')
      const scopedPic = localStorage.getItem(picKey)
      const legacyPic = localStorage.getItem('profilePic')
      // Do not override a server-provided profile picture
      if (!user.profile_picture) {
        if (scopedPic) setProfilePic(scopedPic)
        else if (legacyPic) { setProfilePic(legacyPic); localStorage.setItem(picKey, legacyPic) }
        else setProfilePic(null)
      }
    } catch {}
  }, [user?.id])

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exercises`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setExercises(data)
      console.log(`Loaded ${data.length} exercises`)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setExercises([]) // Ensure empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchPastWorkouts = async (token) => {
    setLoadingPast(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user?.id}/workouts`, {
        headers: { 'Authorization': `Bearer ${token || authToken}` }
      })
      if (response.status === 200) {
        const data = await response.json()
        setPastWorkouts(Array.isArray(data) ? data : [])
      } else {
        setPastWorkouts([])
      }
    } catch (e) {
      console.error('Error fetching past workouts:', e)
    } finally {
      setLoadingPast(false)
    }
  }

  useEffect(() => {
    // Fetch past workouts when auth token and user become available
    if (authToken && user?.id) fetchPastWorkouts(authToken)
    else setPastWorkouts([])
  }, [authToken, user?.id])

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    
    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password,
          email: authForm.email
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setAuthToken(data.access_token)
        setUser(data.user)
        if (data.user.profile_picture) {
          setProfilePic(data.user.profile_picture)
        }
        localStorage.setItem('authToken', data.access_token)
        localStorage.setItem('userData', JSON.stringify(data.user))
        setShowAuthModal(false)
        setAuthForm({ username: '', password: '', email: '' })
        // Preload past workouts after login
        fetchPastWorkouts(data.access_token)
      } else {
        setAuthError(data.message || 'Authentication failed')
      }
    } catch (error) {
      setAuthError('Network error. Please try again.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAuthToken(null)
    setProfilePic(null)
    setImageBoard([])
    setPastWorkouts([])
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setShowAuthModal(true)
  }

  const updateProfilePicture = async (dataUrl) => {
    if (!authToken) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ profile_picture: dataUrl })
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
        setProfilePic(updatedUser.profile_picture)
        localStorage.setItem('userData', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error)
    }
  }

  const onProfilePicChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type?.startsWith('image/')) { e.target.value = ''; return }
    const reader = new FileReader()
    reader.onload = (ev) => { 
      const dataUrl = ev.target?.result || null
      updateProfilePicture(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleStartWorkout = async () => {
    if (!user) return
    setStarting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ user_id: user.id, name: workoutName || 'Workout' })
      })
      const workout = await response.json()
      setActiveWorkout(workout)
    } catch (e) {
      console.error('Failed to start workout', e)
    } finally {
      setStarting(false)
    }
  }

  const handleEndWorkout = async () => {
    if (!activeWorkout) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${activeWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ notes: activeWorkout.notes || '' })
      })
      await response.json()
      setActiveWorkout(null)
    } catch (e) {
      console.error('Failed to end workout', e)
    }
  }

  const handleAddExercise = async (exerciseId) => {
    if (!activeWorkout) {
      alert('Start a workout first!')
      return
    }
    try {
      const order = (activeWorkout.exercises?.length || 0) + 1
      const response = await fetch(`${API_BASE_URL}/api/workouts/${activeWorkout.id}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ exercise_id: exerciseId, order_in_workout: order })
      })
      const we = await response.json()
      setActiveWorkout(prev => ({ ...prev, exercises: [...(prev?.exercises || []), we] }))
    } catch (e) {
      console.error('Failed to add exercise to workout', e)
    }
  }

  const updateSetInput = (weId, patch) => {
    setSetInputs(prev => ({
      ...prev,
      [weId]: {
        reps: '', weight: '', duration: '', distance: '', rest_time: '',
        ...prev[weId],
        ...patch,
      }
    }))
  }

  const decoratedSet = (s) => ({ ...s, ...(setOverrides[s.id] || {}) })
  const updateSetOverride = (setId, patch) => {
    setSetOverrides(prev => ({ ...prev, [setId]: { ...(prev[setId] || {}), ...patch } }))
  }
  const toggleSetDone = (setId) => {
    setSetOverrides(prev => ({ ...prev, [setId]: { ...(prev[setId] || {}), done: !prev[setId]?.done } }))
  }

  const handleAddSet = async (we) => {
    const input = setInputs[we.id] || {}
    const payload = {
      set_number: (we.sets?.length || 0) + 1,
      set_type: 'normal',
    }

    const getAllowed = () => {
      try {
        const instr = we.exercise?.instructions
        if (!instr) return ['reps','weight']
        const parsed = typeof instr === 'string' ? JSON.parse(instr) : instr
        if (Array.isArray(parsed.allowed_fields) && parsed.allowed_fields.length) return parsed.allowed_fields
        return ['reps','weight']
      } catch { return ['reps','weight'] }
    }
    const allowed = getAllowed()

    if (allowed.includes('reps') && input.reps !== undefined && input.reps !== '') payload.reps = Number(input.reps) || 0
    if (allowed.includes('weight') && input.weight !== undefined && input.weight !== '') payload.weight = Number(input.weight) || 0
    if (allowed.includes('duration') && input.duration !== undefined && input.duration !== '') payload.duration = Number(input.duration) || 0
    if (allowed.includes('distance') && input.distance !== undefined && input.distance !== '') payload.distance = Number(input.distance) || 0
    if (input.rest_time !== undefined && input.rest_time !== '') payload.rest_time = Number(input.rest_time) || 0

    try {
      const response = await fetch(`${API_BASE_URL}/api/workout-exercises/${we.id}/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload),
      })
      const newSet = await response.json()
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map(x => x.id === we.id ? { ...x, sets: [...(x.sets || []), newSet] } : x)
      }))
      setSetInputs(prev => ({ ...prev, [we.id]: { reps: '', weight: '', duration: '', distance: '', rest_time: '' } }))
    } catch (e) {
      console.error('Failed to add set', e)
    }
  }

  const handleCreateExercise = async (e) => {
    e.preventDefault()
    if (!newExercise.name) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newExercise.name,
          muscle_group: newExercise.muscle_group,
          equipment: newExercise.equipment,
          instructions: JSON.stringify({ allowed_fields: newExercise.allowed_fields || ['reps','weight'] }),
          created_by: user?.id || null
        }),
      })
      const ex = await response.json()
      await fetchExercises()
      if (activeWorkout && autoAddToWorkout) {
        await handleAddExercise(ex.id)
      }
      setNewExercise({ name: '', muscle_group: 'Chest', equipment: '', allowed_fields: ['reps','weight'] })
    } catch (e) {
      console.error('Failed to create exercise', e)
    }
  }

  const handleDeleteWorkoutExercise = async (weId) => {
    if (!activeWorkout) return
    try {
      await fetch(`${API_BASE_URL}/api/workout-exercises/${weId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } })
      const delWe = activeWorkout.exercises?.find(x => x.id === weId)
      const delSetIds = new Set((delWe?.sets || []).map(s => s.id))
      setActiveWorkout(prev => ({
        ...prev,
        exercises: (prev?.exercises || []).filter(x => x.id !== weId)
      }))
      setSetOverrides(prev => {
        if (!delSetIds.size) return prev
        const next = { ...prev }
        for (const id of delSetIds) delete next[id]
        return next
      })
      setSetInputs(prev => {
        const next = { ...prev }
        delete next[weId]
        return next
      })
    } catch (e) {
      console.error('Failed to delete workout exercise', e)
    }
  }

  const handleDeleteSet = async (weId, setId) => {
    try {
      await fetch(`${API_BASE_URL}/api/sets/${setId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } })
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map(we => {
          if (we.id !== weId) return we
          const remaining = (we.sets || []).filter(s => s.id !== setId)
          const renumbered = remaining.map((s, idx) => ({ ...s, set_number: idx + 1 }))
          return { ...we, sets: renumbered }
        })
      }))
      setSetOverrides(prev => {
        const next = { ...prev }
        delete next[setId]
        return next
      })
    } catch (e) {
      console.error('Failed to delete set', e)
    }
  }

  const saveWorkoutEdits = async () => {
    if (!selectedWorkout) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/workouts/${selectedWorkout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ notes: workoutEdit.notes || '' }),
      })
      const updated = await response.json()
      setPastWorkouts(prev => (prev || []).map(w => w.id === updated.id ? { ...w, notes: updated.notes } : w))
      if (activeWorkout?.id === updated.id) {
        setActiveWorkout(prev => ({ ...(prev || {}), notes: updated.notes }))
      }
      closeWorkoutModal()
    } catch (e) {
      console.error('Failed to update workout', e)
    }
  }

  const saveModalSet = async (setId) => {
    const raw = modalSetEdits[setId]
    if (!raw || Object.keys(raw).length === 0) return
    const payload = {}
    for (const k of ['reps','weight','duration','distance','rest_time','set_type','notes']) {
      if (raw[k] !== undefined) {
        if (['reps','duration','rest_time'].includes(k)) payload[k] = Number(raw[k])
        else if (['weight','distance'].includes(k)) payload[k] = Number(raw[k])
        else payload[k] = raw[k]
      }
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/sets/${setId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload),
      })
      const updated = await response.json()
      // Update selectedWorkout snapshot
      setSelectedWorkout(prev => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: (prev.exercises || []).map(we => ({
            ...we,
            sets: (we.sets || []).map(s => s.id === updated.id ? { ...s, ...updated } : s)
          }))
        }
      })
      // Update pastWorkouts list
      setPastWorkouts(prev => (prev || []).map(w => {
        if (w.id !== selectedWorkout?.id) return w
        return {
          ...w,
          exercises: (w.exercises || []).map(we => ({
            ...we,
            sets: (we.sets || []).map(s => s.id === updated.id ? { ...s, ...updated } : s)
          }))
        }
      }))
      // Update activeWorkout if editing the active session
      if (activeWorkout?.id === selectedWorkout?.id) {
        setActiveWorkout(prev => ({
          ...(prev || {}),
          exercises: (prev?.exercises || []).map(we => ({
            ...we,
            sets: (we.sets || []).map(s => s.id === updated.id ? { ...s, ...updated } : s)
          }))
        }))
      }
      // Clear local edits for this set
      setModalSetEdits(prev => { const next = { ...prev }; delete next[setId]; return next })
    } catch (e) {
      console.error('Failed to update set', e)
    }
  }

  const closeWorkoutModal = (updateHash = true) => {
    setWorkoutModalOpen(false)
    setSelectedWorkout(null)
    setModalSetEdits({})
    if (updateHash && window.location.hash.startsWith('#workout-')) {
      window.location.hash = ''
    }
  }

  const promptAndAddImage = (workoutId = null) => {
    const url = window.prompt('Paste image URL')
    if (url) addImageToBoard(url, workoutId)
  }

  // Downscale and compress images to keep within localStorage limits
  const resizeImageFile = (file, maxDim = 896, quality = 0.72) => new Promise((resolve, reject) => {
    try {
      const objectUrl = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const { width, height } = img
        let targetW = width
        let targetH = height
        if (width > height && width > maxDim) {
          targetW = maxDim
          targetH = Math.round(height * (maxDim / width))
        } else if (height >= width && height > maxDim) {
          targetH = maxDim
          targetW = Math.round(width * (maxDim / height))
        }
        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, targetW, targetH)
        try {
          let dataUrl = canvas.toDataURL('image/webp', quality)
          if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality)
          }
          resolve(dataUrl)
        } catch (err) {
          reject(err)
        } finally {
          URL.revokeObjectURL(objectUrl)
        }
      }
      img.onerror = (ev) => { URL.revokeObjectURL(objectUrl); reject(ev) }
      img.src = objectUrl
    } catch (err) { reject(err) }
  })

  const addFilesToBoard = async (fileList, workoutId = null) => {
    if (!fileList || !fileList.length) return
    for (const file of Array.from(fileList).slice(0, 12)) {
      if (!file.type?.startsWith('image/')) continue
      try {
        const dataUrl = await resizeImageFile(file)
        addImageToBoard(dataUrl, workoutId)
      } catch {
        // Fallback: store raw DataURL if resize fails
        const reader = new FileReader()
        reader.onload = (e) => { addImageToBoard(e.target?.result, workoutId) }
        reader.readAsDataURL(file)
      }
    }
  }

  const addImageToBoard = (url, workoutId = null) => {
    if (!url) return
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, url, workoutId, ts: Date.now() }
    setImageBoard(prev => [item, ...prev].slice(0, 200))
  }

  const formatShortDate = (ts) => {
    try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } catch { return '' }
  }

  const closeImageModal = () => { setImageModalOpen(false); setSelectedImage(null) }

  const filteredExercises = useMemo(() => {
    const base = selectedMuscleGroup === 'all'
      ? exercises
      : exercises.filter(exercise => (exercise.muscle_group || '').toLowerCase() === selectedMuscleGroup.toLowerCase())
    const q = (exerciseQuery || '').trim().toLowerCase()
    if (!q) return base
    return base.filter(ex => (
      (ex.name || '').toLowerCase().includes(q)
      || (ex.muscle_group || '').toLowerCase().includes(q)
      || (ex.equipment || '').toLowerCase().includes(q)
      || (ex.difficulty || '').toLowerCase().includes(q)
    ))
  }, [exercises, selectedMuscleGroup, exerciseQuery])

  const muscleGroups = useMemo(() => ['all', ...new Set(exercises.map(ex => ex.muscle_group))], [exercises])

  // Animated glitter items
  const glitterItems = useMemo(() => (
    Array.from({ length: glitterCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 16 + Math.round(Math.random() * 12),
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      glyph: i % 4 === 0 ? '★' : i % 4 === 1 ? '✦' : i % 4 === 2 ? '♥' : '✧',
      color: i % 3 === 0 ? 'text-pink-400' : i % 3 === 1 ? 'text-purple-400' : 'text-rose-300',
      isAlt: i % 5 === 0,
    }))
  ), [glitterCount])

  // Stats for right sidebar
  const stats = useMemo(() => {
    const now = Date.now()
    const cutoff = now - timeframeDays * 24 * 60 * 60 * 1000
    const ws = (pastWorkouts || []).filter(w => {
      const t = w?.start_time ? new Date(w.start_time).getTime() : 0
      return t >= cutoff
    })
    const totals = { workouts: ws.length, sets: 0, reps: 0, weight: 0, heaviest: 0, durationMin: 0 }
    const muscle = new Map()
    ws.forEach(w => {
      const st = w?.start_time ? new Date(w.start_time).getTime() : null
      const et = w?.end_time ? new Date(w.end_time).getTime() : (st || now)
      if (st) totals.durationMin += Math.max(0, Math.round((et - st) / 60000))
      ;(w.exercises || []).forEach(we => {
        const mg = we?.exercise?.muscle_group || 'Other'
        const list = we?.sets || []
        totals.sets += list.length
        list.forEach(s => {
          const reps = Number(s.reps) || 0
          const weight = Number(s.weight) || 0
          totals.reps += reps
          if (!Number.isNaN(weight * Math.max(1, reps))) totals.weight += weight * Math.max(1, reps)
          if (weight > totals.heaviest) totals.heaviest = weight
          muscle.set(mg, (muscle.get(mg) || 0) + 1)
        })
      })
    })
    const entries = Array.from(muscle.entries())
    const sum = entries.reduce((a, [, v]) => a + v, 0) || 1
    const musclePercent = entries
      .map(([group, count]) => ({ group, count, percent: Math.round((count * 100) / sum) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10)
    return { totals, musclePercent }
  }, [pastWorkouts, timeframeDays])

  const filteredPastWorkouts = useMemo(() => {
    const now = Date.now()
    const list = (pastWorkouts || []).slice().sort((a, b) => {
      const at = a?.start_time ? new Date(a.start_time).getTime() : 0
      const bt = b?.start_time ? new Date(b.start_time).getTime() : 0
      return bt - at
    })
    if (!pastFilterDays || pastFilterDays >= 99999) return list
    const cutoff = now - pastFilterDays * 24 * 60 * 60 * 1000
    return list.filter(w => {
      const t = w?.start_time ? new Date(w.start_time).getTime() : 0
      return t >= cutoff
    })
  }, [pastWorkouts, pastFilterDays])

  const oneRm = useMemo(() => {
    const w = parseFloat(calc.weight)
    const r = parseFloat(calc.reps)
    if (!w || !r) return 0
    return Math.round(w * (1 + r / 30)) // Epley
  }, [calc])

  const proteinGrams = useMemo(() => {
    const bw = parseFloat(calc.bw)
    const pf = parseFloat(calc.proteinFactor)
    if (!bw || !pf) return 0
    return Math.round(bw * pf)
  }, [calc])

  const spawnParticles = (n = 32) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const amount = reduce ? Math.min(n, 8) : Math.min(n, 24)
    const created = []
    setParticles(prev => {
      const next = [...prev]
      const maxParticles = 60
      const over = Math.max(0, next.length + amount - maxParticles)
      if (over > 0) next.splice(0, over)
      for (let i = 0; i < amount; i++) {
        const id = particleSeq.current++
        const glyphs = ['✦','★','✧','♥']
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)]
        next.push({
          id,
          glyph,
          left: Math.random() * 100,
          size: 10 + Math.round(Math.random() * 10),
          duration: 1.4 + Math.random() * 1.2,
          color: Math.random() < 0.5 ? 'text-pink-200' : 'text-purple-200',
          kind: Math.random() < 0.5 ? 'burst' : 'drift',
        })
        created.push(id)
      }
      return next
    })
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !created.includes(p.id)))
    }, 2000)
  }

  const getMuscleGroupIcon = (group) => {
    const icons = {
      'Chest': Heart,
      'Back': Dumbbell,
      'Legs': Zap,
      'Shoulders': Star,
      'Arms': Trophy,
      'Core': Sparkles,
      'Cardio': Heart
    }
    return icons[group] || Dumbbell
  }

  const getAllowedFieldsForExercise = (we) => {
    try {
      const instr = we?.exercise?.instructions
      if (!instr) return ['reps','weight']
      const parsed = typeof instr === 'string' ? JSON.parse(instr) : instr
      if (Array.isArray(parsed.allowed_fields) && parsed.allowed_fields.length) return parsed.allowed_fields
      return ['reps','weight']
    } catch {
      return ['reps','weight']
    }
  }

  const openWorkoutModal = (w, pushHash = true) => {
    setSelectedWorkout(w)
    setWorkoutEdit({ notes: w?.notes || '' })
    setWorkoutModalOpen(true)
    if (pushHash && w?.id) {
      const hash = `#workout-${w.id}`
      if (window.location.hash !== hash) window.location.hash = hash
    }
  }

  useEffect(() => {
    if (!workoutModalOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeWorkoutModal()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [workoutModalOpen])

  useEffect(() => {
    const handle = () => {
      const m = (window.location.hash || '').match(/^#workout-(\d+)$/)
      const id = m ? Number(m[1]) : null
      if (id) {
        // open modal for hash id if not already opened or different
        if (!workoutModalOpen || selectedWorkout?.id !== id) {
          const w = (pastWorkouts || []).find(x => x.id === id) || (activeWorkout?.id === id ? activeWorkout : null)
          if (w) openWorkoutModal(w, false)
        }
      } else {
        if (workoutModalOpen) closeWorkoutModal(false)
      }
    }
    window.addEventListener('hashchange', handle)
    // Handle initial load hash after workouts fetched
    handle()
    return () => window.removeEventListener('hashchange', handle)
  }, [pastWorkouts, activeWorkout, workoutModalOpen, selectedWorkout])

  useEffect(() => {
    // Cursor trail effect with better DOM management
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0

    const handleMouseMove = (e) => {
      // Throttle trail creation more aggressively
      if (Math.random() > 0.7) return // Only create trail ~30% of the time

      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      trail.style.left = (e.clientX + 6) + 'px'
      trail.style.top = (e.clientY + 6) + 'px'
      trail.style.pointerEvents = 'none'

      // Use document fragment for better performance
      const fragment = document.createDocumentFragment()
      fragment.appendChild(trail)
      document.body.appendChild(fragment)

      // Aggressive cleanup to avoid DOM build-up
      setTimeout(() => {
        if (trail && trail.parentNode === document.body) {
          try {
            document.body.removeChild(trail)
          } catch {}
        }
      }, 400)
    }

    const onMove = (e) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        handleMouseMove(e)
        rafId = 0
      })
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const isAuthed = Boolean(authToken && user)

  if (!isAuthed) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 bg-decora">
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Magical Girl Gym Tracker ✨
              </h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-xl">{authMode === 'login' ? 'Login' : 'Register'}</CardTitle>
                <CardDescription>Welcome! Please {authMode === 'login' ? 'sign in' : 'create an account'} to continue.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-3">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Email</label>
                      <input type="email" value={authForm.email} onChange={(e) => setAuthForm(v => ({ ...v, email: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Username</label>
                    <input type="text" value={authForm.username} onChange={(e) => setAuthForm(v => ({ ...v, username: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Password</label>
                    <input type="password" value={authForm.password} onChange={(e) => setAuthForm(v => ({ ...v, password: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  {authError && (
                    <div className="text-xs text-red-600">{authError}</div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="submit" disabled={authLoading} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      {authLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Register')}
                    </Button>
                  </div>
                </form>
                <div className="text-xs text-gray-600 mt-2">
                  {authMode === 'login' ? (
                    <button onClick={() => setAuthMode('register')} className="underline">Don't have an account? Register here</button>
                  ) : (
                    <button onClick={() => setAuthMode('login')} className="underline">Already have an account? Login here</button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="bg-white/50 border-t border-pink-100 mt-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-600">Made with 💖 for magical girls everywhere</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 bg-decora">
      {/* Decora Floating Icons */}
      <div aria-hidden className="decora-overlay pointer-events-none absolute inset-0 z-0">
        <span className="iconify-inline text-pink-300" data-icon="lucide:heart" data-width="22" style={{ top: '8%', left: '6%' }}></span>
        <span className="iconify-inline text-purple-300" data-icon="lucide:sparkles" data-width="28" style={{ top: '16%', right: '8%' }}></span>
        <span className="iconify-inline text-pink-300" data-icon="lucide:star" data-width="18" style={{ bottom: '12%', left: '10%' }}></span>
        <span className="iconify-inline text-rose-300" data-icon="lucide:heart" data-width="20" style={{ bottom: '18%', right: '12%' }}></span>
      </div>
      {/* Continuous Glitter Starfall */}
      {glitterEnabled && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          {glitterItems.map((g) => (
            <span
              key={g.id}
              className={`${g.color} glitter-item${g.isAlt ? ' alt' : ''}`}
              style={{ left: `${g.left}%`, fontSize: `${g.size}px`, animationDuration: `${g.duration}s`, animationDelay: `${g.delay}s` }}
              aria-hidden="true"
            >{g.glyph}</span>
          ))}
        </div>
      )}
      {/* Particle Host */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`particle ${p.kind} ${p.color}`}
            style={{
              left: `${p.left}%`,
              bottom: '8px',
              fontSize: `${p.size}px`,
              animationDuration: p.kind === 'drift'
                ? `${p.duration}s, ${Math.max(0.8, p.duration * 0.6)}s`
                : `${p.duration}s`
            }}
            aria-hidden="true"
          >{p.glyph}</span>
        ))}
      </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Magical Girl Gym Tracker ✨
              </h1>
              <div className="hidden md:flex items-center gap-1 ml-2">
                <span className="iconify-inline text-pink-400" data-icon="lucide:heart" data-width="18"></span>
                <span className="iconify-inline text-purple-400" data-icon="lucide:star" data-width="18"></span>
                <span className="iconify-inline text-pink-400" data-icon="lucide:sparkles" data-width="18"></span>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Workout name"
                className="hidden md:block mr-3 rounded-md border border-pink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white/80"
              />
              <Button
                onClick={activeWorkout ? handleEndWorkout : handleStartWorkout}
                disabled={starting}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Star className="h-4 w-4 mr-2" />
                {activeWorkout ? 'End Workout' : 'Start Workout'}
              </Button>
              {user ? (
                <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                  Logout
                </Button>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-blue-500 hover:bg-blue-600">
                  Login/Register
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky-scroll cute-scroll side-banner side-panel">
              {/* Pinned Avatar */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  alt="Profile avatar"
                  className="sticker w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                  src={profilePic || `https://api.dicebear.com/7.x/big-ears/svg?seed=${encodeURIComponent(user?.username || 'MagicalGirl')}&backgroundColor=fce7f3&radius=20`}
                />
                <div>
                  <div className="jp-label">プロフィール</div>
                  <div className="font-bold text-pink-600">{user?.username || 'magicalgirl'}</div>
                  <input type="file" accept="image/*" ref={profilePicInputRef} onChange={onProfilePicChange} className="hidden" />
                  <button onClick={() => profilePicInputRef.current?.click()} className="text-xs text-pink-600 underline mt-1">Change photo</button>
                </div>
              </div>

              {/* Goals */}
              <h4 className="headline-wacky text-lg mb-2">Goals</h4>
              <ul className="text-sm text-gray-700 list-disc ml-5 mb-3">
                <li>Workout 3× this week</li>
                <li>+1 PR on main lift</li>
                <li>Hit protein target ✓</li>
              </ul>

              {/* Challenges */}
              <h4 className="headline-wacky text-lg mb-2">Challenges</h4>
              <ul className="text-sm text-gray-700 list-disc ml-5 mb-4">
                <li>100 push-ups across the day</li>
                <li>10k steps sparkle walk</li>
              </ul>

              {/* Sparkle Machine */}
              <div className="mt-2 p-3 rounded-lg bg-pink-50 border border-pink-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="hl-cherry text-pink-600">Sparkle Machine</span>
                  <span className="iconify-inline text-pink-400" data-icon="lucide:sparkles" data-width="18"></span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button size="sm" onClick={() => spawnParticles(12)} className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600">x12</Button>
                  <Button size="sm" variant="outline" onClick={() => spawnParticles(20)} className="border-pink-200">x20</Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-pink-600">Intensity</label>
                  <input
                    type="range"
                    min="8"
                    max="80"
                    step="4"
                    value={glitterCount}
                    onChange={(e) => setGlitterCount(Number(e.target.value))}
                    className="flex-1 accent-pink-500"
                    aria-label="Glitter intensity"
                  />
                  <span className="text-xs text-gray-600 w-6 text-right">{glitterCount}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setGlitterEnabled(v => !v)} className="border-pink-200">
                    {glitterEnabled ? 'Disable Glitter' : 'Enable Glitter'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setParticles([])} className="border-pink-200">Clear</Button>
                </div>
              </div>

              {/* Image Board */}
              <div className="mt-3 p-3 rounded-lg bg-pink-50 border border-pink-200">
                <input type="file" accept="image/*" multiple ref={imageUploadRef} onChange={(e)=>{ addFilesToBoard(e.target.files); e.target.value=''}} className="hidden" />
                <div className="flex items-center justify-between mb-2">
                  <span className="hl-cherry text-pink-600">Image Board</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => imageUploadRef.current?.click()} className="border-pink-200">Upload</Button>
                    <Button size="sm" variant="outline" onClick={() => promptAndAddImage()} className="border-pink-200">URL</Button>
                  </div>
                </div>
                {imagePersistError && (
                  <div className="text-[11px] text-red-600 mb-2">Storage is full or blocked; new images may not persist. Try smaller images or remove some.</div>
                )}
                {imageBoard.length === 0 ? (
                  <div className="text-xs text-gray-600">No images yet. Add some magic ✨</div>
                ) : (
                  <div className="max-h-60 overflow-auto">
                    <div className="grid grid-cols-3 gap-2 pr-1">
                      {imageBoard.map((img, idx) => (
                        <div key={img.id} className="relative">
                          <button
                            onClick={() => { setSelectedImage(img); setImageModalOpen(true) }}
                            className={`block w-full ${['image-tilt-1','image-tilt-2','image-tilt-3'][idx%3]} bg-white rounded-md border border-pink-200 shadow-sm overflow-hidden`}
                            title="Open"
                          >
                            <img src={img.url} alt="" className="w-full h-20 md:h-24 object-cover" />
                          </button>
                          <div className="text-[10px] text-center text-gray-500 mt-1">{formatShortDate(img.ts)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Center Content */}
          <section className="col-span-12 lg:col-span-6">
            {/* Tumblr 2012-style Profile Card */}
            <section className="sweet-card washi scallop p-4 md:p-6 mt-6 mb-10 relative">
              <div className="grid grid-cols-[96px_1fr] md:grid-cols-[120px_1fr] gap-4 items-center">
                <img
                  alt="Profile avatar"
                  className="sticker w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg"
                  src={profilePic || `https://api.dicebear.com/7.x/big-ears/svg?seed=${encodeURIComponent(user?.username || 'MagicalGirl')}&backgroundColor=fce7f3&radius=20`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="jp-label">プロフィール</span>
                    <span className="iconify-inline text-pink-400" data-icon="lucide:sparkles" data-width="18"></span>
                    <input type="file" accept="image/*" ref={profilePicInputRef} onChange={onProfilePicChange} className="hidden" />
                    <button onClick={() => profilePicInputRef.current?.click()} className="text-xs text-pink-600 underline">Change photo</button>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{user?.username || 'magicalgirl'}</h3>
                  <div className="glitter-sep my-2"></div>
                  <dl className="text-sm text-gray-700 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-xs text-pink-500 font-semibold">Level</dt>
                      <dd>Protagonist Lv.{(activeWorkout?.exercises?.length || 0) + 1}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-pink-500 font-semibold">好きな部位</dt>
                      <dd>{selectedMuscleGroup === 'all' ? '全身' : selectedMuscleGroup}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-pink-500 font-semibold">今日の目標</dt>
                      <dd>キラキラ☆ +1 PR</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-pink-500 font-semibold">Mood</dt>
                      <dd>がんばって！</dd>
                    </div>
                  </dl>
                </div>
              </div>
              {/* Stickers on card */}
              <span className="iconify-inline text-pink-400 absolute -top-3 left-6 -rotate-6" data-icon="lucide:heart" data-width="18"></span>
              <span className="iconify-inline text-purple-400 absolute -bottom-3 right-6 rotate-6" data-icon="lucide:star" data-width="18"></span>
            </section>

            {/* Active Workout */}
            {activeWorkout && (
              <Card className="mb-8 border-pink-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Active Workout</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-pink-100 text-pink-800 border-pink-200">In progress</Badge>
                      <Button size="sm" variant="outline" onClick={() => setShowAddExercisePicker(v => !v)} className="border-pink-200">Add Exercise</Button>
                      <Button size="sm" variant="outline" onClick={() => workoutImageUploadRef.current?.click()} className="border-pink-200">Upload Image</Button>
                      <input type="file" accept="image/*" multiple ref={workoutImageUploadRef} onChange={(e)=>{ addFilesToBoard(e.target.files, activeWorkout?.id); e.target.value=''}} className="hidden" />
                      <Button size="sm" variant="outline" onClick={() => promptAndAddImage(activeWorkout?.id)} className="border-pink-200">Add Image by URL</Button>
                    </div>
                  </div>
                  <CardDescription>
                    {(activeWorkout.name || 'Workout')}
                    {activeWorkout.start_time ? ` • ${new Date(activeWorkout.start_time).toLocaleString()}` : ''}
                  </CardDescription>
                  {showAddExercisePicker && (
                    <div className="mt-3 border rounded-md bg-white/90 p-3 shadow-sm">
                      <input
                        type="text"
                        value={exerciseSearch}
                        onChange={(e) => setExerciseSearch(e.target.value)}
                        placeholder="Search exercises by name, muscle group, equipment, or difficulty..."
                        className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80"
                      />
                      <div className="mt-2 max-h-60 overflow-auto space-y-1">
                        {exercises
                          .filter(ex => {
                            const q = exerciseSearch.trim().toLowerCase()
                            if (!q) return true
                            return (
                              ex.name.toLowerCase().includes(q)
                              || ex.muscle_group?.toLowerCase().includes(q)
                              || ex.equipment?.toLowerCase().includes(q)
                              || ex.difficulty?.toLowerCase().includes(q)
                            )
                          })
                          .slice(0, 50)
                          .map(ex => (
                            <button
                              key={ex.id}
                              onClick={() => { handleAddExercise(ex.id); setShowAddExercisePicker(false); setExerciseSearch('') }}
                              className="w-full text-left px-2 py-1 rounded hover:bg-pink-50 border border-transparent hover:border-pink-200"
                            >
                              {ex.name} <span className="text-gray-500 text-xs">• {ex.muscle_group}{ex.equipment ? ` • ${ex.equipment}` : ''}</span>
                            </button>
                          ))}
                        {exercises.length === 0 && (
                          <div className="text-sm text-gray-600">No exercises found.</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {(!activeWorkout.exercises || activeWorkout.exercises.length === 0) ? (
                    <p className="text-gray-600">No exercises added yet. Pick from the list below.</p>
                  ) : (
                    <ul className="space-y-2">
                      {activeWorkout.exercises.map((we) => (
                        <li key={we.id} className="rounded-md border border-pink-100 bg-white/60 px-3 py-2">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-800">{we.exercise?.name || 'Exercise'}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{(we.sets?.length || 0)} sets</span>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteWorkoutExercise(we.id)} className="border-pink-200 text-red-600">Delete</Button>
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                            {getAllowedFieldsForExercise(we).includes('reps') && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Reps</label>
                                <input type="number" min="0" value={setInputs[we.id]?.reps || ''} onChange={(e)=>updateSetInput(we.id,{ reps: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                              </div>
                            )}
                            {getAllowedFieldsForExercise(we).includes('weight') && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                                <input type="number" step="0.5" value={setInputs[we.id]?.weight || ''} onChange={(e)=>updateSetInput(we.id,{ weight: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                              </div>
                            )}
                            {getAllowedFieldsForExercise(we).includes('duration') && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Time (s)</label>
                                <input type="number" min="0" value={setInputs[we.id]?.duration || ''} onChange={(e)=>updateSetInput(we.id,{ duration: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                              </div>
                            )}
                            {getAllowedFieldsForExercise(we).includes('distance') && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Distance (m)</label>
                                <input type="number" step="0.1" min="0" value={setInputs[we.id]?.distance || ''} onChange={(e)=>updateSetInput(we.id,{ distance: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Rest (s)</label>
                              <div className="flex items-center gap-2">
                                <input type="number" min="0" value={setInputs[we.id]?.rest_time || ''} onChange={(e)=>updateSetInput(we.id,{ rest_time: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                <Button size="sm" onClick={() => handleAddSet(we)} className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600">Add Set</Button>
                              </div>
                            </div>
                          </div>
                          {we.sets?.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                              {we.sets.map((s) => {
                                const sv = decoratedSet(s)
                                return (
                                  <li key={s.id} className={`rounded border px-2 py-2 ${sv.done ? 'bg-green-50 border-green-200' : 'bg-white/70 border-pink-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleSetDone(s.id)}
                                          className={`h-5 w-5 flex items-center justify-center rounded-full border ${sv.done ? 'bg-green-500 border-green-500 text-white' : 'border-pink-300 text-gray-500'}`}
                                          title={sv.done ? 'Mark as not done' : 'Mark as done'}
                                        >
                                          {sv.done ? '✓' : ''}
                                        </button>
                                        <span className="text-sm font-medium">Set {s.set_number}</span>
                                      </div>
                                      <button onClick={() => handleDeleteSet(we.id, s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                                      {getAllowedFieldsForExercise(we).includes('reps') && (
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Reps</label>
                                          <input type="number" min="0" value={sv.reps ?? ''} onChange={(e)=>updateSetOverride(s.id,{ reps: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                        </div>
                                      )}
                                      {getAllowedFieldsForExercise(we).includes('weight') && (
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                                          <input type="number" step="0.5" value={sv.weight ?? ''} onChange={(e)=>updateSetOverride(s.id,{ weight: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                        </div>
                                      )}
                                      {getAllowedFieldsForExercise(we).includes('duration') && (
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Time (s)</label>
                                          <input type="number" min="0" value={sv.duration ?? ''} onChange={(e)=>updateSetOverride(s.id,{ duration: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                        </div>
                                      )}
                                      {getAllowedFieldsForExercise(we).includes('distance') && (
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Distance (m)</label>
                                          <input type="number" step="0.1" min="0" value={sv.distance ?? ''} onChange={(e)=>updateSetOverride(s.id,{ distance: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                        </div>
                                      )}
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Rest (s)</label>
                                        <input type="number" min="0" value={sv.rest_time ?? ''} onChange={(e)=>updateSetOverride(s.id,{ rest_time: e.target.value })} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                      </div>
                                    </div>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Past Workouts */}
            <Card className="mb-8 border-pink-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Past Workouts</CardTitle>
                <CardDescription>Your recent sessions</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-xs text-gray-600">Timeframe</label>
                  <select
                    value={pastFilterDays}
                    onChange={(e) => { setPastFilterDays(Number(e.target.value)); setPastShown(5) }}
                    className="rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80"
                  >
                    <option value={7}>7d</option>
                    <option value={30}>30d</option>
                    <option value={90}>90d</option>
                    <option value={365}>1y</option>
                    <option value={99999}>All</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {(!user) ? (
                  <p className="text-gray-600">Loading user...</p>
                ) : loadingPast ? (
                  <p className="text-gray-600">Loading past workouts...</p>
                ) : (filteredPastWorkouts && filteredPastWorkouts.length > 0) ? (
                  <>
                    <ul className="space-y-2">
                      {filteredPastWorkouts.slice(0, pastShown).map((w) => (
                        <li key={w.id} onClick={() => openWorkoutModal(w)} className="rounded-md border border-pink-100 bg-white/60 px-3 py-2 cursor-pointer hover:border-pink-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-800">
                              <span className="iconify-inline text-pink-400" data-icon="lucide:heart" data-width="16"></span>
                              <span>{w.name || 'Workout'}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {w.start_time ? new Date(w.start_time).toLocaleString() : ''} {w.end_time ? '' : '• In progress'}
                            </div>
                          </div>
                          {w.exercises?.length ? (
                            <div className="mt-1 text-sm text-gray-700">
                              {w.exercises.length} exercises • {w.exercises.reduce((acc, e)=> acc + (e.sets?.length||0), 0)} sets
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {filteredPastWorkouts.length > pastShown && (
                      <div className="mt-3 flex justify-center">
                        <Button variant="outline" onClick={() => setPastShown(v => v + 5)} className="border-pink-200">Load More</Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">No workouts yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Create Custom Exercise */}
            <Card className="mb-8 border-pink-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Create Custom Exercise</CardTitle>
                <CardDescription>Add your own movement and optionally include it in the current workout.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end" onSubmit={handleCreateExercise}>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Name</label>
                    <input value={newExercise.name} onChange={(e) => setNewExercise(v => ({ ...v, name: e.target.value }))} placeholder="e.g. Bulgarian Split Squat" className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Muscle Group</label>
                    <select value={newExercise.muscle_group} onChange={(e) => setNewExercise(v => ({ ...v, muscle_group: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80">
                      {MUSCLE_GROUPS.map(m => (<option key={m} value={m}>{m}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Equipment</label>
                    <input value={newExercise.equipment} onChange={(e) => setNewExercise(v => ({ ...v, equipment: e.target.value }))} placeholder="e.g. Dumbbells" className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs text-gray-600 mb-1">Allowed Fields</label>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                      {['reps','weight','duration','distance'].map(f => (
                        <label key={f} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newExercise.allowed_fields?.includes(f)}
                            onChange={(e) => setNewExercise(v => {
                              const set = new Set(v.allowed_fields || [])
                              if (e.target.checked) set.add(f); else set.delete(f)
                              return { ...v, allowed_fields: Array.from(set) }
                            })}
                          />
                          {f}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-5 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={autoAddToWorkout} onChange={(e) => setAutoAddToWorkout(e.target.checked)} />
                      Add to active workout if started
                    </label>
                    <Button type="submit" className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600">Create Exercise</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Muscle Group Filter */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Your Training Focus</h3>
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((group) => (
                  <Button
                    key={group}
                    variant={selectedMuscleGroup === group ? "default" : "outline"}
                    onClick={() => setSelectedMuscleGroup(group)}
                    className={`${
                      selectedMuscleGroup === group 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                        : 'border-pink-200 hover:bg-pink-50'
                    }`}
                  >
                    {group === 'all' ? '✨ All Exercises' : `${group}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Exercise Search */}
            <div className="mb-4">
              <input
                type="text"
                value={exerciseQuery}
                onChange={(e) => { setExerciseQuery(e.target.value); setExercisesShown(9) }}
                placeholder="Search exercises by name, group, equipment, difficulty..."
                className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80"
              />
            </div>

            {/* Exercise Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-pink-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading magical exercises...</p>
              </div>
            ) : (
              <>
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">No exercises found. Try a different search or remove filters.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredExercises.slice(0, exercisesShown).map((exercise) => {
                        const IconComponent = getMuscleGroupIcon(exercise.muscle_group)
                        return (
                          <Card key={exercise.id} className="hover:shadow-lg transition-shadow border-pink-100 hover:border-pink-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <IconComponent className="h-6 w-6 text-pink-500" />
                                {exercise.difficulty && (
                                  <Badge className={
                                    exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                                    exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-red-100 text-red-800 border-red-200'
                                  }>
                                    {exercise.difficulty}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg text-gray-800">{exercise.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {exercise.muscle_group} • {exercise.equipment || 'No equipment'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {exercise.description}
                              </p>
                              <Button 
                                size="sm" 
                                disabled={!activeWorkout}
                                onClick={() => handleAddExercise(exercise.id)}
                                className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Add to Workout
                              </Button>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {filteredExercises.length > exercisesShown && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" onClick={() => setExercisesShown(v => v + 9)} className="border-pink-200">Load More</Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>

          {/* Right Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky-scroll cute-scroll side-banner side-panel">
              {/* Stats */}
              <div className="flex items-center gap-2 mb-3">
                <h4 className="headline-wacky text-lg">Stats</h4>
                <select
                  value={timeframeDays}
                  onChange={(e) => setTimeframeDays(Number(e.target.value))}
                  className="ml-auto rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80"
                >
                  <option value={7}>7d</option>
                  <option value={30}>30d</option>
                  <option value={90}>90d</option>
                </select>
              </div>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>Workouts: <span className="font-semibold">{stats.totals.workouts}</span></div>
                  <div>Sets: <span className="font-semibold">{stats.totals.sets}</span></div>
                  <div>Reps: <span className="font-semibold">{stats.totals.reps}</span></div>
                  <div>Volume: <span className="font-semibold">{Math.round(stats.totals.weight)} kg</span></div>
                  <div>Heaviest: <span className="font-semibold">{stats.totals.heaviest} kg</span></div>
                  <div>Time: <span className="font-semibold">{stats.totals.durationMin} min</span></div>
                </div>
              </div>
              <div className="mb-4">
                <div className="hl-cherry text-pink-600 mb-2">Muscle mix</div>
                {stats.musclePercent.map((m) => (
                  <div key={m.group} className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{m.group}</span>
                      <span>{m.percent}%</span>
                    </div>
                    <div className="progress-outer">
                      <div className="progress-inner" style={{ width: `${m.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1RM Calculator */}
              <div className="border-t border-pink-100 pt-3 mt-3">
                <h5 className="headline-wacky text-lg mb-2">1RM (Epley)</h5>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" placeholder="Weight kg" value={calc.weight} onChange={(e) => setCalc(v => ({ ...v, weight: e.target.value }))} className="rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80" />
                  <input type="number" placeholder="Reps" value={calc.reps} onChange={(e) => setCalc(v => ({ ...v, reps: e.target.value }))} className="rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80" />
                </div>
                <div className="text-sm">Est. 1RM: <span className="font-bold text-pink-600">{oneRm || 0} kg</span></div>
              </div>

              {/* Protein Calculator */}
              <div className="border-t border-pink-100 pt-3 mt-3">
                <h5 className="headline-wacky text-lg mb-2">Protein</h5>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="number" placeholder="Bodyweight kg" value={calc.bw} onChange={(e) => setCalc(v => ({ ...v, bw: e.target.value }))} className="rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80" />
                  <select value={calc.proteinFactor} onChange={(e) => setCalc(v => ({ ...v, proteinFactor: e.target.value }))} className="rounded-md border border-pink-200 px-2 py-1 text-xs bg-white/80">
                    <option value="1.6">1.6 g/kg</option>
                    <option value="1.8">1.8 g/kg</option>
                    <option value="2.0">2.0 g/kg</option>
                    <option value="2.2">2.2 g/kg</option>
                  </select>
                </div>
                <div className="text-sm">Target: <span className="font-bold text-pink-600">{proteinGrams || 0} g/day</span></div>
              </div>

              {/* Animation Playground */}
              <div className="border-t border-pink-100 pt-3 mt-3">
                <h5 className="headline-wacky text-lg mb-2">Animation Playground</h5>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => spawnParticles(16)} className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600">
                    <Sparkles className="h-4 w-4 mr-1" /> Twinkle
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => spawnParticles(32)} className="border-pink-200">
                    <Star className="h-4 w-4 mr-1" /> Starfall
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Image Modal Overlay */}
      {imageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeImageModal}></div>
          <div className="absolute inset-0 flex items-center justify-center p-2 md:p-6" onClick={closeImageModal}>
            <div
              className="bg-white w-full md:max-w-3xl rounded-none md:rounded-lg shadow-lg border border-pink-200 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-pink-100 flex items-center justify-between">
                <div className="text-xs text-gray-600">{formatShortDate(selectedImage.ts)} {selectedImage.workoutId ? `• w#${selectedImage.workoutId}` : ''}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setImageBoard(prev => prev.filter(x => x.id !== selectedImage.id)); closeImageModal(); }} className="border-red-200 text-red-600">Delete</Button>
                  {selectedImage.workoutId ? (
                    <Button size="sm" variant="outline" onClick={() => { const w = (pastWorkouts || []).find(x => x.id === selectedImage.workoutId) || (activeWorkout?.id === selectedImage.workoutId ? activeWorkout : null); if (w) { openWorkoutModal(w); closeImageModal(); } }} className="border-pink-200">Open Workout</Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={closeImageModal} className="border-pink-200">Close</Button>
                </div>
              </div>
              <div className="p-3">
                <img src={selectedImage.url} alt="" className="w-full max-h-[80vh] object-contain rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Modal Overlay */}
      {workoutModalOpen && selectedWorkout && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeWorkoutModal}></div>
          <div className="absolute inset-0 flex items-center justify-center p-2 md:p-6" onClick={closeWorkoutModal}>
            <div
              className="bg-white w-full max-h-[90vh] md:h-auto md:max-w-2xl rounded-none md:rounded-lg shadow-lg border border-pink-200 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-pink-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedWorkout.name || 'Workout'}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedWorkout.start_time ? new Date(selectedWorkout.start_time).toLocaleString() : ''} {selectedWorkout.end_time ? '' : '• In progress'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => modalImageUploadRef.current?.click()} className="border-pink-200">Upload</Button>
                  <input type="file" accept="image/*" multiple ref={modalImageUploadRef} onChange={(e)=>{ addFilesToBoard(e.target.files, selectedWorkout?.id); e.target.value=''}} className="hidden" />
                  <Button size="sm" variant="outline" onClick={() => promptAndAddImage(selectedWorkout.id)} className="border-pink-200">Add URL</Button>
                  {(authToken && user) && (
                    <Button size="sm" variant="outline" onClick={closeWorkoutModal} className="border-pink-200">Close</Button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={workoutEdit.notes}
                    onChange={(e)=>setWorkoutEdit(v=>({ ...v, notes: e.target.value }))}
                    className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80 min-h-[100px]"
                    placeholder="Add your magical notes..."
                  />
                </div>
                {selectedWorkout.exercises?.length ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises & Sets</h4>
                    <div className="space-y-3">
                      {(selectedWorkout.exercises || []).map((we) => (
                        <div key={we.id} className="rounded border border-pink-100 bg-white/80">
                          <div className="px-2 py-2 flex items-center justify-between">
                            <span className="font-medium">{we.exercise?.name || 'Exercise'}</span>
                            <span className="text-xs text-gray-500">{(we.sets?.length || 0)} sets</span>
                          </div>
                          {we.sets?.length ? (
                            <ul className="px-2 pb-2 space-y-2">
                              {we.sets.map((s) => (
                                <li key={s.id} className="rounded border border-pink-100 bg-white/70 p-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => toggleSetDone(s.id)}
                                        className={`h-5 w-5 flex items-center justify-center rounded-full border ${decoratedSet(s).done ? 'bg-green-500 border-green-500 text-white' : 'border-pink-300 text-gray-500'}`}
                                        title={decoratedSet(s).done ? 'Mark as not done' : 'Mark as done'}
                                      >
                                        {decoratedSet(s).done ? '✓' : ''}
                                      </button>
                                      <span className="text-sm font-medium">Set {s.set_number}</span>
                                    </div>
                                    <button onClick={() => handleDeleteSet(we.id, s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                                    {getAllowedFieldsForExercise(we).includes('reps') && (
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Reps</label>
                                        <input type="number" min="0" value={modalSetEdits[s.id]?.reps ?? (s.reps ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), reps: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                      </div>
                                    )}
                                    {getAllowedFieldsForExercise(we).includes('weight') && (
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                                        <input type="number" step="0.5" value={modalSetEdits[s.id]?.weight ?? (s.weight ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), weight: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                      </div>
                                    )}
                                    {getAllowedFieldsForExercise(we).includes('duration') && (
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Time (s)</label>
                                        <input type="number" min="0" value={modalSetEdits[s.id]?.duration ?? (s.duration ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), duration: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                      </div>
                                    )}
                                    {getAllowedFieldsForExercise(we).includes('distance') && (
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Distance (m)</label>
                                        <input type="number" step="0.1" min="0" value={modalSetEdits[s.id]?.distance ?? (s.distance ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), distance: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                      </div>
                                    )}
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">Rest (s)</label>
                                      <input type="number" min="0" value={modalSetEdits[s.id]?.rest_time ?? (s.rest_time ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), rest_time: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-xs text-gray-600 mb-1">Notes</label>
                                      <input type="text" value={modalSetEdits[s.id]?.notes ?? (s.notes ?? '')} onChange={(e)=>setModalSetEdits(prev=>({ ...prev, [s.id]: { ...(prev[s.id]||{}), notes: e.target.value } }))} className="w-full rounded-md border border-pink-200 px-2 py-1 text-sm bg-white/80" placeholder="Optional notes" />
                                    </div>
                                    <div className="flex md:justify-end">
                                      <Button size="sm" onClick={() => saveModalSet(s.id)} className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600">Save</Button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center justify-end gap-2 pt-2">
                  {(authToken && user) && (
                    <Button variant="outline" onClick={closeWorkoutModal} className="border-pink-200">Cancel</Button>
                  )}
                  <Button onClick={saveWorkoutEdits} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">Save</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-center justify-center p-2 md:p-6">
            <div
              className="bg-white w-full md:max-w-md rounded-none md:rounded-lg shadow-lg border border-pink-200 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-pink-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">{authMode === 'login' ? 'Login' : 'Register'}</h3>
                {(authToken && user) && (
                  <button onClick={() => setShowAuthModal(false)} className="text-xs text-red-600 hover:underline">Close</button>
                )}
              </div>
              <div className="p-4 space-y-3">
                <form onSubmit={handleAuth}>
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Email</label>
                      <input type="email" value={authForm.email} onChange={(e) => setAuthForm(v => ({ ...v, email: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Username</label>
                    <input type="text" value={authForm.username} onChange={(e) => setAuthForm(v => ({ ...v, username: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Password</label>
                    <input type="password" value={authForm.password} onChange={(e) => setAuthForm(v => ({ ...v, password: e.target.value }))} className="w-full rounded-md border border-pink-200 px-3 py-2 text-sm bg-white/80" />
                  </div>
                  {authError && (
                    <div className="text-xs text-red-600">{authError}</div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {(authToken && user) && (
                      <Button variant="outline" onClick={() => setShowAuthModal(false)} className="border-pink-200">Cancel</Button>
                    )}
                    <Button type="submit" disabled={authLoading} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      {authLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Register')}
                    </Button>
                  </div>
                </form>
                <div className="text-xs text-gray-600">
                  {authMode === 'login' ? (
                    <button onClick={() => setAuthMode('register')} className="underline">Don't have an account? Register here</button>
                  ) : (
                    <button onClick={() => setAuthMode('login')} className="underline">Already have an account? Login here</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white/50 border-t border-pink-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            Made with 💖 for magical girls everywhere
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
