import { type NextRequest, NextResponse } from "next/server"
import { query, sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Delete invoice items first (due to foreign key constraint)
    await query(sql`DELETE FROM invoice_items WHERE invoice_id = ${params.id}`)

    // Delete the invoice
    const invoice = await query(sql`
      DELETE FROM invoices WHERE id = ${params.id}
      RETURNING *
    `)

    if (!invoice[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Invoice deleted successfully" })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}
