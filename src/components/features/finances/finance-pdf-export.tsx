'use client'

import {Document, Page, pdf, StyleSheet, Text, View} from '@react-pdf/renderer'
import {Download} from 'lucide-react'
import {useCallback, useState} from 'react'
import {toast} from 'sonner'

import {Button} from '@/components/ui/button'
import type {
  ClientFinancialRow,
  FinanceSummary,
  MonthlyFinanceData,
} from '@/services/finance-service'

type ExpenseByCategoryRow = {
  category: string
  total: number
}

type Props = {
  summary: FinanceSummary | undefined
  chartData: MonthlyFinanceData[] | undefined
  clients: ClientFinancialRow[]
  expensesByCategory: ExpenseByCategoryRow[]
  userName: string
  companyName: string
  year: number
  from: Date
  to: Date
}

// ============================================================
// PDF Styles
// ============================================================

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1c1917',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#059669',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#292524',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: '23%',
    backgroundColor: '#fafaf9',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  kpiLabel: {
    fontSize: 7,
    color: '#78716c',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  kpiValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f4',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    padding: 6,
  },
  tableColName: {width: '25%'},
  tableColSurface: {width: '12%', textAlign: 'right'},
  tableColAmount: {width: '15%', textAlign: 'right'},
  tableColPayment: {width: '15%', textAlign: 'center'},
  tableColPaid: {width: '18%', textAlign: 'right'},
  tableColStatus: {width: '15%', textAlign: 'center'},
  thText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
    color: '#78716c',
  },
  tdText: {fontSize: 8},
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartLabel: {width: 50, fontSize: 7, color: '#78716c'},
  chartBarContainer: {flex: 1, height: 12, flexDirection: 'row', gap: 2},
  chartBarRevenue: {backgroundColor: '#059669', borderRadius: 2, height: 12},
  chartBarExpense: {backgroundColor: '#dc2626', borderRadius: 2, height: 12},
  chartValue: {width: 60, fontSize: 7, textAlign: 'right', color: '#44403c'},
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 7,
    color: '#a8a29e',
    textAlign: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
})

// ============================================================
// Helpers
// ============================================================

function formatEur(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatEurDecimal(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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

const PAYMENT_LABELS: Record<string, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  annual: 'Annuel',
}

// ============================================================
// PDF Document
// ============================================================

function FinancePdfDocument({
  summary,
  chartData,
  clients,
  expensesByCategory,
  userName,
  companyName,
  year,
}: Omit<Props, 'from' | 'to'>) {
  const maxChartValue = Math.max(
    ...(chartData ?? []).map((d) => Math.max(d.revenue, d.expenses)),
    1
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HarvestOS — Rapport Financier</Text>
          <Text style={styles.headerSubtitle}>
            {companyName ? `${companyName} — ` : ''}
            {userName} — Année {year} — Exporté le{' '}
            {new Intl.DateTimeFormat('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </Text>
        </View>

        {/* KPI Cards */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicateurs clés</Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>MRR</Text>
                <Text style={styles.kpiValue}>{formatEur(summary.mrr)}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>ARR</Text>
                <Text style={styles.kpiValue}>{formatEur(summary.arr)}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>CA encaissé</Text>
                <Text style={styles.kpiValue}>
                  {formatEurDecimal(summary.revenueYtd)}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Dépenses</Text>
                <Text style={styles.kpiValue}>
                  {formatEurDecimal(summary.expensesYtd)}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Marge nette</Text>
                <Text style={styles.kpiValue}>
                  {summary.netMarginPercent.toFixed(1)} %
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Clients actifs</Text>
                <Text style={styles.kpiValue}>{summary.activeClientCount}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>ARPC</Text>
                <Text style={styles.kpiValue}>{formatEur(summary.arpc)}</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Surface moy.</Text>
                <Text style={styles.kpiValue}>
                  {Math.round(summary.avgSurfaceM2)} m²
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Revenue Chart (simple bar representation) */}
        {chartData && chartData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Revenus vs Dépenses — {year}
            </Text>
            {chartData.map((d) => (
              <View key={d.month} style={styles.chartRow}>
                <Text style={styles.chartLabel}>
                  {d.monthLabel.slice(0, 3)}
                </Text>
                <View style={styles.chartBarContainer}>
                  <View
                    style={[
                      styles.chartBarRevenue,
                      {
                        width: `${(d.revenue / maxChartValue) * 100}%`,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBarExpense,
                      {
                        width: `${(d.expenses / maxChartValue) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>
                  {formatEur(d.revenue)} / {formatEur(d.expenses)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Client Table */}
        {clients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détail clients</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.tableColName}>
                  <Text style={styles.thText}>Client</Text>
                </View>
                <View style={styles.tableColSurface}>
                  <Text style={styles.thText}>Surface</Text>
                </View>
                <View style={styles.tableColAmount}>
                  <Text style={styles.thText}>Mensuel</Text>
                </View>
                <View style={styles.tableColPayment}>
                  <Text style={styles.thText}>Paiement</Text>
                </View>
                <View style={styles.tableColPaid}>
                  <Text style={styles.thText}>Encaissé</Text>
                </View>
                <View style={styles.tableColStatus}>
                  <Text style={styles.thText}>Statut</Text>
                </View>
              </View>
              {clients.map((c) => (
                <View key={c.id} style={styles.tableRow}>
                  <View style={styles.tableColName}>
                    <Text style={styles.tdText}>
                      {c.lastName} {c.firstName}
                    </Text>
                  </View>
                  <View style={styles.tableColSurface}>
                    <Text style={styles.tdText}>
                      {c.surfaceM2 ? `${c.surfaceM2} m²` : '—'}
                    </Text>
                  </View>
                  <View style={styles.tableColAmount}>
                    <Text style={styles.tdText}>
                      {c.monthlyAmount ? formatEur(c.monthlyAmount) : '—'}
                    </Text>
                  </View>
                  <View style={styles.tableColPayment}>
                    <Text style={styles.tdText}>
                      {c.paymentType
                        ? (PAYMENT_LABELS[c.paymentType] ?? c.paymentType)
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.tableColPaid}>
                    <Text style={styles.tdText}>
                      {formatEurDecimal(c.totalPaid)}
                    </Text>
                  </View>
                  <View style={styles.tableColStatus}>
                    <Text style={styles.tdText}>
                      {c.isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expense Breakdown */}
        {expensesByCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Répartition des dépenses</Text>
            <View style={styles.table}>
              {expensesByCategory.map((e) => (
                <View key={e.category} style={styles.expenseRow}>
                  <Text style={styles.tdText}>
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </Text>
                  <Text style={[styles.tdText, {fontFamily: 'Helvetica-Bold'}]}>
                    {formatEurDecimal(e.total)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          HarvestOS — Rapport généré automatiquement
        </Text>
      </Page>
    </Document>
  )
}

// ============================================================
// Export Button
// ============================================================

export function FinancePdfExportButton(props: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExport = useCallback(async () => {
    setIsGenerating(true)
    try {
      const blob = await pdf(<FinancePdfDocument {...props} />).toBlob()

      const now = new Date()
      const filename = `harvestosa_finances_${props.year}_${String(now.getMonth() + 1).padStart(2, '0')}.pdf`

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)

      toast.success('PDF exporté avec succès')
    } catch {
      toast.error('Erreur lors de la génération du PDF')
    } finally {
      setIsGenerating(false)
    }
  }, [props])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isGenerating || !props.summary}
    >
      <Download className="mr-1 h-4 w-4" />
      {isGenerating ? 'Génération...' : 'Export PDF'}
    </Button>
  )
}
