'use server'

import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export async function registerUser(formData: {
  name: string
  email: string
  password?: string
  role: 'player' | 'partner'
}) {
  const { name, email, password, role } = formData

  // Basic validations
  if (!name || name.trim() === '') {
    return { success: false, error: 'El nombre es obligatorio.' }
  }
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Correo electrónico inválido.' }
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' }
  }
  if (role !== 'player' && role !== 'partner') {
    return { success: false, error: 'Rol inválido seleccionado.' }
  }

  try {
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      return { success: false, error: `Error de base de datos: ${fetchError.message}` }
    }

    if (existingUser) {
      return { success: false, error: 'El correo electrónico ya está registrado.' }
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Insert new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role
      })

    if (insertError) {
      return { success: false, error: `Error al crear la cuenta: ${insertError.message}` }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Ocurrió un error inesperado: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
