import {and, desc, eq, sql} from 'drizzle-orm'

import db from '@/db/models/db'
import {
  AddInvoiceModel,
  InvoiceModel,
  invoices,
  InvoiceStatusEnumModel,
  InvoiceTypeEnumModel,
  UpdateInvoiceModel,
} from '@/db/models/farmer-model'
import {PaginatedResponse, Pagination} from '@/services/types/common-type'

// ============================================================
// CRUD : invoice
// ============================================================

export const createInvoiceDao = async (
  invoice: AddInvoiceModel
): Promise<InvoiceModel> => {
  const rows = await db.insert(invoices).values(invoice).returning()
  return rows[0]
}

export const getInvoiceByIdDao = async (
  id: string
): Promise<InvoiceModel | undefined> => {
  return db.query.invoices.findFirst({
    where: (inv, {eq}) => eq(inv.id, id),
    with: {
      gardenClient: true,
    },
  })
}

export const getInvoiceByIdAndOrganizationDao = async (
  id: string,
  organizationId: string
): Promise<InvoiceModel | undefined> => {
  return db.query.invoices.findFirst({
    where: (inv, {eq, and}) =>
      and(eq(inv.id, id), eq(inv.organizationId, organizationId)),
    with: {
      gardenClient: true,
    },
  })
}

export const getInvoiceByNumberDao = async (
  invoiceNumber: string,
  organizationId: string
): Promise<InvoiceModel | undefined> => {
  return db.query.invoices.findFirst({
    where: (inv, {eq, and}) =>
      and(
        eq(inv.invoiceNumber, invoiceNumber),
        eq(inv.organizationId, organizationId)
      ),
  })
}

export const updateInvoiceDao = async (
  invoice: UpdateInvoiceModel
): Promise<void> => {
  if (!invoice.id) {
    throw new Error('Invoice ID is required')
  }
  await db
    .update(invoices)
    .set({...invoice, updatedAt: new Date()})
    .where(eq(invoices.id, invoice.id))
}

export const updateInvoiceStatusDao = async (
  id: string,
  status: InvoiceStatusEnumModel
): Promise<void> => {
  await db
    .update(invoices)
    .set({status, updatedAt: new Date()})
    .where(eq(invoices.id, id))
}

export const updateInvoicePdfUrlDao = async (
  id: string,
  pdfUrl: string
): Promise<void> => {
  await db
    .update(invoices)
    .set({pdfUrl, updatedAt: new Date()})
    .where(eq(invoices.id, id))
}

export const deleteInvoiceDao = async (id: string): Promise<void> => {
  await db.delete(invoices).where(eq(invoices.id, id))
}

// ============================================================
// REQUÊTES SPÉCIALISÉES : invoice
// ============================================================

export const getInvoicesByOrganizationDao = async (
  organizationId: string,
  pagination: Pagination,
  type?: InvoiceTypeEnumModel,
  status?: InvoiceStatusEnumModel
): Promise<PaginatedResponse<InvoiceModel>> => {
  const conditions = [eq(invoices.organizationId, organizationId)]
  if (type) conditions.push(eq(invoices.type, type))
  if (status) conditions.push(eq(invoices.status, status))

  const whereClause = and(...conditions)

  const [rows, [{count}]] = await Promise.all([
    db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.issueDate))
      .limit(pagination.limit)
      .offset(pagination.offset),
    db
      .select({count: sql<number>`count(*)`})
      .from(invoices)
      .where(whereClause),
  ])

  const page = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(count / pagination.limit)

  return {
    data: rows.length === 0 ? [] : rows,
    pagination: {total: count, page, limit: pagination.limit, totalPages},
  }
}

export const getInvoicesByGardenClientDao = async (
  gardenClientId: string,
  organizationId: string
): Promise<InvoiceModel[]> => {
  return db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.gardenClientId, gardenClientId),
        eq(invoices.organizationId, organizationId)
      )
    )
    .orderBy(desc(invoices.issueDate))
}

export const getNextInvoiceNumberDao = async (
  organizationId: string,
  prefix: string = 'FA'
): Promise<string> => {
  const year = new Date().getFullYear()
  const [{count}] = await db
    .select({count: sql<number>`count(*)`})
    .from(invoices)
    .where(
      and(
        eq(invoices.organizationId, organizationId),
        sql`EXTRACT(YEAR FROM ${invoices.issueDate}) = ${year}`,
        eq(invoices.type, 'invoice')
      )
    )
  const nextNumber = (Number(count) + 1).toString().padStart(3, '0')
  return `${prefix}-${year}-${nextNumber}`
}
