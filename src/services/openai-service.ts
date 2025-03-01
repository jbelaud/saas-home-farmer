export interface OpenAIRequestOptions {
  model: string
  prompt: string
  system?: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface OpenAIResponse {
  id: string
  model: string
  created: number
  object: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    delta: {
      role?: string
      content?: string
    }
    index: number
    finish_reason: string | null
  }>
  done: boolean
}

export interface OpenAIModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface OpenAIModelList {
  data: OpenAIModel[]
  object: string
}

// Récupérez votre clé API depuis les variables d'environnement
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
const OPENAI_API_URL = 'https://api.openai.com/v1'

/**
 * Convertit les options de demande d'Ollama au format OpenAI
 */
function convertToOpenAIFormat(options: OpenAIRequestOptions) {
  const messages = []

  // Ajouter le message système si présent
  if (options.system) {
    messages.push({
      role: 'system',
      content: options.system,
    })
  }

  // Ajouter le message utilisateur
  messages.push({
    role: 'user',
    content: options.prompt,
  })

  return {
    model: options.model,
    messages: messages,
    temperature: options.temperature,
    max_tokens: options.max_tokens,
    top_p: options.top_p,
    frequency_penalty: options.frequency_penalty,
    presence_penalty: options.presence_penalty,
    stream: options.stream,
  }
}

/**
 * Génère une réponse à partir d'un modèle OpenAI
 */
export async function generateCompletion(
  options: OpenAIRequestOptions
): Promise<OpenAIResponse> {
  try {
    const openAIOptions = convertToOpenAIFormat(options)

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAIOptions),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // throw new Error(
      //   `Erreur API OpenAI: ${response.status} ${response.statusText} - ${
      //     errorData.error?.message || ''
      //   }`
      // )
      console.warn(
        `Erreur API OpenAI: ${response.status} ${response.statusText} - ${
          errorData.error?.message || ''
        }`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error)
    throw error
  }
}

/**
 * Génère une réponse en streaming à partir d'un modèle OpenAI
 * @param options Options de la requête
 * @param onChunk Callback appelé pour chaque fragment de réponse
 * @param onComplete Callback appelé lorsque la réponse est complète
 * @param onError Callback appelé en cas d'erreur
 * @param signal Signal d'interruption (AbortController.signal)
 */
export async function generateCompletionStream(
  options: OpenAIRequestOptions,
  onChunk: (chunk: OpenAIStreamChunk) => void,
  onComplete?: (finalResponse: OpenAIResponse) => void,
  onError?: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  // Assurer que le streaming est activé
  const streamingOptions = convertToOpenAIFormat({
    ...options,
    stream: true,
  })

  let fullContent = ''
  let firstChunkId = ''
  let model = ''
  let created = 0

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(streamingOptions),
      signal, // Utiliser le signal d'annulation
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Erreur API OpenAI: ${response.status} ${response.statusText} - ${
          errorData.error?.message || ''
        }`
      )
    }

    // S'assurer que le body est défini
    if (!response.body) {
      throw new Error('Le corps de la réponse est indéfini')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    // Fonction pour vérifier si le signal a été déclenché
    const checkSignal = () => {
      if (signal?.aborted) {
        // Si le signal a été déclenché, nous arrêtons la lecture
        reader.cancel("Requête interrompue par l'utilisateur")
        if (onComplete) {
          const finalResponseObj: OpenAIResponse = {
            id: firstChunkId,
            object: 'chat.completion',
            created: Date.now() / 1000,
            model: model || options.model,
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: fullContent,
                },
                finish_reason: 'stop',
              },
            ],
          }
          onComplete(finalResponseObj)
        }
        return true
      }
      return false
    }

    let done = false
    let buffer = ''

    while (!done) {
      // Vérifier si la requête a été annulée
      if (checkSignal()) break

      const {value, done: readerDone} = await reader.read()
      done = readerDone

      if (done) break

      const chunk = decoder.decode(value)
      buffer += chunk

      // Traitement des données du stream
      // Format: "data: {JSON}\n\ndata: {JSON}\n\ndata: [DONE]\n\n"
      const parts = buffer.split('\n\n')

      // Traiter toutes les parties complètes sauf la dernière (qui peut être incomplète)
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i].trim()

        // Vérifier à nouveau si la requête a été annulée
        if (checkSignal()) {
          done = true
          break
        }

        // Ignorer les lignes vides
        if (!part) continue

        // Vérifier si c'est la fin du stream
        if (part === 'data: [DONE]') {
          done = true
          break
        }

        // Extraire le JSON de "data: {JSON}"
        const jsonStr = part.replace(/^data: /, '')

        try {
          if (jsonStr) {
            const parsedChunk = JSON.parse(jsonStr)

            // Stocker l'ID du premier chunk et le modèle
            if (!firstChunkId) firstChunkId = parsedChunk.id
            if (!model) model = parsedChunk.model
            if (!created) created = parsedChunk.created

            // Extraire le contenu du delta
            const content = parsedChunk.choices[0]?.delta?.content || ''
            fullContent += content

            // Créer un objet chunk compatible avec notre interface
            const streamChunk: OpenAIStreamChunk = {
              ...parsedChunk,
              done: parsedChunk.choices[0]?.finish_reason !== null,
            }

            // Appeler le callback avec le fragment
            onChunk(streamChunk)

            // Si c'est le dernier fragment, appeler le callback de fin
            if (parsedChunk.choices[0]?.finish_reason && onComplete) {
              const finalResponseObj: OpenAIResponse = {
                id: firstChunkId,
                object: 'chat.completion',
                created: created,
                model: model,
                choices: [
                  {
                    index: 0,
                    message: {
                      role: 'assistant',
                      content: fullContent,
                    },
                    finish_reason: parsedChunk.choices[0].finish_reason,
                  },
                ],
              }
              onComplete(finalResponseObj)
            }
          }
        } catch (err) {
          console.error('Erreur lors du parsing du fragment:', err, jsonStr)
        }
      }

      // Garder la dernière partie potentiellement incomplète pour la prochaine itération
      buffer = parts[parts.length - 1]
    }

    // Traiter les données restantes dans le buffer
    if (buffer.trim() && !done) {
      const parts = buffer.trim().split('\n\n')
      for (const part of parts) {
        if (part.startsWith('data: ') && part !== 'data: [DONE]') {
          const jsonStr = part.replace(/^data: /, '')
          try {
            const parsedChunk = JSON.parse(jsonStr)
            const content = parsedChunk.choices[0]?.delta?.content || ''
            fullContent += content

            const streamChunk: OpenAIStreamChunk = {
              ...parsedChunk,
              done: parsedChunk.choices[0]?.finish_reason !== null,
            }
            onChunk(streamChunk)
          } catch (err) {
            console.error('Erreur lors du parsing du fragment final:', err)
          }
        }
      }
    }

    // Appeler onComplete si ce n'est pas déjà fait
    if (onComplete && !signal?.aborted) {
      const finalResponseObj: OpenAIResponse = {
        id: firstChunkId || 'unknown',
        object: 'chat.completion',
        created: created || Date.now() / 1000,
        model: model || options.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: fullContent,
            },
            finish_reason: 'stop',
          },
        ],
      }
      onComplete(finalResponseObj)
    }
  } catch (error) {
    // Ignorer l'erreur si elle est due à l'annulation
    if (signal?.aborted) {
      console.log("Streaming interrompu par l'utilisateur")
      if (onComplete) {
        const finalResponseObj: OpenAIResponse = {
          id: firstChunkId || 'unknown',
          object: 'chat.completion',
          created: created || Date.now() / 1000,
          model: model || options.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: fullContent,
              },
              finish_reason: 'stop',
            },
          ],
        }
        onComplete(finalResponseObj)
      }
      return
    }

    console.error('Erreur lors du streaming de la réponse:', error)
    if (onError && error instanceof Error) {
      onError(error)
    } else if (onError) {
      onError(new Error(String(error)))
    }
  }
}

/**
 * Récupère la liste des modèles disponibles sur OpenAI
 */
export async function getAvailableModels(): Promise<OpenAIModelList> {
  try {
    const response = await fetch(`${OPENAI_API_URL}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // throw new Error(
      //   `Erreur API OpenAI: ${response.status} ${response.statusText} - ${
      //     errorData.error?.message || ''
      //   }`
      // )
      console.warn(
        `Erreur API OpenAI: ${response.status} ${response.statusText} - ${
          errorData.error?.message || ''
        }`
      )
      return {data: [], object: 'list'}
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles:', error)
    throw error
  }
}
