'use client'

import React, {useState, useRef, useEffect} from 'react'
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
  generateCompletionStream as generateOllamaStream,
  getAvailableModels as getOllamaModels,
  type OllamaModel,
  type OllamaStreamChunk,
} from '@/services/ollama-service'
import {
  generateCompletionStream as generateOpenAIStream,
  getAvailableModels as getOpenAIModels,
  type OpenAIModel,
  type OpenAIStreamChunk,
} from '@/services/openai-service'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// Importer différents thèmes pour la coloration syntaxique depuis prism
import {vscDarkPlus} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {dracula} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {atomDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {okaidia} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {nord} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {materialDark} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import {nightOwl} from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Objets de thèmes disponibles
const codeThemes = {
  vscDarkPlus,
  dracula,
  atomDark,
  okaidia,
  nord,
  materialDark,
  nightOwl,
}

// Type pour les thèmes
type CodeThemeName = keyof typeof codeThemes

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

// Fonction pour formatter le texte avec la coloration syntaxique du code
function formatMessage(content: string, theme: CodeThemeName) {
  // Chercher les blocs de code délimités par ```
  const codeBlockRegex = /```([\w-]+)?\n([\s\S]*?)```/g

  // Si aucun bloc de code n'est trouvé, renvoyer le contenu tel quel
  if (!content.match(codeBlockRegex)) {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  // Transformer le contenu en éléments React avec du code coloré
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Ajouter le texte avant le bloc de code
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.substring(lastIndex, match.index)}
        </span>
      )
    }

    // Déterminer le langage ou utiliser 'text' par défaut
    let language = match[1] || 'text'

    // Normaliser les noms de langages pour la compatibilité avec Prism
    if (language === 'js') language = 'javascript'
    if (language === 'ts') language = 'typescript'
    if (language === 'py') language = 'python'

    const code = match[2].trim()

    // Ajouter le bloc de code formaté
    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-4 overflow-hidden rounded-md"
      >
        <div className="bg-gray-800 px-4 py-1 text-xs text-gray-400">
          {language}
        </div>
        <SyntaxHighlighter
          language={language}
          style={codeThemes[theme]}
          customStyle={{margin: 0, borderRadius: '0 0 0.375rem 0.375rem'}}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    )

    lastIndex = match.index + match[0].length
  }

  // Ajouter le reste du texte après le dernier bloc de code
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {content.substring(lastIndex)}
      </span>
    )
  }

  return <div>{parts}</div>
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

// Type d'API
type ApiType = 'ollama' | 'openai'

export default function ChatPage() {
  // États locaux
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [openAIModels, setOpenAIModels] = useState<OpenAIModel[]>([])
  const [selectedModel, setSelectedModel] = useState('llama3')
  const [isStreamingMode, setIsStreamingMode] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [apiType, setApiType] = useState<ApiType>('ollama')
  const [context, setContext] = useState<number[] | undefined>()
  const [codeTheme, setCodeTheme] = useState<CodeThemeName>('vscDarkPlus')
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
        // Récupérer les modèles Ollama
        const ollamaModelList = await getOllamaModels()
        setOllamaModels(ollamaModelList.models)

        // Récupérer les modèles OpenAI
        try {
          const openAIModelList = await getOpenAIModels()
          setOpenAIModels(openAIModelList.data)
        } catch (error) {
          console.error(
            'Erreur lors de la récupération des modèles OpenAI:',
            error
          )
          // Si pas de clé API OpenAI, ne pas planter
        }

        // Définir le modèle par défaut
        if (apiType === 'ollama' && ollamaModelList.models.length > 0) {
          setSelectedModel(ollamaModelList.models[0].name)
        } else if (apiType === 'openai' && openAIModels.length > 0) {
          setSelectedModel('gpt-3.5-turbo')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error)
      }
    }

    fetchModels()
  }, [isClient, apiType])

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

  // Fonction pour changer l'API
  const handleApiChange = (newApi: ApiType) => {
    if (isLoading) return
    setApiType(newApi)
    setMessages([])
    setContext(undefined)
    // Réinitialiser le modèle sélectionné
    if (newApi === 'ollama' && ollamaModels.length > 0) {
      setSelectedModel(ollamaModels[0].name)
    } else if (newApi === 'openai' && openAIModels.length > 0) {
      setSelectedModel('gpt-3.5-turbo')
    } else if (newApi === 'openai') {
      setSelectedModel('gpt-3.5-turbo')
    }
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

        if (apiType === 'ollama') {
          await generateOllamaStream(
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
              console.error('Erreur de streaming Ollama:', error)
              setIsLoading(false)
              abortControllerRef.current = null
            },
            signal
          )
        } else {
          // OpenAI
          await generateOpenAIStream(
            {
              model: selectedModel,
              prompt: userPrompt,
              // Options supplémentaires pour OpenAI
              temperature: 0.7,
              max_tokens: 1000,
            },
            (chunk: OpenAIStreamChunk) => {
              // Extraire le contenu du delta pour OpenAI
              const content = chunk.choices[0]?.delta?.content || ''
              assistantResponse += content

              // Mettre à jour le message de l'assistant
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {...msg, content: assistantResponse}
                    : msg
                )
              )
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (finalResponse) => {
              // Traitement final quand tout est terminé
              setIsLoading(false)
              abortControllerRef.current = null
            },
            (error) => {
              console.error('Erreur de streaming OpenAI:', error)
              setIsLoading(false)
              abortControllerRef.current = null
            },
            signal
          )
        }
      } catch (error) {
        console.error(`Erreur lors de la communication avec ${apiType}:`, error)

        // Mettre à jour le message d'erreur
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Désolé, une erreur s'est produite lors de la communication avec le serveur ${apiType}.`,
                }
              : msg
          )
        )

        setIsLoading(false)
        abortControllerRef.current = null
      }
    } else {
      // Version non-streaming
      try {
        if (apiType === 'ollama') {
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
            content:
              data.response || "Désolé, je n'ai pas pu générer de réponse",
          }

          setMessages((prev) => [...prev, assistantMessage])

          // Enregistrer le contexte pour la prochaine requête
          if (data.context) {
            setContext(data.context)
          }
        } else {
          // OpenAI - version non-streaming
          const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: selectedModel,
                messages: [
                  {
                    role: 'user',
                    content: userPrompt,
                  },
                ],
                temperature: 0.7,
              }),
            }
          )

          const data = await response.json()

          // Ajouter le message de l'assistant
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content:
              data.choices[0]?.message?.content ||
              "Désolé, je n'ai pas pu générer de réponse",
          }

          setMessages((prev) => [...prev, assistantMessage])
        }
      } catch (error) {
        console.error(`Erreur lors de la communication avec ${apiType}:`, error)

        // Ajouter un message d'erreur
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `Désolé, une erreur s'est produite lors de la communication avec le serveur ${apiType}.`,
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
            <CardTitle>
              Chat avec {apiType === 'ollama' ? 'Ollama' : 'OpenAI'}
            </CardTitle>
            <div className="flex flex-wrap gap-2 space-x-2">
              <div className="flex space-x-2">
                <Button
                  variant={apiType === 'ollama' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApiChange('ollama')}
                  disabled={isLoading}
                >
                  Ollama
                </Button>
                <Button
                  variant={apiType === 'openai' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleApiChange('openai')}
                  disabled={isLoading}
                >
                  OpenAI
                </Button>
              </div>

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
                  {apiType === 'ollama' ? (
                    ollamaModels.length === 0 ? (
                      <SelectItem value="llama3">llama3</SelectItem>
                    ) : (
                      ollamaModels.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))
                    )
                  ) : // OpenAI models
                  openAIModels.length === 0 ? (
                    <>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    </>
                  ) : (
                    openAIModels
                      .filter((model) => model.id.includes('gpt'))
                      .map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>

              <Select
                value={codeTheme}
                onValueChange={(value: CodeThemeName) => setCodeTheme(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Thème de code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vscDarkPlus">VS Code Dark+</SelectItem>
                  <SelectItem value="dracula">Dracula</SelectItem>
                  <SelectItem value="atomDark">Atom Dark</SelectItem>
                  <SelectItem value="okaidia">Okaidia</SelectItem>
                  <SelectItem value="nord">Nord</SelectItem>
                  <SelectItem value="materialDark">Material Dark</SelectItem>
                  <SelectItem value="nightOwl">Night Owl</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
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
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p>Commencez à discuter avec l`&apos;IA...</p>
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
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      formatMessage(message.content, codeTheme)
                    )}
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
