'use client'

import {useState, useRef, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {Avatar} from '@/components/ui/avatar'
import {Separator} from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  generateCompletionStream,
  getAvailableModels,
  type OllamaModel,
  type OllamaStreamChunk,
} from '@/services/ollama-service'

// Icône pour le bouton Stop
const StopIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  </svg>
)

// Icône pour le bouton Effacer la conversation
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
)

// Icône pour le bouton Nouvelle conversation
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  // États locaux
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState('llama3')
  const [isStreamingMode, setIsStreamingMode] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [context, setContext] = useState<number[] | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // S'assurer que le rendu se fait uniquement côté client pour éviter les erreurs d'hydratation
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Récupérer les modèles disponibles au chargement
  useEffect(() => {
    if (!isClient) return

    async function fetchModels() {
      try {
        const modelList = await getAvailableModels()
        setAvailableModels(modelList.models)
        if (modelList.models.length > 0) {
          setSelectedModel(modelList.models[0].name)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error)
      }
    }

    fetchModels()
  }, [isClient])

  // Nettoyer l'AbortController au démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  useEffect(() => {
    if (isClient) {
      scrollToBottom()
    }
  }, [messages, isClient])

  // Fonction pour interrompre la génération
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  // Fonction pour créer une nouvelle conversation
  const handleNewConversation = () => {
    if (isLoading) return
    setMessages([])
    setContext(undefined)
  }

  // Fonction pour effacer les messages de la conversation actuelle
  const handleClearConversation = () => {
    if (isLoading) return
    setMessages([])
    setContext(undefined)
  }

  // Générateur d'ID simple et sûr
  const generateId = () => {
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim() === '' || isLoading) return

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])

    const userPrompt = input
    setInput('')
    setIsLoading(true)

    // Si en mode streaming, ajouter un message vide pour l'assistant
    let assistantMessageId = ''
    if (isStreamingMode) {
      assistantMessageId = generateId()
      const emptyAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, emptyAssistantMessage])
    }

    // Utiliser le streaming si activé
    if (isStreamingMode) {
      try {
        let assistantResponse = ''

        // Créer un nouveau AbortController pour cette requête
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        await generateCompletionStream(
          {
            model: selectedModel,
            prompt: userPrompt,
            context, // Utiliser le contexte de la conversation
          },
          (chunk: OllamaStreamChunk) => {
            // Mettre à jour la réponse en cours avec le nouveau fragment
            assistantResponse += chunk.response

            // Mettre à jour le message de l'assistant
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {...msg, content: assistantResponse}
                  : msg
              )
            )
          },
          (finalResponse) => {
            // Traitement final quand tout est terminé
            setIsLoading(false)
            abortControllerRef.current = null

            // Enregistrer le contexte pour la prochaine requête
            if (finalResponse.context) {
              setContext(finalResponse.context)
            }
          },
          (error) => {
            console.error('Erreur de streaming:', error)
            setIsLoading(false)
            abortControllerRef.current = null
          },
          signal
        )
      } catch (error) {
        console.error('Erreur lors de la communication avec Ollama:', error)

        // Mettre à jour le message d'erreur
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    "Désolé, une erreur s'est produite lors de la communication avec le serveur Ollama.",
                }
              : msg
          )
        )

        setIsLoading(false)
        abortControllerRef.current = null
      }
    } else {
      // Version non-streaming (originale)
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: userPrompt,
            stream: false,
            context, // Utiliser le contexte
          }),
        })

        const data = await response.json()

        // Ajouter le message de l'assistant
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.response || "Désolé, je n'ai pas pu générer de réponse",
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Enregistrer le contexte pour la prochaine requête
        if (data.context) {
          setContext(data.context)
        }
      } catch (error) {
        console.error('Erreur lors de la communication avec Ollama:', error)

        // Ajouter un message d'erreur
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content:
            "Désolé, une erreur s'est produite lors de la communication avec le serveur Ollama.",
        }

        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Ne rien afficher pendant l'hydratation pour éviter les erreurs
  if (!isClient) {
    return <div className="h-screen w-full"></div>
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card className="flex h-[80vh] flex-col">
        <CardHeader className="pb-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Chat avec Ollama</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                disabled={isLoading}
                className="flex items-center gap-1"
                title="Nouvelle conversation"
              >
                <PlusIcon />
                Nouvelle
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearConversation}
                disabled={isLoading || messages.length === 0}
                className="flex items-center gap-1"
                title="Effacer cette conversation"
              >
                <TrashIcon />
                Effacer
              </Button>

              <Select
                value={selectedModel}
                onValueChange={(value) => {
                  // Changer le modèle
                  if (!isLoading) {
                    setSelectedModel(value)
                    // Optionnel: effacer la conversation lors du changement de modèle
                    setMessages([])
                    setContext(undefined)
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length === 0 ? (
                    <SelectItem value="llama3">llama3</SelectItem>
                  ) : (
                    availableModels.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant={isStreamingMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsStreamingMode(true)}
                disabled={isLoading}
              >
                Streaming
              </Button>

              <Button
                variant={isStreamingMode ? 'outline' : 'default'}
                size="sm"
                onClick={() => setIsStreamingMode(false)}
                disabled={isLoading}
              >
                Standard
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p>Commencez à discuter avec l'IA...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar
                    className={
                      message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }
                  >
                    <span className="font-bold text-white">
                      {message.role === 'user' ? 'U' : 'A'}
                    </span>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {message.role === 'user' ? 'Vous' : 'Assistant'}
                    </span>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="pt-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message ici..."
              disabled={isLoading}
              className="flex-grow"
            />
            {isLoading && isStreamingMode ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleStopGeneration}
                className="flex items-center gap-1"
              >
                <StopIcon />
                Arrêter
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || input.trim() === ''}>
                {isLoading ? 'Envoi...' : 'Envoyer'}
              </Button>
            )}
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
