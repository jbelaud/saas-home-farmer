'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {Plus} from 'lucide-react'
import {useState} from 'react'
import {useForm} from 'react-hook-form'

import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Switch} from '@/components/ui/switch'
import {Textarea} from '@/components/ui/textarea'
import {CreatePlan} from '@/services/types/domain/subscription-types'

import {CreatePlanFormData, createPlanSchema} from './plan-form-validation'

interface Props {
  onSave: (data: CreatePlan) => Promise<void>
}

export function CreatePlanDialog({onSave}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreatePlanFormData>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      code: '',
      planName: '',
      priceId: '',
      description: '',
      price: '',
      yearlyPrice: '',
      annualDiscountPriceId: '',
      currency: 'EUR',
      isRecurring: true,
      displayOrder: 0,
    },
  })

  const handleSubmit = async (data: CreatePlanFormData) => {
    setIsLoading(true)
    try {
      await onSave({
        ...data,
        displayOrder: data.displayOrder || 0,
      })
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau plan</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau plan d&apos;abonnement au système.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="free, pro, enterprise..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Identifiant unique du plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="planName"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Nom du plan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Gratuit, Pro, Entreprise..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Nom affiché du plan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priceId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Price ID Stripe</FormLabel>
                  <FormControl>
                    <Input placeholder="price_1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifiant du prix dans Stripe
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du plan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Prix mensuel</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="9.99"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearlyPrice"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Prix annuel</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="99.99"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="annualDiscountPriceId"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Price ID Stripe annuel</FormLabel>
                  <FormControl>
                    <Input placeholder="price_1234567890_annual" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifiant du prix annuel dans Stripe (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Devise</FormLabel>
                    <FormControl>
                      <Input placeholder="EUR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayOrder"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Ordre d&apos;affichage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRecurring"
              render={({field}) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Abonnement récurrent
                    </FormLabel>
                    <FormDescription>
                      Ce plan est-il un abonnement récurrent&nbsp;?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Création...' : 'Créer le plan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
