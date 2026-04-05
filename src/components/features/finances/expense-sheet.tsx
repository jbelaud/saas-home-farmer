'use client'

import {Pencil, Plus, Trash2} from 'lucide-react'
import {useCallback, useMemo, useState} from 'react'
import {toast} from 'sonner'

import {
  useCreateExpense,
  useDeleteExpense,
  useUpdateExpense,
} from '@/components/hooks/client/use-finance-queries'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {Skeleton} from '@/components/ui/skeleton'
import type {ExpenseModel} from '@/db/models/farmer-model'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenses: ExpenseModel[]
  isLoading: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  seeds: 'Semences',
  seedlings: 'Plants',
  tools: 'Outils',
  transport: 'Transport',
  platform_fees: 'Frais plateforme',
  marketing: 'Marketing',
  other: 'Autre',
}

const CATEGORY_COLORS: Record<string, string> = {
  seeds: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  seedlings: 'bg-green-50 text-green-700 border-green-200',
  tools: 'bg-blue-50 text-blue-700 border-blue-200',
  transport: 'bg-amber-50 text-amber-700 border-amber-200',
  platform_fees: 'bg-purple-50 text-purple-700 border-purple-200',
  marketing: 'bg-pink-50 text-pink-700 border-pink-200',
  other: 'bg-stone-100 text-stone-600 border-stone-200',
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

type FormState = {
  date: string
  label: string
  amount: string
  category: string
}

const emptyForm: FormState = {
  date: new Date().toISOString().split('T')[0],
  label: '',
  amount: '',
  category: 'other',
}

export function ExpenseSheet({open, onOpenChange, expenses, isLoading}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const deleteMutation = useDeleteExpense()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const amount = Number.parseFloat(form.amount)
      if (!form.label || !form.date || Number.isNaN(amount) || amount <= 0) {
        toast.error('Veuillez remplir tous les champs correctement')
        return
      }

      try {
        if (editingId) {
          await updateMutation.mutateAsync({
            id: editingId,
            date: form.date,
            label: form.label,
            amount,
            category: form.category,
          })
          toast.success('Dépense mise à jour')
        } else {
          await createMutation.mutateAsync({
            date: form.date,
            label: form.label,
            amount,
            category: form.category,
          })
          toast.success('Dépense ajoutée')
        }
        setForm(emptyForm)
        setEditingId(null)
      } catch {
        toast.error('Erreur lors de la sauvegarde')
      }
    },
    [form, editingId, createMutation, updateMutation]
  )

  const handleEdit = useCallback((expense: ExpenseModel) => {
    const d =
      typeof expense.date === 'string'
        ? expense.date
        : expense.date.toISOString()
    setEditingId(expense.id)
    setForm({
      date: d.split('T')[0],
      label: expense.label,
      amount: String(expense.amount),
      category: expense.category,
    })
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success('Dépense supprimée')
        if (editingId === id) {
          setEditingId(null)
          setForm(emptyForm)
        }
      } catch {
        toast.error('Erreur lors de la suppression')
      }
    },
    [deleteMutation, editingId]
  )

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setForm(emptyForm)
  }, [])

  // Group expenses by category with subtotals
  const grouped = useMemo(() => {
    const map = new Map<string, {expenses: ExpenseModel[]; total: number}>()
    for (const exp of expenses) {
      const cat = exp.category
      const existing = map.get(cat)
      if (existing) {
        existing.expenses.push(exp)
        existing.total += exp.amount
      } else {
        map.set(cat, {expenses: [exp], total: exp.amount})
      }
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [expenses])

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Gestion des dépenses</SheetTitle>
          <SheetDescription>
            Ajoutez, modifiez ou supprimez vos dépenses professionnelles.
          </SheetDescription>
        </SheetHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expense-amount">Montant (€)</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
                className="h-12"
                placeholder="42.50"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expense-label">Libellé</Label>
            <Input
              id="expense-label"
              value={form.label}
              onChange={(e) => setForm({...form, label: e.target.value})}
              className="h-12"
              placeholder="Ex : Terreau bio 40L"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expense-category">Catégorie</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({...form, category: v})}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="h-12 flex-1" disabled={isPending}>
              {isPending ? (
                'Enregistrement...'
              ) : editingId ? (
                'Mettre à jour'
              ) : (
                <>
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter
                </>
              )}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                className="h-12"
                onClick={handleCancel}
              >
                Annuler
              </Button>
            )}
          </div>
        </form>

        {/* Expense list grouped by category */}
        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({length: 4}).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              Aucune dépense enregistrée pour cette période.
            </p>
          ) : (
            grouped.map(([category, {expenses: catExpenses, total}]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={CATEGORY_COLORS[category] ?? ''}
                  >
                    {CATEGORY_LABELS[category] ?? category}
                  </Badge>
                  <span className="text-sm font-bold text-stone-700">
                    {formatEur(total)}
                  </span>
                </div>
                <div className="space-y-1">
                  {catExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                        editingId === exp.id
                          ? 'bg-primary/5 ring-primary ring-1'
                          : 'bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-800">
                          {exp.label}
                        </p>
                        <p className="text-xs text-stone-500">
                          {formatDate(exp.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-700">
                          {formatEur(exp.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(exp)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-stone-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(exp.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
