import {ValidationError} from './errors/validation-error'
import {
  CreateChatMessage,
  OllamaRequest,
  OllamaResponse,
} from './types/domain/chat-types'
import {
  chatMessageSchema,
  ollamaRequestSchema,
} from './validation/chat-validation'

const OLLAMA_BASE_URL = 'http://localhost:11434'

export const sendMessageToOllama = async (
  prompt: string,
  model: string = 'llama3.2'
): Promise<ReadableStream<Uint8Array>> => {
  const requestData: OllamaRequest = {
    model,
    prompt,
    stream: true,
  }

  const validation = ollamaRequestSchema.safeParse(requestData)
  if (!validation.success) {
    throw new ValidationError('Données de requête invalides')
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      throw new Error(
        `Erreur Ollama: ${response.status} ${response.statusText}`
      )
    }

    if (!response.body) {
      throw new Error('Pas de réponse du serveur Ollama')
    }

    return response.body
  } catch (error) {
    console.error('Erreur lors de la communication avec Ollama:', error)
    throw new Error(
      "Impossible de communiquer avec le serveur Ollama. Assurez-vous qu'il est démarré."
    )
  }
}

export const parseOllamaStream = (
  chunk: string
): {content: string; done: boolean} => {
  try {
    const data: OllamaResponse = JSON.parse(chunk)
    return {
      content: data.response || '',
      done: data.done || false,
    }
  } catch (error) {
    console.warn('Erreur lors du parsing du chunk Ollama:', error)
    return {content: '', done: false}
  }
}

export const validateChatMessage = (messageData: CreateChatMessage) => {
  const validation = chatMessageSchema.safeParse(messageData)
  if (!validation.success) {
    throw new ValidationError('Message invalide')
  }
  return validation.data
}
